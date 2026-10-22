import { useCallback, useRef, useState } from "react";
import { useLanguage } from "../../context/LanguageContext";
import { LANGUAGES } from "../../i18n/translations";
import { CheckIcon, ChevronDownIcon, GlobeIcon } from "./Icons";
import { useDismiss } from "./useDismiss";

/** Globe-icon dropdown for picking the UI language (desktop). */
export function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);
  useDismiss(ref, open, close);

  const current = LANGUAGES.find((l) => l.code === language)!;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`${t("language")}: ${current.label}`}
        className="flex items-center gap-1.5 rounded-sm px-2 py-1.5 text-ink/80 hover:bg-teal-light hover:text-teal"
      >
        <GlobeIcon />
        <span className="font-mono text-xs uppercase">{current.short}</span>
        <ChevronDownIcon className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label={t("language")}
          className="absolute right-0 top-full z-40 mt-2 w-44 rounded-sm border border-hairline bg-white py-1 shadow-lg"
        >
          {LANGUAGES.map((l) => (
            <li key={l.code} role="option" aria-selected={l.code === language}>
              <button
                type="button"
                onClick={() => {
                  setLanguage(l.code);
                  setOpen(false);
                }}
                className="flex w-full items-center justify-between px-4 py-2 text-left font-sans text-sm text-ink hover:bg-paper"
              >
                {l.label}
                {l.code === language && <CheckIcon className="text-teal" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}