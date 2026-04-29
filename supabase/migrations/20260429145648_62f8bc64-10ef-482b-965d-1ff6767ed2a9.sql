
-- 1) Restrict profiles SELECT: hide emails from public
DROP POLICY IF EXISTS "Profiles publicly viewable" ON public.profiles;

-- Public can see basic profile fields via a safe view
CREATE OR REPLACE VIEW public.profiles_public AS
SELECT id, name, profile_image, created_at
FROM public.profiles;

GRANT SELECT ON public.profiles_public TO anon, authenticated;

-- Owners and support can read full profile (incl. email)
CREATE POLICY "Profiles owner or support read"
ON public.profiles FOR SELECT
USING (auth.uid() = id OR public.has_role(auth.uid(), 'support'::app_role));

-- 2) Lock down get_user_roles: caller must be the user or support
CREATE OR REPLACE FUNCTION public.get_user_roles(_user_id uuid)
RETURNS SETOF app_role
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT role FROM public.user_roles
  WHERE user_id = _user_id
    AND (auth.uid() = _user_id OR public.has_role(auth.uid(), 'support'::app_role));
$$;

-- Revoke direct EXECUTE on has_role from anon/authenticated (still usable inside RLS as definer-owned)
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon, authenticated, public;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticator;

-- 3) Bookings: server-side enforce total_price via trigger
CREATE OR REPLACE FUNCTION public.enforce_booking_price()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _price numeric;
  _nights integer;
BEGIN
  SELECT price_min INTO _price FROM public.hotels WHERE id = NEW.hotel_id;
  IF _price IS NULL THEN
    RAISE EXCEPTION 'Hotel not found';
  END IF;
  _nights := GREATEST(1, (NEW.check_out - NEW.check_in));
  NEW.total_price := _nights * _price * GREATEST(NEW.guests, 1);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS bookings_enforce_price ON public.bookings;
CREATE TRIGGER bookings_enforce_price
BEFORE INSERT OR UPDATE OF check_in, check_out, guests, hotel_id ON public.bookings
FOR EACH ROW EXECUTE FUNCTION public.enforce_booking_price();

-- 4) Prevent support users from granting/changing 'support' role via direct table writes
CREATE OR REPLACE FUNCTION public.prevent_support_self_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.role = 'support'::app_role THEN
    -- Only allow if performed by the postgres/service role (i.e. no auth.uid()).
    IF auth.uid() IS NOT NULL THEN
      RAISE EXCEPTION 'Assigning the support role via API is not permitted';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS user_roles_block_support ON public.user_roles;
CREATE TRIGGER user_roles_block_support
BEFORE INSERT OR UPDATE ON public.user_roles
FOR EACH ROW EXECUTE FUNCTION public.prevent_support_self_escalation();

-- 5) support_tickets: add DELETE policy (owner or support)
CREATE POLICY "Users delete own tickets"
ON public.support_tickets FOR DELETE
TO authenticated
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'support'::app_role));

-- 6) Ensure RLS is enabled on itineraries (committed in migration history)
ALTER TABLE public.itineraries ENABLE ROW LEVEL SECURITY;
