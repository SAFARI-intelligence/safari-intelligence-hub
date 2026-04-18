import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Shell } from "@/components/safari/Shell";
import { RoleGuard } from "@/components/safari/RoleGuard";
import { Shield, Users, Building2, BookOpen, Loader2, MessageSquare, Trash2 } from "lucide-react";

export const Route = createFileRoute("/support")({
  head: () => ({
    meta: [
      { title: "Support Console · Safari OS" },
      { name: "description", content: "Internal admin console — manage users, hotels, tickets, and reviews." },
    ],
  }),
  component: () => (
    <RoleGuard allow={["support"]}>
      <SupportConsole />
    </RoleGuard>
  ),
});

type Tab = "overview" | "users" | "hotels" | "tickets" | "reviews";

function SupportConsole() {
  const [tab, setTab] = useState<Tab>("overview");
  const [stats, setStats] = useState({ users: 0, hotels: 0, bookings: 0, tickets: 0, revenue: 0 });
  const [profiles, setProfiles] = useState<any[]>([]);
  const [hotels, setHotels] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [p, h, b, t, r] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("hotels").select("*").order("created_at", { ascending: false }),
      supabase.from("bookings").select("total_price,status"),
      supabase.from("support_tickets").select("*").order("created_at", { ascending: false }),
      supabase.from("reviews").select("*").order("created_at", { ascending: false }),
    ]);
    setProfiles(p.data || []);
    setHotels(h.data || []);
    setTickets(t.data || []);
    setReviews(r.data || []);
    const revenue =
      b.data?.filter((x: any) => x.status === "confirmed").reduce((s: number, x: any) => s + Number(x.total_price), 0) || 0;
    setStats({
      users: p.data?.length || 0,
      hotels: h.data?.length || 0,
      bookings: b.data?.length || 0,
      tickets: t.data?.filter((x: any) => x.status === "open").length || 0,
      revenue,
    });
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const updateTicket = async (id: string, status: string) => {
    await supabase.from("support_tickets").update({ status: status as any }).eq("id", id);
    load();
  };

  const togglePublish = async (id: string, published: boolean) => {
    await supabase.from("hotels").update({ is_published: !published }).eq("id", id);
    load();
  };

  const deleteHotel = async (id: string) => {
    if (!confirm("Delete this hotel and all its bookings?")) return;
    await supabase.from("hotels").delete().eq("id", id);
    load();
  };

  const deleteReview = async (id: string) => {
    await supabase.from("reviews").delete().eq("id", id);
    load();
  };

  return (
    <Shell>
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="glass-strong rounded-3xl p-6 sm:p-8">
          <div className="flex items-center gap-2 text-xs text-[var(--forest)] font-semibold uppercase tracking-widest">
            <Shield className="h-3.5 w-3.5" /> Support console · Admin
          </div>
          <h1 className="font-display text-3xl font-bold mt-2">System overview</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Full read/write access. Moderate users, hotels, tickets, and reviews.
          </p>

          <div className="mt-5 grid grid-cols-2 lg:grid-cols-5 gap-3">
            <KStat label="Users" value={stats.users} icon={<Users className="h-4 w-4" />} />
            <KStat label="Hotels" value={stats.hotels} icon={<Building2 className="h-4 w-4" />} />
            <KStat label="Bookings" value={stats.bookings} icon={<BookOpen className="h-4 w-4" />} />
            <KStat label="Open tickets" value={stats.tickets} icon={<MessageSquare className="h-4 w-4" />} />
            <KStat
              label="Revenue (KSh)"
              value={stats.revenue.toLocaleString()}
              icon={<span className="text-base">💰</span>}
              accent
            />
          </div>
        </div>

        <div className="flex gap-1 overflow-x-auto pb-1">
          {(["overview", "users", "hotels", "tickets", "reviews"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm capitalize whitespace-nowrap ${
                tab === t ? "bg-foreground text-background font-semibold" : "hover:bg-foreground/5"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid place-items-center py-12">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <div className="glass rounded-2xl p-6 overflow-x-auto">
            {tab === "overview" && (
              <div>
                <h2 className="font-display text-lg font-bold mb-3">Latest activity</h2>
                <ul className="text-sm space-y-2">
                  {profiles.slice(0, 5).map((p) => (
                    <li key={p.id} className="flex items-center justify-between border-b border-border/40 py-2">
                      <span>👤 New user: <strong>{p.name || p.email}</strong></span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(p.created_at).toLocaleDateString()}
                      </span>
                    </li>
                  ))}
                  {tickets.slice(0, 5).map((t) => (
                    <li key={t.id} className="flex items-center justify-between border-b border-border/40 py-2">
                      <span>🎫 Ticket: <strong>{t.subject}</strong></span>
                      <span className="text-xs text-muted-foreground">{t.status}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {tab === "users" && (
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase text-muted-foreground">
                  <tr><th className="py-2">Name</th><th>Email</th><th>Joined</th></tr>
                </thead>
                <tbody>
                  {profiles.map((p) => (
                    <tr key={p.id} className="border-t border-border/40">
                      <td className="py-2.5 font-medium">{p.name || "—"}</td>
                      <td>{p.email}</td>
                      <td className="text-xs text-muted-foreground">
                        {new Date(p.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {tab === "hotels" && (
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase text-muted-foreground">
                  <tr><th className="py-2">Name</th><th>Country</th><th>Price</th><th>Status</th><th></th></tr>
                </thead>
                <tbody>
                  {hotels.map((h) => (
                    <tr key={h.id} className="border-t border-border/40">
                      <td className="py-2.5 font-medium">{h.name}</td>
                      <td>{h.country}</td>
                      <td className="text-[var(--gold)]">KSh {Number(h.price_min).toLocaleString()}</td>
                      <td>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                          h.is_published ? "bg-[var(--forest)]/15 text-[var(--forest)]" : "bg-muted text-muted-foreground"
                        }`}>
                          {h.is_published ? "live" : "hidden"}
                        </span>
                      </td>
                      <td>
                        <div className="flex gap-1">
                          <button
                            onClick={() => togglePublish(h.id, h.is_published)}
                            className="text-xs px-2 py-1 rounded border border-border"
                          >
                            {h.is_published ? "Hide" : "Publish"}
                          </button>
                          <button
                            onClick={() => deleteHotel(h.id)}
                            className="text-xs px-2 py-1 rounded text-[var(--maasai)] border border-[var(--maasai)]/40"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {tab === "tickets" && (
              <div className="space-y-3">
                {tickets.length === 0 && <p className="text-sm text-muted-foreground">No tickets.</p>}
                {tickets.map((t) => (
                  <div key={t.id} className="rounded-xl border border-border/60 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold">{t.subject}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {t.priority} priority · {new Date(t.created_at).toLocaleString()}
                        </p>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                        t.status === "closed"
                          ? "bg-muted text-muted-foreground"
                          : t.status === "in_progress"
                          ? "bg-[var(--gold)]/15 text-[var(--gold)]"
                          : "bg-[var(--maasai)]/15 text-[var(--maasai)]"
                      }`}>{t.status}</span>
                    </div>
                    <p className="text-sm mt-2">{t.message}</p>
                    <div className="mt-3 flex gap-1">
                      {t.status !== "in_progress" && (
                        <button onClick={() => updateTicket(t.id, "in_progress")} className="text-xs px-2 py-1 rounded bg-[var(--gold)]/15 text-[var(--gold)]">
                          Mark in-progress
                        </button>
                      )}
                      {t.status !== "closed" && (
                        <button onClick={() => updateTicket(t.id, "closed")} className="text-xs px-2 py-1 rounded bg-[var(--forest)]/15 text-[var(--forest)]">
                          Close
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {tab === "reviews" && (
              <div className="space-y-2">
                {reviews.length === 0 && <p className="text-sm text-muted-foreground">No reviews yet.</p>}
                {reviews.map((r) => (
                  <div key={r.id} className="flex items-start justify-between gap-3 border-b border-border/40 py-3">
                    <div>
                      <p className="text-sm">⭐ {r.rating} — {r.comment || "(no comment)"}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {new Date(r.created_at).toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteReview(r.id)}
                      className="text-xs px-2 py-1 rounded text-[var(--maasai)] border border-[var(--maasai)]/40"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Shell>
  );
}

function KStat({ label, value, icon, accent }: { label: string; value: string | number; icon: React.ReactNode; accent?: boolean }) {
  return (
    <div className="rounded-xl border border-border/60 p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
        <span className="text-muted-foreground">{icon}</span>
      </div>
      <p className={`font-display text-2xl font-bold mt-1 ${accent ? "text-[var(--gold)]" : ""}`}>{value}</p>
    </div>
  );
}
