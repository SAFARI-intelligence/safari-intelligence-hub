
# Safari OS — East African Tourism Platform MVP

A premium, VC-presentable AI tourism platform with 7 integrated screens, glassmorphism UI, and a Lion Gold / Maasai Red / Forest Green palette.

## Architecture
- **Stack**: TanStack Start (React 19 + Vite 7), Tailwind v4, shadcn/ui
- **Routing**: Separate route files per screen (proper SSR + SEO, not hash anchors)
- **Data**: Mocked in-memory data layer (parks, wildlife sightings, bookings, points, operators) — easily swappable for live APIs later
- **State**: Local component state + URL search params for filters; localStorage for Simba Points persistence

## Design System
- **Palette** (CSS variables in `styles.css`):
  - Lion Gold `#C68E17` (primary CTA, accents)
  - Maasai Red `#BE0027` (alerts, "live tracking" indicators)
  - Forest Green `#228B22` (success, conservation themes)
  - Savanna ivory background, deep charcoal text
- **Glassmorphism**: `backdrop-blur-xl`, semi-transparent white/dark surfaces, soft shadows, 1px hairline borders
- **Cultural cues**: SVG Maasai geometric pattern (triangles, beadwork rhythm) used as section dividers and card borders; Swahili microcopy ("Karibu", "Hakuna Matata", "Twende!", "Asante")
- **Hero imagery**: User-uploaded safari photos (lion, elephants, cheetah, zebra, buffalo, beach/coast) imported into `src/assets`

## Routes (7-Screen MVP + shared shell)
1. **`/` Explorer Dashboard** — Hero with lion image, grid of East African parks (Maasai Mara, Serengeti, Bwindi, Volcanoes NP, Murchison, Akagera) each showing live "Wildlife Intelligence" status (active sightings count, last update, AI confidence score), weather, and quick-book CTA
2. **`/wildlife`Wildlife Story Feed** — Timeline of AI-generated narratives ("A herd of 12 elephants moved 3km north toward Talek River at dawn…") with species filter, map thumbnail, and a visible "B2B API" panel showing the JSON payload + sample `curl` request
3. **`/book` Booking Engine** — Package cards (3-day Mara, 5-day Serengeti, Gorilla Trek, Coastal Combo) with KSh-primary pricing (USD secondary), date picker, traveler count, and a loading state that cycles authentic Swahili proverbs ("Haraka haraka haina baraka" — Hurry has no blessing)
4. **`/simba` Simba Points Portal** — Gamified dashboard: points balance, tier (Cub → Lioness → Simba → Mfalme), adopted animals carousel (cheetah, elephant calf), achievement badges, leaderboard
5. **`/operators` Operator Command Center** — Table of listings with status, leads inbox, revenue chart (Recharts), quick actions to add/edit packages
6. **`/intelligence` Wildlife Intelligence Seed** — Manual data entry form for rangers/operators: species, count, GPS, behavior, photo upload, confidence — feeds the Story Feed; recent seeded entries table below
7. **`/expansion` Global Expansion Map** — SVG map of East Africa with Kenya (live), Tanzania (live), Uganda (Q2), Rwanda (Q3) phases, country stat cards, and roadmap timeline

## Shared Shell
- Glass top nav with Safari OS wordmark (lion gold), nav links, Simba Points pill, language toggle (EN/SW)
- Mobile drawer nav
- Footer with Maasai pattern divider

## Per-route SEO
Every route gets unique `head()` with title, description, og:title, og:description, and og:image pointing to the route's hero photo.

## What you'll see
A clickable, premium-feeling prototype where every screen is real, navigable, and demo-ready — ideal for VC walkthroughs.
