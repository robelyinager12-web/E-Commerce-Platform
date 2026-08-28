import { SavedAddress } from "../../types/address.types";

export function SavedAddressCard({
  address,
  onEdit,
  onDelete,
  isDeleting,
}: {
  address: SavedAddress;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}) {
  return (
    <div className="card flex flex-col gap-2 p-4">
      <div className="flex items-center justify-between">
        <span className="font-sans text-sm font-medium text-ink">
          {address.label || "Address"}
        </span>
        {address.is_default && (
          <span className="rounded-sm bg-teal-light px-2 py-0.5 font-mono text-[11px] uppercase tracking-wide text-teal-dark">
            Default
          </span>
        )}
      </div>
      <div className="font-sans text-sm text-ink/80">
        <p>{address.street}</p>
        <p>
          {address.city}
          {address.state ? `, ${address.state}` : ""} {address.postal_code}
        </p>
        <p>{address.country}</p>
      </div>
      <div className="mt-2 flex gap-3">
        <button type="button" onClick={onEdit} className="font-sans text-xs text-teal hover:underline">
          Edit
        </button>
        <button
          type="button"
          onClick={onDelete}
          disabled={isDeleting}
          className="font-sans text-xs text-muted hover:text-red-700 disabled:opacity-50"
        >
          {isDeleting ? "Removing…" : "Remove"}
        </button>
      </div>
    </div>
  );
}