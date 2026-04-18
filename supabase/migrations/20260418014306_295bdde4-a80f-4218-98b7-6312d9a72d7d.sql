
-- ============================================
-- ROLES (separate table — security best practice)
-- ============================================
CREATE TYPE public.app_role AS ENUM ('user', 'hotel', 'support');

CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function — avoids recursive RLS
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.get_user_roles(_user_id UUID)
RETURNS SETOF app_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles WHERE user_id = _user_id
$$;

CREATE POLICY "Users view own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'support'));

CREATE POLICY "Support manage roles"
ON public.user_roles FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'support'))
WITH CHECK (public.has_role(auth.uid(), 'support'));

-- ============================================
-- PROFILES
-- ============================================
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT,
  profile_image TEXT,
  preferences JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles publicly viewable"
ON public.profiles FOR SELECT
USING (true);

CREATE POLICY "Users update own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users insert own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "Support delete profile"
ON public.profiles FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'support'));

-- Timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile + default role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _role app_role;
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'name', split_part(NEW.email, '@', 1)),
    NEW.email
  );

  -- Allow role override from signup metadata (user/hotel only — support is admin-assigned)
  _role := COALESCE((NEW.raw_user_meta_data ->> 'role')::app_role, 'user');
  IF _role = 'support' THEN
    _role := 'user';
  END IF;

  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, _role);

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- HOTELS
-- ============================================
CREATE TYPE public.hotel_type AS ENUM ('hotel', 'villa', 'lodge', 'camp');

CREATE TABLE public.hotels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type hotel_type NOT NULL DEFAULT 'hotel',
  country TEXT NOT NULL,
  region TEXT,
  park TEXT,
  price_min NUMERIC(10,2) NOT NULL DEFAULT 0,
  price_max NUMERIC(10,2) NOT NULL DEFAULT 0,
  rating NUMERIC(2,1) NOT NULL DEFAULT 0,
  description TEXT,
  amenities TEXT[] NOT NULL DEFAULT '{}',
  images TEXT[] NOT NULL DEFAULT '{}',
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_hotels_country ON public.hotels(country);
CREATE INDEX idx_hotels_park ON public.hotels(park);
CREATE INDEX idx_hotels_rating ON public.hotels(rating DESC);
CREATE INDEX idx_hotels_owner ON public.hotels(owner_id);

ALTER TABLE public.hotels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Hotels publicly viewable"
ON public.hotels FOR SELECT
USING (is_published = true OR auth.uid() = owner_id OR public.has_role(auth.uid(), 'support'));

CREATE POLICY "Hotel partners create own"
ON public.hotels FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = owner_id
  AND (public.has_role(auth.uid(), 'hotel') OR public.has_role(auth.uid(), 'support'))
);

CREATE POLICY "Hotel partners update own"
ON public.hotels FOR UPDATE
TO authenticated
USING (auth.uid() = owner_id OR public.has_role(auth.uid(), 'support'));

CREATE POLICY "Hotel partners delete own"
ON public.hotels FOR DELETE
TO authenticated
USING (auth.uid() = owner_id OR public.has_role(auth.uid(), 'support'));

CREATE TRIGGER update_hotels_updated_at
BEFORE UPDATE ON public.hotels
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- BOOKINGS
-- ============================================
CREATE TYPE public.booking_status AS ENUM ('pending', 'confirmed', 'cancelled');

CREATE TABLE public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  hotel_id UUID NOT NULL REFERENCES public.hotels(id) ON DELETE CASCADE,
  hotel_name TEXT NOT NULL, -- denormalized for fast reads
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  guests INT NOT NULL DEFAULT 1,
  status booking_status NOT NULL DEFAULT 'pending',
  total_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_bookings_user ON public.bookings(user_id);
CREATE INDEX idx_bookings_hotel ON public.bookings(hotel_id);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own bookings"
ON public.bookings FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id
  OR EXISTS (SELECT 1 FROM public.hotels h WHERE h.id = hotel_id AND h.owner_id = auth.uid())
  OR public.has_role(auth.uid(), 'support')
);

