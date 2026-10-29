"use client";

import { motion } from "framer-motion";
import { useReducedMotion } from "@/lib/useReducedMotion";
import type { StrengthIcon } from "@/lib/content";

const PATHS: Record<StrengthIcon, string[]> = {
  qr: [
    "M3 3h7v7H3z",
    "M14 3h7v7h-7z",
    "M3 14h7v7H3z",
    "M14 14h3v3h-3z",
    "M20 14v7",
    "M14 20h3",
  ],
  brand: [
    "M4 6h9",
    "M17 6h3",
    "M4 12h3",
    "M11 12h9",
    "M4 18h11",
    "M19 18h1",
    "M15 4v4h2V4z",
    "M7 10v4h2v-4z",
    "M17 16v4h2v-4z",
  ],
  star: ["M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"],
  users: [
    "M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
    "M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6",
    "M17 11a2.5 2.5 0 1 0 0-5",
    "M17 14c2.5 0 4 2 4 5",
  ],
  mail: ["M5 5h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z", "M3 7l9 6 9-6"],
  bolt: ["M13 2L4 14h7l-1 8 9-12h-7z"],
  heart: ["M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"],
  chart: ["M4 20V10", "M10 20V4", "M16 20v-8", "M22 20H2"],
};

export function Icon({ name, className = "h-7 w-7" }: { name: StrengthIcon; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {PATHS[name].map((d, i) => (
        <motion.path
          key={i}
          d={d}
          initial={reduce ? false : { pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 1 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.9, delay: 0.1 + i * 0.08, ease: "easeOut" }}
        />
      ))}
    </svg>
  );
}
