import { createFileRoute } from "@tanstack/react-router";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from "recharts";
import { Lock } from "lucide-react";
import { funnel, sourceMix, seasonalForecast, operator } from "@/lib/operator-data";

export const Route = createFileRoute("/operator/analytics")({
  head: () => ({ meta: [{ title: "Analytics — SAFARI OS Operator" }] }),
  component: AnalyticsPage,
});

function AnalyticsPage() {
  if (operator.plan !== "Pro") return <BasicGate />;

  return (
    <div style={{ maxWidth: 1240, margin: "0 auto", display: "flex", flexDirection: "column", gap: 16 }}>
      <header>
        <h1 className="op-h1">Analytics</h1>
        <p className="op-sub">Where bookings come from. Where demand is heading. Operator Pro.</p>
      </header>

      <section className="op-card">
        <h2 className="op-h2">Booking funnel</h2>
        <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
          {funnel.map((f, i) => {
            const max = funnel[0].count;
            const conv = i > 0 ? Math.round((f.count / funnel[i - 1].count) * 100) : null;
            return (
              <div key={f.step}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                  <span>{f.step}</span>
                  <span style={{ fontVariantNumeric: "tabular-nums" }}>
                    <strong>{f.count.toLocaleString()}</strong>
                    {conv !== null && <span className="op-sub" style={{ marginLeft: 8 }}>{conv}% conversion</span>}
                  </span>
                </div>
                <div style={{ height: 18, background: "var(--op-border)", borderRadius: 4 }}>
                  <div style={{
                    width: `${(f.count / max) * 100}%`, height: "100%",
                    background: i === funnel.length - 1 ? "var(--op-green)" : "rgba(45,90,39,0.45)",
                    borderRadius: 4,
                  }} />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <div className="op-grid-analytics">
        <section className="op-card">
          <h2 className="op-h2">Source breakdown</h2>
          <div style={{ height: 220, marginTop: 12 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sourceMix} layout="vertical" margin={{ left: 30, right: 10 }}>
                <XAxis type="number" tick={{ fontSize: 10, fill: "#8a7f6e" }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="country" tick={{ fontSize: 11, fill: "#1A1209" }} axisLine={false} tickLine={false} width={140} />
                <Tooltip contentStyle={{ fontSize: 11, border: "0.5px solid #ece7dc", borderRadius: 6 }} />
                <Bar dataKey="count" fill="#C9A84C" radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="op-card">
          <h2 className="op-h2">Seasonal demand · 12mo forecast</h2>
          <div style={{ height: 220, marginTop: 12 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={seasonalForecast} margin={{ left: -10, right: 10 }}>
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#8a7f6e" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#8a7f6e" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: 11, border: "0.5px solid #ece7dc", borderRadius: 6 }}
                  formatter={(v, _n, p) => [`${v} demand index`, ((p as { payload?: { peak?: string } }).payload?.peak) ?? "Standard"]} />
                <Bar dataKey="demand" radius={[3, 3, 0, 0]}>
                  {seasonalForecast.map((s, i) => (
                    <Cell key={i} fill={s.peak ? "#2D5A27" : "rgba(45,90,39,0.35)"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="op-sub" style={{ marginTop: 6, fontSize: 10 }}>
            Peak periods: Great Migration Jul–Oct · Calving Jan–Feb
          </div>
        </section>
      </div>

      <section className="op-card">
        <h2 className="op-h2">Competitive position</h2>
        <p className="op-sub" style={{ marginTop: 2 }}>Anonymised — vs. similar tented camps in Maasai Mara</p>
        <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(3, 1fr)", marginTop: 12 }}>
          <CompCard label="Listing score" you="92" peers="74" />
          <CompCard label="Bookings (90d)" you="64" peers="41" />
          <CompCard label="Avg booking value" you="KSh 168K" peers="KSh 142K" />
        </div>
      </section>

      <style>{`
        .op-grid-analytics { display: grid; gap: 16px; grid-template-columns: 1fr 1fr; }
        @media (max-width: 1023px) { .op-grid-analytics { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}

function CompCard({ label, you, peers }: { label: string; you: string; peers: string }) {
  return (
    <div style={{ borderLeft: "2px solid var(--op-green)", paddingLeft: 10 }}>
      <div className="op-label">{label}</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginTop: 6 }}>
        <span style={{ fontSize: 18, fontWeight: 500 }}>{you}</span>
        <span className="op-sub">vs. peers {peers}</span>
      </div>
    </div>
  );
}

function BasicGate() {
  return (
    <div style={{ maxWidth: 720, margin: "0 auto", textAlign: "center", padding: "60px 20px" }}>
      <Lock size={28} strokeWidth={1.4} style={{ color: "var(--op-muted)" }} />
      <h1 className="op-h1" style={{ marginTop: 12 }}>Detailed analytics — Operator Pro</h1>
      <p className="op-sub" style={{ marginTop: 8, maxWidth: 480, marginInline: "auto" }}>
        See exactly where your bookings come from, how your listing performs vs. competitors, and a 12-month demand forecast aligned with the Great Migration calendar.
      </p>
      <button className="op-btn op-btn-primary" style={{ marginTop: 16 }}>Upgrade to Pro — KSh 8,000/mo</button>
    </div>
  );
}
