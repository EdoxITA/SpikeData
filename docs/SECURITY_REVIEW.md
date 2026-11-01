# SpikeData · Revisione di sicurezza

Riferimento: OWASP ASVS 5.0.0 (usato come elenco di controlli, nessuna certificazione).
Ambito verificato finora: codice dell'app, schema e funzioni SQL **su copia locale**, librerie incluse. Le impostazioni effettive della produzione non sono ancora state lette: **l'audit backend è incompleto** finché non si fa la fase I.

## Eseguito

| Area (ASVS) | Verifica | Esito |
|---|---|---|
| V1 Codifica e sanificazione | Dati malevoli dal server (nomi, squadre, zone, eventi, `__proto__`) mostrati in tutte le schede, PDF e time-out | Nessun codice eseguito, nessun elemento iniettato, nessuna prototype pollution (12/12) |
| V5 File | Import PDF con pdf.js 3.11.174 | Vulnerabile a CVE-2024-4367 → mitigato con `isEvalSupported:false` (verificato che l'opzione arrivi alla libreria); limite 20 pagine |
| V5 File | Import Excel con SheetJS 0.18.5 | CVE-2023-30533 e CVE-2024-22363 → lettura in worker isolato, timeout 15 s, max 5 MB; verificato che la libreria non entri mai nella pagina, file rotto → messaggio chiaro |
| V8 Autorizzazione | Ruoli proprietario / scout / sola visione / esterno / anonimo su tutte le tabelle e funzioni (copia locale) | 28/28 + 15/15 + 10/10 |
| V8 Autorizzazione | Partita eliminata reinviata da copia vecchia | Riprodotto sulla versione pubblicata (la partita tornava visibile); risolto nell'app; trigger SQL pronto e testato |
| V6/V2 Inviti | Codici a 32 bit, nessun limite, accettazione non atomica | SQL pronto: 12 caratteri, 10 tentativi/ora, `FOR UPDATE`, niente esecuzione anonima (testato in locale) |
| V14 Configurazione | Service worker | Cancellava cache non sue → corretto |
| V13/V14 Segreti | Ricerca di chiavi nel repository e nella cronologia | Presenti solo chiave *publishable* Supabase e chiave sito Turnstile, entrambe pubbliche per progetto. Nessuna chiave segreta trovata |

## Da verificare (non dichiarato superato)

- Policy, funzioni, permessi e Realtime **in produzione** (lettura in sola lettura dalla dashboard): blocca il rilascio della parte cloud se differiscono.
- Impostazioni Auth: scadenza e riuso dei link email, redirect consentiti, limiti di frequenza, protezione password compromesse, durata sessioni.
- Header reali di GitHub Pages (nessun header personalizzabile: CSP solo come meta tag, che non copre tutto).
- Origine condivisa `edoxita.github.io` (P08).
- Export Excel e testi che iniziano con `=` (P19).
- Membro rimosso con copia offline: i dati già scaricati restano sul suo dispositivo (limite intrinseco, da documentare all'utente).
