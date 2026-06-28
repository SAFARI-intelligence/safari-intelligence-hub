import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ShieldAlert, Send } from "lucide-react";
import { reports, zones, wildlifeMonth, type ZoneStatus } from "@/lib/operator-data";
import { toast } from "sonner";

export const Route = createFileRoute("/operator/wildlife")({
  head: () => ({ meta: [{ title: "Wildlife Intel — SAFARI OS Operator" }] }),
  component: WildlifePage,
});

const zoneFill: Record<ZoneStatus, string> = {
  active: "rgba(45,90,39,0.55)",
  amber: "rgba(201,168,76,0.6)",
  grey: "rgba(138,127,110,0.3)",
  restricted: "rgba(139,26,26,0.55)",
};

function WildlifePage() {
  const [filter, setFilter] = useState<"all" | "published" | "pending" | "restricted">("all");
  const visible = reports.filter((r) => (filter === "all" ? true : r.status === filter));

  return (
    <div
      style={{
        maxWidth: 1240,
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      <header>
        <h1 className="op-h1">Wildlife intelligence</h1>
        <p className="op-sub">
          Submit ranger field reports. Operators with regular reports rank higher in AI itineraries.
        </p>
      </header>

      <div className="op-alert op-alert-warn" style={{ alignItems: "flex-start" }}>
        <ShieldAlert size={16} strokeWidth={1.6} style={{ flexShrink: 0, marginTop: 1 }} />
        <div>
          <strong>Data governance</strong> — All reports enter a 2-hour safety review before guest
          publication. Reports tagged
          <em> Incident / Restricted</em> are never published to guests and are auto-routed to KWS.
          Exact GPS is never exposed — guests see zone labels only.
        </div>
      </div>

      <div className="op-grid-wildlife">
        {/* Map */}
        <section className="op-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 className="op-h2">Active zone map · Maasai Mara</h2>
            <div style={{ display: "flex", gap: 10, fontSize: 10, color: "var(--op-muted)" }}>
              <Legend swatch={zoneFill.active} label="Active" />
              <Legend swatch={zoneFill.amber} label="Older" />
              <Legend swatch={zoneFill.restricted} label="Restricted" />
              <Legend swatch={zoneFill.grey} label="No data" />
            </div>
          </div>

          <svg viewBox="0 0 400 220" style={{ width: "100%", height: "auto", marginTop: 12 }}>
            <defs>
              <pattern
                id="restrictedHatch"
                patternUnits="userSpaceOnUse"
                width="6"
                height="6"
                patternTransform="rotate(45)"
              >
                <line x1="0" y1="0" x2="0" y2="6" stroke="rgba(139,26,26,0.9)" strokeWidth="1" />
              </pattern>
            </defs>
            <rect x="0" y="0" width="400" height="220" fill="#f5f1ea" rx="8" />
            {/* Zones as soft polygons */}
            <polygon
              points="20,40 130,30 140,90 30,100"
              fill={zoneFill[zones[0].status]}
              stroke="#fff"
              strokeWidth="1"
            />
            <text x="60" y="68" fontSize="10" fill="#1A1209">
              Zone A
            </text>
            <polygon
              points="140,90 240,80 260,140 150,150"
              fill={zoneFill[zones[1].status]}
              stroke="#fff"
              strokeWidth="1"
            />
            <text x="180" y="118" fontSize="10" fill="#1A1209">
              Zone B
            </text>
            <polygon
              points="260,140 370,130 380,200 270,210"
              fill={zoneFill[zones[2].status]}
              stroke="#fff"
              strokeWidth="1"
            />
            <text x="305" y="170" fontSize="10" fill="#1A1209">
              Zone C
            </text>
            <polygon
              points="30,100 140,90 150,150 40,170"
              fill={zoneFill[zones[3].status]}
              stroke="#fff"
              strokeWidth="1"
            />
            <text x="70" y="135" fontSize="10" fill="#1A1209">
              Zone D
            </text>
            <polygon
              points="150,150 260,140 270,210 160,210"
              fill={zoneFill[zones[4].status]}
              stroke="#fff"
              strokeWidth="1"
            />
            <text x="195" y="180" fontSize="10" fill="#1A1209">
              Zone E
            </text>
            <polygon
              points="240,80 370,70 370,130 260,140"
              fill={zoneFill[zones[5].status]}
              stroke="#fff"
              strokeWidth="1"
            />
            <polygon points="240,80 370,70 370,130 260,140" fill="url(#restrictedHatch)" />
            <text x="295" y="105" fontSize="10" fill="#fff">
              Zone F · Restricted
            </text>
          </svg>
        </section>

        <ReportForm />
      </div>

      <section className="op-card">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          <h2 className="op-h2">Zone reports</h2>
          <div style={{ display: "flex", gap: 6 }}>
            {(["all", "published", "pending", "restricted"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`op-btn ${filter === f ? "op-btn-primary" : "op-btn-secondary"}`}
                style={{ textTransform: "capitalize" }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        <ul
          style={{
            listStyle: "none",
            padding: 0,
            margin: "12px 0 0",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          {visible.map((r) => {
            const dot =
              r.status === "restricted"
                ? "var(--op-red)"
                : r.status === "pending"
                  ? "var(--op-gold)"
                  : "var(--op-green)";
            return (
              <li
                key={r.id}
                style={{
                  padding: 12,
                  borderRadius: 6,
                  border: "0.5px solid var(--op-border)",
                  background: r.status === "restricted" ? "rgba(139,26,26,0.03)" : "#fff",
                  display: "flex",
                  gap: 10,
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 999,
                    background: dot,
                    marginTop: 6,
                    flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      display: "flex",
                      gap: 8,
                      flexWrap: "wrap",
                      alignItems: "center",
                    }}
                  >
                    {r.zoneLabel} · {r.title}
                    {r.status === "restricted" && (
                      <span className="op-pill op-pill-internal">Internal only</span>
                    )}
                    {r.status === "pending" && (
                      <span className="op-pill op-pill-review">Pending review</span>
                    )}
                    {r.status === "published" && (
                      <span className="op-pill op-pill-published">Published</span>
                    )}
                  </div>
                  <div className="op-sub" style={{ marginTop: 2 }}>
                    {r.description}
                  </div>
                  <div style={{ fontSize: 10, color: "var(--op-muted)", marginTop: 4 }}>
                    {r.timestamp} · {r.ranger}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="op-card">
        <h2 className="op-h2">Wildlife contribution score</h2>
        <p className="op-sub" style={{ marginTop: 4 }}>
          Your team submitted{" "}
          <strong style={{ color: "var(--op-night)" }}>{wildlifeMonth.submitted}</strong> reports
          this month. Operators in the top 25% of contributors receive +15 AI recommendation weight.
        </p>
        <div
          style={{ marginTop: 10, height: 6, background: "var(--op-border)", borderRadius: 999 }}
        >
          <div
            style={{
              width: `${Math.min(100, (wildlifeMonth.submitted / wildlifeMonth.topQuartileThreshold) * 100)}%`,
              height: "100%",
              background: "var(--op-green)",
              borderRadius: 999,
            }}
          />
        </div>
        <div className="op-sub" style={{ marginTop: 6, fontSize: 10 }}>
          {wildlifeMonth.submitted} / {wildlifeMonth.topQuartileThreshold} reports · top quartile
          threshold
        </div>
      </section>

      <style>{`
        .op-grid-wildlife { display: grid; gap: 16px; grid-template-columns: 1.4fr 1fr; }
        @media (max-width: 1023px) { .op-grid-wildlife { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}

function Legend({ swatch, label }: { swatch: string; label: string }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
      <span style={{ width: 10, height: 10, background: swatch, borderRadius: 2 }} />
      {label}
    </span>
  );
}

function ReportForm() {
  const [zone, setZone] = useState("Zone B — Mara River");
  const [event, setEvent] = useState("");
  const [behaviour, setBehaviour] = useState("Migrating");
  const [count, setCount] = useState("");
  const [direction, setDirection] = useState("N");
  const [confidence, setConfidence] = useState("High");
  const [notes, setNotes] = useState("");

  const isRestricted = zone.includes("Incident");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isRestricted) {
      toast.error("Report flagged as restricted. Routing to KWS. Not published to guests.");
    } else {
      toast.success("Report received. Publishing after 2-hour safety review.");
    }
    setEvent("");
    setCount("");
    setNotes("");
  };

  return (
    <section className="op-card">
      <h2 className="op-h2">Submit ranger report</h2>
      <p className="op-sub" style={{ marginTop: 2 }}>
        Pre-filled with your account. Auto-timestamped.
      </p>
      <form
        onSubmit={submit}
        style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 10 }}
      >
        <div>
          <label className="op-field-label">Zone</label>
          <select className="op-select" value={zone} onChange={(e) => setZone(e.target.value)}>
            {zones.map((z) => (
              <option key={z.id}>{z.label}</option>
            ))}
            <option>Incident / Restricted</option>
          </select>
        </div>
        <div>
          <label className="op-field-label">Animal / event type</label>
          <input
            className="op-input"
            placeholder="lion, elephant, crossing event…"
            value={event}
            onChange={(e) => setEvent(e.target.value)}
            list="op-events"
            required
          />
          <datalist id="op-events">
            {[
              "lion",
              "elephant",
              "wildebeest",
              "cheetah",
              "leopard",
              "rhino",
              "buffalo",
              "crossing event",
              "calving",
              "poaching alert",
              "vehicle incident",
              "route closure",
            ].map((x) => (
              <option key={x} value={x} />
            ))}
          </datalist>
        </div>
        <div style={{ display: "grid", gap: 10, gridTemplateColumns: "1fr 1fr" }}>
          <div>
            <label className="op-field-label">Behaviour</label>
            <select
              className="op-select"
              value={behaviour}
              onChange={(e) => setBehaviour(e.target.value)}
            >
              {[
                "Feeding",
                "Resting",
                "Hunting",
                "Migrating",
                "With cubs/calves",
                "Alert/aggressive",
                "Crossing",
                "Unknown",
              ].map((b) => (
                <option key={b}>{b}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="op-field-label">Approx. count</label>
            <input
              className="op-input"
              type="number"
              min={0}
              value={count}
              onChange={(e) => setCount(e.target.value.replace(/\D/g, ""))}
            />
          </div>
          <div>
            <label className="op-field-label">Direction</label>
            <select
              className="op-select"
              value={direction}
              onChange={(e) => setDirection(e.target.value)}
            >
              {["N", "NE", "E", "SE", "S", "SW", "W", "NW", "Stationary"].map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="op-field-label">Confidence</label>
            <select
              className="op-select"
              value={confidence}
              onChange={(e) => setConfidence(e.target.value)}
            >
              {["High", "Medium", "Low"].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="op-field-label">Notes ({notes.length}/300)</label>
          <textarea
            className="op-textarea"
            rows={2}
            maxLength={300}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
        <button type="submit" className="op-btn op-btn-primary" style={{ alignSelf: "flex-start" }}>
          <Send size={13} /> Submit report
        </button>
      </form>
    </section>
  );
}
