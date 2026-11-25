"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import s from "./RevealImage.module.css";

type Props = {
  src: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
  /** Force full colour (e.g. when the parent card is focused). */
  revealed?: boolean;
  /** On touch screens, reveal when the image is mostly in view. */
  revealOnView?: boolean;
};

/**
 * An illustration that sits in ink-monochrome until the pointer finds it.
 * The colour layer is masked by a soft circle that follows the cursor and floods
 * the whole image on hover. Pure CSS masks, no WebGL.
 */
export function RevealImage({ src, alt, sizes, priority, className, revealed, revealOnView = true }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const coarse = window.matchMedia("(hover: none)").matches;
    if (coarse && revealOnView) {
      const io = new IntersectionObserver(([e]) => el.toggleAttribute("data-on", e.intersectionRatio > 0.6), { threshold: [0, 0.6, 1] });
      io.observe(el);
      return () => io.disconnect();
    }
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${((e.clientX - r.left) / r.width) * 100}%`);
      el.style.setProperty("--my", `${((e.clientY - r.top) / r.height) * 100}%`);
    };
    const enter = (e: PointerEvent) => {
      move(e);
      el.setAttribute("data-on", "");
    };
    const leave = () => el.removeAttribute("data-on");
    const host = (el.closest("a, [data-reveal-host]") as HTMLElement) ?? el;
    host.addEventListener("pointermove", move);
    host.addEventListener("pointerenter", enter);
    host.addEventListener("pointerleave", leave);
    return () => {
      host.removeEventListener("pointermove", move);
      host.removeEventListener("pointerenter", enter);
      host.removeEventListener("pointerleave", leave);
    };
  }, [revealOnView]);

  return (
    <div ref={ref} className={`${s.wrap} ${className ?? ""}`} data-forced={revealed ? "" : undefined}>
      <Image className={s.ink} src={src} alt={alt} fill sizes={sizes} priority={priority} />
      <Image className={s.colour} src={src} alt="" aria-hidden fill sizes={sizes} priority={priority} />
    </div>
  );
}
