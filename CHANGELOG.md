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
- shadcn/ui components (button, card, avatar, input, separator)
- `components.json` for shadcn/ui configuration
- Nyuchi brand colors in Tailwind config
- CSS variables for theming (light/dark mode)

### Removed
- MUI dependencies (@mui/material, @mui/icons-material, @emotion/*)
- React Native dependencies (react-native-paper, react-native-web, react-native-vector-icons)
- Legacy `cloudflare/` API (replaced by multi-worker architecture in `workers/`)

## [1.0.0] - 2024-12-24

### Added
- Initial platform release
- Multi-worker Cloudflare architecture (api, workflows, jobs, uploads, notifications)
- Supabase authentication and database
- Ubuntu philosophy scoring system
- Business directory and content management
- Travel listings
- Admin dashboard with role-based access
