"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import { Phone } from "@/components/ui/Phone";
import { Glasses } from "@/components/ui/Logo";
import { QueueArt } from "./QueueArt";

type Q = { q: MotionValue<number> };

const DRINKS = [
  { name: "Spritz", note: "Aperol, prosecco, soda", price: "8" },
  { name: "Gin Tonic", note: "Gin, tonica, lime", price: "9" },
  { name: "Negroni", note: "Gin, vermut, bitter", price: "9" },
  { name: "Moscow Mule", note: "Vodka, ginger beer", price: "9" },
];

/* ---------- Scena 1: la fila ---------- */
export function QueueScreen({ q }: Q) {
  return (
    <div className="relative h-[300px] w-[520px]">
      <QueueArt q={q} showBubble />
      <div className="absolute right-3 top-3 flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-sm text-white/80">
        <span className="h-2 w-2 animate-pulse rounded-full bg-red-400" />
        20 min di attesa
      </div>
    </div>
  );
}

/* ---------- Scena 2: QR + menu ---------- */
function QrCode() {
  const cells: [number, number][] = [];
  for (let r = 0; r < 9; r++)
    for (let c = 0; c < 9; c++) {
      const finder = (r < 3 && c < 3) || (r < 3 && c > 5) || (r > 5 && c < 3);
      if (finder) continue;
      if ((r * 7 + c * 13 + r * c) % 3 !== 0) cells.push([r, c]);
    }
  const finder = (x: number, y: number) => (
    <g transform={`translate(${x} ${y})`}>
      <rect width="33" height="33" fill="#fff" />
      <rect x="4" y="4" width="25" height="25" fill="#0a0a0c" />
      <rect x="9" y="9" width="15" height="15" fill="#fff" />
      <rect x="13" y="13" width="7" height="7" fill="#0a0a0c" />
    </g>
  );
  return (
    <svg viewBox="0 0 99 99" className="h-full w-full">
      <rect width="99" height="99" fill="#fff" />
      {finder(0, 0)}
      {finder(66, 0)}
      {finder(0, 66)}
      {cells.map(([r, c]) => (
        <rect key={`${r}-${c}`} x={c * 11} y={r * 11} width="11" height="11" fill="#0a0a0c" />
      ))}
    </svg>
  );
}

export function ScanScreen({ q }: Q) {
  const cam = useTransform(q, [0.38, 0.48], [1, 0]);
  const menu = useTransform(q, [0.42, 0.55], [0, 1]);
  const scanY = useTransform(q, [0, 0.38], [0, 120]);
  const flash = useTransform(q, [0.36, 0.42, 0.5], [0, 0.9, 0]);
  const menuY = useTransform(q, [0.42, 0.6], [30, 0]);
  return (
    <Phone>
      {/* fotocamera */}
      <motion.div style={{ opacity: cam }} className="absolute inset-0 bg-gradient-to-b from-[#1a1a1f] to-[#0b0b0d]">
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#2a2118] to-transparent" />
        <div className="absolute left-1/2 top-[38%] h-[130px] w-[130px] -translate-x-1/2 -translate-y-1/2">
          <div className="h-full w-full overflow-hidden rounded-lg p-2.5">
            <QrCode />
          </div>
          {["left-0 top-0 border-l-2 border-t-2", "right-0 top-0 border-r-2 border-t-2", "bottom-0 left-0 border-b-2 border-l-2", "bottom-0 right-0 border-b-2 border-r-2"].map((c) => (
            <span key={c} className={`absolute h-6 w-6 rounded-sm border-gold ${c}`} />
          ))}
          <motion.div style={{ y: scanY }} className="absolute inset-x-1 top-2 h-0.5 rounded bg-gold shadow-[0_0_14px_3px_rgba(214,179,106,0.8)]" />
        </div>
        <p className="absolute inset-x-0 bottom-12 text-center text-xs text-white/60">Inquadra il QR sul tavolo</p>
      </motion.div>
      <motion.div style={{ opacity: flash }} className="pointer-events-none absolute inset-0 z-20 bg-white" />
      {/* menu */}
      <motion.div style={{ opacity: menu, y: menuY }} className="absolute inset-0 pt-9">
        <div className="mx-3 mb-2 flex items-center gap-2 rounded-full bg-white/8 px-3 py-1 text-[10px] text-white/60">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> menu.brindo · nel browser
        </div>
        <div className="px-4 pb-2">
          <p className="text-[10px] uppercase tracking-widest text-gold">Il tuo locale</p>
          <p className="text-lg font-semibold">Drink List</p>
        </div>
        <ul className="space-y-2 px-3">
          {DRINKS.map((d) => (
            <li key={d.name} className="flex items-center justify-between rounded-2xl bg-white/6 px-3 py-3">
              <div>
                <p className="text-sm font-medium">{d.name}</p>
                <p className="text-[10px] text-white/50">{d.note}</p>
              </div>
              <span className="text-sm text-gold">€{d.price}</span>
            </li>
          ))}
        </ul>
      </motion.div>
    </Phone>
  );
}

