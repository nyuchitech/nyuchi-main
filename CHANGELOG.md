# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Changed
- Restructured monorepo: `apps/platform/` → `platform/`, `cloudflare/workers/` → `workers/`
- Migrated UI from MUI + React Native Paper to shadcn/ui + Tailwind + Lucide
- Moved `packages/database` and `packages/ubuntu` into `platform/src/lib/`
- Removed `packages/` directory (auth, stripe, ui packages removed)
- Removed `marketing-site/` (moved to separate repository)
- Simplified `next.config.js` (removed React Native Web webpack config)

### Added
- **Nyuchi Brand System v6** - Five African Minerals palette
  - Cobalt (Katanga/Zambian Copperbelt): Primary actions
  - Tanzanite (Merelani Hills, Tanzania): Secondary/premium
  - Malachite (Congo Copper Belt): Success states
  - Gold (Ghana, South Africa, Mali): Highlights/emphasis
  - Terracotta (Pan-African Earth): Warm accents
- Design tokens v6: button 12px, card 16px, input 8px border radius
- Zimbabwe flag strip component (`FlagStrip`, `FlagStripCard`)
- Mineral button variants (cobalt, tanzanite, malachite, gold, terracotta)
- WCAG AAA (7:1+) compliant color system with light/dark mode support
- CSS custom properties for all brand colors and design tokens
- shadcn/ui components:
  - `button` - with mineral color variants
  - `card` - with 16px radius
  - `input` - with 8px radius
  - `avatar`, `separator`, `label`
  - `sheet` - for mobile drawer
  - `dropdown-menu` - for user menu
  - `skeleton` - for loading states
  - `flag-strip` - Zimbabwe flag component
  - `theme-toggle` - Dark/Light/System theme switcher
  - `badge` - with mineral and status variants
  - `table` - for DataTable migration
  - `checkbox`, `select`, `textarea`
  - `tooltip`, `dialog`, `alert`
  - `toggle-group` - for view switchers
- Migrated dashboard components to shadcn/ui + Tailwind:
  - `QuickActions` - action cards with Lucide icons
  - `ActivityStream` - real-time community activity feed
  - `UbuntuAIChat` - AI assistant interface
- Migrated DataTable components to shadcn/ui + Tailwind:
  - `DataTable/index.tsx` - main table container with view switching
  - `TableView` - with inline editing support
  - `KanbanView` - Notion-style kanban board
  - `CardView` - grid layout view
  - `EditableCell` - inline cell editing
- Migrated main public pages:
  - Landing page (`app/page.tsx`)
  - Community hub (`app/(public)/community/page.tsx`)
  - Get Involved hub (`app/(public)/get-involved/page.tsx`)
- **Nyuchi Navigation System** (based on Mukoko design):
  - `ThemeProvider` - Theme persistence with localStorage
  - `Header` - Transparent → Frosted glass header with scroll detection
  - `Footer` - Brand footer with Ubuntu philosophy
  - `(public)` route group for community pages
  - Pill-shaped action group with 44px touch targets
  - Dynamic page titles (static mapping + H1 detection)
  - Flash prevention script for theme switching
- `components.json` for shadcn/ui configuration
- Unified theme constants (`platform/src/theme/index.ts`)

### Pending Migration (MUI → shadcn/ui)
- Community sub-pages: `content`, `directory`, `leaderboard`, `travel-directory`
- Get-involved sub-pages: `business-partner`, `community`, `local-expert`, `student-program`, `volunteer`
- Dashboard pages: `admin`, `content`, `directory`, `pipeline`, `settings`, `travel`, `ubuntu`

### Removed
- MUI dependencies (@mui/material, @mui/icons-material, @emotion/*)
- React Native dependencies (react-native-paper, react-native-web, react-native-vector-icons)
- Legacy `cloudflare/` API (replaced by multi-worker architecture in `workers/`)
- Legacy theme files (`zimbabwe-theme.ts`, `nyuchi-theme.ts`)
- React Native Paper components (PaperProvider, GlobalLayout, ZimbabweFlagStrip)
- Legacy ThemeProvider (replaced with new theme system)
- Legacy navigation components (Header, Footer, MobileMenu, MobileNavBar, PageLayout)

## [1.0.0] - 2024-12-24

### Added
- Initial platform release
- Multi-worker Cloudflare architecture (api, workflows, jobs, uploads, notifications)
- Supabase authentication and database
- Ubuntu philosophy scoring system
- Business directory and content management
- Travel listings
- Admin dashboard with role-based access
