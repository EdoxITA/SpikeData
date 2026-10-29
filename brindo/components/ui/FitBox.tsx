"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Disegna il contenuto a dimensione fissa (w x h) e lo scala per farlo stare
 * nello spazio disponibile del contenitore, così i mockup restano nitidi su
 * qualsiasi schermo.
 */
export function FitBox({
  w,
  h,
  maxScale = 1.15,
  className = "",
  children,
}: {
  w: number;
  h: number;
  maxScale?: number;
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) return;
      setScale(Math.min(r.width / w, r.height / h, maxScale));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [w, h, maxScale]);

  return (
    <div ref={ref} className={`relative w-full ${className}`}>
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: w,
          height: h,
          transform: `translate(-50%, -50%) scale(${scale ?? 1})`,
          opacity: scale === null ? 0 : 1,
        }}
      >
        {children}
      </div>
    </div>
  );
}
