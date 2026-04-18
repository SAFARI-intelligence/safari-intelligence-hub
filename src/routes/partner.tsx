import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Shell } from "@/components/safari/Shell";
import { RoleGuard } from "@/components/safari/RoleGuard";
import { Building2, Plus, Loader2, Trash2, Pencil, X, BedDouble, Star } from "lucide-react";

export const Route = createFileRoute("/partner")({
  head: () => ({
    meta: [
      { title: "Partner Dashboard · Safari OS" },
      { name: "description", content: "Hotel partner dashboard — manage your listings, bookings, and reviews." },
    ],
  }),
  component: () => (
    <RoleGuard allow={["hotel", "support"]}>
      <PartnerDashboard />
    </RoleGuard>
  ),
});

type Hotel = {
  id: string;
  name: string;
  type: string;
  country: string;
  park: string | null;
  region: string | null;
  price_min: number;
  price_max: number;
  rating: number;
  description: string | null;
  amenities: string[];
  images: string[];
  is_published: boolean;
};

type Booking = {
  id: string;
  hotel_id: string;
  hotel_name: string;
  check_in: string;
  check_out: string;
  guests: number;
  total_price: number;
  status: string;
  created_at: string;
};

const empty = {
  name: "",
  type: "lodge",
  country: "Kenya",
  park: "",
  region: "",
  price_min: 15000,
  price_max: 50000,
  description: "",
  amenities: "Wi-Fi, Game drives, Pool, Restaurant",
  images: "",
  is_published: true,
};

