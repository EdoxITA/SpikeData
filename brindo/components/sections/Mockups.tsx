"use client";

import { motion } from "framer-motion";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { Phone } from "@/components/ui/Phone";
import { Glasses } from "@/components/ui/Logo";

const MENU = [
  { n: "Spritz", p: "8", qty: 1 },
  { n: "Gin Tonic", p: "9", qty: 0 },
  { n: "Negroni", p: "9", qty: 2 },
  { n: "Moscow Mule", p: "9", qty: 0 },
];

function CustomerScreen() {
  return (
    <Phone className="!h-[540px] !w-[270px]">
      <div className="h-full pt-9">
        <div className="flex items-center gap-2 px-4 pb-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gold text-sm font-bold text-ink">L</span>
          <div>
            <p className="text-sm font-semibold leading-none">Il tuo locale</p>
            <p className="text-[10px] text-white/50">Menu · Tavolo 12</p>
          </div>
        </div>
        <div className="flex gap-2 px-4 pb-3 text-[11px]">
          {["Cocktail", "Birre", "Shot"].map((c, i) => (
            <span key={c} className={`rounded-full px-3 py-1 ${i === 0 ? "bg-gold text-ink" : "bg-white/8 text-white/70"}`}>{c}</span>
          ))}
        </div>
        <ul className="space-y-2 px-3">
          {MENU.map((d) => (
            <li key={d.n} className="flex items-center justify-between rounded-2xl bg-white/6 px-3 py-2.5">
              <div>
                <p className="text-sm font-medium">{d.n}</p>
                <p className="text-[11px] text-gold">€{d.p}</p>
              </div>
              {d.qty ? (
                <span className="flex items-center gap-2 rounded-full bg-gold px-2 py-0.5 text-xs font-semibold text-ink">− {d.qty} +</span>
              ) : (
                <span className="flex h-6 w-6 items-center justify-center rounded-full border border-white/25 text-sm">+</span>
              )}
            </li>
          ))}
        </ul>
        <div className="absolute inset-x-3 bottom-4 flex items-center justify-between rounded-2xl bg-gold px-4 py-3 text-sm font-semibold text-ink">
          <span>Vedi ordine · 3 drink</span>
          <span>Paga →</span>
        </div>
      </div>
    </Phone>
  );
}

function Dashboard() {
  const reduce = useReducedMotion();
  const bars = [18, 26, 40, 62, 92, 100, 74, 38];
  const orders = [
    { id: "#45", d: "2 × Spritz", s: "Nuovo", c: "text-gold" },
    { id: "#44", d: "Gin Tonic", s: "In preparazione", c: "text-sky-300" },
    { id: "#43", d: "Negroni, Moscow Mule", s: "Pronto", c: "text-emerald-300" },
  ];
  return (
    <div className="w-full max-w-[640px]">
      <div className="overflow-hidden rounded-2xl border border-white/12 bg-[#101013] shadow-[0_40px_90px_-30px_rgba(0,0,0,0.8)]">
        <div className="flex items-center gap-1.5 border-b border-white/10 bg-[#17171b] px-4 py-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
          <span className="ml-4 rounded-md bg-white/6 px-3 py-0.5 text-[10px] text-white/40">dashboard · gestore</span>
        </div>
        <div className="grid grid-cols-[120px_1fr] text-white sm:grid-cols-[150px_1fr]">
          <aside className="space-y-1 border-r border-white/10 p-3 text-xs">
            <p className="mb-3 flex items-center gap-1.5 font-semibold"><Glasses className="h-4 w-auto text-gold" /> Brindo</p>
            {["Ordini live", "Report", "Promo", "Contatti"].map((l, i) => (
              <p key={l} className={`rounded-lg px-2.5 py-1.5 ${i === 0 ? "bg-gold/15 text-gold" : "text-white/55"}`}>{l}</p>
            ))}
          </aside>
          <div className="space-y-3 p-4">
            <div>
              <p className="mb-2 flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-white/45">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" /> Ordini live
              </p>
              <ul className="space-y-1.5">
                {orders.map((o) => (
                  <li key={o.id} className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2 text-xs">
                    <span><b className="mr-2">{o.id}</b><span className="text-white/60">{o.d}</span></span>
                    <span className={o.c}>{o.s}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-white/5 p-3">
                <p className="text-[11px] uppercase tracking-wider text-white/45">Report · orari di picco</p>
                <div className="mt-3 flex h-20 items-end gap-1.5">
                  {bars.map((h, i) => (
                    <motion.span
                      key={i}
                      className="flex-1 rounded-t bg-gradient-to-t from-gold/50 to-gold"
                      initial={reduce ? { height: `${h}%` } : { height: 0 }}
                      whileInView={{ height: `${h}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: i * 0.07 }}
                    />
                  ))}
                </div>
              </div>
              <div className="rounded-xl border border-gold/40 bg-gold/10 p-3">
                <p className="text-[11px] uppercase tracking-wider text-gold">Promo in tempo reale</p>
                <p className="mt-2 text-sm font-semibold">Happy hour</p>
                <p className="text-[11px] text-white/55">Visibile subito a tutti i clienti nel locale.</p>
                <span className="mt-3 inline-block rounded-full bg-gold px-3 py-1 text-[11px] font-semibold text-ink">Lancia ora</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Mockups() {
  return (
    <Section id="mockup" tone="dark" className="overflow-hidden">
      <SectionHeading
        tone="dark"
        kicker="Il prodotto"
        title="Una cosa per il cliente. Una per te."
        text="Il cliente ordina da un'interfaccia semplice, con i colori del tuo locale. Tu controlli tutto da una dashboard."
      />
      <div className="mt-16 flex flex-col items-center justify-center gap-12 lg:flex-row lg:items-center lg:gap-16">
        <Reveal className="flex flex-col items-center gap-5">
          <CustomerScreen />
          <p className="text-sm text-white/50">Per il cliente: menu e ordine</p>
        </Reveal>
        <Reveal delay={0.15} className="flex w-full flex-col items-center gap-5">
          <Dashboard />
          <p className="text-sm text-white/50">Per il gestore: ordini live, report, promo</p>
        </Reveal>
      </div>
      <p className="mt-12 text-center text-xs text-white/35">Schermate illustrative: il prodotto è in sviluppo e le interfacce possono cambiare.</p>
    </Section>
  );
}
