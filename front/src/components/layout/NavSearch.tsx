import { FormEvent, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import { REGIONS } from "../../constants/regions";
import { ChevronDownIcon, SearchIcon } from "./Icons";

interface NavSearchProps {
  onSubmitted?: () => void;
  /** "md" for the header, "lg" for the big homepage search. */
  size?: "md" | "lg";
}

/**
 * Two white boxes on a green background, like jiji.com.et:
 * [ All Ethiopia ▾ ] [ I am looking for…            🔍 ]
 * Submits to /listings?search=…&region=…
 */
export function NavSearch({ onSubmitted, size = "md" }: NavSearchProps) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [value, setValue] = useState("");
  const [region, setRegion] = useState("");

  // Keep the boxes in sync with the URL while browsing listings.
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

  const box =
    "rounded-lg bg-white font-sans text-ink focus:outline-none focus:ring-2 focus:ring-white/70";
  const sizing =
    size === "lg" ? "h-14 text-base sm:h-[68px] sm:text-lg" : "h-11 text-sm";
  const selectWidth = size === "lg" ? "w-52" : "w-44";

  return (
    <form onSubmit={handleSubmit} role="search" className="flex w-full items-stretch gap-3">
      <div className={`relative hidden shrink-0 sm:block ${selectWidth}`}>
        <select
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          aria-label={t("region")}
          className={`${box} ${sizing} w-full cursor-pointer appearance-none pl-4 pr-10 text-ink/70`}
        >
          <option value="">{t("allEthiopia")}</option>
          {REGIONS.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink/60" />
      </div>

      <div className="relative min-w-0 flex-1">
        <input
          type="search"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={t("searchPlaceholder")}
          aria-label={t("search")}
          className={`${box} ${sizing} w-full pl-4 pr-14 placeholder:text-ink/50`}
        />
        <button
          type="submit"
          aria-label={t("search")}
          className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-md text-ink/60 transition-colors hover:text-teal"
        >
          <SearchIcon width={size === "lg" ? 26 : 22} height={size === "lg" ? 26 : 22} />
        </button>
      </div>
    </form>
  );
}