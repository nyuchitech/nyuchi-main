-- ============================================================================
-- Nyuchi Platform - Complete Database Schema
-- "I am because we are" - Ubuntu philosophy embedded in data structure
--
-- This is the single source of truth for the Nyuchi Platform database.
-- Run this script to set up the complete database schema.
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For fuzzy text search

-- ============================================================================
-- ENUM TYPES
-- ============================================================================

-- User roles (primary role)
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('user', 'contributor', 'moderator', 'reviewer', 'admin');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- User capabilities (multiple can be assigned)
DO $$ BEGIN
  CREATE TYPE user_capability AS ENUM ('contributor', 'expert', 'business_owner', 'moderator', 'reviewer', 'admin');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Submission types for unified pipeline
DO $$ BEGIN
  CREATE TYPE submission_type AS ENUM ('content', 'expert_application', 'business_application', 'directory_listing', 'travel_business');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Pipeline status (unified across all submission types)
DO $$ BEGIN
  CREATE TYPE pipeline_status AS ENUM ('draft', 'submitted', 'in_review', 'needs_changes', 'approved', 'rejected', 'published');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Listing status
DO $$ BEGIN
  CREATE TYPE listing_status AS ENUM ('draft', 'pending', 'approved', 'rejected', 'published');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Content status
DO $$ BEGIN
  CREATE TYPE content_status AS ENUM ('draft', 'submitted', 'reviewing', 'approved', 'rejected', 'published');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Verification status
DO $$ BEGIN
  CREATE TYPE verification_status AS ENUM ('none', 'pending', 'approved', 'rejected');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Subscription status
DO $$ BEGIN
  CREATE TYPE subscription_status AS ENUM ('active', 'canceled', 'past_due', 'trialing', 'incomplete');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Application status (for experts and businesses)
DO $$ BEGIN
  CREATE TYPE application_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Listing type (for business partners)
DO $$ BEGIN
  CREATE TYPE listing_type AS ENUM ('free', 'verified', 'premium');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Expert category
DO $$ BEGIN
  CREATE TYPE expert_category AS ENUM ('safari_guide', 'cultural_specialist', 'adventure_guide', 'urban_guide', 'photography_guide', 'bird_guide');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================================
-- PROFILES TABLE (extends auth.users)
-- Ubuntu: Every person is valuable and contributes to the community
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
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- RLS policies for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Public profiles are viewable" ON public.profiles;
CREATE POLICY "Public profiles are viewable"
  ON public.profiles FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Indexes for profiles
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_ubuntu_score ON public.profiles(ubuntu_score DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_capabilities ON public.profiles USING GIN(capabilities);

-- ============================================================================
-- DIRECTORY LISTINGS TABLE
-- Ubuntu: Community directory - share resources freely
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.directory_listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- RLS policies for directory listings
ALTER TABLE public.directory_listings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view published listings" ON public.directory_listings;
CREATE POLICY "Anyone can view published listings"
  ON public.directory_listings FOR SELECT
  USING (status = 'published');

DROP POLICY IF EXISTS "Users can view own listings" ON public.directory_listings;
CREATE POLICY "Users can view own listings"
  ON public.directory_listings FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create listings" ON public.directory_listings;
CREATE POLICY "Users can create listings"
  ON public.directory_listings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own listings" ON public.directory_listings;
CREATE POLICY "Users can update own listings"
  ON public.directory_listings FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Moderators can view all listings" ON public.directory_listings;
CREATE POLICY "Moderators can view all listings"
  ON public.directory_listings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND (role IN ('moderator', 'admin') OR 'moderator' = ANY(capabilities) OR 'admin' = ANY(capabilities))
    )
  );

DROP POLICY IF EXISTS "Moderators can update all listings" ON public.directory_listings;
CREATE POLICY "Moderators can update all listings"
  ON public.directory_listings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND (role IN ('moderator', 'admin') OR 'moderator' = ANY(capabilities) OR 'admin' = ANY(capabilities))
    )
  );

