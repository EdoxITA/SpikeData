import { Section, SectionHeading } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { RETURN_STEPS } from "@/lib/content";

export function BringBack() {
  return (
    <Section id="ti-riportiamo-le-persone">
      <SectionHeading
        kicker="Ti riportiamo le persone"
        title="Gli ordini finiscono. I clienti no."
        text="Oltre agli ordini, Brindo si occupa della comunicazione e della gestione dei contatti: dopo ogni serata raggiungiamo i clienti per farli tornare nel tuo locale. Tu pensi alla musica, ai messaggi pensiamo noi."
      />
      <ol className="mt-16 grid gap-4 md:grid-cols-4">
        {RETURN_STEPS.map((s, i) => (
          <Reveal as="li" key={s.title} delay={i * 0.12} className="relative rounded-3xl bg-white p-7 shadow-[0_1px_0_rgba(0,0,0,0.04),0_20px_50px_-30px_rgba(0,0,0,0.25)]">
            <span className="text-sm font-medium text-gold-deep">0{i + 1}</span>
            <h3 className="mt-3 text-2xl font-semibold tracking-tight">{s.title}</h3>
            <p className="mt-2 text-[15px] leading-relaxed text-ink/60">{s.text}</p>
            {i < RETURN_STEPS.length - 1 && (
              <span className="absolute -right-3 top-1/2 z-10 hidden h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-ink text-xs text-gold md:flex" aria-hidden="true">→</span>
            )}
          </Reveal>
        ))}
      </ol>
      <Reveal delay={0.2}>
        <p className="mt-10 max-w-2xl text-sm leading-relaxed text-ink/50">
          La comunicazione avviene nel rispetto del consenso dei clienti. Il messaggio resta quello del tuo locale: noi lo prepariamo e lo inviamo.
        </p>
      </Reveal>
    </Section>
  );
}
