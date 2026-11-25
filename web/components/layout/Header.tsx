"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { announcements, nav } from "@/content/copy";
import { useCart } from "@/components/commerce/CartProvider";
import { Monogram } from "@/components/ui/Logo";
import { setScrollLocked } from "./SmoothScroll";
import s from "./Header.module.css";

export function Header() {
  const { cart, open: openCart } = useCart();
  const pathname = usePathname();
  const [hidden, setHidden] = useState(false);
  const [msg, setMsg] = useState(0);
  const [menu, setMenu] = useState(false);
  const [search, setSearch] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  // Hide header on scroll down, show on scroll up.
  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      if (Math.abs(y - last) < 6) return;
      setHidden(y > last && y > 240);
      last = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const id = setInterval(() => setMsg((m) => (m + 1) % announcements.length), 4500);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    setMenu(false);
    setSearch(false);
  }, [pathname]);

  useEffect(() => {
    setScrollLocked(menu || search);
    if (search) setTimeout(() => searchRef.current?.focus(), 60);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenu(false);
        setSearch(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menu, search]);

  return (
    <>
      <div className={s.announce} role="region" aria-label="Announcements">
        <p key={msg} className={s.announceMsg} aria-live="polite">
          {announcements[msg]}
        </p>
      </div>

      <header className={s.header} data-hidden={hidden && !menu && !search ? "" : undefined}>
        <div className={s.inner}>
          <button className={`${s.icon} ${s.burger}`} aria-label="Open menu" aria-expanded={menu} onClick={() => setMenu(true)}>
            <svg viewBox="0 0 24 24" aria-hidden>
              <path d="M3 6.5h18M3 12h13M3 17.5h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>

          <Link href="/" className={s.logo} aria-label="KAAFIZYADA home">
            <Monogram className={s.mark} />
            <span className={`poster ${s.word}`}>Kaafizyada</span>
          </Link>

          <nav className={s.nav} aria-label="Main">
            {nav.map((n) => (
              <Link key={n.href} href={n.href} aria-current={pathname === n.href ? "page" : undefined}>
                {n.label}
              </Link>
            ))}
          </nav>

          <div className={s.actions}>
            <button className={s.icon} aria-label="Search" onClick={() => setSearch(true)}>
              <svg viewBox="0 0 24 24" aria-hidden>
                <circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" strokeWidth="2" fill="none" />
                <path d="M15.5 15.5 21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
            <button className={`${s.icon} ${s.bag}`} aria-label={`Bag, ${cart.totalQuantity} items`} onClick={openCart}>
              <svg viewBox="0 0 24 24" aria-hidden>
                <path d="M5 8h14l-1.2 12.2a1 1 0 0 1-1 .8H7.2a1 1 0 0 1-1-.8L5 8Z" stroke="currentColor" strokeWidth="2" fill="none" strokeLinejoin="round" />
                <path d="M9 10V6.5a3 3 0 0 1 6 0V10" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
              </svg>
              {cart.totalQuantity > 0 && <span className={s.count}>{cart.totalQuantity}</span>}
            </button>
          </div>
        </div>
      </header>

      {/* Search sheet */}
      <div className={s.sheet} data-open={search ? "" : undefined} aria-hidden={!search} inert={!search}>
        <button className={s.scrim} aria-label="Close search" tabIndex={-1} onClick={() => setSearch(false)} />
        <form action="/search" className={s.searchPanel} role="search" onSubmit={() => setSearch(false)}>
          <label htmlFor="site-search" className="hand">
            kya dhoondh rahe ho?
          </label>
          <div className={s.searchRow}>
            <input ref={searchRef} id="site-search" name="q" type="search" placeholder="halter, cargo, jhumka…" autoComplete="off" />
            <button className="btn" type="submit">
              Search
            </button>
          </div>
          <p className={s.searchHints}>
            Try:{" "}
            {["halter", "bandhani", "cargo", "earrings"].map((t) => (
              <Link key={t} href={`/search?q=${t}`}>
                {t}
              </Link>
            ))}
          </p>
        </form>
      </div>

      {/* Mobile menu: the gully map */}
      <div className={s.menu} data-open={menu ? "" : undefined} aria-hidden={!menu} inert={!menu} role="dialog" aria-label="Menu">
        <div className={s.menuTop}>
          <span className="hand">gully map</span>
          <button className={s.icon} aria-label="Close menu" onClick={() => setMenu(false)}>
            <svg viewBox="0 0 24 24" aria-hidden>
              <path d="M5 5l14 14M19 5 5 19" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <form action="/search" className={s.menuSearch} role="search">
          <input name="q" type="search" placeholder="Search the gully…" aria-label="Search products" />
        </form>
        <ul className={s.menuLinks}>
          {[...nav, { label: "Desi Baddie Edit", href: "/collections/desi-baddie" }, { label: "Commute Edit", href: "/collections/commute-edit" }].map((n, i) => (
            <li key={n.href} style={{ ["--i" as string]: i }}>
              <Link href={n.href} className="poster">
                {n.label}
              </Link>
            </li>
          ))}
        </ul>
        <p className={`hand ${s.menuNote}`}>Desi with a little extra.</p>
      </div>
    </>
  );
}
