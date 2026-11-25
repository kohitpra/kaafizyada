import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { commerce } from "@/lib/commerce";
import { ProductView } from "@/components/commerce/ProductView";
import { ProductCard } from "@/components/commerce/ProductCard";
import s from "./page.module.css";

type Props = { params: Promise<{ handle: string }> };

export async function generateStaticParams() {
  return (await commerce.getAllHandles()).map((handle) => ({ handle }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await commerce.getProduct((await params).handle);
  if (!p) return {};
  return { title: p.title, description: `${p.tagline} ${p.description}`.slice(0, 160), openGraph: { images: p.images[0] ? [p.images[0].url] : [] } };
}

export default async function ProductPage({ params }: Props) {
  const { handle } = await params;
  const [product, recs] = await Promise.all([commerce.getProduct(handle), commerce.getRecommendations(handle, 4)]);
  if (!product) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description,
    image: product.images.map((i) => i.url),
    brand: { "@type": "Brand", name: "KAAFIZYADA" },
    offers: product.variants.map((v) => ({
      "@type": "Offer",
      price: v.price.amount,
      priceCurrency: v.price.currencyCode,
      availability: v.availableForSale ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      name: v.title,
    })),
  };

  return (
    <div className="container">
      <nav className={s.crumbs} aria-label="Breadcrumb">
        <Link href="/">Home</Link> <span aria-hidden>/</span> <Link href="/shop">Shop</Link> <span aria-hidden>/</span> <span aria-current="page">{product.title}</span>
      </nav>
      <Suspense>
        <ProductView product={product} />
      </Suspense>

      {recs.length > 0 && (
        <section className={s.recs} aria-labelledby="recs-title">
          <h2 id="recs-title" className="poster">
            Isse bhi try karo
          </h2>
          <div className={s.recGrid}>
            {recs.map((p, i) => (
              <ProductCard key={p.handle} product={p} index={i} />
            ))}
          </div>
        </section>
      )}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
    </div>
  );
}
