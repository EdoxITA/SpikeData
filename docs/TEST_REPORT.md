# SpikeData · Risultati dei test

Ambiente: Chromium headless (Playwright) su Linux, viewport simulati di telefono, tablet e desktop; Postgres 16 locale con lo schema di produzione e un'autenticazione simulata. **Nessuna prova su dispositivi reali** (iPhone, iPad, Android): da fare prima del rilascio.

## Fase B (1 novembre 2026)

| Suite | Cosa verifica | Esito |
|---|---|---|
| t8–t20, t23 | Scout, punteggio, rotazioni, formazioni, cambi, falli, zone, alzate, statistiche, stagione, PDF, Excel, time-out, salva partita (telefono e tablet) | tutte superate (42, 36, 107, 40, 30, 24, 40, 26, 24, 76, 28, 22, 36) |
| t11, tpwa | App installabile: avvio, offline, import CSV/Excel/PDF | 42/42, 22/22 |
| t21 | Account, squadre, inviti, ruoli, sincronizzazione (backend simulato) | 53/53 |
| t22 | Dati malevoli dal server | 12/12 |
| **t24 (nuova)** | Rimedi fase B: avviso salvataggio, PDF con `isEvalSupported:false`, Excel isolato, file > 5 MB, file rotto, cache del service worker, partita eliminata | 14/14 |
| t24 su versione pubblicata | Controprova: il test sulle partite eliminate **fallisce** sulla versione online (la partita ritorna) e passa sulla nuova | confermato |
| SQL locale | Permessi per ruolo (28/28), limiti e sicurezza (15/15), correzioni fase B (10/10) | superati |
| Baseline visiva | 20 schermate prima/dopo confrontate pixel per pixel | nessuna differenza |
| PDF report | Simboli “−” “•” e parentesi nel PDF generato dall'app installabile | errati prima, corretti dopo |

## 2 novembre 2026

| Suite | Cosa verifica | Esito |
|---|---|---|
| **t25** | Correzioni: punto spostato, punto aggiunto nel posto giusto della sequenza, eliminazione con posizioni scalate, annulla correzione, solo statistica, set chiuso bloccato, persistenza, rotazione e servizio ricalcolati (telefono e tablet) | 37/37 |
| **t26** | Due dispositivi: chi segue vede in diretta e non modifica, subentro in due tocchi, l'altro passa a seguire, scout inattivo, lavoro offline conservato come copia, partita online non sovrascritta | 16/16 |
| **t27** | Punti a mano: diventano azioni, si completano (ace, 4 tocchi, errore avversario), avviso se l’esito sposta il punto, il − toglie il punto da completare o lo stacca dall’azione vera | 30/30 |
| **t28** | P1 in ricezione: opposto da 4 e banda da 2 sul primo attacco, poi scambio normale; in battuta e nelle altre rotazioni nessun cambiamento | 9/9 |
| SQL locale `sec_test_scout` | Blocco scout, subentro, ruoli (sola visione non subentra), archiviazione | 15/15 |
| Tutte le suite precedenti | regressione | tutte superate |

Una suite (t18) è stata aggiornata nella sessione precedente per l'efficienza che ora può essere negativa.
