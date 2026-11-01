import re, shutil, os, sys
from pathlib import Path
"""Costruisce l'app pubblicata (index.html, sw.js, manifest, privacy.html) a partire da src/.
Uso:  python3 tools/build.py            (dalla cartella del progetto)
      SPLASH=1 python3 tools/build.py   (con la schermata di caricamento, ora in sospeso)
Non scarica nulla: font, librerie (vendor/) e icone sono già nel progetto."""
ROOT = Path(__file__).resolve().parent.parent
SP = ROOT/'src'
src = (SP/'core.html').read_text()
extra = (SP/'pwa_extra.js').read_text()
import json as _json
cloud = (SP/'pwa_cloud.js').read_text()
_c = _json.loads((SP/'config.json').read_text())
cloud = cloud.replace("var SB_URL='',SB_KEY='',TS_KEY='';", "var SB_URL=%s,SB_KEY=%s,TS_KEY=%s;" % (_json.dumps(_c['url']), _json.dumps(_c['key']), _json.dumps(_c.get('turnstile',''))), 1)
assert 'SB_KEY=' in cloud and "SB_URL=''" not in cloud
extra = extra + '\n' + cloud
OUT = ROOT
VERSION = (SP/'VERSION').read_text().strip()

def sub1(pat, rep, s, flags=0):
    new, n = re.subn(pat, lambda m: rep, s, count=1, flags=flags)
    assert n == 1, 'anchor not found: ' + pat[:60]
    return new
def rep1(old, new, s):
    assert s.count(old) == 1, 'anchor count %d: %s' % (s.count(old), old[:60])
    return s.replace(old, new)

# ---- head ----
lines = src.split('\n')
assert lines[0].startswith('<title>') and 'viewport-fit' in lines[1] and 'fonts.googleapis' in lines[2]
body = '\n'.join(lines[3:])
ff = ''
for fam, wts, d in (('Barlow',(400,500,600),'barlow'),('Barlow Condensed',(500,600,700),'barlow-condensed')):
    for w in wts:
        fn = f'{d}-latin-{w}-normal.woff2'
        assert (OUT/'fonts'/fn).exists(), fn
        ff += f"@font-face{{font-family:'{fam}';font-style:normal;font-weight:{w};font-display:swap;src:url(fonts/{fn}) format('woff2')}}\n"
head = '''<!doctype html>
<html lang="it">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>SpikeData</title>
<meta name="theme-color" content="#1f4fd1">
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" href="icons/icon-192.png">
<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="SpikeData">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<style>
[hidden]{display:none!important}
''' + ff
body = body.replace('<style>\n', '', 1) if body.startswith('<style>') else body
assert body.startswith('/* Layout') or True
# the original style tag was line 4; we merged it into head
tail = '''
</body>
</html>
'''
s = body

# ---- CSS additions ----
s = rep1('@media (min-width:821px){.edf{grid-template-columns:90px 1fr 1fr auto auto}}',
         '@media (min-width:821px){.edf{grid-template-columns:90px 1fr 1fr auto auto auto}}', s)
