import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Loader2, MapPin, Users, Wallet, Heart, Save, Leaf } from "lucide-react";
import { Shell } from "@/components/safari/Shell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { images } from "@/lib/safari-data";

export const Route = createFileRoute("/plan")({
  head: () => ({
    meta: [
      { title: "AI Travel Planner · SAFARI" },
      {
        name: "description",
        content:
          "Craft a bespoke East African safari itinerary in seconds with SAFARI AI — day-by-day, priced in KSh, rooted in Kenyan soul.",
      },
      { property: "og:title", content: "AI Travel Planner · SAFARI" },
      { property: "og:description", content: "Bespoke safari itineraries. Intelligent. Kenyan." },
      { property: "og:image", content: images.savanna },
    ],
  }),
  component: PlanPage,
});

type Day = {
  day: number;
  title: string;
  location: string;
  activities: string[];
  accommodation: string;
  cost: number;
  conservationImpact: string;
};
type Itinerary = {
  title: string;
  summary: string;
  totalCost: number;
  days: Day[];
};

const allDestinations = [
  "Maasai Mara",
  "Amboseli",
  "Tsavo",
  "Samburu",
  "Diani Beach",
  "Lamu",
  "Serengeti",
  "Bwindi",
  "Ngorongoro",
];
const allInterests = [
  "Big Five",
  "Birding",
  "Culture",
  "Photography",
  "Conservation",
  "Beach",
  "Hiking",
  "Gorilla trekking",
];
const budgets = ["Budget", "Mid-range", "Luxury", "Ultra-luxury"];

