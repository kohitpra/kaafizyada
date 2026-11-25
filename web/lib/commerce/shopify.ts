// Shopify Storefront API adapter (headless). Active only when SHOPIFY_STORE_DOMAIN and
// SHOPIFY_STOREFRONT_ACCESS_TOKEN are set. Checkout is Shopify's own hosted checkout (cart.checkoutUrl).
//
// Brand-specific fields come from product metafields in the `custom` namespace:
//   custom.tagline (single line text), custom.fabric, custom.fit, custom.care, custom.made_in,
//   custom.callouts (JSON: [{ "x": 0.5, "y": 0.2, "label": "tie-back neck" }]),
//   custom.swatches (JSON: { "Cherry": "#750505" })
//
// NOTE: written against the Storefront API schema but not yet exercised against a live store.

import { applyQuery } from "./filter";
import type { Cart, Collection, Product, ProductQuery, Variant } from "./types";

const API_VERSION = "2025-10";

type Gql<T> = { data?: T; errors?: { message: string }[] };

async function shopify<T>(query: string, variables: Record<string, unknown> = {}, revalidate = 300): Promise<T> {
  const domain = process.env.SHOPIFY_STORE_DOMAIN;
  const token = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
  if (!domain || !token) throw new Error("Shopify env vars are not set");
  const res = await fetch(`https://${domain}/api/${API_VERSION}/graphql.json`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Shopify-Storefront-Access-Token": token },
    body: JSON.stringify({ query, variables }),
    next: { revalidate },
  });
  const json = (await res.json()) as Gql<T>;
  if (json.errors?.length) throw new Error(json.errors.map((e) => e.message).join("; "));
  return json.data as T;
}

const IMAGE = `url altText width height`;
const PRODUCT = `
  id handle title description productType tags createdAt availableForSale
  options { name optionValues { name } }
  priceRange { minVariantPrice { amount currencyCode } maxVariantPrice { amount currencyCode } }
  images(first: 10) { nodes { ${IMAGE} } }
  variants(first: 100) { nodes {
    id title availableForSale quantityAvailable
    selectedOptions { name value }
    price { amount currencyCode } compareAtPrice { amount currencyCode }
    image { ${IMAGE} }
  } }
  metafields(identifiers: [
    { namespace: "custom", key: "tagline" }, { namespace: "custom", key: "fabric" },
    { namespace: "custom", key: "fit" }, { namespace: "custom", key: "care" },
    { namespace: "custom", key: "made_in" }, { namespace: "custom", key: "callouts" },
    { namespace: "custom", key: "swatches" }
  ]) { key value }
`;

type SImage = { url: string; altText: string | null; width: number; height: number };
type SMoney = { amount: string; currencyCode: string };
type SProduct = {
  id: string; handle: string; title: string; description: string; productType: string; tags: string[];
  createdAt: string; availableForSale: boolean;
  options: { name: string; optionValues: { name: string }[] }[];
  priceRange: { minVariantPrice: SMoney; maxVariantPrice: SMoney };
  images: { nodes: SImage[] };
  variants: { nodes: (Omit<Variant, "price" | "compareAtPrice" | "image"> & { price: SMoney; compareAtPrice: SMoney | null; image: SImage | null })[] };
  metafields: ({ key: string; value: string } | null)[];
};