css_add = '''
.irow{display:grid;grid-template-columns:28px 54px minmax(0,1fr) minmax(0,1fr) 128px;gap:6px;align-items:center;padding:8px 0;border-top:1px solid var(--line)}
.irow input[type=text],.irow input:not([type]),.irow select{height:44px;min-width:0;width:100%;padding:0 8px;border-radius:10px;border:1px solid var(--line);background:var(--surface);color:var(--ink);font:inherit;font-size:16px}
.irow input[type=checkbox]{width:22px;height:22px}
.irow.warn select{border-color:var(--o-minus);box-shadow:0 0 0 2px var(--o-minus)}
.irow .dupn{grid-column:1 / -1;color:var(--o-minus)}
@media (max-width:640px){.irow{grid-template-columns:28px 54px minmax(0,1fr) minmax(0,1fr)}.irow select{grid-column:2 / -1}}
.emptyplayers{grid-column:1 / -1;text-align:center;padding:22px 14px}
.emptyplayers h2{margin:0 0 6px}
.emptyplayers .btn{margin-top:12px}
.upl{display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin:8px 0}
.clcred{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:8px 0}@media (max-width:640px){.clcred{grid-template-columns:1fr}}
.clcred input{height:48px;min-width:0;padding:0 12px;border-radius:12px;border:1px solid var(--line);background:var(--surface);color:var(--ink);font:inherit;font-size:16px}
.pwbox{position:relative}.pwbox input{width:100%;padding-right:96px}
.pweye{position:absolute;right:6px;top:50%;transform:translateY(-50%);height:36px;padding:0 12px;border-radius:999px;border:1px solid var(--line);background:var(--bg);color:var(--ink);font-weight:600;font-size:14px}
.pweye[aria-pressed="true"]{background:var(--ink);color:var(--bg);border-color:var(--ink)}
.accs{z-index:30}
.accpriv{text-align:center;margin-top:12px}.accpriv a{color:var(--accent);font-weight:600}
.accdel{margin-top:22px;border-top:1px solid var(--line);padding-top:12px}.accdel summary{cursor:pointer;color:var(--o-err);font-weight:600;font-size:15px}.accdel .note{margin:8px 0}
.clcap{display:flex;justify-content:center;margin-top:14px;min-height:65px}
.accw{text-align:center;margin:4px 0 10px}
.acclogo{width:64px;height:64px;margin:0 auto 6px;border-radius:18px;background:var(--accent) url(icons/icon-192.png) center/cover}
.accbrand{font-family:var(--f-disp);font-weight:700;font-size:15px;letter-spacing:.04em;color:var(--accent);margin-bottom:2px;font-size:18px}
.acch{font-family:var(--f-disp);font-weight:700;font-size:28px;margin-bottom:4px}
.seg{display:grid;grid-template-columns:1fr 1fr;gap:4px;padding:4px;border-radius:14px;background:var(--line);margin:6px 0 12px}
.seg button{height:42px;border:0;border-radius:10px;background:none;font-weight:600;font-size:15px;color:var(--ink)}
.seg button[aria-selected="true"]{background:var(--surface);box-shadow:0 1px 3px rgba(0,0,0,.15)}
.fl{display:block;font-weight:600;font-size:14px;margin:10px 0 4px}.fl small{font-weight:400;color:var(--mute)}
.fin{width:100%;height:52px;padding:0 14px;border-radius:12px;border:1px solid var(--line);background:var(--surface);color:var(--ink);font:inherit;font-size:17px}
.accgo{width:100%;height:54px;margin-top:16px;font-size:18px}
.accfg{display:block;margin:12px auto 0;border:0;background:none;color:var(--accent);text-decoration:underline;font-weight:600;font-size:15px}
.accno{width:100%;margin-top:18px}
.cllive>span:first-child{min-width:0;font-size:13.5px;line-height:1.25}
.cllive.out{background:var(--surface);color:var(--ink);border:1px solid var(--line)}
.cllive .clb{display:flex;gap:6px;align-items:center}
.cllive button.pri{background:var(--accent);color:var(--accent-ink);border-color:var(--accent)}
.cllive button.x{border:0;background:none;color:var(--mute);padding:0 6px;font-size:15px}
.cllive small{font-weight:500;opacity:.8}
.chips button.lnk{border:0;background:none;color:var(--accent);text-decoration:underline;padding:0 6px}
.clcred.one{grid-template-columns:1fr}
.chips button.pri{background:var(--accent);color:var(--accent-ink);border-color:var(--accent)}
.clrow{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:8px;margin:8px 0}
.clrow input{height:48px;min-width:0;padding:0 12px;border-radius:12px;border:1px solid var(--line);background:var(--surface);color:var(--ink);font:inherit;font-size:16px}
.clh{margin:14px 0 6px;font-size:13px;letter-spacing:.06em;text-transform:uppercase;color:var(--mute);font-weight:600}
.cllist{display:flex;flex-direction:column;border:1px solid var(--line);border-radius:12px;overflow:hidden}
.clm{display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;padding:8px 12px;border-bottom:1px solid var(--line)}
.clm:last-child{border-bottom:0}.clm .chips button{height:34px;font-size:13px;padding:0 10px}
.chips button.d{color:var(--o-err);border-color:var(--o-err)}
.clask{border-color:var(--accent);margin-top:8px}
.clinv{margin-top:8px;padding:10px 12px;border-radius:12px;background:var(--accent-soft)}
.clmsg{margin-top:8px;font-weight:600;color:var(--ink)}
.cllive{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:6px 12px;margin:0 auto 8px;max-width:1400px;border-radius:10px;background:var(--accent-soft);color:var(--accent);font-weight:600;font-size:14px}
.cllive button{height:32px;padding:0 12px;border-radius:999px;border:1px solid var(--accent);background:var(--surface);color:var(--accent);font-weight:600;font-size:13px}
.cllive[hidden]{display:none}
'''
s = rep1('</style>', css_add + '</style>', s)

# ---- constants ----
s = re.sub(r"var BASE=\[.*?\n\];", 'var BASE=[];', s, count=1, flags=re.S)
assert 'var BASE=[];' in s
s = rep1("var LS='scout-garbagnate-v1';", "var LS='scout-volley-v1';", s)
s = rep1("fPl:null,edit:null,", "fPl:null,delArm:null,edit:null,", s)

