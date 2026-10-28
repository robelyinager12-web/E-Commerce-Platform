import { FormEvent, useState } from "react";
import { Category } from "../../types/category.types";
import { CategoryInput } from "../../services/category.service";
import { FormField } from "../common/FormField";

interface CategoryFormValues {
  name: string;
  description: string;
  imageUrl: string;
  parentId: string;
}

function toFormValues(category?: Category): CategoryFormValues {
  return {
    name: category?.name ?? "",
    description: category?.description ?? "",
    imageUrl: category?.image_url ?? "",
    parentId: category?.parent_id ?? "",
  };
}

export function CategoryForm({
  existing,
  allCategories,
  onSubmit,
  onCancel,
  isSubmitting,
}: {
  existing?: Category;
  allCategories: Category[];
  onSubmit: (input: CategoryInput) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}) {
  const [values, setValues] = useState<CategoryFormValues>(toFormValues(existing));

  const parentOptions = allCategories.filter(
    (c) => c.id !== existing?.id && c.parent_id === null
  );

  function updateField(field: keyof CategoryFormValues) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setValues((prev) => ({ ...prev, [field]: e.target.value }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onSubmit({
      name: values.name,
      description: values.description || undefined,
      imageUrl: values.imageUrl || undefined,
      parentId: values.parentId || undefined,
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
          rows={2}
          className="input-field"
        />
      </div>

      <FormField
        id="imageUrl"
        label="Image URL (optional)"
        value={values.imageUrl}
        onChange={updateField("imageUrl")}
      />

      <div>
        <label htmlFor="parentId" className="mb-1.5 block font-sans text-sm font-medium text-ink">
          Parent category (optional)
        </label>
        <select
          id="parentId"
          value={values.parentId}
          onChange={updateField("parentId")}
          className="input-field"
        >
          <option value="">None (top-level category)</option>
          {parentOptions.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-3">
        <button type="submit" className="btn-primary" disabled={isSubmitting}>
          {isSubmitting ? "Saving…" : existing ? "Save changes" : "Create category"}
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancel
        </button>
      </div>
    </form>
  );
}