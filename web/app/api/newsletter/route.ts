import { NextResponse } from "next/server";

// Newsletter sign-up endpoint.
// DEMO: validates and acknowledges, but does not store addresses anywhere yet.
// Connect an email provider (Shopify customer marketing, Klaviyo, etc.) here before launch.
export async function POST(req: Request) {
  const { email } = (await req.json().catch(() => ({}))) as { email?: string };
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return NextResponse.json({ ok: false, error: "That email looks off. Try again?" }, { status: 400 });
  }
  return NextResponse.json({ ok: true, demo: true });
}
