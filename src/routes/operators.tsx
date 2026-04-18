import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Plus, Inbox, TrendingUp, Edit3 } from "lucide-react";
import { Shell } from "@/components/safari/Shell";
import { listings, leads, revenueByMonth, images } from "@/lib/safari-data";

export const Route = createFileRoute("/operators")({
  head: () => ({
    meta: [
      { title: "Operator Command Center — Safari OS" },
      {
        name: "description",
        content:
          "Tour operator dashboard. Manage listings, respond to leads, track revenue across East Africa.",
      },
      { property: "og:title", content: "Operator Command Center" },
      {
        property: "og:description",
        content: "Listings, leads, and revenue analytics for East African safari operators.",
      },
      { property: "og:image", content: images.giraffe },
    ],
  }),
  component: OperatorsPage,
});

const statusColor = {
  active: "bg-[var(--forest)]/15 text-[var(--forest)]",
  paused: "bg-[var(--gold)]/15 text-[var(--gold)]",
  draft: "bg-foreground/10 text-muted-foreground",
};

const leadColor = {
  new: "bg-[var(--maasai)]/15 text-[var(--maasai)]",
  responded: "bg-[var(--gold)]/15 text-[var(--gold)]",
  booked: "bg-[var(--forest)]/15 text-[var(--forest)]",
};

function OperatorsPage() {
  const totalRev = listings.reduce((s, l) => s + l.revenue, 0);
  const totalBookings = listings.reduce((s, l) => s + l.bookings, 0);
  const newLeads = leads.filter((l) => l.status === "new").length;

  return (
    <Shell>
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <span className="text-xs uppercase tracking-[0.18em] text-[var(--maasai)] font-semibold">
              Waongoza · Operator console
            </span>
            <h1 className="font-display text-4xl sm:text-5xl font-bold mt-2">Command Center</h1>
            <p className="text-muted-foreground mt-2">
              Mara Sunrise Tours · Nairobi — verified partner since 2024
            </p>
          </div>
          <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--gold)] text-[var(--gold-foreground)] font-semibold text-sm hover:scale-[1.02] transition shadow-[var(--shadow-glow-gold)]">
            <Plus className="h-4 w-4" /> New listing
          </button>
        </header>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Revenue (6mo)", value: `KSh ${(totalRev / 1000).toFixed(0)}K`, color: "var(--gold)" },
            { label: "Bookings", value: totalBookings, color: "var(--maasai)" },
            { label: "New leads", value: newLeads, color: "var(--forest)" },
            { label: "Conversion", value: "38%", color: "var(--charcoal)" },
          ].map((k) => (
            <div key={k.label} className="glass rounded-2xl p-5">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">
                {k.label}
              </div>
              <div
                className="mt-2 font-display text-3xl font-bold"
                style={{ color: k.color }}
              >
                {k.value}
              </div>
            </div>
          ))}
        </div>

        {/* Revenue chart */}
        <section className="glass rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-[var(--forest)]" />
            <h2 className="font-display text-xl font-bold">Revenue trajectory</h2>
            <span className="ml-auto text-xs text-muted-foreground">Last 6 months · KSh</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueByMonth} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.68 0.13 75)" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="oklch(0.68 0.13 75)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.85 0.03 70 / 0.5)" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="currentColor" />
                <YAxis
                  tick={{ fontSize: 11 }}
                  stroke="currentColor"
                  tickFormatter={(v: number) => `${v / 1000}K`}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                  formatter={(v) => [`KSh ${Number(v).toLocaleString()}`, "Revenue"]}
                />
                <Area
                  type="monotone"
                  dataKey="ksh"
                  stroke="oklch(0.68 0.13 75)"
                  strokeWidth={2.5}
                  fill="url(#rev)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <div className="grid lg:grid-cols-[1.6fr_1fr] gap-6">
          {/* Listings */}
          <section className="glass rounded-2xl p-5">
            <h2 className="font-display text-xl font-bold mb-4">Your listings</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground border-b border-border/60">
                    <th className="pb-2 font-medium">Listing</th>
                    <th className="pb-2 font-medium">Status</th>
                    <th className="pb-2 font-medium text-right">Bookings</th>
                    <th className="pb-2 font-medium text-right">Revenue</th>
                    <th className="pb-2"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {listings.map((l, i) => (
                    <motion.tr
                      key={l.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <td className="py-3">
                        <div className="font-semibold">{l.name}</div>
                        <div className="text-[11px] text-muted-foreground">
                          {l.id} · {l.type}
                        </div>
                      </td>
                      <td>
                        <span
                          className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${statusColor[l.status]}`}
                        >
                          {l.status}
                        </span>
                      </td>
                      <td className="text-right tabular-nums">{l.bookings}</td>
                      <td className="text-right tabular-nums font-semibold">
                        KSh {l.revenue.toLocaleString()}
                      </td>
                      <td className="text-right">
                        <button className="grid h-7 w-7 place-items-center rounded-md hover:bg-foreground/10 ml-auto">
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Leads */}
          <section className="glass rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Inbox className="h-5 w-5 text-[var(--maasai)]" />
              <h2 className="font-display text-xl font-bold">Leads inbox</h2>
              <span className="ml-auto text-[11px] px-2 py-0.5 rounded-full bg-[var(--maasai)] text-white font-bold">
                {newLeads} new
              </span>
            </div>
            <ul className="space-y-2">
              {leads.map((l) => (
                <li
                  key={l.id}
                  className="p-3 rounded-xl bg-background/50 border border-border/60 hover:border-[var(--gold)]/40 transition cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-semibold text-sm">{l.name}</div>
                      <div className="text-[11px] text-muted-foreground">
                        {l.country} · {l.interest}
                      </div>
                    </div>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${leadColor[l.status as keyof typeof leadColor]}`}
                    >
                      {l.status}
                    </span>
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-1.5">
                    Travel date: {l.date}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </Shell>
  );
}
