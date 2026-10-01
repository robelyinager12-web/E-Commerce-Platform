import { Link } from "react-router-dom";
import { ListingListItem } from "../../types/listing.types";

function formatRelativeDate(iso: string): string {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24));
  if (days < 1) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days} days ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function ListingCard({ listing }: { listing: ListingListItem }) {
  return (
    <Link to={`/listings/${listing.slug}`} className="card group block overflow-hidden">
      <div className="aspect-square overflow-hidden bg-teal-light">
        {listing.primary_image ? (
          <img
            src={listing.primary_image}
            alt={listing.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center font-display text-muted">
            No image
          </div>
        )}
      </div>
      <div className="p-4">
        <p className="price-tag text-base">{Number(listing.price).toLocaleString()} Br</p>
        <h3 className="mt-1 font-sans text-sm font-medium text-ink line-clamp-2">
          {listing.title}
        </h3>
        <p className="mt-2 font-sans text-xs text-muted">
          {listing.city}, {listing.region} · {formatRelativeDate(listing.created_at)}
        </p>
      </div>
    </Link>
  );
}