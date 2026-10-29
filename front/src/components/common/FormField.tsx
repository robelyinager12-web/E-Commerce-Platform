import { InputHTMLAttributes } from "react";
import { useLanguage } from "../../context/LanguageContext";

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function FormField({ label, error, id, ...inputProps }: FormFieldProps) {
  const { localize } = useLanguage();

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block font-sans text-sm font-medium text-ink">
        {localize(label)}
      </label>
      <input
        id={id}
        className="input-field"
        {...inputProps}
        placeholder={
          typeof inputProps.placeholder === "string" ? localize(inputProps.placeholder) : inputProps.placeholder
        }
      />
      {error && <p className="mt-1.5 font-sans text-sm text-red-700">{localize(error)}</p>}
    </div>
  );
}