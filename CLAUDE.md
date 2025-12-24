# CLAUDE.md

> **Ubuntu Philosophy**: *"I am because we are"*

## Project Overview

Nyuchi Africa Platform - A community-focused business platform for African entrepreneurship. The platform enables communities to connect, share resources, and grow together.

## Tech Stack

| Layer       | Technology                                          |
| ----------- | --------------------------------------------------- |
| Frontend    | Next.js 15, React Native Paper, MUI, Tailwind       |
| Marketing   | Astro 5, Tailwind, React                            |
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

## Monorepo Structure

```text
nyuchi-main/
├── apps/
│   └── platform/                    # @nyuchi/web - Next.js frontend
│       └── src/
│           ├── app/                 # App Router pages
│           ├── components/          # React components
│           ├── lib/                 # Utilities & Supabase client
│           └── theme/               # MUI theme config
├── cloudflare/
│   └── workers/
│       ├── nyuchi-platform-api/        # @nyuchi/platform-api - API Gateway
│       ├── nyuchi-platform-workflows/  # @nyuchi/platform-workflows - Durable workflows
│       ├── nyuchi-platform-jobs/       # @nyuchi/platform-jobs - Background job consumer
│       ├── nyuchi-platform-uploads/    # @nyuchi/platform-uploads - R2 file handling
│       ├── nyuchi-platform-notifications/ # @nyuchi/platform-notifications - Email service
│       └── shared/                     # @nyuchi/workers-shared - Shared types/utils
├── marketing-site/                  # @nyuchi/www - Astro marketing site
├── packages/
│   ├── auth/                        # @nyuchi/auth - Auth utilities
│   ├── database/                    # @nyuchi/database - Supabase client & queries
│   ├── stripe/                      # @nyuchi/stripe - Payment integration
│   ├── ubuntu/                      # @nyuchi/ubuntu - Ubuntu philosophy
│   └── ui/                          # @nyuchi/ui - Shared components
├── supabase/
│   ├── migrations/                  # SQL migrations (source of truth)
│   └── config.toml                  # Supabase CLI config
└── .github/workflows/
    ├── deploy.yml                   # CI/CD pipeline
    └── deploy-workers.yml           # Cloudflare Workers deployment
```

## Build Independence Architecture

**Each application must be self-contained and independently buildable.**

### Dependency Rules

| Application          | Can Use                          | Cannot Use           |
| -------------------- | -------------------------------- | -------------------- |
| `apps/platform`      | `packages/*`                     | -                    |
| `marketing-site`     | Nothing external                 | `packages/*`         |
| `cloudflare/workers` | `cloudflare/workers/shared/`     | `packages/*`         |

### Key Principles

1. **`packages/` is ONLY for `apps/platform`** - The shared packages directory exists solely for the Next.js platform app. No other application should import from it.

2. **Marketing site is fully self-contained** - Has its own `global.css`, Tailwind config, and components. Does not share styles or components with other apps.

3. **Workers share code within their boundary** - Cloudflare Workers use `@nyuchi/workers-shared` from `cloudflare/workers/shared/`, which lives inside the workers directory.

4. **No cross-boundary dependencies** - If an app needs shared functionality, copy it into that app's directory or rebuild it there. Don't create dependencies across build boundaries.

```
apps/platform/        → imports from packages/*           ✓
marketing-site/       → fully self-contained              ✓
cloudflare/workers/*  → imports from workers/shared/      ✓

marketing-site/       → imports from packages/*           ✗ NEVER
cloudflare/workers/*  → imports from packages/*           ✗ NEVER
```

## Package Names

| Directory                           | Package Name               | Purpose                    | Used By          |
| ----------------------------------- | -------------------------- | -------------------------- | ---------------- |
| `apps/platform`                     | `@nyuchi/web`              | Next.js frontend           | -                |
| `marketing-site`                    | `@nyuchi/www`              | Astro marketing site       | -                |
| `cloudflare/workers/nyuchi-platform-api` | `@nyuchi/platform-api` | API Gateway                | -                |
| `cloudflare/workers/nyuchi-platform-workflows` | `@nyuchi/platform-workflows` | Durable workflows | -        |
| `cloudflare/workers/nyuchi-platform-jobs` | `@nyuchi/platform-jobs` | Background jobs         | -                |
| `cloudflare/workers/nyuchi-platform-uploads` | `@nyuchi/platform-uploads` | R2 file handling    | -            |
| `cloudflare/workers/nyuchi-platform-notifications` | `@nyuchi/platform-notifications` | Email/notifications | -  |
| `cloudflare/workers/shared`         | `@nyuchi/workers-shared`   | Shared worker utilities    | Workers only     |
| `packages/database`                 | `@nyuchi/database`         | Supabase client            | Platform only    |
| `packages/auth`                     | `@nyuchi/auth`             | Auth utilities             | Platform only    |
| `packages/stripe`                   | `@nyuchi/stripe`           | Payment integration        | Platform only    |
| `packages/ubuntu`                   | `@nyuchi/ubuntu`           | Ubuntu philosophy          | Platform only    |
| `packages/ui`                       | `@nyuchi/ui`               | Shared UI components       | Platform only    |

## Multi-Worker Architecture

The API is split into specialized Cloudflare Workers:

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

