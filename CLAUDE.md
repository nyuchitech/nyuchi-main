# CLAUDE.md

> **Ubuntu Philosophy**: *"I am because we are"*

## Project Overview

Nyuchi Africa Platform - A community-focused business platform for African entrepreneurship. This repository contains the platform application and API.

## Tech Stack

| Layer       | Technology                                          |
| ----------- | --------------------------------------------------- |
| Platform    | Next.js 15, React Native Paper, MUI, Tailwind       |
| API         | Hono on Cloudflare Workers (multi-worker setup)     |
| Database    | Supabase Postgres (v17)                             |
| Auth        | Supabase Auth                                       |
| Payments    | Stripe                                              |
| Storage     | Cloudflare R2 (3 buckets)                           |
| Queues      | Cloudflare Queues (jobs, notifications)             |
| Workflows   | Cloudflare Workflows (durable multi-step processes) |
| AI          | DeepSeek via Cloudflare AI Gateway                  |
| Build       | Turbo v2, npm workspaces                            |
| Runtime     | Node.js 22.x                                        |

## Repository Structure

```text
nyuchi-main/
├── apps/
│   └── platform/                       # @nyuchi/web - Platform frontend
│       └── src/
│           ├── app/                    # Next.js App Router pages
│           ├── components/             # React components
│           ├── lib/                    # Utilities & Supabase client
│           └── theme/                  # MUI theme config
├── cloudflare/
│   └── workers/
│       ├── nyuchi-platform-api/        # API Gateway
│       ├── nyuchi-platform-workflows/  # Durable workflows
│       ├── nyuchi-platform-jobs/       # Background job consumer
│       ├── nyuchi-platform-uploads/    # R2 file handling
│       ├── nyuchi-platform-notifications/ # Email service
│       └── shared/                     # Shared worker utilities
├── packages/                           # Platform-only packages
│   ├── auth/                           # Auth utilities
│   ├── database/                       # Supabase client & queries
│   ├── stripe/                         # Payment integration
│   ├── ubuntu/                         # Ubuntu philosophy
│   └── ui/                             # Shared UI components
├── supabase/
│   ├── migrations/                     # SQL migrations (source of truth)
│   └── config.toml                     # Supabase CLI config
└── .github/workflows/
    ├── deploy.yml                      # CI/CD pipeline
    └── deploy-workers.yml              # Cloudflare Workers deployment
```

## Build Architecture

### Dependency Rules

| Component            | Can Import From                  |
| -------------------- | -------------------------------- |
| `apps/platform`      | `packages/*`                     |
| `cloudflare/workers` | `cloudflare/workers/shared/`     |

**Key Principles:**

1. **`packages/` is ONLY for `apps/platform`** - Workers never import from packages
2. **Workers share code within their boundary** - Use `@nyuchi/workers-shared` from `cloudflare/workers/shared/`
3. **No cross-boundary dependencies** - Platform and Workers are independent build targets

## Package Names

| Directory                                          | Package Name                    |
| -------------------------------------------------- | ------------------------------- |
| `apps/platform`                                    | `@nyuchi/web`                   |
| `cloudflare/workers/nyuchi-platform-api`           | `@nyuchi/platform-api`          |
| `cloudflare/workers/nyuchi-platform-workflows`     | `@nyuchi/platform-workflows`    |
| `cloudflare/workers/nyuchi-platform-jobs`          | `@nyuchi/platform-jobs`         |
| `cloudflare/workers/nyuchi-platform-uploads`       | `@nyuchi/platform-uploads`      |
| `cloudflare/workers/nyuchi-platform-notifications` | `@nyuchi/platform-notifications`|
| `cloudflare/workers/shared`                        | `@nyuchi/workers-shared`        |
| `packages/database`                                | `@nyuchi/database`              |
| `packages/auth`                                    | `@nyuchi/auth`                  |
| `packages/stripe`                                  | `@nyuchi/stripe`                |
| `packages/ubuntu`                                  | `@nyuchi/ubuntu`                |
| `packages/ui`                                      | `@nyuchi/ui`                    |

## Multi-Worker Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     API Gateway                              │
│              (nyuchi-platform-api)                           │
│  Routes: api.nyuchi.com                                      │
│  Bindings: AI, KV Cache, Queues                             │
└─────────────┬───────────────────────────────┬───────────────┘
              │ Service Bindings              │
    ┌─────────┴─────────┬─────────────────────┴─────────┐
    ▼                   ▼                               ▼
┌─────────────┐  ┌─────────────┐                 ┌─────────────┐
│  Workflows  │  │   Uploads   │                 │Notifications│
│  (Durable)  │  │    (R2)     │                 │   (Email)   │
└─────────────┘  └─────────────┘                 └─────────────┘

Queue System:
┌─────────────────┐     ┌─────────────────┐
│ nyuchi-jobs-    │────▶│  Jobs Worker    │
│ queue           │     │  (Consumer)     │
└─────────────────┘     └─────────────────┘

