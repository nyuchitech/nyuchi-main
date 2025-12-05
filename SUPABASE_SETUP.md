# 🇿🇼 Supabase Setup Guide

> **Ubuntu Philosophy**: *"I am because we are"*

## Quick Setup (5 minutes)

### 1. Open Supabase Studio

Your local Supabase Studio is running at: **http://127.0.0.1:54323**

### 2. Run the Migration

1. Click on **SQL Editor** in the left sidebar
2. Click **New query**
3. Copy the entire contents of `packages/database/src/migrations/001_initial_schema.sql`
4. Paste into the SQL editor
5. Click **Run** (or press Cmd+Enter)

This will create:
- ✅ 6 database tables
- ✅ Row-Level Security (RLS) policies
- ✅ Database functions
- ✅ Triggers

### 3. Verify Tables Created

Click on **Table Editor** in the left sidebar. You should see:

- ✅ `profiles` - User profiles with Ubuntu scoring
- ✅ `directory_listings` - Community directory
- ✅ `content_submissions` - Content articles
- ✅ `ubuntu_contributions` - Contribution tracking
- ✅ `verification_requests` - Business verifications
- ✅ `product_subscriptions` - Subscription management

### 4. Create First Admin User

Run this in SQL Editor:

```sql
-- Create test admin user
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role
)
VALUES (
  gen_random_uuid(),
  'admin@nyuchi.com',
  crypt('password123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"role":"admin"}',
  false,
  'authenticated'
);

-- Get the user ID
SELECT id, email FROM auth.users WHERE email = 'admin@nyuchi.com';

-- Create profile (use the ID from above)
INSERT INTO public.profiles (
  id,
  email,
  role,
  ubuntu_score,
  contribution_count
)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'admin@nyuchi.com'),
  'admin@nyuchi.com',
  'admin',
  0,
  0
);
```

### 5. Test Backend API

```bash
# Health check
curl http://localhost:8787/health

# Ubuntu points guide
curl http://localhost:8787/api/ubuntu/points-guide

# Try directory (should work now)
curl http://localhost:8787/api/directory

# Sign in as admin
curl -X POST http://localhost:8787/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@nyuchi.com",
    "password": "password123"
  }'
```

## Database Schema

### Tables Created:

1. **profiles**
   - User profiles
   - Ubuntu scoring (points, level, count)
   - Role (user, contributor, moderator, admin)
   - Verification status

2. **directory_listings**
   - Business directory entries
   - Status workflow (draft → pending → published)
   - Verification tracking
   - Tags and categories

3. **content_submissions**
   - Articles and guides
   - Review workflow (submitted → published)
   - SEO fields
   - Ubuntu points tracking

4. **ubuntu_contributions**
   - Contribution history
   - Point calculations
   - 7 contribution types
   - Metadata tracking

5. **verification_requests**
   - Business verification requests
   - Stripe payment tracking
   - Document uploads

6. **product_subscriptions**
   - Stripe subscription tracking
   - Billing info
   - Status management

## Supabase Credentials

### Production
```bash
SUPABASE_URL=https://aqjhuyqhgmmdutwzqvyv.supabase.co
NEXT_PUBLIC_SUPABASE_URL=https://aqjhuyqhgmmdutwzqvyv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-publishable-key>
```

### Local Development

Already configured in `apps/platform/.dev.vars`:

```bash
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Troubleshooting

### Tables not showing up?
- Check for SQL errors in the migration
- Run migration in smaller chunks
- Check RLS is enabled on tables

### Can't create users?
- Make sure auth.users table exists
- Check password encryption function exists
- Verify profiles table trigger is working

### API returns 500 errors?
- Check Supabase is running: `supabase status`
- Check backend logs for specific errors
- Verify .dev.vars has correct credentials

## Next Steps

1. ✅ Migration complete
2. ✅ Admin user created
3. ✅ Backend connected
4. 🚀 Ready to test full API!

---

**🇿🇼 Nyuchi Africa** | **Ubuntu: I am because we are**
