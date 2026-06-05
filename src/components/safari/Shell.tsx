import { Link, useLocation } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Menu, X, Globe, LogIn, LogOut, Shield, Building2,
  User as UserIcon, Sun, Moon, ChevronDown, Wallet, BookMarked, Coins,
} from "lucide-react";
import { SafariIcon, type IconName } from "@/components/icons";
import { MaasaiDivider } from "./MaasaiDivider";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/hooks/use-theme";
import lionLogo from "@/assets/safari-lion-logo.jpg";

const navLinks = [
  { to: "/", label: "Explorer", sw: "Tazama" },
  { to: "/plan", label: "Plan AI", sw: "Panga" },
  { to: "/wildlife", label: "Wildlife", sw: "Wanyama" },
  { to: "/book", label: "Book", sw: "Hifadhi" },
] as const;

const drawerLinks = [
  { to: "/hotels", label: "Hotels" },
  { to: "/stories", label: "Stories" },
  { to: "/wildlife", label: "Big Five Tracker" },
  { to: "/map", label: "Interactive Map" },
  { to: "/expansion", label: "About SAFARI" },
  { to: "/support", label: "Contact" },
] as const;

const footerLinks = [
  { to: "/hotels", label: "Hotels" },
  { to: "/stories", label: "Stories" },
  { to: "/wildlife", label: "Big Five" },
  { to: "/map", label: "Map" },
] as const;

const mobileTabs: ReadonlyArray<{ to: string; label: string; icon: IconName }> = [
  { to: "/", label: "Home", icon: "home" },
  { to: "/plan", label: "Plan", icon: "ai" },
  { to: "/wildlife", label: "Wild", icon: "explore" },
  { to: "/book", label: "Stay", icon: "tent" },
  { to: "/profile", label: "Me", icon: "profile" },
] as const;

const NAV_BG = "#1A3C2E";
const NAV_ACCENT = "#C9922A";

