# Nyuchi Africa Platform

> **Ubuntu Philosophy**: *"I am because we are"*

A community-focused business platform for African entrepreneurship.

## Tech Stack

| Layer     | Technology                              |
| --------- | --------------------------------------- |
| Frontend  | Next.js 15, shadcn/ui, Tailwind, Lucide |
| API       | Hono on Cloudflare Workers              |
| Database  | Supabase Postgres                       |
| Auth      | Supabase Auth                           |
| Payments  | Stripe                                  |
| Storage   | Cloudflare R2                           |
| Queues    | Cloudflare Queues                       |
| Workflows | Cloudflare Workflows                    |
| AI        | DeepSeek via Cloudflare AI Gateway      |
| Build     | Turbo v2, npm workspaces                |
| Runtime   | Node.js 22.x                            |

## Repository Structure

```
nyuchi-main/
├── platform/                           # Next.js frontend (@nyuchi/web)
│   ├── src/
│   │   ├── app/                        # App Router pages
│   │   ├── components/
│   │   │   └── ui/                     # shadcn/ui components
│   │   └── lib/
│   │       ├── database/               # Supabase client & types
│   │       ├── ubuntu/                 # Ubuntu philosophy scoring
│   │       └── supabase/               # Auth utilities
│   └── tailwind.config.ts
│
├── workers/                            # Cloudflare Workers
│   ├── nyuchi-platform-api/            # API Gateway
│   ├── nyuchi-platform-workflows/      # Durable workflows
│   ├── nyuchi-platform-jobs/           # Background jobs
│   ├── nyuchi-platform-uploads/        # R2 file handling
│   ├── nyuchi-platform-notifications/  # Email service
│   └── shared/                         # Shared worker utilities
│
├── supabase/
│   ├── migrations/                     # SQL migrations (source of truth)
│   └── config.toml                     # Supabase CLI config
│
└── .github/workflows/
    ├── deploy.yml                      # CI pipeline
    └── deploy-workers.yml              # Workers deployment
```

## Architecture

### Multi-Worker Setup

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
```

### Worker Responsibilities

| Worker           | Purpose                        | Key Bindings             |
| ---------------- | ------------------------------ | ------------------------ |
| `api`            | Main API Gateway               | AI, KV, Queues, Services |
| `workflows`      | Durable multi-step processes   | Queues                   |
| `jobs`           | Background task processing     | KV                       |
| `uploads`        | R2 file upload/download        | R2 Buckets, KV           |
| `notifications`  | Email and notification delivery| KV                       |

### Cloudflare Workflows

- `content-review-workflow` - Content moderation
- `listing-review-workflow` - Listing approval
- `verification-workflow` - User verification
- `expert-application-workflow` - Expert application processing
- `onboarding-workflow` - User onboarding

### R2 Buckets

| Binding            | Bucket Name (Prod)         | Purpose          |
| ------------------ | -------------------------- | ---------------- |
| `UPLOADS`          | `nyuchi-api-r2-uploads`    | User uploads     |
| `COMMUNITY_ASSETS` | `ny-community-assets-prod` | Community assets |
| `MEDIA`            | `ny-platform-media-prod`   | Platform media   |

## Development

### Prerequisites

- Node.js 22.x
- npm 10.x
- Supabase CLI
- Wrangler CLI

### Setup

```bash
git clone <repo-url>
cd nyuchi-main
npm install
cp .env.example .env.local
```

### Commands

```bash
npm run dev          # Start all services
npm run build        # Build all packages
npm run lint         # Lint all packages
npm run typecheck    # TypeScript check
npm run clean        # Clean build artifacts
```

### Platform Development

```bash
cd platform && npm run dev
```

### Worker Development

```bash
cd workers/nyuchi-platform-api && npm run dev
```

### Database

```bash
npm run db:migrate   # Push migrations to Supabase
npm run db:pull      # Pull schema from Supabase
npm run db:studio    # Open Supabase Studio
npm run db:types     # Generate TypeScript types
```

**Supabase Project ID:** `aqjhuyqhgmmdutwzqvyv`

## Deployment

### Platform (Vercel)

Automatic deployment on push to `main`:

- **Build command:** `npx turbo run build --filter=@nyuchi/web...`
- **Output directory:** `platform/.next`

### Workers (Cloudflare)

Deployed via GitHub Actions (`.github/workflows/deploy-workers.yml`):

- Triggers on push to `main` (paths: `workers/**`)
- Manual trigger via `workflow_dispatch`

**Deployment order:** Workers without dependencies first, API Gateway last.

```bash
npm run deploy:workers        # Deploy all workers
npm run deploy:api-worker     # API Gateway only
npm run deploy:workflows      # Workflows only
npm run deploy:jobs           # Jobs only
npm run deploy:uploads        # Uploads only
npm run deploy:notifications  # Notifications only
```

## Domains

| Domain                | Service            |
| --------------------- | ------------------ |
| `platform.nyuchi.com` | Platform App       |
| `api.nyuchi.com`      | API Gateway Worker |
| `uploads.nyuchi.com`  | R2 Public URL      |

## Environment Variables

### Platform (`platform/.env.local`)

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

| Secret                      | Purpose                   |
| --------------------------- | ------------------------- |
| `VERCEL_TOKEN`              | Vercel deployment         |
| `VERCEL_ORG_ID`             | Vercel org                |
| `VERCEL_PROJECT_ID`         | Vercel project            |
| `CLOUDFLARE_API_TOKEN`      | Cloudflare Workers deploy |
| `CLOUDFLARE_ACCOUNT_ID`     | Cloudflare account        |
| `SUPABASE_URL`              | Database URL              |
| `SUPABASE_ANON_KEY`         | Public key                |
| `SUPABASE_SERVICE_ROLE_KEY` | Service key               |

## UI Stack

**shadcn/ui + Tailwind CSS + Lucide Icons**

```bash
# Add new shadcn component
npx shadcn@latest add button
npx shadcn@latest add card
```

Components are in `platform/src/components/ui/`.

## Key Files

| File                            | Purpose                 |
| ------------------------------- | ----------------------- |
| `turbo.json`                    | Turbo pipeline config   |
| `vercel.json`                   | Vercel settings         |
| `workers/*/wrangler.toml`       | Worker configurations   |
| `supabase/config.toml`          | Supabase CLI config     |
| `supabase/migrations/`          | Database migrations     |
| `platform/components.json`      | shadcn/ui config        |
| `platform/tailwind.config.ts`   | Tailwind + brand theme  |

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

## License

MIT License

---

**Nyuchi Africa** | *"I am because we are"*
