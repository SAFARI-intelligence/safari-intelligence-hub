import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { formatMoney, statusTone } from "@/lib/pay";
import { ArrowUpRight, Plus, Lock, Sparkles } from "lucide-react";

export const Route = createFileRoute("/pay/")({
  component: Dashboard,
});

type Wallet = { trip_balance: number; flex_balance: number; currency: string };
type Booking = {
  id: string;
  total_amount: number;
  currency: string;
  status: string;
  created_at: string;
  trip: { title: string; start_date: string } | null;
};
type Tx = {
  id: string;
  amount: number;
  currency: string;
  type: string;
  provider: string;
  status: string;
  created_at: string;
};

function Dashboard() {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [tx, setTx] = useState<Tx[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [w, b, t] = await Promise.all([
        supabase.from("pay_wallets").select("trip_balance,flex_balance,currency").eq("user_id", user.id).maybeSingle(),
        supabase
          .from("pay_bookings")
          .select("id,total_amount,currency,status,created_at,trip:pay_trips(title,start_date)")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("pay_transactions")
          .select("id,amount,currency,type,provider,status,created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(6),
      ]);
      setWallet(w.data as any);
      setBookings((b.data as any) ?? []);
      setTx((t.data as any) ?? []);
      setLoading(false);
    })();
  }, [user]);

  if (loading) return <div className="text-sm text-stone-500">Loading your wallet…</div>;

  const trip = Number(wallet?.trip_balance ?? 0);
  const flex = Number(wallet?.flex_balance ?? 0);
  const currency = (wallet?.currency ?? "KES") as "KES" | "USD";

  return (
    <div className="space-y-8">
      <header className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <div className="text-[11px] uppercase tracking-[0.22em] text-stone-500">Karibu</div>
          <h1
            className="text-3xl mt-1"
            style={{ fontFamily: "'Cormorant Garamond', serif", color: "#1A3C2E", fontWeight: 600 }}
          >
            Your safari wallet
          </h1>
          <p className="text-sm text-stone-600 mt-1">
            Funds held safely until your adventure begins.
          </p>
        </div>
        <Link
          to="/pay/trips"
          className="text-[13px] font-medium px-4 py-2.5 rounded-lg flex items-center gap-1.5 transition hover:opacity-90"
          style={{ background: "#1A3C2E", color: "#F7F4EF" }}
        >
          Plan a trip <ArrowUpRight className="h-4 w-4" />
        </Link>
      </header>

      {/* Wallet hero */}
      <div className="grid md:grid-cols-2 gap-4">
        <WalletCard
          label="Trip Balance"
          sub="Locked for confirmed trips"
          icon={<Lock className="h-4 w-4" />}
          amount={trip}
          currency={currency}
          tone="dark"
        />
        <WalletCard
          label="Flex Balance"
          sub="Spendable on add-ons & extras"
          icon={<Sparkles className="h-4 w-4" />}
          amount={flex}
          currency={currency}
          tone="light"
          action={
            <Link
              to="/pay/wallet"
              className="text-[12px] font-medium inline-flex items-center gap-1 px-3 py-1.5 rounded-md border"
              style={{ borderColor: "rgba(26,60,46,0.2)", color: "#1A3C2E" }}
            >
              <Plus className="h-3.5 w-3.5" /> Top up
            </Link>
          }
        />
      </div>

      {/* Bookings */}
      <section>
        <SectionHeader title="Active bookings" linkTo="/pay/bookings" linkLabel="View all" />
        {bookings.length === 0 ? (
          <EmptyState
            title="No trips booked yet"
            sub="Explore Kenya — your next adventure awaits."
            cta={{ to: "/pay/trips", label: "Browse trips" }}
          />
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {bookings.map((b) => (
              <div
                key={b.id}
                className="rounded-xl border bg-white p-4"
                style={{ borderColor: "rgba(26,60,46,0.12)" }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div
                      className="font-semibold text-[15px]"
                      style={{ fontFamily: "'Cormorant Garamond', serif", color: "#1A3C2E" }}
                    >
                      {b.trip?.title ?? "Trip"}
                    </div>
                    <div className="text-[11.5px] text-stone-500 mt-0.5">
                      {b.trip?.start_date ? new Date(b.trip.start_date).toLocaleDateString() : ""}
                    </div>
                  </div>
                  <span
                    className={`text-[10.5px] uppercase tracking-wider px-2 py-0.5 rounded border font-medium ${statusTone(b.status)}`}
                  >
                    {b.status}
                  </span>
                </div>
                <div
                  className="mt-3 text-[15px] font-semibold"
                  style={{ color: "#1A3C2E", fontVariantNumeric: "tabular-nums" }}
                >
                  {formatMoney(Number(b.total_amount), b.currency as "KES" | "USD")}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Transactions */}
      <section>
        <SectionHeader title="Recent transactions" linkTo="/pay/wallet" linkLabel="Full history" />
        {tx.length === 0 ? (
          <EmptyState title="No transactions yet" sub="Top up or book a trip to get started." />
        ) : (
          <div
            className="rounded-xl border bg-white overflow-hidden"
            style={{ borderColor: "rgba(26,60,46,0.12)" }}
          >
            <table className="w-full text-[13px]">
              <thead className="text-left text-[11px] uppercase tracking-wider text-stone-500 bg-stone-50/60">
                <tr>
                  <th className="px-4 py-2.5 font-medium">Date</th>
                  <th className="px-4 py-2.5 font-medium">Type</th>
                  <th className="px-4 py-2.5 font-medium">Provider</th>
                  <th className="px-4 py-2.5 font-medium text-right">Amount</th>
                  <th className="px-4 py-2.5 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {tx.map((t) => (
                  <tr key={t.id} className="border-t" style={{ borderColor: "rgba(26,60,46,0.08)" }}>
                    <td className="px-4 py-2.5 text-stone-600">
                      {new Date(t.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2.5 capitalize">{t.type.replace("_", " ")}</td>
                    <td className="px-4 py-2.5 uppercase text-[11px] tracking-wider text-stone-500">
                      {t.provider}
                    </td>
                    <td
                      className="px-4 py-2.5 text-right font-semibold"
                      style={{ fontVariantNumeric: "tabular-nums" }}
                    >
                      {formatMoney(Number(t.amount), t.currency as "KES" | "USD")}
                    </td>
                    <td className="px-4 py-2.5">
                      <span
                        className={`text-[10.5px] uppercase tracking-wider px-2 py-0.5 rounded border ${statusTone(t.status)}`}
                      >
                        {t.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function WalletCard({
  label,
  sub,
  icon,
  amount,
  currency,
  tone,
  action,
}: {
  label: string;
  sub: string;
  icon: React.ReactNode;
  amount: number;
  currency: "KES" | "USD";
  tone: "dark" | "light";
  action?: React.ReactNode;
}) {
  const isDark = tone === "dark";
  return (
    <div
      className="rounded-2xl p-5 border relative overflow-hidden"
      style={{
        background: isDark ? "#111714" : "#fff",
        color: isDark ? "#F7F4EF" : "#111714",
        borderColor: isDark ? "rgba(201,146,42,0.25)" : "rgba(26,60,46,0.12)",
      }}
    >
      {isDark && (
        <div
          aria-hidden
          className="absolute -right-12 -top-12 h-44 w-44 rounded-full opacity-30 blur-3xl"
          style={{ background: "#C9922A" }}
        />
      )}
      <div className="flex items-center justify-between relative">
        <div className="flex items-center gap-2 text-[11.5px] uppercase tracking-[0.18em] opacity-80">
          {icon} {label}
        </div>
        {action}
      </div>
      <div
        className="mt-5 text-[34px] leading-none font-semibold relative"
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          color: isDark ? "#C9922A" : "#1A3C2E",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {formatMoney(amount, currency)}
      </div>
      <div className="mt-2 text-[12px] opacity-70 relative">{sub}</div>
    </div>
  );
}

function SectionHeader({
  title,
  linkTo,
  linkLabel,
}: {
  title: string;
  linkTo?: string;
  linkLabel?: string;
}) {
  return (
    <div className="flex items-end justify-between mb-3">
      <h2
        className="text-xl"
        style={{ fontFamily: "'Cormorant Garamond', serif", color: "#1A3C2E", fontWeight: 600 }}
      >
        {title}
      </h2>
      {linkTo && (
        <Link to={linkTo} className="text-[12px] text-stone-600 hover:text-[#1A3C2E] underline-offset-4 hover:underline">
          {linkLabel}
        </Link>
      )}
    </div>
  );
}

function EmptyState({
  title,
  sub,
  cta,
}: {
  title: string;
  sub: string;
  cta?: { to: string; label: string };
}) {
  return (
    <div
      className="rounded-xl border border-dashed p-8 text-center"
      style={{ borderColor: "rgba(26,60,46,0.2)", background: "rgba(255,255,255,0.5)" }}
    >
      <div className="font-semibold text-[#1A3C2E]">{title}</div>
      <div className="text-sm text-stone-600 mt-1">{sub}</div>
      {cta && (
        <Link
          to={cta.to}
          className="inline-block mt-4 text-[13px] font-medium px-4 py-2 rounded-lg"
          style={{ background: "#1A3C2E", color: "#F7F4EF" }}
        >
          {cta.label}
        </Link>
      )}
    </div>
  );
}
