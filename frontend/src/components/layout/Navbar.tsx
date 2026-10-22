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
import { CategoryStrip } from "./CategoryStrip";
import { NavSearch } from "./NavSearch";
import { useDismiss } from "./useDismiss";
import {
  CheckIcon,
  ChevronDownIcon,
  CloseIcon,
  GlobeIcon,
  HeartIcon,
  MenuIcon,
  PlusIcon,
} from "./Icons";

const STAFF_ROLES = ["super_admin", "admin", "staff"];

function Brand() {
  return (
    <Link to="/" className="group shrink-0">
      <div className="font-display text-2xl font-semibold tracking-tight text-ink">
        Aurora Market
      </div>
      <div className="mt-1 flex flex-col gap-[3px]">
        <span className="block h-px w-full bg-ink/70" />
        <span className="block h-px w-2/3 bg-ink/30" />
      </div>
    </Link>
  );
}

/** Thin utility bar above the header (hidden on phones). */
function TopBar() {
  const { t } = useLanguage();
  return (
    <div className="hidden bg-ink text-paper sm:block">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-1.5 font-sans text-xs sm:px-6">
        <p className="text-paper/80">{t("topBarTagline")}</p>
        <Link to="/listings/new" className="font-medium text-gold-light hover:underline">
          {t("sellOnAurora")}
        </Link>
      </div>
    </div>
  );
}

function SavedLink() {
  const { saved } = useSavedListings();
  const { t } = useLanguage();
  return (
    <Link
      to="/saved"
      aria-label={t("saved")}
      title={t("saved")}
      className="relative flex h-9 w-9 items-center justify-center rounded-sm text-ink/80 hover:bg-teal-light hover:text-teal"
    >
      <HeartIcon />
      {saved.length > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 font-mono text-[10px] text-paper">
          {saved.length > 9 ? "9+" : saved.length}
        </span>
      )}
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
  const initial = (user.firstName?.[0] ?? "?").toUpperCase();
  const itemClass = "block w-full px-4 py-2 text-left font-sans text-sm text-ink hover:bg-paper";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t("userMenu")}
        className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 hover:bg-teal-light"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-teal font-sans text-sm font-medium text-paper">
          {initial}
        </span>
        <span className="hidden max-w-[7rem] truncate font-sans text-sm text-ink/80 xl:block">
          {user.firstName}
        </span>
        <ChevronDownIcon className={`text-ink/60 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-40 mt-2 w-56 rounded-sm border border-hairline bg-white py-1 shadow-lg"
        >
          <div className="border-b border-hairline px-4 py-3">
            <p className="truncate font-sans text-sm font-medium text-ink">
              {user.firstName} {user.lastName}
            </p>
            <p className="truncate font-sans text-xs text-muted">{user.email}</p>
          </div>
          <Link to="/account" role="menuitem" onClick={close} className={itemClass}>
            {t("account")}
          </Link>
          <Link to="/listings/mine" role="menuitem" onClick={close} className={itemClass}>
            {t("myListings")}
          </Link>
          <Link to="/saved" role="menuitem" onClick={close} className={itemClass}>
            {t("saved")}
          </Link>
          {STAFF_ROLES.includes(user.role) && (
            <Link to="/admin" role="menuitem" onClick={close} className={itemClass}>
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
            className={`${itemClass} border-t border-hairline text-ink/60`}
          >
            {t("signOut")}
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
    <div className="max-h-[calc(100vh-8rem)] overflow-y-auto border-t border-hairline bg-white px-4 pb-6 lg:hidden">
      <Link to="/listings/new" onClick={onClose} className="btn-primary mt-4 w-full gap-1.5">
        <PlusIcon /> {t("postAd")}
      </Link>

      <p className={heading}>{t("categories")}</p>
      <Link to="/listings" onClick={onClose} className={`${linkClass} font-medium text-teal`}>
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
          <p className={heading}>{t("account")}</p>
          <Link to="/account" onClick={onClose} className={linkClass}>
            {t("account")}
          </Link>
          <Link to="/listings/mine" onClick={onClose} className={linkClass}>
            {t("myListings")}
          </Link>
          <Link to="/saved" onClick={onClose} className={linkClass}>
            {t("saved")}
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
            {t("signOut")}
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

  // Close the mobile panel whenever the route changes.
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname, location.search]);

  const iconBtn =
    "flex h-9 w-9 items-center justify-center rounded-sm text-ink/80 hover:bg-teal-light hover:text-teal";

  return (
    <>
      <TopBar />
      <header className="sticky top-0 z-30 border-b border-hairline bg-paper">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3 sm:px-6 lg:gap-6">
          <Brand />

          {/* Desktop search */}
          <div className="hidden min-w-0 flex-1 lg:block">
            <NavSearch />
          </div>

          {/* Right-hand actions */}
          <div className="ml-auto flex items-center gap-1 sm:gap-2 lg:ml-0">
            <div className="hidden lg:block">
              <LanguageSwitcher />
            </div>

            {user && (
              <>
                <SavedLink />
                <NotificationBell />
                <Link to="/listings/new" className="btn-primary !hidden !gap-1.5 !py-2 lg:!inline-flex">
                  <PlusIcon /> {t("postAd")}
                </Link>
                <div className="hidden lg:block">
                  <UserMenu />
                </div>
              </>
            )}

            {!user && (
              <div className="hidden items-center gap-2 lg:flex">
                <Link to="/register" className="btn-secondary !py-2">
                  {t("register")}
                </Link>
                <Link to="/login" className="btn-primary !py-2">
                  {t("signIn")}
                </Link>
              </div>
            )}

            {/* Mobile / tablet menu toggle */}
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              aria-expanded={menuOpen}
              aria-label={menuOpen ? t("closeMenu") : t("openMenu")}
              className={`${iconBtn} lg:hidden`}
            >
              {menuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>

        {/* Mobile / tablet search row */}
        <div className="px-4 pb-3 sm:px-6 lg:hidden">
          <NavSearch onSubmitted={closeMenu} />
        </div>

        {/* Desktop category strip */}
        <CategoryStrip />

        {menuOpen && <MobilePanel onClose={closeMenu} />}
      </header>
    </>
  );
}