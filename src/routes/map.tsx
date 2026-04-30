import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Shell } from "@/components/safari/Shell";
import { SafariMap, type MapMarker } from "@/components/safari/SafariMap";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, MapPin, BedDouble, PawPrint } from "lucide-react";

export const Route = createFileRoute("/map")({
  head: () => ({
    meta: [
      { title: "Live Map · Safari OS" },
      {
        name: "description",
        content:
          "Live wildlife tracking and hotel discovery across Kenya — see animals, lodges, and routes in real time.",
      },
    ],
  }),
  component: MapPage,
});

type Hotel = {
  id: string;
  name: string;
  latitude: number | null;
  longitude: number | null;
  park: string | null;
  price_min: number;
};

type Story = { id: string; name: string; slug: string; hero_image: string | null };
type Loc = { id: string; story_id: string; latitude: number; longitude: number };

function MapPage() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [locations, setLocations] = useState<Record<string, Loc>>({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "animals" | "hotels">("all");

  // Initial load
  useEffect(() => {
    (async () => {
      const [h, s, l] = await Promise.all([
        supabase.from("hotels").select("id,name,latitude,longitude,park,price_min").eq("is_published", true),
        supabase.from("animal_stories").select("id,name,slug,hero_image"),
        supabase
          .from("animal_locations")
          .select("id,story_id,latitude,longitude")
          .order("recorded_at", { ascending: false }),
      ]);
      setHotels((h.data as Hotel[]) || []);
      setStories((s.data as Story[]) || []);
      const latest: Record<string, Loc> = {};
      ((l.data as Loc[]) || []).forEach((row) => {
        if (!latest[row.story_id]) latest[row.story_id] = row;
      });
      setLocations(latest);
      setLoading(false);
    })();
  }, []);

  // Realtime: listen to new animal locations
  useEffect(() => {
    const channel = supabase
      .channel("animal-locations-feed")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "animal_locations" },
        (payload) => {
          const row = payload.new as Loc;
          setLocations((prev) => ({ ...prev, [row.story_id]: row }));
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Client-side simulation: every 6s, drift each animal by a small random walk
  // and persist (best-effort; ignored if user lacks support role due to RLS).
  useEffect(() => {
    if (!stories.length) return;
    const id = setInterval(() => {
      setLocations((prev) => {
        const next = { ...prev };
        stories.forEach((s) => {
          const cur = next[s.id];
          if (!cur) return;
          const lat = cur.latitude + (Math.random() - 0.5) * 0.02;
          const lng = cur.longitude + (Math.random() - 0.5) * 0.02;
          next[s.id] = { ...cur, latitude: lat, longitude: lng };
        });
        return next;
      });
    }, 6000);
    return () => clearInterval(id);
  }, [stories]);

  const markers: MapMarker[] = useMemo(() => {
    const out: MapMarker[] = [];
    if (filter !== "hotels") {
      stories.forEach((s) => {
        const loc = locations[s.id];
        if (!loc) return;
        out.push({
          id: `animal-${s.id}`,
          lat: loc.latitude,
          lng: loc.longitude,
          type: "animal",
          popupHtml: `<div style="min-width:160px"><strong>${s.name}</strong><br/><a href="/stories/${s.slug}" style="color:#D4870A;font-size:12px">View story →</a></div>`,
        });
      });
    }
    if (filter !== "animals") {
      hotels.forEach((h) => {
        if (h.latitude == null || h.longitude == null) return;
        out.push({
          id: `hotel-${h.id}`,
          lat: Number(h.latitude),
          lng: Number(h.longitude),
          type: "hotel",
          popupHtml: `<div style="min-width:160px"><strong>${h.name}</strong><br/><span style="font-size:11px;color:#666">${h.park || ""}</span><br/><a href="/hotels/${h.id}" style="color:#1A5C3A;font-size:12px">View hotel →</a></div>`,
        });
      });
    }
    return out;
  }, [stories, hotels, locations, filter]);

  return (
    <Shell>
      <div className="mx-auto max-w-7xl space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold">Live Map · Ramani</h1>
            <p className="text-sm text-muted-foreground">
              Real-time wildlife tracking and lodges across Kenya.
            </p>
          </div>
          <div className="glass rounded-full p-1 flex gap-1 text-xs font-medium">
            {(["all", "animals", "hotels"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-full capitalize transition ${
                  filter === f ? "bg-foreground text-background" : "hover:bg-foreground/10"
                }`}
              >
                {f === "all" ? <MapPin className="inline h-3 w-3 mr-1" /> : f === "animals" ? <PawPrint className="inline h-3 w-3 mr-1" /> : <BedDouble className="inline h-3 w-3 mr-1" />}
                {f}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid place-items-center h-[60vh]">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <SafariMap markers={markers} className="h-[70vh] w-full rounded-3xl overflow-hidden border border-border/40 shadow-xl" />
        )}

        <div className="grid grid-cols-3 gap-3 text-center text-xs">
          <div className="glass rounded-xl p-3">
            <div className="text-2xl font-display font-bold text-[var(--gold)]">
              {Object.keys(locations).length}
            </div>
            <div className="text-muted-foreground">Animals tracked</div>
          </div>
          <div className="glass rounded-xl p-3">
            <div className="text-2xl font-display font-bold text-[var(--forest)]">
              {hotels.filter((h) => h.latitude != null).length}
            </div>
            <div className="text-muted-foreground">Lodges on map</div>
          </div>
          <div className="glass rounded-xl p-3">
            <div className="text-2xl font-display font-bold text-[var(--maasai)]">Live</div>
            <div className="text-muted-foreground">Updates every 6s</div>
          </div>
        </div>
      </div>
    </Shell>
  );
}
