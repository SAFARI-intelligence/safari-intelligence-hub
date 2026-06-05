
-- Schema additions
ALTER TABLE public.pay_trips
  ADD COLUMN IF NOT EXISTS capacity int NOT NULL DEFAULT 999,
  ADD COLUMN IF NOT EXISTS booked int NOT NULL DEFAULT 0;

ALTER TABLE public.pay_bookings
  ADD COLUMN IF NOT EXISTS capacity_slot_id uuid NULL;
CREATE INDEX IF NOT EXISTS pay_bookings_capacity_slot_idx
  ON public.pay_bookings(capacity_slot_id) WHERE capacity_slot_id IS NOT NULL;

ALTER TABLE public.pay_transactions
  ADD COLUMN IF NOT EXISTS idempotency_key text NULL;
CREATE UNIQUE INDEX IF NOT EXISTS pay_transactions_idem_uidx
  ON public.pay_transactions(user_id, idempotency_key)
  WHERE idempotency_key IS NOT NULL;

-- Lock-event log (observability)
CREATE TABLE IF NOT EXISTS public.pay_lock_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event text NOT NULL,
  trip_id uuid NULL,
  user_id uuid NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.pay_lock_events TO authenticated;
GRANT ALL ON public.pay_lock_events TO service_role;
ALTER TABLE public.pay_lock_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lock events readable by support"
  ON public.pay_lock_events FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'support'::app_role));

-- ============================================================
-- Atomic checkout RPC
-- ============================================================
CREATE OR REPLACE FUNCTION public.pay_checkout(
  p_trip_id uuid,
  p_guests int,
  p_provider pay_provider,
  p_idempotency_key text,
  p_provider_ref text,
  p_display_currency text DEFAULT NULL,
  p_display_amount numeric DEFAULT NULL
) RETURNS public.pay_bookings
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _trip public.pay_trips;
  _wallet public.pay_wallets;
  _existing_booking_id uuid;
  _booking public.pay_bookings;
  _total numeric;
  _lock_key bigint;
  _got_lock boolean;
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated' USING ERRCODE = '42501';
  END IF;
  IF p_guests IS NULL OR p_guests < 1 OR p_guests > 12 THEN
    RAISE EXCEPTION 'Invalid guest count';
  END IF;
  IF p_idempotency_key IS NULL OR length(p_idempotency_key) < 8 THEN
    RAISE EXCEPTION 'Missing idempotency key';
  END IF;

  -- Idempotency short-circuit
  SELECT booking_id INTO _existing_booking_id
  FROM public.pay_transactions
  WHERE user_id = _uid AND idempotency_key = p_idempotency_key
  LIMIT 1;
  IF _existing_booking_id IS NOT NULL THEN
    INSERT INTO public.pay_lock_events(event, trip_id, user_id)
      VALUES ('idempotent_replay', p_trip_id, _uid);
    SELECT * INTO _booking FROM public.pay_bookings WHERE id = _existing_booking_id;
    RETURN _booking;
  END IF;

  -- Try non-blocking lock first for contention metric
  _lock_key := hashtext('trip:' || p_trip_id::text);
  _got_lock := pg_try_advisory_xact_lock(_lock_key);
  IF NOT _got_lock THEN
    INSERT INTO public.pay_lock_events(event, trip_id, user_id)
      VALUES ('lock_contention', p_trip_id, _uid);
    PERFORM pg_advisory_xact_lock(_lock_key);
  END IF;

  -- Lock rows
  SELECT * INTO _trip FROM public.pay_trips WHERE id = p_trip_id FOR UPDATE;
  IF _trip.id IS NULL THEN
    RAISE EXCEPTION 'Trip not found';
  END IF;
  IF _trip.status <> 'active' THEN
    RAISE EXCEPTION 'Trip not available';
  END IF;
  IF _trip.booked + p_guests > _trip.capacity THEN
    RAISE EXCEPTION 'Trip is full';
  END IF;

  SELECT * INTO _wallet FROM public.pay_wallets WHERE user_id = _uid FOR UPDATE;
  IF _wallet.id IS NULL THEN
    INSERT INTO public.pay_wallets(user_id) VALUES (_uid)
      RETURNING * INTO _wallet;
  END IF;

  _total := _trip.base_price * p_guests;

  IF p_provider = 'wallet' AND _wallet.flex_balance < _total THEN
    RAISE EXCEPTION 'Insufficient Flex balance';
  END IF;

  -- Booking
  INSERT INTO public.pay_bookings(user_id, trip_id, guests, total_amount, currency, status)
    VALUES (_uid, _trip.id, p_guests, _total, _trip.currency, 'confirmed')
    RETURNING * INTO _booking;

  -- Capacity
  UPDATE public.pay_trips SET booked = booked + p_guests WHERE id = _trip.id;

  -- Transaction
  INSERT INTO public.pay_transactions(
    wallet_id, user_id, booking_id, amount, currency,
    type, provider, provider_ref, status, idempotency_key, metadata
  ) VALUES (
    _wallet.id, _uid, _booking.id, _total, _trip.currency,
    'payment', p_provider, p_provider_ref, 'success', p_idempotency_key,
    jsonb_build_object(
      'display_currency', p_display_currency,
      'display_amount', p_display_amount
    )
  );

  -- Wallet moves
  IF p_provider = 'wallet' THEN
    UPDATE public.pay_wallets
      SET flex_balance = flex_balance - _total,
          trip_balance = trip_balance + _total
      WHERE id = _wallet.id;
  ELSE
    UPDATE public.pay_wallets
      SET trip_balance = trip_balance + _total
      WHERE id = _wallet.id;
  END IF;

  -- Escrow
  INSERT INTO public.pay_escrows(booking_id, amount, currency, status)
    VALUES (_booking.id, _total, _trip.currency, 'held');

  RETURN _booking;