-- Indexes for directory listings
CREATE INDEX IF NOT EXISTS idx_directory_user_id ON public.directory_listings(user_id);
CREATE INDEX IF NOT EXISTS idx_directory_status ON public.directory_listings(status);
CREATE INDEX IF NOT EXISTS idx_directory_category ON public.directory_listings(category);
CREATE INDEX IF NOT EXISTS idx_directory_country ON public.directory_listings(country);
CREATE INDEX IF NOT EXISTS idx_directory_verification ON public.directory_listings(verification_status);

-- ============================================================================
-- CONTENT SUBMISSIONS TABLE
-- Ubuntu: Share knowledge freely with the community
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.content_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- RLS policies for content submissions
ALTER TABLE public.content_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view published content" ON public.content_submissions;
CREATE POLICY "Anyone can view published content"
  ON public.content_submissions FOR SELECT
  USING (status = 'published');

DROP POLICY IF EXISTS "Users can view own submissions" ON public.content_submissions;
CREATE POLICY "Users can view own submissions"
  ON public.content_submissions FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create submissions" ON public.content_submissions;
CREATE POLICY "Users can create submissions"
  ON public.content_submissions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own submissions" ON public.content_submissions;
CREATE POLICY "Users can update own submissions"
  ON public.content_submissions FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Moderators can view all submissions" ON public.content_submissions;
CREATE POLICY "Moderators can view all submissions"
  ON public.content_submissions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND (role IN ('moderator', 'admin') OR 'moderator' = ANY(capabilities) OR 'admin' = ANY(capabilities))
    )
  );

DROP POLICY IF EXISTS "Moderators can update all submissions" ON public.content_submissions;
CREATE POLICY "Moderators can update all submissions"
  ON public.content_submissions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND (role IN ('moderator', 'admin') OR 'moderator' = ANY(capabilities) OR 'admin' = ANY(capabilities))
    )
  );

-- Indexes for content submissions
CREATE INDEX IF NOT EXISTS idx_content_user_id ON public.content_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_content_status ON public.content_submissions(status);
CREATE INDEX IF NOT EXISTS idx_content_slug ON public.content_submissions(slug);
CREATE INDEX IF NOT EXISTS idx_content_category ON public.content_submissions(category);
CREATE INDEX IF NOT EXISTS idx_content_published_at ON public.content_submissions(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_content_search ON public.content_submissions
  USING GIN(to_tsvector('english', title || ' ' || content));

-- ============================================================================
-- TRAVEL BUSINESSES TABLE
-- Ubuntu: Connect travelers with local businesses
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.travel_businesses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- RLS policies for travel businesses
ALTER TABLE public.travel_businesses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view published travel businesses" ON public.travel_businesses;
CREATE POLICY "Anyone can view published travel businesses"
  ON public.travel_businesses FOR SELECT
  USING (status = 'published');

DROP POLICY IF EXISTS "Owners can view own travel business" ON public.travel_businesses;
CREATE POLICY "Owners can view own travel business"
  ON public.travel_businesses FOR SELECT
  USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Owners can create travel business" ON public.travel_businesses;
CREATE POLICY "Owners can create travel business"
  ON public.travel_businesses FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Owners can update own travel business" ON public.travel_businesses;
CREATE POLICY "Owners can update own travel business"
  ON public.travel_businesses FOR UPDATE
  USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Reviewers can view all travel businesses" ON public.travel_businesses;
CREATE POLICY "Reviewers can view all travel businesses"
  ON public.travel_businesses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND (role IN ('reviewer', 'admin') OR 'reviewer' = ANY(capabilities) OR 'admin' = ANY(capabilities))
    )
  );

DROP POLICY IF EXISTS "Reviewers can update travel businesses" ON public.travel_businesses;
CREATE POLICY "Reviewers can update travel businesses"
  ON public.travel_businesses FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND (role IN ('reviewer', 'admin') OR 'reviewer' = ANY(capabilities) OR 'admin' = ANY(capabilities))
    )
  );

