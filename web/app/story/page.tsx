import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import s from "./page.module.css";

export const metadata: Metadata = { title: "Our story", description: "How a gully, a chai stall and a little too much attitude became KAAFIZYADA." };

const CHAPTERS = [
  {
    no: "01",
    title: "It started at a tapri",
    body: "Three friends, one cutting chai each, and the same complaint: everything in the shops was either too plain or too serious. Desi clothes felt like a costume. Western clothes felt like someone else's. We wanted both, and a little extra.",
    image: "/assets/illustrations/chai-tapri.webp",
    alt: "Friends laughing over chai at a street tapri",
  },
  {
    no: "02",
    title: "The gully is the runway",
    body: "Our moodboard is the 8:14 local, the bangle cart outside the station, the hand-painted posters on the wall. We design for the girl who walks through all of it and still turns heads.",
    image: "/assets/illustrations/local-train.webp",
    alt: "A woman standing in a Mumbai local train",
  },
  {
    no: "03",
    title: "Made by hands that know",
    body: "Block-printers in Sanganer, bandhani tiers in Bhuj, brass-smiths in Moradabad. We work with small workshops, pay fairly and keep the craft in the clothes, then cut it into silhouettes you'd actually wear on a Tuesday.",
    image: "/assets/illustrations/gully-shopfront.webp",
    alt: "Women walking out of a small clothes shop in an old gully",
  },
];

export default function StoryPage() {
  return (
    <div className={s.page}>
      <header className={`container ${s.hero}`}>
        <p className="micro">Our story</p>
        <h1 className="poster">
          Desi with a <span>little extra.</span>
        </h1>
        <p className={`hand ${s.note}`}>a graphic novel in three panels</p>
      </header>
      <ol className="container">
        {CHAPTERS.map((c, i) => (
          <li key={c.no} className={s.chapter} data-flip={i % 2 ? "" : undefined}>
            <div className={s.art}>
              <Image src={c.image} alt={c.alt} fill sizes="(min-width: 900px) 50vw, 100vw" />
            </div>
            <div className={s.text}>
              <span className={s.no}>{c.no}</span>
              <h2 className="serif">{c.title}</h2>
              <p>{c.body}</p>
            </div>
          </li>
        ))}
      </ol>
      <div className={`container ${s.end}`}>
        <p className="poster">Too much? Never.</p>
        <Link href="/shop" className="btn">
          Shop the gully
        </Link>
      </div>
    </div>
  );
}
