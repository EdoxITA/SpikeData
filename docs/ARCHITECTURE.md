# SpikeData · Architettura

- `src/core.html`: app (interfaccia, logica sportiva, statistiche, PDF, Excel) — ancora in un unico file.
- `src/pwa_extra.js`: installazione, import della distinta (CSV, Excel, PDF), salvataggio file.
- `src/pwa_cloud.js`: account, squadre, inviti, sincronizzazione Supabase.
- `src/import-worker.js`: lettura isolata dei file Excel.
- `src/splash.html`: schermata di caricamento (in sospeso, si attiva con `SPLASH=1`).
- `src/privacy.html`, `src/config.json` (indirizzo Supabase e chiavi **pubbliche**), `src/VERSION`.
- `tools/build.py`: genera `index.html`, `sw.js`, `manifest.webmanifest`, `privacy.html`, `import-worker.js` nella cartella principale (pubblicata da GitHub Pages).

Prossimo passo (fase C): estrarre in moduli separati logica sportiva, statistiche e persistenza, verificando che la build e la baseline visiva restino identiche.
