## SAFARI Icon System

A single, unified icon layer the whole app imports from. Built on Lucide (already used everywhere) with a thin wrapper that enforces stroke width, sizing tiers, color states, and hover motion — plus 3 custom brand icons (Safari Jeep, Acacia Tree, Tent) so we own the look.

### What gets built

1. **`src/components/icons/SafariIcon.tsx`** — wrapper component
   - Props: `name`, `size` ("sm" 16 / "md" 20 / "nav" 24 / "feature" 32), `tone` ("default" | "active" | "muted" | "disabled" | "premium"), `interactive` (adds hover scale 1.05 + 150ms color shift), `className`
   - Forces `strokeWidth={1.75}`, round caps/joins
   - Tone mapping uses CSS tokens (no hardcoded hex):
     - default → `text-muted-foreground`
     - active → `text-[var(--gold)]`
     - muted → `text-foreground/60`
     - disabled → `text-foreground/30`
     - premium → duotone effect via gold fill at 15% + gold stroke (used only for AI/premium icons)

2. **`src/components/icons/registry.ts`** — single source of truth
   - Maps semantic names → Lucide components or custom SVGs
   - Categories per spec: nav, travel, booking, social, ai, utility
   - Names: `home, explore, trips, bookings, profile, map, pin, compass, jeep, tent, mountain, calendar, ticket, wallet, payment, receipt, chat, notifications, like, share, ai, recommendations, insights, search, filter, settings, menu, back`

3. **`src/components/icons/custom/`** — 3 hand-crafted SVG components
   - `Jeep.tsx` — silhouette safari vehicle, 24px grid, 1.75 stroke
   - `Acacia.tsx` — flat-top acacia tree
   - `Tent.tsx` — luxury safari tent
   - All use `currentColor`, `stroke-linecap="round"`, `stroke-linejoin="round"` for visual parity with Lucide

4. **`src/components/icons/index.ts`** — barrel export: `SafariIcon`, `iconRegistry`, type `IconName`

5. **Refactor key surfaces to use SafariIcon:**
   - `src/components/safari/Shell.tsx` — desktop nav, mobile tab bar (uses active tone on selected)
   - Direct Lucide imports remain valid elsewhere (no breaking change), but Shell becomes the showcase

6. **`src/routes/icons.tsx`** — internal usage-guideline page at `/icons`
   - Live grid of all icons grouped by category
   - Size scale demo (16/20/24/32)
   - State demo (default/active/hover/disabled/premium)
   - Spacing rules card ("8px between icon and text")
   - Light + dark mode shown via existing theme toggle (no new code needed — design tokens already adapt)

### Design token usage

No new colors. Reuses existing tokens which already match the brief:
- `--gold` (Lion Gold) ≈ Savannah Gold accent
- `--muted-foreground` for default neutral
- `--maasai` reserved for destructive only (not icon default)

The `tone="premium"` duotone wraps the icon in a `relative` span with a soft gold radial behind at 15% opacity.

### Interaction

`interactive` prop adds:
```
transition-all duration-150 ease-out hover:scale-105 hover:text-[var(--gold)]
```

### Files

```text
src/components/icons/
  SafariIcon.tsx        new
  registry.ts           new
  index.ts              new
  custom/
    Jeep.tsx            new
    Acacia.tsx          new
    Tent.tsx            new
src/components/safari/Shell.tsx   edit (swap nav icons)
src/routes/icons.tsx              new (showcase + guidelines)
```

### Out of scope (ask if you want these)

- Replacing every `lucide-react` import across all 17 routes (can be done incrementally; wrapper is opt-in)
- Figma export / SVG sprite file generation
- Standalone downloadable SVG library zip
