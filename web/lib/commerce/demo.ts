import { demoCollections, demoProducts } from "./demo-data";
import { applyQuery } from "./filter";
import type { Collection, Product, ProductQuery } from "./types";

const inCollection = (p: Product, handle: string) => {
  if (handle === "all") return true;
  if (handle === "new-arrivals") return p.tags.includes("new");
  return p.tags.includes(handle);
};

export const demoProvider = {
  async getProducts(q: ProductQuery = {}): Promise<Product[]> {
    const base = q.collection ? demoProducts.filter((p) => inCollection(p, q.collection!)) : demoProducts;
    return applyQuery(base, q);
  },
  async getProduct(handle: string): Promise<Product | null> {
    return demoProducts.find((p) => p.handle === handle) ?? null;
  },
  async getCollection(handle: string): Promise<Collection | null> {
    return demoCollections.find((c) => c.handle === handle) ?? null;
  },
  async getCollections(): Promise<Collection[]> {
    return demoCollections;
  },
  async getRecommendations(handle: string, count = 4): Promise<Product[]> {
    const p = demoProducts.find((x) => x.handle === handle);
    if (!p) return demoProducts.slice(0, count);
    const score = (o: Product) => o.tags.filter((t) => p.tags.includes(t)).length + (o.productType === p.productType ? 0 : 1);
    return demoProducts
      .filter((o) => o.handle !== handle)
      .sort((a, b) => score(b) - score(a))
      .slice(0, count);
  },
  async getAllHandles(): Promise<string[]> {
    return demoProducts.map((p) => p.handle);
  },
};
