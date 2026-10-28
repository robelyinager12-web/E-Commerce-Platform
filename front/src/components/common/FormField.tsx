import { InputHTMLAttributes } from "react";

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function FormField({ label, error, id, ...inputProps }: FormFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block font-sans text-sm font-medium text-ink">
        {label}
      </label>
      <input id={id} className="input-field" {...inputProps} />
      {error && <p className="mt-1.5 font-sans text-sm text-red-700">{error}</p>}
    </div>
  );
}