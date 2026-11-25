"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { gate as copy } from "@/content/copy";
import { setScrollLocked } from "@/components/layout/SmoothScroll";
import type { GateApi } from "./GateScene";
import s from "./EntryGate.module.css";

const GateScene = dynamic(() => import("./GateScene"), { ssr: false });

const SEEN = "kz-gate-seen";

/**
 * Full-screen entrance shown once per session on the home page. Knock (click/tap the doors, press
 * the button, scroll or swipe) and the doors open onto the gully hero underneath.
 * Skipped for reduced motion, missing WebGL2, and on return visits within the session.
 */
export function EntryGate() {
  const [phase, setPhase] = useState<"check" | "loading" | "idle" | "entering" | "leaving" | "gone">("check");
  const [hover, setHover] = useState(false);
  const [touch, setTouch] = useState(false);
  const api = useRef<GateApi | null>(null);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let seen = false;
    try {
      seen = sessionStorage.getItem(SEEN) === "1";
    } catch {}
    const gl2 = !!document.createElement("canvas").getContext("webgl2");
    if (reduce || seen || !gl2 || window.scrollY > 40 || location.hash) {
      setPhase("gone");
      return;
    }
    setTouch(window.matchMedia("(hover: none)").matches);
    setPhase("loading");
    setScrollLocked(true);
    window.scrollTo(0, 0);
  }, []);

  const finish = useCallback(() => {
    try {
      sessionStorage.setItem(SEEN, "1");
    } catch {}
    setPhase("leaving");
    setScrollLocked(false);
    window.setTimeout(() => setPhase("gone"), 700);
  }, []);

  const enter = useCallback(() => {
    if (!api.current) return finish();
    setPhase((p) => (p === "idle" || p === "loading" ? "entering" : p));
    api.current.enter();
  }, [finish]);

  // scrolling or swiping down also knocks
  useEffect(() => {
    if (phase !== "idle") return;
    const onWheel = (e: WheelEvent) => e.deltaY > 8 && enter();
    let y0 = 0;
    const onStart = (e: TouchEvent) => (y0 = e.touches[0].clientY);
    const onMove = (e: TouchEvent) => y0 - e.touches[0].clientY > 40 && enter();
    const onKey = (e: KeyboardEvent) => {
      if (["ArrowDown", "PageDown", " "].includes(e.key) && !(e.target as HTMLElement).closest("button, a")) {
        e.preventDefault();
        enter();
      }
      if (e.key === "Escape") finish();
    };
    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchmove", onMove, { passive: true });
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onStart);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("keydown", onKey);
    };
  }, [phase, enter, finish]);

  useEffect(() => {
    if (phase === "gone") document.documentElement.removeAttribute("data-gate");
    else if (phase !== "check") document.documentElement.setAttribute("data-gate", phase);
  }, [phase]);

  const onReady = useCallback(() => setPhase((p) => (p === "loading" ? "idle" : p)), []);

  // slow connection: don't hold the shop hostage, let people in after a while
  useEffect(() => {
    if (phase !== "loading") return;
    const id = window.setTimeout(finish, 12000);
    return () => window.clearTimeout(id);
  }, [phase, finish]);

  if (phase === "gone") return null;

  return (
    <div ref={root} className={s.gate} data-phase={phase} data-hover={hover ? "" : undefined} role="dialog" aria-modal="true" aria-label={copy.label}>
      {phase !== "check" && (
        <div className={s.canvas}>
          <GateScene apiRef={api} onReady={onReady} onHover={setHover} onEntered={finish} onKnock={enter} />
        </div>
      )}

      <div className={s.loader} aria-hidden>
        <span className="hand">{copy.loading}</span>
      </div>

      <div className={s.copy}>
        <p className={`${s.knock} poster`}>{copy.title}</p>
        <p className={`${s.hint} hand`}>{touch ? copy.hintTouch : copy.hintPointer}</p>
        <button type="button" className="btn" onClick={enter} autoFocus>
          {copy.cta}
        </button>
      </div>

      <button type="button" className={s.skip} onClick={finish}>
        {copy.skip}
      </button>
    </div>
  );
}
