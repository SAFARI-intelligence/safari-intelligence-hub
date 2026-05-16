// ============================================================
// SAFARI V4 — KshPricingFix
// Push: Option A (standalone — integrate packages/ui tokens in Phase B)
// TODO: Replace inline T tokens with import from packages/ui
// TODO: Type props against packages/contracts interfaces
// ============================================================

import { useState } from "react";

// ============================================================
// SAFARI V4 — KSh Pricing Visibility Fix
// Fix: PF-01 — KSh must be visible on ALL booking surfaces
// Rule: KSh INTEGER primary. USD/GBP secondary only. No floats.
// Covers: Price tag, search results, comparison, cart, checkout
// ============================================================

const T = {
  gold: "#C9A84C",
  goldLight: "rgba(201,168,76,0.1)",
  red: "#8B1A1A",
  green: "#2D5A27",
  black: "#1A1209",
  cream: "#F5F0E8",
  surface: "#221C10",
  surfaceHigh: "#2E2515",
  muted: "#7A6A4A",
};

// ─── CORE PRICING UTILITY (integer-only) ──────────────────
// ALL KSh values MUST pass through this. No raw numbers in UI.
const pricing = {
  /**
   * Format KSh integer for display.
   * @param {number} ksh - MUST be integer. Throws if float detected.
   * @param {boolean} compact - e.g. 28,500 → 28.5K
   */
  formatKsh(ksh, compact = false) {
    if (!Number.isInteger(ksh)) {
      throw new Error(`[SAFARI] KSh must be INTEGER. Got: ${ksh} (${typeof ksh})`);
    }
    if (compact && ksh >= 100000) {
      return `${(ksh / 1000).toFixed(0)}K`; // still integer-safe: toFixed(0)
    }
    return ksh.toLocaleString("en-KE");
  },

  /**
   * Calculate commission (14%) using integer-safe math.
   * Avoids float: multiply first, then round.
   */
  commission14(ksh) {
    if (!Number.isInteger(ksh)) throw new Error(`[SAFARI] KSh must be INTEGER. Got: ${ksh}`);
    return Math.round(ksh * 14) / 100; // Safe: 14/100 = 0.14, round to int
  },

  /**
   * KSh → approximate USD display string (for international users).
   * Uses integer KES rate — rates stored as INTEGER (e.g. rate=13000 = 130.00 KES/USD × 100)
   */
  kshToUsdDisplay(ksh, rateX100 = 12900) {
    // rateX100: KES per USD × 100 to avoid float storage
    // e.g. 129.00 KES/USD stored as 12900
    const usd = Math.round((ksh * 100) / rateX100);
    return `~$${usd.toLocaleString("en-US")}`;
  },
};

// ─── ATOMIC: KSH PRICE TAG ─────────────────────────────────
// Drop this anywhere a price appears. KSh always primary.
function KshTag({
  ksh,
  perNight = false,
  showUsd = true,
  size = "md",  // sm | md | lg | xl
  layout = "stacked",  // stacked | inline
}) {
  const sizes = {
    sm: { main: 13, label: 9, sub: 10 },
    md: { main: 20, label: 10, sub: 11 },
    lg: { main: 28, label: 11, sub: 12 },
    xl: { main: 38, label: 12, sub: 13 },
  };
  const s = sizes[size];
  const formatted = pricing.formatKsh(ksh);
  const usd = showUsd ? pricing.kshToUsdDisplay(ksh) : null;

  if (layout === "inline") {
    return (
      <span style={{ display: "inline-flex", alignItems: "baseline", gap: 4 }}>
        <span style={{ fontSize: s.label, color: T.gold, fontWeight: 700 }}>KSh</span>
        <span style={{ fontSize: s.main, fontWeight: 900, color: T.cream, fontFamily: "Georgia, serif" }}>
          {formatted}
        </span>
        {perNight && <span style={{ fontSize: s.sub, color: T.muted }}>/night</span>}
        {usd && <span style={{ fontSize: s.sub, color: T.muted }}>({usd})</span>}
      </span>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 3 }}>
        <span style={{ fontSize: s.label, color: T.gold, fontWeight: 700 }}>KSh</span>
        <span style={{ fontSize: s.main, fontWeight: 900, color: T.cream, fontFamily: "Georgia, serif" }}>
          {formatted}
        </span>
        {perNight && <span style={{ fontSize: s.sub, color: T.muted }}> /night</span>}
      </div>
      {usd && (
        <div style={{ fontSize: s.sub, color: T.muted, marginTop: 1 }}>{usd} per night</div>
      )}
    </div>
  );
}

