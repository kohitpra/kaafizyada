"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { Product } from "@/lib/commerce/types";
import { formatMoney } from "@/lib/format";
import { useCart } from "./CartProvider";
import s from "./ProductCard.module.css";

export function ProductCard({ product, priority = false, index = 0 }: { product: Product; priority?: boolean; index?: number }) {
  const { add, pending } = useCart();
  const colours = product.options.find((o) => o.name === "Colour")?.values ?? [];
  const sizes = product.options.find((o) => o.name === "Size")?.values ?? [];
  const [colour, setColour] = useState(colours[0]);
  const [size, setSize] = useState<string | null>(sizes.length <= 1 ? sizes[0] ?? null : null);
  const [added, setAdded] = useState(false);

  const variantFor = (sz: string | null) =>
    product.variants.find(
      (v) =>
        v.selectedOptions.every((o) => (o.name === "Colour" ? o.value === colour : o.name === "Size" ? o.value === sz : true)),
    );
  const variant = useMemo(() => (size || sizes.length === 0 ? variantFor(size) : undefined), [size, colour]); // eslint-disable-line react-hooks/exhaustive-deps

  const colourImages = product.variants.find((v) => v.selectedOptions.some((o) => o.name === "Colour" && o.value === colour))?.image;
  const main = colourImages ?? product.images[0];
  const look = product.images.find((i) => /look/.test(i.url)) ?? product.images[1];
  const isNew = product.tags.includes("new");
  const onSale = product.variants[0]?.compareAtPrice;
  const href = `/products/${product.handle}${colours.length > 1 ? `?colour=${encodeURIComponent(colour)}` : ""}`;

  async function onAdd() {
    if (!variant || !variant.availableForSale) return;
    await add(product, variant, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  }

  return (
    <article className={s.card} style={{ ["--rot" as string]: `${((index % 3) - 1) * 0.6}deg` }}>
      <Link href={href} className={s.media} data-cursor-marquee-text="Dekho toh →">
        {main && <Image src={main.url} alt={main.alt} fill sizes="(min-width: 1024px) 24vw, (min-width: 640px) 32vw, 48vw" priority={priority} className={s.main} />}
        {look && look.url !== main?.url && <Image src={look.url} alt="" aria-hidden fill sizes="(min-width: 1024px) 24vw, 32vw" className={s.look} />}
        <span className={s.badges}>
          {isNew && <span className={`${s.badge} ${s.new}`}>New</span>}
          {onSale && <span className={`${s.badge} ${s.sale}`}>Sale</span>}
          {!product.availableForSale && <span className={`${s.badge} ${s.out}`}>Sold out</span>}
        </span>
      </Link>

      <div className={s.body}>
        <div className={s.titleRow}>
          <h3 className={s.title}>
            <Link href={href}>{product.title}</Link>
          </h3>
          <p className={s.price}>
            {formatMoney(product.priceRange.min)}
            {onSale && <s className={s.was}>{formatMoney(onSale)}</s>}
          </p>
        </div>
        <p className={s.tagline}>{product.tagline}</p>

        {colours.length > 0 && (
          <div className={s.swatches} role="radiogroup" aria-label="Colour">
            {colours.map((c) => (
              <button
                key={c}
                role="radio"
                aria-checked={c === colour}
                aria-label={c}
                title={c}
                className={s.swatch}
                style={{ background: product.swatches[c] ?? "#ccc" }}
                onClick={() => setColour(c)}
              />
            ))}
            {colours.length === 1 && <span className={s.colourName}>{colours[0]}</span>}
          </div>
        )}

        <div className={s.quick}>
          {sizes.length > 1 && (
            <div className={s.sizes} role="radiogroup" aria-label={`Size for ${product.title}`}>
              {sizes.map((sz) => {
                const v = variantFor(sz);
                const soldOut = !v?.availableForSale;
                return (
                  <button
                    key={sz}
                    role="radio"
                    aria-checked={size === sz}
                    disabled={soldOut}
                    className={s.size}
                    onClick={() => setSize(sz)}
                    aria-label={`${sz}${soldOut ? ", sold out" : ""}`}
                  >
                    {sz}
                  </button>
                );
              })}
            </div>
          )}
          <button className={`btn btn--block ${s.add}`} onClick={onAdd} disabled={pending || !variant || !variant.availableForSale} data-added={added ? "" : undefined}>
            {added ? "Added ✓" : !product.availableForSale ? "Sold out" : sizes.length > 1 && !size ? "Pick a size" : variant && !variant.availableForSale ? "Sold out" : "Add to bag"}
          </button>
          {variant?.quantityAvailable !== null && variant?.quantityAvailable !== undefined && variant.quantityAvailable > 0 && variant.quantityAvailable <= 3 && (
            <p className={s.low}>Only {variant.quantityAvailable} left</p>
          )}
        </div>
      </div>
    </article>
  );
}
