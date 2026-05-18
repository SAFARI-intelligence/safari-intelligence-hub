
-- Attach missing triggers on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

DROP TRIGGER IF EXISTS on_auth_user_created_wallet ON auth.users;
CREATE TRIGGER on_auth_user_created_wallet
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_wallet();

-- Backfill any existing auth users who are missing profile/role/wallet
INSERT INTO public.profiles (id, name, email)
SELECT u.id,
       COALESCE(u.raw_user_meta_data ->> 'name', split_part(u.email, '@', 1)),
       u.email
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL;

INSERT INTO public.user_roles (user_id, role)
SELECT u.id,
       CASE
         WHEN COALESCE(u.raw_user_meta_data ->> 'role', 'user') = 'hotel' THEN 'hotel'::app_role
         ELSE 'user'::app_role
       END
FROM auth.users u
LEFT JOIN public.user_roles r ON r.user_id = u.id
WHERE r.user_id IS NULL;

INSERT INTO public.pay_wallets (user_id)
SELECT u.id FROM auth.users u
LEFT JOIN public.pay_wallets w ON w.user_id = u.id
WHERE w.user_id IS NULL;
