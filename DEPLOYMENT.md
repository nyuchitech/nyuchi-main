# 🇿🇼 Nyuchi Platform - Deployment Guide

> **Ubuntu Philosophy**: *"I am because we are"*

## Overview

This guide walks you through deploying the Nyuchi Platform to production.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Vercel                                │
│                  (platform.nyuchi.com)                       │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Next.js Web Application                  │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                   Cloudflare Workers                         │
│                    (api.nyuchi.com)                          │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Hono API   │  │  AI Gateway  │  │  KV Cache    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
   ┌────▼────┐         ┌────▼────┐         ┌────▼────┐
   │ Supabase│         │  Stripe │         │ Claude  │
   │ Postgres│         │   API   │         │   API   │
   │  + Auth │         │         │         │         │
   └─────────┘         └─────────┘         └─────────┘
```

## Domain Architecture

| Domain | Service | Hosting |
|--------|---------|---------|
| `platform.nyuchi.com` | Next.js Web App | Vercel |
| `api.nyuchi.com` | Hono API (Cloudflare Worker) | Cloudflare |
| `www.nyuchi.com` | Marketing Site | Vercel (separate project) |
| `community-assets.nyuchi.com` | R2 Bucket | Cloudflare |
| `media.nyuchi.com` | R2 Bucket | Cloudflare |

## Prerequisites

### 1. Cloudflare Account

- Sign up at [cloudflare.com](https://cloudflare.com)
- Purchase Workers Paid plan ($5/month)
- Add domain to Cloudflare DNS

### 2. Supabase Project

- Sign up at [supabase.com](https://supabase.com)
- Create new project
- Note: URL, Anon Key, Service Role Key

### 3. Stripe Account

- Sign up at [stripe.com](https://stripe.com)
- Complete business verification
- Note: Secret Key, Public Key

### 4. Development Tools

```bash
# Install Node.js 20+
node --version  # v20.x.x

# Install pnpm
npm install -g pnpm

# Install Wrangler CLI
npm install -g wrangler

# Login to Cloudflare
wrangler login
```

## Step 1: Database Setup

### Run Supabase Migration

```bash
cd packages/database

# Set environment variables
export SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Run migration
psql $SUPABASE_URL -f src/migrations/001_initial_schema.sql
```

Or use Supabase Dashboard:
1. Go to SQL Editor
2. Copy contents of `packages/database/src/migrations/001_initial_schema.sql`
3. Run query

### Verify Tables

Check that these tables exist:
- `profiles`
- `directory_listings`
- `content_submissions`
- `ubuntu_contributions`
- `verification_requests`
- `product_subscriptions`

## Step 2: Stripe Configuration

### Create Products

1. **Verification Product** (One-time payment)
   - Name: "Business Verification"
   - Price: $50 USD (or your currency)
   - Note the Price ID: `price_xxxxx`

2. **Subscription Products** (Optional for Phase 2)
   - Create as needed

### Configure Webhook

1. Go to Stripe Dashboard > Developers > Webhooks
2. Add endpoint: `https://api.nyuchi.com/api/stripe/webhook`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.paid`
   - `invoice.payment_failed`
4. Note the Webhook Secret: `whsec_xxxxx`

## Step 3: Cloudflare Setup

### Create KV Namespace

```bash
wrangler kv:namespace create "CACHE"
wrangler kv:namespace create "CACHE" --preview
```

Note the namespace IDs and update `apps/platform/wrangler.toml`:
```toml
[[kv_namespaces]]
binding = "CACHE"
id = "your-namespace-id"
preview_id = "your-preview-id"
```

### Create R2 Bucket

```bash
wrangler r2 bucket create nyuchi-uploads
```

Update `apps/platform/wrangler.toml`:
```toml
[[r2_buckets]]
binding = "UPLOADS"
bucket_name = "nyuchi-uploads"
```

### Configure AI Gateway

1. Go to Cloudflare Dashboard > AI > AI Gateway
2. Create new gateway: "nyuchi-ai"
3. Add Claude provider
4. Note the endpoint URL

## Step 4: Configure Secrets

```bash
cd apps/platform

# Supabase
wrangler secret put SUPABASE_URL
# Enter: https://your-project.supabase.co

wrangler secret put SUPABASE_ANON_KEY
# Enter: your-anon-key

wrangler secret put SUPABASE_SERVICE_ROLE_KEY
# Enter: your-service-role-key

# Stripe
wrangler secret put STRIPE_SECRET_KEY
# Enter: sk_live_xxxxx

wrangler secret put STRIPE_PUBLIC_KEY
# Enter: pk_live_xxxxx

wrangler secret put STRIPE_WEBHOOK_SECRET
# Enter: whsec_xxxxx

wrangler secret put STRIPE_VERIFICATION_PRICE_ID
# Enter: price_xxxxx

# Claude AI
wrangler secret put CLOUDFLARE_AI_GATEWAY_ENDPOINT
# Enter: https://gateway.ai.cloudflare.com/v1/your-account/nyuchi-ai/anthropic
```

## Step 5: Install Dependencies

```bash
# From root
pnpm install

# Build all packages
pnpm build
```

