import { useState } from "react";
import { Link } from "react-router-dom";
import { CartItem } from "../../types/cart.types";
import { useCart } from "../../context/CartContext";
import { getErrorMessage } from "../../utils/getErrorMessage";

export function CartItemRow({ item }: { item: CartItem }) {
  const { updateItem, removeItem } = useCart();
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleQuantityChange(newQuantity: number) {
    if (newQuantity < 1) return;
    setError(null);
    setIsUpdating(true);
    try {
      await updateItem(item.id, newQuantity);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsUpdating(false);
    }
  }

  async function handleRemove() {
    setIsUpdating(true);
    try {
      await removeItem(item.id);
    } catch (err) {
      setError(getErrorMessage(err));
      setIsUpdating(false);
    }
  }

  return (
    <div className="flex gap-4 border-b border-hairline py-6 last:border-0">
      <Link to={`/products/${item.product_slug}`} className="h-24 w-24 shrink-0 overflow-hidden rounded-sm bg-teal-light">
        {item.primary_image && (
          <img src={item.primary_image} alt={item.product_name} className="h-full w-full object-cover" />
        )}
      </Link>

      <div className="flex flex-1 flex-col justify-between">
        <div>
          <Link
            to={`/products/${item.product_slug}`}
            className="font-sans text-sm font-medium text-ink hover:text-teal"
          >
            {item.product_name}
          </Link>
          {item.variant_name && (
            <p className="mt-1 font-sans text-xs text-muted">
              {item.variant_name}: {item.variant_value}
            </p>
          )}
          <p className="price-tag mt-1 text-sm">${item.price_at_add} each</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center rounded-sm border border-hairline">
            <button
              type="button"
              onClick={() => handleQuantityChange(item.quantity - 1)}
              disabled={isUpdating || item.quantity <= 1}
              className="px-2.5 py-1 text-ink/70 hover:text-ink disabled:opacity-30"
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span className="price-tag min-w-[1.75rem] text-center text-sm">{item.quantity}</span>
            <button
              type="button"
              onClick={() => handleQuantityChange(item.quantity + 1)}
              disabled={isUpdating || item.quantity >= item.available_stock}
              className="px-2.5 py-1 text-ink/70 hover:text-ink disabled:opacity-30"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>

          <button
            type="button"
            onClick={handleRemove}
            disabled={isUpdating}
            className="font-sans text-xs text-muted hover:text-red-700"
          >
            Remove
          </button>
        </div>

        {item.quantity >= item.available_stock && (
          <p className="font-sans text-xs text-gold-dark">Max available stock reached</p>
        )}
        {error && <p className="font-sans text-xs text-red-700">{error}</p>}
      </div>

      <p className="price-tag shrink-0 self-start text-sm">${item.line_total}</p>
    </div>
  );
}