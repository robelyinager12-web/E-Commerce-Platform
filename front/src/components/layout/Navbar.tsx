import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { useSavedListings } from "../../context/SavedListingsContext";
import { fetchCategories } from "../../services/category.service";
import { Category } from "../../types/category.types";
import { LANGUAGES } from "../../i18n/translations";
import { NotificationBell } from "./NotificationBell";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { NavSearch } from "./NavSearch";
import { useDismiss } from "./useDismiss";
import {
  BookmarkIcon,
  CheckIcon,
  CloseIcon,
  GlobeIcon,
  ListIcon,
  MenuIcon,
  UserIcon,
} from "./Icons";

const STAFF_ROLES = ["super_admin", "admin", "staff"];

// White round icon button on the green bar (same look as jiji.com.et after login).
const circleBtn =
  "relative flex h-10 w-10 items-center justify-center rounded-full bg-white text-teal transition-colors hover:bg-teal-light";

function Brand() {
  return (
    <Link to="/" className="shrink-0 font-display text-xl font-semibold tracking-tight text-white sm:text-2xl">
      Heroy Market
    </Link>
  );
}

function SavedLink() {
  const { saved } = useSavedListings();
  const { t } = useLanguage();
  return (
    <Link to="/saved" aria-label={t("saved")} title={t("saved")} className={`${circleBtn} hidden lg:flex`}>
      <BookmarkIcon />
      {saved.length > 0 && (
        <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 font-mono text-[10px] font-semibold text-white">
          {saved.length > 9 ? "9+" : saved.length}
        </span>
      )}
    </Link>
  );
}

function MyListingsLink() {
  const { t } = useLanguage();
  return (
    <Link
      to="/listings/mine"
      aria-label={t("myListings")}
      title={t("myListings")}
      className={`${circleBtn} hidden lg:flex`}
    >
      <ListIcon />
    </Link>
  );
}

function UserMenu() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);
  useDismiss(ref, open, close);

  if (!user) return null;

  // Big, airy rows with thin separators, like the jiji.com.et account menu.
  const row =
    "block w-full border-b border-hairline px-8 py-4 text-left font-sans text-base text-ink transition-colors hover:bg-paper";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t("userMenu")}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-white/25 text-white ring-2 ring-white transition-colors hover:bg-white/35"
      >
        <UserIcon width={22} height={22} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-40 mt-3 w-64 overflow-hidden rounded-lg bg-white shadow-xl"
        >
          <Link to="/listings/mine" role="menuitem" onClick={close} className={row}>
            {t("myShop")}
          </Link>
          <Link to={`/sellers/${user.id}`} role="menuitem" onClick={close} className={row}>
            {t("feedback")}
          </Link>
          <Link to="/performance" role="menuitem" onClick={close} className={row}>
            {t("performance")}
          </Link>
          <Link to="/account" role="menuitem" onClick={close} className={row}>
            {t("settings")}
          </Link>
          {STAFF_ROLES.includes(user.role) && (
            <Link to="/admin" role="menuitem" onClick={close} className={row}>
              {t("admin")}
            </Link>
          )}
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              close();
              void logout();
            }}
            className={`${row} border-b-0`}
          >
            {t("logOut")}
          </button>
        </div>
      )}
    </div>
  );
}

