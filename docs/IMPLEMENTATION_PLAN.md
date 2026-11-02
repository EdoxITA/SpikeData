# SpikeData · Piano di lavoro

Regola generale: nessun push, pull request o pubblicazione prima che il proprietario abbia provato e approvato l'anteprima. Ogni push su `main` va online subito (GitHub Pages).

| Fase | Contenuto | Stato |
|---|---|---|
| A | Inventario, baseline visiva (20 schermate), rilievi con evidenze (`APP_AUDIT.md`) | **Fatta** |
| B | Correzioni critiche reversibili: avviso di salvataggio fallito, protezione import PDF/Excel, PDF del report, cache del service worker, partite eliminate che ritornano; SQL inviti/eliminazioni pronto | **Fatta lato app** · SQL in attesa di approvazione |
| C | Sorgenti nel repository (fatto), separazione progressiva in moduli (logica sportiva, statistiche, persistenza, sync, import/export) senza cambiare l'aspetto; modello per scambi; formule statistiche in un solo punto; test in `tests/` | Da fare |
| D | Archivio IndexedDB con migrazione verificata da `localStorage` (copia originale conservata); stato di salvataggio veritiero; coda di invio persistente; operazioni per azione con revisioni; un solo scout attivo per partita controllato dal server; controllo più schede | Da fare |
| E | Scouting avversario facoltativo e indipendente dalla modalità avanzata (rosa avversaria con numeri/alias, “non identificato”, modalità semplice/dettagliata, punteggio unico) | Da fare |
| F | ✔ Correzione delle azioni passate (fatta 2/11) · con ricalcolo di punteggio, servizio, rotazioni e statistiche; schermo sempre acceso; scorciatoie da tastiera; vibrazione facoltativa | Da fare |
| G | Regole personalizzate salvate nella partita (set, punti, scarto, tie-break, allenamento); statistiche con numero di osservazioni; stagione e report coerenti tra schermo, PDF ed Excel | Da fare |
| H | PWA: versione visibile, aggiornamento proposto in momento sicuro, aggiornamento pdf.js/SheetJS, CSP; privacy: informativa corretta, export dati, gestione proprietà squadre | Da fare |
| I | Audit finale: lettura in sola lettura delle policy di produzione, test per ruolo con utenti di prova, partita simulata di 5 set con interruzioni di rete | Da fare |
| J | Anteprima interattiva (artefatto) con dati fittizi e backend simulato, separata dalla produzione | Da fare |
| K | Solo dopo approvazione: push/PR e pubblicazione | Bloccata |
| L | Video locale manuale (incremento successivo) | Dopo K |

## Decisioni richieste al proprietario

1. ~~SQL di produzione~~ **Applicato il 2/11/2026** dal proprietario (eliminazioni definitive, inviti più sicuri, scout unico); verificato in sola lettura.
2. Dominio dedicato per isolare i dati dell'app (rilievo P08)?
3. Dati per l'informativa privacy (vedi `PRIVACY_OPEN_QUESTIONS.md`).
4. ~~Sincronizzazione~~ **Deciso (1/11/2026): un solo scout attivo per partita**, gli altri in sola visione; il controllo sarà applicato lato server (fase D).
