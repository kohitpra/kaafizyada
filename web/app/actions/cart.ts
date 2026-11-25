"use server";

// Server actions for the Shopify cart. Only used when the site runs in "shopify" mode;
// the demo catalogue keeps its cart in the browser (see CartProvider).
import { shopifyCart } from "@/lib/commerce/shopify";

export async function getCartAction(id: string) {
  return shopifyCart.get(id);
}

export async function addToCartAction(id: string | null, variantId: string, quantity: number) {
  return shopifyCart.add(id, variantId, quantity);
}

export async function updateLineAction(id: string, lineId: string, quantity: number) {
  return shopifyCart.update(id, lineId, quantity);
}
