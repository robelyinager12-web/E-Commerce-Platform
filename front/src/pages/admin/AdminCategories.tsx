import { useEffect, useState, useCallback } from "react";
import {
  fetchCategoriesAdmin,
  createCategoryAdmin,
  updateCategoryAdmin,
  deleteCategoryAdmin,
  reactivateCategoryAdmin,
  CategoryInput,
} from "../../services/category.service";
import { Category } from "../../types/category.types";
import { CategoryForm } from "../../components/admin/CategoryForm";
import { getErrorMessage } from "../../utils/getErrorMessage";

type FormMode = { kind: "closed" } | { kind: "create" } | { kind: "edit"; category: Category };

export function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formMode, setFormMode] = useState<FormMode>({ kind: "closed" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const loadCategories = useCallback(async () => {
    setCategories(await fetchCategoriesAdmin());
  }, []);

  useEffect(() => {
    loadCategories()
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setIsLoading(false));
  }, [loadCategories]);

  async function handleCreate(input: CategoryInput) {
    setError(null);
    setIsSubmitting(true);
    try {
      await createCategoryAdmin(input);
      await loadCategories();
      setFormMode({ kind: "closed" });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleUpdate(id: string, input: CategoryInput) {
    setError(null);
    setIsSubmitting(true);
    try {
      await updateCategoryAdmin(id, input);
      await loadCategories();
      setFormMode({ kind: "closed" });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeactivate(id: string) {
    if (!confirm("Deactivate this category? It will be hidden from the storefront.")) return;
    setPendingId(id);
    setError(null);
    try {
      await deleteCategoryAdmin(id);
      await loadCategories();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setPendingId(null);
    }
  }

  async function handleReactivate(id: string) {
    setPendingId(id);
    setError(null);
    try {
      await reactivateCategoryAdmin(id);
      await loadCategories();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setPendingId(null);
    }
  }

  function parentName(parentId: string | null): string | null {
    if (!parentId) return null;
    return categories.find((c) => c.id === parentId)?.name ?? null;
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-ink">Categories</h1>
        {formMode.kind === "closed" && (
          <button
            type="button"
            onClick={() => setFormMode({ kind: "create" })}
            className="btn-primary !py-2 !text-sm"
          >
            + New category
          </button>
        )}
      </div>

      {error && <p className="mb-4 font-sans text-sm text-red-700">{error}</p>}

      {formMode.kind === "create" && (
        <div className="mb-6">
          <CategoryForm
            allCategories={categories}
            onSubmit={handleCreate}
            onCancel={() => setFormMode({ kind: "closed" })}
            isSubmitting={isSubmitting}
          />
        </div>
      )}

      {formMode.kind === "edit" && (
        <div className="mb-6">
          <CategoryForm
            existing={formMode.category}
            allCategories={categories}
            onSubmit={(input) => handleUpdate(formMode.category.id, input)}
            onCancel={() => setFormMode({ kind: "closed" })}
            isSubmitting={isSubmitting}
          />
        </div>
      )}

      {isLoading ? (
        <p className="font-sans text-sm text-muted">Loading…</p>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full font-sans text-sm">
            <thead className="bg-white text-left text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Parent</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {categories.map((category) => (
                <tr key={category.id} className={category.is_active ? "" : "opacity-60"}>
                  <td className="px-4 py-3 text-ink">{category.name}</td>
                  <td className="px-4 py-3 text-xs text-muted">
                    {parentName(category.parent_id) ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-sm px-2 py-1 font-mono text-xs uppercase ${
                        category.is_active ? "bg-teal-light text-teal-dark" : "bg-hairline text-ink/60"
                      }`}
                    >
                      {category.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => setFormMode({ kind: "edit", category })}
                      className="mr-3 text-teal hover:underline"
                    >
                      Edit
                    </button>
                    {category.is_active ? (
                      <button
                        type="button"
                        onClick={() => handleDeactivate(category.id)}
                        disabled={pendingId === category.id}
                        className="text-muted hover:text-red-700 disabled:opacity-50"
                      >
                        {pendingId === category.id ? "…" : "Deactivate"}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleReactivate(category.id)}
                        disabled={pendingId === category.id}
                        className="text-teal hover:underline disabled:opacity-50"
                      >
                        {pendingId === category.id ? "…" : "Reactivate"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}