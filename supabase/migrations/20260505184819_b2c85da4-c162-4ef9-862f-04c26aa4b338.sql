
-- Enums
CREATE TYPE pay_trip_status AS ENUM ('active','completed','cancelled');
CREATE TYPE pay_booking_status AS ENUM ('pending','confirmed','cancelled','completed');
CREATE TYPE pay_tx_type AS ENUM ('payment','refund','payout','add_on','topup','transfer');
CREATE TYPE pay_provider AS ENUM ('stripe','mpesa','mock','wallet');
CREATE TYPE pay_tx_status AS ENUM ('pending','success','failed');
CREATE TYPE pay_escrow_status AS ENUM ('held','released','refunded');

-- Wallets
CREATE TABLE public.pay_wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  trip_balance numeric(14,2) NOT NULL DEFAULT 0,
  flex_balance numeric(14,2) NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'KES',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.pay_wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "wallets owner read" ON public.pay_wallets FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR has_role(auth.uid(),'support'::app_role));
CREATE POLICY "wallets owner update" ON public.pay_wallets FOR UPDATE TO authenticated
  USING (auth.uid() = user_id OR has_role(auth.uid(),'support'::app_role));
CREATE POLICY "wallets self insert" ON public.pay_wallets FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id OR has_role(auth.uid(),'support'::app_role));

CREATE TRIGGER pay_wallets_updated BEFORE UPDATE ON public.pay_wallets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trips
CREATE TABLE public.pay_trips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  operator_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  base_price numeric(14,2) NOT NULL,
  currency text NOT NULL DEFAULT 'KES',
  start_date date NOT NULL,
  end_date date NOT NULL,
  status pay_trip_status NOT NULL DEFAULT 'active',
  image text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.pay_trips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "trips public read" ON public.pay_trips FOR SELECT TO public
  USING (status = 'active' OR operator_id = auth.uid() OR has_role(auth.uid(),'support'::app_role));
CREATE POLICY "trips operator insert" ON public.pay_trips FOR INSERT TO authenticated
  WITH CHECK ((auth.uid() = operator_id AND has_role(auth.uid(),'hotel'::app_role)) OR has_role(auth.uid(),'support'::app_role));
CREATE POLICY "trips operator update" ON public.pay_trips FOR UPDATE TO authenticated
  USING (auth.uid() = operator_id OR has_role(auth.uid(),'support'::app_role));
CREATE POLICY "trips operator delete" ON public.pay_trips FOR DELETE TO authenticated
  USING (auth.uid() = operator_id OR has_role(auth.uid(),'support'::app_role));

CREATE TRIGGER pay_trips_updated BEFORE UPDATE ON public.pay_trips
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Bookings
CREATE TABLE public.pay_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  trip_id uuid NOT NULL REFERENCES public.pay_trips(id) ON DELETE RESTRICT,
  guests int NOT NULL DEFAULT 1,
  total_amount numeric(14,2) NOT NULL,
  currency text NOT NULL DEFAULT 'KES',
  status pay_booking_status NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.pay_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "bookings owner or operator read" ON public.pay_bookings FOR SELECT TO authenticated
  USING (
    auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM pay_trips t WHERE t.id = trip_id AND t.operator_id = auth.uid())
    OR has_role(auth.uid(),'support'::app_role)
  );
CREATE POLICY "bookings user insert" ON public.pay_bookings FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "bookings user update" ON public.pay_bookings FOR UPDATE TO authenticated
  USING (auth.uid() = user_id OR has_role(auth.uid(),'support'::app_role));

CREATE TRIGGER pay_bookings_updated BEFORE UPDATE ON public.pay_bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Transactions
CREATE TABLE public.pay_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id uuid NOT NULL REFERENCES public.pay_wallets(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  booking_id uuid REFERENCES public.pay_bookings(id) ON DELETE SET NULL,
  amount numeric(14,2) NOT NULL,
  currency text NOT NULL DEFAULT 'KES',
  type pay_tx_type NOT NULL,
  provider pay_provider NOT NULL,
  provider_ref text NOT NULL UNIQUE,
  status pay_tx_status NOT NULL DEFAULT 'pending',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.pay_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tx owner or operator read" ON public.pay_transactions FOR SELECT TO authenticated
  USING (
    auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM pay_bookings b JOIN pay_trips t ON t.id=b.trip_id WHERE b.id = booking_id AND t.operator_id = auth.uid())
    OR has_role(auth.uid(),'support'::app_role)
  );