# ---- settings pane: install + import cards ----
cards = '''<section id="paneSet" class="wrap" hidden>
    <div class="card" id="cloudCard"><h2>Account</h2><div class="note" id="accSum"></div><div class="upl"><button class="btn solid" id="accOpenBtn" data-act="clopen">Accedi o crea un account</button></div></div>
    <div class="card" id="instCard" hidden><h2>Installa l’app</h2>
      <div class="note" id="instTxt"></div>
      <div class="upl"><button class="btn solid" id="instBtn" hidden>Installa</button></div>
    </div>
'''
s = rep1('<section id="paneSet" class="wrap" hidden>', cards, s)
teamcards = '''<section id="paneTeam" class="wrap" hidden>
    <div class="card" id="teamCloud"></div>
'''
s = rep1('<section id="paneTeam" class="wrap" hidden>', teamcards, s)
s = rep1('    <div class="card"><h2>Partita</h2>', '''    <div class="card" id="impCard"><h2>Importa la distinta</h2>
      <div class="note">Carica un file PDF, Excel (.xlsx, .xls) o CSV con numero di maglia, nome, cognome e ruolo. Prima di aggiungere vedi un’anteprima e puoi correggere tutto.</div>
      <div class="upl"><button class="btn solid" id="impBtn">Scegli file…</button>
        <input type="file" id="impFile" accept=".pdf,.xlsx,.xls,.csv,.txt,application/pdf,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel" hidden></div>
      <div class="note" id="impMsg" role="status"></div>
      <div id="impPrev"></div>
    </div>
    <div class="card"><h2>Partita</h2>''', s)
s = rep1('  <section id="paneScout" class="scout">', '  <div class="cllive" id="clLive" hidden></div>\n  <section id="paneScout" class="scout">', s)

# ---- schermata account ----
s = rep1('<div class="sheet" id="sheet" hidden></div>', '<div class="sheet" id="sheet" hidden></div>\n  <div class="sheet accs" id="accSheet" hidden><div class="sin"><div class="srow"><h1 id="accTitle">Account</h1><button class="btn" data-act="clclose">Chiudi</button></div><div id="cloudBox"></div><div id="clCap" class="clcap" hidden></div></div></div>', s)

# ---- empty state in scout ----
s = rep1("  $('players').innerHTML=h;",
"""  if(!h)h='<div class="card emptyplayers"><h2>Nessun atleta</h2><div class="note">Importa la distinta da un file PDF, Excel o CSV, oppure aggiungi i nomi a mano.</div><button class="btn solid" data-act="gotoset">Vai a Squadra</button></div>';
  $('players').innerHTML=h;""", s)

# ---- edit form: delete button ----
s = rep1('<button class="btn" data-act="editcancel">Annulla</button></div></div>\';return}',
 '<button class="btn" data-act="editcancel">Annulla</button>\'+(pp0(p)?\'\':\'\')+\'<button class="btn danger" data-act="editdel" data-n="\'+p.n+\'">\'+(ui.delArm===p.n?\'Tocca ancora per eliminare\':\'Elimina\')+\'</button></div></div>\';return}', s)
s = s.replace("(pp0(p)?'':'')+", "")
s = rep1("if(a==='edit'){ui.edit=+b.getAttribute('data-n');ui.msgE='';render();return}",
         "if(a==='edit'){ui.edit=+b.getAttribute('data-n');ui.msgE='';ui.delArm=null;render();return}", s)
s = rep1("if(a==='editcancel'){ui.edit=null;ui.msgE='';render();return}",
         "if(a==='editcancel'){ui.edit=null;ui.msgE='';ui.delArm=null;render();return}", s)

# ---- excel: libreria locale ----
s = rep1("var XLSX_SRC='https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';", "var XLSX_SRC='vendor/xlsx.core.min.js';", s)

# ---- pdf handler ----
i = s.index("    if(window.claude&&window.claude.use){\n      window.claude.use('downloads')")
j = s.index("    return}\n  if(b.id==='reset')")
s = s[:i] + "    savePdf(blob,fn);\n" + s[j:]

# ---- save helper: replace artifact version ----
i = s.index('/*ART-SAVE*/'); j = s.index('/*END-ART-SAVE*/') + len('/*END-ART-SAVE*/')
s = s[:i] + """function saveBlob(blob,fn,say2){
  function dl(){try{var u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=fn;document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(u)},60000);say2('File scaricato.')}catch(e){say2('Non riesco a salvare il file.')}}
  var file=null;try{file=new File([blob],fn,{type:blob.type})}catch(e){}
  if(file&&navigator.canShare&&navigator.share&&navigator.canShare({files:[file]})){
    navigator.share({files:[file],title:fn}).then(function(){say2('File condiviso.')},function(err){if(err&&err.name==='AbortError'){say2('');return}dl()});
    return;
  }
  dl();
}""" + s[j:]

