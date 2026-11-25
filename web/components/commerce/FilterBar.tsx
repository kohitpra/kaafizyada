"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import s from "./FilterBar.module.css";

type Facets = { types: string[]; sizes: string[]; colours: { name: string; hex: string }[] };

const SORTS = [
  { v: "featured", l: "Featured" },
  { v: "newest", l: "Newest" },
  { v: "price-asc", l: "Price: low to high" },
  { v: "price-desc", l: "Price: high to low" },
];

export function FilterBar({ facets, count }: { facets: Facets; count: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, start] = useTransition();

  const set = (key: string, value: string | null) => {
    const next = new URLSearchParams(params.toString());
    if (value === null || next.get(key) === value) next.delete(key);
    else next.set(key, value);
    start(() => router.replace(`${pathname}${next.size ? `?${next}` : ""}`, { scroll: false }));
  };

  const active = ["type", "size", "colour", "stock"].filter((k) => params.get(k));

  return (
    <div className={s.bar} data-pending={pending ? "" : undefined}>
      <div className={s.row}>
        <fieldset className={s.group}>
          <legend className="micro">Type</legend>
          {facets.types.map((t) => (
            <button key={t} aria-pressed={params.get("type") === t} className={s.chip} onClick={() => set("type", t)}>
              {t}
            </button>
          ))}
        </fieldset>
        <fieldset className={s.group}>
          <legend className="micro">Size</legend>
          {facets.sizes.map((z) => (
            <button key={z} aria-pressed={params.get("size") === z} className={s.chip} onClick={() => set("size", z)}>
              {z}
            </button>
          ))}
        </fieldset>
        <fieldset className={s.group}>
          <legend className="micro">Colour</legend>
          {facets.colours.map((c) => (
            <button
              key={c.name}
              aria-pressed={params.get("colour") === c.name}
              className={s.swatch}
              style={{ background: c.hex }}
              title={c.name}
              aria-label={c.name}
              onClick={() => set("colour", c.name)}
            />
          ))}
        </fieldset>
      </div>
      <div className={s.row2}>
        <p className={s.count} aria-live="polite">
          {count} {count === 1 ? "piece" : "pieces"}
        </p>
        <label className={s.stock}>
          <input type="checkbox" checked={params.get("stock") === "1"} onChange={(e) => set("stock", e.target.checked ? "1" : null)} />
          In stock only
        </label>
        {active.length > 0 && (
          <button className={s.clear} onClick={() => start(() => router.replace(pathname, { scroll: false }))}>
            Clear filters
          </button>
        )}
        <label className={s.sort}>
          <span className="sr-only">Sort by</span>
          <select value={params.get("sort") ?? "featured"} onChange={(e) => set("sort", e.target.value === "featured" ? null : e.target.value)}>
            {SORTS.map((o) => (
              <option key={o.v} value={o.v}>
                {o.l}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}
