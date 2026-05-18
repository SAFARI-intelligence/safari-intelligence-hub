// ============================================================
// SAFARI V4 — AnimalProfilePage
// Push: Option A (standalone — integrate packages/ui tokens in Phase B)
// TODO: Replace inline T tokens with import from packages/ui
// TODO: Type props against packages/contracts interfaces
// ============================================================

import { useState, useEffect } from "react";

// ============================================================
// SAFARI V4 — Animal Profile Page
// Fix: PF-03 — Surface Wildlife Intelligence moat
// Design: Editorial/magazine × African geometric. Dark luxury.
// Stack: Next.js 14 / React / Tailwind tokens inline via style
// ============================================================

const SAFARI_TOKENS = {
  gold: "#C9A84C",
  goldLight: "#E8C96A",
  red: "#8B1A1A",
  green: "#2D5A27",
  black: "#1A1209",
  cream: "#F5F0E8",
  surface: "#221C10",
  surfaceHigh: "#2E2515",
  muted: "#7A6A4A",
};

// Mock animal data — replace with Supabase public.animals query
const MOCK_ANIMAL = {
  id: "lion-001",
  name: "Simba",
  species: "African Lion",
  swahili: "Simba wa Afrika",
  park: "Maasai Mara",
  parkSwahili: "Hifadhi ya Maasai Mara",
  zone: "Northern Conservancy",
  status: "Active",
  behavior: "Hunting",
  lastSeen: "2 hours ago",
  followers: 3847,
  age: "6 years",
  gender: "Male",
  pride: "Marsh Pride",
  conservationStatus: "Vulnerable",
  story: "Simba claimed leadership of the Marsh Pride three seasons ago after a contested challenge at the Mara River crossing. Known for his distinctive black mane and a notch on his left ear from a buffalo encounter in 2023. His territory spans 47 km² across the northern conservancy.",
  recentEvents: [
    { type: "hunt", label: "Successful hunt", zone: "Northern Plains", time: "2h ago", icon: "🦁" },
    { type: "migrate", label: "Crossed Mara River", zone: "River Crossing", time: "Yesterday", icon: "🌊" },
    { type: "rest", label: "Resting with pride", zone: "Acacia Grove", time: "2 days ago", icon: "🌿" },
    { type: "alert", label: "Territory marking", zone: "Eastern Boundary", time: "3 days ago", icon: "⚡" },
  ],
  stats: {
    sightings: 214,
    storiesGenerated: 48,
    rangerReports: 31,
    adoptions: 127,
  },
  trackingTier: "pro", // free | pro | elite
  zoneCoords: null, // abstracted — never raw GPS
};

// Maasai geometric SVG border pattern
function MaasaiPattern({ color = "#C9A84C", opacity = 0.15 }) {
  return (
    <svg width="100%" height="12" viewBox="0 0 200 12" preserveAspectRatio="xMidYMid slice" style={{ opacity }}>
      <defs>
        <pattern id="maasai" x="0" y="0" width="20" height="12" patternUnits="userSpaceOnUse">
          <polygon points="0,6 4,0 8,6 4,12" fill={color} />
          <polygon points="8,6 12,0 16,6 12,12" fill={color} />
          <rect x="16" y="4" width="4" height="4" fill={color} />
        </pattern>
      </defs>
      <rect width="100%" height="12" fill="url(#maasai)" />
    </svg>
  );
}

function BehaviorBadge({ behavior }) {
  const map = {
    Hunting: { color: "#8B1A1A", bg: "rgba(139,26,26,0.2)", dot: "#FF4444" },
    Resting: { color: "#2D5A27", bg: "rgba(45,90,39,0.2)", dot: "#4CAF50" },
    Migrating: { color: "#C9A84C", bg: "rgba(201,168,76,0.2)", dot: "#C9A84C" },
    Alert: { color: "#FF8C00", bg: "rgba(255,140,0,0.2)", dot: "#FF8C00" },
  };
  const style = map[behavior] || map["Resting"];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      background: style.bg, color: style.color,
      border: `1px solid ${style.color}`,
      borderRadius: 4, padding: "3px 10px", fontSize: 11,
      fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
    }}>
      <span style={{
        width: 6, height: 6, borderRadius: "50%",
        background: style.dot, boxShadow: `0 0 6px ${style.dot}`,
        animation: "pulse 2s infinite",
      }} />
      {behavior}
    </span>
  );
}

