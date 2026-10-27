import { InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import { ChevronDownIcon } from "../layout/Icons";

const boxBase =
  "w-full rounded-lg border bg-white px-4 font-sans text-base text-ink transition-colors focus:outline-none";
const floatingLabel =
  "pointer-events-none absolute left-4 font-sans text-form-label transition-all top-1.5 text-xs " +
  "peer-placeholder-shown:top-[16px] peer-placeholder-shown:text-base";

function RequiredMark({ faded = false }: { faded?: boolean }) {
  return <span className={faded ? "text-red-300" : "text-red-500"}>*</span>;
}

/** Red helper text under a field, e.g. "This field is required." */
function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="mt-1.5 px-2 font-sans text-[13px] text-red-500">
      {message}
    </p>
  );
}

interface BoxFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  required?: boolean;
  /** Small text shown above the top-right corner, e.g. "0 / 70". */
  counter?: string;
  /** When set, the box turns red and the message is shown underneath. */
  error?: string;
}

/** Text input with the label inside the box (floats up when filled). */
export function BoxField({ label, required, counter, error, id, className = "", ...inputProps }: BoxFieldProps) {
  return (
    <div>
      <div className="relative">
        {counter && (
          <span className="absolute -top-5 right-1 font-sans text-xs text-form-label">{counter}</span>
        )}
        <input
          id={id}
          placeholder=" "
          aria-invalid={error ? true : undefined}
          className={`${boxBase} peer h-14 pt-4 ${
            error ? "border-red-500 focus:border-red-500" : "border-form-border focus:border-teal"
          } ${className}`}
          {...inputProps}
        />
        <label htmlFor={id} className={floatingLabel}>
          {label}
          {required && <RequiredMark />}
        </label>
      </div>
      <FieldError message={error} />
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
  /** When set, the box turns red and the message is shown underneath. */
  error?: string;
  onClick: () => void;
}

/** Looks like a field but opens a picker (category, location…). Greyed out while disabled. */
export function PickerField({ label, value, required, disabled, error, onClick }: PickerFieldProps) {
  const borderClass = disabled
    ? "cursor-not-allowed border-form-off"
    : error
      ? "border-red-500"
      : "border-form-border hover:border-teal";

  return (
    <div>
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={`relative flex h-14 w-full items-center justify-between rounded-lg border bg-white px-4 text-left transition-colors ${borderClass}`}
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
          strokeWidth={2.4}
          className={`-rotate-90 shrink-0 ${disabled ? "text-form-off" : "text-form-label"}`}
        />
      </button>
      <FieldError message={error} />
    </div>
  );
}