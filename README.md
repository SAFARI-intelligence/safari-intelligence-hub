# 🦁 SAFARI — Intelligence Hub

> AI-powered Kenya tourism platform. Built for the traveler who goes deeper.

---

## ⚠️ Active Development Surface — Phase 1

**The Phase 1 product is `apps/web` — the TanStack Start web application.**

All validation work, user interviews, booking flows, and operator onboarding happen here first. The NestJS API and Expo mobile app are scaffolded and version-controlled but are **not active build targets** until Phase 1 gate conditions are cleared.

Do not build features in `apps/api` or `apps/mobile` before the following gates are met:

```
□  50 tourists have used the AI planner
□  10 operators have reviewed the partner dashboard
□  5 bookings completed end-to-end
□  NPS > 40 from beta users
```

**Core principle: Validate → Automate → Scale → Platformize**

---

## Repository Structure

```
safari-intelligence-hub/
│
├── apps/
│   ├── web/                        # ✅ PHASE 1 ACTIVE — TanStack Start + Supabase
│   │   ├── src/routes/             # 38+ pages (booking, wildlife, operator, payments)
│   │   ├── src/components/         # UI: safari/, operator/, pay/, ui/
│   │   ├── src/lib/                # Business logic: safari-data, operator-data, pay
│   │   └── src/hooks/              # Custom React hooks
│   │
│   ├── api/                        # 🔒 PHASE 2 TARGET — NestJS backend
│   │   ├── src/auth/               # JWT strategy + token management
│   │   ├── src/ai/                 # AI concierge service
│   │   ├── src/hotels/             # Hotel search + click tracking
│   │   ├── src/map/                # Geospatial queries (PostGIS)
│   │   ├── src/animals/            # Wildlife species data
│   │   ├── src/billing/            # Subscriptions + hotel promotion
│   │   ├── src/analytics/          # Event tracking
│   │   └── src/stories/            # Content management
│   │
│   └── mobile/                     # 🔒 PHASE 3 TARGET — Expo React Native
│       ├── app/                    # Auth, onboarding, tab navigation
│       ├── components/             # GlassCard, PremiumButton, SectionHeader
│       └── theme/                  # Semantic tokens + motion system
│
├── packages/
│   ├── contracts/                  # Shared TypeScript types + API interfaces
│   ├── utils/                      # API client + validation helpers
│   ├── ui/                         # Design tokens + theme config
│   └── config/                     # Environment schema + validation
│
└── docs/
    └── architecture/
        └── TARGET_MONOREPO_ARCHITECTURE.md   # Phase 2/3 diagram
```

---

## Tech Stack

### Phase 1 — Web (`apps/web`)

| Layer           | Technology                   |
| --------------- | ---------------------------- |
| Framework       | React 19 + TanStack Start    |
| Routing         | TanStack React Router        |
| State           | TanStack React Query         |
| Styling         | Tailwind CSS + Framer Motion |
| UI Primitives   | Radix UI                     |
| Database        | Supabase (PostgreSQL)        |
| Deployment      | Cloudflare Workers           |
| Package Manager | Bun                          |

### Phase 2 — API (`apps/api`)

| Layer     | Technology           |
| --------- | -------------------- |
| Framework | NestJS               |
| ORM       | Prisma + PostGIS     |
| Cache     | Redis                |
| Queue     | Background job queue |
| Payments  | Stripe               |
| AI        | OpenAI API           |

### Phase 3 — Mobile (`apps/mobile`)

| Layer     | Technology         |
| --------- | ------------------ |
| Framework | Expo React Native  |
| Animation | Reanimated + Moti  |
| Auth      | Session management |

---

## Brand

```
Forest Green   #2D5A27   — Primary brand, navigation, CTAs
Savanna Gold   #C9A84C   — Accents, highlights, Simba Points
Maasai Red     #8B1A1A   — Alerts, urgency, special status
Night Black    #1A1209   — Dark backgrounds, body text
Savanna Cream  #F5F0E8   — Light backgrounds, cards
```

---

## Revenue Model

| Stream                | Mechanism                                          | Phase |
| --------------------- | -------------------------------------------------- | ----- |
| Booking commission    | 12–15% per completed booking                       | 1     |
| Consumer subscription | KSh 1,200/mo Simba Pro · KSh 3,500/mo Safari Elite | 1     |
| Operator SaaS         | KSh 8,000/mo Operator Pro                          | 1     |
| Partner listing fees  | Featured placement                                 | 1–2   |
| Wildlife Story API    | B2B data licensing                                 | 4     |

---

## Phase Roadmap

```
Phase 1 — VALIDATE     ← YOU ARE HERE
  Web app live, user interviews, manual wildlife data, first bookings

Phase 2 — AUTOMATE
  NestJS API replaces direct Supabase calls
  n8n workflow automation (booking → conservation calc → Simba Points)
  Wildlife story pipeline automated

Phase 3 — SCALE
  Expo mobile app launched
  Programmatic SEO (200+ animal pages, 50+ destination pages)
  East Africa expansion begins

Phase 4 — PLATFORMIZE
  Wildlife Story API licensed to third parties
  Operator marketplace opens
  $10M ARR target
```

---

## Environment Setup

Copy `.env.example` to `.env.local` in `apps/web/` and fill in:

```
SUPABASE_URL=
SUPABASE_ANON_KEY=
```

Never commit `.env` files. All secrets are managed via environment variables only.

---

## Key Constraint

> Wildlife data requires a **minimum 2-hour zone delay** before public exposure.  
> No automation of wildlife tracking data in Phase 1 — all updates are ranger-submitted manually.

---

_Built in Kenya. For the world._
