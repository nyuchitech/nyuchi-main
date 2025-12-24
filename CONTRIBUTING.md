# Contributing

## Development Setup

```bash
git clone <repo-url>
cd nyuchi-main
npm install
cp .env.example .env.local
npm run dev
```

## Branch Naming

- `feature/<name>` - New features
- `fix/<name>` - Bug fixes
- `refactor/<name>` - Code refactoring
- `docs/<name>` - Documentation updates

## Commit Messages

Use conventional commits:

```
feat: add user profile page
fix: resolve auth redirect issue
refactor: simplify dashboard layout
docs: update README with new structure
chore: update dependencies
```

## Pull Requests

1. Create a feature branch from `main`
2. Make your changes
3. Run `npm run lint` and `npm run typecheck`
4. Update CHANGELOG.md under `[Unreleased]`
5. Submit PR with clear description

## Code Style

- TypeScript strict mode
- shadcn/ui + Tailwind for components
- Lucide for icons
- Hono for API workers

## Project Structure

```
platform/          # Next.js frontend
workers/           # Cloudflare Workers
supabase/          # Database migrations
```

## Documentation

When making changes, update:
- README.md - If adding features or changing setup
- CHANGELOG.md - All notable changes
- Code comments - For complex logic
