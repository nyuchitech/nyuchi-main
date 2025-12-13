-- ============================================================================
-- Nyuchi Platform - Schema Fix Migration
-- Fixes existing tables and adds missing tables
-- Run this in Supabase SQL Editor
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================================
-- ENUM TYPES (safe - won't error if exists)
-- ============================================================================

DO $$ BEGIN CREATE TYPE user_role AS ENUM ('user', 'contributor', 'moderator', 'reviewer', 'admin'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE user_capability AS ENUM ('contributor', 'expert', 'business_owner', 'moderator', 'reviewer', 'admin'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE submission_type AS ENUM ('content', 'expert_application', 'business_application', 'directory_listing', 'travel_business'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE pipeline_status AS ENUM ('draft', 'submitted', 'in_review', 'needs_changes', 'approved', 'rejected', 'published'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE listing_status AS ENUM ('draft', 'pending', 'approved', 'rejected', 'published'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE content_status AS ENUM ('draft', 'submitted', 'reviewing', 'approved', 'rejected', 'published'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE verification_status AS ENUM ('none', 'pending', 'approved', 'rejected'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE subscription_status AS ENUM ('active', 'canceled', 'past_due', 'trialing', 'incomplete'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE application_status AS ENUM ('pending', 'approved', 'rejected'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE listing_type AS ENUM ('free', 'verified', 'premium'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE expert_category AS ENUM ('safari_guide', 'cultural_specialist', 'adventure_guide', 'urban_guide', 'photography_guide', 'bird_guide'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE activity_type AS ENUM (
    'SIGN_UP', 'SIGN_IN', 'SIGN_OUT', 'UPDATE_PASSWORD', 'DELETE_ACCOUNT', 'UPDATE_ACCOUNT',
    'CREATE_CONTENT', 'UPDATE_CONTENT', 'DELETE_CONTENT', 'SUBMIT_CONTENT', 'APPROVE_CONTENT', 'REJECT_CONTENT',
    'CREATE_LISTING', 'UPDATE_LISTING', 'DELETE_LISTING', 'APPLY_EXPERT', 'APPLY_BUSINESS', 'VERIFY_BUSINESS',
    'EARN_UBUNTU_POINTS', 'SUBSCRIBE', 'UNSUBSCRIBE'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================================
-- PROFILES TABLE (REQUIRED FIRST - other tables reference it)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  company TEXT,
  country TEXT,
  role user_role DEFAULT 'user' NOT NULL,
  capabilities user_capability[] DEFAULT ARRAY[]::user_capability[],
  ubuntu_score INTEGER DEFAULT 0 NOT NULL,
  contribution_count INTEGER DEFAULT 0 NOT NULL,
  stripe_customer_id TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMPTZ DEFAULT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles are viewable" ON public.profiles;
CREATE POLICY "Public profiles are viewable" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_ubuntu_score ON public.profiles(ubuntu_score DESC);

-- ============================================================================
-- FIX EXISTING EXPERTS TABLE - Add user_id column if missing
-- ============================================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'experts' AND column_name = 'user_id') THEN
    ALTER TABLE public.experts ADD COLUMN user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
  END IF;
END $$;

-- ============================================================================
-- FIX EXISTING BUSINESSES TABLE - Add user_id column if missing
-- ============================================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'businesses' AND column_name = 'user_id') THEN
    ALTER TABLE public.businesses ADD COLUMN user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
  END IF;
END $$;

-- ============================================================================
-- DIRECTORY LISTINGS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.directory_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  business_type TEXT NOT NULL,
  category TEXT NOT NULL,
  country TEXT NOT NULL,
  city TEXT,
  description TEXT NOT NULL,
  contact_info JSONB DEFAULT '{}'::jsonb,
  media_urls TEXT[] DEFAULT ARRAY[]::TEXT[],
  status listing_status DEFAULT 'pending' NOT NULL,
  verification_status verification_status DEFAULT 'none' NOT NULL,
  verification_fee_paid BOOLEAN DEFAULT FALSE,
  reviewed_by UUID REFERENCES public.profiles(id),
  view_count INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.directory_listings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view published listings" ON public.directory_listings;
CREATE POLICY "Anyone can view published listings" ON public.directory_listings FOR SELECT USING (status = 'published');

DROP POLICY IF EXISTS "Users can view own listings" ON public.directory_listings;
CREATE POLICY "Users can view own listings" ON public.directory_listings FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create listings" ON public.directory_listings;
CREATE POLICY "Users can create listings" ON public.directory_listings FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own listings" ON public.directory_listings;
CREATE POLICY "Users can update own listings" ON public.directory_listings FOR UPDATE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_directory_user_id ON public.directory_listings(user_id);
CREATE INDEX IF NOT EXISTS idx_directory_status ON public.directory_listings(status);

-- ============================================================================
-- CONTENT SUBMISSIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.content_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT UNIQUE,
  content TEXT NOT NULL,
  content_type TEXT NOT NULL,
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  featured_image_url TEXT,
  status content_status DEFAULT 'draft' NOT NULL,
  reviewed_by UUID REFERENCES public.profiles(id),
  published_at TIMESTAMPTZ,
  ubuntu_points_awarded INTEGER DEFAULT 0 NOT NULL,
  view_count INTEGER DEFAULT 0 NOT NULL,
  ai_analysis JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.content_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view published content" ON public.content_submissions;
CREATE POLICY "Anyone can view published content" ON public.content_submissions FOR SELECT USING (status = 'published');

DROP POLICY IF EXISTS "Users can view own submissions" ON public.content_submissions;
CREATE POLICY "Users can view own submissions" ON public.content_submissions FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create submissions" ON public.content_submissions;
CREATE POLICY "Users can create submissions" ON public.content_submissions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_content_user_id ON public.content_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_content_status ON public.content_submissions(status);
CREATE INDEX IF NOT EXISTS idx_content_slug ON public.content_submissions(slug);

-- ============================================================================
-- TRAVEL BUSINESSES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.travel_businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  business_type TEXT NOT NULL,
  description TEXT,
  country TEXT NOT NULL,
  city TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  services TEXT,
  specialties TEXT,
  status listing_status DEFAULT 'pending' NOT NULL,
  verification_status verification_status DEFAULT 'none' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.travel_businesses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view published travel businesses" ON public.travel_businesses;
CREATE POLICY "Anyone can view published travel businesses" ON public.travel_businesses FOR SELECT USING (status = 'published');

DROP POLICY IF EXISTS "Owners can view own travel business" ON public.travel_businesses;
CREATE POLICY "Owners can view own travel business" ON public.travel_businesses FOR SELECT USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Owners can create travel business" ON public.travel_businesses;
CREATE POLICY "Owners can create travel business" ON public.travel_businesses FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE INDEX IF NOT EXISTS idx_travel_business_owner_id ON public.travel_businesses(owner_id);
CREATE INDEX IF NOT EXISTS idx_travel_business_status ON public.travel_businesses(status);

-- ============================================================================
-- UNIFIED SUBMISSIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.unified_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  submission_type submission_type NOT NULL,
  reference_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status pipeline_status DEFAULT 'draft' NOT NULL,
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewer_notes TEXT,
  submitted_at TIMESTAMPTZ,
  reviewed_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.unified_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own unified submissions" ON public.unified_submissions;
CREATE POLICY "Users can view own unified submissions" ON public.unified_submissions FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create unified submissions" ON public.unified_submissions;
CREATE POLICY "Users can create unified submissions" ON public.unified_submissions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_unified_submissions_user_id ON public.unified_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_unified_submissions_status ON public.unified_submissions(status);

-- ============================================================================
-- UBUNTU CONTRIBUTIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.ubuntu_contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  contribution_type TEXT NOT NULL,
  contribution_details TEXT,
  ubuntu_points_earned INTEGER NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.ubuntu_contributions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own contributions" ON public.ubuntu_contributions;
CREATE POLICY "Users can view own contributions" ON public.ubuntu_contributions FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can insert contributions" ON public.ubuntu_contributions;
CREATE POLICY "System can insert contributions" ON public.ubuntu_contributions FOR INSERT WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_ubuntu_user_id ON public.ubuntu_contributions(user_id);

-- ============================================================================
-- ACTIVITY LOGS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  activity activity_type NOT NULL,
  ip_address INET,
  user_agent TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own activity" ON public.activity_logs;
CREATE POLICY "Users can view own activity" ON public.activity_logs FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can insert activity" ON public.activity_logs;
CREATE POLICY "System can insert activity" ON public.activity_logs FOR INSERT WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_activity_user_id ON public.activity_logs(user_id);

-- ============================================================================
-- VERIFICATION REQUESTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.verification_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.directory_listings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  stripe_payment_intent_id TEXT,
  payment_status TEXT DEFAULT 'pending' NOT NULL,
  payment_amount DECIMAL(10,2) DEFAULT 10.00 NOT NULL,
  documents JSONB,
  status TEXT DEFAULT 'pending' NOT NULL,
  reviewed_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.verification_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own verification requests" ON public.verification_requests;
CREATE POLICY "Users can view own verification requests" ON public.verification_requests FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create verification requests" ON public.verification_requests;
CREATE POLICY "Users can create verification requests" ON public.verification_requests FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- PRODUCT SUBSCRIPTIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.product_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_slug TEXT NOT NULL,
  stripe_subscription_id TEXT UNIQUE NOT NULL,
  plan_name TEXT NOT NULL,
  billing_cycle TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  status subscription_status DEFAULT 'active' NOT NULL,
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.product_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own subscriptions" ON public.product_subscriptions;
CREATE POLICY "Users can view own subscriptions" ON public.product_subscriptions FOR SELECT USING (auth.uid() = user_id);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, capabilities)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', ''),
    'user',
    ARRAY[]::user_capability[]
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for auto-creating profiles
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Increment Ubuntu score
CREATE OR REPLACE FUNCTION increment_ubuntu_score(p_user_id UUID, p_points INTEGER)
RETURNS public.profiles AS $$
DECLARE
  updated_profile public.profiles;
BEGIN
  UPDATE public.profiles
  SET ubuntu_score = ubuntu_score + p_points, contribution_count = contribution_count + 1, updated_at = NOW()
  WHERE id = p_user_id
  RETURNING * INTO updated_profile;
  RETURN updated_profile;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- GRANTS
-- ============================================================================
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;

GRANT SELECT ON public.profiles TO anon, authenticated;
GRANT INSERT, UPDATE ON public.profiles TO authenticated;

GRANT SELECT ON public.directory_listings TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.directory_listings TO authenticated;

GRANT SELECT ON public.content_submissions TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.content_submissions TO authenticated;

GRANT SELECT ON public.travel_businesses TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.travel_businesses TO authenticated;

GRANT SELECT ON public.experts TO anon, authenticated;
GRANT INSERT, UPDATE ON public.experts TO authenticated;

GRANT SELECT ON public.businesses TO anon, authenticated;
GRANT INSERT, UPDATE ON public.businesses TO authenticated;

GRANT SELECT ON public.unified_submissions TO authenticated;
GRANT INSERT, UPDATE ON public.unified_submissions TO authenticated;

GRANT SELECT ON public.ubuntu_contributions TO authenticated;
GRANT INSERT ON public.ubuntu_contributions TO authenticated;

GRANT SELECT ON public.activity_logs TO authenticated;
GRANT INSERT ON public.activity_logs TO authenticated;

GRANT SELECT ON public.verification_requests TO authenticated;
GRANT INSERT ON public.verification_requests TO authenticated;

GRANT SELECT ON public.product_subscriptions TO authenticated;

GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- ============================================================================
-- DONE
-- ============================================================================
SELECT 'Migration completed successfully!' as status;
