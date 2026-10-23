import { ReactNode, useEffect } from "react";
import { ChevronDownIcon, CloseIcon } from "../layout/Icons";

interface PickerSheetProps {
  title: string;
  onClose: () => void;
  /** When set, a back arrow is shown (for drill-down pickers). */
  onBack?: () => void;
  children: ReactNode;
}

/** Bottom sheet on phones, centered dialog on larger screens. */
export function PickerSheet({ title, onClose, onBack, children }: PickerSheetProps) {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-label={title}>
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-ink/40"
      />
      <div className="relative flex max-h-[85vh] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-xl sm:max-w-md sm:rounded-2xl">
        <div className="flex items-center gap-2 border-b border-hairline px-4 py-3">
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              aria-label="Back"
              className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-paper"
            >
              <ChevronDownIcon className="rotate-90" />
            </button>
          ) : (
            <span className="w-8" />
          )}
          <h2 className="flex-1 text-center font-display text-base font-semibold text-ink">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-paper"
          >
            <CloseIcon width={18} height={18} />
          </button>
        </div>
        <div className="overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}