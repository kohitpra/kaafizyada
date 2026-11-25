import { join } from "@/content/copy";
import { NewsletterForm } from "@/components/ui/NewsletterForm";
import { ChaiGlass3D } from "@/components/scenes/ChaiGlass3D";
import s from "./JoinTheGang.module.css";

export function JoinTheGang() {
  return (
    <section className={s.root} aria-labelledby="join-title" data-reveal-host>
      <div className={`container ${s.inner}`}>
        <div className={s.copy}>
          <p className={`hand ${s.kicker}`}>chai pe charcha, inbox mein</p>
          <h2 id="join-title" className="poster">
            {join.title}
          </h2>
          <p className={s.intro}>{join.intro}</p>
          <NewsletterForm id="join-email" />
          <p className={s.small}>One or two emails a month. Unsubscribe anytime.</p>
        </div>
        <ChaiGlass3D className={s.glass} />
      </div>
    </section>
  );
}
