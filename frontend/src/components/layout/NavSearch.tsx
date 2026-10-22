import { FormEvent, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import { REGIONS } from "../../constants/regions";
import { SearchIcon } from "./Icons";

/**
 * Joined search bar: [ region ▾ | keywords | search ].
 * Submits to /listings?search=…&region=…
 */
export function NavSearch({ onSubmitted }: { onSubmitted?: () => void }) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [value, setValue] = useState("");
  const [region, setRegion] = useState("");

  // Keep the bar in sync with the URL while browsing listings.
  useEffect(() => {
    if (location.pathname === "/listings") {
      const params = new URLSearchParams(location.search);
      setValue(params.get("search") ?? "");
      setRegion(params.get("region") ?? "");
    }
  }, [location.pathname, location.search]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (value.trim()) params.set("search", value.trim());
    if (region) params.set("region", region);
    const qs = params.toString();
    navigate(qs ? `/listings?${qs}` : "/listings");
    onSubmitted?.();
  }

  return (
    <form
      onSubmit={handleSubmit}
      role="search"
      className="flex w-full items-stretch overflow-hidden rounded-sm border border-teal bg-white focus-within:ring-2 focus-within:ring-teal/30"
    >
      <select
        value={region}
        onChange={(e) => setRegion(e.target.value)}
        aria-label={t("region")}
        className="hidden w-36 shrink-0 cursor-pointer border-r border-hairline bg-paper px-3 font-sans text-sm text-ink focus:outline-none sm:block"
      >
        <option value="">{t("allEthiopia")}</option>
        {REGIONS.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </select>

      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={t("searchPlaceholder")}
        aria-label={t("search")}
        className="min-w-0 flex-1 bg-transparent px-3.5 py-2.5 font-sans text-sm text-ink placeholder:text-muted focus:outline-none"
      />

      <button
        type="submit"
        aria-label={t("search")}
        className="flex w-12 shrink-0 items-center justify-center bg-teal text-paper transition-colors hover:bg-teal-dark"
      >
        <SearchIcon width={20} height={20} />
      </button>
    </form>
  );
}