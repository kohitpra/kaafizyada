import type { Metadata } from "next";
import { notFound } from "next/navigation";
import s from "./page.module.css";

// Help and policy pages. DEMO copy: replace with the client's real policies before launch.
const PAGES: Record<string, { title: string; note: string; body: { h?: string; p: string }[] }> = {
  shipping: {
    title: "Shipping",
    note: "gully se ghar tak",
    body: [
      { p: "We ship across India. Orders leave our studio within 24 hours on working days." },
      { h: "Delivery times", p: "Metro cities: 3–5 working days. Rest of India: 5–8 working days. You get a tracking link on WhatsApp and email as soon as it ships." },
      { h: "Costs", p: "Free shipping on orders over ₹1,999. Below that, a flat ₹99." },
      { h: "Cash on delivery", p: "Available on orders up to ₹5,000 for most pin codes." },
    ],
  },
  returns: {
    title: "Returns & exchanges",
    note: "no drama, promise",
    body: [
      { p: "Changed your mind? Exchange or return anything unworn, unwashed and with tags within 7 days of delivery." },
      { h: "How", p: "Message us with your order number. We arrange a pickup; you just pack it." },
      { h: "Refunds", p: "Prepaid orders are refunded to the original payment method within 5–7 working days of pickup. COD orders are refunded by bank transfer or store credit." },
      { h: "Not returnable", p: "Earrings, for hygiene reasons, and anything marked final sale." },
    ],
  },
  "size-guide": {
    title: "Size guide",
    note: "measure twice, order once",
    body: [
      { p: "All measurements are body measurements in centimetres. Each product page also has a fit note." },
      { h: "XS", p: "Bust 81 · Waist 66 · Hip 89" },
      { h: "S", p: "Bust 86 · Waist 71 · Hip 94" },
      { h: "M", p: "Bust 91 · Waist 76 · Hip 99" },
      { h: "L", p: "Bust 97 · Waist 81 · Hip 104" },
      { h: "XL", p: "Bust 103 · Waist 87 · Hip 110" },
      { h: "Bangles", p: "2.4 = 5.7 cm inner diameter · 2.6 = 6.0 cm · 2.8 = 6.4 cm" },
    ],
  },
  contact: {
    title: "Contact",
    note: "real humans, quick replies",
    body: [
      { p: "Questions about sizing, an order, or a collab? Write to us and a real person replies within one working day." },
      { h: "Email", p: "hello@kaafizyada.example (placeholder until the client's address is confirmed)" },
      { h: "Hours", p: "Monday to Saturday, 10am to 7pm IST." },
    ],
  },
  privacy: {
    title: "Privacy",
    note: "your data stays yours",
    body: [
      { p: "We collect only what we need to deliver your order and, if you join the gang, to email you about drops. We never sell your data." },
      { h: "Payments", p: "Card and UPI details are handled by our payment provider at checkout; we never see or store them." },
      { h: "Cookies", p: "We use essential cookies to keep your bag and preferences. Nothing else without your consent." },
    ],
  },
  terms: {
    title: "Terms",
    note: "the fine print, kept short",
    body: [
      { p: "By shopping with KAAFIZYADA you agree to these terms. Prices are in INR and include GST." },
      { h: "Product colours", p: "Hand block-printed and hand-dyed pieces vary slightly; that is part of their charm, not a defect." },
    ],
  },
};

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return Object.keys(PAGES).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = PAGES[(await params).slug];
  return p ? { title: p.title } : {};
}

export default async function InfoPage({ params }: Props) {
  const page = PAGES[(await params).slug];
  if (!page) notFound();
  return (
    <article className={`container ${s.page}`}>
      <h1 className="poster">{page.title}</h1>
      <p className={`hand ${s.note}`}>{page.note}</p>
      <div className={s.body}>
        {page.body.map((b, i) => (
          <section key={i}>
            {b.h && <h2>{b.h}</h2>}
            <p>{b.p}</p>
          </section>
        ))}
      </div>
    </article>
  );
}
