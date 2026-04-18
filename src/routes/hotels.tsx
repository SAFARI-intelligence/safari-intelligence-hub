import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Shell } from "@/components/safari/Shell";
import { MaasaiDivider } from "@/components/safari/MaasaiDivider";
import { Star, MapPin, Search, Loader2, Sparkles } from "lucide-react";
import { images } from "@/lib/safari-data";

export const Route = createFileRoute("/hotels")({
  head: () => ({
    meta: [
      { title: "Hotels & Villas · Safari OS" },
      { name: "description", content: "Browse premium safari lodges, tented camps and villas across East Africa." },
      { property: "og:title", content: "Safari OS — Hotels & Villas" },
      { property: "og:description", content: "Hand-picked stays inside Maasai Mara, Serengeti, Bwindi & more." },
    ],
  }),
  component: HotelsPage,
});

type Hotel = {
  id: string;
  name: string;
  type: string;
  country: string;
  region: string | null;
  park: string | null;
  price_min: number;
  price_max: number;
  rating: number;
  description: string | null;
  amenities: string[];
  images: string[];
};

const fallbackImg = [images.lion, images.elephants, images.gorilla, images.savanna, images.coast];

function pickImg(h: Hotel, i: number) {
  return h.images[0] || fallbackImg[i % fallbackImg.length];
}

function HotelsPage() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [country, setCountry] = useState<string>("all");

  useEffect(() => {
    supabase
      .from("hotels")
      .select("*")
      .eq("is_published", true)
      .order("rating", { ascending: false })
      .then(({ data }) => {
        setHotels((data as Hotel[]) || []);
        setLoading(false);
      });
  }, []);

  const countries = Array.from(new Set(hotels.map((h) => h.country)));
  const filtered = hotels.filter(
    (h) =>
      (country === "all" || h.country === country) &&
      (q === "" ||
        h.name.toLowerCase().includes(q.toLowerCase()) ||
        (h.park || "").toLowerCase().includes(q.toLowerCase()))
  );

  return (
    <Shell>
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="glass-strong rounded-3xl p-6 sm:p-8">
          <div className="flex items-center gap-2 text-xs text-[var(--gold)] font-semibold uppercase tracking-widest">
            <Sparkles className="h-3.5 w-3.5" /> Karibu · East African Stays
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold mt-2">
            Hotels, lodges & villas
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5 max-w-xl">
            Hand-picked stays inside the parks. Filter by country, search by name or park.
          </p>

          <div className="mt-5 flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search hotels or parks…"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-border/60 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-[var(--gold)]/40"
              />
            </div>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-border/60 bg-background text-sm"
            >
              <option value="all">All countries</option>
              {countries.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <MaasaiDivider />

        {loading ? (
          <div className="grid place-items-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center">
            <p className="font-display text-lg">No hotels yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Hotel partners haven't published any listings.{" "}
              <Link to="/auth" className="underline">Become a partner</Link>.
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((h, i) => (
              <Link
                key={h.id}
                to="/hotels/$hotelId"
                params={{ hotelId: h.id }}
                className="group glass rounded-2xl overflow-hidden hover:shadow-[var(--shadow-glow-gold)] transition-all"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={pickImg(h, i)}
                    alt={h.name}
                    loading="lazy"
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-black/60 backdrop-blur text-white text-xs font-bold flex items-center gap-1">
                    <Star className="h-3 w-3 fill-[var(--gold)] text-[var(--gold)]" />
                    {h.rating.toFixed(1)}
                  </div>
                  <div className="absolute top-3 left-3 px-2 py-1 rounded-full bg-[var(--gold)]/90 text-white text-[10px] font-bold uppercase">
                    {h.type}
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {h.park || h.region || h.country}
                  </div>
                  <h3 className="font-display text-lg font-bold mt-1 line-clamp-1">{h.name}</h3>
                  <div className="mt-2 flex items-baseline justify-between">
                    <div>
                      <span className="text-xs text-muted-foreground">From </span>
                      <span className="font-bold text-[var(--gold)]">
                        KSh {Number(h.price_min).toLocaleString()}
                      </span>
                      <span className="text-[10px] text-muted-foreground"> /night</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">{h.country}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Shell>
  );
}