/* ---------- Scena 3: pagamento ---------- */
export function PayScreen({ q }: Q) {
  const tapRow = useTransform(q, [0.08, 0.16, 0.28], [0, 1, 1]);
  const sheetY = useTransform(q, [0.28, 0.42], [330, 0]);
  const tapPay = useTransform(q, [0.52, 0.58, 0.68], [0, 1, 0]);
  const payScale = useTransform(q, [0.52, 0.58, 0.64], [1, 0.95, 1]);
  const done = useTransform(q, [0.68, 0.78], [0, 1]);
  const doneScale = useTransform(q, [0.68, 0.84], [0.6, 1]);
  return (
    <Phone>
      <div className="absolute inset-0 pt-9">
        <div className="px-4 pb-2">
          <p className="text-[10px] uppercase tracking-widest text-gold">Il tuo locale</p>
          <p className="text-lg font-semibold">Drink List</p>
        </div>
        <ul className="space-y-2 px-3">
          {DRINKS.map((d, i) => (
            <li key={d.name} className="relative flex items-center justify-between overflow-hidden rounded-2xl bg-white/6 px-3 py-3">
              {i === 0 && <motion.span style={{ opacity: tapRow }} className="absolute inset-0 rounded-2xl border border-gold bg-gold/15" />}
              <div className="relative">
                <p className="text-sm font-medium">{d.name}</p>
                <p className="text-[10px] text-white/50">{d.note}</p>
              </div>
              <span className="relative text-sm text-gold">€{d.price}</span>
            </li>
          ))}
        </ul>
      </div>
      {/* sheet pagamento */}
      <motion.div
        style={{ y: sheetY }}
        className="absolute inset-x-0 bottom-0 z-10 rounded-t-3xl border-t border-white/10 bg-[#1b1b20] px-4 pb-6 pt-4"
      >
        <div className="mx-auto mb-3 h-1 w-9 rounded-full bg-white/20" />
        <div className="flex items-center justify-between text-sm">
          <span>1 × Spritz</span>
          <span className="text-white/70">€8,00</span>
        </div>
        <div className="mt-1 flex items-center justify-between text-[11px] text-white/45">
          <span>Servizio</span>
          <span>pochi centesimi</span>
        </div>
        <motion.div style={{ scale: payScale }} className="relative mt-4 flex h-11 items-center justify-center rounded-xl bg-white text-[15px] font-semibold text-black">
          Apple Pay
          <motion.span style={{ opacity: tapPay }} className="absolute h-14 w-14 rounded-full bg-gold/60 blur-[2px]" />
        </motion.div>
        <div className="mt-2 flex h-11 items-center justify-center rounded-xl border border-white/20 text-[15px] font-medium text-white/90">
          <span className="font-bold text-[#8ab4f8]">G</span>oogle Pay
        </div>
      </motion.div>
      {/* conferma */}
      <motion.div style={{ opacity: done }} className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#0f0f12]">
        <motion.div style={{ scale: doneScale }} className="flex h-20 w-20 items-center justify-center rounded-full bg-gold text-ink">
          <svg viewBox="0 0 24 24" className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12.5l4.5 4.5L19 7.5" />
          </svg>
        </motion.div>
        <p className="mt-4 text-lg font-semibold">Pagato</p>
        <p className="text-xs text-white/50">Ordine #42 inviato al bar</p>
      </motion.div>
    </Phone>
  );
}

