import { FormEvent, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { checkout } from "../services/order.service";
import { AddressForm } from "../components/checkout/AddressForm";
import { AddressInput } from "../types/order.types";
import { getErrorMessage } from "../utils/getErrorMessage";

const EMPTY_ADDRESS: AddressInput = { street: "", city: "", state: "", postalCode: "", country: "" };

export function Checkout() {
  const { cart, isLoading: isCartLoading, refresh: refreshCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const carriedCouponCode = (location.state as { couponCode?: string } | null)?.couponCode;

  const [shippingAddress, setShippingAddress] = useState<AddressInput>(EMPTY_ADDRESS);
  const [billingSameAsShipping, setBillingSameAsShipping] = useState(true);
  const [billingAddress, setBillingAddress] = useState<AddressInput>(EMPTY_ADDRESS);
  const [couponCode, setCouponCode] = useState(carriedCouponCode ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const order = await checkout({
        shippingAddress,
        billingAddress: billingSameAsShipping ? undefined : billingAddress,
        couponCode: couponCode.trim() || undefined,
      });
      await refreshCart(); // cart is now empty server-side
      navigate(`/orders/${order.id}`, { state: { justPlaced: true }, replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isCartLoading) {
    return <div className="mx-auto max-w-6xl px-6 py-16 font-sans text-sm text-muted">Loading…</div>;
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-md px-6 py-24 text-center">
        <h1 className="font-display text-2xl font-semibold text-ink">Your cart is empty</h1>
        <p className="mt-2 font-sans text-sm text-muted">Add something before checking out.</p>
        <Link to="/products" className="btn-primary mt-6 inline-flex">
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="mb-8 font-display text-3xl font-semibold text-ink">Checkout</h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-10">
          <section>
            <h2 className="mb-4 font-display text-lg font-semibold text-ink">Shipping address</h2>
            <AddressForm value={shippingAddress} onChange={setShippingAddress} idPrefix="shipping" />
          </section>

          <section>
            <label className="flex items-center gap-2 font-sans text-sm text-ink">
              <input
                type="checkbox"
                checked={billingSameAsShipping}
                onChange={(e) => setBillingSameAsShipping(e.target.checked)}
                className="h-4 w-4"
              />
              Billing address same as shipping
            </label>

            {!billingSameAsShipping && (
              <div className="mt-4">
                <h2 className="mb-4 font-display text-lg font-semibold text-ink">
                  Billing address
                </h2>
                <AddressForm value={billingAddress} onChange={setBillingAddress} idPrefix="billing" />
              </div>
            )}
          </section>
        </div>

        <div className="card h-fit p-6">
          <h2 className="mb-4 font-display text-lg font-semibold text-ink">Order review</h2>

          <div className="flex flex-col gap-3">
            {cart.items.map((item) => (
              <div key={item.id} className="flex justify-between font-sans text-sm">
                <span className="text-ink/80">
                  {item.product_name}
                  {item.variant_value ? ` (${item.variant_value})` : ""} × {item.quantity}
                </span>
                <span className="price-tag">${item.line_total}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 border-t border-hairline pt-4">
            <label htmlFor="couponCode" className="mb-1.5 block font-sans text-xs text-muted">
              Coupon code (optional)
            </label>
            <input
              id="couponCode"
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              placeholder="e.g. WELCOME10"
              className="input-field !py-2 text-sm"
            />
          </div>

          <div className="mt-4 flex justify-between border-t border-hairline pt-4 font-sans text-sm text-ink/80">
            <span>Subtotal</span>
            <span className="price-tag">${cart.subtotal}</span>
          </div>
          <p className="mt-1 font-sans text-xs text-muted">
            Final discount, shipping, and tax are calculated when you place the order.
          </p>

          {error && (
            <p className="mt-4 rounded-sm bg-red-50 px-3 py-2.5 font-sans text-sm text-red-700">
              {error}
            </p>
          )}

          <button type="submit" className="btn-primary mt-6 w-full" disabled={isSubmitting}>
            {isSubmitting ? "Placing order…" : "Place order"}
          </button>
        </div>
      </form>
    </div>
  );
}