import { FormEvent, useState } from "react";
import { Category } from "../../types/category.types";
import { ListingDetail } from "../../types/listing.types";
import { FormField } from "../common/FormField";

interface ListingFormValues {
  title: string;
  description: string;
  price: string;
  condition: "new" | "used";
  region: string;
  city: string;
  categoryId: string;
  imageUrl: string;
}

function toFormValues(listing?: ListingDetail): ListingFormValues {
  return {
    title: listing?.title ?? "",
    description: listing?.description ?? "",
    price: listing?.price ?? "",
    condition: listing?.condition ?? "used",
    region: listing?.region ?? "",
    city: listing?.city ?? "",
    categoryId: listing?.category.id ?? "",
    imageUrl: listing?.primary_image ?? "",
  };
}

export function ListingForm({
  existing,
  categories,
  onSubmit,
  isSubmitting,
}: {
  existing?: ListingDetail;
  categories: Category[];
  onSubmit: (values: {
    title: string;
    description?: string;
    price: number;
    condition: "new" | "used";
    region: string;
    city: string;
    categoryId: string;
    imageUrl?: string;
  }) => void;
  isSubmitting: boolean;
}) {
  const [values, setValues] = useState<ListingFormValues>(toFormValues(existing));

  function updateField(field: keyof ListingFormValues) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setValues((prev) => ({ ...prev, [field]: e.target.value }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onSubmit({
      title: values.title,
      description: values.description || undefined,
      price: parseFloat(values.price),
      condition: values.condition,
      region: values.region,
      city: values.city,
      categoryId: values.categoryId,
      imageUrl: values.imageUrl || undefined,
    });
  }

  // Only leaf categories (those with a parent) make sense to post into if
  // subcategories exist; otherwise fall back to top-level ones too.
  const postableCategories = categories;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <FormField id="title" label="Title" required value={values.title} onChange={updateField("title")} />

      <div>
        <label htmlFor="description" className="mb-1.5 block font-sans text-sm font-medium text-ink">
          Description
        </label>
        <textarea
          id="description"
          value={values.description}
          onChange={updateField("description")}
          rows={4}
          className="input-field"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField
          id="price"
          label="Price (Br)"
          type="number"
          min="0"
          required
          value={values.price}
          onChange={updateField("price")}
        />
        <div>
          <label htmlFor="condition" className="mb-1.5 block font-sans text-sm font-medium text-ink">
            Condition
          </label>
          <select
            id="condition"
            value={values.condition}
            onChange={updateField("condition")}
            className="input-field"
          >
            <option value="used">Used</option>
            <option value="new">New</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="categoryId" className="mb-1.5 block font-sans text-sm font-medium text-ink">
          Category
        </label>
        <select
          id="categoryId"
          value={values.categoryId}
          onChange={updateField("categoryId")}
          className="input-field"
          required
        >
          <option value="" disabled>
            Select a category
          </option>
          {postableCategories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.parent_id ? `— ${c.name}` : c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField id="region" label="Region" required value={values.region} onChange={updateField("region")} />
        <FormField id="city" label="City" required value={values.city} onChange={updateField("city")} />
      </div>

      <FormField
        id="imageUrl"
        label="Image URL (optional)"
        value={values.imageUrl}
        onChange={updateField("imageUrl")}
      />

      <button type="submit" className="btn-primary self-start" disabled={isSubmitting}>
        {isSubmitting ? "Saving…" : existing ? "Save changes" : "Post listing"}
      </button>
    </form>
  );
}