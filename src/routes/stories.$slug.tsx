import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Loader2,
  MapPin,
  ArrowLeft,
  Sparkles,
  Star,
  ArrowRight,
  AlertTriangle,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Shell } from "@/components/safari/Shell";
import { MaasaiDivider } from "@/components/safari/MaasaiDivider";
import { images } from "@/lib/safari-data";
import { SafariMap } from "@/components/safari/SafariMap";

export const Route = createFileRoute("/stories/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${capitalize(params.slug)} — The Big Five · SAFARI` },
      {
        name: "description",
        content: `Cinematic story of the ${params.slug}: behavior, key facts, cultural meaning, and the Kenyan parks and lodges where you can see them.`,
      },
      { property: "og:title", content: `${capitalize(params.slug)} — SAFARI` },
      {
        property: "og:description",
        content: `The story of the ${params.slug} and where to stay nearby.`,
      },
    ],
  }),
  component: AnimalStoryPage,
  errorComponent: ({ error, reset }) => {
    const router = useRouter();
    return (
      <Shell>
        <div className="mx-auto max-w-2xl glass-strong rounded-3xl p-10 text-center">
          <AlertTriangle className="mx-auto h-8 w-8 text-[var(--maasai)]" />
          <h2 className="font-display text-2xl font-bold mt-3">Something went wrong</h2>
          <p className="text-sm text-muted-foreground mt-2">{error.message}</p>
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="mt-5 px-5 py-2.5 rounded-xl bg-[var(--gold)] text-black font-semibold text-sm"
          >
            Try again
          </button>
        </div>
      </Shell>
    );
  },
  notFoundComponent: () => {
    const params = Route.useParams();
    return (
      <Shell>
        <div className="mx-auto max-w-2xl glass-strong rounded-3xl p-10 text-center">
          <h2 className="font-display text-3xl font-bold">Animal not found</h2>
          <p className="text-sm text-muted-foreground mt-2">
            We couldn&apos;t find a story for &quot;{params.slug}&quot;.
          </p>
          <Link
            to="/stories"
            className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 rounded-xl bg-[var(--gold)] text-black font-semibold text-sm"
          >
            <ArrowLeft className="h-4 w-4" /> Back to The Big Five
          </Link>
        </div>
      </Shell>
    );
  },
});

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const fallbackImg: Record<string, string> = {
  lion: images.lion,
  elephant: images.elephants,
  leopard: images.cheetah,
  rhino: images.savanna,
  buffalo: images.buffalo,
};

type Animal = {
  id: string;
  slug: string;
  name: string;
  swahili_name: string | null;
  title: string;
  short_story: string;
  hero_narrative: string | null;
  key_facts: Record<string, string>;
  behavior_insights: string[];
  cultural_relevance: string | null;
  parks: string[];
  hero_image: string | null;
  image: string | null;
};

type Hotel = {
  id: string;
  name: string;
  park: string | null;
  region: string | null;
  price_min: number;
  rating: number;
  images: string[];
  type: string;
};

