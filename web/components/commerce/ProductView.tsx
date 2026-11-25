"use client";

import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import type { Product } from "@/lib/commerce/types";
import { formatMoney } from "@/lib/format";
import { useCart } from "./CartProvider";
import { SizeGuide } from "./SizeGuide";
import s from "./ProductView.module.css";

export function ProductView({ product }: { product: Product }) {
  const params = useSearchParams();
  const { add, pending } = useCart();
  const colours = product.options.find((o) => o.name === "Colour")?.values ?? [];
  const sizes = product.options.find((o) => o.name === "Size")?.values ?? [];
  const initialColour = colours.find((c) => c === params.get("colour")) ?? colours[0];
  const [colour, setColour] = useState(initialColour);
  const [size, setSize] = useState<string | null>(sizes.length === 1 ? sizes[0] : null);
  const [qty, setQty] = useState(1);
  const [notes, setNotes] = useState(true);
  const [zoom, setZoom] = useState<number | null>(null);
  const [error, setError] = useState("");
  const guide = useRef<HTMLDialogElement>(null);

  const variantFor = (sz: string | null) =>
    product.variants.find((v) => v.selectedOptions.every((o) => (o.name === "Colour" ? o.value === colour : o.name === "Size" ? o.value === sz : true)));
  const variant = sizes.length === 0 ? variantFor(null) : size ? variantFor(size) : undefined;

  // Images for the chosen colour first (its garment shot), then the shared look/detail shots.
  const images = useMemo(() => {
    const colourImg = variantFor(sizes[0] ?? null)?.image;
    const others = product.images.filter((i) => i.url !== colourImg?.url && !product.variants.some((v) => v.image?.url === i.url && !v.selectedOptions.some((o) => o.value === colour)));
    return colourImg ? [colourImg, ...others] : product.images;
  }, [colour]); // eslint-disable-line react-hooks/exhaustive-deps

  const price = variant?.price ?? product.priceRange.min;
  const compare = (variant ?? product.variants[0])?.compareAtPrice;
  const qtyMax = variant?.quantityAvailable ?? 10;

  async function onAdd() {
    if (sizes.length > 1 && !size) {
      setError("Pick a size first.");
      return;
    }
    if (!variant?.availableForSale) return;
    setError("");
    await add(product, variant, qty);
  }

  const stock = (() => {
    if (!variant) return null;
    if (!variant.availableForSale) return { tone: "out", text: "Sold out in this size" };
    if (variant.quantityAvailable !== null && variant.quantityAvailable <= 3) return { tone: "low", text: `Only ${variant.quantityAvailable} left` };
    return { tone: "ok", text: "In stock, ships in 24 hours" };
  })();

  return (
    <div className={s.wrap}>
      {/* ---------- gallery ---------- */}
      <div className={s.gallery} aria-label="Product images">
        {images.map((img, i) => (
          <figure key={img.url} className={s.shot}>
            <button className={s.zoomBtn} onClick={() => setZoom(i)} aria-label={`Zoom image ${i + 1}: ${img.alt}`}>
              <Image src={img.url} alt={img.alt} fill sizes="(min-width: 1024px) 50vw, 100vw" priority={i === 0} />
            </button>
            {i === 0 && notes && product.callouts.length > 0 && (
              <div className={s.callouts} aria-hidden>
                {product.callouts.map((c, k) => (
                  <span key={k} className={s.callout} style={{ left: `${c.x * 100}%`, top: `${c.y * 100}%`, ["--k" as string]: k }}>
                    <span className={s.dot} />
                    <span className={`hand ${s.note}`}>{c.label}</span>
                  </span>
                ))}
              </div>
            )}
          </figure>
        ))}
      </div>

      {/* ---------- buy box ---------- */}
      <div className={s.info}>
        <div className={s.sticky}>
          <p className="micro">{product.productType}</p>
          <h1 className={`serif ${s.title}`}>{product.title}</h1>
          <p className={`hand ${s.tagline}`}>{product.tagline}</p>
          <p className={s.price}>
            {formatMoney(price)}
            {compare && <s>{formatMoney(compare)}</s>}
            <span className={s.tax}>incl. taxes</span>
          </p>

          {colours.length > 0 && (
            <fieldset className={s.field}>
              <legend>
                Colour: <b>{colour}</b>
              </legend>
              <div className={s.swatches}>
                {colours.map((c) => (
                  <button key={c} className={s.swatch} aria-pressed={c === colour} aria-label={c} title={c} style={{ background: product.swatches[c] }} onClick={() => setColour(c)} />
                ))}
              </div>
            </fieldset>
          )}

          {sizes.length > 1 && (
            <fieldset className={s.field}>
              <legend>
                Size: <b>{size ?? "pick one"}</b>
                {product.sizeChart === "apparel" && (
                  <button className={s.guideBtn} type="button" onClick={() => guide.current?.showModal()}>
                    Size guide
                  </button>
                )}
              </legend>
              <div className={s.sizes} role="radiogroup" aria-label="Size">
                {sizes.map((z) => {
                  const v = variantFor(z);
                  const out = !v?.availableForSale;
                  return (
                    <button key={z} role="radio" aria-checked={size === z} className={s.size} data-out={out ? "" : undefined} onClick={() => { setSize(z); setQty(1); setError(""); }} aria-label={`${z}${out ? ", sold out" : ""}`}>
                      {z}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          )}

          {stock && <p className={s.stock} data-tone={stock.tone}>{stock.text}</p>}

          <div className={s.buy}>
            <div className={s.qty} role="group" aria-label="Quantity">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease quantity" disabled={qty <= 1}>−</button>
              <span aria-live="polite">{qty}</span>
              <button onClick={() => setQty((q) => Math.min(qtyMax, q + 1))} aria-label="Increase quantity" disabled={qty >= qtyMax}>+</button>
            </div>
            <button className="btn btn--block" onClick={onAdd} disabled={pending || (!!variant && !variant.availableForSale) || !product.availableForSale}>
              {!product.availableForSale ? "Sold out" : variant && !variant.availableForSale ? "Sold out" : "Add to bag"}
            </button>
          </div>
          {error && <p className={s.error} role="alert">{error}</p>}

          <ul className={s.perks}>
            <li>Free shipping over ₹1,999</li>
            <li>7-day exchanges</li>
            <li>COD available</li>
          </ul>

          {product.callouts.length > 0 && (
            <button className={s.noteToggle} onClick={() => setNotes((n) => !n)} aria-pressed={notes}>
              {notes ? "Hide" : "Show"} detail notes
            </button>
          )}

          <div className={s.details}>
            <p>{product.description}</p>
            <details open>
              <summary>Fabric & fit</summary>
              <dl>
                <dt>Fabric</dt><dd>{product.details.fabric}</dd>
                <dt>Fit</dt><dd>{product.details.fit}</dd>
                <dt>Made in</dt><dd>{product.details.madeIn}</dd>
              </dl>
            </details>
            <details>
              <summary>Care</summary>
              <p>{product.details.care}</p>
            </details>
            <details>
              <summary>Shipping & exchanges</summary>
              <p>Ships in 24 hours. Metro cities in 3–5 working days, rest of India in 5–8. Exchange or return unworn pieces within 7 days.</p>
            </details>
          </div>
        </div>
      </div>

      {product.sizeChart === "apparel" && <SizeGuide ref={guide} />}

      {zoom !== null && (
        <div className={s.lightbox} role="dialog" aria-modal="true" aria-label="Zoomed image" onClick={() => setZoom(null)} onKeyDown={(e) => e.key === "Escape" && setZoom(null)}>
          <Image src={images[zoom].url} alt={images[zoom].alt} fill sizes="100vw" className={s.zoomImg} />
          <button className={s.closeZoom} autoFocus aria-label="Close zoom" onClick={() => setZoom(null)}>
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
