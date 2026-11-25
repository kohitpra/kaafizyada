"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { corners } from "@/content/copy";
import { RevealImage } from "@/components/ui/RevealImage";
import { HandArrow } from "@/components/ui/HandArrow";
import s from "./EveryCorner.module.css";

gsap.registerPlugin(ScrollTrigger);

/**
 * The Digital Gully. On desktop the section pins and the street scrolls sideways;
 * every stop is an illustrated corner (monochrome until you find it) that leads to a collection.
 * On touch screens it becomes a native swipe row; corners colour in as they reach the centre.
 */
export function EveryCorner() {
  const pin = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mm = gsap.matchMedia();
    mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
      const p = pin.current!, t = track.current!;
      const setup = () => {
        const dist = Math.max(0, t.scrollWidth - window.innerWidth);
        p.style.height = `${dist + window.innerHeight}px`;
        return dist;
      };
      let dist = setup();
      const st = ScrollTrigger.create({
        trigger: p,
        start: "top top",
        end: () => `+=${dist}`,
        invalidateOnRefresh: true,
        onRefreshInit: () => {
          dist = setup();
        },
        onUpdate: (self) => {
          t.style.transform = `translate3d(${-self.progress * dist}px,0,0)`;
          t.style.setProperty("--progress", self.progress.toFixed(4));
        },
      });
      return () => {
        st.kill();
        p.style.height = "";
        t.style.transform = "";
      };
    });
    return () => mm.revert();
  }, []);

  return (
    <section id="corners" className={s.root} aria-labelledby="corners-title">
      <div className={`container ${s.intro}`}>
        <h2 id="corners-title" className="poster">
          {corners.title}
        </h2>
        <p>{corners.intro}</p>
        <p className={`hand ${s.walk}`}>
          gully mein chalo <HandArrow className={s.walkArrow} />
        </p>
      </div>

      <div ref={pin} className={s.pin}>
        <div className={s.sticky}>
          <div ref={track} className={s.track}>
            <svg className={s.wires} viewBox="0 0 2000 120" preserveAspectRatio="none" aria-hidden>
              <path d="M0 30 C 300 90, 600 90, 1000 40 S 1700 95, 2000 30" />
              <path d="M0 55 C 400 110, 800 100, 1100 60 S 1700 120, 2000 50" />
              <path d="M0 15 C 250 60, 700 70, 980 20 S 1600 70, 2000 12" />
            </svg>

            <ol className={s.stops}>
              {corners.stops.map((stop, i) => (
                <li key={stop.id} className={s.stop} data-shape={stop.shape} style={{ ["--i" as string]: i }}>
                  <Link href={stop.href} className={s.link} aria-label={`${stop.sign}: ${stop.label}`} data-cursor-marquee-text={`Step in: ${stop.label} →`}>
                    <span className={s.sign} aria-hidden>
                      <span className={s.ropeL} />
                      <span className={s.ropeR} />
                      <span className="poster">{stop.sign}</span>
                    </span>
                    <span className={s.frame}>
                      <RevealImage src={stop.image} alt={stop.alt} sizes="(min-width: 1024px) 34vw, 80vw" className={s.img} />
                      <span className={s.num} aria-hidden>
                        0{i + 1}
                      </span>
                    </span>
                    <span className={s.caption}>
                      <span className={`hand ${s.hint}`}>{stop.hint}</span>
                      <span className={s.label}>{stop.label}</span>
                    </span>
                  </Link>
                </li>
              ))}
              <li className={s.end}>
                <p className="poster">End of the gully.</p>
                <p className="hand">par shopping abhi baaki hai</p>
                <Link href="/shop" className="btn">
                  Shop everything
                </Link>
              </li>
            </ol>
            <div className={s.ground} aria-hidden />
          </div>
        </div>
      </div>
    </section>
  );
}
