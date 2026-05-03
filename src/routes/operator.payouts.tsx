import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { payouts, formatKsh, operator } from "@/lib/operator-data";

export const Route = createFileRoute("/operator/payouts")({
  head: () => ({ meta: [{ title: "Payouts — SAFARI OS Operator" }] }),
  component: PayoutsPage,
});

function PayoutsPage() {
  const [open, setOpen] = useState(false);
  const totalPaid = payouts.filter((p) => p.status === "Paid").reduce((s, p) => s + p.net, 0);
  const next = payouts.find((p) => p.status === "Scheduled");

  return (
    <div style={{ maxWidth: 1240, margin: "0 auto", display: "flex", flexDirection: "column", gap: 16 }}>
      <header>
        <h1 className="op-h1">Payouts</h1>
        <p className="op-sub">Transparent payouts, 3 business days after guest check-out.</p>
      </header>

      <div className="op-grid-payout-summary">
        <div className="op-card op-card-tight">
          <div className="op-label">Total paid out to date</div>
          <div className="op-kpi-value" style={{ marginTop: 6 }}>{formatKsh(totalPaid)}</div>
        </div>
        <div className="op-card op-card-tight">
          <div className="op-label">Next scheduled payout</div>
          <div className="op-kpi-value" style={{ marginTop: 6 }}>{next ? formatKsh(next.net) : "—"}</div>
          <div className="op-sub" style={{ marginTop: 2 }}>{next?.date ?? "—"}</div>
        </div>
        <div className="op-card op-card-tight">
          <div className="op-label">Payment method</div>
          <div style={{ marginTop: 6, fontSize: 14, fontWeight: 500 }}>M-Pesa · {operator.mpesaMasked}</div>
          <span className="op-link" style={{ marginTop: 4, display: "inline-block" }}>Update payout method →</span>
        </div>
      </div>

      <section className="op-card" style={{ overflowX: "auto" }}>
        <h2 className="op-h2" style={{ marginBottom: 10 }}>Payout schedule</h2>
        <table className="op-table">
          <thead>
            <tr>
              <th>Booking</th><th>Guest</th><th>Check-out</th>
              <th style={{ textAlign: "right" }}>Gross</th>
              <th style={{ textAlign: "right" }}>Safari 12%</th>
              <th style={{ textAlign: "right" }}>Net payout</th>
              <th>Payout date</th><th>Status</th>
            </tr>
          </thead>
          <tbody>
            {payouts.map((p) => (
              <tr key={p.id}>
                <td style={{ fontWeight: 500 }}>{p.id}</td>
                <td>{p.guest}</td>
                <td>{p.checkOut}</td>
                <td style={{ textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{formatKsh(p.gross)}</td>
                <td style={{ textAlign: "right", color: "var(--op-muted)", fontVariantNumeric: "tabular-nums" }}>{formatKsh(p.commission)}</td>
                <td style={{ textAlign: "right", fontWeight: 500, fontVariantNumeric: "tabular-nums" }}>{formatKsh(p.net)}</td>
                <td>{p.date}</td>
                <td>
                  <span className={`op-pill ${
                    p.status === "Paid" ? "op-pill-confirmed"
                    : p.status === "Scheduled" ? "op-pill-published"
                    : "op-pill-pending"
                  }`}>{p.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="op-card">
        <button onClick={() => setOpen(!open)}
          style={{ background: "none", border: "none", padding: 0, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, color: "var(--op-night)", fontSize: 13, fontWeight: 500 }}>
          {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          How Safari commission works
        </button>
        {open && (
          <div style={{ marginTop: 12, fontSize: 12, color: "var(--op-night)", lineHeight: 1.7 }}>
            <p>Gross booking value <strong>(KSh X)</strong> is what the guest pays at booking time.</p>
            <p>Safari platform commission <strong>(12%)</strong> is deducted: <code style={{ background: "#f5f1ea", padding: "1px 4px", borderRadius: 3 }}>Math.floor(X × 0.12)</code> — always rounded down in your favour.</p>
            <p>Net to operator: <strong>X − commission</strong>, paid out <strong>3 business days after guest check-out</strong> via your chosen payout method.</p>
            <p style={{ color: "var(--op-muted)" }}>Note: 0% commission applies until your first booking is completed — commission-only model. No platform charges if no bookings.</p>
          </div>
        )}
      </section>

      <style>{`
        .op-grid-payout-summary { display: grid; gap: 12px; grid-template-columns: repeat(3, 1fr); }
        @media (max-width: 767px) { .op-grid-payout-summary { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}
