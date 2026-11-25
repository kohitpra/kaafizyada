// Commerce types shared by the demo catalogue and the Shopify Storefront adapter.
// Shapes deliberately mirror Shopify's Storefront API so swapping providers needs no UI changes.

export type Money = { amount: number; currencyCode: "INR" | string };

export type ProductImage = {
  url: string;
  alt: string;
  width: number;
  height: number;
};

export type ProductOption = { name: "Size" | "Colour" | string; values: string[] };

export type Variant = {
  id: string;
  title: string;
  availableForSale: boolean;
  quantityAvailable: number | null;
  selectedOptions: { name: string; value: string }[];
  price: Money;
  compareAtPrice?: Money | null;
  image?: ProductImage;
};

export type Callout = {
  /** Position of the sticker on the detail image, 0–1 from top-left. */
  x: number;
  y: number;
  label: string;
};

export type Product = {
  id: string;
  handle: string;
  title: string;
  /** One-line hook shown on cards. */
  tagline: string;
  description: string;
  productType: "Tops" | "Bottoms" | "Dresses" | "Jackets" | "Sets" | "Accessories" | string;
  tags: string[];
  options: ProductOption[];
  variants: Variant[];
  images: ProductImage[];
  priceRange: { min: Money; max: Money };
  availableForSale: boolean;
  details: { fabric: string; fit: string; care: string; madeIn: string };
  callouts: Callout[];
  /** Colour swatch hexes keyed by option value. */
  swatches: Record<string, string>;
  createdAt: string;
  /** Which size chart applies. */
  sizeChart: "apparel" | "none";
};

export type Collection = {
  handle: string;
  title: string;
  description: string;
  /** Short line in hand-lettering on the collection header. */
  note: string;
  image?: ProductImage;
};

export type SortKey = "featured" | "newest" | "price-asc" | "price-desc";

export type ProductQuery = {
  collection?: string;
  query?: string;
  type?: string;
  size?: string;
  colour?: string;
  sort?: SortKey;
  inStockOnly?: boolean;
};

export type CartLine = {
  id: string;
  quantity: number;
  variantId: string;
  productHandle: string;
  productTitle: string;
  variantTitle: string;
  image?: ProductImage;
  price: Money;
  maxQuantity: number | null;
};

export type Cart = {
  id: string | null;
  lines: CartLine[];
  totalQuantity: number;
  subtotal: Money;
  checkoutUrl: string | null;
};

export type CommerceMode = "demo" | "shopify";
