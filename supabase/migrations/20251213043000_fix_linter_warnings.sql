-- Fix Supabase Linter Warnings
-- Fixes: function search_path, RLS initplan performance, multiple permissive policies, unindexed foreign keys

-- =============================================
-- 1. Fix function search_path issues
-- =============================================

-- Drop and recreate functions with SET search_path

-- Fix handle_new_user
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
CREATE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$;

-- Recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Fix increment_ubuntu_score (drop first to change return type)
DROP FUNCTION IF EXISTS public.increment_ubuntu_score(UUID, INTEGER) CASCADE;
CREATE FUNCTION public.increment_ubuntu_score(p_user_id UUID, p_points INTEGER)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET ubuntu_score = ubuntu_score + p_points,
      updated_at = NOW()
  WHERE id = p_user_id;
END;
$$;

-- Fix update_updated_at_column
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
CREATE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Recreate triggers for update_updated_at_column
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_directory_updated_at BEFORE UPDATE ON public.directory_listings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_content_updated_at BEFORE UPDATE ON public.content_submissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_travel_updated_at BEFORE UPDATE ON public.travel_businesses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_unified_updated_at BEFORE UPDATE ON public.unified_submissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_verification_updated_at BEFORE UPDATE ON public.verification_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- 2. Fix RLS policies with (select auth.uid()) pattern
-- =============================================

-- profiles table
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (id = (SELECT auth.uid()));

-- directory_listings table
DROP POLICY IF EXISTS "Users can create listings" ON public.directory_listings;
CREATE POLICY "Users can create listings" ON public.directory_listings
  FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can update own listings" ON public.directory_listings;
CREATE POLICY "Users can update own listings" ON public.directory_listings
  FOR UPDATE USING (user_id = (SELECT auth.uid()));

-- Drop overlapping SELECT policies and create single optimized one
DROP POLICY IF EXISTS "Users can view own listings" ON public.directory_listings;
DROP POLICY IF EXISTS "Anyone can view published listings" ON public.directory_listings;
CREATE POLICY "View published or own listings" ON public.directory_listings
  FOR SELECT USING (status = 'published' OR user_id = (SELECT auth.uid()));

-- content_submissions table
DROP POLICY IF EXISTS "Users can create submissions" ON public.content_submissions;
CREATE POLICY "Users can create submissions" ON public.content_submissions
  FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));

-- Drop overlapping SELECT policies and create single optimized one
DROP POLICY IF EXISTS "Users can view own submissions" ON public.content_submissions;
DROP POLICY IF EXISTS "Anyone can view published content" ON public.content_submissions;
CREATE POLICY "View published or own content" ON public.content_submissions
  FOR SELECT USING (status = 'published' OR user_id = (SELECT auth.uid()));

-- travel_businesses table
DROP POLICY IF EXISTS "Owners can create travel business" ON public.travel_businesses;
CREATE POLICY "Owners can create travel business" ON public.travel_businesses
  FOR INSERT WITH CHECK (owner_id = (SELECT auth.uid()));

-- Drop overlapping SELECT policies and create single optimized one
DROP POLICY IF EXISTS "Owners can view own travel business" ON public.travel_businesses;
DROP POLICY IF EXISTS "Anyone can view published travel businesses" ON public.travel_businesses;
CREATE POLICY "View published or own travel business" ON public.travel_businesses
  FOR SELECT USING (status = 'published' OR owner_id = (SELECT auth.uid()));

-- unified_submissions table
DROP POLICY IF EXISTS "Users can create unified submissions" ON public.unified_submissions;
CREATE POLICY "Users can create unified submissions" ON public.unified_submissions
  FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can view own unified submissions" ON public.unified_submissions;
CREATE POLICY "Users can view own unified submissions" ON public.unified_submissions
  FOR SELECT USING (user_id = (SELECT auth.uid()));

-- ubuntu_contributions table
DROP POLICY IF EXISTS "Users can view own contributions" ON public.ubuntu_contributions;
CREATE POLICY "Users can view own contributions" ON public.ubuntu_contributions
  FOR SELECT USING (user_id = (SELECT auth.uid()));

-- activity_logs table
DROP POLICY IF EXISTS "Users can view own activity" ON public.activity_logs;
CREATE POLICY "Users can view own activity" ON public.activity_logs
  FOR SELECT USING (user_id = (SELECT auth.uid()));

-- verification_requests table
DROP POLICY IF EXISTS "Users can create verification requests" ON public.verification_requests;
CREATE POLICY "Users can create verification requests" ON public.verification_requests
  FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can view own verification requests" ON public.verification_requests;
CREATE POLICY "Users can view own verification requests" ON public.verification_requests
  FOR SELECT USING (user_id = (SELECT auth.uid()));

-- product_subscriptions table
DROP POLICY IF EXISTS "Users can view own subscriptions" ON public.product_subscriptions;
CREATE POLICY "Users can view own subscriptions" ON public.product_subscriptions
  FOR SELECT USING (user_id = (SELECT auth.uid()));

-- =============================================
-- 3. Add missing indexes on foreign keys
-- =============================================

CREATE INDEX IF NOT EXISTS idx_businesses_user_id ON public.businesses(user_id);
CREATE INDEX IF NOT EXISTS idx_experts_user_id ON public.experts(user_id);
CREATE INDEX IF NOT EXISTS idx_content_submissions_reviewed_by ON public.content_submissions(reviewed_by);
CREATE INDEX IF NOT EXISTS idx_directory_listings_reviewed_by ON public.directory_listings(reviewed_by);
CREATE INDEX IF NOT EXISTS idx_product_subscriptions_user_id ON public.product_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_unified_submissions_assigned_to ON public.unified_submissions(assigned_to);
CREATE INDEX IF NOT EXISTS idx_verification_requests_listing_id ON public.verification_requests(listing_id);
CREATE INDEX IF NOT EXISTS idx_verification_requests_reviewed_by ON public.verification_requests(reviewed_by);
CREATE INDEX IF NOT EXISTS idx_verification_requests_user_id ON public.verification_requests(user_id);

-- =============================================
-- 4. Move pg_trgm extension to extensions schema
-- =============================================

CREATE SCHEMA IF NOT EXISTS extensions;
DROP EXTENSION IF EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA extensions;
GRANT USAGE ON SCHEMA extensions TO authenticated;
GRANT USAGE ON SCHEMA extensions TO anon;
