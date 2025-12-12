# Domain Architecture

## Production Domains

| Domain | Service | Source | Hosting |
|--------|---------|--------|---------|
| `platform.nyuchi.com` | Next.js App | `apps/platform` | Vercel |
| `api.nyuchi.com` | Hono API | `cloudflare/` | Cloudflare Workers |
| `www.nyuchi.com` | Marketing | `marketing-site/` | Vercel |
| `community-assets.nyuchi.com` | Assets | R2 bucket | Cloudflare |
| `media.nyuchi.com` | Media | R2 bucket | Cloudflare |

## Development URLs

| URL | Service |
|-----|---------|
| `http://localhost:3000` | Platform (Next.js) |
| `http://localhost:3001` | Marketing (Next.js) |
| `http://localhost:8787` | API (wrangler dev) |

## Third-Party Services

| Service | URL |
|---------|-----|
| Supabase | `https://aqjhuyqhgmmdutwzqvyv.supabase.co` |
| Cloudflare AI Gateway | `gateway.ai.cloudflare.com` |

## Source Mapping

### Platform (`@nyuchi/web`)
- **Domain**: `platform.nyuchi.com`
- **Source**: `apps/platform/`
- **Build**: `npx turbo run build --filter=@nyuchi/web...`
- **Output**: `apps/platform/.next`

### API (`@nyuchi/platform`)
- **Domain**: `api.nyuchi.com`
- **Source**: `cloudflare/`
- **Deploy**: `wrangler deploy --env production`

### Marketing (`@nyuchi/www`)
- **Domain**: `www.nyuchi.com`
- **Source**: `marketing-site/`

## DNS Records

| Type | Name | Target | Proxy |
|------|------|--------|-------|
| CNAME | platform | cname.vercel-dns.com | Off |
| CNAME | api | (Worker route) | On |
| CNAME | www | cname.vercel-dns.com | Off |
| CNAME | community-assets | (R2 bucket) | On |
| CNAME | media | (R2 bucket) | On |

## CORS

API (`api.nyuchi.com`) allows:
- `https://platform.nyuchi.com`
- `https://www.nyuchi.com`
- `http://localhost:3000`
- `http://localhost:3001`
