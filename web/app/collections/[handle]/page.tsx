import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { commerce } from "@/lib/commerce";
import { corners } from "@/content/copy";
import { ProductListing, type ListingSearch } from "@/components/commerce/ProductListing";
import { PageHeader } from "@/components/commerce/PageHeader";

type Props = { params: Promise<{ handle: string }>; searchParams: Promise<ListingSearch> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const c = await commerce.getCollection((await params).handle);
  return c ? { title: c.title, description: c.description } : {};
}

export async function generateStaticParams() {
  return (await commerce.getCollections()).map((c) => ({ handle: c.handle }));
}

export default async function CollectionPage({ params, searchParams }: Props) {
  const { handle } = await params;
  const [collection, base, search] = await Promise.all([commerce.getCollection(handle), commerce.getProducts({ collection: handle }), searchParams]);
  if (!collection) notFound();
  // The gully corner that leads here doubles as the collection's illustration.
  const corner = corners.stops.find((s) => s.href === `/collections/${handle}`);
  return (
    <div className="container">
      <PageHeader
        eyebrow={corner ? `${corner.sign} · Collection` : "Collection"}
        title={collection.title}
        note={collection.note}
        description={collection.description}
        image={corner ? { src: corner.image, alt: corner.alt } : collection.image ? { src: collection.image.url, alt: collection.image.alt } : undefined}
      />
      <ProductListing base={base} search={search} />
      <div style={{ height: 96 }} />
    </div>
  );
}
