"use client";

import { useState, type FormEvent } from "react";
import { Reveal } from "@/components/ui/Reveal";

type Status = "idle" | "sending" | "success" | "error";

const FIELDS = [
  { name: "venue", label: "Nome del locale", type: "text", autoComplete: "organization" },
  { name: "name", label: "Il tuo nome", type: "text", autoComplete: "name" },
  { name: "phone", label: "Telefono", type: "tel", autoComplete: "tel" },
  { name: "email", label: "Email", type: "email", autoComplete: "email" },
  { name: "city", label: "Città", type: "text", autoComplete: "address-level2" },
] as const;

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      });
      if (!res.ok) throw new Error();
      form.reset();
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  return (
    <section id="contatti" className="relative overflow-hidden bg-ink px-6 py-24 text-white sm:py-32">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_100%,rgba(214,179,106,0.18),transparent_60%)]" />
      <div className="relative mx-auto max-w-2xl">
        <Reveal className="text-center">
          <p className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-gold">Prenota una demo</p>
          <h2 className="text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
            Prova Brindo <span className="text-gold-gradient">gratis per un mese.</span>
          </h2>
          <p className="mt-5 text-lg text-white/60">Lasciaci i tuoi dati: ti ricontattiamo per mostrarti Brindo nel tuo locale.</p>
        </Reveal>

        <Reveal delay={0.1}>
          {status === "success" ? (
            <div role="status" className="mt-12 rounded-3xl border border-gold/40 bg-gold/10 p-10 text-center">
              <p className="text-2xl font-semibold">Richiesta inviata. Grazie!</p>
              <p className="mt-2 text-white/65">Ti ricontatteremo al più presto per fissare la demo.</p>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="mt-12 space-y-4" noValidate={false}>
              {FIELDS.map((f) => (
                <label key={f.name} className="block">
                  <span className="mb-1.5 block text-sm text-white/60">{f.label}</span>
                  <input
                    name={f.name}
                    type={f.type}
                    required
                    autoComplete={f.autoComplete}
                    className="w-full rounded-2xl border border-white/15 bg-white/[0.06] px-5 py-4 text-base text-white placeholder:text-white/30 transition-colors focus:border-gold focus:outline-none"
                  />
                </label>
              ))}
              {/* honeypot anti-spam */}
              <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
              <button
                type="submit"
                disabled={status === "sending"}
                className="mt-4 w-full rounded-full bg-gold px-7 py-4 text-lg font-semibold text-ink transition-colors hover:bg-gold-light focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold disabled:opacity-60"
              >
                {status === "sending" ? "Invio in corso…" : "Prenota una demo"}
              </button>
              {status === "error" && (
                <p role="alert" className="text-center text-sm text-red-300">
                  Qualcosa è andato storto. Riprova o scrivici a info@skalio.it.
                </p>
              )}
              <p className="text-center text-xs text-white/40">
                Inviando la richiesta accetti di essere ricontattato da Brindo in merito alla demo.
              </p>
            </form>
          )}
        </Reveal>
      </div>
    </section>
  );
}
