import type { ReactNode } from "react";

/** Smartphone mockup, dimensioni di design 260x520. */
export const PHONE_W = 260;
export const PHONE_H = 520;

export function Phone({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-[2.6rem] border-[7px] border-[#26262b] bg-black shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7),0_0_0_1px_rgba(255,255,255,0.08)] ${className}`}
      style={{ width: PHONE_W, height: PHONE_H }}
    >
      <div className="absolute left-1/2 top-2 z-30 h-[18px] w-[76px] -translate-x-1/2 rounded-full bg-black" />
      <div className="relative h-full w-full overflow-hidden rounded-[2rem] bg-[#0f0f12] text-white">
        {children}
      </div>
    </div>
  );
}
