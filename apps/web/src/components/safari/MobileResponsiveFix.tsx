// ============================================================
// SAFARI V4 — MobileResponsiveFix
// Push: Option A (standalone — integrate packages/ui tokens in Phase B)
// TODO: Replace inline T tokens with import from packages/ui
// TODO: Type props against packages/contracts interfaces
// ============================================================

import { useState, useEffect } from "react";

// ============================================================
// SAFARI V4 — Mobile Responsive Fix Layer
// Fix: PF-04 — Mobile breakage audit + responsive components
// Covers: Nav, Hero, BookingCard, PriceDisplay, CTAButton
// Rule: Mobile-first. KSh primary. No float on financial fields.
// ============================================================

const T = {
  gold: "#C9A84C",
  red: "#8B1A1A",
  green: "#2D5A27",
  black: "#1A1209",
  cream: "#F5F0E8",
  surface: "#221C10",
  surfaceHigh: "#2E2515",
  muted: "#7A6A4A",
};

// ─── BREAKPOINT HOOK ───────────────────────────────────────
function useBreakpoint() {
  const [bp, setBp] = useState({ mobile: true, tablet: false, desktop: false, width: 375 });
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      setBp({ mobile: w < 640, tablet: w >= 640 && w < 1024, desktop: w >= 1024, width: w });
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return bp;
}

// ─── KSh PRICE DISPLAY (integer-safe, no float) ────────────
// Rule: kshAmount must be INTEGER. Display layer divides for formatting only.
function KshPrice({ kshAmount, usdAmount = null, size = "md" }) {
  const sizes = { sm: { main: 16, sub: 11 }, md: { main: 22, sub: 12 }, lg: { main: 32, sub: 14 } };
  const s = sizes[size];

  // Integer-safe comma formatting
  const formatKsh = (n) => {
    if (!Number.isInteger(n)) throw new Error(`KSh must be INTEGER, got ${typeof n}: ${n}`);
    return n.toLocaleString("en-KE");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
        <span style={{ fontSize: s.main * 0.55, color: T.gold, fontWeight: 700 }}>KSh</span>
        <span
          style={{
            fontSize: s.main,
            fontWeight: 900,
            color: T.cream,
            fontFamily: "Georgia, serif",
          }}
        >
          {formatKsh(kshAmount)}
        </span>
      </div>
      {usdAmount && (
        <span style={{ fontSize: s.sub, color: T.muted, marginTop: 1 }}>≈ USD {usdAmount}</span>
      )}
    </div>
  );
}

// ─── RESPONSIVE NAV ────────────────────────────────────────
function MobileNav({ currentPage = "explore" }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { mobile } = useBreakpoint();

  const navItems = [
    { id: "explore", label: "Explore", icon: "🗺️" },
    { id: "plan", label: "Plan", icon: "✨" },
    { id: "wildlife", label: "Wildlife", icon: "🦁" },
    { id: "book", label: "Book", icon: "📅" },
    { id: "account", label: "Account", icon: "👤" },
  ];

  if (mobile) {
    // Bottom tab bar for mobile
    return (
      <>
        <div style={{ height: 70 }} /> {/* spacer */}
        <div
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 200,
            background: "rgba(26,18,9,0.97)",
            backdropFilter: "blur(16px)",
            borderTop: `1px solid rgba(201,168,76,0.15)`,
            display: "flex",
            padding: "8px 0 12px",
            boxShadow: "0 -4px 24px rgba(0,0,0,0.4)",
          }}
        >
          {navItems.map((item) => (
            <button
              key={item.id}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 3,
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "4px 0",
              }}
            >
              <span style={{ fontSize: 20 }}>{item.icon}</span>
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  color: currentPage === item.id ? T.gold : T.muted,
                }}
              >
                {item.label}
              </span>
              {currentPage === item.id && (
                <div style={{ width: 4, height: 4, borderRadius: "50%", background: T.gold }} />
              )}
            </button>
          ))}
        </div>
      </>
    );
  }

  // Desktop top nav
  return (
    <nav
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "16px 40px",
        background: "rgba(26,18,9,0.95)",
        backdropFilter: "blur(12px)",
        borderBottom: `1px solid rgba(201,168,76,0.1)`,
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 22 }}>🦁</span>
        <span style={{ color: T.gold, fontWeight: 900, fontSize: 20, letterSpacing: "0.08em" }}>
          SAFARI
        </span>
      </div>
      <div style={{ display: "flex", gap: 32 }}>
        {navItems.map((item) => (
          <button
            key={item.id}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: "0.04em",
              color: currentPage === item.id ? T.gold : T.muted,
              borderBottom:
                currentPage === item.id ? `2px solid ${T.gold}` : "2px solid transparent",
              paddingBottom: 4,
              transition: "all 0.15s",
            }}
          >
            {item.label}
          </button>
        ))}
      </div>
      <button
        style={{
          background: T.gold,
          color: T.black,
          border: "none",
          padding: "10px 22px",
          borderRadius: 6,
          fontWeight: 800,
          fontSize: 13,
          cursor: "pointer",
          letterSpacing: "0.04em",
        }}
      >
        Build My Safari
      </button>
    </nav>
  );
}

