# AndraDev — Growtopia Gacha Website

Sistem gacha berbasis Growtopia untuk komunitas gaming Indonesia. Members login untuk pull gacha, transfer saldo, dan perpanjang akun. Admin punya panel lengkap untuk mengatur member, chest, item, dan tampilan situs.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/andradev/` — React + Vite frontend (route: `/`)
- `artifacts/api-server/` — Express 5 API server (route: `/api`)
- `lib/db/src/schema/` — Drizzle ORM schema (users, chests, gacha_items, gacha_history, site_settings)
- `lib/api-spec/openapi.yaml` — OpenAPI spec (source of truth for API contracts)
- `lib/api-client-react/` — generated React Query hooks
- `lib/api-zod/` — generated Zod schemas
- `artifacts/andradev/src/pages/` — Login, Dashboard, Gacha, Transfer, Renew, Admin
- `artifacts/andradev/src/components/layout/` — Shell, Background, MusicPlayer, ClockWidget
- `artifacts/andradev/src/lib/token.ts` — localStorage token helpers (separate from use-auth.tsx for HMR stability)

## Architecture decisions

- Token storage separated into `src/lib/token.ts` so `use-auth.tsx` only exports React hooks/components — prevents Vite Fast Refresh HMR invalidation.
- Settings are fetched from `/api/settings` on every page load; admin can change theme/bg/music and it propagates globally via React Query cache.
- New site_settings columns (bgType, bgValue, themeMode, customLabels, musicUrl) added via `db push`; matched in OpenAPI spec and regenerated Zod/hooks.
- Gacha balance deduction: on pull success, `setUser({...user, balance: result.remainingBalance})` immediately updates UI before query invalidation.
- 3 gacha chest types (basic/rare/mythic), each with configurable cost, chance%, and item pool managed from admin panel.

## Product

- **Login** — username/password with 3-attempt lockout, shows split-panel branded design
- **Dashboard** — balance, expiry, quick nav to Gacha/Transfer/Renew; labels customizable by admin
- **Gacha** — pull from Basic/Rare/Mythic chests, animated reveal modal with particle burst, history table
- **Transfer** — send IDR balance to other members
- **Renew** — extend account expiry (cost per day set by admin)
- **Admin** — manage members, chests, items (chance%), site settings (theme, background, music, custom labels)
- **Widgets** — collapsible clock (WIB/WITA/WIT) pill and music player pill, always visible

## User preferences

- Language: Indonesian (Bahasa Indonesia) for UI labels
- Design: dark-first, glass/glow/shimmer aesthetic, Growtopia-inspired
- Widget style: small collapsible pills, not large overlays

## Gotchas

- Do NOT change `info.title` in `lib/api-spec/openapi.yaml` — it controls generated filenames.
- After any schema change: run `pnpm --filter @workspace/db run push` then `pnpm --filter @workspace/api-spec run codegen`.
- Never use `console.log` in API server code — use `req.log` in route handlers.
- `storeToken` / `getStoredToken` must stay in `src/lib/token.ts`, NOT exported from `use-auth.tsx` (breaks HMR).

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
