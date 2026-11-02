# SpikeData · Modifiche visibili

Baseline: 20 schermate (telefono, tablet verticale/orizzontale, desktop × 5 schede). Dopo la fase B: **identiche al pixel**.

## Correzioni necessarie
- **Avviso di salvataggio non riuscito** (fase B). Compare solo se il dispositivo non riesce a salvare, sotto il punteggio, con bordo e testo nel rosso già usato per gli errori. Motivo: prima l'app non salvava senza dirlo (P01). In condizioni normali non si vede, quindi l'aspetto non cambia.
- **PDF del report**: i simboli “−” e “•” ora sono corretti (P04). Nessun cambio di impaginazione.

- **Dettaglio zone**: riga “errori senza zona di arrivo” (in rete, fuori, murati), perché il conteggio “0 errori” non tornava con il riepilogo.

## Integrazioni delle nuove funzioni
- **Correzione azioni** (2/11): le righe delle ultime azioni ora si toccano per correggerle; sotto c'è il link “Tutte le azioni · correggi”. Si apre la stessa schermata a pagina intera già usata per Salva partita e Time-out, con chip di atleta, fondamentale ed esito, impatto sul punteggio, “Salva correzione”, “Correggi le zone”, “Elimina azione” (due tocchi). Le azioni corrette mostrano “· corretta”. Prima/dopo: `ui_log_prima_dopo.png` (unica differenza nella baseline: il link sotto l'elenco).
- **Punti a mano da completare** (2/11): riga “Punto a noi/a loro · da completare” tra le azioni; schermata “Com’è stato fatto il punto?” con le stesse chip (azione nostra, errore avversario o nostro fallo).
- **Alzata brutta** (2/11): quarto pulsante di esito per l’alzata, stesso stile arancione già usato per “Sporcato” e “Brutta”.
- **Un solo scout per partita** (2/11): chi segue una partita fatta da un'altra persona vede nella barra in alto “In diretta · scout: email” e il pulsante “Prendi lo scout” (due tocchi). Usa lo stile della barra esistente.

## Proposte estetiche facoltative (non applicate)
Nessuna.

## Modifiche approvate
- 2/11/2026: avviso di salvataggio, PDF corretto, errori senza zona nel dettaglio zone (approvate dopo la prova dell'anteprima).