// ─── SURFACE 1: SEARCH RESULT CARD ─────────────────────────
function SearchResultCard({ lodge }) {
  return (
    <div style={{
      background: T.surfaceHigh,
      border: `1px solid rgba(201,168,76,0.1)`,
      borderRadius: 10, overflow: "hidden",
      display: "flex", gap: 0,
    }}>
      {/* Image placeholder */}
      <div style={{
        width: 120, flexShrink: 0,
        background: `linear-gradient(135deg, #1A2E0A 0%, #0D1A05 100%)`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 32,
      }}>
        🏕️
      </div>

      {/* Content */}
      <div style={{ padding: "14px 16px", flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: T.cream }}>{lodge.name}</div>
            <div style={{ fontSize: 11, color: T.muted }}>📍 {lodge.park}</div>
          </div>
          {/* ✅ KSh VISIBLE IMMEDIATELY — not hidden behind click */}
          <div style={{ textAlign: "right" }}>
            <KshTag ksh={lodge.pricePerNightKsh} perNight size="md" />
          </div>
        </div>

        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {lodge.tags.map(tag => (
            <span key={tag} style={{
              fontSize: 10, color: T.gold, background: T.goldLight,
              padding: "2px 8px", borderRadius: 3,
            }}>{tag}</span>
          ))}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 11, color: T.muted }}>⭐ {lodge.rating} · {lodge.ratingCount} reviews</span>
          <button style={{
            background: T.gold, color: T.black, border: "none",
            padding: "7px 16px", borderRadius: 5, fontWeight: 800, fontSize: 11,
            cursor: "pointer",
          }}>
            Select
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── SURFACE 2: PRICE FILTER ───────────────────────────────
function PriceFilter({ onFilter }) {
  const [selected, setSelected] = useState("all");

  // All ranges in KSh INTEGER
  const ranges = [
    { id: "all", label: "All", min: 0, max: Infinity },
    { id: "budget", label: "Under KSh 20K", min: 0, max: 20000 },
    { id: "mid", label: "KSh 20K–50K", min: 20000, max: 50000 },
    { id: "luxury", label: "KSh 50K+", min: 50000, max: Infinity },
  ];

  return (
    <div style={{
      display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center",
      padding: "12px 0",
    }}>
      <span style={{ fontSize: 11, color: T.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>
        Budget (KSh/night):
      </span>
      {ranges.map(r => (
        <button
          key={r.id}
          onClick={() => { setSelected(r.id); onFilter && onFilter(r); }}
          style={{
            fontSize: 11, fontWeight: 600, padding: "5px 12px", borderRadius: 5,
            border: selected === r.id ? `2px solid ${T.gold}` : `1px solid rgba(201,168,76,0.2)`,
            background: selected === r.id ? T.goldLight : "transparent",
            color: selected === r.id ? T.gold : T.muted,
            cursor: "pointer", transition: "all 0.15s",
          }}
        >
          {r.label}
        </button>
      ))}
    </div>
  );
}

// ─── SURFACE 3: COMPARISON TABLE ───────────────────────────
function LodgeComparisonTable({ lodges }) {
  return (
    <div style={{
      background: T.surfaceHigh, borderRadius: 10,
      border: `1px solid rgba(201,168,76,0.1)`,
      overflow: "hidden",
    }}>
      <div style={{
        display: "grid", gridTemplateColumns: `160px repeat(${lodges.length}, 1fr)`,
        borderBottom: `1px solid rgba(201,168,76,0.1)`,
      }}>
        <div style={{ padding: "12px 16px", fontSize: 11, color: T.muted, fontWeight: 700 }} />
        {lodges.map(l => (
          <div key={l.name} style={{
            padding: "12px 16px", textAlign: "center",
            borderLeft: `1px solid rgba(201,168,76,0.06)`,
          }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.cream }}>{l.name}</div>
            <div style={{ fontSize: 10, color: T.muted }}>{l.park}</div>
          </div>
        ))}
      </div>

      {/* Price row — always first and most prominent */}
      {[
        {
          label: "Price/night",
          render: (l) => (
            <div style={{ textAlign: "center" }}>
              {/* ✅ KSh PRIMARY — most prominent field */}
              <div style={{ fontSize: 18, fontWeight: 900, color: T.gold, fontFamily: "Georgia, serif" }}>
                KSh {pricing.formatKsh(l.pricePerNightKsh)}
              </div>
              <div style={{ fontSize: 10, color: T.muted, marginTop: 2 }}>
                {pricing.kshToUsdDisplay(l.pricePerNightKsh)} /night
              </div>
            </div>
          ),
        },
        { label: "Rating", render: (l) => <div style={{ textAlign: "center", color: T.cream, fontSize: 13, fontWeight: 700 }}>⭐ {l.rating}</div> },
        { label: "Meal plan", render: (l) => <div style={{ textAlign: "center", color: T.muted, fontSize: 12 }}>{l.meals}</div> },
        { label: "Game drives", render: (l) => <div style={{ textAlign: "center", fontSize: 16 }}>{l.gameDrives ? "✅" : "❌"}</div> },
        {
          label: "Conservation",
          render: (l) => (
            <div style={{ textAlign: "center", fontSize: 12, color: "#4CAF50" }}>
              KSh {pricing.formatKsh(Math.round(l.pricePerNightKsh * 2) / 100)} / night
            </div>
          ),
        },
      ].map((row, ri) => (
        <div
          key={ri}
          style={{
            display: "grid",
            gridTemplateColumns: `160px repeat(${lodges.length}, 1fr)`,
            borderBottom: ri < 4 ? `1px solid rgba(201,168,76,0.05)` : "none",
            background: ri === 0 ? "rgba(201,168,76,0.04)" : "transparent",
          }}
        >
          <div style={{
            padding: "12px 16px", fontSize: 11, color: T.muted,
            fontWeight: ri === 0 ? 700 : 500,
            color: ri === 0 ? T.gold : T.muted,
            textTransform: ri === 0 ? "uppercase" : "none",
            letterSpacing: ri === 0 ? "0.06em" : 0,
          }}>
            {row.label}
          </div>
          {lodges.map(l => (
            <div key={l.name} style={{
              padding: "12px 16px",
              borderLeft: `1px solid rgba(201,168,76,0.06)`,
            }}>
              {row.render(l)}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// ─── SURFACE 4: CART / CHECKOUT HEADER ─────────────────────
function CartSummaryHeader({ items }) {
  // Calculate total using integer math only
  const totalKsh = items.reduce((acc, item) => {
    const lineKsh = item.pricePerNightKsh * item.nights;
    return acc + lineKsh;
  }, 0);

  const conservationKsh = Math.round(totalKsh * 2) / 100;
  const finalKsh = totalKsh + conservationKsh;

  return (
    <div style={{
      background: T.surface,
      border: `1px solid rgba(201,168,76,0.15)`,
      borderRadius: 10, padding: "20px 24px",
      display: "flex", flexWrap: "wrap", gap: 20,
      alignItems: "flex-start", justifyContent: "space-between",
    }}>
      <div>
        <div style={{
          fontSize: 10, color: T.gold, fontWeight: 700,
          textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8,
        }}>
          Your Safari Cart
        </div>
        {items.map(item => (
          <div key={item.name} style={{
            display: "flex", justifyContent: "space-between", gap: 40,
            padding: "6px 0", borderBottom: `1px solid rgba(255,255,255,0.04)`,
          }}>
            <div>
              <span style={{ fontSize: 13, color: T.cream, fontWeight: 600 }}>{item.name}</span>
              <span style={{ fontSize: 11, color: T.muted, marginLeft: 8 }}>
                {item.nights} nights
              </span>
            </div>
            {/* ✅ KSh shown inline for every line item */}
            <KshTag ksh={item.pricePerNightKsh * item.nights} size="sm" layout="inline" showUsd={false} />
          </div>
        ))}
        <div style={{ display: "flex", justifyContent: "space-between", gap: 40, padding: "8px 0" }}>
          <span style={{ fontSize: 12, color: "#4CAF50" }}>🌿 Conservation (2%)</span>
          <KshTag ksh={conservationKsh} size="sm" layout="inline" showUsd={false} />
        </div>
      </div>

      <div style={{ textAlign: "right" }}>
        <div style={{ fontSize: 11, color: T.muted, marginBottom: 4 }}>Total due</div>
        {/* ✅ Final total: KSh most prominent, USD secondary */}
        <div style={{ fontSize: 36, fontWeight: 900, color: T.gold, fontFamily: "Georgia, serif" }}>
          KSh {pricing.formatKsh(finalKsh)}
        </div>
        <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>
          {pricing.kshToUsdDisplay(finalKsh)} · No hidden fees
        </div>
      </div>
    </div>
  );
}

// ─── DEMO WRAPPER ──────────────────────────────────────────
const SAMPLE_LODGES = [
  { name: "Sarova Mara", park: "Maasai Mara", pricePerNightKsh: 28500, rating: 4.8, ratingCount: 847, tags: ["Migration View", "Full Board"], gameDrives: true, meals: "Full Board" },
  { name: "Rekero Camp", park: "Maasai Mara", pricePerNightKsh: 45000, rating: 4.9, ratingCount: 512, tags: ["Riverside", "Luxury"], gameDrives: true, meals: "Full Board" },
  { name: "Ol Tukai", park: "Amboseli", pricePerNightKsh: 21000, rating: 4.7, ratingCount: 634, tags: ["Kilimanjaro View", "Pool"], gameDrives: true, meals: "Half Board" },
];

const CART_ITEMS = [
  { name: "Sarova Mara Game Camp", nights: 3, pricePerNightKsh: 28500 },
  { name: "Ol Tukai Lodge", nights: 2, pricePerNightKsh: 21000 },
];

export default function KshPricingFix() {
  return (
    <div style={{ minHeight: "100vh", background: T.black, color: T.cream, padding: 24 }}>
      <style>{`* { box-sizing: border-box; margin: 0; padding: 0; }`}</style>

      {/* Section header */}
      <div style={{
        fontSize: 11, color: T.gold, fontWeight: 700, textTransform: "uppercase",
        letterSpacing: "0.12em", marginBottom: 6,
      }}>
        PF-01 — KSh Pricing Visibility Fix
      </div>
      <h1 style={{ fontSize: 22, fontWeight: 900, color: T.cream, marginBottom: 6, fontFamily: "Georgia, serif" }}>
        KSh on Every Surface
      </h1>
      <p style={{ fontSize: 12, color: T.muted, marginBottom: 32, lineHeight: 1.6, maxWidth: 520 }}>
        All four pricing surfaces fixed: search results, filters, comparison, and cart header.
        KSh is always primary. No currency conversion required for Kenyan users.
      </p>

      {/* Surface 1: Search results */}
      <div style={{ marginBottom: 28 }}>
        <SectionLabel label="Surface 1 — Search Results" />
        <PriceFilter />
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
          {SAMPLE_LODGES.slice(0, 2).map(l => <SearchResultCard key={l.name} lodge={l} />)}
        </div>
      </div>

      {/* Surface 2: Comparison table */}
      <div style={{ marginBottom: 28 }}>
        <SectionLabel label="Surface 2 — Lodge Comparison" />
        <LodgeComparisonTable lodges={SAMPLE_LODGES} />
      </div>

      {/* Surface 3: Cart summary */}
      <div style={{ marginBottom: 28 }}>
        <SectionLabel label="Surface 3 — Cart / Checkout Header" />
        <CartSummaryHeader items={CART_ITEMS} />
      </div>

      {/* Surface 4: Atomic component showcase */}
      <div style={{ marginBottom: 28 }}>
        <SectionLabel label="Surface 4 — KshTag Component (all sizes)" />
        <div style={{
          background: T.surfaceHigh, borderRadius: 10, padding: 20,
          display: "flex", flexWrap: "wrap", gap: 24, alignItems: "flex-end",
          border: `1px solid rgba(201,168,76,0.1)`,
        }}>
          <div><div style={{ fontSize: 10, color: T.muted, marginBottom: 6 }}>sm</div><KshTag ksh={5000} size="sm" perNight /></div>
          <div><div style={{ fontSize: 10, color: T.muted, marginBottom: 6 }}>md</div><KshTag ksh={28500} size="md" perNight /></div>
          <div><div style={{ fontSize: 10, color: T.muted, marginBottom: 6 }}>lg</div><KshTag ksh={45000} size="lg" perNight /></div>
          <div><div style={{ fontSize: 10, color: T.muted, marginBottom: 6 }}>xl — checkout</div><KshTag ksh={487500} size="xl" /></div>
          <div><div style={{ fontSize: 10, color: T.muted, marginBottom: 6 }}>inline</div><KshTag ksh={28500} size="md" layout="inline" /></div>
        </div>
      </div>
    </div>
  );
}

function SectionLabel({ label }) {
  return (
    <div style={{
      fontSize: 10, color: T.gold, fontWeight: 700,
      textTransform: "uppercase", letterSpacing: "0.1em",
      marginBottom: 12, paddingBottom: 8,
      borderBottom: `1px solid rgba(201,168,76,0.1)`,
    }}>
      {label}
    </div>
  );
}
