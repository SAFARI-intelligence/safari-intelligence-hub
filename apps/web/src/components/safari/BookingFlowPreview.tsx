// ============================================================
// SAFARI V4 — BookingFlowPreview
// Push: Option A (standalone — integrate packages/ui tokens in Phase B)
// TODO: Replace inline T tokens with import from packages/ui
// TODO: Type props against packages/contracts interfaces
// ============================================================

import { useState } from "react";

// ============================================================
// SAFARI V4 — Booking Flow Preview
// Fix: PF-02 — Users must see full itinerary before committing
// Pattern: Value before wall. Show trip → then request payment.
// Rule: KSh INTEGER only. Conservation calculated on every booking.
// ============================================================

const T = {
  gold: "#C9A84C",
  goldLight: "rgba(201,168,76,0.12)",
  red: "#8B1A1A",
  green: "#2D5A27",
  black: "#1A1209",
  cream: "#F5F0E8",
  surface: "#221C10",
  surfaceHigh: "#2E2515",
  muted: "#7A6A4A",
};

// ─── MOCK ITINERARY ───────────────────────────────────────
const MOCK_ITINERARY = {
  id: "itin-2026-0513",
  title: "7-Day Maasai Mara & Amboseli",
  summary: "Migration season chase — savanna to snowcap. Peak wildlife density across two of Kenya's finest ecosystems.",
  duration: 7,
  parks: ["Maasai Mara", "Amboseli"],
  startDate: "2026-07-18",
  pax: 2,
  totalKsh: 487500,
  perPersonKsh: 243750,
  commissionKsh: 68250,   // 14% — integer: 487500 * 14 / 100 = 68250 exactly
  conservationKsh: 9750,  // 2% of total
  simbapointsEarned: 4875,
  days: [
    {
      day: 1,
      location: "Maasai Mara",
      title: "Arrival & First Game Drive",
      description: "Afternoon transfer from Nairobi. Sunset game drive along the Mara River. High lion density reported in Northern Conservancy.",
      accommodation: "Sarova Mara Game Camp",
      accommodationKsh: 57000, // 2 × 28,500
      meals: "Dinner",
      activities: ["Airport transfer", "Afternoon game drive", "Sundowner"],
      wildlife: ["🦁 Lion (Northern Conservancy)", "🐘 Elephant herds"],
      icon: "🌅",
    },
    {
      day: 2,
      location: "Maasai Mara",
      title: "Great Migration Crossing",
      description: "Full-day game drive targeting wildebeest river crossings. Ranger Kamau reports a crossing likely at Crossing Point 7. This is why you came.",
      accommodation: "Sarova Mara Game Camp",
      accommodationKsh: 57000,
      meals: "Full Board",
      activities: ["Dawn game drive", "River crossing watch", "Bush lunch"],
      wildlife: ["🦬 Wildebeest crossing", "🐊 Nile crocodile", "🦁 Marsh Pride lions"],
      icon: "🌊",
    },
    {
      day: 3,
      location: "Maasai Mara",
      title: "Maasai Culture & Balloon Safari",
      description: "Optional dawn hot-air balloon over the Mara at sunrise (supplement: KSh 45,000/person). Afternoon Maasai village visit — authentic, ranger-coordinated, not tourist-stage.",
      accommodation: "Sarova Mara Game Camp",
      accommodationKsh: 57000,
      meals: "Full Board",
      activities: ["Optional balloon safari", "Maasai village visit", "Afternoon game drive"],
      wildlife: ["🦒 Giraffe herds", "🦓 Zebra migration"],
      icon: "🎈",
    },
    {
      day: 4,
      location: "Transit",
      title: "Mara to Amboseli Transfer",
      description: "Scenic road transfer via Narok. Lunch stop in Naivasha. Arrive Amboseli by late afternoon — first views of Kilimanjaro if skies clear.",
      accommodation: "Ol Tukai Lodge",
      accommodationKsh: 42000,
      meals: "Lunch + Dinner",
      activities: ["Scenic road transfer", "Naivasha lunch stop"],
      wildlife: ["🦅 Raptors en route"],
      icon: "🚐",
    },
    {
      day: 5,
      location: "Amboseli",
      title: "Elephants Under Kilimanjaro",
      description: "Amboseli holds Africa's best elephant viewing — over 1,600 individuals in 62 family groups. Dawn game drive for Kilimanjaro silhouette shots with elephant herds in foreground.",
      accommodation: "Ol Tukai Lodge",
      accommodationKsh: 42000,
      meals: "Full Board",
      activities: ["Dawn game drive", "Elephant Research Centre visit", "Swamp walk"],
      wildlife: ["🐘 Amboseli elephant herds", "🦛 Buffalo herds", "🦩 Flamingoes"],
      icon: "🏔️",
    },
    {
      day: 6,
      location: "Amboseli",
      title: "Full Amboseli Exploration",
      description: "Second full day to slow down, go deeper. Afternoon walking safari with Maasai guide along the swamp edge. Evening: star session from camp — Amboseli has zero light pollution.",
      accommodation: "Ol Tukai Lodge",
      accommodationKsh: 42000,
      meals: "Full Board",
      activities: ["Morning game drive", "Maasai walking safari", "Stargazing"],
      wildlife: ["🐘 Elephant families", "🦁 Amboseli lions", "🦒 Giraffe"],
      icon: "⭐",
    },
    {
      day: 7,
      location: "Amboseli → Nairobi",
      title: "Final Morning & Departure",
      description: "Dawn game drive before 10am lodge checkout. Transfer to Nairobi by road, arriving early afternoon. Airport drop or Nairobi hotel transfer included.",
      accommodation: null,
      accommodationKsh: 0,
      meals: "Breakfast",
      activities: ["Final game drive", "Lodge checkout", "Nairobi transfer"],
      wildlife: ["Last sightings — pack your memories"],
      icon: "✈️",
    },
  ],
  included: [
    "All park entry fees (KSh 34,500 total)",
    "Lodge accommodation (6 nights)",
    "All meals as specified",
    "All game drives with English-speaking guides",
    "Maasai Mara → Amboseli road transfer",
    "Airport transfers (JKIA both ways)",
    "Conservation contribution (KSh 9,750)",
  ],
  excluded: [
    "International flights",
    "Travel insurance (required)",
    "Optional balloon safari (KSh 45,000/pp)",
    "Alcoholic beverages",
    "Tips and gratuities",
  ],
};

