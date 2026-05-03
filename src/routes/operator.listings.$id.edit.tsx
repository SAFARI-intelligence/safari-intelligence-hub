import { createFileRoute, Link } from "@tanstack/react-router";
import { ListingForm } from "@/components/operator/ListingForm";
import { listings } from "@/lib/operator-data";

export const Route = createFileRoute("/operator/listings/$id/edit")({
  head: () => ({ meta: [{ title: "Edit listing — SAFARI OS Operator" }] }),
  component: EditListingPage,
});

function EditListingPage() {
  const { id } = Route.useParams();
  const listing = listings.find((l) => l.id === id);

  return (
    <div style={{ maxWidth: 760, margin: "0 auto" }}>
      <header style={{ marginBottom: 16 }}>
        <Link to="/operator/listings" className="op-link">← Back to listings</Link>
        <h1 className="op-h1" style={{ marginTop: 6 }}>Edit listing</h1>
        <p className="op-sub">{listing?.name ?? "Unknown listing"}</p>
      </header>
      {listing ? <ListingForm mode="edit" listing={listing} /> : <div className="op-card">Listing not found.</div>}
    </div>
  );
}
