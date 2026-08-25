import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { Cart } from "../types/cart.types";
import * as cartService from "../services/cart.service";
import { useAuth } from "./AuthContext";

interface CartContextValue {
  cart: Cart | null;
  isLoading: boolean;
  addItem: (productId: string, quantity: number, variantId?: string) => Promise<void>;
  updateItem: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clear: () => Promise<void>;
  refresh: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

const EMPTY_CART: Cart = { id: "", items: [], subtotal: "0.00", itemCount: 0 };

export function CartProvider({ children }: { children: ReactNode }) {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const freshCart = await cartService.fetchCart();
      setCart(freshCart);
    } catch {
      setCart(EMPTY_CART);
    }
  }, []);

  // Wait for auth to settle first: logging in merges any guest cart into
  // the user's cart server-side, so fetching too early would show stale
  // (pre-merge) cart contents.
  useEffect(() => {
    if (isAuthLoading) return;
    setIsLoading(true);
    refresh().finally(() => setIsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthLoading, user?.id]);

  const addItem = useCallback(
    async (productId: string, quantity: number, variantId?: string) => {
      const updated = await cartService.addCartItem({ productId, variantId, quantity });
      setCart(updated);
    },
    []
  );

  const updateItem = useCallback(async (itemId: string, quantity: number) => {
    const updated = await cartService.updateCartItem(itemId, quantity);
    setCart(updated);
  }, []);

  const removeItem = useCallback(async (itemId: string) => {
    const updated = await cartService.removeCartItem(itemId);
    setCart(updated);
  }, []);

  const clear = useCallback(async () => {
    const updated = await cartService.clearCart();
    setCart(updated);
  }, []);

  return (
    <CartContext.Provider value={{ cart, isLoading, addItem, updateItem, removeItem, clear, refresh }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}