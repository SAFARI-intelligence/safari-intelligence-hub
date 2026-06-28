import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Activity, MapPin, Sparkles, Cloud, ArrowRight } from "lucide-react";
import { Shell } from "@/components/safari/Shell";
import { MaasaiDivider } from "@/components/safari/MaasaiDivider";
import { parks, images } from "@/lib/safari-data";

function CountUp({ to }: { to: number }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const dur = 1500;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(eased * to));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to]);
  return <span>{n.toLocaleString()}</span>;
}

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SAFARI — AI Wildlife Intelligence for East Africa" },
      {
        name: "description",
        content:
          "The premium AI-powered tourism platform for East Africa. Real-time wildlife intelligence across Kenya, Tanzania, Uganda & Rwanda.",
      },
      { property: "og:title", content: "SAFARI — Wildlife Intelligence" },
      {
        property: "og:description",
        content: "Karibu. Real-time AI wildlife tracking across East Africa.",
      },
      { property: "og:image", content: images.lion },
      { name: "twitter:image", content: images.lion },
    ],
  }),
  component: Index,
});

function Index() {
  const totalSightings = 179;
  const liveParks = 6;
  const avgConfidence = 94;
  const operatorsOnline = 12;

  return (
    <Shell>
      <div className="mx-auto max-w-7xl space-y-10">
        {/* HERO */}
        <section className="relative overflow-hidden rounded-3xl grain">
          <div className="absolute inset-0">
            <img
              src={images.lion}
              alt="Lion at golden hour in the Maasai Mara"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-black/80 via-black/40 to-transparent" />
          </div>
          <div className="relative px-6 py-12 sm:px-12 sm:py-20 lg:py-28">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-2xl"
            >
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-white text-xs font-medium">
                <span className="live-dot inline-block h-1.5 w-1.5 rounded-full bg-[var(--maasai)]" />
                Wildlife Intelligence · Live now
              </span>
              <h1 className="mt-5 font-display text-4xl sm:text-6xl lg:text-7xl font-bold text-white leading-[0.95]">
                The Mara is{" "}
                <span className="bg-gradient-to-r from-[var(--gold)] via-amber-200 to-white bg-clip-text text-transparent">
                  awake.
                </span>
              </h1>
              <p className="mt-5 text-base sm:text-lg text-white/85 max-w-xl">
                Karibu SAFARI — the operating system for East African tourism. AI tracks{" "}
                <strong className="text-[var(--gold)]">{totalSightings} active sightings</strong>{" "}
                across {parks.length} parks right now. Twende!
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/plan"
                  className="shimmer inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-[var(--gold)] to-[var(--maasai)] text-white font-semibold shadow-[var(--shadow-glow-gold)] hover:scale-[1.02] transition"
                >
                  <Sparkles className="h-4 w-4" /> Plan with AI
                </Link>
                <Link
                  to="/wildlife"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/25 text-white font-medium hover:bg-white/20 transition"
                >
                  See live feed <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* STATS */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[
            {
              label: "Active sightings",
              value: totalSightings,
              suffix: "",
              icon: Activity,
              color: "var(--gold)",
            },
            {
              label: "AI confidence",
              value: avgConfidence,
              suffix: "%",
              icon: Sparkles,
              color: "var(--forest)",
            },
            {
              label: "Parks monitored",
              value: liveParks,
              suffix: "",
              icon: MapPin,
              color: "var(--maasai)",
            },
            {
              label: "Operators online",
              value: operatorsOnline,
              suffix: "",
              icon: Cloud,
              color: "var(--charcoal)",
            },
          ].map((s) => (
            <div key={s.label} className="glass rounded-2xl p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <span className="font-label text-xs text-muted-foreground">{s.label}</span>
                <s.icon className="h-4 w-4" style={{ color: s.color }} />
              </div>
              <div className="mt-2 font-display text-3xl sm:text-4xl font-bold">
                <CountUp to={s.value} />
                <span className="text-lg text-muted-foreground">{s.suffix}</span>
              </div>
            </div>
          ))}
        </section>

        <MaasaiDivider />

        {/* PARKS GRID */}
        <section>
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="font-display text-3xl sm:text-4xl font-bold">Explorer Dashboard</h2>
              <p className="text-muted-foreground text-sm mt-1">
                Real-time Wildlife Intelligence across East African parks.
              </p>
            </div>
            <Link
              to="/wildlife"
              className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-[var(--maasai)] hover:underline"
            >
              View all stories <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {parks.map((park, i) => (
              <motion.article
                key={park.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.06 }}
                className="group glass rounded-2xl overflow-hidden hover:shadow-[var(--shadow-elevated)] transition-all"
              >
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={park.image}
                    alt={park.name}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-white text-[11px] font-medium">
                    {park.status === "live" && (
                      <span className="live-dot inline-block h-1.5 w-1.5 rounded-full bg-[var(--maasai)]" />
                    )}
                    {park.status === "active" && (
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--gold)]" />
                    )}
                    {park.status === "live" ? "LIVE" : "ACTIVE"} · {park.lastUpdate}
                  </div>
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <div className="text-[10px] uppercase tracking-wider opacity-80">
                      {park.country}
                    </div>
                    <h3 className="font-display text-xl font-bold leading-tight">{park.name}</h3>
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <div className="text-lg font-bold text-[var(--maasai)]">{park.sightings}</div>
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        Sightings
                      </div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-[var(--gold)]">{park.confidence}%</div>
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        AI conf.
                      </div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-[var(--forest)]">{park.tempC}°</div>
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        {park.weather}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {park.highlights.slice(0, 3).map((h) => (
                      <span
                        key={h}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-foreground/5 text-muted-foreground"
                      >
                        {h}
                      </span>
                    ))}
                  </div>
                  <Link
                    to="/book"
                    className="block w-full text-center text-sm font-semibold py-2 rounded-lg bg-foreground text-background hover:bg-foreground/85 transition"
                  >
                    Quick book
                  </Link>
                </div>
              </motion.article>
            ))}
          </div>
        </section>
      </div>
    </Shell>
  );
}
