import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { formatMoney, statusTone } from "@/lib/pay";
import { toast } from "sonner";

export const Route = createFileRoute("/pay/bookings")({
  component: BookingsPage,
});

type Booking = {
  id: string;
  total_amount: number;
  currency: string;
  status: string;
  guests: number;
  created_at: string;
  trip: { title: string; start_date: string; end_date: string; image: string | null } | null;
  escrow: { status: string }[] | null;
};

function BookingsPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("pay_bookings")
      .select(
        "id,total_amount,currency,status,guests,created_at,trip:pay_trips(title,start_date,end_date,image),escrow:pay_escrows(status)"
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setBookings((data as any) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [user]);

  const cancel = async (b: Booking) => {
    if (!confirm("Cancel this booking and refund?")) return;
    // Mark booking cancelled, escrow refunded, refund tx
    const { data: w } = await supabase.from("pay_wallets").select("*").eq("user_id", user!.id).maybeSingle();
    if (!w) return;

    await supabase.from("pay_bookings").update({ status: "cancelled" }).eq("id", b.id);
    await supabase.from("pay_escrows").update({ status: "refunded", released_at: new Date().toISOString() }).eq("booking_id", b.id);
    await supabase
      .from("pay_wallets")
      .update({
        trip_balance: Number(w.trip_balance) - Number(b.total_amount),
        flex_balance: Number(w.flex_balance) + Number(b.total_amount),
      })
      .eq("id", w.id);
    await supabase.from("pay_transactions").insert({
      wallet_id: w.id,
      user_id: user!.id,
      booking_id: b.id,
      amount: b.total_amount,
      currency: b.currency,
      type: "refund",
      provider: "wallet",
      provider_ref: `refund_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      status: "success",
    });
    toast.success("Booking cancelled — refunded to Flex Wallet");
    load();
  };

  if (loading) return <div className="text-sm text-stone-500">Loading…</div>;

  return (
    <div className="space-y-6">
      <header>
        <h1
          className="text-3xl"
          style={{ fontFamily: "'Cormorant Garamond', serif", color: "#1A3C2E", fontWeight: 600 }}
        >
          Bookings
        </h1>
        <p className="text-sm text-stone-600 mt-1">All your trips and their escrow status.</p>
      </header>

      {bookings.length === 0 ? (
        <div
          className="rounded-xl border border-dashed p-10 text-center"
          style={{ borderColor: "rgba(26,60,46,0.2)" }}
        >
          <div className="font-semibold text-[#1A3C2E]">No trips booked yet</div>
          <div className="text-sm text-stone-600 mt-1">Explore Kenya — your next adventure awaits.</div>
          <Link
            to="/pay/trips"
            className="inline-block mt-4 text-[13px] font-medium px-4 py-2 rounded-lg"
            style={{ background: "#1A3C2E", color: "#F7F4EF" }}
          >
            Browse trips
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => {
            const escrowStatus = b.escrow?.[0]?.status;
            return (
              <div
                key={b.id}
                className="rounded-2xl border bg-white overflow-hidden flex"
                style={{ borderColor: "rgba(26,60,46,0.12)" }}
              >
                <div
                  className="w-28 sm:w-40 bg-stone-200 bg-cover bg-center shrink-0"
                  style={{ backgroundImage: b.trip?.image ? `url(${b.trip.image})` : undefined }}
                />
                <div className="p-4 flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3
                        className="text-[17px] font-semibold truncate"
                        style={{ fontFamily: "'Cormorant Garamond', serif", color: "#1A3C2E" }}
                      >
                        {b.trip?.title ?? "Trip"}
                      </h3>
                      <div className="text-[11.5px] text-stone-500 mt-0.5">
                        {b.trip?.start_date && new Date(b.trip.start_date).toLocaleDateString()} –{" "}
                        {b.trip?.end_date && new Date(b.trip.end_date).toLocaleDateString()} · {b.guests} guest
                        {b.guests > 1 ? "s" : ""}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`text-[10.5px] uppercase tracking-wider px-2 py-0.5 rounded border font-medium ${statusTone(b.status)}`}>
                        {b.status}
                      </span>
                      {escrowStatus && (
                        <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded border ${statusTone(escrowStatus)}`}>
                          escrow · {escrowStatus}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 flex items-end justify-between">
                    <div
                      className="text-[18px] font-semibold"
                      style={{ color: "#1A3C2E", fontFamily: "'Cormorant Garamond', serif", fontVariantNumeric: "tabular-nums" }}
                    >
                      {formatMoney(Number(b.total_amount), b.currency as any)}
                    </div>
                    {b.status === "confirmed" && (
                      <button
                        onClick={() => cancel(b)}
                        className="text-[12px] font-medium px-3 py-1.5 rounded-md border hover:bg-rose-50 hover:border-rose-200 hover:text-rose-700 transition"
                        style={{ borderColor: "rgba(26,60,46,0.18)", color: "#1A3C2E" }}
                      >
                        Cancel & refund
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
