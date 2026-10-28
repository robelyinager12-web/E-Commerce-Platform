import { useEffect, useState, useCallback } from "react";
import {
  fetchProductsAdmin,
  fetchProductBySlug,
  createProductAdmin,
  updateProductAdmin,
  deactivateProductAdmin,
  reactivateProductAdmin,
  ProductListItemAdmin,
} from "../../services/product.service";
import { ProductDetail } from "../../types/product.types";
import { AdminProductForm } from "../../components/admin/AdminProductForm";
import { getErrorMessage } from "../../utils/getErrorMessage";

type FormMode = { kind: "closed" } | { kind: "create" } | { kind: "edit"; product: ProductDetail };

export function AdminProducts() {
  const [products, setProducts] = useState<ProductListItemAdmin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formMode, setFormMode] = useState<FormMode>({ kind: "closed" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const loadProducts = useCallback(async () => {
    const { items } = await fetchProductsAdmin();
    setProducts(items);
  }, []);

  useEffect(() => {
    loadProducts()
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setIsLoading(false));
  }, [loadProducts]);

  async function handleCreate(values: {
    name: string;
    description?: string;
    basePrice: number;
    sku?: string;
    stockQuantity: number;
    imageUrl?: string;
  }) {
    if (!values.sku) {
      setError("SKU is required to create a product");
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      await createProductAdmin({ ...values, sku: values.sku });
      await loadProducts();
      setFormMode({ kind: "closed" });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleUpdate(id: string, values: Parameters<typeof updateProductAdmin>[1]) {
    setError(null);
    setIsSubmitting(true);
    try {
      await updateProductAdmin(id, values);
      await loadProducts();
      setFormMode({ kind: "closed" });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleEditClick(product: ProductListItemAdmin) {
    setError(null);
    try {
      const detail = await fetchProductBySlug(product.slug);
      setFormMode({ kind: "edit", product: detail });
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function handleDeactivate(id: string) {
    if (!confirm("Deactivate this product? It will be hidden from the storefront.")) return;
    setPendingId(id);
    setError(null);
    try {
      await deactivateProductAdmin(id);
      await loadProducts();
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
      await reactivateProductAdmin(id);
      await loadProducts();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-ink">Products</h1>
        {formMode.kind === "closed" && (
          <button
            type="button"
            onClick={() => setFormMode({ kind: "create" })}
            className="btn-primary !py-2 !text-sm"
          >
            + New product
          </button>
        )}
      </div>

      {error && <p className="mb-4 font-sans text-sm text-red-700">{error}</p>}

      {formMode.kind === "create" && (
        <div className="mb-6">
          <AdminProductForm
            onSubmit={handleCreate}
            onCancel={() => setFormMode({ kind: "closed" })}
            isSubmitting={isSubmitting}
          />
        </div>
      )}

      {formMode.kind === "edit" && (
        <div className="mb-6">
          <AdminProductForm
            existing={formMode.product}
            onSubmit={(values) => handleUpdate(formMode.product.id, values)}
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
                <th className="px-4 py-3">SKU</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {products.map((product) => (
                <tr key={product.id} className={product.is_active ? "" : "opacity-60"}>
                  <td className="px-4 py-3 text-ink">{product.name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted">{product.sku}</td>
                  <td className="price-tag px-4 py-3">${product.base_price}</td>
                  <td className="px-4 py-3">{product.stock_quantity}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-sm px-2 py-1 font-mono text-xs uppercase ${
                        product.is_active ? "bg-teal-light text-teal-dark" : "bg-hairline text-ink/60"
                      }`}
                    >
                      {product.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => handleEditClick(product)}
                      className="mr-3 text-teal hover:underline"
                    >
                      Edit
                    </button>
                    {product.is_active ? (
                      <button
                        type="button"
                        onClick={() => handleDeactivate(product.id)}
                        disabled={pendingId === product.id}
                        className="text-muted hover:text-red-700 disabled:opacity-50"
                      >
                        {pendingId === product.id ? "…" : "Deactivate"}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleReactivate(product.id)}
                        disabled={pendingId === product.id}
                        className="text-teal hover:underline disabled:opacity-50"
                      >
                        {pendingId === product.id ? "…" : "Reactivate"}
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