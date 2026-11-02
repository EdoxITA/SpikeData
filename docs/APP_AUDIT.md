# SpikeData · Audit dell'app (fase A)

Data: 1 novembre 2026 · Commit di partenza: `05a3b8b` (main) · Branch di lavoro locale: `miglioramenti-fase-a`

## 1. Fotografia tecnica

| Voce | Stato rilevato |
|---|---|
| Tipo | PWA statica in un solo file `index.html` (~237 KB, HTML + CSS + JS vanilla in un'unica funzione) |
| Pubblicazione | GitHub Pages dal ramo `main`, cartella principale (`.nojekyll`). **Ogni push su `main` va online subito**: non ci sono workflow né controlli intermedi |
| Sorgenti | Prima di questo intervento i sorgenti e lo script di build **non erano nel repository** (solo il file finale). Ora sono in `src/` con `tools/build.py`; la build riproduce byte per byte la versione pubblicata (verificato con `cmp`) |
| Librerie (vendor/) | supabase-js 2.118.0 · SheetJS (xlsx.core) 0.18.5 · pdf.js 3.11.174 (+ worker) · font Barlow / Barlow Condensed locali |
| Dati locali | `localStorage`: partita in corso `scout-volley-v1`, archivio `scout-volley-v1-arch`, stato cloud `scout-volley-cloud`, spazi per squadra `scout-volley-ws-<id>`, sessione `scout-volley-auth` |
| Backend | Supabase (Postgres + Auth + Realtime): tabelle `teams`, `team_members`, `invites`, `matches`; funzioni `create_team`, `accept_invite`, `team_role`, `delete_my_account`, `keepalive`; trigger di controllo (limiti, proprietario, timbro partite) |
| Servizi esterni | Supabase (dati e account), Cloudflare Turnstile (captcha), Gmail SMTP (email account), GitHub Pages (hosting), cron-job.org (ping ogni 6 ore) |
| Altri rami | `nuovo`: due commit iniziali di una versione precedente (“Scout Volley”), non collegati alla storia attuale. Non toccato |
| Test | 17 suite automatiche (Playwright) + 3 suite SQL su copia locale dello schema; tenute fuori dal repository perché usano dati e percorsi di prova (da portare in `tests/` nella fase C) |

## 2. Baseline visiva

20 schermate di riferimento (telefono 390×844, tablet verticale 820×1180 e orizzontale 1180×820, desktop 1440×900; schede Scout, Statistiche, Stagione, Squadra, Impostazioni) con dati fittizi. Dopo le correzioni della fase B il confronto pixel per pixel non mostra **nessuna differenza** (vedi `UI_CHANGES.md`).

## 3. Rilievi

Classificazione: **Confermato** (riprodotto o visto nel codice), **Rischio** (da verificare), **Miglioria**, **Info mancante**.
Tipo: V = vulnerabilità · D = perdita/integrità dati · S = errore sportivo/statistico · U = usabilità · A = architettura/manutenzione.

| ID | Classe | Tipo | Gravità | Rilievo ed evidenza | Impatto | Soluzione | Stato |
|---|---|---|---|---|---|---|---|
| P01 | Confermato | D | Alta | Le scritture su `localStorage` (partita, archivio, stato cloud) erano in `try{}catch(e){}` senza segnalazione | Con memoria piena o navigazione privata lo scout continuava ma **non salvava**, senza avviso | Funzione unica `lsWrite` con avviso visibile e messaggio chiaro; archivio IndexedDB in fase D | Avviso fatto (fase B) |
| P02 | Confermato | V | Alta | pdf.js 3.11.174 vulnerabile a CVE-2024-4367 (esecuzione di codice aprendo un PDF costruito ad arte); l'import distinta apriva i PDF senza `isEvalSupported:false` | Un PDF malevolo importato poteva leggere dati e sessione | `isEvalSupported:false` + `disableFontFace:true` + massimo 20 pagine; aggiornamento a pdf.js 4.x in fase H | Mitigato (fase B) |
| P03 | Confermato | V | Media | SheetJS 0.18.5: CVE-2023-30533 (prototype pollution in lettura) e CVE-2024-22363 (ReDoS) | File Excel malevolo poteva alterare l'app o bloccarla | Lettura spostata in un worker separato (`import-worker.js`) con limite 15 s, 5 MB, righe/colonne limitate; la libreria non viene più caricata nella pagina | Mitigato (fase B); aggiornamento a 0.20.3 bloccato: il sito di distribuzione SheetJS non è raggiungibile da questo ambiente |
| P04 | Confermato | S | Media | Nel PDF del report i simboli “−” e “•” uscivano come caratteri sbagliati e le parentesi non erano protette: due funzioni con lo stesso nome `esc` (una per il PDF, una per l'HTML del cloud) | Report illeggibili in alcuni punti; nomi con parentesi potevano rompere il PDF | Funzione HTML rinominata `escH` | Risolto e verificato sul PDF |
| P05 | Confermato | D | Media | Una partita eliminata da un dispositivo **ritornava** se un altro dispositivo con una copia vecchia la modificava (l'invio rimetteva `deleted:false`) | Dati cancellati che riappaiono | App: elenco delle partite eliminate, rimosse localmente e mai reinviate. Server: trigger che impedisce di “de-eliminare” (SQL pronto) | App risolta e verificata (il test fallisce sulla versione vecchia, passa sulla nuova); SQL da applicare |
| P06 | Confermato | D | Alta | Sincronizzazione: ogni salvataggio invia **l'intera partita** e vince l'ultima scrittura, ordinata con l'orologio del dispositivo | Con due scout sulla stessa partita (o un dispositivo offline che rientra) si perdono azioni senza avviso | Un solo scout attivo per partita, controllato dal server (blocco di 2 minuti, subentro esplicito, copia locale conservata se si perde il ruolo). Coda persistente e IndexedDB in fase D | Fatto nell'app e su copia locale; SQL da applicare **prima** di pubblicare |
| P07 | Confermato | A | Bassa | Il service worker cancellava **tutte** le cache dell'indirizzo `edoxita.github.io` | Avrebbe cancellato cache di altri progetti pubblicati sotto lo stesso indirizzo | Cancella solo le cache `scout-volley-*` | Risolto e verificato |
| P08 | Rischio | V | Media | L'app è su `edoxita.github.io`: `localStorage` (con la sessione Supabase) è condiviso con **qualsiasi altra pagina** pubblicata sotto quell'indirizzo | Oggi c'è un solo progetto pubblicato, quindi nessun rischio attivo; diventa reale se si pubblica un altro sito GitHub Pages dallo stesso account | Dominio dedicato (es. `app.spikedata.it`) o tenere un solo progetto Pages sull'account | Da decidere |
| P09 | Confermato | V | Media | Inviti: codice di 8 caratteri esadecimali (32 bit), nessun limite ai tentativi, accettazione non atomica (due persone in contemporanea con lo stesso codice) | Indovinare un codice è lento ma possibile; doppio uso raro | Codici di 12 caratteri (~60 bit), massimo 10 tentativi sbagliati/ora per utente, riga bloccata durante l'accettazione, funzioni non eseguibili da utenti anonimi | Applicato in produzione il 2/11 e verificato (colonne, trigger, funzioni, permessi) |
| P10 | Confermato | U | Media | Si può annullare solo l'**ultima** azione | Un errore scoperto dopo qualche scambio non si corregge senza perdere le azioni successive | Correzione ed eliminazione di qualsiasi azione con ricalcolo di punteggio, servizio, rotazioni e statistiche; annulla correzione | Fatto (2/11) |
| P11 | Confermato | D | Media | Due schede/finestre aperte sull'app si sovrascrivono a vicenda (nessun controllo) | Perdita di azioni se si apre l'app due volte | Fase D: blocco “una scheda attiva” o ascolto delle modifiche | Da fare |
| P12 | Confermato | V/privacy | Media | Informativa: titolare indicato come “SpikeData” (non è un soggetto giuridico), mancano Cloudflare Turnstile e Google (email), “password cifrata” è impreciso (è un hash), regione Supabase dichiarata ma non verificata | Informativa non corrispondente al trattamento reale | Fase H, con le domande in `PRIVACY_OPEN_QUESTIONS.md` | Da fare |
| P13 | Rischio | V | Media | Le policy di sicurezza sono state testate su una **copia locale** dello schema, non lette dalla produzione | Se la produzione differisce dai file, l'esito non vale | Fase I: lettura in sola lettura di `pg_policies`, funzioni e permessi in produzione | Da verificare |
| P14 | Miglioria | A | Media | Sorgenti e build fuori dal repository | Modifiche non revisionabili, rischio di perdere il codice | `src/` + `tools/build.py` | Fatto |
| P15 | Confermato | U | Media | Aggiornamenti: il nuovo service worker si attiva subito (`skipWaiting`) e la nuova pagina arriva alla riapertura, senza avviso né numero di versione visibile | Possibile mix di versioni durante l'aggiornamento; difficile capire quale versione si usa | Fase H: versione visibile, aggiornamento proposto in un momento sicuro (mai durante una partita) | Da fare |
| P16 | Rischio | V | Bassa | Funzioni `SECURITY DEFINER` con `search_path = public` invece che vuoto | Superficie teorica di hijack del percorso | Hardening `search_path = ''` con nomi completi | Da fare (fase I) |
| P17 | Info mancante | V | — | Impostazioni Auth della produzione: regione del progetto, limiti di frequenza, scadenza link, elenco redirect consentiti, protezione password compromesse | Non verificabile dal codice | Verifica in dashboard (sola lettura) | Da verificare |
| P18 | Confermato | V | Bassa | Nessuna Content-Security-Policy. GitHub Pages non permette header HTTP personalizzati | Nessuna seconda barriera contro iniezioni | Meta CSP con hash degli script inline (fase H), consapevoli che non sostituisce gli header | Da fare |
| P19 | Rischio | V | Bassa | Export Excel: testi che iniziano con `=`, `+`, `-`, `@` | In xlsx le celle sono scritte come testo, quindi non diventano formule; da confermare con test | Test dedicato e prefisso `'` se necessario | Da verificare |
| P20 | Confermato | S | Media | Il punteggio automatico dipende solo dalle azioni della nostra squadra; non esiste il concetto di “scambio” | Con lo scout avversario si rischierebbe il doppio punto (es. ace nostro + ricezione sbagliata loro) | Fase C/E: modello per scambi, un punto per scambio | Da fare prima dello scout avversario |
| P21 | Confermato | — | — | Eliminazione account: l'app avvisa già che verranno eliminate per tutti le squadre di cui si è proprietari | — | Aggiungere trasferimento di proprietà (fase H) | Miglioria |

## 4. Cosa funziona già bene (da preservare)

- Pulizia di tutti i testi in ingresso (nomi, squadre, file, dati cloud) prima di mostrarli: il test di iniezione con dati malevoli dal server passa (12/12).
- Regole di accesso per ruolo (proprietario, scout, sola visione, esterno) testate: 28/28 + 15/15 su copia locale.
- Limiti lato server: squadre per utente, inviti al giorno, dimensione delle partite e della rosa.
- Captcha su registrazione/accesso/recupero password, conferma email attiva, eliminazione account dall'app.