/** Slide-down panel used below the `lg` breakpoint (phones and tablets). */
function MobilePanel({ onClose }: { onClose: () => void }) {
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetchCategories()
      .then((cats) => {
        if (!cancelled) setCategories(cats.filter((c) => !c.parent_id));
      })
      .catch(() => {
        if (!cancelled) setCategories([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const linkClass = "block rounded-sm px-3 py-2.5 font-sans text-sm text-ink hover:bg-paper";
  const heading = "px-3 pb-1 pt-4 font-mono text-[11px] uppercase tracking-widest text-muted";

  return (
    <div className="max-h-[calc(100vh-8rem)] overflow-y-auto border-t border-hairline bg-white px-4 pb-6 text-ink lg:hidden">
      <p className={heading}>{t("categories")}</p>
      <Link to="/listings" onClick={onClose} className={`${linkClass} font-medium text-teal-dark`}>
        {t("allCategories")}
      </Link>
      {categories.map((c) => (
        <Link
          key={c.id}
          to={`/listings?category=${encodeURIComponent(c.slug)}`}
          onClick={onClose}
          className={linkClass}
        >
          {c.name}
        </Link>
      ))}

      {user && (
        <>
                   <Link to="/listings/mine" onClick={onClose} className={linkClass}>
            {t("myShop")}
          </Link>
          <Link to={`/sellers/${user.id}`} onClick={onClose} className={linkClass}>
            {t("feedback")}
          </Link>
          <Link to="/performance" onClick={onClose} className={linkClass}>
            {t("performance")}
          </Link>
          <Link to="/saved" onClick={onClose} className={linkClass}>
            {t("saved")}
          </Link>
          <Link to="/account" onClick={onClose} className={linkClass}>
            {t("settings")}
          </Link>
          {STAFF_ROLES.includes(user.role) && (
            <Link to="/admin" onClick={onClose} className={linkClass}>
              {t("admin")}
            </Link>
          )}
        </>
      )}

      <p className={`${heading} flex items-center gap-1.5`}>
        <GlobeIcon width={14} height={14} /> {t("language")}
      </p>
      <div className="flex flex-wrap gap-2 px-3 pt-1">
        {LANGUAGES.map((l) => (
          <button
            key={l.code}
            type="button"
            onClick={() => setLanguage(l.code)}
            aria-pressed={l.code === language}
            className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-sans text-sm ${
              l.code === language
                ? "border-teal bg-teal-light text-teal-dark"
                : "border-hairline text-ink/80 hover:border-ink/30"
            }`}
          >
            {l.code === language && <CheckIcon />}
            {l.label}
          </button>
        ))}
      </div>

      <div className="mt-5 border-t border-hairline pt-4">
        {user ? (
          <button
            type="button"
            onClick={() => {
              onClose();
              void logout();
            }}
            className="btn-secondary w-full"
          >
            {t("logOut")}
          </button>
        ) : (
          <div className="flex gap-3">
            <Link to="/login" onClick={onClose} className="btn-primary flex-1">
              {t("signIn")}
            </Link>
            <Link to="/register" onClick={onClose} className="btn-secondary flex-1">
              {t("register")}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export function Navbar() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  // The homepage has its own big search in the green hero, so the header search is hidden there.
  const isHome = location.pathname === "/";

  // Close the mobile panel whenever the route changes.
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname, location.search]);

  return (
    <header className="sticky top-0 z-30 border-b border-white/15 bg-teal">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:px-6 lg:gap-5">
        <Brand />

        {/* Desktop header search (every page except the homepage) */}
        {!isHome && (
          <div className="hidden min-w-0 flex-1 lg:block">
            <NavSearch />
          </div>
        )}

        {/* Right-hand actions */}
        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <div className="hidden lg:block">
            <LanguageSwitcher />
          </div>

          {user ? (
            <>
              <SavedLink />
              <NotificationBell />
              <MyListingsLink />
              <div className="hidden lg:block">
                <UserMenu />
              </div>
            </>
          ) : (
            <div className="hidden items-center gap-2 font-sans text-sm font-medium text-white lg:flex">
              <Link to="/login" className="px-1 hover:underline">
                {t("signIn")}
              </Link>
              <span aria-hidden="true" className="text-white/60">
                |
              </span>
              <Link to="/register" className="px-1 hover:underline">
                {t("register")}
              </Link>
            </div>
          )}

          <Link
            to="/listings/new"
            className="inline-flex h-10 items-center rounded-lg bg-gold px-5 font-sans text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-gold-dark sm:h-12 sm:px-12 sm:text-base"
          >
            {t("sell")}
          </Link>

          {/* Mobile / tablet menu toggle */}
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? t("closeMenu") : t("openMenu")}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-white transition-colors hover:bg-white/10 lg:hidden"
          >
            {menuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {/* Mobile / tablet search row (not on the homepage) */}
      {!isHome && (
        <div className="px-4 pb-3 sm:px-6 lg:hidden">
          <NavSearch onSubmitted={closeMenu} />
        </div>
      )}

      {menuOpen && <MobilePanel onClose={closeMenu} />}
    </header>
  );
}