export function Shell({ children }: { children: React.ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [acctOpen, setAcctOpen] = useState(false);
  const [lang, setLang] = useState<"EN" | "SW">("EN");
  const [points, setPoints] = useState(0);
  const location = useLocation();
  const { user, primaryRole, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const read = () => {
      const stored = typeof window !== "undefined" ? localStorage.getItem("simba_points") : null;
      setPoints(stored ? parseInt(stored, 10) || 0 : 6420);
    };
    read();
    const onStorage = (e: StorageEvent) => { if (e.key === "simba_points") read(); };
    window.addEventListener("storage", onStorage);
    const i = setInterval(read, 1500);
    return () => { window.removeEventListener("storage", onStorage); clearInterval(i); };
  }, []);

  // close menus on route change
  useEffect(() => {
    setDrawerOpen(false);
    setAcctOpen(false);
  }, [location.pathname]);

  const terminalLink =
    primaryRole === "support"
      ? { to: "/support", label: "Support", icon: Shield }
      : primaryRole === "hotel"
      ? { to: "/partner", label: "Partner", icon: Building2 }
      : null;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50">
        <nav
          className="flex items-center justify-between px-4 sm:px-8 py-3 text-white shadow-md"
          style={{ background: NAV_BG }}
        >
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="h-9 w-9 overflow-hidden rounded-xl bg-[#0D0D0D] ring-1 ring-white/20">
              <img src={lionLogo} alt="SAFARI" className="h-full w-full object-cover" />
            </div>
            <div className="leading-none">
              <div className="font-display text-lg font-bold tracking-tight">SAFARI</div>
              <div className="font-label text-[10px] text-white/60">Karibu · East Africa</div>
            </div>
          </Link>

          <ul className="hidden lg:flex items-center gap-1">
            {navLinks.map((l) => {
              const active = location.pathname === l.to;
              return (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    className="px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                    style={
                      active
                        ? { background: NAV_ACCENT, color: "#0D0D0D" }
                        : { color: "rgba(255,255,255,0.85)" }
                    }
                    onMouseEnter={(e) => {
                      if (!active) e.currentTarget.style.color = NAV_ACCENT;
                    }}
                    onMouseLeave={(e) => {
                      if (!active) e.currentTarget.style.color = "rgba(255,255,255,0.85)";
                    }}
                  >
                    {lang === "EN" ? l.label : l.sw}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="hidden sm:grid h-9 w-9 place-items-center rounded-lg border border-white/15 hover:border-white/40 transition"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button
              onClick={() => setLang(lang === "EN" ? "SW" : "EN")}
              className="hidden sm:flex items-center gap-1.5 px-2.5 h-9 rounded-lg border border-white/15 text-xs font-medium hover:border-white/40 transition"
            >
              <Globe className="h-3.5 w-3.5" /> {lang}
            </button>
            {terminalLink && (
              <Link
                to={terminalLink.to}
                className="hidden md:flex items-center gap-1.5 px-3 h-9 rounded-lg text-xs font-semibold border border-white/20 hover:border-white/50"
              >
                <terminalLink.icon className="h-3.5 w-3.5" />
                {terminalLink.label}
              </Link>
            )}

            {user && (
              <Link
                to="/simba"
                title={`${points.toLocaleString()} Simba Points`}
                className="hidden sm:flex items-center gap-1.5 px-2.5 h-9 rounded-lg border border-white/15 hover:border-white/40 transition text-xs font-semibold tabular-nums"
                style={{ color: NAV_ACCENT }}
              >
                <Coins className="h-3.5 w-3.5" />
                {points.toLocaleString()}
                <span className="text-[10px] font-medium text-white/60 ml-0.5">pts</span>
              </Link>
            )}

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setAcctOpen((v) => !v)}
                  className="hidden sm:flex items-center gap-1.5 px-3 h-9 rounded-lg text-sm font-semibold"
                  style={{ background: NAV_ACCENT, color: "#0D0D0D" }}
                >
                  <UserIcon className="h-3.5 w-3.5" />
                  My Account
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
                {acctOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setAcctOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-52 rounded-xl bg-background text-foreground border border-border/60 shadow-xl z-50 overflow-hidden">
                      <Link
                        to="/wallet"
                        className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-foreground/5"
                      >
                        <Wallet className="h-4 w-4 text-[var(--gold)]" /> Wallet
                      </Link>
                      <Link
                        to="/pay/bookings"
                        className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-foreground/5"
                      >
                        <BookMarked className="h-4 w-4 text-[var(--maasai)]" /> My Bookings
                      </Link>
                      <Link
                        to="/profile"
                        className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-foreground/5"
                      >
                        <UserIcon className="h-4 w-4" /> Profile
                      </Link>
                      <div className="h-px bg-border/60" />
                      <button
                        onClick={() => { setAcctOpen(false); signOut(); }}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-foreground/5 text-left"
                      >
                        <LogOut className="h-4 w-4" /> Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link
                to="/auth"
                className="hidden sm:flex items-center gap-1.5 px-4 h-9 rounded-lg text-sm font-bold"
                style={{ background: NAV_ACCENT, color: "#0D0D0D" }}
              >
                <LogIn className="h-3.5 w-3.5" /> Sign In
              </Link>
            )}

            <button
              onClick={() => setDrawerOpen(true)}
              className="grid h-9 w-9 place-items-center rounded-lg border border-white/15 hover:border-white/40 transition"
              aria-label="Open menu"
            >
              <Menu className="h-4 w-4" />
            </button>
          </div>
        </nav>
      </header>

      {/* Right-side drawer */}
      {drawerOpen && (
        <>
          <div
            className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm animate-fade-in"
            onClick={() => setDrawerOpen(false)}
          />
          <aside
            className="fixed top-0 right-0 bottom-0 z-[70] w-72 max-w-[85vw] bg-background border-l border-border/60 shadow-2xl animate-slide-in-right"
          >
            <div
              className="flex items-center justify-between px-5 py-4 text-white"
              style={{ background: NAV_BG }}
            >
              <span className="font-display text-lg font-bold">Menu</span>
              <button
                onClick={() => setDrawerOpen(false)}
                className="grid h-9 w-9 place-items-center rounded-lg hover:bg-white/10"
                aria-label="Close menu"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <nav className="p-3">
              <ul className="space-y-1">
                {drawerLinks.map((l) => (
                  <li key={l.to}>
                    <Link
                      to={l.to}
                      className="block px-4 py-3 rounded-lg text-sm font-medium hover:bg-foreground/5"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="mt-4 pt-4 border-t border-border/60 space-y-1 lg:hidden">
                {navLinks.map((l) => (
                  <Link
                    key={l.to}
                    to={l.to}
                    className="block px-4 py-2.5 rounded-lg text-sm hover:bg-foreground/5"
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            </nav>
          </aside>
        </>
      )}

      <main className="flex-1 px-3 py-6 sm:px-6 sm:py-10 pb-24 md:pb-10">{children}</main>

      <footer className="px-3 pb-6 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <MaasaiDivider className="mb-6" />
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
            <p>
              <span className="font-display text-foreground">SAFARI</span> · Built in
              Nairobi · Powered by Wildlife Intelligence™
            </p>
            <ul className="flex flex-wrap items-center gap-4">
              {footerLinks.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="hover:text-foreground transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <p className="mt-3 text-center text-[11px] italic text-muted-foreground">
            "Haraka haraka haina baraka" — Hurry, hurry has no blessing.
          </p>
        </div>
      </footer>

      {/* Mobile tab bar */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 px-3 pb-3">
        <div className="glass-strong rounded-2xl px-2 py-1.5 flex items-center justify-between">
          {mobileTabs.map((t) => {
            const active = location.pathname === t.to;
            return (
              <Link
                key={t.to}
                to={t.to}
                className={`flex-1 flex flex-col items-center gap-0.5 py-1.5 rounded-xl transition-all ${
                  active ? "scale-105" : "text-muted-foreground"
                }`}
                style={active ? { background: `${NAV_ACCENT}26` } : undefined}
              >
                <SafariIcon name={t.icon} size={20} tone={active ? "active" : "muted"} />
                <span className={`text-[10px] font-medium ${active ? "text-foreground" : ""}`}>
                  {t.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
