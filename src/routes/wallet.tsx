import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Shell } from "@/components/safari/Shell";
import { Lock, Plus, Info, Coins } from "lucide-react";

export const Route = createFileRoute("/wallet")({
  head: () => ({
    meta: [
      { title: "Mfuko Wangu — My Wallet · SAFARI" },
      { name: "description", content: "Manage your travel funds — Trip Wallet & Flex Wallet." },
    ],
  }),
  component: WalletPage,
});

type Tx = {
  id: string;
  date: string;
  description: string;
  type: "PAYMENT" | "REFUND" | "ADD-ON" | "PAYOUT";
  provider: "M-Pesa" | "Stripe";
  amount: number; // negative = debit
  status: "SUCCESS" | "PENDING" | "FAILED";
};

const mockTx: Tx[] = [
  { id: "TX-1A2B", date: "2026-05-04", description: "Maasai Mara Classic — Booking", type: "PAYMENT", provider: "M-Pesa", amount: -179000, status: "SUCCESS" },
  { id: "TX-1A2C", date: "2026-05-03", description: "Hot-air balloon add-on", type: "ADD-ON", provider: "Stripe", amount: -28500, status: "SUCCESS" },
  { id: "TX-1A2D", date: "2026-04-28", description: "Top-up — Flex Wallet", type: "PAYMENT", provider: "M-Pesa", amount: -15000, status: "PENDING" },
  { id: "TX-1A2E", date: "2026-04-19", description: "Cancellation refund — Diani", type: "REFUND", provider: "Stripe", amount: 42000, status: "SUCCESS" },
  { id: "TX-1A2F", date: "2026-04-10", description: "Sundowner upgrade", type: "ADD-ON", provider: "M-Pesa", amount: -7500, status: "FAILED" },
];

const typeBadge: Record<Tx["type"], string> = {
  PAYMENT: "bg-foreground/10 text-foreground",
  REFUND: "bg-[#1D9E75]/15 text-[#1D9E75]",
  "ADD-ON": "bg-[#C9922A]/20 text-[#8a6310]",
  PAYOUT: "bg-blue-500/15 text-blue-700",
};

const providerBadge: Record<Tx["provider"], string> = {
  "M-Pesa": "bg-[#1D9E75]/15 text-[#1D9E75]",
  Stripe: "bg-blue-500/15 text-blue-700",
};

const statusBadge: Record<Tx["status"], string> = {
  SUCCESS: "bg-[#1D9E75]/15 text-[#1D9E75]",
  PENDING: "bg-[#C9922A]/20 text-[#8a6310]",
  FAILED: "bg-[#8B2500]/15 text-[#8B2500]",
};

function WalletPage() {
  const [typeFilter, setTypeFilter] = useState<"all" | Tx["type"]>("all");
  const [provFilter, setProvFilter] = useState<"all" | Tx["provider"]>("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [points, setPoints] = useState(0);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem("simba_points") : null;
    setPoints(stored ? parseInt(stored, 10) || 0 : 6420);
  }, []);

  const filtered = mockTx.filter((t) => {
    if (typeFilter !== "all" && t.type !== typeFilter) return false;
    if (provFilter !== "all" && t.provider !== provFilter) return false;
    if (from && t.date < from) return false;
    if (to && t.date > to) return false;
    return true;
  });

  return (
    <Shell>
      <div className="mx-auto max-w-7xl space-y-8">
        <header>
          <span className="text-xs uppercase tracking-[0.18em] font-semibold" style={{ color: "#C9922A" }}>
            Mfuko Wangu
          </span>
          <h1 className="font-display text-4xl sm:text-5xl font-bold mt-2">My Wallet</h1>
          <p className="text-muted-foreground mt-2">Manage your travel funds</p>
        </header>

        {/* Balance cards */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Trip Wallet */}
          <div className="relative rounded-3xl p-6 sm:p-7 text-white overflow-hidden" style={{ background: "linear-gradient(135deg, #1A3C2E, #0E261C)" }}>
            <div className="flex items-start justify-between">
              <div>
                <div className="text-[10px] uppercase tracking-[0.18em] opacity-80">Trip Wallet</div>
                <div className="font-display text-4xl sm:text-5xl font-bold mt-2">
                  KSh 179,000
                </div>
                <div className="text-xs opacity-80 mt-2">
                  Held for: Maasai Mara Classic · Jun 12–15
                </div>
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold" style={{ background: "#C9922A", color: "#0D0D0D" }}>
                <Lock className="h-3 w-3" /> LOCKED
              </span>
            </div>
            <div className="mt-5 flex items-center gap-1.5 text-xs opacity-80 group cursor-help relative">
              <Info className="h-3.5 w-3.5" />
              <span>Released to your operator 48 hours after trip completion.</span>
            </div>
          </div>

          {/* Flex Wallet */}
          <div className="relative rounded-3xl p-6 sm:p-7 overflow-hidden border border-border/60 bg-background">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Flex Wallet</div>
                <div className="font-display text-4xl sm:text-5xl font-bold mt-2">
                  KSh 12,500
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  Available for add-ons and extras
                </div>
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#1D9E75]/15 text-[#1D9E75]">
                AVAILABLE
              </span>
            </div>
            <button className="mt-5 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-semibold text-sm" style={{ background: "#1A3C2E", color: "#C9922A" }}>
              <Plus className="h-4 w-4" /> Top Up
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="rounded-2xl border border-border/60 p-3 sm:p-4 flex flex-wrap items-center gap-3 bg-background">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)}
            className="px-3 py-2 rounded-lg border border-border/60 bg-background text-sm"
          >
            <option value="all">All Types</option>
            <option value="PAYMENT">Payment</option>
            <option value="REFUND">Refund</option>
            <option value="ADD-ON">Add-On</option>
            <option value="PAYOUT">Payout</option>
          </select>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="px-3 py-2 rounded-lg border border-border/60 bg-background text-sm" />
          <span className="text-muted-foreground text-xs">to</span>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="px-3 py-2 rounded-lg border border-border/60 bg-background text-sm" />
          <div className="flex p-1 rounded-lg bg-foreground/5 ml-auto">
            {(["all", "M-Pesa", "Stripe"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setProvFilter(p)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                  provFilter === p ? "bg-background shadow-sm" : "text-muted-foreground"
                }`}
              >
                {p === "all" ? "All" : p}
              </button>
            ))}
          </div>
        </div>

        {/* Transactions */}
        <div className="rounded-2xl border border-border/60 overflow-hidden bg-background">
          {filtered.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-muted-foreground text-sm">
                No transactions yet — <Link to="/book" className="underline">book your first safari</Link> to get started.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-foreground/5">
                  <tr className="text-left text-[10px] uppercase tracking-wider text-muted-foreground">
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Description</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Provider</th>
                    <th className="px-4 py-3 text-right">Amount</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((t) => (
                    <tr key={t.id} className="border-t border-border/60 hover:bg-foreground/[0.02]">
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{t.date}</td>
                      <td className="px-4 py-3 font-medium">{t.description}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${typeBadge[t.type]}`}>
                          {t.type}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${providerBadge[t.provider]}`}>
                          {t.provider}
                        </span>
                      </td>
                      <td className={`px-4 py-3 text-right font-mono font-semibold ${t.amount < 0 ? "text-foreground" : "text-[#1D9E75]"}`}>
                        {t.amount < 0 ? "−" : "+"}KSh {Math.abs(t.amount).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${statusBadge[t.status]}`}>
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Shell>
  );
}
