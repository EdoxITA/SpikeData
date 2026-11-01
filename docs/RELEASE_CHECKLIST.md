# SpikeData · Prima di pubblicare

- [ ] Il proprietario ha provato l'anteprima e approvato per iscritto
- [ ] `src/VERSION` aumentato (cambia il nome della cache: i telefoni scaricano la nuova versione)
- [ ] `python3 tools/build.py` eseguito e file generati inclusi nel commit
- [ ] Tutte le suite di test superate, baseline visiva confrontata
- [ ] SQL di produzione applicato solo se approvato, prima del codice che ne dipende (l'app attuale è compatibile sia prima sia dopo l'SQL della fase B)
- [ ] Prova su almeno un iPhone/iPad e un Android reali: apertura offline, aggiornamento, import, PDF
- [ ] Ricordare che il push su `main` va online subito
- [ ] Ritorno indietro: ripubblicare il commit precedente **non** riporta indietro i dati già migrati (vale da quando arriverà la migrazione IndexedDB)
