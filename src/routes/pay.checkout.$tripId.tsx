import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { checkout, convert, formatMoney, generateIdempotencyKey, getFxRate, mockCharge, type Currency } from "@/lib/pay";
import { toast } from "sonner";
import { ShieldCheck, CreditCard, Smartphone, Wallet, Lock } from "lucide-react";

export const Route = createFileRoute("/pay/checkout/$tripId")({
  component: CheckoutPage,
});

type Trip = {
  id: string;
  title: string;
  base_price: number;
  currency: string;
  start_date: string;
  end_date: string;
  image: string | null;
};

function CheckoutPage() {
  const { tripId } = Route.useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [wallet, setWallet] = useState<{ id: string; flex_balance: number; trip_balance: number; currency: string } | null>(null);
  const [guests, setGuests] = useState(1);
  const [provider, setProvider] = useState<"mpesa" | "stripe" | "wallet">("mpesa");
  const [displayCurrency, setDisplayCurrency] = useState<Currency>("KES");
  const [fx, setFx] = useState(1);
  const [busy, setBusy] = useState(false);
  const [idemKey, setIdemKey] = useState(() => generateIdempotencyKey());

  useEffect(() => {
    (async () => {
      const [t, w] = await Promise.all([
        supabase.from("pay_trips").select("*").eq("id", tripId).maybeSingle(),
        user ? supabase.from("pay_wallets").select("id,flex_balance,trip_balance,currency").eq("user_id", user.id).maybeSingle() : Promise.resolve({ data: null }),
      ]);
      setTrip(t.data as any);
      setWallet(w.data as any);
      if (t.data) setDisplayCurrency(t.data.currency as Currency);
    })();
  }, [tripId, user]);

  useEffect(() => {
    if (!trip) return;
    getFxRate(trip.currency as Currency, displayCurrency).then(setFx);
  }, [trip, displayCurrency]);

  const totalBase = useMemo(() => Number(trip?.base_price ?? 0) * guests, [trip, guests]);
  const totalDisplay = convert(totalBase, fx);

  const submit = async () => {
    if (!user || !trip || !wallet) return;
    setBusy(true);

    try {
      // 1. Charge the gateway (mocked) to obtain a provider_ref. Wallet skips this.
      let providerRef = `wallet_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      if (provider !== "wallet") {
        const charge = await mockCharge({ provider, amount: totalBase, currency: trip.currency as Currency });
        if (!charge.ok) {
          setBusy(false);
          return toast.error("Payment declined");
        }
        providerRef = charge.ref;
      }

      // 2. Atomic checkout RPC — booking + tx + wallet + escrow + capacity, all-or-nothing.
      //    Safe to retry under the same idempotency key.
      await checkout({
        tripId: trip.id,
        guests,
        provider,
        idempotencyKey: idemKey,
        providerRef,
        displayCurrency,
        displayAmount: totalDisplay,
      });

      toast.success("Booking confirmed — funds safely escrowed.");
      setIdemKey(generateIdempotencyKey());
      navigate({ to: "/pay/bookings" });
    } catch (e: any) {
      toast.error(e?.message ?? "Checkout failed");
    } finally {
      setBusy(false);
    }
  };


  if (!trip) return <div className="text-sm text-stone-500">Loading trip…</div>;

  return (
    <div className="space-y-6">
      <header>
        <h1
          className="text-3xl"
          style={{ fontFamily: "'Cormorant Garamond', serif", color: "#1A3C2E", fontWeight: 600 }}
        >
          Checkout
        </h1>
        <p className="text-sm text-stone-600 mt-1">
          Your funds are safely held until your adventure begins.
        </p>
      </header>

      <div className="grid lg:grid-cols-[1fr_360px] gap-6">
        <div className="space-y-5">
          {/* Trip summary */}
          <div
            className="rounded-2xl border bg-white overflow-hidden"
            style={{ borderColor: "rgba(26,60,46,0.12)" }}
          >
            <div className="flex">
              <div
                className="w-32 sm:w-44 bg-stone-200 bg-cover bg-center shrink-0"
                style={{ backgroundImage: trip.image ? `url(${trip.image})` : undefined }}
              />
              <div className="p-4 min-w-0">
                <h3
                  className="text-[18px] font-semibold"
                  style={{ fontFamily: "'Cormorant Garamond', serif", color: "#1A3C2E" }}
                >
                  {trip.title}
                </h3>
                <div className="text-[11.5px] text-stone-500 mt-1">
                  {new Date(trip.start_date).toLocaleDateString()} – {new Date(trip.end_date).toLocaleDateString()}
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <label className="text-[12px] text-stone-600">Guests</label>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={guests}
                    onChange={(e) => setGuests(Math.max(1, Number(e.target.value)))}
                    className="w-16 px-2 py-1 border rounded-md text-[13px]"
                    style={{ borderColor: "rgba(26,60,46,0.2)" }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Payment method */}
          <div
            className="rounded-2xl border bg-white p-5"
            style={{ borderColor: "rgba(26,60,46,0.12)" }}
          >
            <h3
              className="text-[15px] font-semibold mb-3"
              style={{ color: "#1A3C2E" }}
            >
              Payment method
            </h3>
            <div className="grid sm:grid-cols-3 gap-2">
              <PayOption icon={<Smartphone className="h-4 w-4" />} label="M-Pesa" sub="STK push" active={provider === "mpesa"} onClick={() => setProvider("mpesa")} />
              <PayOption icon={<CreditCard className="h-4 w-4" />} label="Card" sub="Stripe" active={provider === "stripe"} onClick={() => setProvider("stripe")} />
              <PayOption icon={<Wallet className="h-4 w-4" />} label="Flex Wallet" sub={wallet ? formatMoney(Number(wallet.flex_balance), wallet.currency as Currency) : "—"} active={provider === "wallet"} onClick={() => setProvider("wallet")} />
            </div>

            {provider === "mpesa" && (
              <div className="mt-4">
                <label className="block text-[12px] font-medium mb-1.5 text-stone-700">M-Pesa number</label>
                <input
                  defaultValue="+254 700 000 000"
                  className="w-full px-3 py-2 rounded-md border text-[14px]"
                  style={{ borderColor: "rgba(26,60,46,0.2)" }}
                />
                <p className="text-[11px] text-stone-500 mt-2">
                  Demo mode — STK push is simulated.
                </p>
              </div>
            )}
            {provider === "stripe" && (
              <div className="mt-4 p-3 rounded-md bg-stone-50 border text-[12px] text-stone-600" style={{ borderColor: "rgba(26,60,46,0.1)" }}>
                Card capture handled by Stripe in production. Demo will simulate a successful charge.
              </div>
            )}
          </div>
        </div>

        {/* Order summary */}
        <aside
          className="rounded-2xl border bg-white p-5 h-fit lg:sticky lg:top-24"
          style={{ borderColor: "rgba(26,60,46,0.12)" }}
        >
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-[14px] font-semibold" style={{ color: "#1A3C2E" }}>Order summary</h3>
            <select
              value={displayCurrency}
              onChange={(e) => setDisplayCurrency(e.target.value as Currency)}
              className="text-[11px] border rounded px-2 py-1 bg-white"
              style={{ borderColor: "rgba(26,60,46,0.2)" }}
            >
              <option value="KES">KES</option>
              <option value="USD">USD</option>
            </select>
          </div>

          <dl className="space-y-2 text-[13px] mt-3">
            <Row label={`Base × ${guests}`} value={formatMoney(totalBase, trip.currency as Currency)} muted />
            {displayCurrency !== trip.currency && (
              <Row
                label={`FX (1 ${trip.currency} = ${fx.toFixed(4)} ${displayCurrency})`}
                value={formatMoney(totalDisplay, displayCurrency)}
                muted
              />
            )}
          </dl>

          <div
            className="mt-4 pt-4 border-t flex items-end justify-between"
            style={{ borderColor: "rgba(26,60,46,0.12)" }}
          >
            <span className="text-[12px] uppercase tracking-wider text-stone-500">Total</span>
            <span
              className="text-[22px] font-semibold"
              style={{ color: "#1A3C2E", fontFamily: "'Cormorant Garamond', serif", fontVariantNumeric: "tabular-nums" }}
            >
              {formatMoney(totalDisplay, displayCurrency)}
            </span>
          </div>

          <div
            className="mt-4 p-3 rounded-lg flex gap-2 text-[11.5px] leading-relaxed"
            style={{ background: "rgba(26,60,46,0.05)", color: "#1A3C2E" }}
          >
            <Lock className="h-3.5 w-3.5 mt-0.5 shrink-0" />
            Funds are escrowed and only released to the operator in stages around your trip.
          </div>

          <button
            onClick={submit}
            disabled={busy}
            className="mt-4 w-full px-4 py-3 rounded-lg text-[14px] font-semibold disabled:opacity-60 transition flex items-center justify-center gap-2"
            style={{ background: "#1A3C2E", color: "#F7F4EF" }}
          >
            <ShieldCheck className="h-4 w-4" />
            {busy ? "Processing…" : "Confirm & Pay"}
          </button>
        </aside>
      </div>
    </div>
  );
}

function PayOption({ icon, label, sub, active, onClick }: { icon: React.ReactNode; label: string; sub: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="text-left p-3 rounded-lg border transition"
      style={{
        borderColor: active ? "#1A3C2E" : "rgba(26,60,46,0.18)",
        background: active ? "rgba(26,60,46,0.05)" : "white",
      }}
    >
      <div className="flex items-center gap-1.5 text-[13px] font-medium" style={{ color: "#1A3C2E" }}>
        {icon}
        {label}
      </div>
      <div className="text-[11px] text-stone-500 mt-0.5 truncate">{sub}</div>
    </button>
  );
}

function Row({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex justify-between items-baseline">
      <dt className={muted ? "text-stone-500" : ""}>{label}</dt>
      <dd className="font-medium" style={{ fontVariantNumeric: "tabular-nums" }}>{value}</dd>
    </div>
  );
}
