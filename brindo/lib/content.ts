export const CONTACT = {
  email: "info@skalio.it",
  phone: "366 505 5360",
  phoneHref: "tel:+393665055360",
};

export const PROBLEMS = [
  {
    title: "File lunghe al bar",
    text: "Nelle ore di punta il bancone diventa un collo di bottiglia: i clienti aspettano, lo staff corre, l'atmosfera si spegne.",
  },
  {
    title: "Clienti che rinunciano",
    text: "Davanti a una fila infinita molti lasciano perdere. Il drink che non ordinano è un incasso che non vedrai mai.",
  },
  {
    title: "Incassi persi nei momenti migliori",
    text: "Le ore di punta dovrebbero essere le più redditizie della serata. Con la fila diventano quelle in cui perdi di più.",
  },
];

export const STEPS = [
  {
    title: "Scansiona il QR",
    text: "Un QR code sul tavolo o al bancone apre il menu del locale direttamente nel browser. Nessuna app, nessuna registrazione lunga.",
  },
  {
    title: "Ordina e paga",
    text: "Il cliente sceglie i drink e paga in un tap con Apple Pay o Google Pay. L'ordine arriva subito al bar.",
  },
  {
    title: "Ritira il drink",
    text: "Quando è pronto arriva una notifica. Il cliente va al bancone e ritira, senza fare la fila.",
  },
];

export type StrengthIcon =
  | "qr"
  | "brand"
  | "star"
  | "users"
  | "mail"
  | "bolt"
  | "heart"
  | "chart";

export const STRENGTHS: { icon: StrengthIcon; title: string; text: string }[] = [
  {
    icon: "qr",
    title: "Nessuna app da scaricare",
    text: "Basta un QR code: si ordina dal browser in pochi secondi.",
  },
  {
    icon: "brand",
    title: "Personalizzato per ogni locale",
    text: "Menu, colori e logo del tuo locale. Il cliente si ritrova a casa tua.",
  },
  {
    icon: "star",
    title: "Recensioni",
    text: "Il cliente può lasciare una recensione direttamente dopo l'ordine.",
  },
  {
    icon: "users",
    title: "Contatti dei clienti",
    text: "Ogni ordine diventa un contatto per il locale.",
  },
  {
    icon: "mail",
    title: "Marketing post-evento incluso",
    text: "Remarketing automatico su WhatsApp ed email con le prossime serate e le offerte, gestito da noi.",
  },
  {
    icon: "bolt",
    title: "Promo in tempo reale",
    text: "Lanci un'offerta e la vedono subito tutti i clienti nel locale.",
  },
  {
    icon: "heart",
    title: "Mance digitali",
    text: "I clienti possono lasciare una mancia allo staff del bar.",
  },
  {
    icon: "chart",
    title: "Report a fine serata",
    text: "Incassi, drink più venduti, orari di picco.",
  },
];

export const RETURN_STEPS = [
  { title: "Ordine", text: "Il cliente ordina dal telefono." },
  { title: "Contatto", text: "Il suo contatto entra nella tua base clienti." },
  { title: "Comunicazione", text: "Messaggi WhatsApp ed email con le prossime serate e le offerte." },
  { title: "Ritorno", text: "Il cliente torna nel tuo locale." },
];

export const FAQ = [
  {
    q: "Serve il wifi?",
    a: "Il cliente ordina dal browser del proprio smartphone, quindi può usare la propria connessione dati. Il dispositivo del bancone ha invece bisogno di una connessione a internet stabile per ricevere gli ordini in tempo reale.",
  },
  {
    q: "Quanto costa?",
    a: "Per il locale zero: nessun canone, nessuna percentuale sugli incassi, nessun costo di attivazione. Brindo guadagna solo una piccola commissione di servizio, di pochi centesimi, pagata dal cliente.",
  },
  {
    q: "Come si collega alla cassa?",
    a: "Gli ordini arrivano su uno schermo al bancone, senza bisogno di cambiare il tuo sistema. Se usi una cassa specifica, nella demo vediamo insieme come integrare Brindo nel tuo flusso di lavoro.",
  },
  {
    q: "Chi gestisce il marketing?",
    a: "Noi. Il remarketing su WhatsApp ed email dopo gli eventi, con le prossime serate e le offerte, è incluso e gestito dal team Brindo.",
  },
  {
    q: "Quanto tempo serve per attivarlo?",
    a: "Servono il menu, il logo e pochi dettagli sul locale. Ti indichiamo i tempi precisi durante la demo, in base alle tue esigenze.",
  },
];
