import { ticker } from "@/content/copy";
import s from "./PopTicker.module.css";

function Star() {
  return (
    <svg viewBox="0 0 24 24" className={s.star} aria-hidden>
      <path d="M12 1.5l2.1 6.4 6.6-1.9-4.3 5.3 4.3 5.3-6.6-1.9L12 21.1l-2.1-6.4-6.6 1.9 4.3-5.3L3.3 6l6.6 1.9z" fill="currentColor" />
    </svg>
  );
}

function Row({ items, reverse = false, className }: { items: string[]; reverse?: boolean; className: string }) {
  const content = (
    <>
      {items.map((t) => (
        <span key={t} className={s.item}>
          {t} <Star />
        </span>
      ))}
    </>
  );
  return (
    <div className={`${s.band} ${className}`} data-reverse={reverse ? "" : undefined}>
      <div className={s.track} data-marquee-track={reverse ? "right" : "left"} data-marquee-duration={reverse ? "46" : "38"}>
        <div className={s.group}>{content}</div>
        <div className={s.group} aria-hidden>
          {content}
        </div>
      </div>
    </div>
  );
}

export function PopTicker() {
  return (
    <section className={s.root} aria-label="Brand promises">
      <ul className="sr-only">
        {ticker.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>
      <div aria-hidden>
        <Row items={[...ticker].reverse()} reverse className={s.under} />
        <Row items={ticker} className={s.over} />
      </div>
    </section>
  );
}
