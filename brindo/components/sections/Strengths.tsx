"use client";

import { motion } from "framer-motion";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { Icon } from "@/components/ui/Icon";
import { STRENGTHS } from "@/lib/content";

export function Strengths() {
  return (
    <Section id="punti-di-forza">
      <SectionHeading
        kicker="Punti di forza"
        title="Tutto quello che serve a una serata che funziona."
      />
      <ul className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STRENGTHS.map((s, i) => (
          <Reveal as="li" key={s.title} delay={(i % 4) * 0.08}>
            <motion.div
              whileHover={{ y: -6 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="h-full rounded-3xl bg-white p-7 shadow-[0_1px_0_rgba(0,0,0,0.04),0_20px_50px_-30px_rgba(0,0,0,0.25)]"
            >
              <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-ink text-gold">
                <Icon name={s.icon} />
              </span>
              <h3 className="text-lg font-semibold leading-snug tracking-tight">{s.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-ink/60">{s.text}</p>
            </motion.div>
          </Reveal>
        ))}
      </ul>
    </Section>
  );
}
