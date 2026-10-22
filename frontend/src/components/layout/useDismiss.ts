import { RefObject, useEffect } from "react";

/** Calls onDismiss when the user clicks outside `ref` or presses Escape. */
export function useDismiss(ref: RefObject<HTMLElement>, active: boolean, onDismiss: () => void) {
  useEffect(() => {
    if (!active) return;

    function onPointerDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onDismiss();
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onDismiss();
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [ref, active, onDismiss]);
}