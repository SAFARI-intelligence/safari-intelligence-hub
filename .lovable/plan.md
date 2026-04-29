## Status check against the uploaded plan

| Plan section | Status | Notes |
|---|---|---|
| **3. MVP Stability & Security** | ✅ Done last turn | auth on AI endpoint, role-escalation trigger, profiles email no longer public, server-side booking total trigger, RLS on all tables, Google OAuth + email/password, RBAC (user/hotel/support) |
| **2. Hotel onboarding strategy** | Operational (outreach/email) — not buildable in code | The hotel partner UI (`/partner`) already exists for self-onboarding |
| **5. Execution timeline** | Operational — not buildable | |
| **1. Big Five content engine** | ⚠️ Partial — 5 rows seeded but schema is shallow (no hero narrative, no key facts table, no park linkage) | Build this turn |
| **4. Integration flow (Animal → Location → Hotels → Book)** | ❌ Missing — stories don't link to parks/hotels | Build this turn |

So the security task is **fixed**. I'll proceed with the two remaining buildable items: the Big Five content engine + the integration flow.

---

## What I'll build

### 1. Big Five content engine (premium, cinematic)

Upgrade `animal_stories` from a 5-field card into a full content schema:

- `hero_narrative` (cinematic 200–300 word story)
- `key_facts` jsonb — `{ speed, weight, lifespan, habitat, diet, conservation_status }`
- `behavior_insights` text[] (3–5 insights: hunting, social, territory)
- `cultural_relevance` text (Kenyan/African meaning, Swahili name, proverbs)
- `parks` text[] (Maasai Mara, Amboseli, Tsavo, Samburu, etc.) — used to join with `hotels.park`
- `hero_image`, `gallery` text[]
- `slug` text unique (URL-friendly: `lion`, `elephant`, …)

Migration adds the columns + backfills the 5 existing rows with editorial-quality content for Lion (Simba), Elephant (Tembo), Leopard (Chui), Rhino (Kifaru), Buffalo (Nyati).

### 2. Routes & UI

- **`/stories` (refresh)** — cinematic grid: full-bleed hero image cards, Swahili name overlay, narrative tease. Hover lift + glow.
- **`/stories/$slug` (NEW)** — premium animal page:
  1. Cinematic hero (full-bleed image, Playfair Display title, Swahili subtitle)
  2. Hero narrative (drop-cap, generous serif type)
  3. Key facts strip (animated count-up cards: speed / weight / lifespan / status)
  4. Behavior insights (numbered list, Maasai-pattern divider)
  5. Cultural relevance section (cream surface, ochre accent)
  6. **"Where to see" → "Stay nearby"** — queries `hotels` where `park = ANY(animal.parks)` and lists 3–6 hotel cards with **Book** CTA → `/hotels/$hotelId`
- **`/wildlife` & `/`** — add "Featured Big Five" rail linking into `/stories/$slug`.

### 3. Integration flow

`Story page → reads animal.parks → fetches hotels by park → click hotel → existing /hotels/$hotelId booking flow → existing booking trigger validates price`.

This realises the plan's core funnel: **Lion → Maasai Mara → Hotel → Book Experience**.

---

## Technical details

- **Migration**: ALTER TABLE `animal_stories` ADD columns + UPDATE seed rows. RLS already correct (public SELECT, support write).
- **TanStack route**: `src/routes/stories.$slug.tsx` with loader fetching by slug + parallel fetch of hotels matching `parks`.
- **404 / error**: `notFoundComponent` + `errorComponent` per route convention.
- **SEO**: each animal page sets unique `<title>`, `og:title`, `og:description`, `og:image` (hero image), `twitter:image`. Index `/stories` keeps current meta.
- **Performance**: image `loading="lazy"`, single round-trip per page (animal + hotels in `Promise.all`).
- **Design tokens only**: gold/maasai/forest/cream from `styles.css` — no hex literals.
- **No new dependencies**.

---

## Files

```text
supabase/migrations/<new>.sql                  # extend animal_stories + seed Big Five copy
src/routes/stories.tsx                         # cinematic grid refresh
src/routes/stories.$slug.tsx                   # NEW premium animal page
src/routes/wildlife.tsx                        # add Big Five rail (small edit)
src/routes/index.tsx                           # add Big Five rail (small edit)
```

Out of scope: rebuilding the hotel onboarding pipeline (already shipped in `/partner`), running an outreach campaign, voice narration / video (plan calls these "optional").
