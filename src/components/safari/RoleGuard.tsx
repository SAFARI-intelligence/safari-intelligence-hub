import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { useAuth, type AppRole } from "@/lib/auth";
import { Loader2, ShieldAlert } from "lucide-react";

export function RoleGuard({ allow, children }: { allow: AppRole[]; children: ReactNode }) {
  const { user, roles, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: "/auth" });
    }
  }, [loading, user, navigate]);

  if (loading) {
    return (
      <div className="grid place-items-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) return null;

  const ok = roles.some((r) => allow.includes(r));
  if (!ok) {
    return (
      <div className="mx-auto max-w-md mt-12">
        <div className="glass-strong rounded-2xl p-6 text-center">
          <ShieldAlert className="h-10 w-10 mx-auto text-[var(--maasai)]" />
          <h2 className="font-display text-lg font-bold mt-3">Hapana — access restricted</h2>
          <p className="text-sm text-muted-foreground mt-1">
            This terminal requires the{" "}
            <span className="font-semibold">{allow.join(" or ")}</span> role.
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
