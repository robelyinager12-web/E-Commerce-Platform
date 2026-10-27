import { useState } from "react";
import { REGIONS } from "../../constants/regions";
import { useLanguage } from "../../context/LanguageContext";
import { PickerSheet } from "../common/PickerSheet";
import { ChevronDownIcon } from "../layout/Icons";

// Sub-cities of Addis Ababa. Other regions use a free-text city/town field.
const ADDIS_SUB_CITIES = [
  "Addis Ketema",
  "Akaky Kaliti",
  "Arada",
  "Bole",
  "Gullele",
  "Kirkos",
  "Kolfe Keranio",
  "Lemi Kura",
  "Lideta",
  "Nifas Silk-Lafto",
  "Yeka",
];

interface LocationPickerProps {
  onSelect: (region: string, city: string) => void;
  onClose: () => void;
}

/** Step 1: choose a region. Step 2: choose a sub-city (Addis Ababa) or type a city/town. */
export function LocationPicker({ onSelect, onClose }: LocationPickerProps) {
  const { t } = useLanguage();
  const [region, setRegion] = useState<string | null>(null);
  const [city, setCity] = useState("");

  const row =
    "flex w-full items-center justify-between border-b border-hairline px-5 py-4 text-left font-sans text-base text-ink last:border-0 hover:bg-paper";

  if (!region) {
    return (
      <PickerSheet title={t("postSelectRegion")} onClose={onClose}>
        {REGIONS.map((r) => (
          <button key={r} type="button" onClick={() => setRegion(r)} className={row}>
            <span>{r}</span>
            <ChevronDownIcon className="-rotate-90 text-ink/40" />
          </button>
        ))}
      </PickerSheet>
    );
  }

  if (region === "Addis Ababa") {
    return (
      <PickerSheet title={region} onClose={onClose} onBack={() => setRegion(null)}>
        {ADDIS_SUB_CITIES.map((subCity) => (
          <button key={subCity} type="button" onClick={() => onSelect(region, subCity)} className={row}>
            {subCity}
          </button>
        ))}
      </PickerSheet>
    );
  }

  return (
    <PickerSheet title={region} onClose={onClose} onBack={() => setRegion(null)}>
      <div className="flex flex-col gap-4 p-5">
        <input
          autoFocus
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder={t("postCity")}
          aria-label={t("postCity")}
          maxLength={100}
          className="h-14 w-full rounded-xl border border-teal/40 px-4 font-sans text-base text-ink focus:border-teal focus:outline-none"
        />
        <button
          type="button"
          disabled={!city.trim()}
          onClick={() => onSelect(region, city.trim())}
          className="h-12 rounded-xl bg-teal font-sans text-base font-medium text-white transition-colors hover:bg-teal-dark disabled:cursor-not-allowed disabled:bg-hairline disabled:text-muted"
        >
          {t("postConfirm")}
        </button>
      </div>
    </PickerSheet>
  );
}