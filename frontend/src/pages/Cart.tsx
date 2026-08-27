import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { CartItemRow } from "../components/cart/CartItemRow";
import { validateCoupon } from "../services/coupon.service";
import { CouponValidationResult } from "../types/coupon.types";
import { getErrorMessage } from "../utils/getErrorMessage";

export function Cart() {
  const { cart, isLoading } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [couponCode, setCouponCode] = useState("");
  const [couponResult, setCouponResult] = useState<CouponValidationResult | null>(null);
  const [isCheckingCoupon, setIsCheckingCoupon] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);

  const subtotal = parseFloat(cart?.subtotal ?? "0");

  async function handleApplyCoupon(e: FormEvent) {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setCouponError(null);
    setIsCheckingCoupon(true);
    try {
      const result = await validateCoupon(couponCode.trim(), subtotal);
      setCouponResult(result);
    } catch (err) {
      setCouponError(getErrorMessage(err));
      setCouponResult(null);
    } finally {
      setIsCheckingCoupon(false);
    }
  }

  function handleCheckout() {
    if (!user) {
      navigate("/login", { state: { from: "/checkout" } });
      return;
    }
    navigate("/checkout", { state: { couponCode: couponResult?.valid ? couponCode.trim() : undefined } });
  }

  if (isLoading) {
    return <div className="mx-auto max-w-6xl px-6 py-16 font-sans text-sm text-muted">Loading cart…</div>;
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-24 text-center">
        <h1 className="font-display text-2xl font-semibold text-ink">Your cart is empty</h1>
        <p className="mt-2 font-sans text-sm text-muted">
          Items you add to your cart will show up here.
        </p>
        <Link to="/products" className="btn-primary mt-6 inline-flex">
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="mb-8 font-display text-3xl font-semibold text-ink">Your cart</h1>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_320px]">
        <div>
          {cart.items.map((item) => (
            <CartItemRow key={item.id} item={item} />
          ))}
        </div>

        <div className="card h-fit p-6">
          <h2 className="mb-4 font-display text-lg font-semibold text-ink">Order summary</h2>

          <div className="flex justify-between font-sans text-sm text-ink/80">
            <span>Subtotal</span>
            <span className="price-tag">${cart.subtotal}</span>
          </div>

          {couponResult?.valid && (
            <div className="mt-2 flex justify-between font-sans text-sm text-teal-dark">
              <span>Coupon ({couponResult.coupon?.code})</span>
              <span className="price-tag">−${couponResult.discountAmount}</span>
            </div>
          )}

          <p className="mt-3 font-sans text-xs text-muted">
            Shipping and tax are calculated at checkout.
          </p>

          <form onSubmit={handleApplyCoupon} className="mt-5 flex gap-2">
            <input
              type="text"
              value={couponCode}
              onChange={(e) => {
                setCouponCode(e.target.value);
                setCouponResult(null);
              }}
              placeholder="Coupon code"
              className="input-field !py-2 text-sm"
            />
            <button type="submit" className="btn-secondary !px-4" disabled={isCheckingCoupon}>
              {isCheckingCoupon ? "…" : "Apply"}
            </button>
          </form>

          {couponResult && !couponResult.valid && (
            <p className="mt-2 font-sans text-xs text-red-700">{couponResult.reason}</p>
          )}
          {couponResult?.valid && (
            <p className="mt-2 font-sans text-xs text-teal-dark">Coupon applied.</p>
          )}
          {couponError && <p className="mt-2 font-sans text-xs text-red-700">{couponError}</p>}

          <button type="button" onClick={handleCheckout} className="btn-primary mt-6 w-full">
            Proceed to checkout
          </button>
        </div>
      </div>
    </div>
  );
}