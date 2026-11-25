"use client";

// Small motion layer ported from the Kolibrie studio reference (GSAP 3, plugins now free in the npm package):
//  - cursor marquee: a turmeric pill that follows the pointer and scrolls its label over [data-cursor-marquee-text]
//  - momentum hover: [data-momentum] cards get flicked by the pointer's velocity (InertiaPlugin)
//  - marquee flip: [data-marquee-track] tickers reverse direction with the scroll direction
// All of it is skipped on touch screens and for reduced motion.

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { InertiaPlugin } from "gsap/InertiaPlugin";
import s from "./MotionExtras.module.css";

gsap.registerPlugin(ScrollTrigger, InertiaPlugin);

export function MotionExtras() {
  const pill = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);
  const label2 = useRef<HTMLSpanElement>(null);
  const pathname = usePathname();

  // ---------- cursor marquee ----------
  useEffect(() => {
    const el = pill.current!;
    const mm = gsap.matchMedia();
    mm.add("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)", () => {
      const qx = gsap.quickTo(el, "x", { duration: 0.4, ease: "power3" });
      const qy = gsap.quickTo(el, "y", { duration: 0.4, ease: "power3" });
      let cur: Element | null = null, ex = 0, ey = 0, started = false;
      const set = (t: Element | null) => {
        if (t === cur) return;
        cur = t;
        if (t) {
          const text = t.getAttribute("data-cursor-marquee-text") || "";
          label.current!.textContent = text;
          label2.current!.textContent = text;
          el.style.setProperty("--dur", `${Math.max(1.6, text.length / 6)}s`);
          el.dataset.on = "";
        } else delete el.dataset.on;
      };
      const check = () => {
        const hit = document.elementFromPoint(ex, ey);
        set(hit?.closest("[data-cursor-marquee-text]") ?? null);
      };
      const move = (e: PointerEvent) => {
        ex = e.clientX;
        ey = e.clientY;
        if (!started) {
          started = true;
          gsap.set(el, { x: ex, y: ey });
        }
        qx(ex);
        qy(ey);
        check();
      };
      const scroll = () => started && check();
      window.addEventListener("pointermove", move, { passive: true });
      window.addEventListener("scroll", scroll, { passive: true });
      return () => {
        window.removeEventListener("pointermove", move);
        window.removeEventListener("scroll", scroll);
        set(null);
      };
    });
    return () => mm.revert();
  }, []);

  // ---------- momentum hover + marquee flip ----------
  useEffect(() => {
    const mm = gsap.matchMedia();
    mm.add("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)", () => {
      let px = 0, py = 0, vx = 0, vy = 0, raf = 0, started = false;
      const cv = gsap.utils.clamp(-1080, 1080), cr = gsap.utils.clamp(-60, 60);
      const move = (e: MouseEvent) => {
        if (!started) {
          started = true;
          px = e.clientX;
          py = e.clientY;
          return;
        }
        if (raf) return;
        const x = e.clientX, y = e.clientY;
        raf = requestAnimationFrame(() => {
          vx = x - px;
          vy = y - py;
          px = x;
          py = y;
          raf = 0;
        });
      };
      const enter = (e: Event) => {
        const host = (e.target as HTMLElement).closest("[data-momentum]");
        const tg = host?.querySelector<HTMLElement>("[data-momentum-target]") ?? (host as HTMLElement | null);
        if (!tg) return;
        const me = e as MouseEvent;
        const r = tg.getBoundingClientRect();
        const dx = me.clientX - (r.left + r.width / 2), dy = me.clientY - (r.top + r.height / 2);
        const torque = (dx * vy - dy * vx) / (Math.hypot(dx, dy) || 1);
        gsap.to(tg, {
          inertia: { x: { velocity: cv(vx * 24), end: 0 }, y: { velocity: cv(vy * 24), end: 0 }, rotation: { velocity: cr(torque * 16), end: 0 }, resistance: 200 },
        });
      };
      // delegated, so cards rendered after navigation work too
      const over = (e: MouseEvent) => {
        const host = (e.target as HTMLElement).closest?.("[data-momentum]");
        if (host && !host.contains(e.relatedTarget as Node)) enter(e);
      };
      window.addEventListener("mousemove", move, { passive: true });
      document.addEventListener("mouseover", over);
      return () => {
        window.removeEventListener("mousemove", move);
        document.removeEventListener("mouseover", over);
      };
    });
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const tweens: gsap.core.Tween[] = [];
      const sts: ScrollTrigger[] = [];
      document.querySelectorAll<HTMLElement>("[data-marquee-track]").forEach((track) => {
        const dir = track.dataset.marqueeTrack === "right" ? 1 : -1;
        const dur = parseFloat(track.dataset.marqueeDuration || "38");
        track.style.animation = "none";
        const tw = gsap.fromTo(track, { xPercent: dir === -1 ? 0 : -50 }, { xPercent: dir === -1 ? -50 : 0, duration: dur, ease: "none", repeat: -1 });
        tweens.push(tw);
        sts.push(
          ScrollTrigger.create({
            trigger: track,
            start: "top bottom",
            end: "bottom top",
            onUpdate: (st) => gsap.to(tw, { timeScale: st.direction === 1 ? 1 : -1, duration: 0.4, overwrite: true }),
          }),
        );
      });
      return () => {
        tweens.forEach((t) => t.kill());
        sts.forEach((t) => t.kill());
        document.querySelectorAll<HTMLElement>("[data-marquee-track]").forEach((t) => (t.style.animation = ""));
      };
    });
    return () => mm.revert();
  }, [pathname]);

  return (
    <div ref={pill} className={s.cursor} aria-hidden>
      <div className={s.card}>
        <span ref={label} className={s.text} />
        <span ref={label2} className={`${s.text} ${s.dup}`} />
      </div>
    </div>
  );
}
