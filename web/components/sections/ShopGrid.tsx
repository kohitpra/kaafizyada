"use client";

import Link from "next/link";
import { useState } from "react";
import { shopGrid } from "@/content/copy";
import type { Product } from "@/lib/commerce/types";
import { ProductCard } from "@/components/commerce/ProductCard";
import s from "./ShopGrid.module.css";

const TABS = [
  { label: "Everything", type: null },
  { label: "Tops", type: "Tops" },
  { label: "Bottoms", type: "Bottoms" },
  { label: "Sarees, sets & jackets", type: ["Sarees", "Sets", "Jackets", "Dresses"] },
  { label: "Accessories", type: "Accessories" },
] as const;

export function ShopGrid({ products }: { products: Product[] }) {
  const [tab, setTab] = useState(0);
  const t = TABS[tab].type;
  const list = products
    .filter((p) => (t === null ? true : Array.isArray(t) ? (t as readonly string[]).includes(p.productType) : p.productType === t))
    .slice(0, 8);

  return (
    <section id="shop" className={s.root} aria-labelledby="shop-title">
      <div className="container">
        <header className={s.head}>
          <div>
            <h2 id="shop-title" className="poster">
              {shopGrid.title}
            </h2>
            <p className={`hand ${s.note}`}>{shopGrid.note}</p>
          </div>
          <p className={s.intro}>{shopGrid.intro}</p>
        </header>

        <div className={s.tabs} role="tablist" aria-label="Filter products">
          {TABS.map((x, i) => (
            <button key={x.label} role="tab" aria-selected={tab === i} className={s.tab} onClick={() => setTab(i)}>
              {x.label}
            </button>
          ))}
        </div>

        <div className={s.grid} role="tabpanel" aria-live="polite">
          {list.map((p, i) => (
            <ProductCard key={p.handle} product={p} index={i} />
          ))}
        </div>

        <div className={s.more}>
          <Link href="/shop" className="btn btn--secondary">
            {shopGrid.cta} →
          </Link>
        </div>
      </div>
    </section>
  );
}
