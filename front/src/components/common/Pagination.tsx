import { PaginationMeta } from "../../types/listing.types";
import { useLanguage } from "../../context/LanguageContext";

export function Pagination({
  meta,
  onPageChange,
}: {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
}) {
  const { localize } = useLanguage();
  if (meta.totalPages <= 1) return null;

  return (
    <div className="mt-10 flex items-center justify-center gap-2 font-sans text-sm">
      <button
        type="button"
        onClick={() => onPageChange(meta.page - 1)}
        disabled={meta.page <= 1}
        className="btn-secondary !px-3 !py-1.5 disabled:opacity-30"
      >
        {localize("Previous")}
      </button>
      <span className="price-tag px-3 text-muted">
        {meta.page} / {meta.totalPages}
      </span>
      <button
        type="button"
        onClick={() => onPageChange(meta.page + 1)}
        disabled={meta.page >= meta.totalPages}
        className="btn-secondary !px-3 !py-1.5 disabled:opacity-30"
      >
        {localize("Next")}
      </button>
    </div>
  );
}