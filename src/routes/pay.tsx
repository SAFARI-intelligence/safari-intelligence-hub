import { createFileRoute, Outlet } from "@tanstack/react-router";
import { PayShell } from "@/components/pay/PayShell";
import { RoleGuard } from "@/components/safari/RoleGuard";

export const Route = createFileRoute("/pay")({
  head: () => ({
    meta: [
      { title: "SAFARI Pay — Wallet, escrow & checkout" },
      {
        name: "description",
        content:
          "Trip wallet, flex balance, escrowed bookings and transactions for SAFARI travellers across Kenya.",
      },
    ],
  }),
  component: () => (
    <RoleGuard allow={["user", "hotel", "support"]}>
      <PayShell>
        <Outlet />
      </PayShell>
    </RoleGuard>
  ),
});
