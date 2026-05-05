import { Link, Outlet, useLocation } from "@tanstack/react-router";
import { Wallet, Compass, Receipt, LayoutDashboard, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";

const nav = [
  { to: "/pay", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/pay/wallet", label: "Wallet", icon: Wallet },
  { to: "/pay/trips", label: "Trips", icon: Compass },
  { to: "/pay/bookings", label: "Bookings", icon: Receipt },
];

export function PayShell({ children }: { children?: ReactNode }) {
  const { pathname } = useLocation();
  const isActive = (to: string, exact?: boolean) =>
    exact ? pathname === to : pathname === to || pathname.startsWith(to + "/");

  return (
    <div
      className="min-h-screen"
      style={{
        background: "#F7F4EF",
        fontFamily: "'Inter', system-ui, sans-serif",
        color: "#111714",
      }}
    >
      <header
        className="sticky top-0 z-30 border-b backdrop-blur-md"
        style={{ background: "rgba(247,244,239,0.85)", borderColor: "rgba(26,60,46,0.12)" }}
      >
        <div className="max-w-7xl mx-auto px-5 h-16 flex items-center justify-between">
          <Link to="/pay" className="flex items-center gap-2.5">
            <div
              className="h-9 w-9 rounded-lg grid place-items-center"
              style={{ background: "#1A3C2E", color: "#C9922A" }}
            >
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="leading-tight">
              <div
                className="text-[15px] font-semibold tracking-tight"
                style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20 }}
              >
                SAFARI Pay
              </div>
              <div className="text-[10.5px] uppercase tracking-[0.18em] text-stone-500">
                One Country · Every World
              </div>
            </div>
          </Link>
          <Link
            to="/hotels"
            className="text-xs font-medium px-3 py-1.5 rounded-md border hover:bg-white transition"
            style={{ borderColor: "rgba(26,60,46,0.18)" }}
          >
            ← Back to SAFARI
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-5 py-8 grid lg:grid-cols-[220px_1fr] gap-8">
        <aside className="hidden lg:block">
          <nav className="space-y-1 sticky top-24">
            {nav.map((item) => {
              const active = isActive(item.to, item.exact);
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13.5px] transition"
                  style={{
                    background: active ? "#1A3C2E" : "transparent",
                    color: active ? "#F7F4EF" : "#3a3a36",
                    fontWeight: active ? 600 : 500,
                  }}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
            <div
              className="mt-6 p-3.5 rounded-lg border text-[12px] leading-relaxed"
              style={{ borderColor: "rgba(201,146,42,0.35)", background: "rgba(201,146,42,0.08)" }}
            >
              <div className="font-semibold text-[#1A3C2E] mb-1">Funds held safely</div>
              <span className="text-stone-600">
                Trip balances are escrowed until your adventure begins.
              </span>
            </div>
          </nav>
        </aside>

        <main className="min-w-0">{children ?? <Outlet />}</main>
      </div>

      {/* Mobile bottom tabs */}
      <nav
        className="lg:hidden fixed bottom-0 inset-x-0 border-t z-30 grid grid-cols-4"
        style={{ background: "rgba(247,244,239,0.96)", borderColor: "rgba(26,60,46,0.15)", backdropFilter: "blur(8px)" }}
      >
        {nav.map((item) => {
          const active = isActive(item.to, item.exact);
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className="flex flex-col items-center justify-center py-2 gap-0.5 text-[10.5px]"
              style={{ color: active ? "#1A3C2E" : "#7c7c75", fontWeight: active ? 600 : 500 }}
            >
              <Icon className="h-4.5 w-4.5" style={{ width: 18, height: 18 }} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="lg:hidden h-16" />
    </div>
  );
}