END;
$$;

REVOKE ALL ON FUNCTION public.pay_checkout(uuid,int,pay_provider,text,text,text,numeric) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.pay_checkout(uuid,int,pay_provider,text,text,text,numeric) TO authenticated;

-- ============================================================
-- Atomic cancel/refund RPC
-- ============================================================
CREATE OR REPLACE FUNCTION public.pay_cancel_booking(p_booking_id uuid)
RETURNS public.pay_bookings
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _booking public.pay_bookings;
  _wallet public.pay_wallets;
  _lock_key bigint;
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated' USING ERRCODE = '42501';
  END IF;

  SELECT * INTO _booking FROM public.pay_bookings WHERE id = p_booking_id FOR UPDATE;
  IF _booking.id IS NULL THEN
    RAISE EXCEPTION 'Booking not found';
  END IF;
  IF _booking.user_id <> _uid THEN
    RAISE EXCEPTION 'Not allowed' USING ERRCODE = '42501';
  END IF;
  IF _booking.status <> 'confirmed' THEN
    RAISE EXCEPTION 'Booking is not cancellable';
  END IF;

  _lock_key := hashtext('trip:' || _booking.trip_id::text);
  PERFORM pg_advisory_xact_lock(_lock_key);

  SELECT * INTO _wallet FROM public.pay_wallets WHERE user_id = _uid FOR UPDATE;
  IF _wallet.id IS NULL THEN
    RAISE EXCEPTION 'Wallet missing';
  END IF;

  UPDATE public.pay_bookings SET status = 'cancelled' WHERE id = _booking.id
    RETURNING * INTO _booking;

  UPDATE public.pay_escrows
    SET status = 'refunded', released_at = now()
    WHERE booking_id = _booking.id AND status = 'held';

  UPDATE public.pay_trips
    SET booked = GREATEST(0, booked - _booking.guests)
    WHERE id = _booking.trip_id;

  UPDATE public.pay_wallets
    SET trip_balance = GREATEST(0, trip_balance - _booking.total_amount),
        flex_balance = flex_balance + _booking.total_amount
    WHERE id = _wallet.id;

  INSERT INTO public.pay_transactions(
    wallet_id, user_id, booking_id, amount, currency,
    type, provider, provider_ref, status
  ) VALUES (
    _wallet.id, _uid, _booking.id, _booking.total_amount, _booking.currency,
    'refund', 'wallet', 'refund_' || _booking.id::text, 'success'
  );

  RETURN _booking;
END;
$$;

REVOKE ALL ON FUNCTION public.pay_cancel_booking(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.pay_cancel_booking(uuid) TO authenticated;
