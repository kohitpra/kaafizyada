import { faq } from "@/content/copy";
import s from "./Faq.module.css";

export function Faq() {
  return (
    <section className={s.root} aria-labelledby="faq-title">
      <div className={`container ${s.inner}`}>
        <div className={s.side}>
          <h2 id="faq-title" className="poster">
            {faq.title}
          </h2>
          <p className="hand">sab bata denge, promise.</p>
        </div>
        <div className={s.list}>
          {faq.items.map((item, i) => (
            <details key={item.q} className={s.item} name="faq">
              <summary>
                <span className={s.n}>0{i + 1}</span>
                <span className={s.q}>{item.q}</span>
                <span className={s.plus} aria-hidden />
              </summary>
              <p className={s.a}>{item.a}</p>
            </details>
          ))}
          <p className={s.still}>
            Still confused? <a href="/pages/contact">Message a real human</a>.
          </p>
        </div>
      </div>
    </section>
  );
}