| Worker         | Purpose                                         | Key Bindings                |
| -------------- | ----------------------------------------------- | --------------------------- |
| `api`          | Main API Gateway, routes requests               | AI, KV, Queues, Services    |
| `workflows`    | Durable multi-step processes (reviews, onboarding) | Queues                   |
| `jobs`         | Background task processing (queue consumer)     | KV                          |
| `uploads`      | R2 file upload/download handling                | R2 Buckets, KV              |
| `notifications`| Email and notification delivery (queue consumer)| KV                          |

### Cloudflare Workflows Defined

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

| Domain                | Service            | Source                    |
| --------------------- | ------------------ | ------------------------- |
| `platform.nyuchi.com` | Next.js App        | `apps/platform`           |
| `api.nyuchi.com`      | API Gateway Worker | `cloudflare/workers/nyuchi-platform-api` |
| `www.nyuchi.com`      | Marketing Site     | `marketing-site/`         |
| `uploads.nyuchi.com`  | R2 Public URL      | `cloudflare/workers/nyuchi-platform-uploads` |

## Development

```bash
npm install          # Install all dependencies
npm run dev          # Start all services (Turbo)
npm run build        # Build all packages
npm run lint         # Lint all packages
npm run typecheck    # TypeScript check all packages
npm run clean        # Clean all build artifacts
```

### Package-specific Development

```bash
# Frontend
cd apps/platform && npm run dev

# Marketing site (runs on port 3001)
cd marketing-site && npm run dev

# Individual workers
cd cloudflare/workers/nyuchi-platform-api && npm run dev
cd cloudflare/workers/nyuchi-platform-workflows && npm run dev
```

### Database Commands

```bash
npm run db:migrate    # Run migrations
npm run db:seed       # Seed database
npm run db:studio     # Open Supabase Studio

# Generate TypeScript types from database
cd packages/database && npm run generate-types
```

## Deployment

### Frontend (Vercel)

Automatic deployment via GitHub on push to `main`:
- Build command: `npx turbo run build --filter=@nyuchi/web...`
- Output directory: `apps/platform/.next`

### Marketing Site (Vercel)

Automatic deployment via Vercel.

### Cloudflare Workers

Workers are deployed via `.github/workflows/deploy-workers.yml`:
- Triggers on push to `main` (paths: `cloudflare/workers/**`)
- Manual trigger via `workflow_dispatch` (can deploy individual workers)

**Deployment order matters:** Workers without dependencies deploy first, API Gateway deploys last.

```bash
# Deploy all workers
npm run deploy:workers

# Deploy individual workers
npm run deploy:api-worker       # API Gateway
npm run deploy:workflows        # Workflows
npm run deploy:jobs             # Jobs consumer
npm run deploy:uploads          # Uploads
npm run deploy:notifications    # Notifications
```

## Environment Variables

### Frontend (`apps/platform/.env.local`)

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

## Database

Migrations are the source of truth, located in `supabase/migrations/`.

```bash
# Push migrations to remote
npx supabase db push --linked

# Pull schema from remote
npx supabase db pull --linked

# Create new migration
npx supabase migration new <name>

# Generate TypeScript types
npx supabase gen types typescript --linked > packages/database/src/types.generated.ts
```

**Project ID:** `aqjhuyqhgmmdutwzqvyv`

## Key Files

| File                                              | Purpose                    |
| ------------------------------------------------- | -------------------------- |
| `turbo.json`                                      | Turbo v2 pipeline config   |
| `vercel.json`                                     | Vercel monorepo settings   |
| `cloudflare/workers/*/wrangler.toml`              | Worker configurations      |
| `supabase/config.toml`                            | Supabase CLI config        |
| `supabase/migrations/`                            | Database migrations        |
| `.github/workflows/deploy.yml`                    | CI pipeline                |
| `.github/workflows/deploy-workers.yml`            | Workers deployment         |
| `apps/platform/src/middleware.ts`                 | Next.js auth middleware    |

## Code Conventions

### TypeScript
- Strict mode enabled across all packages
- Use `type-check` script before committing
- Generated types for Supabase in `packages/database/src/types.generated.ts`

### Styling
- Frontend (`apps/platform`) uses MUI + Tailwind CSS with shared theme
- Marketing site has its own `global.css` and Tailwind config (fully independent)
- Theme configuration for platform in `apps/platform/src/theme/`
- **Never share styles between apps** - each app manages its own styling

### API Design
- Hono framework for all workers
- Use service bindings for inter-worker communication
- Queue for async operations (jobs, notifications)
- KV namespace `CACHE` shared across workers

### File Uploads
- All uploads go through `nyuchi-platform-uploads` worker
- Use presigned URLs for direct client uploads
- Public URL: `https://uploads.nyuchi.com`

## Testing

```bash
npm run lint         # ESLint
npm run typecheck    # TypeScript
npm run build        # Full build (includes type checking)
```

## Troubleshooting

### Worker Deployment Fails
1. Check service bindings - API worker depends on other workers
2. Ensure secrets are set: `wrangler secret list`
3. Check Cloudflare dashboard for error logs

### Database Sync Issues
1. Ensure you're linked: `npx supabase link --project-ref aqjhuyqhgmmdutwzqvyv`
2. Pull latest: `npx supabase db pull --linked`
3. Regenerate types after schema changes

### Build Failures
1. Clean and reinstall: `npm run clean && npm install`
2. Check Turbo cache: `npx turbo clean`
3. Verify Node.js version: `node -v` (should be 22.x)
