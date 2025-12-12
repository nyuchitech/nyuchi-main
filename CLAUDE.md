# CLAUDE.md - Project Context for AI Assistants

> **Ubuntu Philosophy**: *"I am because we are"*

This file provides context for AI assistants (Claude, Copilot, etc.) working on the Nyuchi Africa Platform.

## Project Overview

Nyuchi Africa Platform is a community-focused business platform for African entrepreneurship, built with Ubuntu philosophy at its core.

## Domain Architecture

| Domain | Service | Hosting | Source |
|--------|---------|---------|--------|
| `platform.nyuchi.com` | Next.js Web App | Vercel (nyuchi-platform) | `apps/platform` |
| `api.nyuchi.com` | Hono API | Cloudflare Worker | `cloudflare/` |
| `www.nyuchi.com` | Marketing Site | Vercel (nyuchi-marketing) | `marketing-site/` |
| `community-assets.nyuchi.com` | R2 Bucket | Cloudflare | - |
| `media.nyuchi.com` | R2 Bucket | Cloudflare | - |

## Tech Stack

- **Frontend**: Next.js 15 on Vercel (`platform.nyuchi.com`)
- **Backend API**: Hono on Cloudflare Workers (`api.nyuchi.com`)
- **Database**: Supabase Postgres (`https://aqjhuyqhgmmdutwzqvyv.supabase.co`)
- **Auth**: Supabase Auth
- **Storage**: Cloudflare R2
- **Payments**: Stripe
- **AI**: Claude via Cloudflare AI Gateway

## Monorepo Structure

```
├── cloudflare/        # Hono API → api.nyuchi.com (Cloudflare Worker)
├── apps/
│   └── platform/      # Next.js frontend → platform.nyuchi.com (Vercel)
│       └── admin/     # Admin section at /admin
├── marketing-site/    # Marketing site → www.nyuchi.com (Vercel)
├── supabase/          # Supabase configuration
├── products/          # Product connectors
├── packages/
│   ├── database/      # Supabase client + schemas
│   ├── auth/          # Authentication utilities
│   ├── stripe/        # Payment integration
│   ├── ui/            # Shared UI components
│   └── ubuntu/        # Ubuntu philosophy utilities
```

## Environment Variables

### Frontend (Vercel - `apps/platform`)
```env
NEXT_PUBLIC_SUPABASE_URL=https://aqjhuyqhgmmdutwzqvyv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<publishable-key>
NEXT_PUBLIC_API_URL=https://api.nyuchi.com
```

### Backend (Cloudflare - `cloudflare/`)
```bash
# Set via wrangler secret
wrangler secret put SUPABASE_URL
wrangler secret put SUPABASE_ANON_KEY
wrangler secret put SUPABASE_SERVICE_ROLE_KEY
wrangler secret put STRIPE_SECRET_KEY
wrangler secret put STRIPE_WEBHOOK_SECRET
```

## Key Files

- `DOMAINS.md` - Complete domain documentation
- `DEPLOYMENT.md` - Deployment guide
- `.env.example` - Environment variable template
- `cloudflare/wrangler.toml` - Cloudflare Worker config
- `apps/platform/next.config.js` - Next.js config with image domains

## Development

```bash
# Install dependencies
npm install

# Start frontend (localhost:3000)
cd apps/platform && npm run dev

# Start API (localhost:8787)
cd cloudflare && npm run dev
```

## Deployment

### Frontend (Vercel)
- Automatic via GitHub integration
- Or: `vercel --prod`

### API (Cloudflare)
```bash
cd cloudflare
wrangler deploy --env production
```

## CORS Configuration

The API allows requests from:
- `https://platform.nyuchi.com`
- `https://nyuchi.com`
- `https://www.nyuchi.com`
- `http://localhost:3000` (dev)
- `http://localhost:5173` (dev)

## Ubuntu Philosophy Guidelines

1. **Community features are always free** - No paywalls on community routes
2. **Collaboration over competition** - Design for collective benefit
3. **African identity** - Zimbabwe flag colors in design system
4. **"I am because we are"** - Every feature should uplift the community

## GitHub Actions Secrets

Configure these secrets in GitHub repository settings for CI/CD:

### Vercel (Frontend)
- `VERCEL_TOKEN` - Vercel API token
- `VERCEL_ORG_ID` - Vercel organization ID
- `VERCEL_PROJECT_ID` - Vercel project ID for `apps/platform`

### Cloudflare (API)
- `CLOUDFLARE_API_TOKEN` - Cloudflare API token with Workers permissions
- `CLOUDFLARE_ACCOUNT_ID` - Cloudflare account ID

### Supabase
- `SUPABASE_URL` - `https://aqjhuyqhgmmdutwzqvyv.supabase.co`
- `SUPABASE_ANON_KEY` - Supabase anon/public key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key

### Stripe
- `STRIPE_SECRET_KEY` - Stripe secret key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook signing secret

### AI
- `CLOUDFLARE_AI_GATEWAY_ENDPOINT` - Cloudflare AI Gateway URL

## Related Documentation

- [DOMAINS.md](./DOMAINS.md) - Domain configuration
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment guide
- [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) - Database setup
- [cloudflare/README.md](./cloudflare/README.md) - API documentation
