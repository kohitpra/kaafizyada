import { Suspense } from "react";
import type { Product, ProductQuery, SortKey } from "@/lib/commerce/types";
import { applyQuery, facets } from "@/lib/commerce/filter";
import { ProductCard } from "./ProductCard";
import { FilterBar } from "./FilterBar";
import s from "./ProductListing.module.css";

export type ListingSearch = { type?: string; size?: string; colour?: string; sort?: string; stock?: string };

export function toQuery(sp: ListingSearch): ProductQuery {
  return {
    type: sp.type,
    size: sp.size,
    colour: sp.colour,
    sort: (sp.sort as SortKey) || undefined,
    inStockOnly: sp.stock === "1",
  };
}

/** Shared grid for /shop, /collections/[handle] and /search. `base` is the unfiltered set (for facets). */
export function ProductListing({ base, search, empty }: { base: Product[]; search: ListingSearch; empty?: React.ReactNode }) {
  const list = applyQuery(base, toQuery(search));
  return (
    <>
      <Suspense>
        <FilterBar facets={facets(base)} count={list.length} />
      </Suspense>
      {list.length ? (
        <div className={s.grid}>
          {list.map((p, i) => (
            <ProductCard key={p.handle} product={p} index={i} priority={i < 4} />
          ))}
        </div>
      ) : (
        <div className={s.empty}>
          {empty ?? (
            <>
              <p className="serif">Nothing here, yaar.</p>
              <p className="hand">try fewer filters?</p>
            </>
          )}
        </div>
      )}
    </>
  );
}
