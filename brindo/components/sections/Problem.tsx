import { Section, SectionHeading } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { PROBLEMS } from "@/lib/content";

export function Problem() {
  return (
    <Section id="problema">
      <SectionHeading
        kicker="Il problema"
        title={
          <>
            La fila al bar costa
            <br className="hidden sm:block" /> più di quanto pensi.
          </>
        }
        text="Più la serata è piena, più il bancone rallenta. Ed è proprio lì che si perdono i clienti."
      />
      <ul className="mt-16 grid gap-5 md:grid-cols-3">
        {PROBLEMS.map((p, i) => (
          <Reveal as="li" key={p.title} delay={i * 0.1} className="rounded-3xl bg-white p-8 shadow-[0_1px_0_rgba(0,0,0,0.04),0_20px_50px_-30px_rgba(0,0,0,0.25)]">
            <span className="mb-6 flex h-10 w-10 items-center justify-center rounded-full bg-ink text-sm font-semibold text-gold">{i + 1}</span>
            <h3 className="text-2xl font-semibold tracking-tight">{p.title}</h3>
            <p className="mt-3 leading-relaxed text-ink/60">{p.text}</p>
          </Reveal>
        ))}
      </ul>
    </Section>
  );
}