CREATE POLICY "Users create own bookings"
ON public.bookings FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own bookings"
ON public.bookings FOR UPDATE
TO authenticated
USING (
  auth.uid() = user_id
  OR EXISTS (SELECT 1 FROM public.hotels h WHERE h.id = hotel_id AND h.owner_id = auth.uid())
  OR public.has_role(auth.uid(), 'support')
);

CREATE POLICY "Users cancel own bookings"
ON public.bookings FOR DELETE
TO authenticated
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'support'));

CREATE TRIGGER update_bookings_updated_at
BEFORE UPDATE ON public.bookings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- REVIEWS
-- ============================================
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  hotel_id UUID NOT NULL REFERENCES public.hotels(id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_reviews_hotel ON public.reviews(hotel_id);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reviews publicly viewable"
ON public.reviews FOR SELECT
USING (true);

CREATE POLICY "Users create own reviews"
ON public.reviews FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own reviews"
ON public.reviews FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users delete own reviews"
ON public.reviews FOR DELETE
TO authenticated
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'support'));

-- ============================================
-- ANIMAL STORIES (Big Five)
-- ============================================
CREATE TABLE public.animal_stories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  short_story TEXT NOT NULL,
  fun_facts TEXT[] NOT NULL DEFAULT '{}',
  image TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.animal_stories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Stories publicly viewable"
ON public.animal_stories FOR SELECT
USING (true);

CREATE POLICY "Support manage stories"
ON public.animal_stories FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'support'))
WITH CHECK (public.has_role(auth.uid(), 'support'));

-- ============================================
-- SUPPORT TICKETS
-- ============================================
CREATE TYPE public.ticket_status AS ENUM ('open', 'in_progress', 'closed');
CREATE TYPE public.ticket_priority AS ENUM ('low', 'normal', 'high', 'urgent');

CREATE TABLE public.support_tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status ticket_status NOT NULL DEFAULT 'open',
  priority ticket_priority NOT NULL DEFAULT 'normal',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_tickets_user ON public.support_tickets(user_id);
CREATE INDEX idx_tickets_status ON public.support_tickets(status);

ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own tickets"
ON public.support_tickets FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'support'));

CREATE POLICY "Users create own tickets"
ON public.support_tickets FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Support update tickets"
ON public.support_tickets FOR UPDATE
TO authenticated
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'support'));

CREATE TRIGGER update_tickets_updated_at
BEFORE UPDATE ON public.support_tickets
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- SEED — animal stories (Big Five)
-- ============================================
INSERT INTO public.animal_stories (name, title, short_story, fun_facts) VALUES
('Lion', 'Simba — King of the Savanna', 'Lions live in prides led by related females. Males defend the territory; females do most of the hunting at dawn and dusk.', ARRAY['A lion''s roar carries 8km', 'Cubs are born blind', 'Prides may have up to 30 members']),
('Elephant', 'Tembo — Gentle Giant', 'African elephants are the largest land animals. Matriarchs guide herds across hundreds of kilometres in search of water.', ARRAY['Elephants mourn their dead', 'They have 40,000 muscles in their trunk', 'Pregnancy lasts 22 months']),
('Leopard', 'Chui — Solitary Ghost', 'Leopards are stealth hunters that drag prey up trees to avoid scavengers. They are the most adaptable of the big cats.', ARRAY['They can leap 6m horizontally', 'Each rosette pattern is unique', 'Mostly nocturnal hunters']),
('Rhinoceros', 'Kifaru — Ancient Armor', 'Both black and white rhinos roam East Africa. Conservation has brought them back from the brink in places like Akagera and Ol Pejeta.', ARRAY['Horns are made of keratin', 'Rhinos can run 50 km/h', 'They love mud baths']),
('Buffalo', 'Nyati — Unpredictable Power', 'Cape buffalo travel in herds of hundreds. They are known to defend their own — even charging lions to rescue calves.', ARRAY['Weigh up to 900 kg', 'Excellent swimmers', 'Considered the most dangerous of the Big Five']);
