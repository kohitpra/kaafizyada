import Link from "next/link";
import { footer, join } from "@/content/copy";
import { Monogram } from "@/components/ui/Logo";
import { NewsletterForm } from "@/components/ui/NewsletterForm";
import { FooterSign } from "./FooterSign";
import s from "./Footer.module.css";

export function Footer() {
  return (
    <footer className={s.footer}>
      <div className={s.tear} aria-hidden />
      <div className={`container ${s.top}`}>
        <div className={s.join}>
          <p className="hand">{join.title.toLowerCase()} →</p>
          <p className={s.joinIntro}>{join.intro}</p>
          <NewsletterForm id="footer-email" tone="dark" />
        </div>
        <nav className={s.cols} aria-label="Footer">
          {footer.columns.map((c) => (
            <div key={c.title}>
              <h2 className="micro">{c.title}</h2>
              <ul>
                {c.links.map((l) => (
                  <li key={l.href}>
                    {"external" in l && l.external ? (
                      <a href={l.href} target="_blank" rel="noreferrer">
                        {l.label} ↗
                      </a>
                    ) : (
                      <Link href={l.href}>{l.label}</Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      <FooterSign />

      <div className={`container ${s.bottom}`}>
        <Monogram className={s.stamp} />
        <p>© {new Date().getFullYear()} KAAFIZYADA. {footer.line}</p>
        <p className={s.made}>Made in India, with a little extra.</p>
      </div>
    </footer>
  );
}
