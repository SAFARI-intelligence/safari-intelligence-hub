import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, BookOpen, Sparkles, Trash2, MapPin, Plus } from "lucide-react";
import { toast } from "sonner";
import { Shell } from "@/components/safari/Shell";
import { RoleGuard } from "@/components/safari/RoleGuard";
import { MaasaiDivider } from "@/components/safari/MaasaiDivider";
import { useAuth } from "@/lib/auth";
import { listMyJournal, createJournalEntry, deleteJournalEntry } from "@/lib/wis.functions";

export const Route = createFileRoute("/journal")({
  head: () => ({
    meta: [
      { title: "Digital Safari Journal · SAFARI" },
      {
        name: "description",
        content: "AI-narrated journal of your wildlife sightings across East Africa.",
      },
    ],
  }),
  component: () => (
    <RoleGuard allow={["user"]}>
      <JournalPage />
    </RoleGuard>
  ),
});

type Entry = {
  id: string;
  species: string;
  park: string;
  observed_at: string;
  note: string;
  photo_url: string | null;
  narrative: string | null;
};

const SPECIES = [
  "Lion",
  "Elephant",
  "Cheetah",
  "Leopard",
  "Giraffe",
  "Zebra",
  "Buffalo",
  "Black Rhino",
  "White Rhino",
  "Mountain Gorilla",
  "Wild Dog",
  "Hippo",
  "Serval",
];
const PARKS = [
  "Maasai Mara",
  "Amboseli",
  "Tsavo",
  "Samburu",
  "Lake Nakuru",
  "Ol Pejeta",
  "Serengeti",
  "Bwindi",
];

function JournalPage() {
  const { user } = useAuth();
  const list = useServerFn(listMyJournal);
  const create = useServerFn(createJournalEntry);
  const remove = useServerFn(deleteJournalEntry);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [species, setSpecies] = useState(SPECIES[0]);
  const [park, setPark] = useState(PARKS[0]);
  const [note, setNote] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");

  const reload = async () => {
    try {
      const res = await list();
      setEntries((res.entries as Entry[]) ?? []);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to load journal");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) reload();
  }, [user]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!note.trim()) return;
    setSubmitting(true);
    try {
      await create({
        data: {
          species,
          park,
          note: note.trim(),
          photoUrl: photoUrl.trim() || null,
        },
      });
      toast.success("Asante — entry saved. AI is weaving your narrative.");
      setNote("");
      setPhotoUrl("");
      await reload();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Could not save entry";
      if (msg.includes("429")) toast.error("AI is busy — try again in a moment.");
      else if (msg.includes("402")) toast.error("AI credits exhausted — see workspace billing.");
      else toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const del = async (id: string) => {
    try {
      await remove({ data: { id } });
      setEntries((prev) => prev.filter((e) => e.id !== id));
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Could not delete");
    }
  };

  return (
    <Shell>
      <div className="mx-auto max-w-5xl space-y-8">
        <header>
          <span className="text-xs uppercase tracking-[0.18em] text-[var(--maasai)] font-semibold">
            Diary · Andika safari yako
          </span>
          <h1 className="font-display text-4xl sm:text-5xl font-bold mt-2 flex items-center gap-3">
            <BookOpen className="h-9 w-9 text-[var(--gold)]" /> Digital Safari Journal
          </h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Capture sightings as they happen. SAFARI Intelligence weaves each note into a vivid,
            personal narrative — your trip remembered, beautifully.
          </p>
        </header>

        <section className="glass-strong rounded-3xl p-6 sm:p-8 grain">
          <h2 className="font-display text-2xl font-bold mb-4 flex items-center gap-2">
            <Plus className="h-5 w-5 text-[var(--gold)]" /> New entry
          </h2>
          <form onSubmit={submit} className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm">
              <span className="font-label text-xs text-muted-foreground block mb-1">Species</span>
              <select
                value={species}
                onChange={(e) => setSpecies(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border/60 bg-background text-sm"
              >
                {SPECIES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
            <label className="text-sm">
              <span className="font-label text-xs text-muted-foreground block mb-1">Park</span>
              <select
                value={park}
                onChange={(e) => setPark(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border/60 bg-background text-sm"
              >
                {PARKS.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </label>
            <label className="text-sm sm:col-span-2">
              <span className="font-label text-xs text-muted-foreground block mb-1">
                Your note ({note.length}/500)
              </span>
              <textarea
                required
                rows={3}
                maxLength={500}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="A pride of lions resting under acacia after a hunt…"
                className="w-full px-3 py-2 rounded-lg border border-border/60 bg-background text-sm"
              />
            </label>
            <label className="text-sm sm:col-span-2">
              <span className="font-label text-xs text-muted-foreground block mb-1">
                Photo URL (optional)
              </span>
              <input
                type="url"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                placeholder="https://…"
                className="w-full px-3 py-2 rounded-lg border border-border/60 bg-background text-sm"
              />
            </label>
            <button
              type="submit"
              disabled={submitting}
              className="sm:col-span-2 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-foreground text-background font-semibold text-sm disabled:opacity-60"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              {submitting ? "Saving & weaving narrative…" : "Save & narrate"}
            </button>
          </form>
        </section>

        <MaasaiDivider />

        {loading ? (
          <div className="grid place-items-center py-16">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p className="font-display text-2xl italic">Andika safari yako</p>
            <p className="text-sm mt-2">Your journal is empty — log your first sighting above.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {entries.map((e) => (
              <article key={e.id} className="glass rounded-2xl overflow-hidden">
                {e.photo_url && (
                  <img src={e.photo_url} alt={e.species} className="w-full h-48 object-cover" />
                )}
                <div className="p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-[11px] text-muted-foreground flex items-center gap-2">
                        <MapPin className="h-3 w-3" /> {e.park}
                        <span>·</span>
                        {new Date(e.observed_at).toLocaleString()}
                      </div>
                      <h3 className="font-display text-2xl font-bold mt-1">{e.species}</h3>
                    </div>
                    <button onClick={() => del(e.id)} className="text-[var(--maasai)] p-1.5">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-sm text-foreground/80 mt-2 italic">"{e.note}"</p>
                  {e.narrative ? (
                    <div className="mt-4 pt-4 border-t border-[var(--gold)]/30">
                      <div className="font-label text-[10px] uppercase tracking-wider text-[var(--gold)] mb-1.5 flex items-center gap-1.5">
                        <Sparkles className="h-3 w-3" /> SAFARI Intelligence narrative
                      </div>
                      <p className="font-serif text-[15px] leading-relaxed text-foreground/95">
                        {e.narrative}
                      </p>
                    </div>
                  ) : (
                    <p className="mt-3 text-xs text-muted-foreground">
                      Narrative pending — try again shortly.
                    </p>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}

        <p className="text-center">
          <Link
            to="/wildlife"
            className="text-sm text-[var(--maasai)] font-semibold hover:underline"
          >
            ← Back to Wildlife feed
          </Link>
        </p>
      </div>
    </Shell>
  );
}
