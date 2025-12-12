# Deployment Guide

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│                      Vercel                               │
│               platform.nyuchi.com                         │
│         ┌────────────────────────────┐                   │
│         │  Next.js (@nyuchi/web)     │                   │
│         └────────────────────────────┘                   │
└──────────────────────────────────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────────┐
│                 Cloudflare Workers                        │
│                  api.nyuchi.com                           │
│         ┌────────────────────────────┐                   │
│         │ Hono API (@nyuchi/platform)│                   │
│         └────────────────────────────┘                   │
└──────────────────────────────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        ▼                 ▼                 ▼
   ┌─────────┐      ┌─────────┐      ┌─────────┐
   │Supabase │      │ Stripe  │      │   R2    │
   │Postgres │      │   API   │      │ Storage │
   └─────────┘      └─────────┘      └─────────┘
```

## Prerequisites

- Node.js 22.x
- npm 10+
- Cloudflare account (Workers Paid plan)
- Supabase project
- Stripe account
- Vercel account

## Quick Deploy

### 1. Install Dependencies

```bash
npm install
npm run build
```

### 2. Deploy API (Cloudflare Workers)

```bash
cd cloudflare

# Configure secrets (first time only)
wrangler secret put SUPABASE_URL
wrangler secret put SUPABASE_ANON_KEY
wrangler secret put SUPABASE_SERVICE_ROLE_KEY
wrangler secret put STRIPE_SECRET_KEY
wrangler secret put STRIPE_WEBHOOK_SECRET

# Deploy
wrangler deploy --env production
```

### 3. Deploy Frontend (Vercel)

Connect GitHub repo to Vercel with these settings:
- **Root Directory**: (leave blank - monorepo root)
- **Build Command**: `npx turbo run build --filter=@nyuchi/web...`
- **Output Directory**: `apps/platform/.next`
- **Install Command**: `npm install`

Environment variables in Vercel:
```
NEXT_PUBLIC_SUPABASE_URL=https://aqjhuyqhgmmdutwzqvyv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-key>
NEXT_PUBLIC_API_URL=https://api.nyuchi.com
```

## Cloudflare Configuration

### wrangler.toml (`cloudflare/wrangler.toml`)

```toml
name = "nyuchi-platform"
main = "src/index.ts"
compatibility_date = "2024-01-01"
compatibility_flags = ["nodejs_compat"]

[env.production]
name = "nyuchi-api"
routes = [
  { pattern = "api.nyuchi.com", zone_name = "nyuchi.com" }
]
```

### KV Namespace (optional)

```bash
wrangler kv:namespace create "CACHE"
```

Update `cloudflare/wrangler.toml` with the ID.

### R2 Bucket

```bash
wrangler r2 bucket create nyuchi-uploads
```

## DNS Configuration

| Type | Name | Target | Proxy |
|------|------|--------|-------|
| CNAME | platform | cname.vercel-dns.com | Off |
| CNAME | api | (Worker route) | On |
| CNAME | www | cname.vercel-dns.com | Off |

## GitHub Actions

CI/CD runs automatically via `.github/workflows/deploy.yml`:

1. **Test & Build** - Runs on all pushes/PRs
2. **Deploy Preview** - PRs get preview URLs
3. **Deploy Production** - Merges to main auto-deploy

Required secrets in GitHub:
- `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`
- `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`
- `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`

## Verify Deployment

```bash
# API health check
curl https://api.nyuchi.com/health

# Frontend
open https://platform.nyuchi.com
```

## Rollback

```bash
cd cloudflare
wrangler deployments list
wrangler rollback
```

## Troubleshooting

**Build fails**: Check `npm run build` locally first

**API 404s**: Verify `wrangler.toml` routes and DNS

**Auth errors**: Check Supabase secrets are set correctly

**CORS issues**: API allows `platform.nyuchi.com`, `localhost:3000`
