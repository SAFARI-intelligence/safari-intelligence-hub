import { useState } from "react";
import { Upload } from "lucide-react";
import { type OpListing, formatKsh } from "@/lib/operator-data";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

export function ListingForm({ mode, listing }: { mode: "create" | "edit"; listing?: OpListing }) {
  const navigate = useNavigate();
  const [name, setName] = useState(listing?.name ?? "");
  const [type, setType] = useState<OpListing["type"]>(listing?.type ?? "Tented camp");
  const [park, setPark] = useState(listing?.location?.split(" · ")[0] ?? "Maasai Mara");
  const [price, setPrice] = useState(String(listing?.pricePerNight ?? ""));
  const [description, setDescription] = useState(listing?.description ?? "");
  const [highlights, setHighlights] = useState((listing?.highlights ?? []).join("\n"));
  const [maxGroup, setMaxGroup] = useState(String(listing?.maxGroupSize ?? "4"));
  const [instant, setInstant] = useState(listing?.instantBooking ?? false);
  const [included, setIncluded] = useState<string[]>(listing?.included ?? []);

  const toggleIncluded = (k: string) =>
    setIncluded((arr) => (arr.includes(k) ? arr.filter((x) => x !== k) : [...arr, k]));

  const conservation = Math.floor((parseInt(price || "0", 10) || 0) * 0.015);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(mode === "create" ? "Listing draft saved" : "Listing updated");
    navigate({ to: "/operator/listings" });
  };

  return (
    <form onSubmit={submit} className="op-card" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <Field label="Listing name">
        <input className="op-input" value={name} onChange={(e) => setName(e.target.value)} required />
      </Field>

      <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
        <Field label="Type">
          <select className="op-select" value={type} onChange={(e) => setType(e.target.value as OpListing["type"])}>
            {["Lodge", "Tented camp", "Tour package", "Day experience", "Transfer"].map((t) => <option key={t}>{t}</option>)}
          </select>
        </Field>
        <Field label="Park / Region">
          <select className="op-select" value={park} onChange={(e) => setPark(e.target.value)}>
            {["Maasai Mara", "Amboseli", "Tsavo East", "Tsavo West", "Lake Nakuru", "Samburu", "Diani Beach", "Nairobi", "Other"].map((p) => <option key={p}>{p}</option>)}
          </select>
        </Field>
      </div>

      <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
        <Field label="Price (KSh, integer only)">
          <input className="op-input" type="number" min={0} step={1} value={price}
            onChange={(e) => setPrice(e.target.value.replace(/\D/g, ""))} placeholder="e.g. 28500" required />
        </Field>
        <Field label="Max group size">
          <input className="op-input" type="number" min={1} value={maxGroup} onChange={(e) => setMaxGroup(e.target.value)} />
        </Field>
      </div>

      <Field label={`Description (${description.trim().split(/\s+/).filter(Boolean).length} / 50–500 words)`}>
        <textarea className="op-textarea" rows={5} value={description} onChange={(e) => setDescription(e.target.value)} />
      </Field>

      <Field label="Highlights (up to 5, one per line)">
        <textarea className="op-textarea" rows={5} value={highlights}
          onChange={(e) => setHighlights(e.target.value.split("\n").slice(0, 5).join("\n"))} />
      </Field>

      <Field label="Photos (min 5, max 20)">
        <div style={{
          border: "0.5px dashed var(--op-border)", borderRadius: 6, padding: 20,
          display: "flex", flexDirection: "column", alignItems: "center", gap: 6, color: "var(--op-muted)",
          background: "#fafafa",
        }}>
          <Upload size={18} />
          <span style={{ fontSize: 12 }}>Drag & drop or click to upload</span>
          <span style={{ fontSize: 10 }}>JPG / PNG · up to 5 MB each</span>
        </div>
      </Field>

      <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr", alignItems: "center" }}>
        <Field label="Instant booking">
          <label style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 12 }}>
            <input type="checkbox" checked={instant} onChange={(e) => setInstant(e.target.checked)} />
            Allow guests to book without confirmation
          </label>
        </Field>
        <Field label="Conservation contribution (auto)">
          <div className="op-input" style={{ background: "#f5f1ea", color: "var(--op-muted)" }}>
            1.5% = {formatKsh(conservation)} per booking
          </div>
        </Field>
      </div>

      <Field label="Included">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, fontSize: 12 }}>
          {["Game drives", "Meals", "Transfers", "Park fees"].map((opt) => (
            <label key={opt} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <input type="checkbox" checked={included.includes(opt)} onChange={() => toggleIncluded(opt)} />
              {opt}
            </label>
          ))}
        </div>
      </Field>

      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
        <button type="button" className="op-btn op-btn-secondary">Save draft</button>
        <button type="submit" className="op-btn op-btn-primary">{mode === "create" ? "Publish listing" : "Save changes"}</button>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="op-field-label">{label}</label>
      {children}
    </div>
  );
}
