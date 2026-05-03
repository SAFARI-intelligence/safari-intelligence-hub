import { createFileRoute, Outlet } from "@tanstack/react-router";
import { OperatorShell } from "@/components/operator/OperatorShell";

export const Route = createFileRoute("/operator")({
  head: () => ({
    meta: [
      { title: "Operator Portal — SAFARI OS" },
      { name: "description", content: "Manage bookings, listings, wildlife reports, and payouts on SAFARI OS." },
      { property: "og:title", content: "SAFARI OS Operator Portal" },
      { property: "og:description", content: "Single command centre for Kenyan tour operators on SAFARI OS." },
    ],
  }),
  component: () => (
    <OperatorShell>
      <Outlet />
    </OperatorShell>
  ),
});
