import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Shell } from "@/components/safari/Shell";
import { RoleGuard } from "@/components/safari/RoleGuard";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Loader2, BedDouble, Star, LifeBuoy, Send, MapPin, Trash2, Sparkles, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { generateTripSummary, getTripSummary } from "@/lib/wis.functions";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "My Profile · SAFARI" },
      { name: "description", content: "Your bookings, itineraries, reviews, and support tickets." },
    ],
  }),
  component: () => (
    <RoleGuard allow={["user"]}>
      <ProfilePage />
    </RoleGuard>
  ),
});

type Booking = { id: string; hotel_name: string; check_in: string; check_out: string; guests: number; total_price: number; status: string };
type Review = { id: string; hotel_id: string; rating: number; comment: string | null; created_at: string };
type Ticket = { id: string; subject: string; message: string; status: string; priority: string; created_at: string };
type Itinerary = { id: string; title: string; total_cost: number; duration_days: number; created_at: string };

const tiers = [
  { name: "Cub", min: 0, color: "var(--forest)" },
  { name: "Ranger", min: 1000, color: "var(--gold)" },
  { name: "Scout", min: 5000, color: "var(--maasai)" },
  { name: "Legend", min: 15000, color: "var(--charcoal)" },
];

function ProfilePage() {
  const { user, roles } = useAuth();
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [name, setName] = useState("");
  const [ticketSubj, setTicketSubj] = useState("");
  const [ticketMsg, setTicketMsg] = useState("");
  const [points] = useState(() => {
    try { return Number(localStorage.getItem("simba-points") || 6420); } catch { return 6420; }
  });

  const currentTier = [...tiers].reverse().find((t) => points >= t.min) || tiers[0];

  const reload = async () => {
    if (!user) return;
    const [b, r, t, i, p] = await Promise.all([
      supabase.from("bookings").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("reviews").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("support_tickets").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("itineraries").select("id,title,total_cost,duration_days,created_at").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("profiles").select("name").eq("id", user.id).maybeSingle(),
    ]);
    setBookings((b.data as Booking[]) || []);
    setReviews((r.data as Review[]) || []);
    setTickets((t.data as Ticket[]) || []);
    setItineraries((i.data as Itinerary[]) || []);
    setName(p.data?.name || user.email?.split("@")[0] || "");
    setLoading(false);
  };

  useEffect(() => { reload(); }, [user]);

  const submitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !ticketSubj || !ticketMsg) return;
    const { error } = await supabase.from("support_tickets").insert({
      user_id: user.id,
      subject: ticketSubj,
      message: ticketMsg,
    });
    if (error) toast.error(error.message);
    else {
      toast.success("Asante — your ticket has been submitted.");
      setTicketSubj(""); setTicketMsg("");
      reload();
    }
  };

  const deleteItinerary = async (id: string) => {
    await supabase.from("itineraries").delete().eq("id", id);
    reload();
  };

  if (loading) {
    return (
      <Shell>
        <div className="grid place-items-center py-24"><Loader2 className="h-6 w-6 animate-spin" /></div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="mx-auto max-w-5xl space-y-6">
        {/* User card */}
        <section className="glass-strong rounded-3xl p-6 sm:p-8 relative overflow-hidden grain">
          <div className="absolute -top-10 -right-10 h-48 w-48 rounded-full bg-gradient-to-br from-[var(--gold)]/30 to-[var(--maasai)]/20 blur-3xl pointer-events-none" />
          <div className="relative flex items-start gap-4 flex-wrap">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[var(--gold)] to-[var(--maasai)] grid place-items-center text-3xl shadow-[var(--shadow-glow-gold)]">
              🦁
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-label text-[var(--maasai)] text-xs">Karibu tena</div>
              <h1 className="font-display text-3xl font-bold truncate">{name}</h1>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              <div className="mt-3 flex items-center gap-2 flex-wrap">
                <span
                  className="text-xs font-semibold px-2.5 py-1 rounded-full text-white"
                  style={{ background: currentTier.color }}
                >
                  {currentTier.name} tier
                </span>
                <span className="text-xs font-mono-data text-[var(--gold)]">
                  {points.toLocaleString()} Simba pts
                </span>
                {roles.map((r) => (
                  <span key={r} className="text-[10px] uppercase px-2 py-0.5 rounded-full bg-foreground/5 text-muted-foreground font-semibold tracking-wider">
                    {r}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="grid md:grid-cols-2 gap-4">
          <Stat label="Bookings" value={bookings.length} />
          <Stat label="Itineraries" value={itineraries.length} />
          <Stat label="Reviews" value={reviews.length} />
          <Stat label="Open tickets" value={tickets.filter(t => t.status === "open").length} accent />
        </div>

        {/* Itineraries */}
        <section className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-xl font-bold flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-[var(--gold)]" /> My AI itineraries
            </h2>
            <Link to="/plan" className="text-xs text-[var(--maasai)] font-semibold hover:underline">Plan new →</Link>
          </div>
          {itineraries.length === 0 ? (
            <p className="text-sm text-muted-foreground">No itineraries yet. <Link to="/plan" className="underline">Plan one now</Link>.</p>
          ) : (
            <div className="space-y-2">
              {itineraries.map((i) => (
                <div key={i.id} className="flex items-center justify-between gap-3 p-3 rounded-xl border border-border/50">
                  <div className="min-w-0">
                    <p className="font-semibold truncate">{i.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {i.duration_days} days · KSh {Number(i.total_cost).toLocaleString()}
                    </p>
                  </div>
                  <button onClick={() => deleteItinerary(i.id)} className="text-[var(--maasai)] p-1.5">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Bookings */}
        <section className="glass rounded-2xl p-6">
          <h2 className="font-display text-xl font-bold mb-3 flex items-center gap-2">
            <BedDouble className="h-5 w-5" /> My bookings
          </h2>
          {bookings.length === 0 ? (
            <p className="text-sm text-muted-foreground">No bookings yet. <Link to="/hotels" className="underline">Browse hotels</Link>.</p>
          ) : (
            <div className="space-y-2">
              {bookings.map((b) => (
                <div key={b.id} className="flex items-center justify-between gap-3 p-3 rounded-xl border border-border/50">
                  <div className="min-w-0">
                    <p className="font-semibold truncate">{b.hotel_name}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {b.check_in} → {b.check_out} · {b.guests} guest{b.guests > 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="font-semibold text-[var(--gold)]">
                      KSh {Number(b.total_price).toLocaleString()}
                    </div>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                        b.status === "confirmed"
                          ? "bg-[var(--forest)]/15 text-[var(--forest)]"
                          : b.status === "cancelled"
                          ? "bg-[var(--maasai)]/15 text-[var(--maasai)]"
                          : "bg-[var(--gold)]/15 text-[var(--gold)]"
                      }`}
                    >
                      {b.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Reviews */}
        <section className="glass rounded-2xl p-6">
          <h2 className="font-display text-xl font-bold mb-3 flex items-center gap-2">
            <Star className="h-5 w-5 text-[var(--gold)] fill-[var(--gold)]" /> My reviews
          </h2>
          {reviews.length === 0 ? (
            <p className="text-sm text-muted-foreground">No reviews yet.</p>
          ) : (
            <div className="space-y-2">
              {reviews.map((r) => (
                <div key={r.id} className="p-3 rounded-xl border border-border/50">
                  <div className="flex items-center gap-1 mb-1">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star
                        key={j}
                        className={`h-3.5 w-3.5 ${j < r.rating ? "fill-[var(--gold)] text-[var(--gold)]" : "text-muted-foreground"}`}
                      />
                    ))}
                  </div>
                  <p className="text-sm">{r.comment}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Support tickets */}
        <section className="glass rounded-2xl p-6">
          <h2 className="font-display text-xl font-bold mb-3 flex items-center gap-2">
            <LifeBuoy className="h-5 w-5 text-[var(--maasai)]" /> Support
          </h2>
          <form onSubmit={submitTicket} className="space-y-2 mb-4">
            <input
              required
              value={ticketSubj}
              onChange={(e) => setTicketSubj(e.target.value)}
              placeholder="Subject"
              className="w-full px-3 py-2 rounded-lg border border-border/60 bg-background text-sm"
            />
            <textarea
              required
              rows={3}
              value={ticketMsg}
              onChange={(e) => setTicketMsg(e.target.value)}
              placeholder="How can we help? Tuambie…"
              className="w-full px-3 py-2 rounded-lg border border-border/60 bg-background text-sm"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-foreground text-background text-sm font-semibold flex items-center gap-1.5"
            >
              <Send className="h-3.5 w-3.5" /> Submit ticket
            </button>
          </form>
          {tickets.length > 0 && (
            <div className="space-y-2">
              {tickets.map((t) => (
                <div key={t.id} className="p-3 rounded-xl border border-border/50">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-sm truncate">{t.subject}</p>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                        t.status === "resolved"
                          ? "bg-[var(--forest)]/15 text-[var(--forest)]"
                          : t.status === "open"
                          ? "bg-[var(--maasai)]/15 text-[var(--maasai)]"
                          : "bg-[var(--gold)]/15 text-[var(--gold)]"
                      }`}
                    >
                      {t.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{t.message}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </Shell>
  );
}

function Stat({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className="glass rounded-xl p-4">
      <div className="font-label text-xs text-muted-foreground">{label}</div>
      <div className={`font-display text-3xl font-bold ${accent ? "text-[var(--maasai)]" : ""}`}>
        {value}
      </div>
    </div>
  );
}
