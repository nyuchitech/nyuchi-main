# Nyuchi Africa Marketing Site

> **www.nyuchi.com** - Marketing and landing pages for Nyuchi Africa Platform

"I am because we are" - Ubuntu Philosophy

## Overview

This is the marketing site for Nyuchi Africa, a community platform for African entrepreneurs. This site is deployed separately from the main platform app and serves as the public-facing marketing presence.

## Domain Architecture

| Site | Domain | Description |
|------|--------|-------------|
| **Marketing (this repo)** | `www.nyuchi.com` | Public marketing site |
| Platform App | `platform.nyuchi.com` | Main application (separate repo) |
| API | `api.nyuchi.com` | Backend API (Cloudflare Worker) |

## Quick Start

```bash
# Install dependencies
npm install

# Run development server (port 3001)
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Environment Variables

Create a `.env.local` file:

```env
# Platform URL (for sign-in/sign-up links)
NEXT_PUBLIC_PLATFORM_URL=https://platform.nyuchi.com
```

## Tech Stack

- **Framework**: Next.js 15
- **UI Library**: Material UI (MUI)
- **Styling**: Tailwind CSS + MUI
- **Deployment**: Vercel

## Project Structure

```
marketing-site/
├── src/
│   ├── app/
│   │   ├── page.tsx           # Landing page
│   │   ├── layout.tsx         # Root layout
│   │   ├── globals.css        # Global styles
│   │   └── get-involved/      # Get involved pages
│   ├── components/
│   │   ├── ThemeProvider.tsx  # MUI theme provider
│   │   └── ZimbabweFlagStrip.tsx
│   └── theme/
│       └── zimbabwe-theme.ts  # Brand colors & theme
├── package.json
├── next.config.js
├── tailwind.config.ts
└── tsconfig.json
```

## Brand Colors

### Nyuchi Brand
- **Sunset Orange**: `#D2691E`
- **Charcoal**: `#36454F`
- **White**: `#FFFFFF`

### Zimbabwe Flag (decorative strip)
- **Green**: `#00A651`
- **Yellow**: `#FDD116`
- **Red**: `#EF3340`
- **Black**: `#000000`

## Deployment

### Vercel (Recommended)

1. Create a new Vercel project
2. Connect this repository
3. Set environment variables:
   - `NEXT_PUBLIC_PLATFORM_URL` = `https://platform.nyuchi.com`
4. Deploy

### Manual

```bash
npm run build
npm start
```

## Pages

- `/` - Landing page with hero, features, and CTAs
- `/get-involved` - Opportunities to join the community

## Adding New Pages

1. Create a new directory in `src/app/`
2. Add a `page.tsx` file
3. Use the existing theme and components

## Ubuntu Philosophy

This project follows Ubuntu philosophy - "I am because we are":

1. **Community features are always free** - No paywalls on community routes
2. **Collaboration over competition** - Design for collective benefit
3. **African identity** - Zimbabwe flag colors in design system
4. **"I am because we are"** - Every feature should uplift the community

## License

Proprietary - Nyuchi Africa

---

*Built with Ubuntu philosophy for the African entrepreneur community*
