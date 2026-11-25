import type { Metadata } from "next";
import { commerce } from "@/lib/commerce";
import { ProductListing, type ListingSearch } from "@/components/commerce/ProductListing";
import { PageHeader } from "@/components/commerce/PageHeader";

export const metadata: Metadata = { title: "Shop all", description: "Every piece in the KAAFIZYADA gully: tops, bottoms, dresses, sets and accessories." };

export default async function ShopPage(props: { searchParams: Promise<ListingSearch> }) {
  const search = await props.searchParams;
  const base = await commerce.getProducts();
  return (
    <div className="container">
      <PageHeader
        eyebrow="Kapda Ghar"
        title="Shop everything"
        note="sab kuch yahin hai"
        description="The whole gully in one place. Filter by size so you only see what fits."
        image={{ src: "/assets/illustrations/gully-shopfront.webp", alt: "Women walking out of the KAAFIZYADA shop" }}
      />
      <ProductListing base={base} search={search} />
      <div style={{ height: 96 }} />
    </div>
  );
}