// ─── RESPONSIVE BOOKING CARD ───────────────────────────────
function BookingCard({
  lodge = {
    name: "Sarova Mara Game Camp",
    park: "Maasai Mara",
    nights: 3,
    pricePerNightKsh: 28500,
    ratingCount: 847,
    rating: 4.8,
    tags: ["Migration View", "Full Board", "Game Drives"],
    conservationKsh: 1500,
    availableRooms: 3,
  },
}) {
  const { mobile } = useBreakpoint();
  const [selected, setSelected] = useState(false);

  const totalKsh = lodge.pricePerNightKsh * lodge.nights;
  const commissionKsh = Math.round(totalKsh * 14) / 100; // 14% — INTEGER math

  return (
    <div
      style={{
        background: T.surfaceHigh,
        border: selected ? `2px solid ${T.gold}` : `1px solid rgba(201,168,76,0.12)`,
        borderRadius: 12,
        overflow: "hidden",
        maxWidth: mobile ? "100%" : 440,
        boxShadow: selected ? `0 0 24px rgba(201,168,76,0.12)` : "none",
        transition: "all 0.2s ease",
      }}
    >
      {/* Lodge image placeholder */}
      <div
        style={{
          height: mobile ? 160 : 200,
          background: `linear-gradient(135deg, #2A3A1A 0%, #1A2A0A 100%)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <span style={{ fontSize: 48, opacity: 0.4 }}>🏕️</span>
        {/* Scarcity badge */}
        {lodge.availableRooms <= 3 && (
          <div
            style={{
              position: "absolute",
              top: 12,
              right: 12,
              background: "rgba(139,26,26,0.9)",
              color: T.cream,
              fontSize: 10,
              fontWeight: 700,
              padding: "4px 10px",
              borderRadius: 4,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            Only {lodge.availableRooms} left
          </div>
        )}
        <div
          style={{
            position: "absolute",
            bottom: 12,
            left: 12,
            display: "flex",
            gap: 6,
            flexWrap: "wrap",
          }}
        >
          {lodge.tags.map((tag) => (
            <span
              key={tag}
              style={{
                fontSize: 10,
                color: T.cream,
                background: "rgba(0,0,0,0.6)",
                padding: "3px 8px",
                borderRadius: 3,
                fontWeight: 600,
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Card body */}
      <div style={{ padding: mobile ? "16px" : "20px" }}>
        {/* Lodge name + rating */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 8,
          }}
        >
          <div>
            <h3
              style={{
                fontSize: mobile ? 15 : 17,
                fontWeight: 800,
                color: T.cream,
                lineHeight: 1.2,
              }}
            >
              {lodge.name}
            </h3>
            <div style={{ fontSize: 11, color: T.muted, marginTop: 4 }}>📍 {lodge.park}</div>
          </div>
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: T.gold }}>⭐ {lodge.rating}</div>
            <div style={{ fontSize: 10, color: T.muted }}>{lodge.ratingCount} reviews</div>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: "rgba(201,168,76,0.08)", margin: "14px 0" }} />

        {/* PRICING — KSh primary, visible immediately */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            flexWrap: mobile ? "wrap" : "nowrap",
            gap: 12,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 10,
                color: T.muted,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: 4,
              }}
            >
              Per night
            </div>
            <KshPrice
              kshAmount={lodge.pricePerNightKsh}
              usdAmount="~$218"
              size={mobile ? "md" : "lg"}
            />
          </div>
          <div style={{ textAlign: "right" }}>
            <div
              style={{
                fontSize: 10,
                color: T.muted,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: 4,
              }}
            >
              {lodge.nights} nights total
            </div>
            <KshPrice kshAmount={totalKsh} size={mobile ? "md" : "lg"} />
          </div>
        </div>

        {/* Conservation impact line */}
        <div
          style={{
            marginTop: 12,
            padding: "8px 12px",
            background: "rgba(45,90,39,0.1)",
            borderRadius: 6,
            display: "flex",
            alignItems: "center",
            gap: 8,
            border: `1px solid rgba(45,90,39,0.2)`,
          }}
        >
          <span style={{ fontSize: 14 }}>🌿</span>
          <span style={{ fontSize: 11, color: T.muted }}>
            <strong style={{ color: "#4CAF50" }}>
              KSh {lodge.conservationKsh.toLocaleString("en-KE")}
            </strong>{" "}
            of this booking funds local conservation
          </span>
        </div>

        {/* Simba Points earned preview */}
        <div
          style={{
            marginTop: 8,
            padding: "8px 12px",
            background: "rgba(201,168,76,0.06)",
            borderRadius: 6,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span style={{ fontSize: 14 }}>🏆</span>
          <span style={{ fontSize: 11, color: T.muted }}>
            Earn{" "}
            <strong style={{ color: T.gold }}>
              {Math.round(totalKsh / 100).toLocaleString()} Simba Points
            </strong>{" "}
            on this booking
          </span>
        </div>

        {/* CTA */}
        <button
          onClick={() => setSelected((s) => !s)}
          style={{
            width: "100%",
            marginTop: 16,
            padding: "14px",
            background: selected ? T.gold : "transparent",
            color: selected ? T.black : T.gold,
            border: `2px solid ${T.gold}`,
            borderRadius: 8,
            fontWeight: 800,
            fontSize: 14,
            cursor: "pointer",
            letterSpacing: "0.04em",
            transition: "all 0.2s ease",
            // Minimum 44px touch target (mobile a11y)
            minHeight: 48,
          }}
        >
          {selected ? "✓ Selected — Continue to Review" : "Select Lodge"}
        </button>
      </div>
    </div>
  );
}

// ─── MOBILE HERO ───────────────────────────────────────────
function MobileHero() {
  const { mobile } = useBreakpoint();

  return (
    <div
      style={{
        background: `linear-gradient(160deg, #2A1F08 0%, #1A1209 60%)`,
        padding: mobile ? "40px 20px 48px" : "80px 40px 80px",
        textAlign: mobile ? "center" : "left",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background texture */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.04,
          backgroundImage: `radial-gradient(${T.gold} 1px, transparent 1px)`,
          backgroundSize: "24px 24px",
        }}
      />

      <div style={{ position: "relative" }}>
        <div
          style={{
            fontSize: 11,
            color: T.gold,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.15em",
            marginBottom: 16,
          }}
        >
          AI-Powered Kenya Safari Planner
        </div>
        <h1
          style={{
            fontSize: mobile ? 32 : 52,
            fontWeight: 900,
            color: T.cream,
            lineHeight: 1.1,
            fontFamily: "Georgia, 'Times New Roman', serif",
            marginBottom: 16,
          }}
        >
          Plan Your Kenya Safari
          <br />
          <span style={{ color: T.gold }}>in 2 Minutes</span>
        </h1>
        <p
          style={{
            fontSize: mobile ? 14 : 17,
            color: T.muted,
            lineHeight: 1.65,
            maxWidth: 480,
            margin: mobile ? "0 auto 28px" : "0 0 32px",
          }}
        >
          Personalized itineraries, ranger-validated wildlife tracking, and KSh-native booking.
          Built for Kenya — not adapted for it.
        </p>

        {/* CTA group */}
        <div
          style={{
            display: "flex",
            gap: 12,
            flexDirection: mobile ? "column" : "row",
            alignItems: mobile ? "stretch" : "center",
          }}
        >
          <button
            style={{
              background: T.gold,
              color: T.black,
              border: "none",
              borderRadius: 8,
              padding: "16px 28px",
              fontWeight: 800,
              fontSize: 15,
              cursor: "pointer",
              letterSpacing: "0.04em",
              minHeight: 52, // touch target
            }}
          >
            Build My Safari — Free
          </button>
          <button
            style={{
              background: "transparent",
              color: T.cream,
              border: `1px solid rgba(245,240,232,0.2)`,
              borderRadius: 8,
              padding: "16px 28px",
              fontWeight: 600,
              fontSize: 14,
              cursor: "pointer",
              minHeight: 52,
            }}
          >
            See example itinerary →
          </button>
        </div>

        {/* Social proof */}
        <div style={{ marginTop: 24, fontSize: 12, color: T.muted }}>
          🦁 4,200+ itineraries created · ⭐ 4.9/5 from beta users · 🇰🇪 Built in Nairobi
        </div>
      </div>
    </div>
  );
}

// ─── MASTER DEMO WRAPPER ───────────────────────────────────
export default function MobileFixDemo() {
  const { mobile, width } = useBreakpoint();

  return (
    <div style={{ minHeight: "100vh", background: T.black, color: T.cream }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { -webkit-tap-highlight-color: transparent; }
        button:focus-visible { outline: 2px solid #C9A84C; outline-offset: 2px; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:none} }
      `}</style>

      {/* Breakpoint indicator (dev only — remove in prod) */}
      <div
        style={{
          position: "fixed",
          top: 8,
          right: 8,
          zIndex: 999,
          background: "rgba(201,168,76,0.15)",
          border: `1px solid ${T.gold}`,
          borderRadius: 4,
          padding: "3px 8px",
          fontSize: 10,
          color: T.gold,
          fontWeight: 700,
        }}
      >
        {mobile ? "📱 Mobile" : width < 1024 ? "📟 Tablet" : "🖥 Desktop"} · {width}px
      </div>

      <MobileNav currentPage="explore" />
      <MobileHero />

      {/* Booking card demo */}
      <div style={{ padding: mobile ? "24px 16px 100px" : "40px" }}>
        <div
          style={{
            fontSize: 11,
            color: T.gold,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            marginBottom: 20,
          }}
        >
          Featured Lodges · Maasai Mara
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: mobile ? "1fr" : "repeat(auto-fill, minmax(400px, 1fr))",
            gap: 16,
          }}
        >
          <BookingCard />
          <BookingCard
            lodge={{
              name: "Rekero Camp",
              park: "Maasai Mara",
              nights: 4,
              pricePerNightKsh: 45000,
              ratingCount: 512,
              rating: 4.9,
              tags: ["Riverside", "Full Board", "Walking Safaris"],
              conservationKsh: 2800,
              availableRooms: 1,
            }}
          />
        </div>
      </div>
    </div>
  );
}
