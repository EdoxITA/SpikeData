# Brindo — sito di presentazione

One-page per presentare Brindo ai gestori di discoteche e locali notturni e raccogliere richieste di demo.
Stack: Next.js (App Router) · Tailwind CSS v4 · Framer Motion · TypeScript.

> Il prodotto non esiste ancora: il sito non contiene numeri, clienti o recensioni inventati. Le schermate nei mockup sono illustrative.

## Avvio in locale

```bash
cd brindo
npm install
cp .env.example .env.local   # opzionale
npm run dev                  # http://localhost:3000
```

Build di produzione: `npm run build && npm run start`.

## Variabili d'ambiente

| Variabile | Descrizione |
| --- | --- |
| `CONTACT_ENDPOINT_URL` | Endpoint che riceve le richieste del form (POST JSON con `venue`, `name`, `phone`, `email`, `city`, `source`, `receivedAt`). Se vuota, le richieste vengono solo stampate nei log del server (console). |
| `NEXT_PUBLIC_SITE_URL` | URL pubblico del sito (es. `https://brindo.it`), usato per i link Open Graph. |

## Pubblicazione su Vercel

1. Pubblica il repository su GitHub.
2. Su [vercel.com/new](https://vercel.com/new) importa il repository e, in **Root Directory**, seleziona `brindo`.
3. Framework Preset: Next.js (rilevato automaticamente). Aggiungi le variabili d'ambiente sopra in *Settings → Environment Variables*.
4. **Deploy**. Ogni push sul branch principale pubblica una nuova versione.

## Struttura

```
app/                 layout (SEO/Open Graph), pagina, API del form, robots, icona, immagine OG
components/hero/     animazione hero guidata dallo scroll (Hero, scene in screens.tsx, QueueArt)
components/sections/ sezioni della pagina (Problem, HowItWorks, Strengths, ZeroCost, BringBack, Mockups, Faq, ContactForm)
components/ui/       elementi condivisi (Phone, FitBox, Reveal, Icon, Logo, Button, Section)
lib/                 contenuti testuali e hook prefers-reduced-motion
```

## L'animazione hero

È un'unica sezione alta circa 6 schermate con un "palco" `sticky`: `useScroll` produce un progresso 0–1 che governa sei scene
(fila → QR → pagamento → barman → notifica → chiusura). Le scene sono disegnate in codice (SVG e div), a dimensione fissa, e `FitBox` le scala
per adattarle a qualsiasi schermo. Con `prefers-reduced-motion: reduce` l'animazione viene sostituita da sei blocchi statici, nello stato finale di ogni scena;
anche le animazioni delle altre sezioni vengono disattivate.

## Modificare i contenuti

Testi di problema, passaggi, punti di forza, FAQ e contatti sono in `lib/content.ts`. Il testo dell'hero è in `components/hero/Hero.tsx`.
