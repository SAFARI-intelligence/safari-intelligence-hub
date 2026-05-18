-- Create experiences table for safari packages
CREATE TABLE public.experiences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  features TEXT[] NOT NULL DEFAULT '{}',
  price_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  price_currency TEXT NOT NULL DEFAULT 'KES',
  tax_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  tax_currency TEXT NOT NULL DEFAULT 'USD',
  image TEXT,
  duration_days INTEGER,
  duration_nights INTEGER,
  country TEXT NOT NULL DEFAULT 'Kenya',
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Experiences publicly viewable"
  ON public.experiences FOR SELECT
  USING (is_published = true OR has_role(auth.uid(), 'support'::app_role));

CREATE POLICY "Support manage experiences"
  ON public.experiences FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'support'::app_role))
  WITH CHECK (has_role(auth.uid(), 'support'::app_role));

CREATE TRIGGER update_experiences_updated_at
  BEFORE UPDATE ON public.experiences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_experiences_published ON public.experiences(is_published);