function PartnerDashboard() {
  const { user } = useAuth();
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Hotel | null>(null);
  const [form, setForm] = useState(empty);

  const reload = async () => {
    if (!user) return;
    const [{ data: h }, { data: b }] = await Promise.all([
      supabase.from("hotels").select("*").eq("owner_id", user.id).order("created_at", { ascending: false }),
      supabase
        .from("bookings")
        .select("*")
        .in(
          "hotel_id",
          (await supabase.from("hotels").select("id").eq("owner_id", user.id)).data?.map((x) => x.id) || []
        )
        .order("created_at", { ascending: false }),
    ]);
    setHotels((h as Hotel[]) || []);
    setBookings((b as Booking[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    reload();
  }, [user]);

  const openNew = () => {
    setEditing(null);
    setForm(empty);
    setShowForm(true);
  };

  const openEdit = (h: Hotel) => {
    setEditing(h);
    setForm({
      name: h.name,
      type: h.type,
      country: h.country,
      park: h.park || "",
      region: h.region || "",
      price_min: Number(h.price_min),
      price_max: Number(h.price_max),
      description: h.description || "",
      amenities: h.amenities.join(", "),
      images: h.images.join(", "),
      is_published: h.is_published,
    });
    setShowForm(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const payload = {
      owner_id: user.id,
      name: form.name,
      type: form.type as any,
      country: form.country,
      park: form.park || null,
      region: form.region || null,
      price_min: form.price_min,
      price_max: form.price_max,
      description: form.description,
      amenities: form.amenities.split(",").map((s) => s.trim()).filter(Boolean),
      images: form.images.split(",").map((s) => s.trim()).filter(Boolean),
      is_published: form.is_published,
    };
    if (editing) {
      await supabase.from("hotels").update(payload).eq("id", editing.id);
    } else {
      await supabase.from("hotels").insert(payload);
    }
    setShowForm(false);
    reload();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this listing?")) return;
    await supabase.from("hotels").delete().eq("id", id);
    reload();
  };

  const updateBooking = async (id: string, status: string) => {
    await supabase.from("bookings").update({ status: status as any }).eq("id", id);
    reload();
  };

  const totalRevenue = bookings.filter((b) => b.status === "confirmed").reduce((s, b) => s + Number(b.total_price), 0);

  return (
    <Shell>
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="glass-strong rounded-3xl p-6 sm:p-8">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <div className="flex items-center gap-2 text-xs text-[var(--maasai)] font-semibold uppercase tracking-widest">
                <Building2 className="h-3.5 w-3.5" /> Partner terminal
              </div>
              <h1 className="font-display text-3xl font-bold mt-2">Karibu, partner</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Manage your listings, view bookings, and track revenue.
              </p>
            </div>
            <button
              onClick={openNew}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[var(--gold)] to-[var(--maasai)] text-white font-semibold text-sm shadow-[var(--shadow-glow-gold)] flex items-center gap-2"
            >
              <Plus className="h-4 w-4" /> New listing
            </button>
          </div>

          <div className="mt-5 grid sm:grid-cols-3 gap-3">
            <Stat label="Listings" value={hotels.length} />
            <Stat label="Bookings" value={bookings.length} />
            <Stat label="Revenue (KSh)" value={totalRevenue.toLocaleString()} accent />
          </div>
        </div>

        {loading ? (
          <div className="grid place-items-center py-12">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <>
            <section className="glass rounded-2xl p-6">
              <h2 className="font-display text-xl font-bold mb-4">My listings</h2>
              {hotels.length === 0 ? (
                <p className="text-sm text-muted-foreground">No listings yet — click "New listing" to get started.</p>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {hotels.map((h) => (
                    <div key={h.id} className="rounded-xl border border-border/60 p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold">{h.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {h.park || h.region}, {h.country}
                          </p>
                        </div>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full ${
                            h.is_published
                              ? "bg-[var(--forest)]/15 text-[var(--forest)]"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {h.is_published ? "live" : "draft"}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center gap-3 text-xs">
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-[var(--gold)] text-[var(--gold)]" />
                          {Number(h.rating).toFixed(1)}
                        </span>
                        <span className="text-[var(--gold)] font-semibold">
                          KSh {Number(h.price_min).toLocaleString()}
                        </span>
                      </div>
                      <div className="mt-3 flex gap-2">
                        <button
                          onClick={() => openEdit(h)}
                          className="flex-1 px-2 py-1.5 rounded-lg border border-border text-xs flex items-center justify-center gap-1"
                        >
                          <Pencil className="h-3 w-3" /> Edit
                        </button>
                        <button
                          onClick={() => remove(h.id)}
                          className="px-2 py-1.5 rounded-lg border border-[var(--maasai)]/40 text-[var(--maasai)] text-xs"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="glass rounded-2xl p-6">
              <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
                <BedDouble className="h-5 w-5" /> Bookings
              </h2>
              {bookings.length === 0 ? (
                <p className="text-sm text-muted-foreground">No bookings yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="text-left text-xs text-muted-foreground uppercase">
                      <tr>
                        <th className="py-2">Hotel</th>
                        <th>Dates</th>
                        <th>Guests</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map((b) => (
                        <tr key={b.id} className="border-t border-border/40">
                          <td className="py-2.5 font-medium">{b.hotel_name}</td>
                          <td className="text-xs">{b.check_in} → {b.check_out}</td>
                          <td>{b.guests}</td>
                          <td className="font-semibold text-[var(--gold)]">
                            KSh {Number(b.total_price).toLocaleString()}
                          </td>
                          <td>
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full ${
                                b.status === "confirmed"
                                  ? "bg-[var(--forest)]/15 text-[var(--forest)]"
                                  : b.status === "cancelled"
                                  ? "bg-[var(--maasai)]/15 text-[var(--maasai)]"
                                  : "bg-[var(--gold)]/15 text-[var(--gold)]"
                              }`}
                            >
                              {b.status}
                            </span>
                          </td>
                          <td>
                            {b.status === "pending" && (
                              <div className="flex gap-1">
                                <button
                                  onClick={() => updateBooking(b.id, "confirmed")}
                                  className="text-xs px-2 py-1 rounded bg-[var(--forest)]/15 text-[var(--forest)]"
                                >
                                  Confirm
                                </button>
                                <button
                                  onClick={() => updateBooking(b.id, "cancelled")}
                                  className="text-xs px-2 py-1 rounded bg-[var(--maasai)]/10 text-[var(--maasai)]"
                                >
                                  Reject
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}

        {showForm && (
          <div
            className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setShowForm(false)}
          >
            <form
              onSubmit={save}
              onClick={(e) => e.stopPropagation()}
              className="bg-background rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-lg font-bold">
                  {editing ? "Edit listing" : "New listing"}
                </h3>
                <button type="button" onClick={() => setShowForm(false)}>
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-3 text-sm">
                <Field label="Name">
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border/60 bg-background"
                  />
                </Field>
                <div className="grid grid-cols-2 gap-2">
                  <Field label="Type">
                    <select
                      value={form.type}
                      onChange={(e) => setForm({ ...form, type: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-border/60 bg-background"
                    >
                      <option value="hotel">Hotel</option>
                      <option value="villa">Villa</option>
                      <option value="lodge">Lodge</option>
                      <option value="camp">Camp</option>
                    </select>
                  </Field>
                  <Field label="Country">
                    <select
                      value={form.country}
                      onChange={(e) => setForm({ ...form, country: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-border/60 bg-background"
                    >
                      <option>Kenya</option>
                      <option>Tanzania</option>
                      <option>Uganda</option>
                      <option>Rwanda</option>
                    </select>
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Field label="Park">
                    <input
                      value={form.park}
                      onChange={(e) => setForm({ ...form, park: e.target.value })}
                      placeholder="Maasai Mara"
                      className="w-full px-3 py-2 rounded-lg border border-border/60 bg-background"
                    />
                  </Field>
                  <Field label="Region">
                    <input
                      value={form.region}
                      onChange={(e) => setForm({ ...form, region: e.target.value })}
                      placeholder="Narok"
                      className="w-full px-3 py-2 rounded-lg border border-border/60 bg-background"
                    />
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Field label="Price min (KSh/night)">
                    <input
                      type="number"
                      value={form.price_min}
                      onChange={(e) => setForm({ ...form, price_min: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-lg border border-border/60 bg-background"
                    />
                  </Field>
                  <Field label="Price max (KSh/night)">
                    <input
                      type="number"
                      value={form.price_max}
                      onChange={(e) => setForm({ ...form, price_max: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-lg border border-border/60 bg-background"
                    />
                  </Field>
                </div>
                <Field label="Description">
                  <textarea
                    rows={3}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border/60 bg-background"
                  />
                </Field>
                <Field label="Amenities (comma-separated)">
                  <input
                    value={form.amenities}
                    onChange={(e) => setForm({ ...form, amenities: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border/60 bg-background"
                  />
                </Field>
                <Field label="Image URLs (comma-separated)">
                  <input
                    value={form.images}
                    onChange={(e) => setForm({ ...form, images: e.target.value })}
                    placeholder="https://… , https://…"
                    className="w-full px-3 py-2 rounded-lg border border-border/60 bg-background"
                  />
                </Field>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.is_published}
                    onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
                  />
                  Publish (visible to travelers)
                </label>
              </div>
              <button className="w-full mt-4 py-2.5 rounded-lg bg-gradient-to-r from-[var(--gold)] to-[var(--maasai)] text-white font-semibold text-sm">
                {editing ? "Save changes" : "Create listing"}
              </button>
            </form>
          </div>
        )}
      </div>
    </Shell>
  );
}

function Stat({ label, value, accent }: { label: string; value: string | number; accent?: boolean }) {
  return (
    <div className="rounded-xl border border-border/60 p-4">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={`font-display text-2xl font-bold mt-1 ${accent ? "text-[var(--gold)]" : ""}`}>{value}</p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-muted-foreground mb-1 block">{label}</span>
      {children}
    </label>
  );
}
