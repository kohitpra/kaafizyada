import type { Metadata } from "next";
import Link from "next/link";
import { commerce } from "@/lib/commerce";
import { ProductListing, type ListingSearch } from "@/components/commerce/ProductListing";
import { PageHeader } from "@/components/commerce/PageHeader";

export const metadata: Metadata = { title: "Search", robots: { index: false } };

export default async function SearchPage(props: { searchParams: Promise<ListingSearch & { q?: string }> }) {
  const search = await props.searchParams;
  const q = (search.q ?? "").trim();
  const base = q ? await commerce.getProducts({ query: q }) : [];
  return (
    <div className="container">
      <PageHeader eyebrow="Search" title={q ? `“${q}”` : "Search"} note={q ? `${base.length} result${base.length === 1 ? "" : "s"}` : "kya dhoondh rahe ho?"} />
      <form action="/search" role="search" style={{ display: "flex", gap: 10, maxWidth: 640, marginBottom: 32 }}>
        <label htmlFor="q" className="sr-only">Search products</label>
        <input id="q" name="q" defaultValue={q} placeholder="halter, cargo, jhumka…" style={{ flex: 1, minHeight: 50, padding: "0 16px", border: "2px solid var(--ink)", background: "var(--cream)", fontSize: "1rem" }} />
        <button className="btn" type="submit">Search</button>
      </form>
      {q && (
        <ProductListing
          base={base}
          search={search}
          empty={
            <>
              <p className="serif">Nothing for “{q}”.</p>
              <p className="hand">try “halter”, “cargo” or <Link href="/shop">browse everything</Link></p>
            </>
          }
        />
      )}
      <div style={{ height: 96 }} />
    </div>
  );
}
