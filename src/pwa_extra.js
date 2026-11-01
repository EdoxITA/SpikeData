/* ---- salvataggio / condivisione PDF ---- */
function savePdf(blob,fn){
  function dl(){
    try{
      var u=URL.createObjectURL(blob),a=document.createElement('a');
      a.href=u;a.download=fn;document.body.appendChild(a);a.click();a.remove();
      setTimeout(function(){URL.revokeObjectURL(u)},60000);
      say('PDF scaricato.');
    }catch(e){say('Non riesco a salvare il PDF.')}
  }
  var file=null;try{file=new File([blob],fn,{type:'application/pdf'})}catch(e){}
  if(file&&navigator.canShare&&navigator.share&&navigator.canShare({files:[file]})){
    navigator.share({files:[file],title:fn}).then(function(){say('PDF condiviso.')},function(err){
      if(err&&err.name==='AbortError'){say('');return}
      dl();
    });
    return;
  }
  dl();
}

/* ---- import distinta (PDF, Excel, CSV) ---- */
var imp=null;
var PART=['de','di','da','del','della','dal','dei','degli','dello','lo','la','le','van','von','der','den','dos','das','do','el','al'];
var RK={p:'P',pal:'P',pall:'P',palleggio:'P',palleggiatrice:'P',palleggiatore:'P',regista:'P',reg:'P',
  b:'B',s:'B',sc:'B',s1:'B',s2:'B',banda:'B',bande:'B',schiacciatrice:'B',schiacciatore:'B',schiacc:'B',sch:'B',
  c:'C',cen:'C',centr:'C',centrale:'C',
  o:'O',op:'O',opp:'O',opposto:'O',opposta:'O',
  l:'L',l1:'L',l2:'L',lib:'L',libero:'L',libera:'L'};
