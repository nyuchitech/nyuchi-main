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
- `components.json` for shadcn/ui configuration
- Unified theme constants (`platform/src/theme/index.ts`)

### Removed
- MUI dependencies (@mui/material, @mui/icons-material, @emotion/*)
- React Native dependencies (react-native-paper, react-native-web, react-native-vector-icons)
- Legacy `cloudflare/` API (replaced by multi-worker architecture in `workers/`)
- Legacy theme files (`zimbabwe-theme.ts`, `nyuchi-theme.ts`)
- React Native Paper components (PaperProvider, GlobalLayout, ZimbabweFlagStrip)
- ThemeProvider (replaced with Tailwind dark mode)

## [1.0.0] - 2024-12-24

### Added
- Initial platform release
- Multi-worker Cloudflare architecture (api, workflows, jobs, uploads, notifications)
- Supabase authentication and database
- Ubuntu philosophy scoring system
- Business directory and content management
- Travel listings
- Admin dashboard with role-based access
