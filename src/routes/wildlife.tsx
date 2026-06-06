import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Clock, Sparkles, Code, Copy, Check, BookOpen, Loader2 } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { Shell } from "@/components/safari/Shell";
import { MaasaiDivider } from "@/components/safari/MaasaiDivider";
import { sightings, images } from "@/lib/safari-data";
import { getSpeciesFact } from "@/lib/wis.functions";

export const Route = createFileRoute("/wildlife")({
  head: () => ({
    meta: [
      { title: "Wildlife Story Feed — SAFARI" },
      {
        name: "description",
        content:
          "AI-generated wildlife narratives across East Africa. Real sightings, real-time. B2B-ready API.",
      },
      { property: "og:title", content: "Wildlife Story Feed — SAFARI" },
      {
        property: "og:description",
        content: "AI-generated narratives of wildlife movements, B2B API ready.",
      },
      { property: "og:image", content: images.elephants },
    ],
  }),
  component: WildlifePage,
});

const species = ["All", "Elephant", "Lion", "Cheetah", "Mountain Gorilla", "Zebra", "Giraffe"];

function WildlifePage() {
  const [filter, setFilter] = useState("All");
  const [copied, setCopied] = useState(false);
  const [selected, setSelected] = useState(sightings[0]);
  const [fact, setFact] = useState<string | null>(null);
  const [factLoading, setFactLoading] = useState(false);
  const fetchFact = useServerFn(getSpeciesFact);

  useEffect(() => {
    let cancelled = false;
    setFact(null);
    setFactLoading(true);
    fetchFact({ data: { species: selected.species, behavior: selected.behavior } })
      .then((r) => { if (!cancelled) setFact(r.body); })
      .catch(() => { if (!cancelled) setFact(null); })
      .finally(() => { if (!cancelled) setFactLoading(false); });
    return () => { cancelled = true; };
  }, [selected.id, selected.species, selected.behavior, fetchFact]);

  const filtered =
    filter === "All" ? sightings : sightings.filter((s) => s.species === filter);

  const sample = JSON.stringify(
    {
      id: selected.id,
      species: selected.species,
      count: selected.count,
      park: selected.park,
      gps: selected.gps,
      behavior: selected.behavior,
      narrative: selected.narrative,
      confidence: selected.confidence,
      timestamp: selected.timestamp,
    },
    null,
    2,
  );

  const copy = () => {
    void navigator.clipboard.writeText(sample);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <Shell>
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <span className="text-xs uppercase tracking-[0.18em] text-[var(--maasai)] font-semibold">
              Wanyama · Live narratives
            </span>
            <h1 className="font-display text-4xl sm:text-5xl font-bold mt-2">
              Wildlife Story Feed
            </h1>
            <p className="text-muted-foreground mt-2 max-w-2xl">
              AI-generated stories from rangers, camera traps, and operator radios across the
              region — refined every 90 seconds.
            </p>
          </div>
        </header>

        {/* species filter */}
        <div className="glass rounded-2xl p-2 flex gap-1.5 overflow-x-auto">
          {species.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-medium transition ${
                filter === s
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:bg-foreground/5"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-[1fr_400px] gap-6">
          {/* timeline */}
          <div className="space-y-4">
            {filtered.map((s, i) => (
              <motion.article
                key={s.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setSelected(s)}
                className={`glass rounded-2xl overflow-hidden grid sm:grid-cols-[180px_1fr] cursor-pointer transition ${
                  selected.id === s.id
                    ? "ring-2 ring-[var(--gold)]"
                    : "hover:shadow-[var(--shadow-elevated)]"
                }`}
              >
                <div className="relative h-40 sm:h-auto">
                  <img src={s.image} alt={s.species} className="h-full w-full object-cover" />
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/55 backdrop-blur-sm text-white text-[10px] font-medium">
                    {s.confidence}% conf
                  </div>
                </div>
                <div className="p-4 sm:p-5 space-y-2.5">
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                    <Clock className="h-3 w-3" /> {s.timestamp}
                    <span>·</span>
                    <MapPin className="h-3 w-3" /> {s.park}
                    <span className="ml-auto px-2 py-0.5 rounded-full bg-[var(--forest)]/12 text-[var(--forest)] font-semibold">
                      {s.behavior}
                    </span>
                  </div>
                  <h3 className="font-display text-xl font-bold">
                    {s.count} × {s.species}
                  </h3>
                  <p className="text-sm text-foreground/80 leading-relaxed">{s.narrative}</p>
                  <div className="text-[11px] text-muted-foreground font-mono">
                    📍 {s.location} · {s.gps.lat.toFixed(4)}, {s.gps.lng.toFixed(4)}
                  </div>
                </div>
              </motion.article>
            ))}
          </div>

          {/* B2B API panel */}
          <aside className="lg:sticky lg:top-28 lg:self-start space-y-4">
            <div className="glass-strong rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-1">
                <Code className="h-4 w-4 text-[var(--gold)]" />
                <span className="text-xs uppercase tracking-[0.18em] font-semibold text-[var(--gold)]">
                  B2B API
                </span>
              </div>
              <h3 className="font-display text-xl font-bold mb-3">Live JSON payload</h3>
              <p className="text-xs text-muted-foreground mb-3">
                Every sighting is exposed via REST + webhooks. Operators integrate in minutes.
              </p>
              <div className="relative">
                <pre className="bg-foreground text-background/90 rounded-xl p-3 text-[10.5px] leading-snug overflow-x-auto max-h-72 font-mono">
                  {sample}
                </pre>
                <button
                  onClick={copy}
                  className="absolute top-2 right-2 grid h-7 w-7 place-items-center rounded-md bg-white/15 hover:bg-white/25 text-white"
                  aria-label="Copy"
                >
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
              <MaasaiDivider className="my-4" />
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1.5">
                Sample request
              </div>
              <pre className="bg-secondary rounded-lg p-3 text-[10.5px] font-mono overflow-x-auto">
{`curl -H "Authorization: Bearer sk_safari_..." \\
  https://api.safari-os.africa/v1/sightings`}
              </pre>
            </div>

            {/* Mini map */}
            <div className="glass rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs uppercase tracking-wider text-muted-foreground">
                  Location
                </span>
                <Sparkles className="h-3.5 w-3.5 text-[var(--gold)]" />
              </div>
              <div className="relative aspect-video rounded-xl overflow-hidden bg-gradient-to-br from-[var(--forest)]/30 to-[var(--gold)]/30">
                <svg viewBox="0 0 100 60" className="absolute inset-0 w-full h-full">
                  <path
                    d="M0,40 Q25,20 50,30 T100,25"
                    stroke="var(--forest)"
                    strokeWidth="0.4"
                    fill="none"
                    opacity="0.5"
                  />
                  <path
                    d="M10,50 Q40,35 70,45 T100,40"
                    stroke="var(--maasai)"
                    strokeWidth="0.3"
                    fill="none"
                    opacity="0.4"
                  />
                  <circle cx="50" cy="30" r="2" fill="var(--maasai)">
                    <animate
                      attributeName="r"
                      values="2;5;2"
                      dur="2s"
                      repeatCount="indefinite"
                    />
                  </circle>
                  <circle cx="50" cy="30" r="1" fill="white" />
                </svg>
                <div className="absolute bottom-2 left-2 right-2 text-[10px] font-mono bg-black/55 text-white px-2 py-1 rounded">
                  {selected.gps.lat.toFixed(4)}°S, {selected.gps.lng.toFixed(4)}°E
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </Shell>
  );
}
