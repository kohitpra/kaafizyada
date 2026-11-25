"use client";

import { useEffect, useRef } from "react";
import s from "./Footer.module.css";

const LETTERS = "KAAFIZYADA".split("");
const COLORS = ["var(--turmeric)", "var(--jaipur-pink)", "var(--marigold)", "var(--turquoise)", "var(--cream)"];

/**
 * The big sign-off: a painted signboard hanging on two ropes. It swings into place when it
 * enters the viewport, and each letter jumps and takes a palette colour on hover/tap.
 */
export function FooterSign() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && el.classList.add(s.in), { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className={s.signWrap} aria-label="KAAFIZYADA" role="img">
      <svg className={s.ropes} viewBox="0 0 1000 120" preserveAspectRatio="none" aria-hidden>
        <path d="M180 0 C182 40 176 80 182 120" stroke="var(--brass)" strokeWidth="5" fill="none" strokeDasharray="10 6" />
        <path d="M820 0 C818 40 824 80 818 120" stroke="var(--brass)" strokeWidth="5" fill="none" strokeDasharray="10 6" />
      </svg>
      <div className={s.board}>
        {LETTERS.map((l, i) => (
          <span key={i} className={`poster ${s.letter}`} style={{ ["--c" as string]: COLORS[i % COLORS.length], ["--d" as string]: `${i * 45}ms` }} aria-hidden>
            {l}
          </span>
        ))}
      </div>
    </div>
  );
}
