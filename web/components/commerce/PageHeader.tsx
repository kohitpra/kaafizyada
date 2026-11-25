import Image from "next/image";
import s from "./PageHeader.module.css";

/** Poster-style header for listing pages: big title, hand note, optional illustration. */
export function PageHeader({ eyebrow, title, note, description, image }: { eyebrow?: string; title: string; note?: string; description?: string; image?: { src: string; alt: string } }) {
  return (
    <header className={s.head} data-has-image={image ? "" : undefined}>
      <div className={s.copy}>
        {eyebrow && <p className="micro">{eyebrow}</p>}
        <h1 className="poster">{title}</h1>
        {note && <p className={`hand ${s.note}`}>{note}</p>}
        {description && <p className={s.desc}>{description}</p>}
      </div>
      {image && (
        <div className={s.art}>
          <Image src={image.src} alt={image.alt} fill sizes="(min-width: 900px) 38vw, 100vw" priority />
        </div>
      )}
    </header>
  );
}
