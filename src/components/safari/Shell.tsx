import { Link, useLocation } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X, Sparkles, Globe } from "lucide-react";
import { MaasaiDivider } from "./MaasaiDivider";

const navLinks = [
  { to: "/", label: "Explorer", sw: "Tazama" },
  { to: "/wildlife", label: "Wildlife Feed", sw: "Wanyama" },
  { to: "/book", label: "Book", sw: "Hifadhi" },
  { to: "/simba", label: "Simba Points", sw: "Simba" },
  { to: "/operators", label: "Operators", sw: "Waongoza" },
  { to: "/intelligence", label: "Intelligence", sw: "Akili" },
  { to: "/expansion", label: "Expansion", sw: "Ukuzaji" },
] as const;

export function Shell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState<"EN" | "SW">("EN");
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 px-3 pt-3 sm:px-6 sm:pt-5">
        <nav className="glass-strong mx-auto flex max-w-7xl items-center justify-between rounded-2xl px-4 py-3 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-[var(--gold)] to-[var(--maasai)] shadow-[var(--shadow-glow-gold)]">
              <span className="text-lg">🦁</span>
            </div>
            <div className="leading-none">
              <div className="font-display text-lg font-bold tracking-tight">Safari OS</div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Karibu · East Africa
              </div>
            </div>
          </Link>

          <ul className="hidden xl:flex items-center gap-1">
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
              onClick={() => setLang(lang === "EN" ? "SW" : "EN")}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-border/60 hover:bg-foreground/5 transition"
            >
              <Globe className="h-3.5 w-3.5" />
              {lang}
            </button>
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-[var(--gold)] to-[var(--maasai)] text-white text-xs font-bold shadow-[var(--shadow-glow-gold)]">
              <Sparkles className="h-3.5 w-3.5" />
              6,420 Simba
            </div>
            <button
              onClick={() => setOpen(!open)}
              className="xl:hidden grid h-9 w-9 place-items-center rounded-lg border border-border/60"
              aria-label="Menu"
            >
              {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </nav>

        {open && (
          <div className="xl:hidden glass-strong mx-auto mt-2 max-w-7xl rounded-2xl p-3">
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
            </ul>
            <div className="mt-3 flex items-center justify-between px-2">
              <button
                onClick={() => setLang(lang === "EN" ? "SW" : "EN")}
                className="flex items-center gap-1.5 text-xs"
              >
                <Globe className="h-3.5 w-3.5" /> {lang === "EN" ? "Kiswahili" : "English"}
              </button>
              <span className="text-xs font-bold bg-gradient-to-r from-[var(--gold)] to-[var(--maasai)] bg-clip-text text-transparent">
                6,420 Simba pts
              </span>
            </div>
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
            <p className="italic">"Hakuna Matata" — No worries, just wildlife.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
