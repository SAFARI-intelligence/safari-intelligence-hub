# SAFARI - Codex CLI Project Guide

This repository is optimized for Codex CLI workflows.

## Project Layout

- `apps/mobile` - Expo React Native app (tourist UX)
- `apps/api` - NestJS backend (auth, AI concierge, map, monetization)
- `packages/contracts` - shared platform contracts/types
- `packages/utils` - shared API client + validation
- `packages/ui` - shared tokens and UI config
- `packages/config` - environment schema utilities

## Preferred Commands

- Install and bootstrap:
  - `npm run codex:setup`
- Run API:
  - `npm run codex:api`
- Run mobile:
  - `npm run codex:mobile`
- Typecheck all:
  - `npm run codex:typecheck`

## Mobile Design System Rules

- Animation stack is locked:
  - `react-native-reanimated` (performance/control)
  - `moti` (declarative patterns)
- No additional animation libraries.
- Theming uses semantic tokens from `apps/mobile/lib/theme.ts`.
- Red accent is action-only (CTA/active/critical), not large surfaces.

## Contribution Guardrails

- Keep changes scoped and production-safe.
- Prefer shared contracts over duplicate ad hoc types.
- Do not break route guards:
  - no token -> `/auth`
  - token + not onboarded -> `/onboarding`
  - token + onboarded -> `/(tabs)/home`