function StatCard({ label, value }) {
  return (
    <div style={{
      background: SAFARI_TOKENS.surfaceHigh,
      border: `1px solid rgba(201,168,76,0.1)`,
      borderRadius: 8, padding: "16px 20px", textAlign: "center",
      flex: 1, minWidth: 90,
    }}>
      <div style={{ fontSize: 26, fontWeight: 800, color: SAFARI_TOKENS.gold, fontFamily: "Georgia, serif" }}>
        {typeof value === "number" ? value.toLocaleString() : value}
      </div>
      <div style={{ fontSize: 10, color: SAFARI_TOKENS.muted, textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 4 }}>
        {label}
      </div>
    </div>
  );
}

function EventTimeline({ events }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {events.map((ev, i) => (
        <div key={i} style={{
          display: "flex", alignItems: "flex-start", gap: 14,
          padding: "12px 16px",
          background: i === 0 ? "rgba(201,168,76,0.06)" : "transparent",
          border: i === 0 ? `1px solid rgba(201,168,76,0.15)` : `1px solid rgba(255,255,255,0.04)`,
          borderRadius: 8,
        }}>
          <span style={{ fontSize: 20, lineHeight: 1.2 }}>{ev.icon}</span>
          <div style={{ flex: 1 }}>
            <div style={{ color: SAFARI_TOKENS.cream, fontSize: 13, fontWeight: 600 }}>{ev.label}</div>
            <div style={{ color: SAFARI_TOKENS.muted, fontSize: 11, marginTop: 2 }}>
              {ev.zone} · {ev.time}
            </div>
          </div>
          {i === 0 && (
            <span style={{
              fontSize: 10, color: SAFARI_TOKENS.gold, fontWeight: 700,
              textTransform: "uppercase", letterSpacing: "0.06em",
              background: "rgba(201,168,76,0.1)", padding: "2px 8px", borderRadius: 3,
            }}>Latest</span>
          )}
        </div>
      ))}
    </div>
  );
}

function TrackingMapPlaceholder({ tier }) {
  const isLocked = tier === "free";
  return (
    <div style={{
      position: "relative", height: 180, borderRadius: 10, overflow: "hidden",
      background: `linear-gradient(135deg, #1a2e1a 0%, #0d1a0d 100%)`,
      border: `1px solid rgba(45,90,39,0.3)`,
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      {/* Fake grid */}
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.2 }}>
        <defs>
          <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
            <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#2D5A27" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
      {/* Zone blob */}
      <div style={{
        position: "absolute", width: 90, height: 60,
        borderRadius: "60% 40% 50% 70%",
        background: "rgba(45,90,39,0.35)",
        border: "2px solid rgba(45,90,39,0.6)",
        top: "30%", left: "35%",
        filter: isLocked ? "blur(4px)" : "none",
      }} />
      {/* Animal dot */}
      {!isLocked && (
        <div style={{
          position: "absolute", top: "42%", left: "50%",
          width: 12, height: 12, borderRadius: "50%",
          background: SAFARI_TOKENS.gold,
          boxShadow: `0 0 20px ${SAFARI_TOKENS.gold}`,
          transform: "translate(-50%,-50%)",
        }} />
      )}
      {/* Zone label */}
      {!isLocked ? (
        <div style={{
          position: "absolute", bottom: 12, left: 14,
          color: SAFARI_TOKENS.gold, fontSize: 11, fontWeight: 600,
          background: "rgba(0,0,0,0.6)", padding: "3px 8px", borderRadius: 4,
        }}>
          📍 Northern Conservancy Zone · Updated 2h ago
        </div>
      ) : (
        <div style={{
          background: "rgba(26,18,9,0.85)", backdropFilter: "blur(8px)",
          borderRadius: 10, padding: "16px 24px", textAlign: "center",
          border: `1px solid rgba(201,168,76,0.2)`,
        }}>
          <div style={{ fontSize: 18, marginBottom: 6 }}>🔒</div>
          <div style={{ color: SAFARI_TOKENS.cream, fontSize: 13, fontWeight: 600 }}>Zone tracking locked</div>
          <div style={{ color: SAFARI_TOKENS.muted, fontSize: 11, marginTop: 4 }}>
            Upgrade to Simba Pro · KSh 1,200/mo
          </div>
        </div>
      )}
    </div>
  );
}

