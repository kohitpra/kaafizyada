import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container" style={{ padding: "clamp(64px, 12vw, 160px) var(--gutter)", display: "grid", gap: 18, justifyItems: "start" }}>
      <p className="micro">404</p>
      <h1 className="poster" style={{ fontSize: "var(--fs-mega)", color: "var(--cherry)", lineHeight: 0.88 }}>
        Galat gully.
      </h1>
      <p className="hand" style={{ fontSize: "1.5rem", color: "var(--jaipur-pink)" }}>
        this lane doesn&rsquo;t go anywhere
      </p>
      <Link href="/" className="btn">
        Back to the gully
      </Link>
    </div>
  );
}
