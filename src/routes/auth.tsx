import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/lib/auth";
import { Shell } from "@/components/safari/Shell";
import { Loader2, User as UserIcon, Building2, Sparkles } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in · Safari OS" },
      { name: "description", content: "Join Safari OS as a traveler, hotel partner, or support team member." },
    ],
  }),
  component: AuthPage,
});

type Mode = "signin" | "signup";
type Role = "user" | "hotel";

function AuthPage() {
  const navigate = useNavigate();
  const { user, primaryRole, loading: authLoading } = useAuth();
  const [mode, setMode] = useState<Mode>("signin");
  const [role, setRole] = useState<Role>("user");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && user && primaryRole) {
      const dest =
        primaryRole === "support" ? "/support" : primaryRole === "hotel" ? "/partner" : "/hotels";
      navigate({ to: dest });
    }
  }, [user, primaryRole, authLoading, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      if (mode === "signup") {
        const redirectUrl = `${window.location.origin}/`;
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl,
            data: { name, role },
          },
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (e: any) {
      setErr(e.message || "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Shell>
      <div className="mx-auto max-w-md">
        <div className="glass-strong rounded-3xl p-6 sm:p-8">
          <div className="text-center mb-6">
            <div className="mx-auto h-12 w-12 rounded-2xl bg-gradient-to-br from-[var(--gold)] to-[var(--maasai)] grid place-items-center text-2xl shadow-[var(--shadow-glow-gold)]">
              🦁
            </div>
            <h1 className="mt-3 font-display text-2xl font-bold">
              {mode === "signin" ? "Karibu tena" : "Karibu Safari OS"}
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              {mode === "signin" ? "Welcome back — sign in to continue" : "Create your account · Twende!"}
            </p>
          </div>

          <div className="flex gap-1 p-1 rounded-xl bg-foreground/5 mb-5">
            <button
              type="button"
              onClick={() => setMode("signin")}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
                mode === "signin" ? "bg-background shadow-sm" : "text-muted-foreground"
              }`}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
                mode === "signup" ? "bg-background shadow-sm" : "text-muted-foreground"
              }`}
            >
              Sign up
            </button>
          </div>

          {mode === "signup" && (
            <div className="mb-4">
              <label className="text-xs font-medium text-muted-foreground mb-2 block">
                I am joining as
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole("user")}
                  className={`p-3 rounded-xl border text-left transition ${
                    role === "user"
                      ? "border-[var(--gold)] bg-[var(--gold)]/10"
                      : "border-border/60 hover:bg-foreground/5"
                  }`}
                >
                  <UserIcon className="h-4 w-4 mb-1.5" />
                  <div className="text-sm font-semibold">Traveler</div>
                  <div className="text-[10px] text-muted-foreground">Browse & book</div>
                </button>
                <button
                  type="button"
                  onClick={() => setRole("hotel")}
                  className={`p-3 rounded-xl border text-left transition ${
                    role === "hotel"
                      ? "border-[var(--maasai)] bg-[var(--maasai)]/10"
                      : "border-border/60 hover:bg-foreground/5"
                  }`}
                >
                  <Building2 className="h-4 w-4 mb-1.5" />
                  <div className="text-sm font-semibold">Hotel partner</div>
                  <div className="text-[10px] text-muted-foreground">List & manage</div>
                </button>
              </div>
            </div>
          )}

          <form onSubmit={submit} className="space-y-3">
            {mode === "signup" && (
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full name"
                className="w-full px-3 py-2.5 rounded-lg border border-border/60 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-[var(--gold)]/40"
              />
            )}
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full px-3 py-2.5 rounded-lg border border-border/60 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-[var(--gold)]/40"
            />
            <input
              required
              type="password"
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password (min 6 chars)"
              className="w-full px-3 py-2.5 rounded-lg border border-border/60 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-[var(--gold)]/40"
            />

            {err && (
              <div className="text-xs text-[var(--maasai)] bg-[var(--maasai)]/10 px-3 py-2 rounded-lg">
                {err}
              </div>
            )}

            <button
              type="submit"
              disabled={busy}
              className="w-full py-2.5 rounded-lg bg-gradient-to-r from-[var(--gold)] to-[var(--maasai)] text-white font-semibold text-sm shadow-[var(--shadow-glow-gold)] flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {mode === "signin" ? "Sign in" : "Create account"}
            </button>
          </form>

          <p className="text-[11px] text-center text-muted-foreground mt-4">
            By continuing you agree to Safari OS terms. <Link to="/" className="underline">Back to explorer</Link>
          </p>
        </div>
      </div>
    </Shell>
  );
}
