import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Star, Calendar, Users, ArrowRight } from "lucide-react";
import { Shell } from "@/components/safari/Shell";
import { CheckoutModal } from "@/components/safari/CheckoutModal";
import { packages, images, type Package } from "@/lib/safari-data";

export const Route = createFileRoute("/book")({
  head: () => ({
    meta: [
      { title: "Booking Engine — SAFARI" },
      {
        name: "description",
        content: "Book premium East African safaris in KSh. Maasai Mara, Serengeti, Bwindi & more.",
      },
      { property: "og:title", content: "Book your East African safari — SAFARI" },
      { property: "og:description", content: "Premium safari packages, KSh-primary pricing." },
      { property: "og:image", content: images.zebra },
    ],
  }),
  component: BookPage,
});

function BookPage() {
  const [travelers, setTravelers] = useState(2);
  const [departure, setDeparture] = useState("2026-06-12");
  const [activePkg, setActivePkg] = useState<Package | null>(null);

  return (
    <Shell>
      <div className="mx-auto max-w-7xl space-y-8">
        <header>
          <span className="text-xs uppercase tracking-[0.18em] text-[var(--maasai)] font-semibold">
            Hifadhi · Reserve your journey
          </span>
          <h1 className="font-display text-4xl sm:text-5xl font-bold mt-2">Booking Engine</h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Curated premium safaris. Pay in Kenyan Shillings via M-Pesa, or by card globally.
          </p>
        </header>

        <div className="glass rounded-2xl p-4 sm:p-5 grid sm:grid-cols-3 gap-3">
          <label className="flex items-center gap-3 px-4 py-3 rounded-xl bg-background/60 border border-border/60">
            <Calendar className="h-4 w-4 text-[var(--gold)]" />
            <div className="flex-1">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Departure
              </div>
              <input
                type="date"
                value={departure}
                onChange={(e) => setDeparture(e.target.value)}
                className="bg-transparent text-sm font-medium outline-none w-full"
              />
            </div>
          </label>
          <label className="flex items-center gap-3 px-4 py-3 rounded-xl bg-background/60 border border-border/60">
            <Users className="h-4 w-4 text-[var(--maasai)]" />
            <div className="flex-1">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Travelers
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setTravelers(Math.max(1, travelers - 1))}
                  className="grid h-6 w-6 place-items-center rounded bg-foreground/5"
                >
                  −
                </button>
                <span className="text-sm font-semibold">{travelers}</span>
                <button
                  onClick={() => setTravelers(travelers + 1)}
                  className="grid h-6 w-6 place-items-center rounded bg-foreground/5"
                >
                  +
                </button>
              </div>
            </div>
          </label>
          <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-[var(--gold)]/15 to-[var(--maasai)]/15 border border-[var(--gold)]/30">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Currency
              </div>
              <div className="text-sm font-semibold">KSh (Kenyan Shilling)</div>
            </div>
            <span className="text-xs px-2 py-1 rounded-full bg-[var(--forest)] text-white font-bold">
              Best rate
            </span>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          {packages.map((p, i) => {
            const total = p.priceKsh * travelers;
            return (
              <motion.article
                key={p.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="group glass rounded-2xl overflow-hidden flex flex-col"
              >
                <div className="relative h-52 overflow-hidden">
                  <img
                    src={p.image}
                    alt={p.title}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/65 to-transparent" />
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-white text-[10px] font-medium">
                    {p.country} · {p.days}D
                  </div>
                  <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-[var(--gold)] text-[var(--gold-foreground)] text-[11px] font-bold">
                    <Star className="h-3 w-3 fill-current" />
                    {p.rating}
                  </div>
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <h3 className="font-display text-2xl font-bold leading-tight">{p.title}</h3>
                    <p className="text-xs opacity-85 mt-0.5">{p.subtitle}</p>
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col gap-3">
                  <ul className="grid grid-cols-2 gap-1.5 text-xs">
                    {p.includes.map((inc) => (
                      <li key={inc} className="flex items-center gap-1.5 text-muted-foreground">
                        <span className="h-1 w-1 rounded-full bg-[var(--gold)]" /> {inc}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-auto pt-3 border-t border-border/60">
                    <div className="flex items-end justify-between">
                      <div>
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                          {travelers} traveler{travelers > 1 ? "s" : ""}
                        </div>
                        <div className="font-display text-2xl font-bold">
                          KSh {total.toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          ≈ ${(p.priceUsd * travelers).toLocaleString()} USD
                        </div>
                      </div>
                      <button
                        onClick={() => setActivePkg(p)}
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-semibold text-sm hover:scale-[1.02] transition shadow-lg"
                        style={{ background: "#1A3C2E", color: "#C9922A" }}
                      >
                        Book <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Need help?{" "}
          <Link to="/support" className="underline">
            Talk to our team
          </Link>
        </p>
      </div>

      <CheckoutModal
        open={!!activePkg}
        onClose={() => setActivePkg(null)}
        pkg={activePkg}
        travelers={travelers}
        departure={departure}
      />
    </Shell>
  );
}
