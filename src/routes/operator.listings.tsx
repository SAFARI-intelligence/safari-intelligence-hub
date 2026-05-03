import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, Lock, Camera, Edit3, ExternalLink } from "lucide-react";
import { listings, computeListingScore, formatKsh, operator } from "@/lib/operator-data";

export const Route = createFileRoute("/operator/listings")({
  head: () => ({ meta: [{ title: "Listings — SAFARI OS Operator" }] }),
  component: ListingsPage,
});

function scoreClass(n: number) {
  if (n >= 80) return "op-score-good";
  if (n >= 60) return "op-score-warn";
  return "op-score-bad";
}
function statusLabel(score: number, max: number) {
  if (score >= max * 0.9) return "Complete";
  if (score >= max * 0.5) return "Needs attention";
  return "Missing";
}

function ListingsPage() {
  const primary = listings[0];
  const score = computeListingScore(primary);
  const dimensions = [
    { label: "Photos", value: score.photos, max: 25 },
    { label: "Description completeness", value: score.description, max: 20 },
    { label: "Pricing & availability current", value: score.pricing, max: 20 },
    { label: "Instant booking enabled", value: score.instantBooking, max: 15 },
    { label: "Ranger reports submitted", value: score.rangerReports, max: 20 },
  ];

  return (
    <div style={{ maxWidth: 1240, margin: "0 auto", display: "flex", flexDirection: "column", gap: 16 }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 12, flexWrap: "wrap" }}>
        <div>
          <h1 className="op-h1">My listings</h1>
          <p className="op-sub">Optimise each listing for AI recommendation weight. Score ≥ 80 = 3× more itinerary inclusions.</p>
        </div>
        <Link to="/operator/listings/new" className="op-btn op-btn-primary"><Plus size={13} /> Add listing</Link>
      </header>

      <section className="op-card">
        <div style={{ display: "flex", alignItems: "flex-start", gap: 24, flexWrap: "wrap" }}>
          <div style={{ minWidth: 180 }}>
            <div className="op-label">Primary listing health</div>
            <div className="op-h2" style={{ marginTop: 4 }}>{primary.name}</div>
            <div className={`op-score ${scoreClass(score.total)}`} style={{ marginTop: 14 }}>
              {score.total}<span style={{ fontSize: 14, color: "var(--op-muted)" }}> / 100</span>
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 260 }}>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
              {dimensions.map((d) => (
                <li key={d.label} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, alignItems: "center" }}>
                  <span style={{ flex: 1 }}>{d.label}</span>
                  <span style={{ width: 80, height: 4, background: "var(--op-border)", borderRadius: 999, overflow: "hidden", marginRight: 12 }}>
                    <span style={{
                      display: "block", height: "100%",
                      width: `${(d.value / d.max) * 100}%`,
                      background: d.value >= d.max * 0.9 ? "var(--op-green)" : d.value === 0 ? "var(--op-red)" : "var(--op-gold)",
                    }} />
                  </span>
                  <span style={{ fontVariantNumeric: "tabular-nums", color: "var(--op-muted)", width: 50, textAlign: "right" }}>{d.value}/{d.max}</span>
                  <span style={{ width: 110, textAlign: "right", fontSize: 11, color: "var(--op-muted)" }}>{statusLabel(d.value, d.max)}</span>
                </li>
              ))}
            </ul>
            <div className="op-sub" style={{ marginTop: 12, fontStyle: "italic" }}>
              Your listing score affects AI recommendation weight. Operators with score ≥ 80 receive 3× more itinerary inclusions.
            </div>
          </div>
        </div>
      </section>

      <div className="op-grid-listings">
        {listings.map((l) => {
          const s = computeListingScore(l);
          return (
            <article key={l.id} className="op-card" style={{ padding: 0, overflow: "hidden" }}>
              <div style={{
                aspectRatio: "16/9", background: "linear-gradient(135deg, #d8c9a3, #b89968)",
                display: "grid", placeItems: "center", color: "rgba(255,255,255,0.7)",
              }}>
                <Camera size={28} strokeWidth={1.4} />
              </div>
              <div style={{ padding: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{l.name}</div>
                    <div className="op-sub">{l.location} · {l.type}</div>
                  </div>
                  <span className={`op-pill ${s.total >= 80 ? "op-pill-confirmed" : s.total >= 60 ? "op-pill-pending" : "op-pill-arriving"}`}>
                    {s.total}/100
                  </span>
                </div>
                <div style={{ marginTop: 10, fontSize: 12, color: "var(--op-night)" }}>
                  <strong>{formatKsh(l.pricePerNight)}</strong>{" "}
                  <span style={{ color: "var(--op-muted)" }}>{l.pricePerNightLabel}</span>
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                  <Link to="/operator/listings/$id/edit" params={{ id: l.id }} className="op-btn op-btn-secondary" style={{ flex: 1, justifyContent: "center" }}>
                    <Edit3 size={12} /> Edit
                  </Link>
                  <button className="op-btn op-btn-ghost"><ExternalLink size={12} /> View on Safari</button>
                </div>
              </div>
            </article>
          );
        })}

        {operator.plan === "Basic" && (
          <article className="op-card" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: 24, border: "0.5px dashed var(--op-border)" }}>
            <Lock size={20} strokeWidth={1.5} style={{ color: "var(--op-muted)" }} />
            <div className="op-h2" style={{ marginTop: 8 }}>Add another listing</div>
            <p className="op-sub" style={{ marginTop: 4, maxWidth: 220 }}>
              Operator Pro unlocks unlimited listings and analytics.
            </p>
            <button className="op-btn op-btn-primary" style={{ marginTop: 12 }}>Upgrade to Pro</button>
          </article>
        )}
      </div>

      <style>{`
        .op-grid-listings { display: grid; gap: 16px; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); }
      `}</style>
    </div>
  );
}
