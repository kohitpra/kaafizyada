import type { Metadata, Viewport } from "next";
import { Anton, Gloock, Instrument_Sans, Kalam } from "next/font/google";
import { commerceMode } from "@/lib/commerce";
import { CartProvider } from "@/components/commerce/CartProvider";
import { CartDrawer } from "@/components/commerce/CartDrawer";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SmoothScroll } from "@/components/layout/SmoothScroll";
import { MotionExtras } from "@/components/ui/MotionExtras";
import "./globals.css";

const anton = Anton({ weight: "400", subsets: ["latin"], variable: "--ff-anton", display: "swap" });
const gloock = Gloock({ weight: "400", subsets: ["latin"], variable: "--ff-gloock", display: "swap" });
const kalam = Kalam({ weight: ["400", "700"], subsets: ["latin", "devanagari"], variable: "--ff-kalam", display: "swap" });
const instrument = Instrument_Sans({ subsets: ["latin"], variable: "--ff-instrument", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3200"),
  title: { default: "KAAFIZYADA · Desi with a little extra", template: "%s · KAAFIZYADA" },
  description: "Illustrated Indian street fashion. Halters, cargos, bandhani and brass, from the gully to your wardrobe.",
  icons: { icon: "/assets/brand/monogram.svg" },
};

export const viewport: Viewport = { themeColor: "#1C120F" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className={`${anton.variable} ${gloock.variable} ${kalam.variable} ${instrument.variable}`}>
      <body>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <CartProvider mode={commerceMode}>
          <Header />
          <main id="main">{children}</main>
          <Footer />
          <CartDrawer />
        </CartProvider>
        <SmoothScroll />
        <MotionExtras />
        <div className="grain" aria-hidden />
      </body>
    </html>
  );
}
