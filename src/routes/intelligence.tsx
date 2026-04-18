import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, MapPin, Camera, Send, CheckCircle2 } from "lucide-react";
import { Shell } from "@/components/safari/Shell";
import { MaasaiDivider } from "@/components/safari/MaasaiDivider";
import { sightings, images } from "@/lib/safari-data";

export const Route = createFileRoute("/intelligence")({
  head: () => ({
    meta: [
      { title: "Wildlife Intelligence Seed — Safari OS" },
      {
        name: "description",
        content:
          "Manual data entry for rangers and operators. Seed the Wildlife Intelligence System.",
      },
      { property: "og:title", content: "Wildlife Intelligence Seed" },
      {
        property: "og:description",
        content: "Ranger data entry — building East Africa's wildlife moat.",
      },
      { property: "og:image", content: images.savanna },
    ],
  }),
  component: IntelligencePage,
});

function IntelligencePage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    species: "Elephant",
    count: 5,
    park: "Maasai Mara",
    behavior: "Migrating",
    lat: -1.4061,
    lng: 35.0058,
    confidence: 90,
    notes: "",
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3500);
  };

  return (
    <Shell>
      <div className="mx-auto max-w-7xl space-y-8">
        <header>
          <span className="text-xs uppercase tracking-[0.18em] text-[var(--maasai)] font-semibold">
            Akili · Intelligence seed
          </span>
          <h1 className="font-display text-4xl sm:text-5xl font-bold mt-2">
            Build the Moat
          </h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Manual seeding by rangers and operators powers our Wildlife Intelligence System —
            the unfair advantage no competitor can replicate.
          </p>
        </header>

        <div className="grid lg:grid-cols-[1fr_1fr] gap-6">
          {/* Form */}
          <form onSubmit={submit} className="glass-strong rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-[var(--gold)]" />
              <h2 className="font-display text-xl font-bold">New sighting entry</h2>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <Field label="Species">
                <select
                  value={form.species}
                  onChange={(e) => setForm({ ...form, species: e.target.value })}
                  className="input"
                >
                  {["Elephant", "Lion", "Cheetah", "Mountain Gorilla", "Zebra", "Giraffe", "Buffalo", "Rhino"].map(
                    (s) => (
                      <option key={s}>{s}</option>
                    ),
                  )}
                </select>
              </Field>
              <Field label="Count">
                <input
                  type="number"
                  min={1}
                  value={form.count}
                  onChange={(e) => setForm({ ...form, count: parseInt(e.target.value, 10) || 1 })}
                  className="input"
                />
              </Field>
              <Field label="Park">
                <select
                  value={form.park}
                  onChange={(e) => setForm({ ...form, park: e.target.value })}
                  className="input"
                >
                  {["Maasai Mara", "Serengeti", "Bwindi", "Volcanoes NP", "Murchison Falls", "Akagera"].map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </select>
              </Field>
              <Field label="Behavior">
                <select
                  value={form.behavior}
                  onChange={(e) => setForm({ ...form, behavior: e.target.value })}
                  className="input"
                >
                  {["Migrating", "Hunting", "Resting", "Foraging", "Pre-crossing", "Browsing"].map((b) => (
                    <option key={b}>{b}</option>
                  ))}
                </select>
              </Field>
              <Field label="Latitude">
                <input
                  type="number"
                  step="0.0001"
                  value={form.lat}
                  onChange={(e) => setForm({ ...form, lat: parseFloat(e.target.value) || 0 })}
                  className="input font-mono"
                />
              </Field>
              <Field label="Longitude">
                <input
                  type="number"
                  step="0.0001"
                  value={form.lng}
                  onChange={(e) => setForm({ ...form, lng: parseFloat(e.target.value) || 0 })}
                  className="input font-mono"
                />
              </Field>
            </div>

            <Field label={`AI confidence — ${form.confidence}%`}>
              <input
                type="range"
                min={50}
                max={100}
                value={form.confidence}
                onChange={(e) => setForm({ ...form, confidence: parseInt(e.target.value, 10) })}
                className="w-full accent-[var(--gold)]"
              />
            </Field>

            <Field label="Field notes">
              <textarea
                rows={3}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Wind direction, cubs present, predicted next move…"
                className="input resize-none"
              />
            </Field>

            <button
              type="button"
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-border hover:border-[var(--gold)]/50 hover:bg-[var(--gold)]/5 transition text-sm text-muted-foreground"
            >
              <Camera className="h-4 w-4" /> Attach photo (optional)
            </button>

            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[var(--maasai)] text-[var(--maasai-foreground)] font-semibold hover:scale-[1.01] transition shadow-lg"
            >
              {submitted ? (
                <>
                  <CheckCircle2 className="h-4 w-4" /> Asante! Entry queued
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" /> Seed Wildlife Intelligence
                </>
              )}
            </button>

            <style>{`
              .input {
                width: 100%;
                padding: 0.625rem 0.75rem;
                border-radius: 0.625rem;
                background: var(--background);
                border: 1px solid var(--border);
                font-size: 0.875rem;
                outline: none;
              }
              .input:focus { border-color: var(--gold); box-shadow: 0 0 0 3px color-mix(in oklab, var(--gold) 18%, transparent); }
            `}</style>
          </form>

          {/* Recent entries */}
          <div className="space-y-4">
            <div className="glass rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="h-5 w-5 text-[var(--forest)]" />
                <h2 className="font-display text-xl font-bold">Recent seeds</h2>
                <span className="ml-auto text-[10px] uppercase tracking-wider text-muted-foreground">
                  {sightings.length} entries today
                </span>
              </div>
              <ul className="space-y-2.5">
                {sightings.slice(0, 5).map((s, i) => (
                  <motion.li
                    key={s.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="p-3 rounded-xl bg-background/50 border border-border/60 grid grid-cols-[40px_1fr_auto] gap-3 items-center"
                  >
                    <img
                      src={s.image}
                      alt={s.species}
                      className="h-10 w-10 rounded-lg object-cover"
                    />
                    <div className="min-w-0">
                      <div className="text-sm font-semibold">
                        {s.count} × {s.species}
                      </div>
                      <div className="text-[11px] text-muted-foreground truncate">
                        {s.park} · {s.behavior} · {s.timestamp}
                      </div>
                    </div>
                    <span className="text-xs font-bold text-[var(--gold)]">{s.confidence}%</span>
                  </motion.li>
                ))}
              </ul>
            </div>

            <div className="glass-strong rounded-2xl p-5 bg-gradient-to-br from-[var(--maasai)]/10 to-[var(--gold)]/10">
              <div className="text-xs uppercase tracking-wider text-[var(--maasai)] font-semibold">
                The moat math
              </div>
              <MaasaiDivider className="my-3" />
              <ul className="space-y-2 text-sm">
                <li className="flex justify-between">
                  <span className="text-muted-foreground">Total entries (all-time)</span>
                  <span className="font-bold tabular-nums">142,308</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-muted-foreground">Active seeders</span>
                  <span className="font-bold tabular-nums">486 rangers</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-muted-foreground">Avg AI confidence</span>
                  <span className="font-bold tabular-nums text-[var(--gold)]">92.4%</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-muted-foreground">Days of training data</span>
                  <span className="font-bold tabular-nums text-[var(--forest)]">487</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
        {label}
      </span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}
