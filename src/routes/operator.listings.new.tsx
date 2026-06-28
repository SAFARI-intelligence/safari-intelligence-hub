import { createFileRoute, Link } from "@tanstack/react-router";
import { ListingForm } from "@/components/operator/ListingForm";

export const Route = createFileRoute("/operator/listings/new")({
  head: () => ({ meta: [{ title: "Add listing — SAFARI OS Operator" }] }),
  component: NewListingPage,
});

function NewListingPage() {
  return (
    <div style={{ maxWidth: 760, margin: "0 auto" }}>
      <header style={{ marginBottom: 16 }}>
        <Link to="/operator/listings" className="op-link">
          ← Back to listings
        </Link>
        <h1 className="op-h1" style={{ marginTop: 6 }}>
          Add a new listing
        </h1>
        <p className="op-sub">Takes ~10 minutes. You can save a draft and finish later.</p>
      </header>
      <ListingForm mode="create" />
    </div>
  );
}
