/* Legge i file Excel della distinta in un processo separato.
   Se un file è costruito apposta per creare problemi (bug noti della libreria di lettura),
   resta chiuso qui dentro: l'app non viene toccata e dopo 15 secondi il processo viene fermato. */
self.onmessage = function (e) {
  try {
    importScripts('vendor/xlsx.core.min.js');
    var wb = XLSX.read(e.data, { type: 'array', cellFormula: false, cellHTML: false, cellStyles: false, sheetRows: 600 });
    var rows = [];
    wb.SheetNames.slice(0, 10).forEach(function (n) {
      XLSX.utils.sheet_to_json(wb.Sheets[n], { header: 1, raw: false, defval: '' }).forEach(function (r) {
        if (rows.length < 2000) rows.push(r.slice(0, 30).map(function (c) { return String(c).slice(0, 200); }));
      });
    });
    self.postMessage({ ok: true, rows: rows });
  } catch (err) {
    self.postMessage({ ok: false });
  }
};
