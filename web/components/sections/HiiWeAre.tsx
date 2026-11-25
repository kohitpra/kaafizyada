import Image from "next/image";
import Link from "next/link";
import { about } from "@/content/copy";
import s from "./HiiWeAre.module.css";

/** Three short lines as a graphic-novel strip. */
export function HiiWeAre() {
  return (
    <section className={s.root} aria-labelledby="about-title">
      <div className="container">
        <h2 id="about-title" className="poster">
          <span className={s.hii}>Hii,</span> we&rsquo;re <span className={s.name}>Kaafizyada</span>
        </h2>
        <ol className={s.strip}>
          {about.panels.map((p, i) => (
            <li key={i} className={s.panel} style={{ ["--i" as string]: i }} data-momentum>
              <figure data-momentum-target>
                <div className={s.art}>
                  <Image src={p.image} alt={p.alt} fill sizes="(min-width: 900px) 30vw, 90vw" />
                  <span className={s.no} aria-hidden>
                    {i + 1}
                  </span>
                </div>
                <figcaption className={s.bubble}>{p.line}</figcaption>
              </figure>
            </li>
          ))}
        </ol>
        <Link href="/story" className={`hand ${s.more}`}>
          poori kahaani padho →
        </Link>
      </div>
    </section>
  );
}
