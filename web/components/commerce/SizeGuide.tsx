"use client";

import { forwardRef, useState } from "react";
import s from "./SizeGuide.module.css";

// Body measurements. DEMO values; replace with the client's grading spec.
const ROWS = [
  { size: "XS", bust: 81, waist: 66, hip: 89 },
  { size: "S", bust: 86, waist: 71, hip: 94 },
  { size: "M", bust: 91, waist: 76, hip: 99 },
  { size: "L", bust: 97, waist: 81, hip: 104 },
  { size: "XL", bust: 103, waist: 87, hip: 110 },
];

export const SizeGuide = forwardRef<HTMLDialogElement>(function SizeGuide(_, ref) {
  const [unit, setUnit] = useState<"cm" | "in">("cm");
  const f = (cm: number) => (unit === "cm" ? cm : (cm / 2.54).toFixed(1));
  return (
    <dialog ref={ref} className={s.dialog} aria-labelledby="sg-title" onClick={(e) => e.target === e.currentTarget && (e.currentTarget as HTMLDialogElement).close()}>
      <div className={s.inner}>
        <div className={s.head}>
          <h2 id="sg-title" className="poster">Size guide</h2>
          <form method="dialog">
            <button className={s.close} aria-label="Close size guide">✕</button>
          </form>
        </div>
        <p className="hand">body measurements, not garment</p>
        <div className={s.units} role="group" aria-label="Units">
          {(["cm", "in"] as const).map((u) => (
            <button key={u} aria-pressed={unit === u} onClick={() => setUnit(u)}>
              {u}
            </button>
          ))}
        </div>
        <table className={s.table}>
          <thead>
            <tr><th scope="col">Size</th><th scope="col">Bust</th><th scope="col">Waist</th><th scope="col">Hip</th></tr>
          </thead>
          <tbody>
            {ROWS.map((r) => (
              <tr key={r.size}>
                <th scope="row">{r.size}</th><td>{f(r.bust)}</td><td>{f(r.waist)}</td><td>{f(r.hip)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className={s.tip}>Between sizes? For fitted pieces (corsets, halters) size up; for oversized pieces, take your usual size.</p>
      </div>
    </dialog>
  );
});
