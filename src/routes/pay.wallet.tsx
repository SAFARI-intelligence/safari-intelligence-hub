import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { formatMoney, mockCharge, statusTone } from "@/lib/pay";
import { toast } from "sonner";
import { ArrowRightLeft, Plus } from "lucide-react";

export const Route = createFileRoute("/pay/wallet")({
  component: WalletPage,
});

type Wallet = {
  id: string;
  trip_balance: number;
  flex_balance: number;
  currency: string;
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

function WalletPage() {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [tx, setTx] = useState<Tx[]>([]);
  const [filterType, setFilterType] = useState<string>("all");
  const [topupOpen, setTopupOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);

  const load = async () => {
    if (!user) return;
    const [w, t] = await Promise.all([
      supabase.from("pay_wallets").select("*").eq("user_id", user.id).maybeSingle(),
      supabase
        .from("pay_transactions")
        .select("id,amount,currency,type,provider,status,created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50),
    ]);
    setWallet(w.data as any);
    setTx((t.data as any) ?? []);
  };

  useEffect(() => {
    load();
  }, [user]);

  const filtered = filterType === "all" ? tx : tx.filter((t) => t.type === filterType);

  return (
    <div className="space-y-7">
      <header>
        <h1
          className="text-3xl"
          style={{ fontFamily: "'Cormorant Garamond', serif", color: "#1A3C2E", fontWeight: 600 }}
        >
          Wallet
        </h1>
        <p className="text-sm text-stone-600 mt-1">Manage your trip and flex balances.</p>
      </header>

      <div className="grid md:grid-cols-2 gap-4">
        <Balance
          label="Trip Balance"
          amount={Number(wallet?.trip_balance ?? 0)}
          currency={(wallet?.currency ?? "KES") as any}
          locked
        />
        <Balance
          label="Flex Balance"
          amount={Number(wallet?.flex_balance ?? 0)}
          currency={(wallet?.currency ?? "KES") as any}
          actions={
            <div className="flex gap-2">
              <button
                onClick={() => setTopupOpen(true)}
                className="text-[12px] font-medium px-3 py-1.5 rounded-md flex items-center gap-1"
                style={{ background: "#1A3C2E", color: "#F7F4EF" }}
              >
                <Plus className="h-3.5 w-3.5" /> Top up
              </button>
              <button
                onClick={() => setTransferOpen(true)}
                className="text-[12px] font-medium px-3 py-1.5 rounded-md border flex items-center gap-1"
                style={{ borderColor: "rgba(26,60,46,0.2)", color: "#1A3C2E" }}
              >
                <ArrowRightLeft className="h-3.5 w-3.5" /> Transfer
              </button>
            </div>
          }
        />
      </div>

      <section>
        <div className="flex items-end justify-between mb-3 flex-wrap gap-2">
          <h2
            className="text-xl"
            style={{ fontFamily: "'Cormorant Garamond', serif", color: "#1A3C2E", fontWeight: 600 }}
          >
            Transaction history
          </h2>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="text-[12px] border rounded-md px-2.5 py-1.5 bg-white"
            style={{ borderColor: "rgba(26,60,46,0.2)" }}
          >
            <option value="all">All types</option>
            <option value="payment">Payment</option>
            <option value="topup">Top-up</option>
            <option value="transfer">Transfer</option>
            <option value="add_on">Add-on</option>
            <option value="refund">Refund</option>
          </select>
        </div>

        {filtered.length === 0 ? (
          <div
            className="rounded-xl border border-dashed p-8 text-center text-sm text-stone-600"
            style={{ borderColor: "rgba(26,60,46,0.2)" }}
          >
            No transactions match this filter.
          </div>
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
                {filtered.map((t) => (
                  <tr
                    key={t.id}
                    className="border-t"
                    style={{ borderColor: "rgba(26,60,46,0.08)" }}
                  >
                    <td className="px-4 py-2.5 text-stone-600">
                      {new Date(t.created_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-2.5 capitalize">{t.type.replace("_", " ")}</td>
                    <td className="px-4 py-2.5 uppercase text-[11px] tracking-wider text-stone-500">
                      {t.provider}
                    </td>
                    <td
                      className="px-4 py-2.5 text-right font-semibold"
                      style={{ fontVariantNumeric: "tabular-nums" }}
                    >
                      {formatMoney(Number(t.amount), t.currency as any)}
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

      {topupOpen && wallet && (
        <TopUpDialog
          wallet={wallet}
          onClose={() => setTopupOpen(false)}
          onDone={() => {
            setTopupOpen(false);
            load();
          }}
        />
      )}
      {transferOpen && wallet && (
        <TransferDialog
          wallet={wallet}
          onClose={() => setTransferOpen(false)}
          onDone={() => {
            setTransferOpen(false);
            load();
          }}
        />
      )}
    </div>
  );
}

function Balance({
  label,
  amount,
  currency,
  locked,
  actions,
}: {
  label: string;
  amount: number;
  currency: "KES" | "USD";
  locked?: boolean;
  actions?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl p-5 border bg-white" style={{ borderColor: "rgba(26,60,46,0.12)" }}>
      <div className="flex items-center justify-between">
        <div className="text-[11.5px] uppercase tracking-[0.18em] text-stone-500">
          {label} {locked && <span className="text-stone-400">· locked</span>}
        </div>
        {actions}
      </div>
      <div
        className="mt-4 text-[32px] leading-none font-semibold"
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          color: "#1A3C2E",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {formatMoney(amount, currency)}
      </div>
    </div>
  );
}

function Modal({
  children,
  onClose,
  title,
}: {
  children: React.ReactNode;
  onClose: () => void;
  title: string;
}) {
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center p-4"
      style={{ background: "rgba(17,23,20,0.55)" }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl w-full max-w-md p-6 border shadow-xl"
        style={{ borderColor: "rgba(26,60,46,0.12)" }}
      >
        <h3
          className="text-xl mb-4"
          style={{ fontFamily: "'Cormorant Garamond', serif", color: "#1A3C2E", fontWeight: 600 }}
        >
          {title}
        </h3>
        {children}
      </div>
    </div>
  );
}

function TopUpDialog({
  wallet,
  onClose,
  onDone,
}: {
  wallet: Wallet;
  onClose: () => void;
  onDone: () => void;
}) {
  const { user } = useAuth();
  const [amount, setAmount] = useState("5000");
  const [provider, setProvider] = useState<"stripe" | "mpesa">("mpesa");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!user) return;
    const amt = Number(amount);
    if (!(amt > 0)) return toast.error("Enter a valid amount");
    setBusy(true);
    const charge = await mockCharge({ provider, amount: amt, currency: wallet.currency as any });
    if (!charge.ok) {
      setBusy(false);
      return toast.error(charge.message);
    }
    const { error } = await supabase.from("pay_transactions").insert({
      wallet_id: wallet.id,
      user_id: user.id,
      amount: amt,
      currency: wallet.currency,
      type: "topup",
      provider,
      provider_ref: charge.ref,
      status: "success",
    });
    if (error) {
      setBusy(false);
      return toast.error(error.message);
    }
    await supabase
      .from("pay_wallets")
      .update({ flex_balance: Number(wallet.flex_balance) + amt })
      .eq("id", wallet.id);
    toast.success(`${formatMoney(amt, wallet.currency as any)} added to Flex`);
    setBusy(false);
    onDone();
  };

  return (
    <Modal title="Top up Flex Wallet" onClose={onClose}>
      <label className="block text-[12px] font-medium mb-1.5 text-stone-700">
        Amount ({wallet.currency})
      </label>
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="w-full px-3 py-2 rounded-md border text-[14px] mb-3"
        style={{ borderColor: "rgba(26,60,46,0.2)" }}
      />
      <label className="block text-[12px] font-medium mb-1.5 text-stone-700">Pay with</label>
      <div className="grid grid-cols-2 gap-2 mb-5">
        {(["mpesa", "stripe"] as const).map((p) => (
          <button
            key={p}
            onClick={() => setProvider(p)}
            className="px-3 py-2.5 rounded-lg border text-[13px] font-medium capitalize transition"
            style={{
              borderColor: provider === p ? "#1A3C2E" : "rgba(26,60,46,0.2)",
              background: provider === p ? "rgba(26,60,46,0.05)" : "white",
              color: "#1A3C2E",
            }}
          >
            {p === "mpesa" ? "M-Pesa" : "Card"}
          </button>
        ))}
      </div>
      <p className="text-[11px] text-stone-500 mb-4">
        Demo mode — payment is simulated. Real {provider === "mpesa" ? "M-Pesa STK" : "Stripe"} will
        plug in next phase.
      </p>
      <div className="flex gap-2">
        <button
          onClick={onClose}
          className="flex-1 px-4 py-2.5 rounded-lg border text-[13px] font-medium"
          style={{ borderColor: "rgba(26,60,46,0.2)" }}
        >
          Cancel
        </button>
        <button
          onClick={submit}
          disabled={busy}
          className="flex-1 px-4 py-2.5 rounded-lg text-[13px] font-medium disabled:opacity-60"
          style={{ background: "#1A3C2E", color: "#F7F4EF" }}
        >
          {busy ? "Processing…" : "Confirm"}
        </button>
      </div>
    </Modal>
  );
}

function TransferDialog({
  wallet,
  onClose,
  onDone,
}: {
  wallet: Wallet;
  onClose: () => void;
  onDone: () => void;
}) {
  const { user } = useAuth();
  const [amount, setAmount] = useState("1000");
  const [direction, setDirection] = useState<"flex_to_trip" | "trip_to_flex">("flex_to_trip");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!user) return;
    const amt = Number(amount);
    if (!(amt > 0)) return toast.error("Enter a valid amount");
    const flex = Number(wallet.flex_balance);
    const trip = Number(wallet.trip_balance);
    if (direction === "flex_to_trip" && amt > flex) return toast.error("Insufficient Flex balance");
    if (direction === "trip_to_flex" && amt > trip) return toast.error("Insufficient Trip balance");

    setBusy(true);
    const newFlex = direction === "flex_to_trip" ? flex - amt : flex + amt;
    const newTrip = direction === "flex_to_trip" ? trip + amt : trip - amt;

    const { error: txErr } = await supabase.from("pay_transactions").insert({
      wallet_id: wallet.id,
      user_id: user.id,
      amount: amt,
      currency: wallet.currency,
      type: "transfer",
      provider: "wallet",
      provider_ref: `transfer_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      status: "success",
      metadata: { direction },
    });
    if (txErr) {
      setBusy(false);
      return toast.error(txErr.message);
    }
    await supabase
      .from("pay_wallets")
      .update({ flex_balance: newFlex, trip_balance: newTrip })
      .eq("id", wallet.id);
    toast.success("Transfer complete");
    setBusy(false);
    onDone();
  };

  return (
    <Modal title="Transfer between balances" onClose={onClose}>
      <div className="grid grid-cols-2 gap-2 mb-4">
        {[
          { v: "flex_to_trip", label: "Flex → Trip" },
          { v: "trip_to_flex", label: "Trip → Flex" },
        ].map((o) => (
          <button
            key={o.v}
            onClick={() => setDirection(o.v as any)}
            className="px-3 py-2.5 rounded-lg border text-[12.5px] font-medium"
            style={{
              borderColor: direction === o.v ? "#1A3C2E" : "rgba(26,60,46,0.2)",
              background: direction === o.v ? "rgba(26,60,46,0.05)" : "white",
              color: "#1A3C2E",
            }}
          >
            {o.label}
          </button>
        ))}
      </div>
      <label className="block text-[12px] font-medium mb-1.5 text-stone-700">
        Amount ({wallet.currency})
      </label>
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="w-full px-3 py-2 rounded-md border text-[14px] mb-5"
        style={{ borderColor: "rgba(26,60,46,0.2)" }}
      />
      <div className="flex gap-2">
        <button
          onClick={onClose}
          className="flex-1 px-4 py-2.5 rounded-lg border text-[13px] font-medium"
          style={{ borderColor: "rgba(26,60,46,0.2)" }}
        >
          Cancel
        </button>
        <button
          onClick={submit}
          disabled={busy}
          className="flex-1 px-4 py-2.5 rounded-lg text-[13px] font-medium disabled:opacity-60"
          style={{ background: "#1A3C2E", color: "#F7F4EF" }}
        >
          {busy ? "Moving…" : "Transfer"}
        </button>
      </div>
    </Modal>
  );
}
