import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Bar, BarChart, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip,
} from "recharts";
import { ArrowUpRight, AlertCircle, X } from "lucide-react";
import {
  recentBookings, revenueChart, onboarding, reports, formatKsh,
  bookings, commissionOf,
} from "@/lib/operator-data";

export const Route = createFileRoute("/operator/")({
  head: () => ({ meta: [{ title: "Dashboard — SAFARI OS Operator" }] }),
  component: DashboardPage,
});

const statusPill = {
  confirmed: "op-pill op-pill-confirmed",
  pending: "op-pill op-pill-pending",
  arriving: "op-pill op-pill-arriving",
  cancelled: "op-pill op-pill-cancelled",
} as const;
const statusLabel = {
  confirmed: "Confirmed", pending: "Pending payment",
  arriving: "Arriving today", cancelled: "Cancelled",
} as const;

function DashboardPage() {
  const [alertOpen, setAlertOpen] = useState(true);

  const monthGmv = bookings
    .filter((b) => b.status !== "cancelled" && b.checkIn.startsWith("2026-05"))
    .reduce((s, b) => s + b.value, 0);
  const confirmed = bookings.filter((b) => b.status === "confirmed").length;
  const netCommission = bookings
    .filter((b) => b.status !== "cancelled")
    .reduce((s, b) => s + (b.value - commissionOf(b.value)), 0);
  const avgValue = Math.floor(
    bookings.filter((b) => b.status !== "cancelled").reduce((s, b) => s + b.value, 0) /
      bookings.filter((b) => b.status !== "cancelled").length
  );

  const kpis = [
    { label: "GMV this month", value: formatKsh(monthGmv), delta: "↑ 18% vs Apr", deltaClass: "op-delta-up" },
    { label: "Confirmed bookings", value: String(confirmed), delta: "↑ 4 this week", deltaClass: "op-delta-up" },
    { label: "Net to operator (88%)", value: formatKsh(netCommission), delta: "↑ 14% vs Apr", deltaClass: "op-delta-up" },
    { label: "Average booking value", value: formatKsh(avgValue), delta: "→ flat vs Apr", deltaClass: "op-delta-flat" },
  ];

  const completed = onboarding.filter((o) => o.done).length;
  const intelPreview = reports.slice(0, 3);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 1240, margin: "0 auto" }}>
      <header style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <h1 className="op-h1">Karibu, Wanjiru</h1>
          <p className="op-sub" style={{ marginTop: 2 }}>
            Sunday · 03 May 2026 · Sarova Mara Gate Camp
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Link to="/operator/listings" className="op-btn op-btn-secondary">Manage listings</Link>
          <Link to="/operator/wildlife" className="op-btn op-btn-primary">+ Submit ranger report</Link>
        </div>
      </header>

      {alertOpen && (
        <div className="op-alert op-alert-info">
          <AlertCircle size={16} strokeWidth={1.6} />
          <span>
            <strong>3 new Safari AI itineraries</strong> included your property this week. Add 5+ photos to your Family Tent listing to increase booking conversion by 3×.
          </span>
          <Link to="/operator/listings" className="op-link op-link-tail">Update listing →</Link>
          <button onClick={() => setAlertOpen(false)} className="op-btn op-btn-ghost" style={{ padding: 4 }} aria-label="Dismiss">
            <X size={14} />
          </button>
        </div>
      )}

      {/* KPI strip */}
      <div className="op-grid-kpi">
        {kpis.map((k) => (
          <div key={k.label} className="op-card op-card-tight">
            <div className="op-label">{k.label}</div>
            <div className="op-kpi-value" style={{ marginTop: 8 }}>{k.value}</div>
            <div className={k.deltaClass} style={{ marginTop: 4 }}>{k.delta}</div>
          </div>
        ))}
      </div>

      {/* 60/40 bookings + revenue */}
      <div className="op-grid-6040">
        <section className="op-card">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <h2 className="op-h2">Recent bookings</h2>
            <Link to="/operator/bookings" className="op-link">View all →</Link>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table className="op-table">
              <thead>
                <tr>
                  <th>Guest</th><th>Origin</th><th>Check-in</th>
                  <th style={{ textAlign: "right" }}>Nights</th>
                  <th style={{ textAlign: "right" }}>Value</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.map((b) => (
                  <tr key={b.id}>
                    <td style={{ fontWeight: 500 }}>{b.guest}</td>
                    <td style={{ color: "var(--op-muted)" }}>{b.origin}</td>
                    <td>{b.checkIn}</td>
                    <td style={{ textAlign: "right" }}>{b.nights}</td>
                    <td style={{ textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{formatKsh(b.value)}</td>
                    <td><span className={statusPill[b.status]}>{statusLabel[b.status]}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="op-card">
          <h2 className="op-h2">Revenue trajectory</h2>
          <div className="op-sub" style={{ marginTop: 2 }}>Past 4 mo · current · 2 projected</div>
          <div style={{ height: 200, marginTop: 12 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueChart} margin={{ top: 10, right: 0, left: -16, bottom: 0 }}>
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#8a7f6e" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#8a7f6e" }} axisLine={false} tickLine={false}
                  tickFormatter={(v: number) => `${Math.round(v / 1000)}K`} />
                <Tooltip
                  cursor={{ fill: "rgba(245,240,232,0.5)" }}
                  contentStyle={{ background: "#fff", border: "0.5px solid #ece7dc", borderRadius: 6, fontSize: 11 }}
                  formatter={(v: number) => [formatKsh(v), "Revenue"]}
                />
                <Bar dataKey="value" radius={[3, 3, 0, 0]}>
                  {revenueChart.map((d, i) => (
                    <Cell key={i} fill={
                      d.type === "current" ? "#2D5A27"
                      : d.type === "projected" ? "rgba(201,168,76,0.4)"
                      : "rgba(45,90,39,0.18)"
                    } />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 8 }}>
            <span style={{ fontSize: 18, fontWeight: 500 }}>{formatKsh(monthGmv)}</span>
            <span className="op-delta-up">↑ 32% vs Apr · May tracking</span>
          </div>
          <div className="op-sub" style={{ marginTop: 6, fontSize: 10 }}>
            Migration peak annotation on Jul · Calving on Feb (last yr)
          </div>
        </section>
      </div>

      {/* 50/50 onboarding + wildlife */}
      <div className="op-grid-5050">
        <section className="op-card">
          <h2 className="op-h2">Onboarding checklist</h2>
          <ul style={{ listStyle: "none", padding: 0, margin: "12px 0", display: "flex", flexDirection: "column", gap: 8 }}>
            {onboarding.map((o, i) => (
              <li key={i} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12 }}>
                <span style={{
                  width: 16, height: 16, borderRadius: 4,
                  border: o.done ? "none" : "0.5px solid var(--op-border)",
                  background: o.done ? "var(--op-green)" : "#fff",
                  color: "#fff", display: "grid", placeItems: "center", fontSize: 10,
                }}>{o.done && "✓"}</span>
                <span style={{
                  flex: 1,
                  textDecoration: o.done ? "line-through" : "none",
                  color: o.done ? "var(--op-muted)" : "var(--op-night)",
                }}>{o.label}</span>
                {!o.done && o.action && <span className="op-link">→ {o.action}</span>}
              </li>
            ))}
          </ul>
          <div style={{ height: 4, background: "var(--op-border)", borderRadius: 999, overflow: "hidden" }}>
            <div style={{
              width: `${(completed / onboarding.length) * 100}%`,
              height: "100%", background: "var(--op-green)",
            }} />
          </div>
          <div className="op-sub" style={{ marginTop: 6 }}>
            {completed} of {onboarding.length} complete — finish setup to unlock full AI recommendation weight
          </div>
        </section>

        <section className="op-card">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h2 className="op-h2">Wildlife intel — feed</h2>
            <Link to="/operator/wildlife" className="op-link">Full view →</Link>
          </div>
          <ul style={{ listStyle: "none", padding: 0, margin: "12px 0 0", display: "flex", flexDirection: "column", gap: 12 }}>
            {intelPreview.map((r) => {
              const dotColor = r.status === "restricted" ? "var(--op-red)"
                : r.status === "pending" ? "var(--op-gold)" : "var(--op-green)";
              return (
                <li key={r.id} style={{ display: "flex", gap: 10 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 999, background: dotColor, marginTop: 6, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>
                      {r.zoneLabel} · {r.title}
                      {r.status === "restricted" && <span className="op-pill op-pill-internal" style={{ marginLeft: 8 }}>Internal only</span>}
                    </div>
                    <div className="op-sub" style={{ marginTop: 2 }}>{r.description}</div>
                    <div style={{ fontSize: 10, color: "var(--op-muted)", marginTop: 4 }}>
                      {r.timestamp} · {r.ranger}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      </div>

      <style>{`
        .op-grid-kpi { display: grid; gap: 12px; grid-template-columns: repeat(4, 1fr); }
        .op-grid-6040 { display: grid; gap: 16px; grid-template-columns: 1.6fr 1fr; }
        .op-grid-5050 { display: grid; gap: 16px; grid-template-columns: 1fr 1fr; }
        @media (max-width: 1023px) {
          .op-grid-kpi { grid-template-columns: repeat(2, 1fr); }
          .op-grid-6040, .op-grid-5050 { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
