# CLAUDE.md

> **Ubuntu Philosophy**: *"I am because we are"*

## Project Overview

Nyuchi Africa Platform - A community-focused business platform for African entrepreneurship.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15, React Native Paper, MUI, Tailwind |
| API | Hono on Cloudflare Workers |
| Database | Supabase Postgres |
| Auth | Supabase Auth |
| Payments | Stripe |
| Storage | Cloudflare R2 |
| AI | Claude via Cloudflare AI Gateway |
| Build | Turbo v2, npm workspaces |
| Runtime | Node.js 22.x |

## Monorepo Structure

```
nyuchi-main/
├── apps/
│   └── platform/         # @nyuchi/web - Next.js frontend
├── cloudflare/           # @nyuchi/platform - Hono API
├── marketing-site/       # @nyuchi/www - Marketing site
├── packages/
│   ├── auth/             # @nyuchi/auth - Auth utilities
│   ├── database/         # @nyuchi/database - Supabase client
│   ├── stripe/           # @nyuchi/stripe - Payments
│   ├── ubuntu/           # @nyuchi/ubuntu - Ubuntu philosophy
│   └── ui/               # @nyuchi/ui - Shared components
└── scripts/
```

## Package Names

| Directory | Package Name | Purpose |
|-----------|--------------|---------|
| `apps/platform` | `@nyuchi/web` | Next.js frontend |
| `cloudflare` | `@nyuchi/platform` | Hono API |
| `marketing-site` | `@nyuchi/www` | Marketing site |

## Domains

| Domain | Service | Source |
|--------|---------|--------|
| `platform.nyuchi.com` | Next.js App | `apps/platform` |
| `api.nyuchi.com` | Hono API | `cloudflare/` |
| `www.nyuchi.com` | Marketing | `marketing-site/` |

## Development

```bash
npm install          # Install dependencies
npm run dev          # Start all services
npm run build        # Build all packages
npm run lint         # Lint
npm run typecheck    # Type check
```

## Deployment

**Frontend (Vercel)** - Auto via GitHub
- Build: `npx turbo run build --filter=@nyuchi/web...`
- Output: `apps/platform/.next`

**API (Cloudflare Workers)**
```bash
cd cloudflare && wrangler deploy --env production
```

## Environment Variables

**Frontend** (`apps/platform`)
```
NEXT_PUBLIC_SUPABASE_URL=https://aqjhuyqhgmmdutwzqvyv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<key>
NEXT_PUBLIC_API_URL=https://api.nyuchi.com
```

**API** (`cloudflare/`) - via `wrangler secret put`
```
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
```

## GitHub Secrets

| Secret | Purpose |
|--------|---------|
| `VERCEL_TOKEN` | Vercel deployment |
| `VERCEL_ORG_ID` | Vercel org |
| `VERCEL_PROJECT_ID` | Vercel project |
| `CLOUDFLARE_API_TOKEN` | Cloudflare Workers |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account |
| `SUPABASE_URL` | Database URL |
| `SUPABASE_ANON_KEY` | Public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Service key |
| `STRIPE_SECRET_KEY` | Payments |
| `STRIPE_WEBHOOK_SECRET` | Webhooks |

## Key Files

| File | Purpose |
|------|---------|
| `turbo.json` | Turbo v2 config |
| `vercel.json` | Vercel settings |
| `cloudflare/wrangler.toml` | Worker config |
| `.github/workflows/deploy.yml` | CI/CD |
