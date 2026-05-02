import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SafariIcon, iconRegistry, type IconName, type IconTone } from "@/components/icons";

export const Route = createFileRoute("/icons")({
  component: IconsPage,
  head: () => ({
    meta: [
      { title: "Icon System · SAFARI" },
      {
        name: "description",
        content:
          "The SAFARI Icon System — unified, premium iconography. Outline-first, 1.75 stroke, brand custom icons, and consistent states across light and dark.",
      },
    ],
  }),
});

const categoryOrder = ["nav", "travel", "booking", "social", "ai", "utility"] as const;
const categoryLabel: Record<(typeof categoryOrder)[number], { en: string; sw: string }> = {
  nav: { en: "Navigation", sw: "Mwongozo" },
  travel: { en: "Travel", sw: "Safari" },
  booking: { en: "Booking", sw: "Hifadhi" },
  social: { en: "Social", sw: "Jamii" },
  ai: { en: "AI", sw: "Akili" },
  utility: { en: "Utility", sw: "Zana" },
};

function IconsPage() {
  const [tone, setTone] = useState<IconTone>("default");

  const grouped = categoryOrder.map((cat) => ({
    cat,
    items: (Object.entries(iconRegistry) as [IconName, (typeof iconRegistry)[IconName]][])
      .filter(([, def]) => def.category === cat)
      .map(([name, def]) => ({ name, custom: !!("custom" in def && def.custom) })),
  }));

  return (
    <div className="mx-auto max-w-7xl space-y-12">
      {/* Hero */}
      <section className="glass-strong rounded-3xl p-8 sm:p-12">
        <p className="font-label text-xs tracking-[0.25em] text-[var(--gold)] mb-3">
          DESIGN SYSTEM · NIDHAMU
        </p>
        <h1 className="font-display text-4xl sm:text-6xl font-bold tracking-tight">
          The SAFARI Icon System
        </h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          One unified iconography for every surface — built on a refined Lucide foundation,
          extended with custom safari-native marks. 1.75px stroke. Round joins. Equal weight.
          Premium by default.
        </p>
        <div className="mt-6 flex flex-wrap gap-2 text-xs">
          <Pill>Stroke 1.75</Pill>
          <Pill>24 / 32 grid</Pill>
          <Pill>Round caps</Pill>
          <Pill>Outline + duotone accents</Pill>
          <Pill>Light + dark</Pill>
        </div>
      </section>

      {/* Size scale */}
      <section>
        <SectionHeading title="Size scale" sw="Saizi" caption="16 · 20 · 24 · 32" />
        <div className="glass rounded-2xl p-8 flex flex-wrap items-end gap-10">
          {[
            { label: "sm · 16", size: "sm" as const, ctx: "Inline / button" },
            { label: "md · 20", size: "md" as const, ctx: "Tab bar / chips" },
            { label: "nav · 24", size: "nav" as const, ctx: "Primary nav" },
            { label: "feature · 32", size: "feature" as const, ctx: "Feature highlight" },
          ].map((s) => (
            <div key={s.label} className="flex flex-col items-center gap-2">
              <div className="grid place-items-center h-14">
                <SafariIcon name="compass" size={s.size} tone="active" />
              </div>
              <p className="font-mono text-[11px] text-foreground">{s.label}</p>
              <p className="text-[11px] text-muted-foreground">{s.ctx}</p>
            </div>
          ))}
        </div>
      </section>

      {/* States */}
      <section>
        <SectionHeading title="States" sw="Hali" caption="default · active · muted · disabled · premium" />
        <div className="glass rounded-2xl p-8 grid grid-cols-2 sm:grid-cols-5 gap-6">
          {(["default", "active", "muted", "disabled", "premium"] as IconTone[]).map((t) => (
            <div
              key={t}
              className="flex flex-col items-center gap-3 py-4 rounded-xl border border-border/50"
            >
              <SafariIcon name="ai" size="feature" tone={t} />
              <span className="font-mono text-[11px] capitalize text-foreground">{t}</span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Hover any icon below to see the 150ms ease-out transition (scale 1.05 + gold shift).
        </p>
      </section>

      {/* Library */}
      <section>
        <div className="flex items-end justify-between mb-4 flex-wrap gap-3">
          <SectionHeading
            title="The library"
            sw="Maktaba"
            caption={`${Object.keys(iconRegistry).length} icons across 6 categories`}
          />
          <div className="flex items-center gap-1 glass rounded-full p-1">
            {(["default", "active", "muted", "disabled"] as IconTone[]).map((t) => (
              <button
                key={t}
                onClick={() => setTone(t)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition ${
                  tone === t
                    ? "bg-[var(--gold)] text-[var(--gold-foreground)]"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-8">
          {grouped.map(({ cat, items }) => (
            <div key={cat}>
              <div className="flex items-baseline gap-3 mb-3">
                <h3 className="font-display text-2xl font-semibold">
                  {categoryLabel[cat].en}
                </h3>
                <span className="font-label text-[11px] tracking-[0.2em] text-muted-foreground">
                  {categoryLabel[cat].sw.toUpperCase()}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {items.map((it) => (
                  <div
                    key={it.name}
                    className="group glass rounded-xl p-4 flex flex-col items-center gap-3 hover:shadow-[var(--shadow-glow-gold)] transition-all"
                  >
                    <div className="h-10 grid place-items-center">
                      <SafariIcon name={it.name} size="nav" tone={tone} interactive />
                    </div>
                    <div className="text-center">
                      <p className="font-mono text-[11px] text-foreground">{it.name}</p>
                      {it.custom && (
                        <p className="mt-0.5 font-label text-[9px] tracking-[0.2em] text-[var(--gold)]">
                          CUSTOM
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Usage rules */}
      <section>
        <SectionHeading title="Usage rules" sw="Sheria" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <RuleCard
            title="8px between icon & text"
            body="Always pair an icon with at least 8px of breathing room. Tighter feels cramped; looser breaks the rhythm."
            demo={
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border/60">
                <SafariIcon name="pin" size="sm" tone="active" />
                <span className="text-sm">Maasai Mara</span>
              </div>
            }
          />
          <RuleCard
            title="Active = Lion Gold"
            body="Reserve the gold tone for the active state of navigation, selected filters, and the AI moments. Never decorative."
            demo={
              <div className="flex items-center gap-3">
                <SafariIcon name="home" size="nav" tone="muted" />
                <SafariIcon name="explore" size="nav" tone="muted" />
                <SafariIcon name="ai" size="nav" tone="active" />
                <SafariIcon name="profile" size="nav" tone="muted" />
              </div>
            }
          />
          <RuleCard
            title="Premium duotone for AI only"
            body="The soft gold halo behind an icon signals intelligence and luxury. Use sparingly — once per screen."
            demo={
              <SafariIcon name="ai" size="feature" tone="premium" />
            }
          />
          <RuleCard
            title="Never mix outline + filled"
            body="Every icon in this system is outline at 1.75 stroke. Filled marks break the visual weight and the brand."
            demo={
              <div className="flex items-center gap-3">
                <SafariIcon name="like" size="nav" />
                <SafariIcon name="share" size="nav" />
                <SafariIcon name="chat" size="nav" />
                <SafariIcon name="notifications" size="nav" />
              </div>
            }
          />
          <RuleCard
            title="Brand icons own the story"
            body="Jeep, Tent, Acacia — these are us. Lean on them where the moment is uniquely safari."
            demo={
              <div className="flex items-center gap-4">
                <SafariIcon name="jeep" size="feature" tone="active" />
                <SafariIcon name="tent" size="feature" tone="active" />
                <SafariIcon name="acacia" size="feature" tone="active" />
              </div>
            }
          />
          <RuleCard
            title="Sizing by context"
            body="16 inline · 20 chips & tabs · 24 nav · 32 feature highlights. No improvisation in between."
            demo={
              <div className="flex items-end gap-3">
                <SafariIcon name="compass" size="sm" />
                <SafariIcon name="compass" size="md" />
                <SafariIcon name="compass" size="nav" />
                <SafariIcon name="compass" size="feature" />
              </div>
            }
          />
        </div>
      </section>

      {/* Code */}
      <section className="pb-20">
        <SectionHeading title="Use it" sw="Tumia" />
        <pre className="glass-strong rounded-2xl p-6 overflow-x-auto text-xs font-mono leading-relaxed">
{`import { SafariIcon } from "@/components/icons";

<SafariIcon name="ai" size="nav" tone="premium" />
<SafariIcon name="jeep" size="feature" tone="active" interactive />
<SafariIcon name="search" size="md" />`}
        </pre>
      </section>
    </div>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="px-3 py-1 rounded-full border border-border/60 text-muted-foreground font-mono">
      {children}
    </span>
  );
}

function SectionHeading({
  title,
  sw,
  caption,
}: {
  title: string;
  sw: string;
  caption?: string;
}) {
  return (
    <div className="mb-5">
      <div className="flex items-baseline gap-3 flex-wrap">
        <h2 className="font-display text-3xl font-bold">{title}</h2>
        <span className="font-label text-xs tracking-[0.25em] text-[var(--gold)]">
          {sw.toUpperCase()}
        </span>
      </div>
      {caption && <p className="text-xs text-muted-foreground mt-1">{caption}</p>}
    </div>
  );
}

function RuleCard({
  title,
  body,
  demo,
}: {
  title: string;
  body: string;
  demo: React.ReactNode;
}) {
  return (
    <div className="glass rounded-2xl p-5 flex flex-col gap-4">
      <div className="min-h-[64px] grid place-items-center rounded-xl bg-foreground/[0.025] border border-border/40 py-4">
        {demo}
      </div>
      <div>
        <h4 className="font-display text-lg font-semibold">{title}</h4>
        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{body}</p>
      </div>
    </div>
  );
}
