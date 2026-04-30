import { Link, useLocation } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Menu, X, Globe, LogIn, LogOut, Shield, Building2,
  Home, Sparkles, Compass, BedDouble, User as UserIcon,
  Sun, Moon,
} from "lucide-react";
import { MaasaiDivider } from "./MaasaiDivider";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/hooks/use-theme";
import lionLogo from "@/assets/safari-lion-logo.jpg";

const navLinks = [
  { to: "/", label: "Explorer", sw: "Tazama" },
  { to: "/plan", label: "Plan AI", sw: "Panga" },
  { to: "/hotels", label: "Hotels", sw: "Hoteli" },
  { to: "/stories", label: "Big Five", sw: "Wanyama" },
  { to: "/wildlife", label: "Wildlife", sw: "Tracker" },
  { to: "/map", label: "Map", sw: "Ramani" },
  { to: "/book", label: "Book", sw: "Hifadhi" },
  { to: "/simba", label: "Simba", sw: "Simba" },
  { to: "/expansion", label: "Expansion", sw: "Ukuzaji" },
] as const;

const mobileTabs = [
  { to: "/", label: "Home", icon: Home },
  { to: "/plan", label: "Plan", icon: Sparkles },
  { to: "/wildlife", label: "Wild", icon: Compass },
  { to: "/hotels", label: "Stay", icon: BedDouble },
  { to: "/profile", label: "Me", icon: UserIcon },
] as const;

export function Shell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState<"EN" | "SW">("EN");
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { user, primaryRole, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const terminalLink =
    primaryRole === "support"
      ? { to: "/support", label: "Support", icon: Shield }
      : primaryRole === "hotel"
      ? { to: "/partner", label: "Partner", icon: Building2 }
      : null;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 px-3 pt-3 sm:px-6 sm:pt-5">
        <nav
          className={`mx-auto flex max-w-7xl items-center justify-between rounded-2xl px-4 py-3 sm:px-6 transition-all ${
            scrolled ? "glass-strong" : "glass"
          }`}
        >
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="h-9 w-9 overflow-hidden rounded-xl bg-[#0D0D0D] shadow-[var(--shadow-glow-gold)] ring-1 ring-[var(--gold)]/30">
              <img src={lionLogo} alt="Safari OS lion logo" className="h-full w-full object-cover" />
            </div>
            <div className="leading-none">
              <div className="font-display text-lg font-bold tracking-tight">Safari OS</div>
              <div className="font-label text-[10px] text-muted-foreground">
                Karibu · East Africa
              </div>
            </div>
          </Link>

          <ul className="hidden xl:flex items-center gap-0.5">
            {navLinks.map((l) => {
              const active = location.pathname === l.to;
              return (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                      active
                        ? "bg-[var(--gold)]/15 text-foreground font-semibold"
                        : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
                    }`}
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
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-border/60 hover:bg-foreground/5 transition"
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
              title={theme === "dark" ? "Light mode" : "Dark mode"}
            >
              {theme === "dark" ? (
                <Sun className="h-3.5 w-3.5 text-[var(--gold)]" />
              ) : (
                <Moon className="h-3.5 w-3.5" />
              )}
            </button>
            <button
              onClick={() => setLang(lang === "EN" ? "SW" : "EN")}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-border/60 hover:bg-foreground/5 transition"
            >
              <Globe className="h-3.5 w-3.5" />
              {lang}
            </button>
            {terminalLink && (
              <Link
                to={terminalLink.to}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-[var(--forest)]/40 text-[var(--forest)] hover:bg-[var(--forest)]/10"
              >
                <terminalLink.icon className="h-3.5 w-3.5" />
                {terminalLink.label}
              </Link>
            )}
            {user ? (
              <>
                <Link
                  to="/profile"
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-border/60 hover:bg-foreground/5"
                >
                  <UserIcon className="h-3.5 w-3.5" />
                  Profile
                </Link>
                <button
                  onClick={() => signOut()}
                  className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-border/60 hover:bg-foreground/5"
                  title="Sign out"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </>
            ) : (
              <Link
                to="/auth"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-[var(--gold)] to-[var(--maasai)] text-white text-xs font-bold shadow-[var(--shadow-glow-gold)]"
              >
                <LogIn className="h-3.5 w-3.5" />
                Sign in
              </Link>
            )}
            <button
              onClick={() => setOpen(!open)}
              className="xl:hidden md:grid hidden h-9 w-9 place-items-center rounded-lg border border-border/60"
              aria-label="Menu"
            >
              {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </nav>

        {open && (
          <div className="xl:hidden md:block hidden glass-strong mx-auto mt-2 max-w-7xl rounded-2xl p-3">
            <ul className="grid grid-cols-2 gap-1.5">
              {navLinks.map((l) => {
                const active = location.pathname === l.to;
                return (
                  <li key={l.to}>
                    <Link
                      to={l.to}
                      onClick={() => setOpen(false)}
                      className={`block px-3 py-2 rounded-lg text-sm ${
                        active
                          ? "bg-[var(--gold)]/15 font-semibold"
                          : "hover:bg-foreground/5"
                      }`}
                    >
                      {lang === "EN" ? l.label : l.sw}
                    </Link>
                  </li>
                );
              })}
              {terminalLink && (
                <li>
                  <Link
                    to={terminalLink.to}
                    onClick={() => setOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm bg-[var(--forest)]/15 text-[var(--forest)] font-semibold"
                  >
                    {terminalLink.label} terminal
                  </Link>
                </li>
              )}
            </ul>
          </div>
        )}
      </header>

      <main className="flex-1 px-3 py-6 sm:px-6 sm:py-10">{children}</main>

      <footer className="px-3 pb-6 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <MaasaiDivider className="mb-6" />
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
            <p>
              <span className="font-display text-foreground">Safari OS</span> · Built in
              Nairobi · Powered by Wildlife Intelligence™
            </p>
            <p className="italic">"Haraka haraka haina baraka" — Hurry, hurry has no blessing.</p>
          </div>
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
                  active ? "bg-[var(--gold)]/15 scale-105" : "text-muted-foreground"
                }`}
              >
                <t.icon
                  className={`h-[18px] w-[18px] ${active ? "text-[var(--gold)]" : ""}`}
                />
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
