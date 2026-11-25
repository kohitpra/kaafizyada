import "server-only";
import { demoProvider } from "./demo";
import { shopifyProvider } from "./shopify";
import type { CommerceMode } from "./types";

export const commerceMode: CommerceMode =
  process.env.SHOPIFY_STORE_DOMAIN && process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN ? "shopify" : "demo";

export const commerce = commerceMode === "shopify" ? shopifyProvider : demoProvider;

export * from "./types";
