# SAFARI · Wildlife Intelligence + Storytelling — Phase 1

Narrative Synthesis first. Predictive Movement Modeling is **Phase 2** (scaffolded only — schema reserved, no UI).

## Goal

Turn the static `sightings` feed into a personalized, AI-narrated experience:

1. Tourists keep a **Digital Safari Journal** (sighting + note + optional photo).
2. AI auto-drafts a **daily narrative snippet** per journal entry.
3. The Wildlife Story Feed surfaces a **"Did you know?"** contextual snippet for the selected sighting.
4. After a trip, a **Top 5 Intelligence Moments** summary is generated, scored by a simple rarity index.

All real: Supabase tables, RLS, Lovable AI via `createServerFn` (no edge functions).

---

## Scope

### In

- New tables: `wis_journal_entries`, `wis_narratives`, `wis_species_rarity` (seed data), `wis_trip_summaries`
- New server functions in `src/lib/wis.functions.ts` + AI helper in `src/lib/wis-ai.server.ts`
- New route `/_authenticated/journal` — list + create journal entries, view AI snippets
- Wildlife feed (`/wildlife`): inline **"Did you know?"** panel for selected sighting (AI, cached per species+behavior)
- Post-trip summary card on `/profile` calling `generateTripSummary(bookingId)`

### Out (Phase 2 — not built now)

- Predictive probability map / heatmap
- Ethological auto-classification of all sightings (reserved column only)
- Edge-compute telemetry ingestion
- Share/export of narratives

---

## Data model

```text
wis_journal_entries
  id, user_id, booking_id (nullable, → pay_bookings),
  species, park, observed_at, note (≤500), photo_url (nullable),
  behavior_tag (nullable, free text for now),
  created_at, updated_at

wis_narratives                          -- one per journal entry; also reused for "Did you know?"
  id, user_id (nullable for shared species facts),
  scope ('journal' | 'species_fact' | 'trip_summary'),
  ref_id (journal_entry_id | sighting species key | booking_id),
  model, prompt_hash, body (text), tokens_in, tokens_out,
  created_at
  UNIQUE (scope, ref_id, prompt_hash)   -- cache key

wis_species_rarity                       -- seeded, read-only to clients
  species PK, rarity_score (1-10), region, notes

wis_trip_summaries
  id, user_id, booking_id, top_moments jsonb, narrative text, created_at
```

RLS: journal + trip_summaries scoped to `auth.uid()`. `wis_species_rarity` public read. `wis_narratives` readable by owner OR when `scope='species_fact'` (shared cache).

GRANTs in same migration per house rules.

---

## Server functions (`src/lib/wis.functions.ts`)

All use `requireSupabaseAuth` except `getSpeciesFact` (public).

- `createJournalEntry({ species, park, observedAt, note, photoUrl?, bookingId? })` → inserts row, fires-and-awaits `generateJournalNarrative` then returns `{ entry, narrative }`.
- `listMyJournal({ bookingId? })` → entries + narratives joined.
- `getSpeciesFact({ species, behavior? })` → checks `wis_narratives` cache by `prompt_hash`; if miss, calls Lovable AI, inserts, returns body. **Used by `/wildlife` "Did you know?" panel.**
- `generateTripSummary({ bookingId })` → loads user's journal for booking + species rarity, calls AI for Top 5 + narrative, upserts `wis_trip_summaries`.

AI helper `src/lib/wis-ai.server.ts`:

- Uses `createLovableAiGatewayProvider` (gateway pattern from knowledge).
- Model: `google/gemini-3-flash-preview`.
- `generateText` for snippets (short, 80–140 words).
- `generateText` + `Output.object` with small Zod schema for trip summary (`{ top: [{title, why, rarityScore}], narrative }`).
- Reads `process.env.LOVABLE_API_KEY` inside handler only.

---

## UI

- **`src/routes/_authenticated/journal.tsx`** — new. List view + "Add entry" form. Each card shows entry meta + AI narrative (Cormorant heading, DM Sans body, gold accent rule). Empty state with Swahili: _"Andika safari yako"_.
- **`src/routes/wildlife.tsx`** — add right-aside "Did you know?" card under the JSON panel: calls `getSpeciesFact` on `selected` change with React Query; loading shimmer, error toast on 429/402.
- **`src/routes/profile.tsx`** — add "Trip Reflections" section listing bookings with a "Generate summary" button → calls `generateTripSummary`, then renders Top 5 + narrative.
- **`src/components/safari/Shell.tsx`** — add "Journal" nav link for `user` role.

Styling stays inside existing tokens (obsidian/amber/cream, glass cards, Maasai divider between snippets).

---

## Error handling

Surface gateway 429 ("AI is busy — try again in a moment") and 402 ("AI credits exhausted — see workspace billing") as sonner toasts. Journal entry still saves even if narrative generation fails; narrative can be retried with a "Regenerate" button.

---

## Files

**Create**

- `supabase/migrations/<ts>_wis_phase1.sql` (4 tables + GRANTs + RLS + rarity seed)
- `src/lib/wis.functions.ts`
- `src/lib/wis-ai.server.ts`
- `src/lib/ai-gateway.server.ts` (if not already present — gateway helper from knowledge)
- `src/routes/_authenticated/journal.tsx`

**Edit**

- `src/routes/wildlife.tsx` (Did you know? aside)
- `src/routes/profile.tsx` (Trip Reflections section)
- `src/components/safari/Shell.tsx` (nav link)

No changes to: auth, payments RPCs, operator portal, support portal, RoleGuard, existing `safari-data.ts`.

---

## Phase 2 (deferred, for reference only)

Predictive Movement Modeling will add `wis_observation_signals` (env vars + telemetry), `wis_probability_cells` (h3-style grid + score), a nightly `pg_cron` job that recomputes scores, and an overlay on `/wildlife`. Not built in this plan.
