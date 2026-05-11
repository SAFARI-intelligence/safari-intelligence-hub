# SAFARI Platform (Production Upgrade)

SAFARI is now structured as a production-grade monorepo for an AI-powered tourism platform:

- Mobile app: Expo React Native in `apps/mobile`
- Backend API: NestJS in `apps/api`
- Shared packages:
  - `packages/contracts` (platform types and API contracts)
  - `packages/utils` (shared API client + validation schemas)
  - `packages/config` (typed env validation)
  - `packages/ui` (shared design tokens)

## Backend Production Capabilities

- Prisma ORM + PostgreSQL persistence
- PostGIS-enabled geospatial layer
- JWT access + refresh token auth
- Role-based control (`tourist`, `partner`, `admin`)
- Stripe-ready subscription and promotion flows
- Analytics pipeline (DB + PostHog integration)
- Redis cache layer + BullMQ queue scaffolding
- Context-aware AI concierge with conversation memory

## Important Paths

- Prisma schema: `apps/api/prisma/schema.prisma`
- Demo seed: `apps/api/prisma/seed.ts`
- PostGIS trigger/index SQL: `apps/api/prisma/postgis.sql`
- API bootstrap SQL helper: `apps/api/db/schema.sql`

## API Surface (Key)

- Auth:
  - `POST /auth/signup`
  - `POST /auth/login`
  - `POST /auth/refresh`
  - `POST /auth/logout`
  - `GET /auth/me`
- Users:
  - `GET /users/me`
- Wildlife:
  - `GET /animals?page=&limit=`
  - `GET /animals/:id`
  - `GET /stories?animalId=&page=&limit=`
  - `GET /stories/:animalId`
- Hospitality:
  - `GET /hotels?page=&limit=&featured=`
  - `GET /hotels/:id`
  - `POST /hotels/:id/click`
- Geo Intelligence:
  - `GET /map/nearby?lat=&lng=&radiusKm=&type=&page=&limit=`
  - `GET /map/routes/suggestions?limit=`
  - `GET /map/offline-packs` (JWT + Safari+/Partner)
- AI Concierge:
  - `POST /ai/chat` (JWT)
- Monetization:
  - `POST /billing/upgrade` (JWT)
  - `POST /billing/webhook`
  - `POST /billing/hotels/:hotelId/promote` (partner/admin)
  - `GET /billing/commissions` (admin)
- Analytics:
  - `GET /analytics/summary?days=` (admin)
- System:
  - `GET /system/health`

## Environment

Copy `.env.example` to `.env` and fill required values:

- Platform: `DATABASE_URL`, `REDIS_URL`
- Auth: `JWT_SECRET`, `JWT_REFRESH_SECRET`
- AI: `OPENAI_API_KEY`, `OPENAI_MODEL`
- Billing: `STRIPE_SECRET_KEY`, `STRIPE_PRICE_SAFARI_PLUS`, `STRIPE_PRICE_PARTNER`
- Analytics: `POSTHOG_API_KEY`, `POSTHOG_HOST`
- Mobile: `EXPO_PUBLIC_API_BASE_URL`, `EXPO_PUBLIC_MAPBOX_PUBLIC_TOKEN`

`REDIS_URL` is recommended for production; API falls back to in-memory cache/queues when Redis is unavailable.

## Setup (When npm is available)

```bash
npm install
npm run prisma:generate
npm run postgis:extensions
npm run prisma:migrate
npm run prisma:seed
npm run postgis:apply
npm run dev:api
npm run dev:mobile
```

## Codex CLI Integration

Codex reads project guidance from `AGENTS.md` at repo root.

Use these scripts for CLI-driven workflows:

```bash
npm run codex:setup
npm run codex:api
npm run codex:mobile
npm run codex:typecheck
```

## Notes

- `apps/mobile` now uses shared `@safari/utils` API client and upgraded auth token format.
- AI endpoint stores conversation history in Postgres and injects retrieval context from live platform entities.
- Queue workers are scaffolded via BullMQ; processing handlers can be deployed as dedicated worker services next.