┌─────────────────┐     ┌─────────────────┐
│ nyuchi-         │────▶│ Notifications   │
│ notifications-  │     │ Worker          │
│ queue           │     │ (Consumer)      │
└─────────────────┘     └─────────────────┘
```

### Worker Responsibilities

| Worker         | Purpose                                            | Key Bindings              |
| -------------- | -------------------------------------------------- | ------------------------- |
| `api`          | Main API Gateway, routes requests                  | AI, KV, Queues, Services  |
| `workflows`    | Durable multi-step processes (reviews, onboarding) | Queues                    |
| `jobs`         | Background task processing (queue consumer)        | KV                        |
| `uploads`      | R2 file upload/download handling                   | R2 Buckets, KV            |
| `notifications`| Email and notification delivery (queue consumer)   | KV                        |

### Cloudflare Workflows

- `content-review-workflow` - Content moderation
- `listing-review-workflow` - Listing approval
- `verification-workflow` - User verification
- `expert-application-workflow` - Expert application processing
- `onboarding-workflow` - User onboarding

### R2 Buckets

| Binding           | Bucket Name (Prod)        | Purpose              |
| ----------------- | ------------------------- | -------------------- |
| `UPLOADS`         | `nyuchi-api-r2-uploads`   | User uploads         |
| `COMMUNITY_ASSETS`| `ny-community-assets-prod`| Community assets     |
| `MEDIA`           | `ny-platform-media-prod`  | Platform media       |

## Domains

| Domain                | Service            |
| --------------------- | ------------------ |
| `platform.nyuchi.com` | Platform App       |
| `api.nyuchi.com`      | API Gateway Worker |
| `uploads.nyuchi.com`  | R2 Public URL      |

## Development

```bash
npm install          # Install all dependencies
npm run dev          # Start all services (Turbo)
npm run build        # Build all packages
npm run lint         # Lint all packages
npm run typecheck    # TypeScript check all packages
npm run clean        # Clean all build artifacts
```

### Platform Development

```bash
cd apps/platform && npm run dev
```

### Worker Development

```bash
cd cloudflare/workers/nyuchi-platform-api && npm run dev
cd cloudflare/workers/nyuchi-platform-workflows && npm run dev
```

### Database (Platform)

```bash
npm run db:migrate    # Run migrations
npm run db:seed       # Seed database
npm run db:studio     # Open Supabase Studio

# Generate TypeScript types
cd packages/database && npm run generate-types

# Supabase CLI commands
npx supabase db push --linked         # Push migrations
npx supabase db pull --linked         # Pull schema
npx supabase migration new <name>     # New migration
```

**Project ID:** `aqjhuyqhgmmdutwzqvyv`

## Deployment

### Platform (Vercel)

Automatic deployment via GitHub on push to `main`:
- Build command: `npx turbo run build --filter=@nyuchi/web...`
- Output directory: `apps/platform/.next`

### Cloudflare Workers

Deployed via `.github/workflows/deploy-workers.yml`:
- Triggers on push to `main` (paths: `cloudflare/workers/**`)
- Manual trigger via `workflow_dispatch`

**Deployment order:** Workers without dependencies first, API Gateway last.

```bash
npm run deploy:workers        # Deploy all
npm run deploy:api-worker     # API Gateway
npm run deploy:workflows      # Workflows
npm run deploy:jobs           # Jobs
npm run deploy:uploads        # Uploads
npm run deploy:notifications  # Notifications
```

## Environment Variables

### Platform (`apps/platform/.env.local`)

```env
NEXT_PUBLIC_SUPABASE_URL=https://aqjhuyqhgmmdutwzqvyv.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=<key>
NEXT_PUBLIC_API_URL=https://api.nyuchi.com
```

### Workers (via `wrangler secret put`)

```env
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
CLOUDFLARE_AI_GATEWAY_ENDPOINT
AI_GATEWAY_TOKEN
```

## GitHub Secrets

| Secret                       | Purpose                    |
| ---------------------------- | -------------------------- |
| `VERCEL_TOKEN`               | Vercel deployment          |
| `VERCEL_ORG_ID`              | Vercel org                 |
| `VERCEL_PROJECT_ID`          | Vercel project             |
| `CLOUDFLARE_API_TOKEN`       | Cloudflare Workers deploy  |
| `CLOUDFLARE_ACCOUNT_ID`      | Cloudflare account         |
| `SUPABASE_URL`               | Database URL               |
| `SUPABASE_ANON_KEY`          | Public key                 |
| `SUPABASE_SERVICE_ROLE_KEY`  | Service key                |

## Key Files

| File                                    | Purpose                  |
| --------------------------------------- | ------------------------ |
| `turbo.json`                            | Turbo v2 pipeline config |
| `vercel.json`                           | Vercel settings          |
| `cloudflare/workers/*/wrangler.toml`    | Worker configurations    |
| `supabase/config.toml`                  | Supabase CLI config      |
| `supabase/migrations/`                  | Database migrations      |
| `.github/workflows/deploy.yml`          | CI pipeline              |
| `.github/workflows/deploy-workers.yml`  | Workers deployment       |
| `apps/platform/src/middleware.ts`       | Auth middleware          |

## Code Conventions

### TypeScript
- Strict mode enabled
- Run `type-check` before committing
- Generated types in `packages/database/src/types.generated.ts`

### Styling (Platform)
- MUI + Tailwind CSS
- Theme config in `apps/platform/src/theme/`

### API Design
- Hono framework for all workers
- Service bindings for inter-worker communication
- Queues for async operations
- KV namespace `CACHE` shared across workers

### File Uploads
- All uploads via `nyuchi-platform-uploads` worker
- Presigned URLs for direct client uploads
- Public URL: `https://uploads.nyuchi.com`

## Troubleshooting

### Worker Deployment Fails
1. Check service bindings - API worker depends on other workers
2. Ensure secrets are set: `wrangler secret list`
3. Check Cloudflare dashboard for error logs

### Database Sync Issues
1. Link project: `npx supabase link --project-ref aqjhuyqhgmmdutwzqvyv`
2. Pull latest: `npx supabase db pull --linked`
3. Regenerate types after schema changes

### Build Failures
1. Clean and reinstall: `npm run clean && npm install`
2. Check Turbo cache: `npx turbo clean`
3. Verify Node.js version: `node -v` (should be 22.x)
