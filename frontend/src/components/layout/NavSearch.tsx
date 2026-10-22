import { FormEvent, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import { SearchIcon } from "./Icons";

/** Search box for the navbar. Submits to /listings?search=… */
export function NavSearch({ onSubmitted }: { onSubmitted?: () => void }) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [value, setValue] = useState("");

  // Keep the box in sync with the URL while browsing listings.
  useEffect(() => {
    if (location.pathname === "/listings") {
      setValue(new URLSearchParams(location.search).get("search") ?? "");
    }
  }, [location.pathname, location.search]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const q = value.trim();
    navigate(q ? `/listings?search=${encodeURIComponent(q)}` : "/listings");
    onSubmitted?.();
  }

  return (
    <form onSubmit={handleSubmit} role="search" className="relative w-full">
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={t("searchPlaceholder")}
        aria-label={t("search")}
        className="input-field !rounded-full !py-2 !pl-4 !pr-11"
      />
      <button
        type="submit"
        aria-label={t("search")}
        className="absolute right-1 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-teal hover:bg-teal-light"
      >
        <SearchIcon width={18} height={18} />
      </button>
    </form>
  );
}