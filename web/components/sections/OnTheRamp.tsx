"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ramp } from "@/content/copy";
import type { Product } from "@/lib/commerce/types";
import { formatMoney } from "@/lib/format";
import s from "./OnTheRamp.module.css";

gsap.registerPlugin(ScrollTrigger);

/**
 * The newest looks walking the ramp.
 * Desktop: a pinned 3D stack of look cards; scrolling drops the front look off the ramp and the rest
 * step forward (ported from the Kolibrie "featured stack": depth 120px, 40px lift per card, mouse tilt).
 * Touch / narrow / reduced motion: a native swipe rail with arrows.
 */
export function OnTheRamp({ products }: { products: Product[] }) {
  const rail = useRef<HTMLOListElement>(null);
  const stackRoot = useRef<HTMLDivElement>(null);
  const [stackOn, setStackOn] = useState(false);
  const [active, setActive] = useState(0);
  const looks = products
    .map((p) => ({ p, img: p.images.find((i) => /look/.test(i.url)) ?? p.images[0] }))
    .filter((l) => l.img);

  useEffect(() => {
    const el = rail.current;
    if (!el) return;
    const items = [...el.children] as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(items.indexOf(e.target as HTMLElement))),
      { root: el, threshold: 0.6 },
    );
    items.forEach((i) => io.observe(i));

    // drag to scroll with a mouse
    let down = false, startX = 0, startLeft = 0, moved = false;
    const pd = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      down = true; moved = false; startX = e.clientX; startLeft = el.scrollLeft;
      el.style.scrollSnapType = "none";
    };
    const pm = (e: PointerEvent) => {
      if (!down) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 4) moved = true;
      el.scrollLeft = startLeft - dx;
    };
    const pu = () => {
      if (!down) return;
      down = false;
      el.style.scrollSnapType = "";
    };
    const click = (e: MouseEvent) => moved && (e.preventDefault(), e.stopPropagation());
    el.addEventListener("pointerdown", pd);
    window.addEventListener("pointermove", pm);
    window.addEventListener("pointerup", pu);
    el.addEventListener("click", click, true);
    return () => {
      io.disconnect();
      el.removeEventListener("pointerdown", pd);
      window.removeEventListener("pointermove", pm);
      window.removeEventListener("pointerup", pu);
      el.removeEventListener("click", click, true);
    };
  }, []);

  useEffect(() => {
    const root = stackRoot.current;
    if (!root) return;
    const mm = gsap.matchMedia();
    mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference) and (hover: hover)", () => {
      setStackOn(true);
      const pin = root.querySelector<HTMLElement>("[data-pin]")!;
      const stack = root.querySelector<HTMLElement>("[data-stack]")!;
      const slides = [...root.querySelectorAll<HTMLElement>("[data-slide]")];
      const badge = root.querySelector<HTMLElement>("[data-badge]");
      const depth = 120, off = 34, step = 1, keep = 4;
      slides.forEach((el, i) => gsap.set(el, { z: -i * depth, y: -i * off, zIndex: slides.length - i, autoAlpha: i < keep ? 1 : 0 }));
      const tl = gsap.timeline({ paused: true });
      if (badge) tl.fromTo(badge, { rotation: 0 }, { rotation: 220, ease: "none", duration: (slides.length - 1) * step }, 0);
      slides.forEach((el, i) => {
        if (i === slides.length - 1) return;
        const at = i * step;
        tl.to(el, { y: "+=" + window.innerHeight * 0.95, rotation: i % 2 ? 6 : -6, ease: "power2.in", duration: step }, at);
        tl.to(el, { autoAlpha: 0, ease: "none", duration: step * 0.25 }, at + step * 0.7);
        slides.slice(i + 1).forEach((next, j) =>
          tl.to(next, { z: -j * depth, y: -j * off, autoAlpha: j < keep ? 1 : 0, ease: "none", duration: step }, at),
        );
      });
      const counter = root.querySelector<HTMLElement>("[data-count]");
      const st = ScrollTrigger.create({
        trigger: root,
        start: "top top",
        end: () => "+=" + window.innerHeight * 0.8 * (slides.length - 1),
        pin,
        scrub: 0.3,
        invalidateOnRefresh: true,
        onUpdate: (e) => {
          tl.progress(e.progress);
          if (counter) counter.textContent = String(Math.min(slides.length, Math.round(e.progress * (slides.length - 1)) + 1)).padStart(2, "0");
        },
      });
      const rx = gsap.quickTo(stack, "rotationX", { duration: 0.6, ease: "power3" });
      const ry = gsap.quickTo(stack, "rotationY", { duration: 0.6, ease: "power3" });
      const move = (e: MouseEvent) => {
        const b = pin.getBoundingClientRect();
        rx(-((e.clientY - b.top) / b.height - 0.5) * 6);
        ry(((e.clientX - b.left) / b.width - 0.5) * 10);
      };
      const leave = () => (rx(0), ry(0));
      pin.addEventListener("mousemove", move);
      pin.addEventListener("mouseleave", leave);
      return () => {
        pin.removeEventListener("mousemove", move);
        pin.removeEventListener("mouseleave", leave);
        st.kill();
        tl.kill();
        gsap.set([stack, ...slides, badge], { clearProps: "all" });
        setStackOn(false);
      };
    });
    return () => mm.revert();
  }, []);

  const go = (dir: 1 | -1) => {
    const el = rail.current;
    if (!el) return;
    const next = Math.max(0, Math.min(looks.length - 1, active + dir));
    (el.children[next] as HTMLElement).scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  };

  return (
    <section className={s.root} aria-labelledby="ramp-title" data-stack={stackOn ? "" : undefined}>
      {/* desktop: pinned 3D stack (only mounted visually when motion is allowed) */}
      <div ref={stackRoot} className={s.stackRoot} aria-hidden={!stackOn}>
        <div className={s.pin} data-pin>
          <div className={s.stackCopy}>
            <h2 className="poster" aria-hidden>
              {ramp.title}
            </h2>
            <p className={s.intro}>{ramp.intro}</p>
            <p className={`hand ${s.scrollNote}`}>scroll karo, ramp chalega ↓</p>
            <p className={s.stackCount}>
              <span data-count>01</span> / {String(looks.length).padStart(2, "0")}
            </p>
          </div>
          <div className={s.stage}>
            <div className={s.stack} data-stack>
              {looks.map(({ p, img }, i) => (
                <div key={p.handle} className={s.slide} data-slide>
                  <Link href={`/products/${p.handle}`} className={s.stackCard} tabIndex={stackOn ? 0 : -1} data-cursor-marquee-text="Shop the look →">
                    <span className={s.stackMedia}>
                      <Image src={img!.url} alt={stackOn ? img!.alt : ""} fill sizes="34vw" />
                    </span>
                    <span className={s.stackShade} />
                    <span className={s.stackName}>{p.title}</span>
                    <span className={s.stackPrice}>{formatMoney(p.priceRange.min)}</span>
                    <span className={s.tag} aria-hidden>
                      Look {String(i + 1).padStart(2, "0")}
                    </span>
                  </Link>
                </div>
              ))}
            </div>
            <div className={s.badge} data-badge aria-hidden>
              <svg viewBox="0 0 200 200">
                <circle cx="100" cy="100" r="98" fill="var(--turmeric)" stroke="var(--ink)" strokeWidth="4" />
                <defs>
                  <path id="rampBadge" d="M100 100m-70 0a70 70 0 1 1 140 0a70 70 0 1 1-140 0" />
                </defs>
                <text fill="var(--ink)" style={{ fontFamily: "var(--font-poster)", fontSize: 22, letterSpacing: 1 }}>
                  <textPath href="#rampBadge" textLength="436" lengthAdjust="spacing">
                    NEW · DROP · DESI · EXTRA · NEW · DROP ·
                  </textPath>
                </text>
                <path d="M100 76l6 17 18 1-14 11 5 17-15-10-15 10 5-17-14-11 18-1z" fill="var(--cherry)" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className={s.railWrap}>
      <div className={`container ${s.head}`}>
        <div>
          <h2 id="ramp-title" className="poster">
            {ramp.title}
          </h2>
          <p className={s.intro}>{ramp.intro}</p>
        </div>
        <div className={s.controls}>
          <span className="hand">{ramp.note}</span>
          <button className={s.arrow} onClick={() => go(-1)} aria-label="Previous look" disabled={active === 0}>
            ←
          </button>
          <span className={s.count} aria-live="polite">
            {String(active + 1).padStart(2, "0")} / {String(looks.length).padStart(2, "0")}
          </span>
          <button className={s.arrow} onClick={() => go(1)} aria-label="Next look" disabled={active === looks.length - 1}>
            →
          </button>
        </div>
      </div>

      <ol ref={rail} className={s.rail} aria-label="Looks">
        {looks.map(({ p, img }, i) => (
          <li key={p.handle} className={s.look} data-active={i === active ? "" : undefined}>
            <Link href={`/products/${p.handle}`} className={s.card} draggable={false}>
              <span className={s.media}>
                <Image src={img!.url} alt={img!.alt} fill sizes="(min-width: 1024px) 30vw, 78vw" draggable={false} />
              </span>
              <span className={s.tag} aria-hidden>
                Look {String(i + 1).padStart(2, "0")}
              </span>
              <span className={s.meta}>
                <span className={`serif ${s.name}`}>{p.title}</span>
                <span className={s.line}>
                  {formatMoney(p.priceRange.min)} · <u>Shop the look</u>
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ol>
      </div>
    </section>
  );
}
