-- Hotel coordinates
ALTER TABLE public.hotels
  ADD COLUMN IF NOT EXISTS latitude numeric,
  ADD COLUMN IF NOT EXISTS longitude numeric;

-- Animal live locations (history of points)
CREATE TABLE IF NOT EXISTS public.animal_locations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  story_id uuid NOT NULL REFERENCES public.animal_stories(id) ON DELETE CASCADE,
  latitude numeric NOT NULL,
  longitude numeric NOT NULL,
  recorded_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_animal_locations_story_recorded
  ON public.animal_locations (story_id, recorded_at DESC);

ALTER TABLE public.animal_locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Animal locations publicly viewable"
  ON public.animal_locations FOR SELECT
  USING (true);

CREATE POLICY "Support manage animal locations"
  ON public.animal_locations FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'support'::app_role))
  WITH CHECK (has_role(auth.uid(), 'support'::app_role));

-- Animal habitat zones
CREATE TABLE IF NOT EXISTS public.animal_zones (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  color text NOT NULL DEFAULT '#D4870A',
  geojson jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.animal_zones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Animal zones publicly viewable"
  ON public.animal_zones FOR SELECT
  USING (true);

CREATE POLICY "Support manage animal zones"
  ON public.animal_zones FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'support'::app_role))
  WITH CHECK (has_role(auth.uid(), 'support'::app_role));