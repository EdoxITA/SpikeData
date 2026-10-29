import type { ReactNode } from "react";
import { Reveal } from "./Reveal";

export function Section({
  id,
  tone = "light",
  className = "",
  children,
}: {
  id?: string;
  tone?: "light" | "dark";
  className?: string;
  children: ReactNode;
}) {
  const colors = tone === "dark" ? "bg-ink text-white" : "bg-paper text-ink";
  return (
    <section id={id} className={`relative px-6 py-24 sm:py-32 ${colors} ${className}`}>
      <div className="mx-auto max-w-6xl">{children}</div>
    </section>
  );
}

export function SectionHeading({
  kicker,
  title,
  text,
  tone = "light",
  center = false,
}: {
  kicker: string;
  title: ReactNode;
  text?: string;
  tone?: "light" | "dark";
  center?: boolean;
}) {
  return (
    <div className={`max-w-3xl ${center ? "mx-auto text-center" : ""}`}>
      <Reveal>
        <p className={`mb-4 text-xs font-medium uppercase tracking-[0.2em] ${tone === "dark" ? "text-gold" : "text-gold-deep"}`}>{kicker}</p>
        <h2 className="text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">{title}</h2>
      </Reveal>
      {text && (
        <Reveal delay={0.1}>
          <p className={`mt-6 text-lg leading-relaxed sm:text-xl ${tone === "dark" ? "text-white/65" : "text-ink/60"}`}>{text}</p>
        </Reveal>
      )}
    </div>
  );
}
