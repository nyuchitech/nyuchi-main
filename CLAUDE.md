# CLAUDE.md

> **Ubuntu Philosophy**: *"I am because we are"*

## Project Overview

Nyuchi Africa Platform - A community-focused business platform for African entrepreneurship.

## Tech Stack

| Layer    | Technology                              |
| -------- | --------------------------------------- |
| Platform | Next.js 15, shadcn/ui, Tailwind, Lucide |
| API      | Hono on Cloudflare Workers              |
| Database | Supabase Postgres                       |
| Auth     | Supabase Auth                           |
| Payments | Stripe                                  |
| Storage  | Cloudflare R2                           |
| Queues   | Cloudflare Queues                       |
| Workflows| Cloudflare Workflows                    |
| AI       | DeepSeek via Cloudflare AI Gateway      |
| Build    | Turbo v2, npm workspaces                |
| Runtime  | Node.js 22.x                            |

## Repository Structure

```
nyuchi-main/
├── platform/                           # @nyuchi/web - Next.js frontend
│   ├── src/
│   │   ├── app/                        # App Router pages
│   │   ├── components/
│   │   │   └── ui/                     # shadcn/ui components
│   │   └── lib/
│   │       ├── database/               # Supabase client & types
│   │       ├── ubuntu/                 # Ubuntu philosophy scoring
│   │       └── supabase/               # Auth utilities
│   ├── components.json                 # shadcn/ui config
│   └── tailwind.config.ts
│
├── workers/                            # Cloudflare Workers
│   ├── nyuchi-platform-api/            # API Gateway
│   ├── nyuchi-platform-workflows/      # Durable workflows
│   ├── nyuchi-platform-jobs/           # Background jobs
│   ├── nyuchi-platform-uploads/        # R2 file handling
│   ├── nyuchi-platform-notifications/  # Email service
│   └── shared/                         # @nyuchi/workers-shared
│
├── supabase/
│   └── migrations/                     # SQL migrations (source of truth)
│
└── .github/workflows/
    ├── deploy.yml                      # CI pipeline
    └── deploy-workers.yml              # Workers deployment
```

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
```

### Worker Responsibilities

| Worker         | Purpose                              | Key Bindings             |
| -------------- | ------------------------------------ | ------------------------ |
| `api`          | Main API Gateway                     | AI, KV, Queues, Services |
| `workflows`    | Durable multi-step processes         | Queues                   |
| `jobs`         | Background task processing           | KV                       |
| `uploads`      | R2 file upload/download              | R2 Buckets, KV           |
| `notifications`| Email and notification delivery      | KV                       |

## Development

```bash
npm install          # Install all dependencies
npm run dev          # Start all services
npm run build        # Build all packages
npm run lint         # Lint all packages
npm run typecheck    # TypeScript check
```

### Platform

```bash
cd platform && npm run dev
```

### Workers

```bash
cd workers/nyuchi-platform-api && npm run dev
```

### Database

```bash
npm run db:migrate   # Push migrations
npm run db:pull      # Pull schema
npm run db:studio    # Open Supabase Studio
npm run db:types     # Generate TypeScript types
```

**Project ID:** `aqjhuyqhgmmdutwzqvyv`

## Deployment

### Platform (Vercel)

Auto-deploys on push to `main`:
- Build: `npx turbo run build --filter=@nyuchi/web...`
- Output: `platform/.next`

### Workers (Cloudflare)

Deploys via `.github/workflows/deploy-workers.yml`:
- Triggers on push to `main` (paths: `workers/**`)
- Order: workflows, jobs, uploads, notifications → api (last)

```bash
npm run deploy:workers        # Deploy all
npm run deploy:api-worker     # API Gateway only
```

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

## UI Stack

**shadcn/ui + Tailwind + Lucide**

```bash
# Add new shadcn component
npx shadcn@latest add button
npx shadcn@latest add card
```

Components location: `platform/src/components/ui/`

Icons:
```tsx
import { Home, Settings, User } from 'lucide-react'
```

## Domains

| Domain                | Service            |
| --------------------- | ------------------ |
| `platform.nyuchi.com` | Platform App       |
| `api.nyuchi.com`      | API Gateway Worker |
| `uploads.nyuchi.com`  | R2 Public URL      |

## Code Conventions

- TypeScript strict mode
- shadcn/ui + Tailwind for styling
- Lucide for icons
- Hono for API workers
- Workers share code via `workers/shared/`
