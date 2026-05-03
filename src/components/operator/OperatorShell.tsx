import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  CalendarCheck,
  Building2,
  Compass,
  Wallet,
  BarChart3,
  Settings,
  MoreHorizontal,
} from "lucide-react";
import { operator } from "@/lib/operator-data";

const mainNav = [
  { to: "/operator", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/operator/bookings", label: "Bookings", icon: CalendarCheck, dot: true },
  { to: "/operator/listings", label: "Listings", icon: Building2 },
  { to: "/operator/wildlife", label: "Wildlife Intel", icon: Compass },
] as const;

const accountNav = [
  { to: "/operator/payouts", label: "Payouts", icon: Wallet },
  { to: "/operator/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/operator/settings", label: "Settings", icon: Settings },
] as const;

const mobileTabs = [
  { to: "/operator", label: "Home", icon: LayoutDashboard, exact: true },
  { to: "/operator/bookings", label: "Bookings", icon: CalendarCheck },
  { to: "/operator/listings", label: "Listings", icon: Building2 },
  { to: "/operator/wildlife", label: "Wildlife", icon: Compass },
  { to: "/operator/settings", label: "More", icon: MoreHorizontal },
] as const;

function NavLink({
  to,
  label,
  Icon,
  active,
  dot,
  collapsed,
}: {
  to: string;
  label: string;
  Icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
  active: boolean;
  dot?: boolean;
  collapsed?: boolean;
}) {
  return (
    <Link to={to} className={`op-side-link ${active ? "active" : ""}`} title={collapsed ? label : undefined}>
      <Icon size={15} strokeWidth={1.6} />
      {!collapsed && <span style={{ flex: 1 }}>{label}</span>}
      {!collapsed && dot && (
        <span style={{ width: 6, height: 6, borderRadius: 999, background: "var(--op-gold)" }} />
      )}
    </Link>
  );
}

export function OperatorShell({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isActive = (to: string, exact?: boolean) =>
    exact ? pathname === to : pathname === to || pathname.startsWith(to + "/");

  return (
    <div className="op-scope" style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Topbar */}
      <header
        style={{
          height: 48,
          background: "var(--op-night)",
          color: "#e8dfcf",
          display: "flex",
          alignItems: "center",
          padding: "0 16px",
          gap: 14,
          flexShrink: 0,
        }}
      >
        <span className="op-wordmark">SAFARI</span>
        <span style={{ width: 1, height: 16, background: "rgba(255,255,255,0.15)" }} />
        <span style={{ fontSize: 11, color: "#a89980", letterSpacing: "0.04em" }}>Operator Portal</span>

        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
          <span
            className="op-pill op-pill-live"
            style={{ background: "rgba(45,90,39,0.25)", color: "#a8d3a0" }}
          >
            <span
              style={{
                width: 6, height: 6, borderRadius: 999, background: "#5ec77d", marginRight: 6,
                boxShadow: "0 0 0 3px rgba(94,199,125,0.18)",
              }}
            />
            Live
          </span>
          <span style={{ fontSize: 12, color: "#e8dfcf" }} className="op-hide-mobile">
            {operator.businessName}
          </span>
          <span
            style={{
              width: 28, height: 28, borderRadius: 999, background: "var(--op-gold)",
              color: "var(--op-night)", display: "grid", placeItems: "center",
              fontSize: 11, fontWeight: 600,
            }}
          >
            {operator.initials}
          </span>
        </div>
      </header>

      {/* Body */}
      <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
        {/* Sidebar (desktop + tablet rail) */}
        <aside className="op-sidebar">
          <nav style={{ padding: "8px 0", flex: 1, overflowY: "auto" }}>
            <div className="op-side-section op-hide-rail">Main</div>
            {mainNav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                label={item.label}
                Icon={item.icon}
                active={isActive(item.to, (item as { exact?: boolean }).exact)}
                dot={(item as { dot?: boolean }).dot}
              />
            ))}
            <div className="op-side-section op-hide-rail" style={{ marginTop: 8 }}>Account</div>
            {accountNav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                label={item.label}
                Icon={item.icon}
                active={isActive(item.to)}
              />
            ))}
          </nav>
          <div
            className="op-hide-rail"
            style={{
              borderTop: "0.5px solid var(--op-border)",
              padding: 12,
              fontSize: 11,
              color: "var(--op-muted)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span>
                Plan: <strong style={{ color: "var(--op-night)" }}>Operator {operator.plan}</strong>
              </span>
              <Link to="/operator/settings" className="op-link">
                Manage
              </Link>
            </div>
            <div style={{ marginTop: 6, fontSize: 10 }}>Next billing {operator.nextBillingDate}</div>
          </div>
        </aside>

        {/* Main */}
        <main
          style={{
            flex: 1,
            background: "var(--op-bg)",
            padding: 20,
            overflowY: "auto",
            paddingBottom: 80, // space for mobile bottom tabs
          }}
        >
          {children}
        </main>
      </div>

      {/* Mobile bottom tabs */}
      <nav className="op-bottom-nav">
        {mobileTabs.map((t) => {
          const active = isActive(t.to, (t as { exact?: boolean }).exact);
          const Icon = t.icon;
          return (
            <Link
              key={t.to}
              to={t.to}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
                padding: "8px 0",
                fontSize: 10,
                textDecoration: "none",
                color: active ? "var(--op-green)" : "var(--op-muted)",
                fontWeight: active ? 500 : 400,
              }}
            >
              <Icon size={18} strokeWidth={1.6} />
              <span>{t.label}</span>
            </Link>
          );
        })}
      </nav>

      <style>{`
        .op-sidebar {
          width: 180px; flex-shrink: 0;
          background: #fff; border-right: 0.5px solid var(--op-border);
          display: flex; flex-direction: column;
        }
        @media (max-width: 1023px) {
          .op-sidebar { width: 48px; }
          .op-hide-rail { display: none; }
          .op-side-link { justify-content: center; padding: 10px 8px; }
        }
        @media (max-width: 767px) {
          .op-sidebar { display: none; }
          .op-hide-mobile { display: none; }
        }
        .op-bottom-nav {
          display: none;
          position: fixed; bottom: 0; left: 0; right: 0;
          background: #fff; border-top: 0.5px solid var(--op-border);
          z-index: 30;
        }
        @media (max-width: 767px) { .op-bottom-nav { display: flex; } }
      `}</style>
    </div>
  );
}
