import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Category } from "../../types/category.types";
import { useLanguage } from "../../context/LanguageContext";
import { categoryIcon } from "../../constants/categoryIcons";
import { ChevronDownIcon } from "../layout/Icons";

interface FlyoutPosition {
  top: number;
  left: number;
  width: number;
  minHeight: number;
}

/**
 * Left-hand category list (desktop). Hovering a category opens a panel to its right
 * with that category's subcategories, like jiji.com.et.
 * Pass ALL categories (top-level and subcategories); the component splits them.
 */
export function CategorySidebar({ categories }: { categories: Category[] }) {
  const { t } = useLanguage();
  const navRef = useRef<HTMLElement>(null);
  const closeTimer = useRef<number | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [position, setPosition] = useState<FlyoutPosition | null>(null);

  const topLevel = useMemo(() => categories.filter((c) => !c.parent_id), [categories]);
  const childrenOf = useMemo(() => {
    const map = new Map<string, Category[]>();
    for (const c of categories) {
      if (c.parent_id) map.set(c.parent_id, [...(map.get(c.parent_id) ?? []), c]);
    }
    return map;
  }, [categories]);

  // The flyout is `position: fixed`, so it is never clipped by the sidebar's own scrolling.
  const measure = useCallback(() => {
    const nav = navRef.current;
    if (!nav) return;
    const rect = nav.getBoundingClientRect();
    const left = rect.right - 1;
    setPosition({
      top: rect.top,
      left,
      width: Math.max(280, Math.min(600, window.innerWidth - left - 16)),
      minHeight: rect.height,
    });
  }, []);

  const cancelClose = useCallback(() => {
    if (closeTimer.current !== null) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }, []);

  const scheduleClose = useCallback(() => {
    cancelClose();
    // Small grace period so moving the mouse diagonally towards the panel doesn't close it.
    closeTimer.current = window.setTimeout(() => setActiveId(null), 120);
  }, [cancelClose]);

  const open = useCallback(
    (id: string) => {
      cancelClose();
      measure();
      setActiveId(id);
    },
    [cancelClose, measure]
  );

  const close = useCallback(() => {
    cancelClose();
    setActiveId(null);
  }, [cancelClose]);

  // Keep the panel aligned while open, and let Escape close it.
  useEffect(() => {
    if (!activeId) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setActiveId(null);
    }
    window.addEventListener("scroll", measure, true);
    window.addEventListener("resize", measure);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("scroll", measure, true);
      window.removeEventListener("resize", measure);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [activeId, measure]);

  useEffect(() => cancelClose, [cancelClose]);

  const active = topLevel.find((c) => c.id === activeId);
  const subCategories = active ? childrenOf.get(active.id) ?? [] : [];
  const showFlyout = active !== undefined && subCategories.length > 0 && position !== null;

  return (
    <div onMouseLeave={scheduleClose}>
      <nav ref={navRef} aria-label={t("categories")} className="card overflow-hidden">
        <ul>
          {topLevel.map((category) => {
            const isActive = category.id === activeId && showFlyout;
            return (
              <li key={category.id} className="border-b border-hairline last:border-0">
                <Link
                  to={`/listings?category=${encodeURIComponent(category.slug)}`}
                  onMouseEnter={() => open(category.id)}
                  onFocus={() => open(category.id)}
                  onClick={close}
                  className={`flex items-center justify-between px-4 py-2.5 font-sans text-sm transition-colors ${
                    isActive ? "bg-teal-light text-teal-dark" : "text-ink hover:bg-teal-light hover:text-teal-dark"
                  }`}
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <span aria-hidden="true" className="w-6 shrink-0 text-center text-lg leading-none">
                      {categoryIcon(category.slug)}
                    </span>
                    <span className="truncate">{category.name}</span>
                  </span>
                  <ChevronDownIcon className="-rotate-90 shrink-0 text-ink/40" />
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {showFlyout && active && position && (
        <div
          role="menu"
          aria-label={active.name}
          onMouseEnter={cancelClose}
          style={{
            top: position.top,
            left: position.left,
            width: position.width,
            minHeight: position.minHeight,
            maxHeight: `calc(100vh - ${position.top}px - 16px)`,
          }}
          className="fixed z-40 overflow-y-auto rounded-sm border border-hairline bg-white p-6 shadow-lg"
        >
          <Link
            to={`/listings?category=${encodeURIComponent(active.slug)}`}
            onClick={close}
            className="mb-4 flex items-center gap-2 font-display text-lg font-semibold text-ink hover:text-teal"
          >
            <span aria-hidden="true">{categoryIcon(active.slug)}</span>
            {active.name}
          </Link>

          <ul className="grid grid-cols-1 gap-x-8 gap-y-0.5 sm:grid-cols-2">
            {subCategories.map((sub) => (
              <li key={sub.id}>
                <Link
                  to={`/listings?category=${encodeURIComponent(sub.slug)}`}
                  role="menuitem"
                  onClick={close}
                  className="block rounded-sm px-2 py-1.5 font-sans text-sm text-ink/80 transition-colors hover:bg-teal-light hover:text-teal-dark"
                >
                  {sub.name}
                </Link>
              </li>
            ))}
          </ul>

          <Link
            to={`/listings?category=${encodeURIComponent(active.slug)}`}
            onClick={close}
            className="mt-5 inline-block font-sans text-sm font-medium text-teal hover:underline"
          >
            {t("browseAll")} →
          </Link>
        </div>
      )}
    </div>
  );
}