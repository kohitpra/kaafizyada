import type { Product, ProductQuery } from "./types";

export function optionValue(p: Product, name: string): string[] {
  return p.options.find((o) => o.name === name)?.values ?? [];
}

export function applyQuery(all: Product[], q: ProductQuery): Product[] {
  let list = [...all];

  if (q.query) {
    const terms = q.query.toLowerCase().split(/\s+/).filter(Boolean);
    list = list.filter((p) => {
      const hay = [p.title, p.tagline, p.description, p.productType, ...p.tags, ...optionValue(p, "Colour")]
        .join(" ")
        .toLowerCase();
      return terms.every((t) => hay.includes(t));
    });
  }
  if (q.type) list = list.filter((p) => p.productType.toLowerCase() === q.type!.toLowerCase());
  if (q.size)
    list = list.filter((p) =>
      p.variants.some((v) => v.availableForSale && v.selectedOptions.some((o) => o.name === "Size" && o.value === q.size)),
    );
  if (q.colour) list = list.filter((p) => optionValue(p, "Colour").some((c) => c.toLowerCase() === q.colour!.toLowerCase()));
  if (q.inStockOnly) list = list.filter((p) => p.availableForSale);

  switch (q.sort) {
    case "newest":
      list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      break;
    case "price-asc":
      list.sort((a, b) => a.priceRange.min.amount - b.priceRange.min.amount);
      break;
    case "price-desc":
      list.sort((a, b) => b.priceRange.min.amount - a.priceRange.min.amount);
      break;
  }
  return list;
}

/** Facets for the filter bar, computed from the unfiltered list so options never vanish. */
export function facets(list: Product[]) {
  const types = [...new Set(list.map((p) => p.productType))];
  const sizes = [...new Set(list.flatMap((p) => optionValue(p, "Size")))];
  const order = ["XS", "S", "M", "L", "XL", "One size"];
  sizes.sort((a, b) => (order.indexOf(a) + 1 || 99) - (order.indexOf(b) + 1 || 99) || a.localeCompare(b));
  const colours = new Map<string, string>();
  list.forEach((p) => Object.entries(p.swatches).forEach(([n, hex]) => colours.set(n, hex)));
  return { types, sizes, colours: [...colours.entries()].map(([name, hex]) => ({ name, hex })) };
}