/* ---------- Scena 4: schermata barman ---------- */
export function BarScreen({ q }: Q) {
  const left = useTransform(q, [0, 0.3, 0.55, 0.75, 1], ["1.5%", "1.5%", "34.5%", "34.5%", "67.5%"]);
  const btn = useTransform(q, [0.72, 0.78, 0.84], [1, 0.92, 1]);
  const arrive = useTransform(q, [0, 0.12], [0, 1]);
  const readyGlow = useTransform(q, [0.8, 0.9], [0, 1]);
  const cols = ["Nuovi", "In preparazione", "Pronti"];
  return (
    <div className="h-[340px] w-[520px] overflow-hidden rounded-3xl border-[7px] border-[#26262b] bg-[#0f0f12] text-white shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)]">
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
        <span className="flex items-center gap-2 text-sm font-semibold">
          <Glasses className="h-5 w-auto text-gold" /> Bancone
        </span>
        <span className="flex items-center gap-1.5 text-xs text-emerald-300">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" /> Ordini live
        </span>
      </div>
      <div className="relative h-[calc(100%-49px)] p-3">
        <div className="grid h-full grid-cols-3 gap-2">
          {cols.map((c) => (
            <div key={c} className="rounded-2xl bg-white/[0.04] p-2">
              <p className="mb-2 px-1 text-[11px] uppercase tracking-wider text-white/50">{c}</p>
            </div>
          ))}
        </div>
        {/* card statiche */}
        <div className="absolute left-[35.5%] top-[62px] w-[30%] rounded-xl bg-white/8 p-2.5 text-xs">
          <p className="font-semibold">#41 · Gin Tonic</p>
          <p className="text-white/50">2 min fa</p>
        </div>
        <div className="absolute left-[68.5%] top-[62px] w-[30%] rounded-xl bg-emerald-400/10 p-2.5 text-xs text-emerald-200">
          <p className="font-semibold">#39 · Negroni</p>
          <p className="opacity-60">Pronto</p>
        </div>
        {/* card ordine in arrivo */}
        <motion.div
          style={{ left, opacity: arrive }}
          className="absolute top-[110px] w-[30%] rounded-xl border border-gold bg-[#1d1a12] p-2.5 text-xs shadow-[0_0_24px_-4px_rgba(214,179,106,0.5)]"
        >
          <p className="font-semibold text-gold">#42 · Spritz</p>
          <p className="mb-2 text-white/60">Pagato · Apple Pay</p>
          <motion.div style={{ scale: btn }} className="rounded-lg bg-gold py-1.5 text-center text-[11px] font-semibold text-ink">
            Segna come pronto
          </motion.div>
          <motion.p style={{ opacity: readyGlow }} className="absolute -bottom-6 left-0 right-0 text-center text-[11px] text-emerald-300">
            ✓ Cliente avvisato
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}

/* ---------- Scena 5: notifica e ritiro ---------- */
export function PickupScreen({ q }: Q) {
  const notifY = useTransform(q, [0, 0.2], [-40, 0]);
  const notifO = useTransform(q, [0, 0.15], [0, 1]);
  const personX = useTransform(q, [0.2, 0.75], [20, 285]);
  const glow = useTransform(q, [0.7, 0.85], [0, 1]);
  const ok = useTransform(q, [0.8, 0.92], [0, 1]);
  return (
    <div className="relative h-[340px] w-[520px]">
      <motion.div
        style={{ y: notifY, opacity: notifO }}
        className="absolute left-1/2 top-0 z-10 flex w-[340px] -translate-x-1/2 items-center gap-3 rounded-2xl border border-white/15 bg-[#222227]/95 p-3.5 shadow-2xl backdrop-blur"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ink text-gold">
          <Glasses className="h-6 w-auto" />
        </span>
        <span className="text-left">
          <span className="block text-[11px] uppercase tracking-wider text-white/45">Brindo · ora</span>
          <span className="block text-[15px] font-semibold text-white">Il tuo drink è pronto</span>
          <span className="block text-xs text-white/60">Ordine #42 · ritira al bancone</span>
        </span>
      </motion.div>
      <svg viewBox="0 0 520 340" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <line x1="0" y1="320" x2="520" y2="320" stroke="#fff" strokeOpacity="0.12" />
        <rect x="380" y="220" width="140" height="100" rx="6" fill="#18181c" stroke="#d6b36a" strokeOpacity="0.5" />
        <rect x="372" y="212" width="154" height="12" rx="4" fill="#d6b36a" />
        <motion.circle cx="440" cy="190" r="34" fill="#d6b36a" style={{ opacity: glow }} opacity={0} className="blur-xl" />
        {/* bicchiere */}
        <path d="M428 168h24l-3 36a9 9 0 0 1-18 0z" fill="#d6b36a" opacity="0.9" />
        <path d="M440 184v28M432 212h16" stroke="#d6b36a" strokeWidth="2" />
      </svg>
      <motion.svg viewBox="0 0 40 110" style={{ x: personX }} className="absolute bottom-[20px] left-0 h-[110px] w-[40px]" aria-hidden="true">
        <circle cx="20" cy="14" r="11" fill="#6b6b74" />
        <rect x="6" y="28" width="28" height="82" rx="13" fill="#6b6b74" />
      </motion.svg>
      <motion.div
        style={{ opacity: ok }}
        className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full border border-gold/50 bg-gold/10 px-4 py-1.5 text-sm text-gold"
      >
        Ritirato · zero fila
      </motion.div>
    </div>
  );
}

/* ---------- Scena 6: chiusura ---------- */
export function CloseScreen({ q }: Q) {
  const logoO = useTransform(q, [0.35, 0.65], [0, 1]);
  const logoS = useTransform(q, [0.35, 0.75], [0.8, 1]);
  return (
    <div className="relative h-[300px] w-[520px]">
      <QueueArt q={q} mode="leave" />
      <motion.div style={{ opacity: logoO, scale: logoS }} className="absolute inset-0 flex flex-col items-center justify-center gap-3">
        <Glasses className="h-24 w-auto text-gold" />
        <span className="text-5xl font-semibold tracking-tight text-white">Brindo</span>
      </motion.div>
    </div>
  );
}