## Step 6: Deploy

```bash
cd apps/platform

# Deploy to production
wrangler deploy --env production
```

### Verify Deployment

```bash
# Health check
curl https://api.nyuchi.com/health

# Expected response:
{
  "status": "healthy",
  "timestamp": "2025-01-15T10:30:00.000Z",
  "environment": "production",
  "ubuntu": "I am because we are"
}
```

## Step 7: Configure Custom Domain

### Update DNS

In Cloudflare DNS:
```
Type: CNAME
Name: api
Target: nyuchi-api.workers.dev
Proxy: Enabled (orange cloud)

Type: CNAME
Name: platform
Target: cname.vercel-dns.com
Proxy: Off (gray cloud - required for Vercel)
```

### Update wrangler.toml

```toml
[env.production]
name = "nyuchi-api"
routes = [
  { pattern = "api.nyuchi.com/*", zone_name = "nyuchi.com" }
]
```

### Redeploy

```bash
wrangler deploy --env production
```

## Step 8: Test Production

### Test Authentication

```bash
# Sign up
curl -X POST https://api.nyuchi.com/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePassword123!",
    "name": "Test User"
  }'
```

### Test Directory

```bash
# List directory (public)
curl https://api.nyuchi.com/api/directory
```

### Test Ubuntu

```bash
# Get leaderboard (public)
curl https://api.nyuchi.com/api/ubuntu/leaderboard
```

### Test Stripe

```bash
# Get products (public)
curl https://api.nyuchi.com/api/stripe/products
```

## Step 9: Admin Setup

### Create Admin User

1. Sign up a user via API or Supabase Dashboard
2. Update user role in Supabase:

```sql
UPDATE profiles
SET role = 'admin'
WHERE email = 'admin@nyuchi.com';
```

### Test Admin Access

```bash
# Sign in as admin
curl -X POST https://api.nyuchi.com/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@nyuchi.com",
    "password": "your-password"
  }'

# Use token to access admin stats
curl https://api.nyuchi.com/api/admin/stats \
  -H "Authorization: Bearer <token>"
```

## Step 10: Monitoring

### View Logs

```bash
wrangler tail
```

### View Analytics

1. Go to Cloudflare Dashboard
2. Select Workers & Pages
3. Click on `nyuchi-platform`
4. View metrics:
   - Requests
   - Errors
   - CPU time
   - Duration

### Set Up Alerts

1. Go to Notifications in Cloudflare Dashboard
2. Create alerts for:
   - Error rate threshold
   - High CPU usage
   - Request rate spikes

## Troubleshooting

### Issue: 404 on all routes

**Solution**: Check `wrangler.toml` routes configuration and DNS settings

### Issue: Database connection errors

**Solution**: Verify Supabase secrets are correct:
```bash
wrangler secret list
```

### Issue: Stripe webhook not working

**Solution**:
1. Verify webhook endpoint URL in Stripe Dashboard
2. Check webhook secret is correct
3. Test webhook with Stripe CLI:
```bash
stripe trigger checkout.session.completed
```

### Issue: AI requests failing

**Solution**: Verify AI Gateway endpoint and check AI Gateway logs in Cloudflare Dashboard

## Rollback

If deployment fails:

```bash
# List deployments
wrangler deployments list

# Rollback to previous
wrangler rollback --message "Rolling back to previous version"
```

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `SUPABASE_URL` | Supabase project URL | `https://xxx.supabase.co` |
| `SUPABASE_ANON_KEY` | Supabase anon key | `eyJhbG...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | `eyJhbG...` |
| `STRIPE_SECRET_KEY` | Stripe secret key | `sk_live_...` |
| `STRIPE_PUBLIC_KEY` | Stripe publishable key | `pk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret | `whsec_...` |
| `STRIPE_VERIFICATION_PRICE_ID` | Verification price ID | `price_...` |
| `CLOUDFLARE_AI_GATEWAY_ENDPOINT` | AI Gateway endpoint | `https://gateway...` |

## Security Checklist

- [ ] All secrets configured via `wrangler secret`
- [ ] Supabase RLS policies enabled
- [ ] Stripe webhook signature verification enabled
- [ ] CORS configured for allowed origins only
- [ ] Rate limiting configured (Cloudflare WAF)
- [ ] HTTPS enforced on all endpoints
- [ ] Admin users created with strong passwords
- [ ] Database backups enabled (Supabase)

## Production URLs

- **Frontend**: https://platform.nyuchi.com (Vercel)
- **API**: https://api.nyuchi.com (Cloudflare Worker)
- **Health**: https://api.nyuchi.com/health
- **Docs**: https://api.nyuchi.com/api/docs

## Support

For deployment issues:
- GitHub: [anthropics/claude-code/issues](https://github.com/anthropics/claude-code/issues)
- Cloudflare Docs: [developers.cloudflare.com/workers](https://developers.cloudflare.com/workers)
- Supabase Docs: [supabase.com/docs](https://supabase.com/docs)

---

**🇿🇼 Nyuchi Africa** | **🟠 Ubuntu Philosophy** | **⚡ Production Ready**

*"I am because we are"*
