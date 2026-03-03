-- SQL Commands to create the SaaS Profile (Billing/Gating) System
-- Note: This creates the `Profile` table linked to `auth.users` to control quotas.

-- 1. Create Profile Table
CREATE TABLE public."Profile" (
  "id" UUID PRIMARY KEY REFERENCES auth.users("id") ON DELETE CASCADE,
  "email" TEXT NOT NULL,
  "is_super_admin" BOOLEAN NOT NULL DEFAULT false,
  "max_weddings" INTEGER NOT NULL DEFAULT 1, -- Default Free Tier limit
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Link Wedding to Profile (Ownership)
-- First add the owner_id column
ALTER TABLE public."Wedding" 
  ADD COLUMN "owner_id" UUID REFERENCES public."Profile"("id") ON DELETE SET NULL;

-- 3. Trigger to auto-create Profile on new Auth Signup
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public."Profile" (id, email, is_super_admin, max_weddings)
  VALUES (new.id, new.email, false, 1);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bind trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 4. Secure the tables (RLS)
ALTER TABLE public."Profile" ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can view own profile" 
  ON public."Profile" FOR SELECT 
  USING (auth.uid() = id);

-- Super Admins can do anything
CREATE POLICY "Super admins can do all to profiles" 
  ON public."Profile" FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public."Profile"
      WHERE id = auth.uid() AND is_super_admin = true
    )
  );

-- Function to check wedding creation quota (used by API)
CREATE OR REPLACE FUNCTION public.can_create_wedding(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_max_weddings INTEGER;
  v_current_count INTEGER;
  v_is_super_admin BOOLEAN;
BEGIN
  -- Get user profile limits
  SELECT max_weddings, is_super_admin INTO v_max_weddings, v_is_super_admin
  FROM public."Profile"
  WHERE id = user_id;

  -- Super admins have no limits
  IF v_is_super_admin THEN
    RETURN true;
  END IF;

  -- Count current weddings owned by this user
  SELECT count(*) INTO v_current_count
  FROM public."Wedding"
  WHERE owner_id = user_id;

  -- Check if under limit
  RETURN v_current_count < v_max_weddings;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
