
-- =====================================================
-- WIS Phase 1: Journal + Narratives
-- =====================================================

-- 1. Journal entries
CREATE TABLE public.wis_journal_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  booking_id uuid REFERENCES public.pay_bookings(id) ON DELETE SET NULL,
  species text NOT NULL,
  park text NOT NULL,
  observed_at timestamptz NOT NULL DEFAULT now(),
  note text NOT NULL CHECK (length(note) <= 500),
  photo_url text,
  behavior_tag text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX wis_journal_user_idx ON public.wis_journal_entries(user_id, observed_at DESC);
CREATE INDEX wis_journal_booking_idx ON public.wis_journal_entries(booking_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.wis_journal_entries TO authenticated;
GRANT ALL ON public.wis_journal_entries TO service_role;
ALTER TABLE public.wis_journal_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "wis_journal_own_select" ON public.wis_journal_entries
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "wis_journal_own_insert" ON public.wis_journal_entries
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "wis_journal_own_update" ON public.wis_journal_entries
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "wis_journal_own_delete" ON public.wis_journal_entries
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- 2. Narratives (AI cache)
CREATE TABLE public.wis_narratives (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  scope text NOT NULL CHECK (scope IN ('journal','species_fact','trip_summary')),
  ref_id text NOT NULL,
  model text NOT NULL,
  prompt_hash text NOT NULL,
  body text NOT NULL,
  tokens_in int,
  tokens_out int,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (scope, ref_id, prompt_hash)
);
CREATE INDEX wis_narratives_user_idx ON public.wis_narratives(user_id);
CREATE INDEX wis_narratives_scope_ref_idx ON public.wis_narratives(scope, ref_id);

GRANT SELECT ON public.wis_narratives TO authenticated, anon;
GRANT ALL ON public.wis_narratives TO service_role;
ALTER TABLE public.wis_narratives ENABLE ROW LEVEL SECURITY;

-- Owner reads their own; everyone can read shared species_fact rows
CREATE POLICY "wis_narratives_read" ON public.wis_narratives
  FOR SELECT TO authenticated, anon
  USING (scope = 'species_fact' OR (auth.uid() IS NOT NULL AND auth.uid() = user_id));

-- 3. Species rarity reference
CREATE TABLE public.wis_species_rarity (
  species text PRIMARY KEY,
  rarity_score int NOT NULL CHECK (rarity_score BETWEEN 1 AND 10),
  region text,
  notes text
);

GRANT SELECT ON public.wis_species_rarity TO authenticated, anon;
GRANT ALL ON public.wis_species_rarity TO service_role;
ALTER TABLE public.wis_species_rarity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "wis_rarity_public_read" ON public.wis_species_rarity
  FOR SELECT TO authenticated, anon USING (true);

INSERT INTO public.wis_species_rarity (species, rarity_score, region, notes) VALUES
  ('Lion', 5, 'East Africa', 'Iconic but common in major reserves'),
  ('Elephant', 4, 'East Africa', 'Large herds in Amboseli and Tsavo'),
  ('Cheetah', 7, 'East Africa', 'Daytime predator, declining numbers'),
  ('Leopard', 8, 'East Africa', 'Elusive, mostly nocturnal'),
  ('Black Rhino', 10, 'Kenya', 'Critically endangered, protected sanctuaries'),
  ('White Rhino', 9, 'Kenya', 'Near threatened, mostly Ol Pejeta and Lake Nakuru'),
  ('Mountain Gorilla', 10, 'Uganda/Rwanda', 'Critically endangered, permit-only viewing'),
  ('Giraffe', 4, 'East Africa', 'Common in savanna parks'),
  ('Zebra', 3, 'East Africa', 'Abundant in Mara and Serengeti'),
  ('Buffalo', 4, 'East Africa', 'Member of the Big Five'),
  ('Hippo', 4, 'East Africa', 'Riverine, very common'),
  ('Wild Dog', 9, 'East Africa', 'Endangered pack predator'),
  ('Pangolin', 10, 'East Africa', 'Extremely rare, mostly nocturnal'),
  ('Serval', 8, 'East Africa', 'Solitary, grassland'),
  ('Caracal', 8, 'East Africa', 'Solitary nocturnal cat');

-- 4. Trip summaries
CREATE TABLE public.wis_trip_summaries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  booking_id uuid NOT NULL REFERENCES public.pay_bookings(id) ON DELETE CASCADE,
  top_moments jsonb NOT NULL DEFAULT '[]'::jsonb,
  narrative text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, booking_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.wis_trip_summaries TO authenticated;
GRANT ALL ON public.wis_trip_summaries TO service_role;
ALTER TABLE public.wis_trip_summaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "wis_trip_summaries_own" ON public.wis_trip_summaries
  FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- updated_at trigger for journal
CREATE TRIGGER wis_journal_updated_at
  BEFORE UPDATE ON public.wis_journal_entries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
