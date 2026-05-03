import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { operator } from "@/lib/operator-data";
import { toast } from "sonner";

export const Route = createFileRoute("/operator/settings")({
  head: () => ({ meta: [{ title: "Settings — SAFARI OS Operator" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const [name, setName] = useState(operator.businessName);
  const [reg, setReg] = useState(operator.registrationNumber);
  const [contact, setContact] = useState(operator.contactName);
  const [email, setEmail] = useState(operator.email);
  const [phone, setPhone] = useState(operator.phone);
  const [notif, setNotif] = useState({ booking: true, payout: true, intel: true, ai: false });

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", display: "flex", flexDirection: "column", gap: 16 }}>
      <header>
        <h1 className="op-h1">Settings</h1>
        <p className="op-sub">Manage your operator profile, payouts, plan and team.</p>
      </header>

      <section className="op-card">
        <h2 className="op-h2">Operator profile</h2>
        <div style={{ marginTop: 12, display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
          <Field label="Business name"><input className="op-input" value={name} onChange={(e) => setName(e.target.value)} /></Field>
          <Field label="Registration number"><input className="op-input" value={reg} onChange={(e) => setReg(e.target.value)} /></Field>
          <Field label="Contact name"><input className="op-input" value={contact} onChange={(e) => setContact(e.target.value)} /></Field>
          <Field label="Email"><input className="op-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
          <Field label="Phone (Kenya +254)">
            <input className="op-input" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </Field>
        </div>
        <div style={{ marginTop: 14, display: "flex", justifyContent: "flex-end" }}>
          <button className="op-btn op-btn-primary" onClick={() => toast.success("Profile saved")}>Save profile</button>
        </div>
      </section>

      <section className="op-card">
        <h2 className="op-h2">Notifications</h2>
        <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
          <Toggle label="New booking (email + SMS)" checked={notif.booking} onChange={(v) => setNotif((n) => ({ ...n, booking: v }))} />
          <Toggle label="Payout confirmation" checked={notif.payout} onChange={(v) => setNotif((n) => ({ ...n, payout: v }))} />
          <Toggle label="Wildlife intel alerts" checked={notif.intel} onChange={(v) => setNotif((n) => ({ ...n, intel: v }))} />
          <Toggle label="AI itinerary inclusions" checked={notif.ai} onChange={(v) => setNotif((n) => ({ ...n, ai: v }))} />
        </div>
      </section>

      <section className="op-card">
        <h2 className="op-h2">Payout method</h2>
        <Field label="M-Pesa number"><input className="op-input" defaultValue={operator.mpesaMasked} /></Field>
        <p className="op-sub" style={{ marginTop: 6 }}>Or use bank transfer for international payouts.</p>
      </section>

      <section className="op-card">
        <h2 className="op-h2">Plan</h2>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 500 }}>Operator {operator.plan}</div>
            <div className="op-sub">Next billing {operator.nextBillingDate}</div>
          </div>
          <button className="op-btn op-btn-secondary">Change plan</button>
        </div>
      </section>

      {operator.plan === "Pro" && (
        <>
          <section className="op-card">
            <h2 className="op-h2">Team members</h2>
            <p className="op-sub" style={{ marginTop: 4 }}>Add additional logins for rangers and reception.</p>
            <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
              <input className="op-input" placeholder="ranger@yourcamp.co.ke" />
              <button className="op-btn op-btn-primary">Invite</button>
            </div>
          </section>
          <section className="op-card">
            <h2 className="op-h2">API access</h2>
            <p className="op-sub" style={{ marginTop: 4 }}>SAFARI Wildlife Story API key (read-only)</p>
            <div className="op-input" style={{ marginTop: 8, fontFamily: "monospace", fontSize: 12, background: "#f5f1ea", color: "var(--op-muted)" }}>
              sk_safari_op_••••••••••••••••••••3a91
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="op-field-label">{label}</label>{children}</div>;
}
function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 13, padding: "6px 0" }}>
      <span>{label}</span>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
    </label>
  );
}
