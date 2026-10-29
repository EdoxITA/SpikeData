"use client";

import { useMemo, useRef, type ReactNode } from "react";
import { motion, motionValue, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { FitBox } from "@/components/ui/FitBox";
import { ButtonLink } from "@/components/ui/Button";
import { PHONE_H, PHONE_W } from "@/components/ui/Phone";
import { BarScreen, CloseScreen, PayScreen, PickupScreen, QueueScreen, ScanScreen } from "./screens";

type SceneDef = {
  range: [number, number];
  kicker: string;
  title: ReactNode;
  text: string;
  size: [number, number];
  visual: (q: MotionValue<number>) => ReactNode;
};

const SUBTITLE =
  "Gli ordini al bar diventano digitali, i clienti diventano contatti, e i contatti tornano. A costo zero per il tuo locale.";

const SCENES: SceneDef[] = [
  {
    range: [0, 0.15],
    kicker: "Ogni venerdì sera",
    title: "20 minuti per un drink.",
    text: "Bancone pieno, staff sotto pressione, clienti in piedi in coda. La serata aspetta.",
    size: [520, 300],
    visual: (q) => <QueueScreen q={q} />,
  },
  {
    range: [0.15, 0.33],
    kicker: "Passo 1",
    title: "Nessuna app da scaricare.",
    text: "Inquadri il QR code sul tavolo e il menu dei drink si apre nel browser.",
    size: [PHONE_W, PHONE_H],
    visual: (q) => <ScanScreen q={q} />,
  },
  {
    range: [0.33, 0.5],
    kicker: "Passo 2",
    title: "Un tap, e hai pagato.",
    text: "Scegli il drink e paghi con Apple Pay o Google Pay. Niente contanti, niente cassa.",
    size: [PHONE_W, PHONE_H],
    visual: (q) => <PayScreen q={q} />,
  },
  {
    range: [0.5, 0.68],
    kicker: "Dietro il bancone",
    title: "Il barman vede l'ordine.",
    text: "Arriva in tempo reale. Lo prepara e lo segna come pronto.",
    size: [520, 340],
    visual: (q) => <BarScreen q={q} />,
  },
  {
    range: [0.68, 0.84],
    kicker: "Passo 3",
    title: "Il tuo drink è pronto.",
    text: "Una notifica sul telefono e ritiri al bancone. Senza fila.",
    size: [520, 340],
    visual: (q) => <PickupScreen q={q} />,
  },
  {
    range: [0.84, 1],
    kicker: "",
    title: "",
    text: SUBTITLE,
    size: [520, 300],
    visual: (q) => <CloseScreen q={q} />,
  },
];

function Caption({ scene, last }: { scene: SceneDef; last: boolean }) {
  return (
    <div className="max-w-xl text-center md:text-left">
      {last ? (
        <>
          <h1 className="text-[2.6rem] font-semibold leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl">
            Brindo.
            <br />
            <span className="text-gold-gradient">Niente fila, solo la serata.</span>
          </h1>
          <p className="mt-5 text-base leading-relaxed text-white/70 sm:text-lg">{scene.text}</p>
          <ButtonLink href="#contatti" className="mt-7">
            Prova Brindo nel tuo locale
          </ButtonLink>
        </>
      ) : (
        <>
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-gold">{scene.kicker}</p>
          <p className="text-[2.4rem] font-semibold leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl">
            {scene.title}
          </p>
          <p className="mt-4 text-base leading-relaxed text-white/65 sm:text-lg">{scene.text}</p>
        </>
      )}
    </div>
  );
}

function SceneLayout({ scene, q, last }: { scene: SceneDef; q: MotionValue<number>; last: boolean }) {
  return (
    <div className="mx-auto grid h-full w-full max-w-6xl grid-rows-[minmax(0,1fr)_auto] items-center gap-4 px-6 pb-16 pt-24 md:grid-cols-2 md:grid-rows-[minmax(0,1fr)] md:gap-10 md:pb-10">
      <FitBox w={scene.size[0]} h={scene.size[1]} className="h-full min-h-0 md:order-2">
        {scene.visual(q)}
      </FitBox>
      <div className="md:order-1">
        <Caption scene={scene} last={last} />
      </div>
    </div>
  );
}

function AnimatedScene({
  scene,
  p,
  first,
  last,
}: {
  scene: SceneDef;
  p: MotionValue<number>;
  first: boolean;
  last: boolean;
}) {
  const [s, e] = scene.range;
  const f = 0.02;
  // gli input coprono sempre l'intero intervallo 0..1, altrimenti lo scroll-timeline nativo
  // interpola oltre l'ultimo keyframe invece di mantenere il valore.
  const input = first ? [0, e - f, e, 1] : last ? [0, s, s + f, 1] : [0, s, s + f, e - f, e, 1];
  const opacity = useTransform(p, input, first ? [1, 1, 0, 0] : last ? [0, 0, 1, 1] : [0, 0, 1, 1, 0, 0]);
  const y = useTransform(p, input, first ? [0, 0, -24, -24] : last ? [24, 24, 0, 0] : [24, 24, 0, 0, -24, -24]);
  const q = useTransform(p, [s, e], [0, 1]);
  const pointerEvents = useTransform(opacity, (v) => (v > 0.5 ? "auto" : "none"));
  return (
    <motion.div style={{ opacity, y, pointerEvents }} className="absolute inset-0">
      <SceneLayout scene={scene} q={q} last={last} />
    </motion.div>
  );
}

function ProgressDots({ p }: { p: MotionValue<number> }) {
  return (
    <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2" aria-hidden="true">
      {SCENES.map((sc, i) => (
        <Dot key={i} p={p} range={sc.range} />
      ))}
    </div>
  );
}

function Dot({ p, range }: { p: MotionValue<number>; range: [number, number] }) {
  const [s, e] = range;
  const input = [0, Math.max(0, s - 0.01), s, e - 0.01, e, 1];
  const first = s === 0;
  const last = e === 1;
  const w = useTransform(p, input, [first ? 28 : 8, first ? 28 : 8, 28, 28, 8, last ? 28 : 8]);
  const o = useTransform(p, input, [first ? 1 : 0.25, first ? 1 : 0.25, 1, 1, 0.25, last ? 1 : 0.25]);
  return <motion.span style={{ width: w, opacity: o }} className="h-2 rounded-full bg-gold" />;
}

function AnimatedHero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const hint = useTransform(scrollYProgress, [0, 0.04, 1], [1, 0, 0]);
  return (
    <div ref={ref} className="relative h-[620svh]">
      <div className="sticky top-0 h-svh overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_70%_40%,rgba(214,179,106,0.12),transparent_60%)]" />
        {SCENES.map((sc, i) => (
          <AnimatedScene key={i} scene={sc} p={scrollYProgress} first={i === 0} last={i === SCENES.length - 1} />
        ))}
        <motion.div
          style={{ opacity: hint }}
          className="pointer-events-none absolute bottom-14 left-1/2 -translate-x-1/2 text-xs uppercase tracking-[0.25em] text-white/40"
        >
          Scorri
        </motion.div>
        <ProgressDots p={scrollYProgress} />
      </div>
    </div>
  );
}

/** Versione senza movimento (prefers-reduced-motion): le sei scene in sequenza, nel loro stato finale. */
function StaticHero() {
  const done = useMemo(() => motionValue(1), []);
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-16 px-6 pb-20 pt-28">
      {SCENES.map((sc, i) => (
        <div key={i} className="grid items-center gap-8 md:grid-cols-2">
          <div className="h-[340px] md:order-2">
            <FitBox w={sc.size[0]} h={sc.size[1]} className="h-full">
              {sc.visual(done)}
            </FitBox>
          </div>
          <div className="md:order-1">
            <Caption scene={sc} last={i === SCENES.length - 1} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function Hero() {
  const reduce = useReducedMotion();
  return (
    <section id="top" aria-label="Brindo" className="relative bg-ink text-white">
      {reduce ? <StaticHero /> : <AnimatedHero />}
    </section>
  );
}
