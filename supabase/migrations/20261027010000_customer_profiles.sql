BEGIN;

CREATE TABLE public.customer_profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL CHECK (length(btrim(full_name)) BETWEEN 1 AND 100),
  phone text NOT NULL CHECK (phone ~ '^\+[1-9][0-9]{9,14}$'),
  account_type text NOT NULL DEFAULT 'personal' CHECK (account_type IN ('personal', 'business')),
  company_name text NOT NULL DEFAULT '',
  bin text NOT NULL DEFAULT '',
  CHECK (
    (account_type = 'personal' AND company_name = '' AND bin = '') OR
    (account_type = 'business' AND length(btrim(company_name)) BETWEEN 1 AND 200 AND bin ~ '^[0-9]{12}$')
  )
);

COMMENT ON COLUMN public.customer_profiles.account_type IS 'Self-declared buyer type, not approval for wholesale pricing or loyalty privileges.';
COMMENT ON COLUMN public.customer_profiles.phone IS 'Unverified contact number. Never use alone to grant access to an existing Poster customer.';
ALTER TABLE public.customer_profiles ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.customer_profiles FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.customer_profiles TO authenticated;
GRANT ALL ON public.customer_profiles TO service_role;
CREATE POLICY customer_read_own ON public.customer_profiles FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);
CREATE POLICY customer_insert_own ON public.customer_profiles FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY customer_update_own ON public.customer_profiles FOR UPDATE TO authenticated USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);

COMMIT;
