# 🇿🇼 Nyuchi Platform API

> **Ubuntu Philosophy**: *"I am because we are"* - Main platform API built with Hono on Cloudflare Workers

## Overview

The Nyuchi Platform API powers the community directory, content submission system, Ubuntu scoring, payments, and AI integration for the Nyuchi Africa Platform.

## Tech Stack

- **Framework**: Hono (Cloudflare Workers)
- **Database**: Supabase Postgres
- **Auth**: Supabase Auth
- **Payments**: Stripe
- **AI**: Claude via Cloudflare AI Gateway
- **Storage**: Cloudflare R2
- **Cache**: Cloudflare KV

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Type check
npm run type-check

# Deploy to Cloudflare
npm run deploy
```

## Environment Variables

Configure these secrets using `wrangler secret`:

```bash
wrangler secret put SUPABASE_URL
wrangler secret put SUPABASE_ANON_KEY
wrangler secret put SUPABASE_SERVICE_ROLE_KEY
wrangler secret put STRIPE_SECRET_KEY
wrangler secret put STRIPE_PUBLIC_KEY
wrangler secret put STRIPE_WEBHOOK_SECRET
wrangler secret put CLOUDFLARE_AI_GATEWAY_ENDPOINT
```

## API Endpoints

### Authentication (`/api/auth`)

- `POST /api/auth/signup` - Register new user
- `POST /api/auth/signin` - Authenticate user
- `POST /api/auth/signout` - Sign out user
- `POST /api/auth/reset-password` - Send password reset email
- `POST /api/auth/update-password` - Update password

### Community Directory (`/api/directory`)

- `GET /api/directory` - List published listings (public)
- `GET /api/directory/:id` - Get single listing (public)
- `POST /api/directory` - Create listing (authenticated)
- `PUT /api/directory/:id` - Update listing (authenticated)
- `DELETE /api/directory/:id` - Delete listing (authenticated)
- `POST /api/directory/:id/approve` - Approve listing (moderator/admin)
- `POST /api/directory/:id/reject` - Reject listing (moderator/admin)

### Content Submission (`/api/content`)

- `GET /api/content` - List published content (public)
- `GET /api/content/:slug` - Get single content (public)
- `POST /api/content` - Submit content (contributor/moderator/admin)
- `PUT /api/content/:id` - Update content (authenticated)
- `DELETE /api/content/:id` - Delete content (authenticated)
- `POST /api/content/:id/publish` - Publish content (moderator/admin)
- `POST /api/content/:id/reject` - Reject content (moderator/admin)

### Ubuntu Scoring (`/api/ubuntu`)

- `GET /api/ubuntu/leaderboard` - Get Ubuntu leaderboard (public)
- `GET /api/ubuntu/my-score` - Get current user's score (authenticated)
- `GET /api/ubuntu/my-contributions` - Get user contributions (authenticated)
- `POST /api/ubuntu/record` - Record contribution (admin)
- `GET /api/ubuntu/points-guide` - Get points guide (public)

### Stripe Payments (`/api/stripe`)

- `GET /api/stripe/products` - List products (public)
- `GET /api/stripe/verification-price` - Get verification price (public)
- `POST /api/stripe/create-checkout` - Create checkout session (authenticated)
- `POST /api/stripe/create-verification-checkout` - Create verification checkout (authenticated)
- `POST /api/stripe/create-portal-session` - Create customer portal (authenticated)
- `GET /api/stripe/my-subscriptions` - Get subscriptions (authenticated)
- `POST /api/stripe/webhook` - Handle webhooks

### Admin Interface (`/api/admin`)

- `GET /api/admin/stats` - Get platform stats (moderator/admin)
- `GET /api/admin/users` - List users (admin)
- `PUT /api/admin/users/:id/role` - Update user role (admin)
- `DELETE /api/admin/users/:id` - Delete user (admin)
- `GET /api/admin/pending-reviews` - Get pending reviews (moderator/admin)
- `PUT /api/admin/ubuntu-points/:userId` - Adjust Ubuntu points (admin)
- `GET /api/admin/system-config` - Get system config (admin)

### Claude AI (`/api/ai`)

- `POST /api/ai/chat` - Chat with Claude (authenticated)
- `POST /api/ai/stream` - Stream chat with Claude (authenticated)
- `POST /api/ai/content-suggestions` - Get content suggestions (authenticated)
- `POST /api/ai/listing-review` - AI review for listing (moderator/admin)

## Authentication

All authenticated endpoints require a Bearer token in the Authorization header:

```bash
Authorization: Bearer <access_token>
```

## Role-Based Access Control

- **User**: Basic access, create directory listings
- **Contributor**: Submit content for review
- **Moderator**: Review and publish content/listings
- **Admin**: Full access, user management, system config

## Example Requests

### Create Directory Listing

```bash
curl -X POST https://api.nyuchi.com/api/directory \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "business_name": "My Business",
    "category": "technology",
    "description": "We build amazing software",
    "location": "Harare, Zimbabwe",
    "contact_email": "hello@mybusiness.com",
    "website_url": "https://mybusiness.com"
  }'
```

### Submit Content

```bash
curl -X POST https://api.nyuchi.com/api/content \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "10 Tips for African Entrepreneurs",
    "content_type": "article",
    "content_body": "Content here...",
    "category": "entrepreneurship",
    "tags": ["business", "tips", "africa"]
  }'
```

### Chat with Claude

```bash
curl -X POST https://api.nyuchi.com/api/ai/chat \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {
        "role": "user",
        "content": "How do I start a business in Zimbabwe?"
      }
    ]
  }'
```

## Webhooks

### Stripe Webhooks

Configure webhook endpoint in Stripe Dashboard:
```
https://api.nyuchi.com/api/stripe/webhook
```

Events handled:
- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.paid`
- `invoice.payment_failed`

## Deployment

### Prerequisites

1. Cloudflare account with Workers enabled
2. Supabase project
3. Stripe account
4. Cloudflare AI Gateway configured

### Deploy

```bash
# Build and deploy
npm run deploy

# Deploy to specific environment
wrangler deploy --env production
```

### Configure Custom Domain

In `wrangler.toml`:
```toml
[env.production]
name = "nyuchi-api"
routes = [
  { pattern = "api.nyuchi.com", zone_name = "nyuchi.com" }
]
```

## Monitoring

- **Logs**: `wrangler tail`
- **Analytics**: Cloudflare Workers Analytics
- **Errors**: Cloudflare Workers Analytics

## License

MIT - Built with Ubuntu philosophy for African entrepreneurship

---

**🇿🇼 Nyuchi Africa** | **🟠 Ubuntu Philosophy** | **⚡ Powered by Cloudflare Workers**

*"I am because we are"*
