import { MONOGRAM_PATH, MONOGRAM_VIEWBOX } from "./monogram-path";

export function Monogram({ className, title }: { className?: string; title?: string }) {
  return (
    <svg className={className} viewBox={MONOGRAM_VIEWBOX} role={title ? "img" : undefined} aria-hidden={title ? undefined : true}>
      {title && <title>{title}</title>}
      <path fill="currentColor" fillRule="evenodd" d={MONOGRAM_PATH} />
    </svg>
  );
}

/** Monogram + set wordmark. The wordmark is live text (Anton), so it stays crisp and searchable. */
export function Logo({ className }: { className?: string }) {
  return (
    <span className={className} style={{ display: "inline-flex", alignItems: "center", gap: "0.5em" }}>
      <Monogram className="logo-mark" />
      <span className="poster" style={{ fontSize: "1.35em", letterSpacing: "0.04em", lineHeight: 1 }}>
        KAAFIZYADA
      </span>
    </span>
  );
}
