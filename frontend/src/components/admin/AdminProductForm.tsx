import { FormEvent, useState } from "react";
import { ProductDetail } from "../../types/product.types";
import { FormField } from "../common/FormField";

interface ProductFormValues {
  name: string;
  description: string;
  basePrice: string;
  sku: string;
  stockQuantity: string;
  imageUrl: string;
}

function toFormValues(product?: ProductDetail): ProductFormValues {
  return {
    name: product?.name ?? "",
    description: product?.description ?? "",
    basePrice: product?.base_price ?? "",
    sku: product?.sku ?? "",
    stockQuantity: product ? String(product.stock_quantity) : "",
    imageUrl: product?.primary_image ?? "",
  };
}

export function AdminProductForm({
  existing,
  onSubmit,
  onCancel,
  isSubmitting,
}: {
  existing?: ProductDetail;
  onSubmit: (values: {
    name: string;
    description?: string;
    basePrice: number;
    sku?: string;
    stockQuantity: number;
    imageUrl?: string;
  }) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}) {
  const [values, setValues] = useState<ProductFormValues>(toFormValues(existing));

  function updateField(field: keyof ProductFormValues) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setValues((prev) => ({ ...prev, [field]: e.target.value }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onSubmit({
      name: values.name,
      description: values.description || undefined,
      basePrice: parseFloat(values.basePrice),
      sku: existing ? undefined : values.sku,
      stockQuantity: parseInt(values.stockQuantity, 10) || 0,
      imageUrl: values.imageUrl || undefined,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-sm border border-hairline p-5">
      <FormField id="name" label="Name" required value={values.name} onChange={updateField("name")} />

      <div>
        <label htmlFor="description" className="mb-1.5 block font-sans text-sm font-medium text-ink">
          Description
        </label>
        <textarea
          id="description"
          value={values.description}
          onChange={updateField("description")}
          rows={3}
          className="input-field"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField
          id="basePrice"
          label="Price"
          type="number"
          step="0.01"
          min="0"
          required
          value={values.basePrice}
          onChange={updateField("basePrice")}
        />
        <FormField
          id="stockQuantity"
          label="Stock quantity"
          type="number"
          min="0"
          required
          value={values.stockQuantity}
          onChange={updateField("stockQuantity")}
        />
      </div>

      {!existing && (
        <FormField id="sku" label="SKU" required value={values.sku} onChange={updateField("sku")} />
      )}

      <FormField
        id="imageUrl"
        label="Image URL (optional)"
        value={values.imageUrl}
        onChange={updateField("imageUrl")}
      />

      <div className="flex gap-3">
        <button type="submit" className="btn-primary" disabled={isSubmitting}>
          {isSubmitting ? "Saving…" : existing ? "Save changes" : "Create product"}
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancel
        </button>
      </div>
    </form>
  );
}