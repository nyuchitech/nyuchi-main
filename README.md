# 🇿🇼 Nyuchi Africa Platform

> **Ubuntu Philosophy**: *"I am because we are"* - Building technology that uplifts African entrepreneurship through community collaboration.

## 🌍 Overview

Nyuchi is a full-stack platform for African entrepreneurship built with:
- **Zimbabwe Heritage** - Flag colors, cultural identity
- **Ubuntu Philosophy** - Community-first approach
- **Modern Tech** - Cloudflare Workers, Supabase, Material UI
- **AI-Powered** - Claude AI for content analysis and generation

## 🏗️ Architecture

```
nyuchi-platform/
├── apps/
│   ├── platform/          # Main dashboard (Hono + MUI + Cloudflare Workers)
│   └── workers/           # API workers (Cloudflare Workers)
├── packages/
│   ├── database/          # Supabase client + schemas
│   ├── ui/                # Shared MUI components (Zimbabwe-themed)
│   ├── auth/              # Supabase Auth integration
│   ├── stripe/            # Stripe payment integration
│   └── ubuntu/            # Ubuntu philosophy utilities
├── products/              # External product connectors (future)
└── archives/              # Previous Remix codebase
```

## 🚀 Tech Stack

- **Frontend**: Next.js on Vercel
- **Backend API**: Hono on Cloudflare Workers
- **Database**: Supabase Postgres (https://aqjhuyqhgmmdutwzqvyv.supabase.co)
- **Auth**: Supabase Auth
- **Storage**: Cloudflare R2 (community-assets.nyuchi.com, media.nyuchi.com)
- **Cache**: Cloudflare KV
- **Payments**: Stripe
- **AI**: Claude API (via Cloudflare AI Gateway)
- **Monorepo**: Turborepo

## 🎨 Zimbabwe Design System

- **Flag Strip**: 8px vertical strip (Green-Yellow-Red-Black) on all pages
- **Colors**: Zimbabwe flag colors as primary palette
- **Typography**: Playfair Display (headings) + Roboto (body)
- **Buttons**: All pill-shaped (rounded-full)

## 🛠️ Quick Start

### Prerequisites
- Node.js 20+
- npm 10+
- Supabase account
- Cloudflare account
- Stripe account

### Installation

```bash
# Clone repository
git clone <repo-url>
cd nyuchi-platform

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# Set up Supabase
cd packages/database
npm run migrate
npm run seed

# Start development
npm run dev
```

### Development Commands

```bash
npm run dev              # Start all apps in development
npm run build            # Build all apps
npm run lint             # Lint all packages
npm run type-check       # TypeScript validation
npm run clean            # Clean all build artifacts

# Database
npm run db:migrate       # Run Supabase migrations
npm run db:seed          # Seed database with test data
npm run db:studio        # Open Supabase Studio

# Deployment
npm run deploy           # Deploy all apps
npm run deploy:platform  # Deploy platform only
npm run deploy:workers   # Deploy workers only
```

## 📦 Core Features

### Phase 1 (Current)
- ✅ Community Directory (request → approve → publish)
- ✅ Content Submission System (write → review → publish)
- ✅ Ubuntu Scoring (points, levels, leaderboard)
- ✅ Zimbabwe Design System (flag, colors, typography)
- ✅ Stripe Integration (verification + subscriptions)
- ✅ Admin Interface (configurations, user management)
- ✅ Claude AI Integration (content analysis, generation)

### Phase 2 (Planned)
- 🚧 Marketing site (Next.js on Vercel)
- 🚧 Product connectors (SEO Manager, MailSense, etc.)
- 🚧 Real-time collaboration
- 🚧 Advanced analytics
- 🚧 Mobile native apps

## 🤝 Ubuntu Philosophy

**Brand vs. Philosophy:**
- ✅ **Brand**: "Nyuchi" or "Nyuchi Africa"
- ✅ **Philosophy**: Ubuntu ("I am because we are")
- ❌ **Never** use "Ubuntu" as the brand name

**Ubuntu Features:**
- Community features always free
- Points awarded for contributions
- Leaderboard celebrating community leaders
- Collaborative approach to business success

## 📊 Project Structure

### Apps
- **apps/platform**: Main dashboard application (Hono + MUI)
- **apps/workers**: Cloudflare Workers for API routes

### Packages
- **packages/database**: Supabase client, schemas, migrations
- **packages/ui**: Zimbabwe-themed MUI components
- **packages/auth**: Authentication utilities
- **packages/stripe**: Payment integration
- **packages/ubuntu**: Ubuntu philosophy utilities

## 🔧 Configuration

### Environment Variables

See `.env.example` for all required variables:
- Supabase (database + auth)
- Cloudflare (Workers, KV, R2)
- Stripe (payments)
- Claude AI (content analysis)

## 📚 Documentation

- [Architecture Documentation](./docs/ARCHITECTURE.md)
- [Database Schema](./packages/database/README.md)
- [Zimbabwe Design System](./packages/ui/README.md)
- [Ubuntu Philosophy Guide](./packages/ubuntu/README.md)

## 🌐 Deployment

### Domain Architecture
| Domain | Service | Hosting |
|--------|---------|---------|
| `platform.nyuchi.com` | Next.js Web App | Vercel |
| `api.nyuchi.com` | Hono API | Cloudflare Worker |
| `www.nyuchi.com` | Marketing Site | Vercel (separate project) |
| `community-assets.nyuchi.com` | R2 Bucket | Cloudflare |
| `media.nyuchi.com` | R2 Bucket | Cloudflare |

### Supabase
- **URL**: https://aqjhuyqhgmmdutwzqvyv.supabase.co
- Database hosted on Supabase
- Auth handled by Supabase Auth

See [DOMAINS.md](./DOMAINS.md) for complete domain documentation.

## 📄 License

MIT License - Built with Ubuntu philosophy for African entrepreneurship

---

**🇿🇼 Nyuchi Africa** | **🟠 Ubuntu Philosophy** | **⚡ Powered by Cloudflare + Supabase + Claude AI**

*"I am because we are"*
