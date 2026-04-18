import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Shell } from "@/components/safari/Shell";
import { Loader2, Sparkles } from "lucide-react";
import { images } from "@/lib/safari-data";

export const Route = createFileRoute("/stories")({
  head: () => ({
    meta: [
      { title: "Big Five Stories · Safari OS" },
      { name: "description", content: "Discover the Big Five — lion, elephant, leopard, rhino, buffalo — through short stories and fun facts." },
    ],
  }),
  component: StoriesPage,
});

const fallbackImg: Record<string, string> = {
  Lion: images.lion,
  Elephant: images.elephants,
  Leopard: images.cheetah,
  Rhinoceros: images.savanna,
  Buffalo: images.buffalo,
};

function StoriesPage() {
  const [stories, setStories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("animal_stories").select("*").then(({ data }) => {
      setStories(data || []);
      setLoading(false);
    });
  }, []);

  return (
    <Shell>
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="glass-strong rounded-3xl p-6 sm:p-8">
          <div className="flex items-center gap-2 text-xs text-[var(--gold)] font-semibold uppercase tracking-widest">
            <Sparkles className="h-3.5 w-3.5" /> Big Five
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold mt-2">Wanyama wa Tano Wakubwa</h1>
          <p className="text-sm text-muted-foreground mt-1">Stories from the savanna — short reads + fun facts.</p>
        </div>

        {loading ? (
          <div className="grid place-items-center py-20">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {stories.map((s) => (
              <article key={s.id} className="glass rounded-2xl overflow-hidden">
                <div className="aspect-[5/3] overflow-hidden">
                  <img
                    src={s.image || fallbackImg[s.name] || images.savanna}
                    alt={s.name}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <p className="text-[10px] uppercase tracking-widest text-[var(--maasai)] font-bold">{s.name}</p>
                  <h3 className="font-display text-lg font-bold mt-1">{s.title}</h3>
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{s.short_story}</p>
                  {s.fun_facts?.length > 0 && (
                    <ul className="mt-3 space-y-1">
                      {s.fun_facts.map((f: string, i: number) => (
                        <li key={i} className="text-xs flex gap-2">
                          <span>✨</span>
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </Shell>
  );
}