# ---- boot: remove claude db block, add pwa bits ----
i = s.index("if(window.claude&&window.claude.use){\n  window.claude.use('db')")
j = s.index("})();\n</script>")
boot = """renderInstall();
cloudInit();
try{if(navigator.storage&&navigator.storage.persist)navigator.storage.persist()}catch(e){}
if('serviceWorker' in navigator&&location.protocol!=='file:'){window.addEventListener('load',function(){navigator.serviceWorker.register('sw.js').catch(function(){})})}
"""
s = s[:i] + boot + s[j:]
# inject extra code before boot
k = s.index("/* ---- boot ---- */")
s = s[:k] + extra + "\n" + s[k:]

# ---- strip leftovers of artifact environment ----
assert 'window.claude' not in s, [m.start() for m in re.finditer('window.claude', s)]
(OUT/'index.html').write_text(head + s.rstrip() + '\n</body>\n</html>\n') if False else None
# page body: original file has no <body>; wrap
html = head + s
# split style end / body start: original has </style> then markup
html = rep1('</style>\n', '</style>\n</head>\n<body>\n', html) if html.count('</style>\n')==1 else html
SPLASH = os.environ.get('SPLASH')=='1'   # schermata di caricamento: in sospeso, si attiva con SPLASH=1
if SPLASH: html = rep1('<body>\n', '<body>\n' + (SP/'splash.html').read_text(), html)
html = html.rstrip() + '\n</body>\n</html>\n'
(OUT/'index.html').write_text(html)

# ---- vendor: già in vendor/, non si copia nulla ----
# ---- manifest ----
(OUT/'manifest.webmanifest').write_text('''{
  "name": "SpikeData",
  "short_name": "SpikeData",
  "description": "Scout di pallavolo a bordo campo: statistiche per atleta, set e partita.",
  "lang": "it",
  "start_url": "./",
  "scope": "./",
  "display": "standalone",
  "orientation": "any",
  "background_color": "#eceff2",
  "theme_color": "#1f4fd1",
  "icons": [
    {"src": "icons/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any"},
    {"src": "icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any"},
    {"src": "icons/icon-maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable"}
  ]
}
''')

# ---- service worker ----
fonts = sorted(os.listdir(OUT/'fonts'))
core = ['./','index.html','manifest.webmanifest','icons/icon-192.png','icons/icon-512.png','icons/apple-touch-icon.png'] + (['icons/splash-mark.webp','icons/splash-text.webp','icons/splash-ball.webp'] if os.environ.get('SPLASH')=='1' else []) + ['fonts/'+f for f in fonts]
lazy = ['vendor/supabase.js','vendor/xlsx.core.min.js','vendor/pdf.min.js','vendor/pdf.worker.min.js','import-worker.js']
(OUT/'sw.js').write_text('''/* Service worker: tiene l'app disponibile offline.
   Quando pubblichi una nuova versione, cambia CACHE (es. v2) così i telefoni si aggiornano. */
var CACHE = 'scout-volley-v%s';
var CORE = %s;
var LAZY = %s;

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) {
    return c.addAll(CORE).then(function () {
      return Promise.allSettled(LAZY.map(function (u) { return c.add(u); }));
    });
  }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    /* elimino solo le versioni vecchie di SpikeData: le altre cache dello stesso indirizzo non si toccano */
    return Promise.all(keys.filter(function (k) { return k !== CACHE && k.indexOf('scout-volley-') === 0; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.origin !== location.origin) return;
  e.respondWith(caches.open(CACHE).then(function (c) {
    return c.match(req, { ignoreSearch: true }).then(function (hit) {
      var net = fetch(req).then(function (res) {
        if (res && res.ok) c.put(req, res.clone());
        return res;
      }).catch(function () {
        if (hit) return hit;
        if (req.mode === 'navigate') return c.match('index.html');
        return Response.error();
      });
      return hit || net;
    });
  }));
});
''' % (VERSION, repr(core).replace("'", '"'), repr(lazy).replace("'", '"')))

# ---- worker per leggere i file Excel ----
shutil.copy(SP/'import-worker.js', OUT/'import-worker.js')

# ---- informativa privacy ----
(OUT/'privacy.html').write_text((SP/'privacy.html').read_text())

# ---- icone: già in icons/ ----
print('ok', (OUT/'index.html').stat().st_size)