function PlanPage() {
  const { user } = useAuth();
  const [destinations, setDestinations] = useState<string[]>(["Maasai Mara", "Amboseli"]);
  const [duration, setDuration] = useState(7);
  const [budget, setBudget] = useState("Mid-range");
  const [interests, setInterests] = useState<string[]>(["Big Five", "Culture"]);
  const [groupSize, setGroupSize] = useState(2);
  const [loading, setLoading] = useState(false);
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);

  const toggle = (arr: string[], setArr: (v: string[]) => void, val: string) =>
    setArr(arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val]);

  const generate = async () => {
    if (!user) {
      toast.error("Sign in to generate an itinerary");
      return;
    }
    setLoading(true);
    setItinerary(null);
    try {
      const { data, error } = await supabase.functions.invoke("ai-planner", {
        body: { destinations, duration, budget, interests, groupSize },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setItinerary(data.itinerary);
      toast.success("Safari njema! Your itinerary is ready.");
    } catch (e: any) {
      toast.error(e.message || "Could not generate itinerary. Pole — try again.");
    } finally {
      setLoading(false);
    }
  };

  const save = async () => {
    if (!user) {
      toast.error("Sign in to save itineraries");
      return;
    }
    if (!itinerary) return;
    const { error } = await supabase.from("itineraries").insert({
      user_id: user.id,
      title: itinerary.title,
      days: itinerary.days as any,
      total_cost: itinerary.totalCost,
      destinations,
      duration_days: duration,
      budget_tier: budget,
      interests,
      group_size: groupSize,
    });
    if (error) toast.error(error.message);
    else toast.success("Saved to your profile · Asante!");
  };

  return (
    <Shell>
      <div className="mx-auto max-w-6xl space-y-8">
        <section className="relative overflow-hidden rounded-3xl grain">
          <div className="absolute inset-0">
            <img src={images.savanna} alt="Savanna" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-tr from-black/85 via-black/50 to-transparent" />
          </div>
          <div className="relative px-6 py-12 sm:px-10 sm:py-16">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-white text-xs font-medium">
              <Sparkles className="h-3 w-3" /> Intelligent planning
            </span>
            <h1 className="mt-4 font-display text-4xl sm:text-6xl font-bold text-white leading-[0.95]">
              Plan your{" "}
              <span className="bg-gradient-to-r from-[var(--gold)] via-amber-200 to-white bg-clip-text text-transparent">
                perfect safari.
              </span>
            </h1>
            <p className="mt-4 text-white/85 max-w-xl">
              Tell us your dream, and our AI crafts a day-by-day itinerary — priced in KSh, rooted
              in conservation, woven with Kenyan soul.
            </p>
          </div>
        </section>

        <div className="grid lg:grid-cols-[420px_1fr] gap-6">
          {/* Input panel */}
          <div className="glass-strong rounded-2xl p-6 space-y-5 lg:sticky lg:top-28 lg:self-start">
            <div>
              <label className="text-xs font-label text-muted-foreground flex items-center gap-1.5 mb-2">
                <MapPin className="h-3.5 w-3.5" /> Destinations
              </label>
              <div className="flex flex-wrap gap-1.5">
                {allDestinations.map((d) => (
                  <button
                    key={d}
                    onClick={() => toggle(destinations, setDestinations, d)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition ${
                      destinations.includes(d)
                        ? "bg-[var(--gold)] text-white border-[var(--gold)]"
                        : "border-border hover:bg-foreground/5"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-label text-muted-foreground">Duration</label>
                <span className="font-mono-data text-sm font-semibold text-[var(--gold)]">
                  {duration} days
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={21}
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full accent-[var(--gold)]"
              />
            </div>

            <div>
              <label className="text-xs font-label text-muted-foreground flex items-center gap-1.5 mb-2">
                <Wallet className="h-3.5 w-3.5" /> Budget tier
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {budgets.map((b) => (
                  <button
                    key={b}
                    onClick={() => setBudget(b)}
                    className={`text-xs px-3 py-2 rounded-lg border transition ${
                      budget === b
                        ? "bg-[var(--maasai)] text-white border-[var(--maasai)]"
                        : "border-border hover:bg-foreground/5"
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-label text-muted-foreground flex items-center gap-1.5 mb-2">
                <Heart className="h-3.5 w-3.5" /> Interests
              </label>
              <div className="flex flex-wrap gap-1.5">
                {allInterests.map((i) => (
                  <button
                    key={i}
                    onClick={() => toggle(interests, setInterests, i)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition ${
                      interests.includes(i)
                        ? "bg-[var(--forest)] text-white border-[var(--forest)]"
                        : "border-border hover:bg-foreground/5"
                    }`}
                  >
                    {i}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-label text-muted-foreground flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5" /> Group size
                </label>
                <span className="font-mono-data text-sm font-semibold">{groupSize}</span>
              </div>
              <input
                type="range"
                min={1}
                max={12}
                value={groupSize}
                onChange={(e) => setGroupSize(Number(e.target.value))}
                className="w-full accent-[var(--forest)]"
              />
            </div>

            <button
              onClick={generate}
              disabled={loading || destinations.length === 0}
              className="shimmer w-full py-3 rounded-xl bg-gradient-to-r from-[var(--gold)] to-[var(--maasai)] text-white font-semibold shadow-[var(--shadow-glow-gold)] flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Crafting your safari…
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" /> Generate itinerary
                </>
              )}
            </button>
          </div>

          {/* Output */}
          <div>
            <AnimatePresence mode="wait">
              {loading && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="glass rounded-2xl p-12 text-center"
                >
                  <div className="mx-auto h-16 w-16 rounded-full bg-gradient-to-br from-[var(--gold)] to-[var(--maasai)] grid place-items-center mb-4 animate-pulse">
                    <Sparkles className="h-8 w-8 text-white" />
                  </div>
                  <p className="font-display text-lg">Pole pole — weaving your journey…</p>
                  <p className="text-xs text-muted-foreground mt-2 italic">
                    "Safari njema" — Have a good journey
                  </p>
                </motion.div>
              )}

              {!loading && !itinerary && (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="glass rounded-2xl p-12 text-center"
                >
                  <div className="text-5xl mb-3">🦁</div>
                  <h3 className="font-display text-2xl font-bold">Your itinerary appears here</h3>
                  <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
                    Select your destinations, duration, budget, and interests — then hit generate to
                    see SAFARI AI at work.
                  </p>
                </motion.div>
              )}

              {!loading && itinerary && (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="glass-strong rounded-2xl p-6">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div>
                        <h2 className="font-display text-3xl font-bold">{itinerary.title}</h2>
                        <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
                          {itinerary.summary}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-label text-muted-foreground">Total</div>
                        <div className="font-display text-2xl font-bold text-[var(--gold)]">
                          KSh {itinerary.totalCost.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2 flex-wrap">
                      <button
                        onClick={save}
                        className="px-4 py-2 rounded-lg bg-foreground text-background text-sm font-semibold flex items-center gap-1.5"
                      >
                        <Save className="h-3.5 w-3.5" /> Save to profile
                      </button>
                      <Link
                        to="/book"
                        className="px-4 py-2 rounded-lg border border-[var(--gold)]/60 text-[var(--gold)] text-sm font-semibold"
                      >
                        Book a lodge
                      </Link>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {itinerary.days.map((d, i) => (
                      <motion.div
                        key={d.day}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.07 }}
                        className="glass rounded-2xl p-5 grid sm:grid-cols-[80px_1fr] gap-4"
                      >
                        <div>
                          <div className="font-label text-[var(--maasai)] text-xs">Day</div>
                          <div className="font-display text-4xl font-bold leading-none">
                            {d.day.toString().padStart(2, "0")}
                          </div>
                          <div className="mt-1 text-[10px] font-mono-data text-muted-foreground">
                            KSh {d.cost.toLocaleString()}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3" /> {d.location}
                          </div>
                          <h3 className="font-display text-xl font-bold">{d.title}</h3>
                          <ul className="text-sm space-y-1">
                            {d.activities.map((a, j) => (
                              <li key={j} className="flex gap-2">
                                <span className="text-[var(--gold)]">•</span>
                                <span>{a}</span>
                              </li>
                            ))}
                          </ul>
                          <div className="text-xs text-muted-foreground">
                            <span className="font-semibold">Stay: </span>
                            {d.accommodation}
                          </div>
                          <div className="mt-2 flex items-start gap-1.5 text-[11px] p-2 rounded-lg bg-[var(--forest)]/10 text-[var(--forest)]">
                            <Leaf className="h-3 w-3 mt-0.5 flex-shrink-0" />
                            <span>{d.conservationImpact}</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </Shell>
  );
}