-- Indexes for travel businesses
CREATE INDEX IF NOT EXISTS idx_travel_business_owner_id ON public.travel_businesses(owner_id);
CREATE INDEX IF NOT EXISTS idx_travel_business_status ON public.travel_businesses(status);
CREATE INDEX IF NOT EXISTS idx_travel_business_country ON public.travel_businesses(country);
CREATE INDEX IF NOT EXISTS idx_travel_business_type ON public.travel_businesses(business_type);

-- ============================================================================
-- EXPERTS TABLE (ZTI Local Experts)
-- Ubuntu: Local expertise serves the community
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.experts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  location TEXT NOT NULL,
  category expert_category NOT NULL,
  years_experience TEXT NOT NULL,
  certifications TEXT NOT NULL,
  languages TEXT NOT NULL,
  services TEXT NOT NULL,
  bio TEXT,
  motivation TEXT,
  website TEXT,
  profile_image TEXT,
  status application_status DEFAULT 'pending' NOT NULL,
  verified BOOLEAN DEFAULT FALSE NOT NULL,
  featured BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- RLS policies for experts
ALTER TABLE public.experts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view approved experts" ON public.experts;
CREATE POLICY "Anyone can view approved experts"
  ON public.experts FOR SELECT
  USING (status = 'approved');

DROP POLICY IF EXISTS "Users can view own expert application" ON public.experts;
CREATE POLICY "Users can view own expert application"
  ON public.experts FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Authenticated users can apply as expert" ON public.experts;
CREATE POLICY "Authenticated users can apply as expert"
  ON public.experts FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can update own expert application" ON public.experts;
CREATE POLICY "Users can update own expert application"
  ON public.experts FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Reviewers can view all experts" ON public.experts;
CREATE POLICY "Reviewers can view all experts"
  ON public.experts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND (role IN ('reviewer', 'admin') OR 'reviewer' = ANY(capabilities) OR 'admin' = ANY(capabilities))
    )
  );

DROP POLICY IF EXISTS "Reviewers can update experts" ON public.experts;
CREATE POLICY "Reviewers can update experts"
  ON public.experts FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND (role IN ('reviewer', 'admin') OR 'reviewer' = ANY(capabilities) OR 'admin' = ANY(capabilities))
    )
  );

-- Indexes for experts
CREATE INDEX IF NOT EXISTS idx_experts_status ON public.experts(status);
CREATE INDEX IF NOT EXISTS idx_experts_category ON public.experts(category);
CREATE INDEX IF NOT EXISTS idx_experts_location ON public.experts(location);
CREATE INDEX IF NOT EXISTS idx_experts_user_id ON public.experts(user_id);
CREATE INDEX IF NOT EXISTS idx_experts_featured ON public.experts(featured) WHERE featured = TRUE;

-- ============================================================================
-- BUSINESSES TABLE (ZTI Business Partners)
-- Ubuntu: Businesses serve the community
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.businesses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  business_name TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  website TEXT,
  category TEXT NOT NULL,
  subcategory TEXT,
  location TEXT NOT NULL,
  description TEXT NOT NULL,
  target_travelers TEXT,
  listing_type listing_type DEFAULT 'free' NOT NULL,
  promotion_interest BOOLEAN DEFAULT FALSE NOT NULL,
  status application_status DEFAULT 'pending' NOT NULL,
  verified BOOLEAN DEFAULT FALSE NOT NULL,
  featured BOOLEAN DEFAULT FALSE NOT NULL,
  logo_url TEXT,
  images TEXT[] DEFAULT ARRAY[]::TEXT[],
  amenities TEXT[] DEFAULT ARRAY[]::TEXT[],
  price_range TEXT,
  rating DECIMAL(3,2),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- RLS policies for businesses
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view approved businesses" ON public.businesses;
CREATE POLICY "Anyone can view approved businesses"
  ON public.businesses FOR SELECT
  USING (status = 'approved');

DROP POLICY IF EXISTS "Users can view own business application" ON public.businesses;
CREATE POLICY "Users can view own business application"
  ON public.businesses FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Authenticated users can register business" ON public.businesses;
