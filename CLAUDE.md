# CLAUDE.md

Instructions for Claude Code when working on this repository.

## Commands

```bash
npm install          # Install dependencies
npm run dev          # Start development
npm run build        # Build all
npm run lint         # Lint
npm run typecheck    # Type check
```

## Structure

- `platform/` - Next.js frontend
- `workers/` - Cloudflare Workers API
- `supabase/` - Database migrations

## Rules

1. Use **shadcn/ui + Tailwind + Lucide** for UI
2. Workers share code via `workers/shared/` only
3. Platform libs are in `platform/src/lib/`
4. Never import between platform and workers
5. Database types generated from Supabase

## Conventions

- TypeScript strict mode
- Hono for API workers
- Supabase for auth and database
- Lucide icons (not MUI or emojis)

## Documentation Requirements

When making changes, always update the relevant documentation:

| Change Type | Update |
|-------------|--------|
| New feature | README.md, CHANGELOG.md |
| Bug fix | CHANGELOG.md |
| Breaking change | README.md, CHANGELOG.md |
| Structure change | README.md, CHANGELOG.md |
| New dependency | README.md (if notable) |
| Config change | README.md |

### CHANGELOG.md Format

Add entries under `[Unreleased]`:
```markdown
### Added
- New feature description

### Changed
- Change description

### Fixed
- Bug fix description

### Removed
- Removed feature description
```

### Core Documentation Files

- `README.md` - Project overview, setup, architecture
- `CHANGELOG.md` - Version history and changes
- `CONTRIBUTING.md` - Contribution guidelines
