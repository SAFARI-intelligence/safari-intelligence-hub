import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { useAuth, type AppRole } from "@/lib/auth";
import { Loader2, ShieldAlert } from "lucide-react";

const HOME_BY_ROLE: Record<AppRole, string> = {
  user: "/profile",
  hotel: "/operator",
  support: "/support",
};

export function RoleGuard({ allow, children }: { allow: AppRole[]; children: ReactNode }) {
  const { user, roles, primaryRole, loading } = useAuth();
  const navigate = useNavigate();

  const ok = roles.some((r) => allow.includes(r));

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate({ to: "/auth" });
      return;
    }
    // Logged in but wrong role → send them to their own home
    if (!ok && primaryRole) {
      const dest = HOME_BY_ROLE[primaryRole];
      navigate({ to: dest });
    }
  }, [loading, user, ok, primaryRole, navigate]);

  if (loading) {
    return (
      <div className="grid place-items-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) return null;

  if (!ok) {
    // Fallback (e.g. user has no role at all)
    return (
      <div className="mx-auto max-w-md mt-12">
        <div className="glass-strong rounded-2xl p-6 text-center">
          <ShieldAlert className="h-10 w-10 mx-auto text-[var(--maasai)]" />
          <h2 className="font-display text-lg font-bold mt-3">Hapana — wrong terminal</h2>
          <p className="text-sm text-muted-foreground mt-1">
            This area is reserved for the{" "}
            <span className="font-semibold">{allow.join(" or ")}</span> role.
            {primaryRole && (
              <>
                {" "}
                Redirecting you to your <span className="font-semibold">{primaryRole}</span> home…
              </>
            )}
          </p>
          <Link
            to="/hotels"
            className="inline-block mt-4 px-4 py-2 rounded-lg bg-foreground text-background text-sm font-medium"
          >
            Go to Explorer
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
