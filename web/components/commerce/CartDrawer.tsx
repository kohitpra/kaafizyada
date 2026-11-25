"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { formatMoney } from "@/lib/format";
import { setScrollLocked } from "@/components/layout/SmoothScroll";
import { useCart } from "./CartProvider";
import s from "./CartDrawer.module.css";

const FREE_SHIPPING = 1999;

export function CartDrawer() {
  const { cart, isOpen, close, update, pending, mode } = useCart();
  const panel = useRef<HTMLDivElement>(null);
  const opener = useRef<Element | null>(null);

  useEffect(() => {
    setScrollLocked(isOpen);
    if (isOpen) {
      opener.current = document.activeElement;
      setTimeout(() => panel.current?.querySelector<HTMLElement>("button, a")?.focus(), 50);
    } else if (opener.current instanceof HTMLElement) {
      opener.current.focus();
    }
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      // Simple focus trap
      if (e.key === "Tab" && panel.current) {
        const f = panel.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])');
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, close]);

  const remaining = Math.max(0, FREE_SHIPPING - cart.subtotal.amount);
  const progress = Math.min(1, cart.subtotal.amount / FREE_SHIPPING);

  return (
    <div className={s.root} data-open={isOpen ? "" : undefined} aria-hidden={!isOpen} inert={!isOpen}>
      <button className={s.scrim} aria-label="Close bag" tabIndex={-1} onClick={close} />
      <div ref={panel} className={s.panel} role="dialog" aria-modal="true" aria-labelledby="bag-title">
        <div className={s.head}>
          <h2 id="bag-title" className="poster">
            Your bag <span className={s.qty}>({cart.totalQuantity})</span>
          </h2>
          <button className={s.close} onClick={close} aria-label="Close bag">
            <svg viewBox="0 0 24 24" aria-hidden>
              <path d="M5 5l14 14M19 5 5 19" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {cart.lines.length > 0 && (
          <div className={s.ship} aria-live="polite">
            <p>{remaining > 0 ? <>Add <b>{formatMoney({ amount: remaining, currencyCode: "INR" })}</b> more for free shipping</> : <>Free shipping unlocked. <span className="hand">shabaash!</span></>}</p>
            <div className={s.bar}><span style={{ transform: `scaleX(${progress})` }} /></div>
          </div>
        )}

        {cart.lines.length === 0 ? (
          <div className={s.empty}>
            <p className="serif">Bag is empty.</p>
            <p className="hand">itna khaali? not very kaafizyada of you.</p>
            <Link href="/shop" className="btn" onClick={close}>
              Shop the gully
            </Link>
          </div>
        ) : (
          <ul className={s.lines}>
            {cart.lines.map((l) => (
              <li key={l.id} className={s.line}>
                <Link href={`/products/${l.productHandle}`} className={s.thumb} onClick={close} tabIndex={-1}>
                  {l.image && <Image src={l.image.url} alt={l.image.alt} fill sizes="96px" />}
                </Link>
                <div className={s.info}>
                  <Link href={`/products/${l.productHandle}`} onClick={close} className={s.title}>
                    {l.productTitle}
                  </Link>
                  <p className={s.variant}>{l.variantTitle}</p>
                  <div className={s.row}>
                    <div className={s.stepper} role="group" aria-label={`Quantity for ${l.productTitle}`}>
                      <button onClick={() => update(l.id, l.quantity - 1)} disabled={pending} aria-label="Decrease quantity">−</button>
                      <span aria-live="polite">{l.quantity}</span>
                      <button
                        onClick={() => update(l.id, l.quantity + 1)}
                        disabled={pending || (l.maxQuantity !== null && l.quantity >= l.maxQuantity)}
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                    <p className={s.price}>{formatMoney({ amount: l.price.amount * l.quantity, currencyCode: l.price.currencyCode })}</p>
                  </div>
                  {l.maxQuantity !== null && l.quantity >= l.maxQuantity && <p className={s.limit}>That's all we have in this size.</p>}
                  <button className={s.remove} onClick={() => update(l.id, 0)} disabled={pending}>
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {cart.lines.length > 0 && (
          <div className={s.foot}>
            <div className={s.subtotal}>
              <span>Subtotal</span>
              <span className="serif">{formatMoney(cart.subtotal)}</span>
            </div>
            <p className={s.note}>Taxes included. Shipping calculated at checkout.</p>
            {mode === "shopify" && cart.checkoutUrl ? (
              <a className="btn btn--block" href={cart.checkoutUrl}>
                Checkout
              </a>
            ) : (
              <>
                <button className="btn btn--block" aria-disabled="true" disabled>
                  Checkout
                </button>
                <p className={s.demo}>
                  <b>Demo store:</b> checkout switches on when the Shopify store is connected. Nothing is charged here.
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
