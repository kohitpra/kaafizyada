"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { addToCartAction, getCartAction, updateLineAction } from "@/app/actions/cart";
import type { Cart, CartLine, CommerceMode, Product, Variant } from "@/lib/commerce/types";

type CartContextValue = {
  mode: CommerceMode;
  cart: Cart;
  isOpen: boolean;
  pending: boolean;
  lastAdded: CartLine | null;
  open: () => void;
  close: () => void;
  add: (product: Product, variant: Variant, quantity?: number) => Promise<void>;
  update: (lineId: string, quantity: number) => Promise<void>;
};

const STORAGE_KEY = "kz-cart-v1";
const EMPTY: Cart = { id: null, lines: [], totalQuantity: 0, subtotal: { amount: 0, currencyCode: "INR" }, checkoutUrl: null };

const CartContext = createContext<CartContextValue | null>(null);

function recompute(lines: CartLine[]): Cart {
  return {
    id: "demo",
    lines,
    totalQuantity: lines.reduce((n, l) => n + l.quantity, 0),
    subtotal: { amount: lines.reduce((n, l) => n + l.quantity * l.price.amount, 0), currencyCode: lines[0]?.price.currencyCode ?? "INR" },
    // Demo mode has no payment backend, so there is deliberately no checkout URL.
    checkoutUrl: null,
  };
}

export function CartProvider({ mode, children }: { mode: CommerceMode; children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart>(EMPTY);
  const [isOpen, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [lastAdded, setLastAdded] = useState<CartLine | null>(null);

  // Restore
  useEffect(() => {
    let saved: string | null = null;
    try {
      saved = localStorage.getItem(STORAGE_KEY);
    } catch {}
    if (!saved) return;
    if (mode === "demo") {
      try {
        setCart(recompute(JSON.parse(saved) as CartLine[]));
      } catch {}
    } else {
      getCartAction(saved)
        .then((c) => c && setCart(c))
        .catch(() => {});
    }
  }, [mode]);

  const persist = useCallback(
    (c: Cart) => {
      try {
        localStorage.setItem(STORAGE_KEY, mode === "demo" ? JSON.stringify(c.lines) : c.id ?? "");
      } catch {}
    },
    [mode],
  );

  const add = useCallback(
    async (product: Product, variant: Variant, quantity = 1) => {
      setPending(true);
      try {
        let next: Cart;
        if (mode === "demo") {
          const existing = cart.lines.find((l) => l.variantId === variant.id);
          const max = variant.quantityAvailable ?? 99;
          const lines = existing
            ? cart.lines.map((l) => (l.variantId === variant.id ? { ...l, quantity: Math.min(max, l.quantity + quantity) } : l))
            : [
                ...cart.lines,
                {
                  id: variant.id,
                  quantity: Math.min(max, quantity),
                  variantId: variant.id,
                  productHandle: product.handle,
                  productTitle: product.title,
                  variantTitle: variant.title,
                  image: variant.image ?? product.images[0],
                  price: variant.price,
                  maxQuantity: variant.quantityAvailable,
                },
              ];
          next = recompute(lines);
        } else {
          next = await addToCartAction(cart.id, variant.id, quantity);
        }
        setCart(next);
        persist(next);
        setLastAdded(next.lines.find((l) => l.variantId === variant.id) ?? null);
        setOpen(true);
      } finally {
        setPending(false);
      }
    },
    [cart, mode, persist],
  );

  const update = useCallback(
    async (lineId: string, quantity: number) => {
      setPending(true);
      try {
        let next: Cart;
        if (mode === "demo") {
          const lines = cart.lines
            .map((l) => (l.id === lineId ? { ...l, quantity: Math.min(l.maxQuantity ?? 99, quantity) } : l))
            .filter((l) => l.quantity > 0);
          next = recompute(lines);
        } else {
          next = await updateLineAction(cart.id!, lineId, quantity);
        }
        setCart(next);
        persist(next);
      } finally {
        setPending(false);
      }
    },
    [cart, mode, persist],
  );

  const value = useMemo(
    () => ({ mode, cart, isOpen, pending, lastAdded, open: () => setOpen(true), close: () => setOpen(false), add, update }),
    [mode, cart, isOpen, pending, lastAdded, add, update],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