CREATE POLICY "tx user insert" ON public.pay_transactions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_pay_tx_user ON public.pay_transactions(user_id, created_at DESC);
CREATE INDEX idx_pay_tx_booking ON public.pay_transactions(booking_id);

-- Escrows
CREATE TABLE public.pay_escrows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL UNIQUE REFERENCES public.pay_bookings(id) ON DELETE CASCADE,
  amount numeric(14,2) NOT NULL,
  currency text NOT NULL DEFAULT 'KES',
  status pay_escrow_status NOT NULL DEFAULT 'held',
  released_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.pay_escrows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "escrow related read" ON public.pay_escrows FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM pay_bookings b WHERE b.id = booking_id AND (b.user_id = auth.uid()
       OR EXISTS (SELECT 1 FROM pay_trips t WHERE t.id = b.trip_id AND t.operator_id = auth.uid())))
    OR has_role(auth.uid(),'support'::app_role)
  );
CREATE POLICY "escrow user insert" ON public.pay_escrows FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM pay_bookings b WHERE b.id = booking_id AND b.user_id = auth.uid()));
CREATE POLICY "escrow support update" ON public.pay_escrows FOR UPDATE TO authenticated
  USING (has_role(auth.uid(),'support'::app_role));

-- FX rates
CREATE TABLE public.pay_fx_rates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  base text NOT NULL,
  quote text NOT NULL,
  rate numeric(14,6) NOT NULL,
  fetched_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (base, quote)
);
ALTER TABLE public.pay_fx_rates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fx public read" ON public.pay_fx_rates FOR SELECT TO public USING (true);
CREATE POLICY "fx support write" ON public.pay_fx_rates FOR ALL TO authenticated
  USING (has_role(auth.uid(),'support'::app_role)) WITH CHECK (has_role(auth.uid(),'support'::app_role));

-- Seed FX (KES <-> USD reference)
INSERT INTO public.pay_fx_rates (base, quote, rate) VALUES
  ('KES','USD', 0.0077),
  ('USD','KES', 130.00);

-- Auto-create wallet on signup (extend existing handle_new_user trigger by adding a separate trigger)
CREATE OR REPLACE FUNCTION public.handle_new_user_wallet()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.pay_wallets (user_id) VALUES (NEW.id) ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END $$;

CREATE TRIGGER on_auth_user_created_wallet
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_wallet();

-- Backfill wallets for existing users
INSERT INTO public.pay_wallets (user_id)
SELECT id FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

-- Seed a few demo trips (operator_id will be the first hotel-role user, if any)
INSERT INTO public.pay_trips (operator_id, title, description, base_price, currency, start_date, end_date, image)
SELECT
  COALESCE((SELECT user_id FROM public.user_roles WHERE role='hotel' LIMIT 1), gen_random_uuid()),
  t.title, t.description, t.base_price, 'KES', t.start_date, t.end_date, t.image
FROM (VALUES
  ('Maasai Mara — Great Migration', '4-day classic safari with sundowners on the Mara River.', 185000, CURRENT_DATE + 14, CURRENT_DATE + 18, 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=1200'),
  ('Amboseli — Elephants & Kilimanjaro', '3-day signature lodge stay with bush breakfast.', 142000, CURRENT_DATE + 30, CURRENT_DATE + 33, 'https://images.unsplash.com/photo-1534177616072-ef7dc120449d?w=1200'),
  ('Diani Marine Escape', '5-night beach + reef snorkelling experience.', 98000, CURRENT_DATE + 45, CURRENT_DATE + 50, 'https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=1200')
) AS t(title, description, base_price, start_date, end_date, image);
