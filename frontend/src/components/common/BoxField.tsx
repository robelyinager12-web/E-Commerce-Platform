import { InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import { ChevronDownIcon } from "../layout/Icons";

const boxBase =
  "w-full rounded-xl border bg-white px-4 font-sans text-base text-ink transition-colors focus:outline-none";
const floatingLabel =
  "pointer-events-none absolute left-4 font-sans text-form-label transition-all top-1.5 text-xs " +
  "peer-placeholder-shown:top-[16px] peer-placeholder-shown:text-base";

function RequiredMark({ faded = false }: { faded?: boolean }) {
  return <span className={faded ? "text-red-300" : "text-red-500"}>*</span>;
}

interface BoxFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  required?: boolean;
  /** Small text shown above the top-right corner, e.g. "0 / 70". */
  counter?: string;
}

/** Text input with the label inside the box (floats up when filled). */
export function BoxField({ label, required, counter, id, className = "", ...inputProps }: BoxFieldProps) {
  return (
    <div className="relative">
      {counter && (
        <span className="absolute -top-5 right-1 font-sans text-xs text-form-label">{counter}</span>
      )}
      <input
        id={id}
        placeholder=" "
        className={`${boxBase} peer h-14 border-form-border pt-4 focus:border-teal ${className}`}
        {...inputProps}
      />
      <label htmlFor={id} className={floatingLabel}>
        {label}
        {required && <RequiredMark />}
      </label>
    </div>
  );
}

interface BoxTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  counter?: string;
}

export function BoxTextarea({ label, counter, id, className = "", ...props }: BoxTextareaProps) {
  return (
    <div className="relative">
      {counter && (
        <span className="absolute -top-5 right-1 font-sans text-xs text-form-label">{counter}</span>
      )}
      <textarea
        id={id}
        placeholder=" "
        rows={6}
        className={`${boxBase} peer border-form-border pb-3 pt-7 focus:border-teal ${className}`}
        {...props}
      />
      <label htmlFor={id} className={floatingLabel}>
        {label}
      </label>
    </div>
  );
}

interface PickerFieldProps {
  label: string;
  value?: string;
  required?: boolean;
  disabled?: boolean;
  onClick: () => void;
}

/** Looks like a field but opens a picker (category, location…). Greyed out while disabled. */
export function PickerField({ label, value, required, disabled, onClick }: PickerFieldProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`relative flex h-14 w-full items-center justify-between rounded-xl border bg-white px-4 text-left transition-colors ${
        disabled
          ? "cursor-not-allowed border-form-off"
          : "border-form-border hover:border-teal"
      }`}
    >
      <span className="min-w-0">
        {value ? (
          <>
            <span className="block font-sans text-xs text-form-label">{label}</span>
            <span className="block truncate font-sans text-base text-ink">{value}</span>
          </>
        ) : (
          <span
            className={`font-sans text-base ${disabled ? "text-form-offtext" : "text-form-label"}`}
          >
            {label}
            {required && <RequiredMark faded={disabled} />}
          </span>
        )}
      </span>
      <ChevronDownIcon
        className={`-rotate-90 shrink-0 ${disabled ? "text-form-off" : "text-form-label"}`}
      />
    </button>
  );
}