CREATE POLICY "Authenticated users can register business"
  ON public.businesses FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can update own business application" ON public.businesses;
CREATE POLICY "Users can update own business application"
  ON public.businesses FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Reviewers can view all businesses" ON public.businesses;
CREATE POLICY "Reviewers can view all businesses"
  ON public.businesses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND (role IN ('reviewer', 'admin') OR 'reviewer' = ANY(capabilities) OR 'admin' = ANY(capabilities))
    )
  );

DROP POLICY IF EXISTS "Reviewers can update businesses" ON public.businesses;
CREATE POLICY "Reviewers can update businesses"
  ON public.businesses FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND (role IN ('reviewer', 'admin') OR 'reviewer' = ANY(capabilities) OR 'admin' = ANY(capabilities))
    )
  );

-- Indexes for businesses
CREATE INDEX IF NOT EXISTS idx_businesses_status ON public.businesses(status);
CREATE INDEX IF NOT EXISTS idx_businesses_category ON public.businesses(category);
CREATE INDEX IF NOT EXISTS idx_businesses_location ON public.businesses(location);
CREATE INDEX IF NOT EXISTS idx_businesses_user_id ON public.businesses(user_id);
CREATE INDEX IF NOT EXISTS idx_businesses_featured ON public.businesses(featured) WHERE featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_businesses_listing_type ON public.businesses(listing_type);

-- ============================================================================
-- UNIFIED SUBMISSIONS TABLE
-- Ubuntu: Unified view of all community contributions
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.unified_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- RLS policies for unified submissions
ALTER TABLE public.unified_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own submissions" ON public.unified_submissions;
CREATE POLICY "Users can view own submissions"
  ON public.unified_submissions FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create submissions" ON public.unified_submissions;
CREATE POLICY "Users can create submissions"
  ON public.unified_submissions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own draft submissions" ON public.unified_submissions;
CREATE POLICY "Users can update own draft submissions"
  ON public.unified_submissions FOR UPDATE
  USING (auth.uid() = user_id AND status = 'draft');

DROP POLICY IF EXISTS "Staff can view assigned submissions" ON public.unified_submissions;
CREATE POLICY "Staff can view assigned submissions"
  ON public.unified_submissions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND (
        role IN ('moderator', 'reviewer', 'admin') OR
        'moderator' = ANY(capabilities) OR
        'reviewer' = ANY(capabilities) OR
        'admin' = ANY(capabilities)
      )
    )
  );

DROP POLICY IF EXISTS "Staff can update submissions" ON public.unified_submissions;
CREATE POLICY "Staff can update submissions"
  ON public.unified_submissions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND (
        role IN ('moderator', 'reviewer', 'admin') OR
        'moderator' = ANY(capabilities) OR
        'reviewer' = ANY(capabilities) OR
        'admin' = ANY(capabilities)
      )
    )
  );

-- Indexes for unified submissions
CREATE INDEX IF NOT EXISTS idx_unified_submissions_user_id ON public.unified_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_unified_submissions_status ON public.unified_submissions(status);
CREATE INDEX IF NOT EXISTS idx_unified_submissions_type ON public.unified_submissions(submission_type);
CREATE INDEX IF NOT EXISTS idx_unified_submissions_assigned_to ON public.unified_submissions(assigned_to);
CREATE INDEX IF NOT EXISTS idx_unified_submissions_reference ON public.unified_submissions(reference_id);
CREATE INDEX IF NOT EXISTS idx_unified_submissions_created ON public.unified_submissions(created_at DESC);

-- ============================================================================
-- UBUNTU CONTRIBUTIONS TABLE
-- Ubuntu: Track Ubuntu philosophy in action
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.ubuntu_contributions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  contribution_type TEXT NOT NULL,
  contribution_details TEXT,
  ubuntu_points_earned INTEGER NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- RLS policies for ubuntu contributions
