"use client";

import { useState } from "react";
import { join } from "@/content/copy";
import s from "./NewsletterForm.module.css";

export function NewsletterForm({ id = "newsletter", tone = "light" }: { id?: string; tone?: "light" | "dark" }) {
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = new FormData(e.currentTarget).get("email");
    setState("sending");
    const res = await fetch("/api/newsletter", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
    const json = await res.json().catch(() => ({ ok: false }));
    if (json.ok) setState("done");
    else {
      setError(json.error ?? "Something broke. Try again?");
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <p className={`${s.done} hand`} role="status" data-tone={tone}>
        {join.success}
      </p>
    );
  }

  return (
    <form className={s.form} data-tone={tone} onSubmit={onSubmit} noValidate>
      <label htmlFor={id} className="sr-only">
        Email address
      </label>
      <input id={id} name="email" type="email" required placeholder={join.placeholder} autoComplete="email" aria-invalid={state === "error"} aria-describedby={state === "error" ? `${id}-err` : undefined} />
      <button className="btn" type="submit" disabled={state === "sending"}>
        {state === "sending" ? "…" : join.cta}
      </button>
      {state === "error" && (
        <p id={`${id}-err`} className={s.err} role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