const money = (m: SMoney) => ({ amount: Number(m.amount), currencyCode: m.currencyCode });
const image = (i: SImage, fallbackAlt: string) => ({ url: i.url, alt: i.altText ?? fallbackAlt, width: i.width, height: i.height });
const parse = <T,>(v: string | undefined, fallback: T): T => {
  try {
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
};

function mapProduct(p: SProduct): Product {
  const mf = Object.fromEntries(p.metafields.filter(Boolean).map((m) => [m!.key, m!.value]));
  const options = p.options
    .map((o) => ({ name: /colou?r/i.test(o.name) ? "Colour" : o.name, values: o.optionValues.map((v) => v.name) }))
    .filter((o) => !(o.name === "Title" && o.values[0] === "Default Title"));
  return {
    id: p.id,
    handle: p.handle,
    title: p.title,
    tagline: mf.tagline ?? "",
    description: p.description,
    productType: p.productType,
    tags: p.tags,
    options,
    variants: p.variants.nodes.map((v) => ({
      ...v,
      selectedOptions: v.selectedOptions.map((o) => ({ name: /colou?r/i.test(o.name) ? "Colour" : o.name, value: o.value })),
      price: money(v.price),
      compareAtPrice: v.compareAtPrice ? money(v.compareAtPrice) : null,
      image: v.image ? image(v.image, p.title) : undefined,
    })),
    images: p.images.nodes.map((i) => image(i, p.title)),
    priceRange: { min: money(p.priceRange.minVariantPrice), max: money(p.priceRange.maxVariantPrice) },
    availableForSale: p.availableForSale,
    details: { fabric: mf.fabric ?? "", fit: mf.fit ?? "", care: mf.care ?? "", madeIn: mf.made_in ?? "" },
    callouts: parse(mf.callouts, []),
    swatches: parse(mf.swatches, {}),
    createdAt: p.createdAt,
    sizeChart: options.some((o) => o.name === "Size") && p.productType !== "Accessories" ? "apparel" : "none",
  };
}

export const shopifyProvider = {
  async getProducts(q: ProductQuery = {}): Promise<Product[]> {
    if (q.collection && q.collection !== "all") {
      const d = await shopify<{ collection: { products: { nodes: SProduct[] } } | null }>(
        `query($h: String!) { collection(handle: $h) { products(first: 100) { nodes { ${PRODUCT} } } } }`,
        { h: q.collection },
      );
      return applyQuery((d.collection?.products.nodes ?? []).map(mapProduct), { ...q, collection: undefined });
    }
    const d = await shopify<{ products: { nodes: SProduct[] } }>(
      `query($q: String) { products(first: 100, query: $q) { nodes { ${PRODUCT} } } }`,
      { q: q.query ?? null },
    );
    return applyQuery(d.products.nodes.map(mapProduct), { ...q, query: undefined });
  },
  async getProduct(handle: string): Promise<Product | null> {
    const d = await shopify<{ product: SProduct | null }>(`query($h: String!) { product(handle: $h) { ${PRODUCT} } }`, { h: handle });
    return d.product ? mapProduct(d.product) : null;
  },
  async getCollection(handle: string): Promise<Collection | null> {
    const d = await shopify<{ collection: { handle: string; title: string; description: string; image: SImage | null } | null }>(
      `query($h: String!) { collection(handle: $h) { handle title description image { ${IMAGE} } } }`,
      { h: handle },
    );
    const c = d.collection;
    return c ? { handle: c.handle, title: c.title, description: c.description, note: "", image: c.image ? image(c.image, c.title) : undefined } : null;
  },
  async getCollections(): Promise<Collection[]> {
    const d = await shopify<{ collections: { nodes: { handle: string; title: string; description: string }[] } }>(
      `{ collections(first: 50) { nodes { handle title description } } }`,
    );
    return d.collections.nodes.map((c) => ({ ...c, note: "" }));
  },
  async getRecommendations(handle: string, count = 4): Promise<Product[]> {
    const p = await this.getProduct(handle);
    if (!p) return [];
    const d = await shopify<{ productRecommendations: SProduct[] | null }>(
      `query($id: ID!) { productRecommendations(productId: $id) { ${PRODUCT} } }`,
      { id: p.id },
    );
    return (d.productRecommendations ?? []).slice(0, count).map(mapProduct);
  },
  async getAllHandles(): Promise<string[]> {
    const d = await shopify<{ products: { nodes: { handle: string }[] } }>(`{ products(first: 250) { nodes { handle } } }`);
    return d.products.nodes.map((n) => n.handle);
  },
};

// ---------- Cart (server actions call these; no caching) ----------

const CART = `
  id checkoutUrl totalQuantity
  cost { subtotalAmount { amount currencyCode } }
  lines(first: 100) { nodes {
    id quantity
    merchandise { ... on ProductVariant {
      id title quantityAvailable price { amount currencyCode }
      image { ${IMAGE} }
      product { handle title }
    } }
  } }
`;

type SCart = {
  id: string; checkoutUrl: string; totalQuantity: number;
  cost: { subtotalAmount: SMoney };
  lines: { nodes: { id: string; quantity: number; merchandise: { id: string; title: string; quantityAvailable: number | null; price: SMoney; image: SImage | null; product: { handle: string; title: string } } }[] };
};

function mapCart(c: SCart): Cart {
  return {
    id: c.id,
    checkoutUrl: c.checkoutUrl,
    totalQuantity: c.totalQuantity,
    subtotal: money(c.cost.subtotalAmount),
    lines: c.lines.nodes.map((l) => ({
      id: l.id,
      quantity: l.quantity,
      variantId: l.merchandise.id,
      productHandle: l.merchandise.product.handle,
      productTitle: l.merchandise.product.title,
      variantTitle: l.merchandise.title,
      image: l.merchandise.image ? image(l.merchandise.image, l.merchandise.product.title) : undefined,
      price: money(l.merchandise.price),
      maxQuantity: l.merchandise.quantityAvailable,
    })),
  };
}

export const shopifyCart = {
  async get(id: string) {
    const d = await shopify<{ cart: SCart | null }>(`query($id: ID!) { cart(id: $id) { ${CART} } }`, { id }, 0);
    return d.cart ? mapCart(d.cart) : null;
  },
  async add(id: string | null, variantId: string, quantity: number) {
    if (!id) {
      const d = await shopify<{ cartCreate: { cart: SCart } }>(
        `mutation($lines: [CartLineInput!]) { cartCreate(input: { lines: $lines }) { cart { ${CART} } } }`,
        { lines: [{ merchandiseId: variantId, quantity }] },
        0,
      );
      return mapCart(d.cartCreate.cart);
    }
    const d = await shopify<{ cartLinesAdd: { cart: SCart } }>(
      `mutation($id: ID!, $lines: [CartLineInput!]!) { cartLinesAdd(cartId: $id, lines: $lines) { cart { ${CART} } } }`,
      { id, lines: [{ merchandiseId: variantId, quantity }] },
      0,
    );
    return mapCart(d.cartLinesAdd.cart);
  },
  async update(id: string, lineId: string, quantity: number) {
    if (quantity <= 0) {
      const d = await shopify<{ cartLinesRemove: { cart: SCart } }>(
        `mutation($id: ID!, $ids: [ID!]!) { cartLinesRemove(cartId: $id, lineIds: $ids) { cart { ${CART} } } }`,
        { id, ids: [lineId] },
        0,
      );
      return mapCart(d.cartLinesRemove.cart);
    }
    const d = await shopify<{ cartLinesUpdate: { cart: SCart } }>(
      `mutation($id: ID!, $lines: [CartLineUpdateInput!]!) { cartLinesUpdate(cartId: $id, lines: $lines) { cart { ${CART} } } }`,
      { id, lines: [{ id: lineId, quantity }] },
      0,
    );
    return mapCart(d.cartLinesUpdate.cart);
  },
};