function AnimalStoryPage() {
  const { slug } = Route.useParams();
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [trackPath, setTrackPath] = useState<Array<[number, number]>>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data: a } = await supabase
        .from("animal_stories")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      if (cancelled) return;
      if (!a) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      setAnimal(a as Animal);
      const [hotelsRes, locsRes] = await Promise.all([
        a.parks?.length
          ? supabase
              .from("hotels")
              .select("id, name, park, region, price_min, rating, images, type")
              .in("park", a.parks)
              .eq("is_published", true)
              .order("rating", { ascending: false })
              .limit(6)
          : Promise.resolve({ data: [] as Hotel[] }),
        supabase
          .from("animal_locations")
          .select("latitude,longitude,recorded_at")
          .eq("story_id", a.id)
          .order("recorded_at", { ascending: false })
          .limit(20),
      ]);
      if (cancelled) return;
      setHotels((hotelsRes.data as Hotel[]) || []);
      const path: Array<[number, number]> = ((locsRes.data as Array<{ latitude: number; longitude: number }>) || [])
        .map((p) => [Number(p.latitude), Number(p.longitude)] as [number, number])
        .reverse();
      setTrackPath(path);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) {
    return (
      <Shell>
        <div className="grid place-items-center py-32">
          <Loader2 className="h-7 w-7 animate-spin text-[var(--gold)]" />
        </div>
      </Shell>
    );
  }

  if (notFound || !animal) {
    return (
      <Shell>
        <div className="mx-auto max-w-2xl glass-strong rounded-3xl p-10 text-center">
          <h2 className="font-display text-3xl font-bold">Animal not found</h2>
          <Link to="/stories" className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 rounded-xl bg-[var(--gold)] text-black font-semibold text-sm">
            <ArrowLeft className="h-4 w-4" /> Back to The Big Five
          </Link>
        </div>
      </Shell>
    );
  }

  const heroImg = animal.hero_image || animal.image || fallbackImg[animal.slug] || images.savanna;
  const facts = animal.key_facts || {};

  return (
    <Shell>
      <div className="mx-auto max-w-5xl space-y-10">
        <Link
          to="/stories"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> The Big Five
        </Link>

        {/* HERO */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="relative rounded-3xl overflow-hidden h-[60vh] min-h-[420px]"
        >
          <img src={heroImg} alt={animal.name} className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/10" />
          <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10 text-white">
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--gold)] font-bold">
              {animal.swahili_name}
            </p>
            <h1 className="font-display text-5xl sm:text-7xl font-bold mt-2 leading-none">
              {animal.name}
            </h1>
            <p className="font-display italic text-xl sm:text-2xl text-white/80 mt-3">{animal.title}</p>
          </div>
        </motion.section>

        {/* HERO NARRATIVE */}
        {animal.hero_narrative && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="glass-strong rounded-3xl p-6 sm:p-10"
          >
            <p className="font-display text-lg sm:text-xl leading-relaxed text-foreground/90 first-letter:font-bold first-letter:text-5xl first-letter:text-[var(--gold)] first-letter:float-left first-letter:mr-3 first-letter:leading-none first-letter:mt-1">
              {animal.hero_narrative}
            </p>
          </motion.section>
        )}

        {/* KEY FACTS */}
        {Object.keys(facts).length > 0 && (
          <section>
            <SectionLabel>Key Facts</SectionLabel>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-3">
              {Object.entries(facts).map(([k, v]) => (
                <div key={k} className="glass rounded-2xl p-4 text-center">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{k}</p>
                  <p className="font-mono text-base font-bold mt-1.5 text-[var(--gold)]">{v}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* BEHAVIOR INSIGHTS */}
        {animal.behavior_insights?.length > 0 && (
          <section>
            <SectionLabel>Behavior</SectionLabel>
            <MaasaiDivider className="mt-3" />
            <ol className="mt-5 space-y-4">
              {animal.behavior_insights.map((insight, i) => (
                <li key={i} className="flex gap-4 glass rounded-2xl p-4">
                  <span className="font-display text-3xl font-bold text-[var(--gold)] leading-none w-10 shrink-0">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p className="text-sm sm:text-base leading-relaxed text-foreground/85">{insight}</p>
                </li>
              ))}
            </ol>
          </section>
        )}

        {/* LIVE TRACKER */}
        {trackPath.length > 0 && (
          <section>
            <SectionLabel>Live Tracker · Ramani</SectionLabel>
            <div className="glass rounded-3xl p-4 mt-3">
              <SafariMap
                center={trackPath[trackPath.length - 1]}
                zoom={9}
                markers={[{
                  id: animal.id,
                  lat: trackPath[trackPath.length - 1][0],
                  lng: trackPath[trackPath.length - 1][1],
                  type: "animal",
                  label: `${animal.name} — last sighting`,
                }]}
                routeLine={trackPath.length > 1 ? trackPath : undefined}
                className="h-[360px] w-full rounded-2xl overflow-hidden"
              />
              <p className="text-[10px] text-muted-foreground mt-2 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" /> Tracking points are delayed for animal safety. View the full live map at <Link to="/map" className="underline ml-1">/map</Link>.
              </p>
            </div>
          </section>
        )}

        {/* CULTURAL RELEVANCE */}
        {animal.cultural_relevance && (
          <section
            className="rounded-3xl p-6 sm:p-10"
            style={{
              background: "linear-gradient(135deg, color-mix(in oklab, var(--cream) 80%, transparent), color-mix(in oklab, var(--gold) 15%, transparent))",
            }}
          >
            <div className="flex items-center gap-2 text-xs text-[var(--maasai)] font-bold uppercase tracking-[0.2em]">
              <Sparkles className="h-3.5 w-3.5" /> Cultural Relevance
            </div>
            <p className="font-display text-lg sm:text-xl italic leading-relaxed text-black/80 mt-4">
              {animal.cultural_relevance}
            </p>
          </section>
        )}

        {/* WHERE TO SEE → HOTELS */}
        <section>
          <SectionLabel>Where to See</SectionLabel>
          <div className="flex flex-wrap gap-2 mt-3">
            {animal.parks.map((p) => (
              <span key={p} className="px-3 py-1.5 rounded-full text-xs font-semibold glass">
                <MapPin className="inline h-3 w-3 mr-1 text-[var(--gold)]" />
                {p}
              </span>
            ))}
          </div>

          <h3 className="font-display text-2xl font-bold mt-8">Stay Nearby</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Hand-picked lodges and camps inside the {animal.name.toLowerCase()}&apos;s range.
          </p>

          {hotels.length === 0 ? (
            <div className="glass rounded-2xl p-6 mt-4 text-sm text-muted-foreground">
              No partner lodges listed yet for these parks.{" "}
              <Link to="/hotels" className="text-[var(--gold)] font-semibold underline">
                Browse all stays →
              </Link>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              {hotels.map((h) => (
                <Link
                  key={h.id}
                  to="/hotels/$hotelId"
                  params={{ hotelId: h.id }}
                  className="group block glass rounded-2xl overflow-hidden hover-lift"
                >
                  <div className="aspect-[5/3] overflow-hidden bg-black/20">
                    <img
                      src={h.images?.[0] || images.savanna}
                      alt={h.name}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-4">
                    <p className="text-[10px] uppercase tracking-widest text-[var(--maasai)] font-bold">
                      {h.park || h.region}
                    </p>
                    <h4 className="font-display text-lg font-bold mt-1">{h.name}</h4>
                    <div className="flex items-center justify-between mt-3">
                      <span className="font-mono text-sm">
                        <span className="text-[var(--gold)] font-bold">KSh {Number(h.price_min).toLocaleString()}</span>
                        <span className="text-muted-foreground"> /night</span>
                      </span>
                      <span className="flex items-center gap-1 text-xs">
                        <Star className="h-3 w-3 fill-[var(--gold)] text-[var(--gold)]" />
                        {Number(h.rating).toFixed(1)}
                      </span>
                    </div>
                    <div className="mt-3 inline-flex items-center gap-1 text-xs text-[var(--gold)] font-semibold">
                      Book this stay <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </Shell>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 text-xs text-[var(--gold)] font-bold uppercase tracking-[0.25em]">
      <Sparkles className="h-3 w-3" /> {children}
    </div>
  );
}
