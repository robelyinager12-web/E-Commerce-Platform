import { AddressInput } from "../../types/order.types";
import { FormField } from "../common/FormField";

interface AddressFormProps {
  value: AddressInput;
  onChange: (value: AddressInput) => void;
  idPrefix: string;
}

export function AddressForm({ value, onChange, idPrefix }: AddressFormProps) {
  function updateField(field: keyof AddressInput) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      onChange({ ...value, [field]: e.target.value });
  }

  return (
    <div className="flex flex-col gap-4">
      <FormField
        id={`${idPrefix}-street`}
        label="Street address"
        required
        value={value.street}
        onChange={updateField("street")}
      />
      <div className="grid grid-cols-2 gap-4">
        <FormField
          id={`${idPrefix}-city`}
          label="City"
          required
          value={value.city}
          onChange={updateField("city")}
        />
        <FormField
          id={`${idPrefix}-state`}
          label="State / Province"
          value={value.state ?? ""}
          onChange={updateField("state")}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <FormField
          id={`${idPrefix}-postalCode`}
          label="Postal code"
          required
          value={value.postalCode}
          onChange={updateField("postalCode")}
        />
        <FormField
          id={`${idPrefix}-country`}
          label="Country"
          required
          value={value.country}
          onChange={updateField("country")}
        />
      </div>
    </div>
  );
}