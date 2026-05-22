# portfolio-frontend

Next.js 15 App Router frontend for the portfolio. Provides UI for the Identity, Forum, and Finance services.

## Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- TanStack Query (server-state)
- Zod (schema validation)
- Vitest (unit tests)

## Running locally

```bash
npm install
npm run dev
```

Requires the backend services running (see `portfolio-infra`).

## Structure

```
app/
  (auth)/          Login, register, email confirmation, 2FA
  (household)/     Household, expense, split, income pages (routes to /api/finance/*)
  (forum)/         Communities, threads, comments, voting
  (portfolio)/     Portfolio landing pages
  settings/        User profile and account settings
components/
  layout/          Shell, nav, sidebar
  ui/              Design system primitives
hooks/             TanStack Query data hooks (use-expenses, use-forum, use-household, use-income, use-identity, use-notifications)
lib/               API client, URL helpers, markdown, query keys
schemas/           Zod schemas (auth, finance, forum) — finance schemas call the Finance service
types/             Shared API types
```

## Environment variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Public API base URL (browser) |
| `INTERNAL_API_URL` | Internal API base URL (SSR) |
