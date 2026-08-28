import { FormEvent, useState } from "react";
import { SavedAddress, SavedAddressInput } from "../../types/address.types";
import { FormField } from "../common/FormField";

interface AddressFormValues {
  label: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

function toFormValues(address?: SavedAddress): AddressFormValues {
  return {
    label: address?.label ?? "",
    street: address?.street ?? "",
    city: address?.city ?? "",
    state: address?.state ?? "",
    postalCode: address?.postal_code ?? "",
    country: address?.country ?? "",
    isDefault: address?.is_default ?? false,
  };
}

export function SavedAddressForm({
  existing,
  onSubmit,
  onCancel,
  isSubmitting,
}: {
  existing?: SavedAddress;
  onSubmit: (input: SavedAddressInput) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}) {
  const [values, setValues] = useState<AddressFormValues>(toFormValues(existing));

  function updateField(field: keyof AddressFormValues) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setValues((prev) => ({ ...prev, [field]: e.target.value }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onSubmit({
      label: values.label || undefined,
      street: values.street,
      city: values.city,
      state: values.state || undefined,
      postalCode: values.postalCode,
      country: values.country,
      isDefault: values.isDefault,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-sm border border-hairline p-5">
      <FormField
        id="label"
        label="Label (optional)"
        placeholder="Home, Work…"
        value={values.label}
        onChange={updateField("label")}
      />
      <FormField id="street" label="Street address" required value={values.street} onChange={updateField("street")} />
      <div className="grid grid-cols-2 gap-4">
        <FormField id="city" label="City" required value={values.city} onChange={updateField("city")} />
        <FormField id="state" label="State / Province" value={values.state} onChange={updateField("state")} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <FormField
          id="postalCode"
          label="Postal code"
          required
          value={values.postalCode}
          onChange={updateField("postalCode")}
        />
        <FormField id="country" label="Country" required value={values.country} onChange={updateField("country")} />
      </div>

      <label className="flex items-center gap-2 font-sans text-sm text-ink">
        <input
          type="checkbox"
          checked={values.isDefault}
          onChange={(e) => setValues((prev) => ({ ...prev, isDefault: e.target.checked }))}
          className="h-4 w-4"
        />
        Set as default address
      </label>

      <div className="flex gap-3">
        <button type="submit" className="btn-primary" disabled={isSubmitting}>
          {isSubmitting ? "Saving…" : existing ? "Save changes" : "Add address"}
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancel
        </button>
      </div>
    </form>
  );
}