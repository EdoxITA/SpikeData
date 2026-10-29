import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";

const POINTS = ["Nessun canone", "Nessuna percentuale sugli incassi", "Nessun costo di attivazione"];

export function ZeroCost() {
  return (
    <Section id="costo-zero" tone="dark" className="overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(214,179,106,0.22),transparent_65%)]" />
      <div className="relative text-center">
        <Reveal>
          <p className="mb-6 text-xs font-medium uppercase tracking-[0.2em] text-gold">Costo zero per il locale</p>
          <h2 className="text-gold-gradient text-[7rem] font-semibold leading-none tracking-tighter sm:text-[12rem] lg:text-[16rem]">
            0 €
          </h2>
        </Reveal>
        <ul className="mx-auto mt-12 grid max-w-4xl gap-4 sm:grid-cols-3">
          {POINTS.map((p, i) => (
            <Reveal as="li" key={p} delay={0.1 + i * 0.1} className="rounded-3xl border border-white/10 bg-white/[0.04] px-6 py-7 text-lg font-medium">
              <span className="mb-3 block text-2xl text-gold" aria-hidden="true">✓</span>
              {p}
            </Reveal>
          ))}
        </ul>
        <Reveal delay={0.2}>
          <p className="mx-auto mt-10 max-w-2xl text-lg leading-relaxed text-white/60">
            Brindo guadagna solo una piccola commissione di servizio, di pochi centesimi, pagata dal cliente.
          </p>
          <p className="mt-10 text-3xl font-semibold tracking-tight sm:text-5xl">
            Tu incassi tutto.
            <br />
            <span className="text-gold-gradient">Noi ti riportiamo i clienti.</span>
          </p>
        </Reveal>
      </div>
    </Section>
  );
}
