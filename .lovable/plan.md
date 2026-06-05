## Goal

Eliminate the race conditions in the current SAFARI checkout. Today `pay.checkout.$tripId.tsx` runs ~6 separate Supabase calls from the browser (insert booking → charge → insert tx → update wallet → insert escrow → update booking). Two rapid clicks (double-tap, retry, two tabs) or a network hiccup can produce: duplicate bookings, double wallet debits, orphan escrows, or a `confirmed` booking with no escrow.

We port the "Lock → Check → Execute → Release" pattern from the original patch, but adapted to this stack — there is no Redis or worker. Postgres is the single source of truth; locks are **Postgres advisory locks** + **SELECT … FOR UPDATE**, all inside one SECURITY DEFINER RPC that runs atomically in a transaction.

## What changes

### 1. Schema additions (one migration)

- `pay_bookings`: add `capacity_slot_id uuid NULL` (reserved for per-date inventory later — nullable now, indexed).
- `pay_trips`: add `capacity int NOT NULL DEFAULT 999`, `booked int NOT NULL DEFAULT 0`. This gives us a real "is the trip full?" check the lock can guard.
- `pay_transactions`: add `idempotency_key text NULL` and a partial unique index `(user_id, idempotency_key) WHERE idempotency_key IS NOT NULL`. This is the equivalent of the patch's "external lock key" — a client-supplied UUID that makes the whole checkout safe to retry.
- New enum value already exists for booking status; no change.

### 2. New RPC: `public.pay_checkout(...)` (SECURITY DEFINER)

Signature:
```
pay_checkout(
  p_trip_id uuid,
  p_guests int,
  p_provider pay_provider,   -- 'mpesa' | 'stripe' | 'wallet'
  p_idempotency_key text,
  p_provider_ref text,       -- mock charge ref from client; real gateway ref later
  p_display_currency text,
  p_display_amount numeric
) returns pay_bookings
```

Body, in order — this is the atomic Lock-Check-Execute:

1. **Auth check** — `auth.uid()` must equal the wallet owner; raise otherwise.
2. **Idempotency short-circuit** — `SELECT booking_id FROM pay_transactions WHERE user_id=auth.uid() AND idempotency_key=p_idempotency_key`. If found, return that booking and exit. This is what kills the "two rapid clicks" class of bug.
3. **Acquire trip-level advisory lock** — `PERFORM pg_advisory_xact_lock(hashtext('trip:'||p_trip_id::text))`. Auto-released at commit/rollback. Serializes all checkouts for that trip across the whole cluster — no Redis needed.
4. **Lock the rows** — `SELECT … FROM pay_trips WHERE id=p_trip_id FOR UPDATE` and `SELECT … FROM pay_wallets WHERE user_id=auth.uid() FOR UPDATE`.
5. **Validate**:
   - trip exists, status active, `booked + p_guests <= capacity`.
   - guests in 1..12.
   - for `wallet` provider: `flex_balance >= total`.
6. **Execute** — all in the same transaction:
   - INSERT `pay_bookings` (status='confirmed', total derived server-side from `base_price * guests`).
   - UPDATE `pay_trips SET booked = booked + p_guests`.
   - INSERT `pay_transactions` with `idempotency_key`, `provider_ref`, `status='success'`.
   - UPDATE `pay_wallets` (flex→trip move for wallet provider; trip_balance += total otherwise).
   - INSERT `pay_escrows` (status='held').
7. RETURN the booking row.

If anything raises, the transaction rolls back — no orphan rows, advisory lock auto-released.

GRANT EXECUTE to `authenticated`. No GRANT to `anon`.

### 3. Cancel/refund RPC: `public.pay_cancel_booking(p_booking_id uuid)`

Same pattern (advisory lock on trip, FOR UPDATE on booking + wallet + escrow), so cancel can't race with another checkout on the same trip and can't double-refund. Replaces the multi-step cancel in `pay.bookings.tsx`.

### 4. Client refactor

- `src/lib/pay.ts`: add `generateIdempotencyKey()` (crypto.randomUUID) and a `checkout()` helper that calls `supabase.rpc('pay_checkout', {...})`.
- `src/routes/pay.checkout.$tripId.tsx`:
  - Generate one idempotency key per checkout session (useState, regenerated on success).
  - Replace the 6-call sequence with a single `pay_checkout` RPC call.
  - Keep the existing `mockCharge()` to obtain `provider_ref` before the RPC (so the RPC stays payment-gateway-agnostic).
  - Disable the submit button while in flight (already done) — but now retries are safe because the RPC is idempotent.
- `src/routes/pay.bookings.tsx`: cancel button calls `pay_cancel_booking` RPC.

### 5. Observability (lightweight, no Prometheus)

- Add `pay_lock_events` table: `(id, event text, trip_id, user_id, created_at)` for `lock_wait`, `lock_contention`, `idempotent_replay`. The RPC logs `idempotent_replay` and (optionally) wraps the advisory lock in `pg_try_advisory_xact_lock` first; if it fails it logs `lock_contention`, then falls back to the blocking variant. Surface counts in `/operator/analytics` later — out of scope this round.

## Technical details (race coverage)

| Race | Defense |
|---|---|
| Double-click submit | `idempotency_key` partial-unique index → second call returns existing booking |
| Two tabs, same trip | advisory lock serializes; second tab sees `booked` already incremented |
| Concurrent cancel + checkout | both take the same trip advisory lock |
| Wallet drain across two trips | wallet row is `FOR UPDATE` inside each RPC |
| Partial failure mid-flow | single transaction, rolls back atomically |
| Gateway succeeds but RPC fails | `provider_ref` stored on retry under same idempotency key; no second charge attempted because client checks RPC result before re-charging |

## Out of scope this round

- Real M-Pesa / Stripe webhooks (still stubbed via `mockCharge`).
- Per-date inventory slots (`capacity_slot_id` added but unused).
- Worker / cron-based escrow auto-release.
- Prometheus / external telemetry.

## File touch list

- `supabase/migrations/<new>.sql` — schema + two RPCs + grants.
- `src/lib/pay.ts` — add `checkout`, `cancelBooking`, `generateIdempotencyKey`.
- `src/routes/pay.checkout.$tripId.tsx` — swap inline flow for RPC call.
- `src/routes/pay.bookings.tsx` — swap cancel flow for RPC call.

No changes to auth, navigation, Shell, wallet UI, or Simba points.