ALTER TABLE public.ubuntu_contributions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own contributions" ON public.ubuntu_contributions;
CREATE POLICY "Users can view own contributions"
  ON public.ubuntu_contributions FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can insert contributions" ON public.ubuntu_contributions;
CREATE POLICY "System can insert contributions"
  ON public.ubuntu_contributions FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view all contributions" ON public.ubuntu_contributions;
CREATE POLICY "Admins can view all contributions"
  ON public.ubuntu_contributions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND (role = 'admin' OR 'admin' = ANY(capabilities))
    )
  );

-- Indexes for ubuntu contributions
CREATE INDEX IF NOT EXISTS idx_ubuntu_user_id ON public.ubuntu_contributions(user_id);
CREATE INDEX IF NOT EXISTS idx_ubuntu_type ON public.ubuntu_contributions(contribution_type);
CREATE INDEX IF NOT EXISTS idx_ubuntu_created_at ON public.ubuntu_contributions(created_at DESC);

-- ============================================================================
-- VERIFICATION REQUESTS TABLE
-- Ubuntu: Trust through transparency
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.verification_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- RLS policies for verification requests
ALTER TABLE public.verification_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own verification requests" ON public.verification_requests;
CREATE POLICY "Users can view own verification requests"
  ON public.verification_requests FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create verification requests" ON public.verification_requests;
CREATE POLICY "Users can create verification requests"
  ON public.verification_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Moderators can view all verification requests" ON public.verification_requests;
CREATE POLICY "Moderators can view all verification requests"
  ON public.verification_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND (role IN ('moderator', 'admin') OR 'moderator' = ANY(capabilities) OR 'admin' = ANY(capabilities))
    )
  );

DROP POLICY IF EXISTS "Moderators can update verification requests" ON public.verification_requests;
CREATE POLICY "Moderators can update verification requests"
  ON public.verification_requests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND (role IN ('moderator', 'admin') OR 'moderator' = ANY(capabilities) OR 'admin' = ANY(capabilities))
    )
  );

-- Indexes for verification requests
CREATE INDEX IF NOT EXISTS idx_verification_user_id ON public.verification_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_listing_id ON public.verification_requests(listing_id);
CREATE INDEX IF NOT EXISTS idx_verification_status ON public.verification_requests(status);

-- ============================================================================
-- PRODUCT SUBSCRIPTIONS TABLE
-- Ubuntu: Support the platform that supports you
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.product_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- RLS policies for subscriptions
ALTER TABLE public.product_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own subscriptions" ON public.product_subscriptions;
CREATE POLICY "Users can view own subscriptions"
  ON public.product_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all subscriptions" ON public.product_subscriptions;
CREATE POLICY "Admins can view all subscriptions"
  ON public.product_subscriptions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND (role = 'admin' OR 'admin' = ANY(capabilities))
    )
  );

-- Indexes for subscriptions
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.product_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_id ON public.product_subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.product_subscriptions(status);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to all relevant tables
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_directory_updated_at ON public.directory_listings;
CREATE TRIGGER update_directory_updated_at BEFORE UPDATE ON public.directory_listings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_content_updated_at ON public.content_submissions;
CREATE TRIGGER update_content_updated_at BEFORE UPDATE ON public.content_submissions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_verification_updated_at ON public.verification_requests;
CREATE TRIGGER update_verification_updated_at BEFORE UPDATE ON public.verification_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON public.product_subscriptions;
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.product_subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_travel_businesses_updated_at ON public.travel_businesses;
CREATE TRIGGER update_travel_businesses_updated_at BEFORE UPDATE ON public.travel_businesses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_experts_updated_at ON public.experts;
CREATE TRIGGER update_experts_updated_at BEFORE UPDATE ON public.experts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_businesses_updated_at ON public.businesses;
CREATE TRIGGER update_businesses_updated_at BEFORE UPDATE ON public.businesses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_unified_submissions_updated_at ON public.unified_submissions;
CREATE TRIGGER update_unified_submissions_updated_at BEFORE UPDATE ON public.unified_submissions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to handle new user signups (auto-create profile)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, capabilities)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'user'),
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

