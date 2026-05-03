import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Download, Search } from "lucide-react";
import {
  bookings as allBookings, formatKsh, commissionOf, netOf, type OpBooking, type BookingStatus,
} from "@/lib/operator-data";

export const Route = createFileRoute("/operator/bookings")({
  head: () => ({ meta: [{ title: "Bookings — SAFARI OS Operator" }] }),
  component: BookingsPage,
});

const statusPill = {
  confirmed: "op-pill op-pill-confirmed",
  pending: "op-pill op-pill-pending",
  arriving: "op-pill op-pill-arriving",
  cancelled: "op-pill op-pill-cancelled",
};
const statusLabel: Record<BookingStatus, string> = {
  confirmed: "Confirmed", pending: "Pending payment",
  arriving: "Arriving today", cancelled: "Cancelled",
};

function BookingsPage() {
  const [statusFilter, setStatusFilter] = useState<"all" | BookingStatus>("all");
  const [origin, setOrigin] = useState("all");
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<OpBooking | null>(null);

  const origins = useMemo(() => Array.from(new Set(allBookings.map((b) => b.origin))).sort(), []);
  const filtered = allBookings.filter((b) => {
    if (statusFilter !== "all" && b.status !== statusFilter) return false;
    if (origin !== "all" && b.origin !== origin) return false;
    if (q && !b.guest.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  const totalGmv = filtered.reduce((s, b) => s + (b.status === "cancelled" ? 0 : b.value), 0);
  const totalCommission = filtered.reduce((s, b) => s + (b.status === "cancelled" ? 0 : commissionOf(b.value)), 0);
  const totalNet = totalGmv - totalCommission;

  return (
    <div style={{ maxWidth: 1240, margin: "0 auto", display: "flex", flexDirection: "column", gap: 16 }}>
      <header>
        <h1 className="op-h1">Bookings</h1>
        <p className="op-sub">View, filter and export every booking sent to your property by SAFARI AI.</p>
      </header>

      <div className="op-card op-card-tight" style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <select className="op-select" style={{ width: 160 }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as never)}>
          <option value="all">Status · All</option>
          <option value="confirmed">Confirmed</option>
          <option value="pending">Pending payment</option>
          <option value="arriving">Arriving today</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select className="op-select" style={{ width: 200 }} value={origin} onChange={(e) => setOrigin(e.target.value)}>
          <option value="all">Origin · All countries</option>
          {origins.map((o) => <option key={o}>{o}</option>)}
        </select>
        <div style={{ position: "relative", flex: 1, minWidth: 180 }}>
          <Search size={13} style={{ position: "absolute", left: 10, top: 10, color: "var(--op-muted)" }} />
          <input className="op-input" style={{ paddingLeft: 28 }} placeholder="Search guest name…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <button className="op-btn op-btn-secondary"><Download size={13} /> Export CSV</button>
      </div>

      <div className="op-card" style={{ overflowX: "auto" }}>
        <table className="op-table">
          <thead>
            <tr>
              <th>Guest</th><th>Origin</th><th>Check-in</th><th>Check-out</th>
              <th style={{ textAlign: "right" }}>Nights</th>
              <th style={{ textAlign: "right" }}>Gross (KSh)</th>
              <th style={{ textAlign: "right" }}>Safari 12%</th>
              <th style={{ textAlign: "right" }}>Net</th>
              <th>Status</th><th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((b) => (
              <tr key={b.id} style={{ cursor: "pointer" }} onClick={() => setSelected(b)}>
                <td style={{ fontWeight: 500 }}>{b.guest}</td>
                <td style={{ color: "var(--op-muted)" }}>{b.origin}</td>
                <td>{b.checkIn}</td>
                <td>{b.checkOut}</td>
                <td style={{ textAlign: "right" }}>{b.nights}</td>
                <td style={{ textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{formatKsh(b.value)}</td>
                <td style={{ textAlign: "right", color: "var(--op-muted)", fontVariantNumeric: "tabular-nums" }}>{formatKsh(commissionOf(b.value))}</td>
                <td style={{ textAlign: "right", fontWeight: 500, fontVariantNumeric: "tabular-nums" }}>{formatKsh(netOf(b.value))}</td>
                <td><span className={statusPill[b.status]}>{statusLabel[b.status]}</span></td>
                <td><span className="op-link">View</span></td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ borderTop: "0.5px solid var(--op-border)" }}>
              <td colSpan={5} style={{ paddingTop: 12, color: "var(--op-muted)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                {filtered.length} bookings · summary
              </td>
              <td style={{ textAlign: "right", paddingTop: 12, fontWeight: 500, fontVariantNumeric: "tabular-nums" }}>{formatKsh(totalGmv)}</td>
              <td style={{ textAlign: "right", paddingTop: 12, color: "var(--op-muted)", fontVariantNumeric: "tabular-nums" }}>{formatKsh(totalCommission)}</td>
              <td style={{ textAlign: "right", paddingTop: 12, fontWeight: 500, color: "var(--op-green)", fontVariantNumeric: "tabular-nums" }}>{formatKsh(totalNet)}</td>
              <td colSpan={2}></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {selected && <BookingModal booking={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

function BookingModal({ booking, onClose }: { booking: OpBooking; onClose: () => void }) {
  const commission = commissionOf(booking.value);
  const timeline = [
    { label: "Booked", done: true },
    { label: "Payment confirmed", done: booking.status !== "pending" },
    { label: "Safari commission deducted", done: booking.status === "confirmed" || booking.status === "arriving" },
    { label: "Payout scheduled", done: booking.status === "confirmed" || booking.status === "arriving" },
    { label: "Payout complete", done: false },
  ];
  return (
    <div className="op-modal-overlay" onClick={onClose}>
      <div className="op-modal" onClick={(e) => e.stopPropagation()}>
        <div style={{ padding: "16px 20px", borderBottom: "0.5px solid var(--op-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2 className="op-h2">{booking.guest}</h2>
            <div className="op-sub">Booking {booking.id} · {booking.travellers} {booking.travellers === 1 ? "traveller" : "travellers"} · {booking.origin}</div>
          </div>
          <button className="op-btn op-btn-ghost" onClick={onClose}>Close</button>
        </div>
        <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
          <Section title="Stay">
            <Row label="Listing" value={booking.listing} />
            <Row label="Dates" value={`${booking.checkIn} → ${booking.checkOut} · ${booking.nights} nights`} />
          </Section>
          <Section title="Financial">
            <Row label="Gross value" value={formatKsh(booking.value)} />
            <Row label="Safari commission (12%)" value={formatKsh(commission)} muted />
            <Row label="Net to operator" value={formatKsh(booking.value - commission)} strong />
            <Row label="Payout date" value={booking.payoutDate} muted />
          </Section>
          <Section title="Itinerary context (read-only)">
            <Row label="Source itinerary" value={booking.itinerarySource} muted />
            <Row label="Wildlife intel trigger" value={booking.intelTrigger} muted />
            <Row label="Simba Points generated for guest" value={`${booking.simbaPoints.toLocaleString()} pts`} muted />
          </Section>
          <Section title="Status timeline">
            <ol style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 6 }}>
              {timeline.map((t, i) => (
                <li key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 999, background: t.done ? "var(--op-green)" : "var(--op-border)" }} />
                  <span style={{ color: t.done ? "var(--op-night)" : "var(--op-muted)" }}>{t.label}</span>
                </li>
              ))}
            </ol>
          </Section>
          <div className="op-alert op-alert-info" style={{ fontSize: 11 }}>
            Guest contact details are encrypted and released 48 hours before check-in.
          </div>
        </div>
      </div>
    </div>
  );
}
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="op-label" style={{ marginBottom: 8 }}>{title}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>{children}</div>
    </div>
  );
}
function Row({ label, value, muted, strong }: { label: string; value: string; muted?: boolean; strong?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
      <span style={{ color: "var(--op-muted)" }}>{label}</span>
      <span style={{ color: muted ? "var(--op-muted)" : "var(--op-night)", fontWeight: strong ? 500 : 400 }}>{value}</span>
    </div>
  );
}
