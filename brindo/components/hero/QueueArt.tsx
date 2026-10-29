"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import { useReducedMotion } from "@/lib/useReducedMotion";

const PEOPLE = 10;
const GROUND = 250;

function Person({
  i,
  q,
  mode,
}: {
  i: number;
  q: MotionValue<number>;
  mode: "queue" | "leave";
}) {
  const reduce = useReducedMotion();
  const x0 = 30 + i * 34;
  const tone = ["#4a4a52", "#3d3d44", "#55555d", "#34343a"][i % 4];
  const opacity = useTransform(
    q,
    mode === "leave" ? [i * 0.04, i * 0.04 + 0.3] : [0, 1],
    mode === "leave" ? [1, 0] : [1, 1],
  );
  const shift = useTransform(q, [0, 1], mode === "leave" ? [0, -40] : [0, 10]);
  return (
    <motion.g style={{ opacity, x: shift }}>
      <motion.g
        animate={reduce || mode === "leave" ? undefined : { y: [0, -2.5, 0] }}
        transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.17, ease: "easeInOut" }}
      >
        <circle cx={x0} cy={GROUND - 66} r={9} fill={tone} />
        <rect x={x0 - 11} y={GROUND - 54} width={22} height={54} rx={10} fill={tone} />
        {i === PEOPLE - 1 && (
          <rect x={x0 + 8} y={GROUND - 46} width={7} height={12} rx={2} fill="#d6b36a" opacity={0.85} />
        )}
      </motion.g>
    </motion.g>
  );
}

/** Bancone affollato (illustrazione minimale). */
export function QueueArt({
  q,
  mode = "queue",
  showBubble = false,
}: {
  q: MotionValue<number>;
  mode?: "queue" | "leave";
  showBubble?: boolean;
}) {
  const bubble = useTransform(q, [0.35, 0.5], [0, 1]);
  return (
    <svg viewBox="0 0 520 300" className="h-full w-full" role="img" aria-label="Una lunga fila di persone davanti al bancone del bar">
      {/* pavimento */}
      <line x1="0" y1={GROUND} x2="520" y2={GROUND} stroke="#ffffff" strokeOpacity="0.12" />
      {/* bancone */}
      <rect x="390" y="150" width="130" height="100" rx="6" fill="#18181c" stroke="#d6b36a" strokeOpacity="0.5" />
      <rect x="384" y="142" width="142" height="12" rx="4" fill="#d6b36a" />
      {/* barman */}
      <circle cx="450" cy="96" r="10" fill="#6b6b74" />
      <rect x="437" y="108" width="26" height="40" rx="10" fill="#6b6b74" />
      {/* bottiglie */}
      {[410, 430, 470, 490].map((x, k) => (
        <rect key={x} x={x} y={118 - (k % 2) * 8} width="7" height={26 + (k % 2) * 8} rx="2" fill="#d6b36a" opacity="0.45" />
      ))}
      {Array.from({ length: PEOPLE }).map((_, i) => (
        <Person key={i} i={i} q={q} mode={mode} />
      ))}
      {showBubble && (
        <motion.g style={{ opacity: bubble }}>
          <rect x="78" y="118" width="124" height="34" rx="17" fill="#ffffff" />
          <path d="M126 152l8 10 6-10z" fill="#ffffff" />
          <text x="140" y="140" textAnchor="middle" fontSize="14" fontWeight="600" fill="#0a0a0c">
            Lascio perdere.
          </text>
        </motion.g>
      )}
    </svg>
  );
}