-- Function to increment Ubuntu score
CREATE OR REPLACE FUNCTION increment_ubuntu_score(p_user_id UUID, p_points INTEGER)
RETURNS public.profiles AS $$
DECLARE
  updated_profile public.profiles;
BEGIN
  UPDATE public.profiles
  SET
    ubuntu_score = ubuntu_score + p_points,
    contribution_count = contribution_count + 1,
    updated_at = NOW()
  WHERE id = p_user_id
  RETURNING * INTO updated_profile;

  RETURN updated_profile;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get top contributors (leaderboard)
CREATE OR REPLACE FUNCTION get_top_contributors(p_limit INTEGER DEFAULT 50)
RETURNS TABLE(user_id UUID, total_points BIGINT, contribution_count BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT
    uc.user_id,
    SUM(uc.ubuntu_points_earned)::BIGINT as total_points,
    COUNT(*)::BIGINT as contribution_count
  FROM public.ubuntu_contributions uc
  GROUP BY uc.user_id
  ORDER BY total_points DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create unified submission when content/expert/business is created
CREATE OR REPLACE FUNCTION create_unified_submission()
RETURNS TRIGGER AS $$
DECLARE
  v_submission_type submission_type;
  v_user_id UUID;
  v_title TEXT;
  v_description TEXT;
BEGIN
  -- Determine submission type and extract fields based on table
  IF TG_TABLE_NAME = 'content_submissions' THEN
    v_submission_type := 'content';
    v_user_id := NEW.user_id;
    v_title := NEW.title;
    v_description := LEFT(NEW.content, 200);
  ELSIF TG_TABLE_NAME = 'experts' THEN
    v_submission_type := 'expert_application';
    v_user_id := NEW.user_id;
    v_title := NEW.full_name || ' - ' || NEW.category::TEXT;
    v_description := NEW.bio;
  ELSIF TG_TABLE_NAME = 'businesses' THEN
    v_submission_type := 'business_application';
    v_user_id := NEW.user_id;
    v_title := NEW.business_name;
    v_description := NEW.description;
  ELSIF TG_TABLE_NAME = 'directory_listings' THEN
    v_submission_type := 'directory_listing';
    v_user_id := NEW.user_id;
    v_title := NEW.business_name;
    v_description := NEW.description;
  ELSIF TG_TABLE_NAME = 'travel_businesses' THEN
    v_submission_type := 'travel_business';
    v_user_id := NEW.owner_id;
    v_title := NEW.business_name;
    v_description := NEW.description;
  ELSE
    RETURN NEW;
  END IF;

  -- Only create if user_id is set
  IF v_user_id IS NOT NULL THEN
    INSERT INTO public.unified_submissions (
      user_id,
      submission_type,
      reference_id,
      title,
      description,
      status,
      submitted_at
    ) VALUES (
      v_user_id,
      v_submission_type,
      NEW.id,
      v_title,
      v_description,
      'submitted',
      NOW()
    )
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers to auto-create unified submissions
DROP TRIGGER IF EXISTS create_unified_submission_content ON public.content_submissions;
CREATE TRIGGER create_unified_submission_content
  AFTER INSERT ON public.content_submissions
  FOR EACH ROW
  WHEN (NEW.status = 'submitted')
  EXECUTE FUNCTION create_unified_submission();

DROP TRIGGER IF EXISTS create_unified_submission_expert ON public.experts;
CREATE TRIGGER create_unified_submission_expert
  AFTER INSERT ON public.experts
  FOR EACH ROW EXECUTE FUNCTION create_unified_submission();

DROP TRIGGER IF EXISTS create_unified_submission_business ON public.businesses;
CREATE TRIGGER create_unified_submission_business
  AFTER INSERT ON public.businesses
  FOR EACH ROW EXECUTE FUNCTION create_unified_submission();

DROP TRIGGER IF EXISTS create_unified_submission_directory ON public.directory_listings;
CREATE TRIGGER create_unified_submission_directory
  AFTER INSERT ON public.directory_listings
  FOR EACH ROW
  WHEN (NEW.status = 'pending')
  EXECUTE FUNCTION create_unified_submission();

DROP TRIGGER IF EXISTS create_unified_submission_travel ON public.travel_businesses;
CREATE TRIGGER create_unified_submission_travel
  AFTER INSERT ON public.travel_businesses
  FOR EACH ROW
  WHEN (NEW.status = 'pending')
  EXECUTE FUNCTION create_unified_submission();

-- Function to add capability to user
CREATE OR REPLACE FUNCTION add_user_capability(p_user_id UUID, p_capability user_capability)
RETURNS public.profiles AS $$
DECLARE
  updated_profile public.profiles;
BEGIN
  UPDATE public.profiles
  SET
    capabilities = array_append(capabilities, p_capability),
    updated_at = NOW()
  WHERE id = p_user_id
    AND NOT (p_capability = ANY(capabilities))
  RETURNING * INTO updated_profile;

  RETURN updated_profile;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to remove capability from user
CREATE OR REPLACE FUNCTION remove_user_capability(p_user_id UUID, p_capability user_capability)
RETURNS public.profiles AS $$
DECLARE
  updated_profile public.profiles;
BEGIN
  UPDATE public.profiles
  SET
    capabilities = array_remove(capabilities, p_capability),
    updated_at = NOW()
  WHERE id = p_user_id
  RETURNING * INTO updated_profile;

  RETURN updated_profile;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- GRANTS
-- ============================================================================

-- Schema access
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;

-- Table grants for authenticated users
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

GRANT SELECT ON public.verification_requests TO authenticated;
GRANT INSERT ON public.verification_requests TO authenticated;

GRANT SELECT ON public.product_subscriptions TO authenticated;

-- Service role gets full access
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- ============================================================================
-- COMMENTS (Ubuntu Philosophy)
-- ============================================================================
COMMENT ON TABLE public.profiles IS 'User profiles - Ubuntu: I am because we are. Every person is valuable.';
COMMENT ON TABLE public.directory_listings IS 'Community business directory - Ubuntu: Share resources freely with the community.';
COMMENT ON TABLE public.content_submissions IS 'Community content hub - Ubuntu: Knowledge belongs to everyone.';
COMMENT ON TABLE public.travel_businesses IS 'Travel business directory - Ubuntu: Connect travelers with local communities.';
COMMENT ON TABLE public.experts IS 'Local experts directory - Ubuntu: Local expertise serves the whole community.';
COMMENT ON TABLE public.businesses IS 'Business partner directory - Ubuntu: Businesses thrive when they serve the community.';
COMMENT ON TABLE public.unified_submissions IS 'Unified pipeline - Ubuntu: Every contribution matters and deserves attention.';
COMMENT ON TABLE public.ubuntu_contributions IS 'Ubuntu points tracking - Ubuntu: Celebrate and recognize community contributions.';
COMMENT ON TABLE public.verification_requests IS 'Verification process - Ubuntu: Trust through transparency and accountability.';
COMMENT ON TABLE public.product_subscriptions IS 'Subscriptions - Ubuntu: Support the platform that supports your community.';

COMMENT ON FUNCTION public.handle_new_user() IS 'Automatically creates profile for new users - Ubuntu: Welcome everyone to the community.';
COMMENT ON FUNCTION increment_ubuntu_score(UUID, INTEGER) IS 'Award Ubuntu points for contributions - Ubuntu: Recognize those who give.';
COMMENT ON FUNCTION get_top_contributors(INTEGER) IS 'Get community leaderboard - Ubuntu: Celebrate community champions.';
COMMENT ON FUNCTION add_user_capability(UUID, user_capability) IS 'Grant user capability - Ubuntu: Empower community members.';
COMMENT ON FUNCTION remove_user_capability(UUID, user_capability) IS 'Remove user capability - Ubuntu: Maintain trust and responsibility.';