var ROPT=[['P','Palleggio'],['B','Banda'],['C','Centrale'],['O','Opposto'],['L1','Libero L1'],['L2','Libero L2']];
function roleKey(t){return RK[String(t).toLowerCase().replace(/[.°,;:]/g,'')]||null}
function numOf(t){var m=/^(?:n[°º.]?|#)?\s*(\d{1,2})[.)°º]?$/i.exec(String(t).trim());return m?parseInt(m[1],10):null}
function tc(w){return cap1(String(w).toLowerCase())}
function isWord(t){return /^[A-Za-zÀ-ÿ][A-Za-zÀ-ÿ'’\-\.]*$/.test(t)}
function escA(s){return String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;')}

function splitName(words,order){
  var k;
  if(words.length===1)return {f:'',s:tc(words[0])};
  if(order==='fs'){
    k=words.length-1;
    while(k>1&&PART.indexOf(words[k-1].toLowerCase())>=0)k--;
    return {f:tc(words.slice(0,k).join(' ')),s:tc(words.slice(k).join(' '))};
  }
  k=1;
  while(k<words.length-1&&PART.indexOf(words[k-1].toLowerCase())>=0)k++;
  return {s:tc(words.slice(0,k).join(' ')),f:tc(words.slice(k).join(' '))};
}
function parseRowH(cells,order){
  var toks=[],n=null,role=null,words=[];
  cells.forEach(function(c){String(c).split(/\s+/).forEach(function(t){if(t)toks.push(t)})});
  toks.forEach(function(t){
    var nn=numOf(t);
    if(nn!=null){if(n==null)n=nn;return}
    var rk=roleKey(t);
    if(rk){if(!role)role=rk;return}
    if(isWord(t))words.push(t.replace(/\.$/,''));
  });
  if(n==null||!words.length)return null;
  var nm=splitName(words,order);
  return {n:n,f:nm.f,s:nm.s,role:role};
}
function normH(c){return String(c).toLowerCase().replace(/[.:]/g,'').replace(/\s+/g,' ').trim()}
function findHeader(rows){
  for(var i=0;i<rows.length&&i<15;i++){
    var map={},r=rows[i].map(normH);
    r.forEach(function(c,j){
      if(/^(n|n°|nº|num|numero|numero maglia|maglia|n maglia|#)$/.test(c))map.n=j;
      else if(c==='cognome')map.s=j;
      else if(c==='nome')map.f=j;
      else if(/^(ruolo|role|posizione)$/.test(c))map.r=j;
      else if(/^(giocatrice|atleta|nominativo|nome e cognome|cognome e nome|cognome nome|nome cognome)$/.test(c)){map.full=j;map.fullOrder=(/^(nome e cognome|nome cognome)$/.test(c))?'fs':'sf'}
    });
    if(map.n!=null&&(map.s!=null||map.f!=null||map.full!=null))return {i:i,map:map};
  }
  return null;
}
function detectOrder(rows){
  for(var i=0;i<rows.length&&i<20;i++){
    var t=rows[i].join(' ').toLowerCase(),a=t.search(/\bcognome\b/),b=t.search(/\bnome\b/);
    if(a>=0&&b>=0)return a<b?'sf':'fs';
  }
  return null;
}
function extract(rows,orderPref){
  var out=[],hdr=findHeader(rows),heur=false,order=orderPref||null;
  if(hdr){
    var m=hdr.map;
    rows.slice(hdr.i+1).forEach(function(r){
      var n=numOf(r[m.n]==null?'':r[m.n]);if(n==null)return;
      var s='',f='',role=null;
      if(m.s!=null||m.f!=null){s=tc(m.s!=null?String(r[m.s]||'').trim():'');f=tc(m.f!=null?String(r[m.f]||'').trim():'')}
      else{
        var words=String(r[m.full]||'').split(/\s+/).filter(isWord).map(function(w){return w.replace(/\.$/,'')});
        if(!words.length)return;
        var nm=splitName(words,m.fullOrder||'sf');s=nm.s;f=nm.f;
      }
      if(!s&&f){s=f;f=''}
      if(!s)return;
      if(m.r!=null)String(r[m.r]||'').split(/\s+/).forEach(function(t){var k=roleKey(t);if(k&&!role)role=k});
      out.push({n:n,f:f,s:s,role:role});
    });
  }
  if(!out.length){
    heur=true;order=order||detectOrder(rows)||'sf';
    rows.forEach(function(r){var p=parseRowH(r,order);if(p)out.push(p)});
  }
  var seen={},res=[],lc=0;
  out.forEach(function(p){
    if(seen[p.n])return;seen[p.n]=1;
    var r=p.role==='L'?(lc++===0?'L1':'L2'):p.role;
    res.push({inc:true,n:p.n,f:p.f,s:p.s,r:r||'B',noRole:!p.role});
  });
  return {rows:res,heur:heur,order:order||'sf'};
}

function loadScript(src){return new Promise(function(ok,ko){var s=document.createElement('script');s.src=src;s.onload=ok;s.onerror=function(){ko(new Error('script'))};document.head.appendChild(s)})}
function decodeText(buf){try{return new TextDecoder('utf-8',{fatal:true}).decode(buf)}catch(e){return new TextDecoder('windows-1252').decode(buf)}}
function readCsvRows(text){
  text=text.replace(/^﻿/,'');
  var lines=text.split(/\r?\n/),first='';
  for(var i=0;i<lines.length;i++){if(lines[i].trim()){first=lines[i];break}}
  var best=null;[';','\t',','].forEach(function(c){var k=first.split(c).length-1;if(k>0&&(!best||k>best[1]))best=[c,k]});
  if(!best)return lines.filter(function(l){return l.trim()}).map(function(l){return [l]});
  var d=best[0],rows=[],row=[],cur='',q=false;
  for(var j=0;j<text.length;j++){
    var ch=text.charAt(j);
    if(q){if(ch==='"'){if(text.charAt(j+1)==='"'){cur+='"';j++}else q=false}else cur+=ch}
    else if(ch==='"')q=true;
    else if(ch===d){row.push(cur);cur=''}
    else if(ch==='\n'||ch==='\r'){if(ch==='\r'&&text.charAt(j+1)==='\n')j++;row.push(cur);cur='';rows.push(row);row=[]}
    else cur+=ch;
  }
  if(cur!==''||row.length){row.push(cur);rows.push(row)}
  return rows.filter(function(r){return r.some(function(c){return String(c).trim()})});
}
function readXlsxRows(buf){
  /* lettura isolata in un worker, con tempo massimo */
  return new Promise(function(ok,ko){
    var w;try{w=new Worker('import-worker.js')}catch(e){ko(e);return}
    var t=setTimeout(function(){w.terminate();ko(new Error('timeout'))},15000);
    w.onmessage=function(e){clearTimeout(t);w.terminate();var d=e.data||{};
      if(d.ok&&Array.isArray(d.rows))ok(d.rows.map(function(r){return Array.isArray(r)?r.map(function(c){return String(c)}):[]}));else ko(new Error('xlsx'))};
    w.onerror=function(){clearTimeout(t);w.terminate();ko(new Error('xlsx'))};
    w.postMessage(buf,[buf]);
  });
}
function readPdfRows(buf){
  return (window.pdfjsLib?Promise.resolve():loadScript('vendor/pdf.min.js')).then(function(){
    pdfjsLib.GlobalWorkerOptions.workerSrc='vendor/pdf.worker.min.js';
    return pdfjsLib.getDocument({data:buf,isEvalSupported:false,disableFontFace:true}).promise; /* isEvalSupported:false = protezione CVE-2024-4367 */
  }).then(function(doc){
    var rows=[],chain=Promise.resolve();
    for(var p=1;p<=Math.min(doc.numPages,20);p++)(function(pn){
      chain=chain.then(function(){return doc.getPage(pn)}).then(function(pg){return pg.getTextContent()}).then(function(tcnt){
        var items=tcnt.items.filter(function(i){return i.str&&i.str.trim()});
        items.sort(function(a,b){return b.transform[5]-a.transform[5]||a.transform[4]-b.transform[4]});
        var lines=[],cur=null,y0=0;
        items.forEach(function(it){var y=it.transform[5];if(cur&&Math.abs(y-y0)<=3)cur.push(it);else{cur=[it];y0=y;lines.push(cur)}});
        lines.forEach(function(l){l.sort(function(a,b){return a.transform[4]-b.transform[4]});rows.push(l.map(function(i){return i.str.trim()}))});
      });
    })(p);
    return chain.then(function(){return rows});
  });
}
function importFile(file){
  var m=$('impMsg');m.textContent='Leggo il file…';$('impPrev').innerHTML='';imp=null;
  var name=(file.name||'').toLowerCase(),isPdf=/\.pdf$/.test(name)||file.type==='application/pdf';
  if(file.size>5*1024*1024){m.textContent='Il file è troppo grande (massimo 5 MB). Una distinta normale pesa molto meno: controlla di aver scelto il file giusto.';return}
  file.arrayBuffer().then(function(buf){
    if(isPdf)return readPdfRows(buf);
    if(/\.(xlsx|xlsm|xls|ods)$/.test(name))return readXlsxRows(buf);
    return readCsvRows(decodeText(buf));
  }).then(function(rows){
    imp={raw:rows,pdf:isPdf,order:null};runExtract();
  },function(){
    m.textContent='Non riesco a leggere questo file. Prova con Excel o CSV, oppure aggiungi i nomi a mano.';
  });
}
function runExtract(){var r=extract(imp.raw,imp.order);imp.rows=r.rows;imp.heur=r.heur;imp.order=r.order;renderImp()}
function renderImp(){
  var m=$('impMsg'),pv=$('impPrev');
  if(!imp||!imp.rows.length){
    pv.innerHTML='';
    m.textContent=(imp&&!imp.raw.length)?'Non trovo testo nel file (se è una foto o una scansione non posso leggerla). Prova con Excel o CSV, oppure aggiungi i nomi a mano.':'Non ho riconosciuto atleti: servono numero di maglia e cognome su ogni riga. Controlla il file o aggiungile a mano.';
    return;
  }
  var h='';
  if(imp.heur)h+='<div class="chips" role="group" aria-label="Ordine dei nomi" style="margin-bottom:6px"><button data-act="imporder" data-v="sf" aria-pressed="'+(imp.order==='sf')+'">Cognome Nome</button><button data-act="imporder" data-v="fs" aria-pressed="'+(imp.order==='fs')+'">Nome Cognome</button></div>';
  imp.rows.forEach(function(r,i){
    var dup=r.n!=null&&pl(r.n);
    h+='<div class="irow'+(r.noRole?' warn':'')+'"><input type="checkbox" data-i="'+i+'" data-k="inc"'+(r.inc?' checked':'')+' aria-label="Includi">'+
      '<input data-i="'+i+'" data-k="n" inputmode="numeric" maxlength="2" value="'+(r.n==null?'':r.n)+'" aria-label="Numero di maglia">'+
      '<input data-i="'+i+'" data-k="f" value="'+escA(r.f)+'" placeholder="Nome" aria-label="Nome" autocapitalize="words">'+
      '<input data-i="'+i+'" data-k="s" value="'+escA(r.s)+'" placeholder="Cognome" aria-label="Cognome" autocapitalize="words">'+
      '<select data-i="'+i+'" data-k="r" aria-label="Ruolo">'+ROPT.map(function(o){return '<option value="'+o[0]+'"'+(o[0]===r.r?' selected':'')+'>'+o[1]+'</option>'}).join('')+'</select>'+
      (dup?'<div class="note dupn">N° già in lista: verrà aggiornato</div>':'')+'</div>';
  });
  h+='<div class="actions" style="margin-top:12px"><button class="btn solid" data-act="impgo" id="impGo"></button><button class="btn" data-act="impcancel">Annulla</button></div>';
  pv.innerHTML=h;impCount();
  m.textContent='Controlla l’anteprima: puoi correggere ogni campo prima di confermare.'+(imp.rows.some(function(r){return r.noRole})?' Le righe con il bordo arancione non hanno il ruolo: scegli tu.':'');
}
function impCount(){var n=imp?imp.rows.filter(function(r){return r.inc}).length:0,b=$('impGo');if(b){b.textContent='Aggiungi '+n+(n===1?' nome':' nomi');b.disabled=!n}}
function impEdit(t){
  if(!imp||!t.getAttribute||t.getAttribute('data-i')==null)return;
  var r=imp.rows[+t.getAttribute('data-i')],k=t.getAttribute('data-k');if(!r)return;
  if(k==='inc')r.inc=t.checked;
  else if(k==='n'){var v=parseInt(t.value,10);r.n=isNaN(v)?null:v}
  else if(k==='r'){r.r=t.value;r.noRole=false;if(t.parentNode)t.parentNode.classList.remove('warn')}
  else r[k]=t.value;
  impCount();
}
document.addEventListener('input',function(e){impEdit(e.target)});
document.addEventListener('change',function(e){
  var t=e.target;
  if(t&&t.id==='impFile'){var f=t.files&&t.files[0];if(f)importFile(f);t.value='';return}
  impEdit(t);
});
function impApply(){
  var m=$('impMsg'),use=imp.rows.filter(function(r){return r.inc}),bad=0,seen={},dupin=0;
  use.forEach(function(r){
    r.s=cap1((r.s||'').trim());r.f=cap1((r.f||'').trim());
    if(r.n==null||r.n<0||r.n>99||!r.s)bad++;
    else{if(seen[r.n])dupin++;seen[r.n]=1}
  });
  if(bad){m.textContent='Controlla le righe: servono un numero da 0 a 99 e il cognome ('+bad+' da correggere).';return}
  if(dupin){m.textContent='Ci sono due righe con lo stesso numero di maglia: correggi o togli la spunta.';return}
  var add=0,upd=0;
  use.forEach(function(r){
    var p=pl(r.n);
    if(p){p.s=r.s;p.f=r.f;p.r=r.r;delete state.roles[r.n];upd++}
    else{state.extra.push({n:cleanN(r.n),s:cleanS(r.s,40),f:cleanS(r.f,40),r:cleanRole(r.r),extra:1});add++}
  });
  imp=null;$('impPrev').innerHTML='';
  m.textContent='Fatto: '+add+(add===1?' nome aggiunto':' nomi aggiunti')+(upd?', '+upd+' aggiornati':'')+'.';
  persist();render();
}

/* ---- installazione ---- */
var deferredInstall=null;
function isStandalone(){return (window.matchMedia&&matchMedia('(display-mode: standalone)').matches)||window.navigator.standalone===true}
function renderInstall(){
  var c=$('instCard');if(!c)return;
  if(isStandalone()){c.hidden=true;return}
  c.hidden=false;
  var ios=/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
  $('instBtn').hidden=!deferredInstall;
  $('instTxt').textContent=deferredInstall?'Installa l’app sul telefono: si apre a schermo intero e funziona anche senza internet.':
    ios?'Su iPhone e iPad apri questa pagina in Safari, tocca Condividi (il quadrato con la freccia) e scegli “Aggiungi alla schermata Home”.':
    'Su Android apri il menu ⋮ di Chrome e scegli “Installa app” (o “Aggiungi a schermata Home”).';
}
window.addEventListener('beforeinstallprompt',function(e){e.preventDefault();deferredInstall=e;renderInstall()});
window.addEventListener('appinstalled',function(){deferredInstall=null;renderInstall()});

document.addEventListener('click',function(ev){
  var b=ev.target.closest('#impBtn,#instBtn,[data-act="impgo"],[data-act="impcancel"],[data-act="imporder"],[data-act="gotoset"],[data-act="editdel"]');
  if(!b)return;
  var a=b.getAttribute('data-act');
  if(b.id==='impBtn'){$('impFile').click();return}
  if(b.id==='instBtn'){if(deferredInstall){deferredInstall.prompt();deferredInstall=null;renderInstall()}return}
  if(a==='impgo'){if(imp)impApply();return}
  if(a==='impcancel'){imp=null;$('impPrev').innerHTML='';$('impMsg').textContent='';return}
  if(a==='imporder'){if(imp){imp.order=b.getAttribute('data-v');runExtract()}return}
  if(a==='gotoset'){ui.tab='team';render();setTimeout(function(){var c=$('impCard');if(c&&c.scrollIntoView)c.scrollIntoView({behavior:'smooth',block:'start'})},60);return}
  if(a==='editdel'){
    var dn=+b.getAttribute('data-n');
    if(used(dn)){ui.msgE='Ha già azioni registrate: non si può eliminare.';ui.delArm=null;render();return}
    if(ui.delArm!==dn){ui.delArm=dn;render();return}
    state.extra=state.extra.filter(function(x){return x.n!==dn});
    delete state.absent[dn];delete state.roles[dn];
    ui.edit=null;ui.delArm=null;ui.msgE='';persist();render();return;
  }
});
