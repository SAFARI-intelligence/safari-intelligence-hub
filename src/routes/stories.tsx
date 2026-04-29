import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Sparkles, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Shell } from "@/components/safari/Shell";
import { MaasaiDivider } from "@/components/safari/MaasaiDivider";
import { images } from "@/lib/safari-data";

export const Route = createFileRoute("/stories")({
  head: () => ({
    meta: [
      { title: "The Big Five — Wanyama wa Tano Wakubwa · Safari OS" },
      {
        name: "description",
        content:
          "Lion, Elephant, Leopard, Rhino, Buffalo — cinematic stories of Kenya's Big Five, with the parks and lodges to see them.",
      },
      { property: "og:title", content: "The Big Five — Safari OS" },
      {
        property: "og:description",
        content: "Cinematic stories of Kenya's Big Five and where to stay nearby.",
      },
    ],
  }),
  component: StoriesPage,
});

const fallbackImg: Record<string, string> = {
  lion: images.lion,
  elephant: images.elephants,
  leopard: images.cheetah,
  rhino: images.savanna,
  buffalo: images.buffalo,
};

type Story = {
  id: string;
  slug: string;
  name: string;
  swahili_name: string | null;
  title: string;
  short_story: string;
  hero_narrative: string | null;
  parks: string[];
  hero_image: string | null;
  image: string | null;
};

function StoriesPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("animal_stories")
      .select("id, slug, name, swahili_name, title, short_story, hero_narrative, parks, hero_image, image")
      .order("name")
      .then(({ data }) => {
        setStories((data as Story[]) || []);
        setLoading(false);
      });
  }, []);

  return (
    <Shell>
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="glass-strong rounded-3xl p-6 sm:p-10 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none"
               style={{ backgroundImage: "radial-gradient(circle at 20% 0%, var(--gold) 0, transparent 40%)" }} />
          <div className="relative">
            <div className="flex items-center gap-2 text-xs text-[var(--gold)] font-semibold uppercase tracking-[0.2em]">
              <Sparkles className="h-3.5 w-3.5" /> The Big Five
            </div>
            <h1 className="font-display text-4xl sm:text-5xl font-bold mt-3 leading-tight">
              Wanyama wa Tano Wakubwa
            </h1>
            <p className="text-base text-muted-foreground mt-3 max-w-2xl leading-relaxed">
              Five animals. Five chapters of the savanna. Cinematic stories paired with the parks
              where they roam — and the lodges where you can stay close.
            </p>
            <MaasaiDivider className="mt-6" />
          </div>
        </header>

        {loading ? (
          <div className="grid place-items-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-[var(--gold)]" />
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {stories.map((s, i) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07, duration: 0.5 }}
              >
                <Link
                  to="/stories/$slug"
                  params={{ slug: s.slug }}
                  className="group block rounded-3xl overflow-hidden glass relative h-96 hover-lift"
                >
                  <img
                    src={s.hero_image || s.image || fallbackImg[s.slug] || images.savanna}
                    alt={s.name}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                    <p className="text-[10px] uppercase tracking-[0.25em] text-[var(--gold)] font-bold">
                      {s.swahili_name || s.name}
                    </p>
                    <h2 className="font-display text-2xl font-bold mt-1">{s.title}</h2>
                    <p className="text-sm text-white/80 mt-2 line-clamp-2 leading-relaxed">
                      {s.short_story}
                    </p>
                    <div className="mt-3 flex items-center gap-2 text-xs text-[var(--gold)] font-semibold">
                      Read the story <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </Shell>
  );
}
