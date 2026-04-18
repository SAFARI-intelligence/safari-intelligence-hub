import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Sparkles, Heart, Crown } from "lucide-react";
import { Shell } from "@/components/safari/Shell";
import { MaasaiDivider } from "@/components/safari/MaasaiDivider";
import { tiers, adoptions, badges, leaderboard, images } from "@/lib/safari-data";

export const Route = createFileRoute("/simba")({
  head: () => ({
    meta: [
      { title: "Simba Points — Safari OS Loyalty" },
      {
        name: "description",
        content:
          "Earn Simba Points, adopt animals, climb from Cub to Mfalme. Gamified East African safari loyalty.",
      },
      { property: "og:title", content: "Simba Points — Loyalty Portal" },
      {
        property: "og:description",
        content: "Earn points, adopt wildlife, become Mfalme.",
      },
      { property: "og:image", content: images.cheetah },
    ],
  }),
  component: SimbaPage,
});

function SimbaPage() {
  const [points, setPoints] = useState(6_420);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem("simba_points") : null;
    if (stored) setPoints(parseInt(stored, 10));
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("simba_points", String(points));
    }
  }, [points]);

  const currentTierIdx = tiers.findIndex((t, i) => {
    const next = tiers[i + 1];
    return points >= t.min && (!next || points < next.min);
  });
  const currentTier = tiers[currentTierIdx];
  const nextTier = tiers[currentTierIdx + 1];
  const progress = nextTier
    ? ((points - currentTier.min) / (nextTier.min - currentTier.min)) * 100
    : 100;

  return (
    <Shell>
      <div className="mx-auto max-w-7xl space-y-8">
        <header>
          <span className="text-xs uppercase tracking-[0.18em] text-[var(--maasai)] font-semibold">
            Asante kwa kuja · Welcome back
          </span>
          <h1 className="font-display text-4xl sm:text-5xl font-bold mt-2">Simba Points</h1>
        </header>

        {/* Hero card */}
        <div className="relative overflow-hidden rounded-3xl glass-strong p-6 sm:p-8">
          <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-gradient-to-br from-[var(--gold)]/40 to-[var(--maasai)]/40 blur-3xl" />
          <div className="relative grid sm:grid-cols-[1fr_auto] gap-6 items-end">
            <div>
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                <Crown className="h-4 w-4" /> Current tier
              </div>
              <div className="mt-1 flex items-baseline gap-3">
                <span
                  className="font-display text-4xl sm:text-5xl font-bold"
                  style={{ color: currentTier.color }}
                >
                  {currentTier.name}
                </span>
                <span className="text-sm text-muted-foreground italic">
                  ({currentTier.swahili})
                </span>
              </div>
              <div className="mt-6">
                <div className="flex justify-between text-xs mb-2">
                  <span className="font-semibold">{points.toLocaleString()} pts</span>
                  {nextTier && (
                    <span className="text-muted-foreground">
                      {(nextTier.min - points).toLocaleString()} to {nextTier.name}
                    </span>
                  )}
                </div>
                <div className="h-3 rounded-full bg-foreground/10 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full rounded-full bg-gradient-to-r from-[var(--gold)] to-[var(--maasai)]"
                  />
                </div>
                <div className="mt-3 flex items-center gap-3">
                  {tiers.map((t, i) => (
                    <div key={t.name} className="flex items-center gap-1.5 text-[11px]">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{
                          background: i <= currentTierIdx ? t.color : "var(--muted)",
                        }}
                      />
                      <span
                        className={
                          i <= currentTierIdx ? "font-semibold" : "text-muted-foreground"
                        }
                      >
                        {t.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <button
              onClick={() => setPoints(points + 250)}
              className="px-5 py-3 rounded-xl bg-foreground text-background font-semibold text-sm hover:scale-[1.02] transition"
            >
              + 250 pts (demo)
            </button>
          </div>
        </div>

        {/* Adoptions */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Heart className="h-5 w-5 text-[var(--maasai)]" />
            <h2 className="font-display text-2xl font-bold">Your adopted animals</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            {adoptions.map((a) => (
              <article key={a.id} className="glass rounded-2xl overflow-hidden group">
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={a.image}
                    alt={a.name}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <div className="text-[10px] uppercase tracking-wider opacity-80">
                      {a.species} · {a.age}
                    </div>
                    <h3 className="font-display text-2xl font-bold">{a.name}</h3>
                  </div>
                </div>
                <div className="p-4 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Adoption tier</span>
                  <span className="text-sm font-bold text-[var(--gold)]">
                    {a.points} pts/yr
                  </span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <MaasaiDivider />

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Badges */}
          <section className="glass rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-[var(--gold)]" />
              <h2 className="font-display text-2xl font-bold">Achievements</h2>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {badges.map((b) => (
                <div
                  key={b.name}
                  className={`text-center p-3 rounded-xl border transition ${
                    b.earned
                      ? "bg-gradient-to-br from-[var(--gold)]/15 to-[var(--maasai)]/10 border-[var(--gold)]/30"
                      : "bg-foreground/5 border-border opacity-50"
                  }`}
                >
                  <div className="text-3xl">{b.emoji}</div>
                  <div className="text-[11px] font-semibold mt-1.5">{b.name}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Leaderboard */}
          <section className="glass rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="h-5 w-5 text-[var(--maasai)]" />
              <h2 className="font-display text-2xl font-bold">Tribe leaderboard</h2>
            </div>
            <ul className="space-y-2">
              {leaderboard.map((l) => (
                <li
                  key={l.rank}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl ${
                    l.name === "You"
                      ? "bg-gradient-to-r from-[var(--gold)]/20 to-transparent border border-[var(--gold)]/30"
                      : "hover:bg-foreground/5"
                  }`}
                >
                  <span
                    className={`grid h-8 w-8 place-items-center rounded-full font-bold text-sm ${
                      l.rank === 1
                        ? "bg-[var(--gold)] text-[var(--gold-foreground)]"
                        : l.rank === 2
                          ? "bg-foreground/15"
                          : l.rank === 3
                            ? "bg-[var(--maasai)]/20 text-[var(--maasai)]"
                            : "bg-foreground/5"
                    }`}
                  >
                    {l.rank}
                  </span>
                  <div className="flex-1">
                    <div className="text-sm font-semibold">{l.name}</div>
                    <div className="text-[11px] text-muted-foreground">{l.tier}</div>
                  </div>
                  <span className="text-sm font-bold tabular-nums">
                    {l.points.toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </Shell>
  );
}