// ─── DAY CARD ──────────────────────────────────────────────
function DayCard({ day, isActive, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: "16px",
        background: isActive ? T.goldLight : T.surfaceHigh,
        border: isActive ? `1px solid rgba(201,168,76,0.35)` : `1px solid rgba(255,255,255,0.05)`,
        borderRadius: 10, cursor: "pointer",
        transition: "all 0.2s ease",
      }}
    >
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
        <div style={{
          flexShrink: 0, width: 36, height: 36, borderRadius: 8,
          background: isActive ? T.gold : "rgba(201,168,76,0.1)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 18,
        }}>
          {day.icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
            <span style={{
              fontSize: 10, fontWeight: 700, textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: isActive ? T.gold : T.muted,
            }}>
              Day {day.day} · {day.location}
            </span>
            {day.accommodationKsh > 0 && (
              <span style={{ fontSize: 10, color: T.muted, whiteSpace: "nowrap" }}>
                KSh {day.accommodationKsh.toLocaleString("en-KE")}
              </span>
            )}
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.cream, marginTop: 3, lineHeight: 1.3 }}>
            {day.title}
          </div>
          <div style={{ fontSize: 11, color: T.muted, marginTop: 4, lineHeight: 1.5 }}>
            {day.description}
          </div>
          {isActive && (
            <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {day.activities.map(a => (
                  <span key={a} style={{
                    fontSize: 10, color: T.gold, background: T.goldLight,
                    padding: "2px 8px", borderRadius: 3, fontWeight: 600,
                  }}>
                    {a}
                  </span>
                ))}
              </div>
              <div style={{ fontSize: 11, color: T.muted, marginTop: 4 }}>
                {day.wildlife.join(" · ")}
              </div>
              {day.accommodation && (
                <div style={{
                  display: "flex", alignItems: "center", gap: 6, marginTop: 4,
                  fontSize: 11, color: T.muted,
                }}>
                  🏕️ <span style={{ color: T.cream }}>{day.accommodation}</span>
                  {day.meals && <span>· {day.meals}</span>}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── BOOKING SUMMARY PANEL ─────────────────────────────────
function BookingSummaryPanel({ itinerary, onProceed }) {
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  return (
    <div style={{
      background: T.surfaceHigh,
      border: `1px solid rgba(201,168,76,0.15)`,
      borderRadius: 12, padding: "24px",
      position: "sticky", top: 80,
    }}>
      <div style={{
        fontSize: 11, color: T.gold, fontWeight: 700,
        textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16,
      }}>Booking Summary</div>

      {/* Price breakdown — KSh INTEGER throughout */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
        {[
          { label: "6 nights accommodation", ksh: 297000 },
          { label: "Park entry fees (2 parks)", ksh: 34500 },
          { label: "All transfers + guide", ksh: 87000 },
          { label: "Meals (as specified)", ksh: 60000 },
        ].map(line => (
          <div key={line.label} style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
            <span style={{ color: T.muted }}>{line.label}</span>
            <span style={{ color: T.cream }}>KSh {line.ksh.toLocaleString("en-KE")}</span>
          </div>
        ))}

        <div style={{ height: 1, background: "rgba(201,168,76,0.1)", margin: "4px 0" }} />

        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
          <span style={{ color: T.muted }}>Subtotal</span>
          <span style={{ color: T.cream }}>KSh 478,500</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
          <span style={{ color: "#4CAF50" }}>🌿 Conservation fund (2%)</span>
          <span style={{ color: "#4CAF50" }}>KSh {itinerary.conservationKsh.toLocaleString("en-KE")}</span>
        </div>

        <div style={{ height: 1, background: "rgba(201,168,76,0.1)", margin: "4px 0" }} />

        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: T.cream }}>Total</span>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 20, fontWeight: 900, color: T.gold, fontFamily: "Georgia, serif" }}>
              KSh {itinerary.totalKsh.toLocaleString("en-KE")}
            </div>
            <div style={{ fontSize: 11, color: T.muted }}>≈ USD 3,731 · 2 people</div>
          </div>
        </div>

        <div style={{ fontSize: 10, color: T.muted, textAlign: "right" }}>
          KSh {itinerary.perPersonKsh.toLocaleString("en-KE")} per person
        </div>
      </div>

      {/* Simba Points */}
      <div style={{
        padding: "10px 12px", background: T.goldLight,
        border: `1px solid rgba(201,168,76,0.2)`, borderRadius: 8,
        display: "flex", alignItems: "center", gap: 8, marginBottom: 16,
      }}>
        <span>🏆</span>
        <span style={{ fontSize: 11, color: T.gold, fontWeight: 600 }}>
          Earn {itinerary.simbapointsEarned.toLocaleString()} Simba Points on this trip
        </span>
      </div>

      {/* Terms checkbox */}
      <label style={{
        display: "flex", gap: 10, alignItems: "flex-start",
        cursor: "pointer", marginBottom: 16,
      }}>
        <input
          type="checkbox"
          checked={agreedToTerms}
          onChange={e => setAgreedToTerms(e.target.checked)}
          style={{ marginTop: 2, accentColor: T.gold, width: 16, height: 16, flexShrink: 0 }}
        />
        <span style={{ fontSize: 11, color: T.muted, lineHeight: 1.5 }}>
          I've reviewed the full itinerary above and agree to Safari's{" "}
          <span style={{ color: T.gold, textDecoration: "underline", cursor: "pointer" }}>booking terms</span>.
          Free cancellation up to 30 days before travel.
        </span>
      </label>

      {/* Primary CTA */}
      <button
        onClick={agreedToTerms ? onProceed : undefined}
        style={{
          width: "100%", padding: "16px",
          background: agreedToTerms ? T.gold : "rgba(201,168,76,0.15)",
          color: agreedToTerms ? T.black : T.muted,
          border: "none", borderRadius: 8, fontWeight: 800, fontSize: 14,
          cursor: agreedToTerms ? "pointer" : "not-allowed",
          letterSpacing: "0.04em", transition: "all 0.2s ease",
          minHeight: 52,
        }}
      >
        {agreedToTerms ? "Proceed to Payment →" : "Review itinerary to continue"}
      </button>

      <div style={{ marginTop: 12, fontSize: 10, color: T.muted, textAlign: "center", lineHeight: 1.5 }}>
        Pay securely via M-Pesa · Visa · Mastercard<br />
        No charge until booking confirmed by operator
      </div>
    </div>
  );
}

// ─── MAIN BOOKING FLOW PREVIEW ─────────────────────────────
export default function BookingFlowPreview() {
  const [activeDay, setActiveDay] = useState(0);
  const [showPayment, setShowPayment] = useState(false);
  const itin = MOCK_ITINERARY;

  if (showPayment) {
    return (
      <div style={{
        minHeight: "100vh", background: T.black, color: T.cream,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexDirection: "column", gap: 16, padding: 40,
      }}>
        <style>{`* { box-sizing: border-box; margin: 0; padding: 0; }`}</style>
        <div style={{ fontSize: 48 }}>✅</div>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: T.gold, fontFamily: "Georgia, serif" }}>
          Proceeding to Payment
        </h2>
        <p style={{ color: T.muted, textAlign: "center", maxWidth: 360, lineHeight: 1.6 }}>
          PF-02 fix verified: User reviewed full itinerary before reaching payment.
          Stripe + M-Pesa Daraja integration would load here.
        </p>
        <button
          onClick={() => setShowPayment(false)}
          style={{
            background: "transparent", color: T.gold,
            border: `1px solid ${T.gold}`, borderRadius: 6,
            padding: "10px 24px", cursor: "pointer", fontWeight: 700,
          }}
        >
          ← Back to itinerary
        </button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: T.black, color: T.cream }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:none} }
      `}</style>

      {/* Header */}
      <div style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(26,18,9,0.96)", backdropFilter: "blur(12px)",
        borderBottom: `1px solid rgba(201,168,76,0.1)`,
        padding: "14px 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 18 }}>🦁</span>
          <span style={{ color: T.gold, fontWeight: 900, letterSpacing: "0.08em" }}>SAFARI</span>
        </div>
        {/* Progress steps */}
        <div style={{ display: "flex", gap: 0, alignItems: "center" }}>
          {["Itinerary Review", "Payment", "Confirmation"].map((step, i) => (
            <div key={step} style={{ display: "flex", alignItems: "center" }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "4px 12px",
                background: i === 0 ? T.goldLight : "transparent",
                borderRadius: 4,
              }}>
                <div style={{
                  width: 18, height: 18, borderRadius: "50%",
                  background: i === 0 ? T.gold : "rgba(255,255,255,0.1)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 10, fontWeight: 800,
                  color: i === 0 ? T.black : T.muted,
                }}>
                  {i + 1}
                </div>
                <span style={{
                  fontSize: 11, fontWeight: 600,
                  color: i === 0 ? T.gold : T.muted,
                  display: window.innerWidth < 500 && i > 0 ? "none" : "inline",
                }}>
                  {step}
                </span>
              </div>
              {i < 2 && <span style={{ color: T.muted, fontSize: 12, margin: "0 4px" }}>›</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Main layout */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr min(380px, 100%)",
        gap: 24, padding: "28px 24px",
        maxWidth: 1100, margin: "0 auto",
        // Stack on mobile
        gridTemplateColumns: "1fr",
      }}>

        {/* Left — Itinerary */}
        <div style={{ animation: "fadeUp 0.4s ease" }}>
          {/* Trip header */}
          <div style={{ marginBottom: 24 }}>
            <div style={{
              fontSize: 10, color: T.gold, fontWeight: 700,
              textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 8,
            }}>
              Your Safari · {itin.duration} Days · {itin.pax} Travellers
            </div>
            <h1 style={{
              fontSize: 28, fontWeight: 900, color: T.cream,
              fontFamily: "Georgia, serif", marginBottom: 8, lineHeight: 1.2,
            }}>
              {itin.title}
            </h1>
            <p style={{ fontSize: 13, color: T.muted, lineHeight: 1.6, maxWidth: 560 }}>
              {itin.summary}
            </p>

            {/* Park tags */}
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              {itin.parks.map(p => (
                <span key={p} style={{
                  fontSize: 11, color: T.gold, background: T.goldLight,
                  padding: "4px 12px", borderRadius: 4, fontWeight: 600,
                }}>
                  📍 {p}
                </span>
              ))}
              <span style={{
                fontSize: 11, color: T.muted,
                background: T.surfaceHigh,
                padding: "4px 12px", borderRadius: 4,
              }}>
                {itin.startDate}
              </span>
            </div>
          </div>

          {/* Day-by-day */}
          <div style={{
            fontSize: 11, color: T.gold, fontWeight: 700,
            textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 14,
          }}>
            Day-by-Day Itinerary
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
            {itin.days.map((day, i) => (
              <DayCard
                key={i}
                day={day}
                isActive={activeDay === i}
                onClick={() => setActiveDay(activeDay === i ? null : i)}
              />
            ))}
          </div>

          {/* Included/Excluded */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 28 }}>
            {[
              { label: "✅ Included", items: itin.included, color: "#4CAF50" },
              { label: "❌ Not included", items: itin.excluded, color: T.red },
            ].map(section => (
              <div key={section.label} style={{
                background: T.surfaceHigh, borderRadius: 10, padding: "16px",
                border: `1px solid rgba(255,255,255,0.05)`,
              }}>
                <div style={{
                  fontSize: 11, fontWeight: 700, color: section.color,
                  textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10,
                }}>
                  {section.label}
                </div>
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
                  {section.items.map(item => (
                    <li key={item} style={{ fontSize: 11, color: T.muted, lineHeight: 1.4 }}>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Mobile-only: show summary + CTA inline */}
          <div style={{ display: "none" /* show on mobile via media query if needed */ }}>
            <BookingSummaryPanel itinerary={itin} onProceed={() => setShowPayment(true)} />
          </div>
        </div>

        {/* Right — Booking summary (sticky) */}
        <div>
          <BookingSummaryPanel itinerary={itin} onProceed={() => setShowPayment(true)} />
        </div>
      </div>
    </div>
  );
}