function FollowButton({ followers, followed, onToggle }) {
  return (
    <button
      onClick={onToggle}
      style={{
        display: "flex", alignItems: "center", gap: 8,
        background: followed ? SAFARI_TOKENS.gold : "transparent",
        color: followed ? SAFARI_TOKENS.black : SAFARI_TOKENS.gold,
        border: `2px solid ${SAFARI_TOKENS.gold}`,
        borderRadius: 6, padding: "10px 20px",
        fontWeight: 700, fontSize: 13, cursor: "pointer",
        transition: "all 0.2s ease", letterSpacing: "0.04em",
      }}
    >
      {followed ? "✓ Following" : "+ Follow"}
      <span style={{
        fontSize: 11, fontWeight: 500, opacity: 0.7,
        borderLeft: `1px solid ${followed ? "rgba(26,18,9,0.3)" : "rgba(201,168,76,0.3)"}`,
        paddingLeft: 8,
      }}>
        {(followers + (followed ? 1 : 0)).toLocaleString()}
      </span>
    </button>
  );
}

export default function AnimalProfilePage({ animal = MOCK_ANIMAL }) {
  const [followed, setFollowed] = useState(false);
  const [activeTab, setActiveTab] = useState("story");

  const tabs = ["story", "timeline", "zone", "adopt"];

  return (
    <div style={{
      minHeight: "100vh", background: SAFARI_TOKENS.black,
      fontFamily: "'Helvetica Neue', Arial, sans-serif",
      color: SAFARI_TOKENS.cream,
    }}>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:none} }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #1A1209; }
        ::-webkit-scrollbar-thumb { background: #C9A84C44; border-radius: 2px; }
      `}</style>

      {/* Header bar */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "16px 24px", borderBottom: `1px solid rgba(201,168,76,0.1)`,
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(26,18,9,0.95)", backdropFilter: "blur(12px)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 20 }}>🦁</span>
          <span style={{ color: SAFARI_TOKENS.gold, fontWeight: 800, fontSize: 16, letterSpacing: "0.06em" }}>
            SAFARI
          </span>
          <span style={{ color: SAFARI_TOKENS.muted, fontSize: 12 }}>/ Wildlife Intelligence</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{
            fontSize: 10, color: SAFARI_TOKENS.gold, fontWeight: 700,
            textTransform: "uppercase", letterSpacing: "0.1em",
            background: "rgba(201,168,76,0.1)", padding: "3px 8px", borderRadius: 3,
          }}>Ranger Validated</span>
        </div>
      </div>

      {/* Hero section */}
      <div style={{
        background: `linear-gradient(180deg, #2A1F08 0%, ${SAFARI_TOKENS.black} 100%)`,
        padding: "40px 24px 32px",
        animation: "fadeUp 0.5s ease",
      }}>
        {/* Species + conservation status */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <span style={{
            fontSize: 10, color: SAFARI_TOKENS.red, fontWeight: 700,
            textTransform: "uppercase", letterSpacing: "0.1em",
            background: "rgba(139,26,26,0.15)", border: `1px solid rgba(139,26,26,0.3)`,
            padding: "3px 8px", borderRadius: 3,
          }}>
            ⚠ {animal.conservationStatus}
          </span>
          <span style={{ color: SAFARI_TOKENS.muted, fontSize: 11 }}>
            {animal.swahili}
          </span>
        </div>

        {/* Name */}
        <h1 style={{
          fontSize: 48, fontWeight: 900, color: SAFARI_TOKENS.cream,
          fontFamily: "Georgia, 'Times New Roman', serif",
          lineHeight: 1.05, marginBottom: 6,
          textShadow: `0 2px 40px rgba(201,168,76,0.15)`,
        }}>
          {animal.name}
        </h1>
        <div style={{ color: SAFARI_TOKENS.muted, fontSize: 14, marginBottom: 20 }}>
          {animal.species} · {animal.pride} · {animal.parkSwahili}
        </div>

        {/* Behavior + follow row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <BehaviorBadge behavior={animal.behavior} />
          <FollowButton followers={animal.followers} followed={followed} onToggle={() => setFollowed(f => !f)} />
        </div>

        {/* Maasai divider */}
        <div style={{ marginTop: 28 }}>
          <MaasaiPattern color={SAFARI_TOKENS.gold} opacity={0.25} />
        </div>
      </div>

      {/* Stats row */}
      <div style={{ padding: "0 24px", marginTop: -1 }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <StatCard label="Sightings" value={animal.stats.sightings} />
          <StatCard label="Stories" value={animal.stats.storiesGenerated} />
          <StatCard label="Ranger Reports" value={animal.stats.rangerReports} />
          <StatCard label="Adoptions" value={animal.stats.adoptions} />
        </div>
      </div>

      {/* Quick facts strip */}
      <div style={{
        display: "flex", gap: 0, margin: "20px 24px 0",
        background: SAFARI_TOKENS.surfaceHigh,
        borderRadius: 8, overflow: "hidden",
        border: `1px solid rgba(201,168,76,0.1)`,
      }}>
        {[
          { label: "Age", value: animal.age },
          { label: "Gender", value: animal.gender },
          { label: "Park", value: animal.park },
          { label: "Last Seen", value: animal.lastSeen },
        ].map((f, i) => (
          <div key={i} style={{
            flex: 1, padding: "12px 14px", textAlign: "center",
            borderRight: i < 3 ? `1px solid rgba(201,168,76,0.08)` : "none",
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: SAFARI_TOKENS.cream }}>{f.value}</div>
            <div style={{ fontSize: 10, color: SAFARI_TOKENS.muted, marginTop: 2, textTransform: "uppercase", letterSpacing: "0.06em" }}>{f.label}</div>
          </div>
        ))}
      </div>

      {/* Tab nav */}
      <div style={{
        display: "flex", gap: 0, margin: "24px 24px 0",
        borderBottom: `1px solid rgba(201,168,76,0.1)`,
      }}>
        {tabs.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            flex: 1, padding: "10px 4px",
            background: "none", border: "none", cursor: "pointer",
            fontSize: 12, fontWeight: 700, letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: activeTab === tab ? SAFARI_TOKENS.gold : SAFARI_TOKENS.muted,
            borderBottom: activeTab === tab ? `2px solid ${SAFARI_TOKENS.gold}` : "2px solid transparent",
            transition: "all 0.15s ease",
          }}>
            {tab === "adopt" ? "Adopt 🐾" : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{ padding: "24px", animation: "fadeUp 0.3s ease" }}>

        {activeTab === "story" && (
          <div>
            <div style={{
              fontSize: 11, color: SAFARI_TOKENS.gold, fontWeight: 700,
              textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 14,
            }}>Wildlife Story · AI-Generated from Ranger Reports</div>
            <p style={{
              lineHeight: 1.75, color: SAFARI_TOKENS.cream, fontSize: 15,
              fontFamily: "Georgia, serif",
              borderLeft: `3px solid ${SAFARI_TOKENS.gold}`,
              paddingLeft: 16,
            }}>
              {animal.story}
            </p>
            <div style={{
              marginTop: 20, padding: "12px 16px",
              background: "rgba(45,90,39,0.1)", borderRadius: 8,
              border: `1px solid rgba(45,90,39,0.2)`,
              fontSize: 12, color: SAFARI_TOKENS.muted,
            }}>
              🌿 <strong style={{ color: SAFARI_TOKENS.green }}>Conservation note:</strong> Following Simba funds
              Marsh Pride monitoring. KSh 240 contributed this month by followers.
            </div>
          </div>
        )}

        {activeTab === "timeline" && (
          <div>
            <div style={{
              fontSize: 11, color: SAFARI_TOKENS.gold, fontWeight: 700,
              textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 14,
            }}>Recent Activity · Ranger Validated</div>
            <EventTimeline events={animal.recentEvents} />
          </div>
        )}

        {activeTab === "zone" && (
          <div>
            <div style={{
              fontSize: 11, color: SAFARI_TOKENS.gold, fontWeight: 700,
              textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 14,
            }}>Zone Tracking · 2-Hour Delay Enforced</div>
            <TrackingMapPlaceholder tier={animal.trackingTier} />
            <div style={{ marginTop: 14, fontSize: 11, color: SAFARI_TOKENS.muted, lineHeight: 1.6 }}>
              Zone locations are generalized for wildlife safety. Exact GPS coordinates are never exposed.
              Real-time updates available on <strong style={{ color: SAFARI_TOKENS.gold }}>Simba Pro</strong>.
            </div>
          </div>
        )}

        {activeTab === "adopt" && (
          <div>
            <div style={{
              fontSize: 11, color: SAFARI_TOKENS.gold, fontWeight: 700,
              textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 14,
            }}>Adopt Simba · Support the Marsh Pride</div>
            {[
              { tier: "Supporter", price: "KSh 500/mo", perks: "Monthly story update + Simba Points", highlight: false },
              { tier: "Guardian", price: "KSh 1,500/mo", perks: "Weekly updates + zone access + adoption certificate", highlight: true },
              { tier: "Pride Partner", price: "KSh 4,000/mo", perks: "All Guardian + ranger field notes + quarterly report", highlight: false },
            ].map((opt, i) => (
              <div key={i} style={{
                padding: "18px 20px", borderRadius: 8, marginBottom: 10,
                background: opt.highlight ? `rgba(201,168,76,0.08)` : SAFARI_TOKENS.surfaceHigh,
                border: opt.highlight ? `2px solid ${SAFARI_TOKENS.gold}` : `1px solid rgba(255,255,255,0.06)`,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontWeight: 700, color: opt.highlight ? SAFARI_TOKENS.gold : SAFARI_TOKENS.cream, fontSize: 14 }}>
                      {opt.tier} {opt.highlight && "⭐"}
                    </div>
                    <div style={{ fontSize: 11, color: SAFARI_TOKENS.muted, marginTop: 4 }}>{opt.perks}</div>
                  </div>
                  <div style={{
                    fontWeight: 800, color: SAFARI_TOKENS.gold, fontSize: 14,
                    whiteSpace: "nowrap", marginLeft: 12,
                  }}>{opt.price}</div>
                </div>
              </div>
            ))}
            <button style={{
              width: "100%", padding: "14px", marginTop: 8,
              background: SAFARI_TOKENS.gold, color: SAFARI_TOKENS.black,
              border: "none", borderRadius: 8, fontWeight: 800, fontSize: 14,
              cursor: "pointer", letterSpacing: "0.04em",
            }}>
              Adopt Simba — Guardian · KSh 1,500/mo
            </button>
          </div>
        )}
      </div>

      {/* Simba Points nudge */}
      {followed && (
        <div style={{
          margin: "0 24px 32px",
          padding: "14px 18px",
          background: "rgba(201,168,76,0.08)",
          border: `1px solid rgba(201,168,76,0.2)`,
          borderRadius: 8,
          display: "flex", alignItems: "center", gap: 12,
          animation: "fadeUp 0.3s ease",
        }}>
          <span style={{ fontSize: 24 }}>🏆</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: SAFARI_TOKENS.gold }}>+50 Simba Points earned</div>
            <div style={{ fontSize: 11, color: SAFARI_TOKENS.muted, marginTop: 2 }}>
              You now follow Simba. You'll get story updates when rangers report new activity.
            </div>
          </div>
        </div>
      )}

      {/* Bottom Maasai strip */}
      <div style={{ padding: "0 0 32px" }}>
        <MaasaiPattern color={SAFARI_TOKENS.gold} opacity={0.12} />
      </div>
    </div>
  );
}
