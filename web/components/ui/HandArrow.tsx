// Wobbly hand-drawn arrow. `draw` animates the stroke in when the parent gets .is-in / :hover.
export function HandArrow({ className, direction = "right" }: { className?: string; direction?: "right" | "down" | "left" }) {
  const rot = direction === "down" ? 90 : direction === "left" ? 180 : 0;
  return (
    <svg className={className} viewBox="0 0 120 48" fill="none" aria-hidden style={{ transform: `rotate(${rot}deg)` }}>
      <path
        d="M4 30c14-10 30-16 48-14 16 2 28 8 44 4 6-1.5 11-4 15-7"
        stroke="currentColor"
        strokeWidth="3.2"
        strokeLinecap="round"
        pathLength={1}
        className="hand-arrow__line"
      />
      <path
        d="M96 8c5 3.5 10 7 15 5-4 4.5-7 9.5-8 16"
        stroke="currentColor"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1}
        className="hand-arrow__head"
      />
    </svg>
  );
}
