import type { Money } from "./commerce/types";

const fmt = new Map<string, Intl.NumberFormat>();

export function formatMoney(m: Money) {
  const key = m.currencyCode;
  if (!fmt.has(key)) {
    fmt.set(key, new Intl.NumberFormat("en-IN", { style: "currency", currency: key, maximumFractionDigits: 0 }));
  }
  return fmt.get(key)!.format(m.amount);
}
