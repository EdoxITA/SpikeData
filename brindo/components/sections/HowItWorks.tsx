"use client";

import { motion } from "framer-motion";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { STEPS } from "@/lib/content";

export function HowItWorks() {
  const reduce = useReducedMotion();
  return (
    <Section id="come-funziona" tone="dark">
      <SectionHeading tone="dark" kicker="Come funziona" title="Tre passaggi. Zero fila." />
      <div className="relative mt-20">
        <div className="absolute left-0 right-0 top-7 hidden h-px md:block" aria-hidden="true">
          <motion.div
            className="h-full origin-left bg-gradient-to-r from-gold via-gold/60 to-transparent"
            initial={reduce ? false : { scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.4, ease: "easeOut" }}
          />
        </div>
        <ol className="grid gap-12 md:grid-cols-3 md:gap-10">
          {STEPS.map((s, i) => (
            <Reveal as="li" key={s.title} delay={i * 0.15}>
              <span className="relative flex h-14 w-14 items-center justify-center rounded-full border border-gold bg-ink text-xl font-semibold text-gold">
                {i + 1}
              </span>
              <h3 className="mt-6 text-3xl font-semibold tracking-tight">{s.title}</h3>
              <p className="mt-3 max-w-sm leading-relaxed text-white/60">{s.text}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </Section>
  );
}
