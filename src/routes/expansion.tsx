import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { CheckCircle2, Clock, Circle } from "lucide-react";
import { Shell } from "@/components/safari/Shell";
import { MaasaiDivider } from "@/components/safari/MaasaiDivider";
import { expansionCountries, roadmap, images } from "@/lib/safari-data";

export const Route = createFileRoute("/expansion")({
  head: () => ({
    meta: [
      { title: "Global Expansion Map — SAFARI" },
      {
        name: "description",
        content:
          "SAFARI roadmap across Kenya, Tanzania, Uganda, and Rwanda. Pan-East African platform.",
      },
      { property: "og:title", content: "SAFARI — Pan-EAC Expansion" },
      {
        property: "og:description",
        content: "Live in Kenya & Tanzania. Uganda Q2. Rwanda Q3.",
      },
      { property: "og:image", content: images.savanna },
    ],
  }),
  component: ExpansionPage,
});

// Approximate centroids for SVG map (East Africa region)
const countryDots: Record<string, { x: number; y: number }> = {
  KE: { x: 280, y: 200 },
  TZ: { x: 270, y: 290 },
  UG: { x: 220, y: 180 },
  RW: { x: 195, y: 230 },
};

function ExpansionPage() {
  return (
    <Shell>
      <div className="mx-auto max-w-7xl space-y-10">
        <header>
          <span className="text-xs uppercase tracking-[0.18em] text-[var(--maasai)] font-semibold">
            Ukuzaji · Continental rollout
          </span>
          <h1 className="font-display text-4xl sm:text-5xl font-bold mt-2">
            One Safari, All of East Africa
          </h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            From Maasai Mara to Bwindi — a single platform unifying tourism across the East
            African Community.
          </p>
        </header>

        {/* MAP */}
        <section className="glass-strong rounded-3xl p-6 sm:p-10 relative overflow-hidden">
          <div className="absolute inset-0 maasai-pattern opacity-[0.04]" />
          <div className="relative grid lg:grid-cols-[1.2fr_1fr] gap-8 items-center">
            <svg viewBox="0 0 460 420" className="w-full h-auto max-h-[500px]">
              <defs>
                <radialGradient id="bg" cx="50%" cy="50%" r="60%">
                  <stop offset="0%" stopColor="oklch(0.78 0.1 75)" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="oklch(0.55 0.16 142)" stopOpacity="0.05" />
                </radialGradient>
              </defs>
              <rect x="0" y="0" width="460" height="420" fill="url(#bg)" rx="20" />

              {/* Stylized country shapes */}
              <g opacity="0.85">
                {/* Kenya */}
                <path
                  d="M 240 130 L 340 130 L 360 220 L 320 270 L 230 260 L 220 180 Z"
                  fill="oklch(0.68 0.13 75 / 0.35)"
                  stroke="oklch(0.68 0.13 75)"
                  strokeWidth="1.5"
                />
                {/* Tanzania */}
                <path
                  d="M 200 270 L 340 270 L 350 360 L 220 380 L 180 340 Z"
                  fill="oklch(0.55 0.16 142 / 0.35)"
                  stroke="oklch(0.55 0.16 142)"
                  strokeWidth="1.5"
                />
                {/* Uganda */}
                <path
                  d="M 175 140 L 240 130 L 250 200 L 200 230 L 165 200 Z"
                  fill="oklch(0.78 0.1 75 / 0.22)"
                  stroke="oklch(0.78 0.1 75)"
                  strokeWidth="1.5"
                  strokeDasharray="4 3"
                />
                {/* Rwanda */}
                <path
                  d="M 175 215 L 215 215 L 220 250 L 180 250 Z"
                  fill="oklch(0.52 0.21 22 / 0.18)"
                  stroke="oklch(0.52 0.21 22)"
                  strokeWidth="1.5"
                  strokeDasharray="4 3"
                />
              </g>

              {/* dots & labels */}
              {expansionCountries.map((c) => {
                const pos = countryDots[c.code];
                const isLive = c.status === "active";
                return (
                  <g key={c.code}>
                    {isLive && (
                      <circle cx={pos.x} cy={pos.y} r="14" fill="var(--maasai)" opacity="0.25">
                        <animate
                          attributeName="r"
                          values="10;22;10"
                          dur="2.4s"
                          repeatCount="indefinite"
                        />
                        <animate
                          attributeName="opacity"
                          values="0.4;0;0.4"
                          dur="2.4s"
                          repeatCount="indefinite"
                        />
                      </circle>
                    )}
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r="6"
                      fill={isLive ? "var(--maasai)" : c.status === "soon" ? "var(--gold)" : "var(--muted-foreground)"}
                      stroke="white"
                      strokeWidth="2"
                    />
                    <text
                      x={pos.x + 12}
                      y={pos.y + 4}
                      fontSize="13"
                      fontWeight="700"
                      fill="currentColor"
                    >
                      {c.flag} {c.name}
                    </text>
                    <text
                      x={pos.x + 12}
                      y={pos.y + 18}
                      fontSize="9"
                      fill="currentColor"
                      opacity="0.6"
                    >
                      {c.phase}
                    </text>
                  </g>
                );
              })}
            </svg>

            <div className="space-y-3">
              {expansionCountries.map((c, i) => (
                <motion.div
                  key={c.code}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="glass rounded-xl p-4"
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{c.flag}</span>
                      <span className="font-display text-lg font-bold">{c.name}</span>
                    </div>
                    <span
                      className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold ${
                        c.status === "active"
                          ? "bg-[var(--maasai)] text-white"
                          : c.status === "soon"
                            ? "bg-[var(--gold)] text-[var(--gold-foreground)]"
                            : "bg-foreground/10 text-muted-foreground"
                      }`}
                    >
                      {c.phase}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{c.note}</p>
                  <div className="mt-2 flex gap-4 text-[11px]">
                    <span>
                      <strong className="text-[var(--gold)]">{c.parks}</strong> parks
                    </span>
                    <span>
                      <strong className="text-[var(--forest)]">{c.operators}</strong> operators
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <MaasaiDivider />

        {/* Roadmap */}
        <section>
          <h2 className="font-display text-3xl font-bold mb-6">Roadmap to Series A</h2>
          <ol className="relative border-l-2 border-dashed border-border ml-3 space-y-6">
            {roadmap.map((r, i) => {
              const isDone = i === 0;
              const isCurrent = i === 1;
              return (
                <motion.li
                  key={r.quarter}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="pl-6 relative"
                >
                  <span className="absolute -left-[11px] top-1 grid h-5 w-5 place-items-center rounded-full bg-background border-2 border-border">
                    {isDone ? (
                      <CheckCircle2 className="h-4 w-4 text-[var(--forest)]" />
                    ) : isCurrent ? (
                      <Clock className="h-3.5 w-3.5 text-[var(--maasai)]" />
                    ) : (
                      <Circle className="h-3 w-3 text-muted-foreground" />
                    )}
                  </span>
                  <div className="text-xs uppercase tracking-wider text-[var(--gold)] font-bold">
                    {r.quarter}
                  </div>
                  <div className="mt-1 text-base sm:text-lg font-medium">{r.milestone}</div>
                </motion.li>
              );
            })}
          </ol>
        </section>
      </div>
    </Shell>
  );
}
