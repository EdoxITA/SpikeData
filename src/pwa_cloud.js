/* ---- account, squadre condivise e sincronizzazione (Supabase) ---- */
var SB_URL='',SB_KEY='',TS_KEY='';
var LSC='scout-volley-cloud',WS='scout-volley-ws-';
var CL={sb:null,ready:false,user:null,teams:[],team:null,role:null,members:[],ch:null,step:'email',email:'',msg:'',busy:false,inv:null,
  dirty:false,tUp:null,tAr:null,rosterJson:null,live:null,askUp:null,delArm:null,leaveArm:null};
var CLS=(function(){try{return JSON.parse(localStorage.getItem(LSC))||{}}catch(e){return {}}})();
CLS.synced=CLS.synced||{};CLS.rosterAt=CLS.rosterAt||{};CLS.skip=CLS.skip||{};
function clSave(){try{localStorage.setItem(LSC,JSON.stringify(CLS))}catch(e){}}
function cloudOn(){return !!(SB_URL&&SB_KEY)}
function esc(t){return String(t==null?'':t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')}
var ROLEL={owner:'Proprietario',editor:'Fa lo scout',viewer:'Solo visione'};
function stBody(){return {savedAt:state.savedAt||0,events:state.events,set:state.set,score:state.score,roles:state.roles,auto:state.auto,adv:state.adv,extra:state.extra,edits:state.edits,absent:state.absent,rally:state.rally,first:state.first,lineup:state.lineup,subs:state.subs,rot:state.rot,meta:state.meta,mid:state.mid,updated:state.updated||Date.now()}}
function freshState(){return {events:[],set:1,score:{},roles:state.roles,auto:state.auto,adv:state.adv,extra:state.extra,edits:state.edits,absent:{},rally:[],first:{},lineup:{},subs:[],rot:state.rot,meta:{name:'',opp:'',date:'',home:''},mid:null,updated:0,savedAt:0}}
function canWrite(){return CL.team&&(CL.role==='owner'||CL.role==='editor')}
function clErr(e){var m=(e&&(e.message||e.error_description))||String(e||'');
  if(/Failed to fetch|NetworkError|network/i.test(m))return 'Non c’è connessione: riprova quando torna la rete.';
  if(/rate limit|too many|security purposes/i.test(m))return 'Troppi tentativi ravvicinati: aspetta un minuto e riprova.';
  if(/Invalid login credentials/i.test(m))return 'Email o password sbagliate. Se è la prima volta, premi Crea account.';
  if(/already registered|already exists/i.test(m))return 'Questa email ha già un account: premi Entra.';
  if(/Email not confirmed/i.test(m))return 'Prima conferma l’email con il link che ti è arrivato, poi premi Entra.';
  if(/same.*password|different from the old/i.test(m))return 'La nuova password deve essere diversa da quella vecchia.';
  if(/sending.*(email|mail)|smtp|535|authentication failed|Username and Password/i.test(m))return 'Il servizio email non riesce a inviare la mail: controlla le impostazioni SMTP in Supabase (utente Gmail e password per le app).';
  if(/rate limit|over_email_send_rate|For security purposes/i.test(m))return 'Hai chiesto troppe mail in poco tempo: aspetta qualche minuto e riprova.';
  if(/captcha/i.test(m))return 'Verifica anti-robot non riuscita o scaduta: rifalla e riprova.';
  if(/Password should contain|characters/i.test(m))return 'La password deve avere almeno 8 caratteri, con lettere e numeri.';
  if(/Password should|weak|pwned|leaked/i.test(m))return 'Password troppo debole: usane una più lunga.';
  return m||'Qualcosa è andato storto.'}
function clStatus(){
  if(!CL.team||!CL.user)return;
  var t=CL.teams.filter(function(x){return x.id===CL.team})[0],nm=t?t.name:'squadra';
  setSaveState(!navigator.onLine?'Offline · salvo online appena torna la rete':CL.role==='viewer'?'Solo visione · '+nm+' (in diretta)':CL.dirty?'Salvataggio online…':'Salvato online · '+nm);
}

/* ---- spazi di lavoro: ogni squadra ha la sua partita in corso e il suo archivio su questo dispositivo ---- */
function wsKey(){return CL.team||'local'}
function wsStash(k){try{localStorage.setItem(WS+k,JSON.stringify({st:stBody(),arch:arch}))}catch(e){}}
function wsLoad(k,keepRoster){
  var w=null;try{w=JSON.parse(localStorage.getItem(WS+k))}catch(e){}
  var ex=state.extra,ed=state.edits,ro=state.roles;
  if(w&&w.st){adopt(w.st)}else{state=freshState()}
  if(keepRoster){state.extra=ex;state.edits=ed;state.roles=ro}
  arch=(w&&Array.isArray(w.arch))?w.arch:[];
  lsSave();arSave();
}
function switchTeam(id,opt){
  opt=opt||{};
  var old=CLS.team||'local';
  if(id===old&&!opt.force)return;
  stopRt();
  if(!opt.carry){wsStash(old);CL.team=id;wsLoad(id||'local',!!opt.keepRoster)}
  else{CL.team=id}
  CLS.team=id;clSave();
  var t=CL.teams.filter(function(x){return x.id===id})[0];CL.role=t?t.role:null;
  ui.player=null;ui.fund=null;ui.zp=null;ui.lu=null;ui.sub=null;ui.to=false;
  render();
  if(id)startTeam();
}

/* ---- avvio ---- */
function cloudInit(){
  var m=/[?&]invito=([A-Za-z0-9]{6,12})/.exec(location.search);
  if(m){CLS.pendingInv=m[1].toUpperCase();clSave();try{history.replaceState(null,'',location.pathname)}catch(e){}}
  if(/type=recovery/.test(location.hash)){CL.recover=true;CL.open=true}
  if(CLS.pendingInv)CL.open=true;
  if(!cloudOn()){renderCloud();return}
  var mk=window.__SBMOCK?Promise.resolve():(window.supabase?Promise.resolve():loadScript('vendor/supabase.js'));
  mk.then(function(){
    CL.sb=window.__SBMOCK||window.supabase.createClient(SB_URL,SB_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,flowType:'implicit',storageKey:'scout-volley-auth'}});
    CL.sb.auth.onAuthStateChange(function(ev,ses){if(ev==='PASSWORD_RECOVERY'){CL.recover=true;CL.msg='';CL.open=true;setTimeout(render,0)}var u=ses&&ses.user;if((u&&u.id)!==(CL.user&&CL.user.id)){CL.user=u||null;afterAuth()}});
    return CL.sb.auth.getSession();
  }).then(function(r){CL.ready=true;var u=r&&r.data&&r.data.session&&r.data.session.user;if(!u&&!CLS.welcomed){CLS.welcomed=1;clSave();CL.mode='up';CL.open=true}if(u&&!CL.user){CL.user=u;afterAuth()}else render()},
    function(){CL.ready=true;CL.msg='Non riesco a collegarmi al servizio online. L’app funziona comunque su questo dispositivo.';renderCloud()});
  window.addEventListener('online',function(){if(CL.dirty)upNow();if(CL.team)pullAll();clStatus()});
  window.addEventListener('offline',clStatus);
  setInterval(function(){if(CL.dirty&&navigator.onLine)upNow()},20000);
}
function afterAuth(){
  if(!CL.user){stopRt();if(CL.team){CLS.lastTeam=CL.team;wsStash(CL.team);CL.team=null;CLS.team=null;clSave();wsLoad('local',true)}CL.teams=[];CL.role=null;setSaveState('Salvato solo su questo dispositivo');render();return}
  CL.step='email';loadTeams().then(function(){
    if(CLS.pendingInv){var c=CLS.pendingInv;CLS.pendingInv=null;clSave();return acceptInv(c)}
    var cand=CLS.team||CLS.lastTeam,want=cand&&CL.teams.some(function(t){return t.id===cand})?cand:null;
    if(want&&CLS.team===want){CL.team=want;var t=CL.teams.filter(function(x){return x.id===want})[0];CL.role=t.role;render();startTeam()}
    else if(want){switchTeam(want)}
    else if(CLS.team){wsStash(CLS.team);CL.team=null;CLS.team=null;clSave();wsLoad('local',true);render()}
    else if(CL.teams.length&&!hasData()&&!arch.length){switchTeam(CL.teams[0].id)}
    else render();
  });
}
function loadTeams(){
  return CL.sb.from('team_members').select('role,team_id,teams(id,name)').eq('user_id',CL.user.id).then(function(r){
    if(r.error){CL.msg=clErr(r.error);return}
    CL.teams=(r.data||[]).filter(function(x){return x.teams}).map(function(x){return {id:x.team_id,name:x.teams.name,role:x.role}}).sort(function(a,b){return a.name.localeCompare(b.name)});
    if(CL.team){var t=CL.teams.filter(function(x){return x.id===CL.team})[0];if(t)CL.role=t.role}
  });
}

/* ---- squadra attiva: rosa, partite, diretta ---- */
function startTeam(){
  var id=CL.team;if(!id)return;
  loadMembers();pullAll().then(function(){if(CL.team===id)startRt()});
}
function loadMembers(){
  var id=CL.team;
  return CL.sb.from('team_members').select('user_id,email,role').eq('team_id',id).then(function(r){if(CL.team!==id)return;CL.members=(r.data||[]).sort(function(a,b){return (a.role==='owner'?0:a.role==='editor'?1:2)-(b.role==='owner'?0:b.role==='editor'?1:2)||String(a.email).localeCompare(String(b.email))});if(ui.tab==='team')renderTeamCloud()});
}
function rosterObj(){return {extra:state.extra||[],edits:state.edits||{},roles:state.roles||{}}}
function applyRoster(t){
  if(!t||!t.roster_updated)return false;
  if(t.roster_updated<=(CLS.rosterAt[t.id]||0))return false;
  var r=deepClean(t.roster||{})||{};state.extra=Array.isArray(r.extra)?r.extra:[];state.edits=r.edits||{};state.roles=r.roles||{};cleanRoster();
  CLS.rosterAt[t.id]=t.roster_updated;CL.rosterJson=JSON.stringify(rosterObj());clSave();lsSave();return true;
}
function pullAll(){
  var id=CL.team;if(!id)return Promise.resolve();
  return Promise.all([
    CL.sb.from('teams').select('id,name,roster,roster_updated').eq('id',id).single(),
    CL.sb.from('matches').select('id,data,status,updated').eq('team_id',id).eq('deleted',false)
  ]).then(function(rs){
    if(CL.team!==id)return;
    var ch=false;
    if(rs[0].data){ch=applyRoster(rs[0].data)||ch;if(CL.rosterJson==null)CL.rosterJson=JSON.stringify(rosterObj())}
    if(rs[1].error){CL.msg=clErr(rs[1].error)}
    var rows=rs[1].data||[];
    rows.forEach(function(m){ch=mergeRow(m,true)||ch});
    pickLive(rows);
    if(canWrite()&&CLS.askedUp!==id){
      var loc=arch.filter(function(m){return CLS.synced[m.id]==null&&!CLS.skip[m.id]&&!rows.some(function(r){return r.id===m.id})});
      if(loc.length)CL.askUp={n:loc.length};else{CLS.askedUp=id;clSave()}
      if(hasData()&&!rows.some(function(r){return r.id===state.mid}))schedUp();
    }
    if(canWrite()&&JSON.stringify(rosterObj())!==CL.rosterJson)upRoster();
    clStatus();render();
  },function(e){CL.msg=clErr(e);clStatus();renderCloud()});
}
function mergeRow(m,quiet){
  if(!m||!m.data)return false;
  if(m.status==='archived'){var cm=cleanMatch(m.data);if(!cm)return false;m={id:String(m.id),status:m.status,updated:+m.updated||0,data:cm}}
  if(m.status==='archived'){
    var d=m.data,i=-1;arch.forEach(function(x,k){if(x.id===m.id)i=k});
    CLS.synced[m.id]=m.updated;
    if(m.id===state.mid){ /* la partita che seguivo è stata archiviata da chi fa lo scout */
      if(i<0)arch.push(d);else arch[i]=d;state=freshState();lsSave();arSave();clSave();return true}
    if(i<0){arch.push(d);arSave();clSave();return true}
    if((arch[i].saved||0)<(m.updated||0)){arch[i]=d;arSave();clSave();return true}
    clSave();return false;
  }
  if(m.deleted){var j=-1;arch.forEach(function(x,k){if(x.id===m.id)j=k});if(j>=0){arch.splice(j,1);arSave();delete CLS.synced[m.id];clSave();return true}return false}
  /* partita in corso */
  if(m.id===state.mid){if((m.updated||0)>(state.updated||0)){adopt(m.data);state.mid=m.id;lsSave();CLS.synced[m.id]=m.updated;clSave();return true}return false}
  return false;
}
function pickLive(rows){
  var lv=rows.filter(function(m){return m.status==='live'&&m.id!==state.mid&&!arch.some(function(a){return a.id===m.id})}).sort(function(a,b){return (b.updated||0)-(a.updated||0)})[0]||null;
  if(lv&&!hasData()){adopt(lv.data);state.mid=lv.id;lsSave();CL.live=null;return}
  CL.live=lv?{id:lv.id,opp:(lv.data.meta&&lv.data.meta.opp)||'',sc:lv.data.score||{},updated:lv.updated,data:lv.data}:null;
}
function startRt(){
  stopRt();var id=CL.team;if(!id||!CL.sb.channel)return;
  CL.ch=CL.sb.channel('team-'+id)
    .on('postgres_changes',{event:'*',schema:'public',table:'matches',filter:'team_id=eq.'+id},function(p){
      if(CL.team!==id)return;var m=p.new&&p.new.id?p.new:null;if(!m)return;
      if(m.deleted){mergeRow({id:m.id,deleted:true,data:{}});render();return}
      if(m.status==='live'&&m.id!==state.mid&&!arch.some(function(a){return a.id===m.id})){
        if(!hasData()){adopt(m.data);state.mid=m.id;lsSave();CL.live=null;render();return}
        CL.live={id:m.id,opp:(m.data.meta&&m.data.meta.opp)||'',sc:m.data.score||{},updated:m.updated,data:m.data};render();return}
      if(mergeRow(m))render()})
    .on('postgres_changes',{event:'UPDATE',schema:'public',table:'teams',filter:'id=eq.'+id},function(p){if(CL.team===id&&applyRoster(p.new))render()})
    .on('postgres_changes',{event:'*',schema:'public',table:'team_members',filter:'team_id=eq.'+id},function(){if(CL.team!==id)return;loadTeams().then(function(){
      if(!CL.teams.some(function(t){return t.id===id})){CL.msg='Non fai più parte della squadra.';switchTeam(null);return}
      loadMembers();clStatus();render()})})
    .subscribe();
}
function stopRt(){if(CL.ch&&CL.sb){try{CL.sb.removeChannel(CL.ch)}catch(e){}}CL.ch=null}

/* ---- invio dei dati ---- */
function schedUp(){if(!canWrite())return;CL.dirty=true;clearTimeout(CL.tUp);CL.tUp=setTimeout(upNow,1200);clStatus()}
function upNow(){
  if(!canWrite()||!navigator.onLine){clStatus();return}
  var id=CL.team,jobs=[];
  if(hasData()){
    if(!state.mid){state.mid=newId();lsSave()}
    var b=stBody(),up=b.updated;
    jobs.push(CL.sb.from('matches').upsert({id:state.mid,team_id:id,data:b,status:'live',updated:up,deleted:false}).then(function(r){if(r.error)throw r.error;CLS.synced[b.mid]=up}));
  }
  if(JSON.stringify(rosterObj())!==CL.rosterJson)jobs.push(upRoster());
  CL.dirty=false;clStatus();
  Promise.all(jobs).then(function(){clSave();clStatus()},function(e){CL.dirty=true;CL.msg=clErr(e);clStatus();renderCloud()});
}
function upRoster(){
  var js=JSON.stringify(rosterObj()),now=Date.now(),id=CL.team;
  return CL.sb.from('teams').update({roster:rosterObj(),roster_updated:now}).eq('id',id).then(function(r){if(r.error)throw r.error;CL.rosterJson=js;CLS.rosterAt[id]=now;clSave()});
}
function upArch(all){
  if(!canWrite()||!navigator.onLine)return;
  var id=CL.team,ids={},jobs=[];
  arch.forEach(function(m){ids[m.id]=1;
    if(CLS.skip[m.id]||m.id===state.mid)return;
    if(!all&&CLS.synced[m.id]==null&&CLS.askedUp!==id)return;
    if(CLS.synced[m.id]===(m.saved||0))return;
    var sv=m.saved||Date.now();
    jobs.push(CL.sb.from('matches').upsert({id:m.id,team_id:id,data:m,status:'archived',updated:sv,deleted:false}).then(function(r){if(r.error)throw r.error;CLS.synced[m.id]=sv}))});
  Object.keys(CLS.synced).forEach(function(k){if(!ids[k]&&k!==state.mid&&CL.team){
    jobs.push(CL.sb.from('matches').update({deleted:true}).eq('id',k).then(function(r){if(r.error)throw r.error;delete CLS.synced[k]}))}});
  if(!jobs.length)return;
  Promise.all(jobs).then(function(){clSave();clStatus()},function(e){CL.msg=clErr(e);clSave()});
}
HOOK.persist=function(){if(CL.team){if(canWrite())schedUp();else clStatus()}};
HOOK.arch=function(){if(CL.team&&canWrite()){clearTimeout(CL.tAr);CL.tAr=setTimeout(function(){upArch(false)},800)}};
HOOK.ro=function(b,a){
  if(!CL.team||CL.role!=='viewer')return false;
  if(b.hasAttribute('data-tab')||b.id==='pdf'||b.id==='xlsx')return false;
  if(a&&(/^cl/.test(a)||['fset','ffund','zo','fpl','sfund','spl','tout','toclose','toall','bench','bkexp','gotoset'].indexOf(a)>=0))return false;
  ui.flash={t:'Sei in sola visione: vedi la partita in diretta ma non puoi modificarla.',c:'var(--mute)'};render();return true;
};

/* ---- azioni ---- */
function clBusy(p){CL.busy=true;CL.msg='';renderCloud();return p.then(function(x){CL.busy=false;renderCloud();return x},function(e){CL.busy=false;CL.msg=clErr(e);renderCloud();throw e})}
function pwRule(pw){if(pw.length<8)return 'La password deve avere almeno 8 caratteri.';if(!/[A-Za-zÀ-ÿ]/.test(pw)||!/[0-9]/.test(pw))return 'La password deve contenere almeno una lettera e un numero.';return ''}
function credOk(isNew){
  var em=($('clEmail')&&$('clEmail').value||'').trim().toLowerCase(),pw=($('clPw')&&$('clPw').value)||'';
  CL.email=em;
  if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)||em.length>254){CL.msg='Scrivi un indirizzo email valido.';renderCloud();return null}
  if(isNew){var pr=pwRule(pw);if(pr){CL.msg=pr;renderCloud();return null}}else if(!pw){CL.msg='Scrivi la password.';renderCloud();return null}
  if(TS_KEY&&!CL.cap){CL.msg='Completa la verifica «Non sono un robot» qui sotto.';renderCloud();return null}
  CL.email=em;return {email:em,password:pw};
}
function gotUser(r){CL.mode='in';if(r.error)throw r.error;var u=r.data&&(r.data.user&&r.data.session?r.data.user:(r.data.session&&r.data.session.user));
  if(!u){CL.msg='Quasi fatto! Ti ho mandato una mail per confermare il tuo indirizzo (controlla anche lo spam). Apri il link, poi torna qui e premi Entra.';return}
  if(!CL.user||CL.user.id!==u.id){CL.user=u;CL.msg='';afterAuth()}}
function forgotPw(){
  var em=($('clEmail')&&$('clEmail').value||'').trim().toLowerCase();
  if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)){CL.msg='Scrivi prima la tua email, poi premi «Password dimenticata?».';renderCloud();return}
  CL.email=em;
  if(TS_KEY&&!CL.cap){CL.msg='Completa la verifica «Non sono un robot» qui sotto.';renderCloud();return}
  clBusy(CL.sb.auth.resetPasswordForEmail(em,capOpt({redirectTo:location.origin+location.pathname})).then(function(r){if(r.error)throw r.error;
    CL.msg='Ti ho mandato una mail a '+em+' (controlla anche lo spam). Apri il link: si apre una pagina dove scegli la nuova password. Poi torna qui ed entra con la nuova password.'})).catch(function(){}).then(capReset);
}
function newPw(){
  var pw=($('clPw')&&$('clPw').value)||'';
  var pr=pwRule(pw);if(pr){CL.msg=pr;renderCloud();return}
  clBusy(CL.sb.auth.updateUser({password:pw}).then(function(r){if(r.error)throw r.error;CL.recover=false;CL.showPw=false;
    try{history.replaceState(null,'',location.pathname)}catch(e){}
    CL.msg='Password cambiata. Sei dentro: se usi l’app installata sul telefono, aprila ed entra con la nuova password.'})).catch(function(){});
}
function capOpt(o){o=o||{};if(TS_KEY&&CL.cap)o.captchaToken=CL.cap;return o}
function capReset(){CL.cap=null;try{if(window.turnstile&&CL.capId!=null)window.turnstile.reset(CL.capId)}catch(e){}}
function capRender(){
  var box=$('clCap');if(!box)return;var need=TS_KEY&&cloudOn()&&CL.open&&!CL.user;box.hidden=!need;if(!need)return;
  if(CL.capId!=null||CL.capLoading)return;
  CL.capLoading=true;
  (window.turnstile?Promise.resolve():loadScript('https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit')).then(function(){
    CL.capLoading=false;try{CL.capId=window.turnstile.render(box,{sitekey:TS_KEY,language:'it',theme:'auto',callback:function(t){CL.cap=t},'expired-callback':function(){CL.cap=null},'error-callback':function(){CL.cap=null}})}catch(e){}
  },function(){CL.capLoading=false;CL.msg='Non riesco a caricare la verifica anti-robot: controlla la connessione.';renderCloud()});
}
function signIn(){var c=credOk(false);if(!c)return;clBusy(CL.sb.auth.signInWithPassword({email:c.email,password:c.password,options:capOpt()}).then(gotUser)).catch(function(){}).then(capReset)}
function signUp(){var c=credOk(true);if(!c)return;clBusy(CL.sb.auth.signUp({email:c.email,password:c.password,options:capOpt({emailRedirectTo:location.origin+location.pathname})}).then(gotUser)).catch(function(){}).then(capReset)}
function createTeam(){
  var nm=($('clTeamName')&&$('clTeamName').value||'').trim();
  if(!nm){CL.msg='Scrivi il nome della squadra.';renderCloud();return}
  var first=!CLS.team&&!CL.teams.length;
  clBusy(CL.sb.rpc('create_team',{p_name:nm}).then(function(r){if(r.error)throw r.error;var id=r.data;
    return loadTeams().then(function(){
      CLS.askedUp=id;clSave();
      if(first||!CL.team){switchTeam(id,{carry:true});upArch(true);upRoster().catch(function(){});schedUp()}
      else switchTeam(id,{keepRoster:false});
      CL.msg='Squadra «'+nm+'» creata. Ora invita il coach o chi deve vedere le partite.';CL.open=false;ui.tab='team';render();
    })})).catch(function(){});
}
function acceptInv(code){
  code=String(code||'').trim().toUpperCase();
  if(!code){CL.msg='Scrivi il codice invito.';renderCloud();return Promise.resolve()}
  return clBusy(CL.sb.rpc('accept_invite',{p_code:code}).then(function(r){if(r.error)throw r.error;var id=r.data;
    return loadTeams().then(function(){
      var t=CL.teams.filter(function(x){return x.id===id})[0],fromLocal=!CLS.team;
      var mine=fromLocal&&(hasData()||arch.length);
      CL.open=false;ui.tab='team';
      if(t&&t.role!=='viewer'&&mine){CL.join={id:id,name:t.name};render();return}
      switchTeam(id,{keepRoster:false});CL.msg='Sei entrato in «'+(t?t.name:'squadra')+'» come '+(t?ROLEL[t.role].toLowerCase():'membro')+'.';
    })})).catch(function(){});
}
function makeInvite(role){
  clBusy(CL.sb.from('invites').insert({team_id:CL.team,role:role}).select('code').single().then(function(r){if(r.error)throw r.error;CL.inv={code:r.data.code,role:role}})).catch(function(){});
}
function invLink(c){return location.origin+location.pathname+'?invito='+c}
function shareInv(){
  var c=CL.inv&&CL.inv.code;if(!c)return;var t=CL.teams.filter(function(x){return x.id===CL.team})[0];
  var can=CL.inv.role==='editor'?'potrai fare lo scout delle partite e vedere tutte le statistiche':'potrai seguire le partite in diretta e vedere tutte le statistiche';
  var txt='Ciao! Ti invito nella squadra «'+(t?t.name:'')+'» su SpikeData, l’app che uso per lo scout delle partite di pallavolo: '+can+'.\n\nPer entrare:\n1. apri questo link: '+invLink(c)+'\n2. crea il tuo account con email e password (ci vuole un minuto)\ne sei già dentro la squadra.\n\nSe il link non si apre, nell’app vai su Squadra → «Hai un codice invito?» e scrivi: '+c+'\nL’invito vale 14 giorni.';
  if(navigator.share){navigator.share({text:txt}).catch(function(){})}
  else if(navigator.clipboard){navigator.clipboard.writeText(txt).then(function(){CL.msg='Invito copiato: incollalo in WhatsApp o in una mail.';renderCloud()},function(){})}
}

/* ---- schermata Account (accesso) e scheda Squadra ---- */
function renderCloud(){
  renderTeamCloud();
  var el=$('cloudBox');if(!el)return;
  var h='';
  if(!cloudOn()){el.innerHTML='<div class="note">Il salvataggio online non è ancora attivo in questa versione dell’app.</div>';return}
  if(!CL.ready){el.innerHTML='<div class="note">Collegamento in corso…</div>';return}
  var B=CL.busy?' disabled':'';
  if(CL.recover&&CL.user){
    h+='<div class="card clask"><b>Scegli la nuova password</b><div class="note">Account: '+esc(CL.user.email||'')+'</div>';
    h+='<div class="clcred one"><div class="pwbox"><input id="clPw" type="'+(CL.showPw?'text':'password')+'" autocomplete="new-password" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="nuova password (8+ caratteri, lettere e numeri)"><button type="button" class="pweye" data-act="clpw" aria-pressed="'+!!CL.showPw+'">'+(CL.showPw?'Nascondi':'Mostra')+'</button></div></div>';
    h+='<div class="chips"><button class="pri" data-act="clnewpw"'+B+'>Salva la nuova password</button></div></div>';
    if(CL.msg)h+='<div class="note clmsg" role="status">'+esc(CL.msg)+'</div>';
    el.innerHTML=h;return;
  }
  if(!CL.user){
    var up=CL.mode==='up';
    h+='<div class="accw"><div class="acclogo" aria-hidden="true"></div><div class="accbrand">SpikeData</div><div class="acch">'+(up?'Crea il tuo account':'Accedi')+'</div><div class="note">Salva le partite online e condividile con il coach o con chi vuoi. Senza account l’app funziona lo stesso, solo su questo dispositivo.</div></div>';
    if(CLS.pendingInv)h+='<div class="clinv">Hai un invito in una squadra (codice <b>'+esc(CLS.pendingInv)+'</b>). '+(up?'Crea l’account':'Accedi')+' e ti porto dentro.</div>';
    h+='<div class="seg" role="tablist"><button role="tab" data-act="clmode" data-v="in" aria-selected="'+!up+'">Ho già un account</button><button role="tab" data-act="clmode" data-v="up" aria-selected="'+up+'">Sono nuovo</button></div>';
    h+='<label class="fl" for="clEmail">Email</label><input class="fin" id="clEmail" type="email" inputmode="email" autocomplete="email" autocapitalize="off" placeholder="nome@esempio.it" value="'+esc(CL.email)+'">';
    h+='<label class="fl" for="clPw">Password'+(up?' <small>(almeno 8 caratteri, con lettere e numeri)</small>':'')+'</label><div class="pwbox"><input class="fin" id="clPw" type="'+(CL.showPw?'text':'password')+'" autocomplete="'+(up?'new-password':'current-password')+'" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="'+(up?'scegli una password':'la tua password')+'"><button type="button" class="pweye" data-act="clpw" aria-pressed="'+!!CL.showPw+'" aria-label="'+(CL.showPw?'Nascondi password':'Mostra password')+'">'+(CL.showPw?'Nascondi':'Mostra')+'</button></div>';
    h+='<button class="btn solid accgo" data-act="'+(up?'clup2':'clin')+'"'+B+'>'+(up?'Crea account':'Entra')+'</button>';
    if(!up)h+='<button class="lnk accfg" data-act="clforgot"'+B+'>Hai dimenticato la password?</button>';
    else h+='<div class="note" style="text-align:center;margin-top:8px">Hai già un account? Tocca <b>Ho già un account</b>.</div>';
    h+='<button class="btn accno" data-act="clclose">Continua senza account</button>';
    h+='<div class="note accpriv">'+(up?'Creando l’account accetti l’':'Leggi l’')+'<a href="privacy.html" target="_blank" rel="noopener">informativa privacy</a>.</div>';
  }else{
    h+='<div class="accw"><div class="acclogo" aria-hidden="true"></div><div class="accbrand">SpikeData</div></div>';
    h+='<div class="srow"><span>Accesso: <b>'+esc(CL.user.email||'')+'</b></span><button class="btn" data-act="clout">Esci</button></div>';
    var tt=CL.teams.filter(function(x){return x.id===CL.team})[0];
    h+='<div class="note" style="margin-top:8px">'+(tt?'Squadra attiva: <b>'+esc(tt.name)+'</b> ('+ROLEL[tt.role].toLowerCase()+').':'Non sei ancora in una squadra.')+' Inviti, persone e rosa si gestiscono nella scheda <b>Squadra</b>.</div>';
    h+='<button class="btn solid accgo" data-act="clgoteam">Vai alla squadra</button>';
    var own=CL.teams.filter(function(x){return x.role==='owner'});
    h+='<details class="accdel"><summary>Elimina account e dati</summary><div class="note">Elimina il tuo account e i tuoi dati online. '+(own.length?'<b>Verranno eliminate per tutti anche le squadre di cui sei proprietario ('+own.map(function(x){return '«'+esc(x.name)+'»'}).join(', ')+'), con rosa e partite.</b> ':'')+'Le partite salvate su questo dispositivo restano finché non le cancelli tu. L’operazione non si può annullare.</div>';
    h+='<button class="btn danger" data-act="cldelacc"'+B+'>'+(CL.delAcc?'Tocca ancora: elimina definitivamente':'Elimina il mio account')+'</button></details>';
    h+='<div class="note accpriv"><a href="privacy.html" target="_blank" rel="noopener">Informativa privacy</a></div>';
  }
  if(CL.msg)h+='<div class="note clmsg" role="status">'+esc(CL.msg)+'</div>';
  if(CL.busy)h+='<div class="note">Attendi…</div>';
  if(!CL.user&&CL.msg){var k=h.lastIndexOf('<div class="note clmsg"'),mm=h.slice(k);h=h.slice(0,k);var q=h.indexOf('<button class="btn solid accgo"');if(q>=0)h=h.slice(0,q)+mm+h.slice(q)}
  var f=document.activeElement&&document.activeElement.id,val=f&&$(f)?$(f).value:null,pw0=$('clPw')?$('clPw').value:'';
  el.innerHTML=h;
  if($('clPw')&&pw0)$('clPw').value=pw0;
  if(f&&$(f)){$(f).value=val;$(f).focus()}
}
function renderTeamCloud(){
  var el=$('teamCloud');if(!el)return;
  if(!cloudOn()||!CL.ready){el.hidden=true;return}
  el.hidden=false;var B=CL.busy?' disabled':'',t2='<h2>Squadra online</h2>';
  if(!CL.user){t2+='<div class="note">Accedi per condividere la squadra con il coach: rosa, partite in diretta e archivio su ogni dispositivo.</div><div class="upl"><button class="btn solid" data-act="clopen">Accedi o crea un account</button></div>';el.innerHTML=t2;return}
    if(CL.join){
      t2+='<div class="card clask"><b>Benvenuto in «'+esc(CL.join.name)+'»</b><div class="note">Su questo dispositivo hai già dati (partita in corso o archivio). Vuoi portarli nella squadra?</div><div class="chips"><button data-act="cljoin" data-v="1">Sì, portali nella squadra</button><button data-act="cljoin" data-v="0">No, tienili a parte</button></div></div>';
    }
    if(CL.teams.length){
      t2+='<div class="note" style="margin-top:6px">Squadra attiva:</div><div class="chips">';
      CL.teams.forEach(function(t){t2+='<button data-act="clteam" data-id="'+t.id+'" aria-pressed="'+(CL.team===t.id)+'">'+esc(t.name)+' <small>· '+ROLEL[t.role]+'</small></button>'});
      t2+='<button data-act="clteam" data-id="" aria-pressed="'+(!CL.team)+'">Nessuna (solo dispositivo)</button></div>';
    }
    if(CL.team){
      var t=CL.teams.filter(function(x){return x.id===CL.team})[0]||{};
      if(CL.askUp)t2+='<div class="card clask"><b>Partite su questo dispositivo</b><div class="note">Hai '+CL.askUp.n+(CL.askUp.n===1?' partita salvata':' partite salvate')+' solo qui. Le carico nella squadra «'+esc(t.name)+'» così le vede anche il coach?</div><div class="chips"><button data-act="clup" data-v="1">Sì, caricale</button><button data-act="clup" data-v="0">No</button></div></div>';
      if(CL.live&&canWrite()!==null)t2+='<div class="card clask"><b>Partita in corso nella squadra</b><div class="note">'+(CL.live.opp?'vs '+esc(CL.live.opp)+' · ':'')+'aggiornata alle '+hhmm(CL.live.updated)+'</div><div class="chips"><button data-act="clfollow">Apri e segui in diretta</button></div><div class="note">La partita che hai ora su questo dispositivo finisce in archivio (scheda Stagione).</div></div>';
      t2+='<h3 class="clh">Persone nella squadra</h3><div class="cllist">';
      CL.members.forEach(function(m){var me=m.user_id===CL.user.id;
        t2+='<div class="clm"><span>'+esc(m.email||'—')+(me?' <small class="note">(tu)</small>':'')+'</span>';
        if(CL.role==='owner'&&!me&&m.role!=='owner'){
          t2+='<span class="chips"><button data-act="clrole" data-u="'+m.user_id+'" data-r="editor" aria-pressed="'+(m.role==='editor')+'">Fa lo scout</button><button data-act="clrole" data-u="'+m.user_id+'" data-r="viewer" aria-pressed="'+(m.role==='viewer')+'">Solo visione</button><button data-act="clrm" data-u="'+m.user_id+'" class="d">'+(CL.delArm===m.user_id?'Tocca per togliere':'Togli')+'</button></span>';
        }else t2+='<small class="note">'+ROLEL[m.role]+'</small>';
        t2+='</div>'});
      t2+='</div>';
      if(CL.role==='owner'){
        t2+='<h3 class="clh">Invita</h3><div class="chips"><button data-act="clinv" data-r="editor"'+B+'>Invita chi fa lo scout</button><button data-act="clinv" data-r="viewer"'+B+'>Invita chi guarda (solo visione)</button></div>';
        if(CL.inv)t2+='<div class="clinv"><div>Codice invito <b>'+esc(CL.inv.code)+'</b> · '+ROLEL[CL.inv.role].toLowerCase()+' · valido 14 giorni, una persona</div><div class="note" style="word-break:break-all">'+esc(invLink(CL.inv.code))+'</div><div class="chips"><button data-act="clshare">Condividi (WhatsApp, mail…)</button></div></div>';
      }
      t2+='<div class="chips" style="margin-top:10px">'+(CL.role==='owner'?'<button data-act="cldelteam" class="d">'+(CL.leaveArm?'Tocca ancora: elimina la squadra per tutti':'Elimina squadra')+'</button>':'<button data-act="clleave" class="d">'+(CL.leaveArm?'Tocca ancora per uscire':'Esci dalla squadra')+'</button>')+'</div>';
    }else{
      t2+='<h3 class="clh">Crea la tua squadra</h3><div class="clrow"><input id="clTeamName" maxlength="60" placeholder="nome della squadra"><button class="btn solid" data-act="clcreate"'+B+'>Crea</button></div>';
    }
    t2+='<h3 class="clh">Hai un codice invito?</h3><div class="clrow"><input id="clInv" maxlength="12" placeholder="es. 7F3K9Q2A" style="text-transform:uppercase"><button class="btn" data-act="clacc"'+B+'>Entra nella squadra</button></div>';
  if(CL.msg&&!CL.open)t2+='<div class="note clmsg" role="status">'+esc(CL.msg)+'</div>';
  if(CL.busy&&!CL.open)t2+='<div class="note">Attendi…</div>';
  var f=document.activeElement&&document.activeElement.id,val=f&&$(f)?$(f).value:null;
  el.innerHTML=t2;
  if(f&&$(f)&&el.contains($(f))){$(f).value=val;$(f).focus()}
}
function openAcc(){CL.open=true;renderAcc();var b=$('accSheet');if(b)b.scrollTop=0}
function closeAcc(){CL.open=false;CL.msg='';renderAcc()}
function renderAcc(){
  var sh=$('accSheet');if(!sh)return;setTimeout(capRender,0);
  if(!CL.open||!cloudOn()){sh.hidden=true;return}
  sh.hidden=false;$('accTitle').textContent=CL.user?'Account e squadra':'Account';renderCloud();
}
function renderAccSum(){
  var el=$('accSum');if(!el)return;
  if(!cloudOn()){el.textContent='Il salvataggio online non è attivo in questa versione.';return}
  var t=CL.teams.filter(function(x){return x.id===CL.team})[0];
  el.innerHTML=CL.user?('Accesso: <b>'+esc(CL.user.email||'')+'</b>'+(t?' · squadra <b>'+esc(t.name)+'</b> ('+ROLEL[t.role].toLowerCase()+')':' · nessuna squadra')):'Non hai fatto l’accesso: le partite restano solo su questo dispositivo.';
  var bt=$('accOpenBtn');if(bt)bt.textContent=CL.user?'Apri account':'Accedi o crea un account';
}
HOOK.render=function(){renderAcc();renderAccSum();if(ui.tab==='team')renderTeamCloud();clStatus();renderLiveBar()};
function renderLiveBar(){
  var el=$('clLive');if(!el)return;
  if(!cloudOn()||!CL.ready){el.hidden=true;return}
  if(!CL.user){
    if(CLS.hideBar){el.hidden=true;return}
    el.hidden=false;el.className='cllive out';
    el.innerHTML='<span>Salva online e condividi con il coach</span><span class="clb"><button class="pri" data-act="clopen">Accedi</button><button class="x" data-act="clhide" aria-label="Nascondi">✕</button></span>';return}
  var t=CL.teams.filter(function(x){return x.id===CL.team})[0];
  el.hidden=false;el.className='cllive';
  el.innerHTML='<span class="cltn" data-act="clgoteam" role="button">'+(t?(CL.role==='viewer'?'👁 ':'☁ ')+esc(t.name)+' <small>· '+ROLEL[t.role].toLowerCase()+'</small>':'☁ Nessuna squadra attiva')+'</span><span class="clb">'+(CL.live?'<button data-act="clfollow">Partita in corso: apri</button>':'')+'<button data-act="clopen">Account</button></span>';
}
HOOK.click=function(b,a){
  if(!a||!/^cl/.test(a))return false;
  if(a==='clpw'){CL.showPw=!CL.showPw;var pi=$('clPw');if(pi){pi.type=CL.showPw?'text':'password';var pos=pi.value.length;pi.focus();try{pi.setSelectionRange(pos,pos)}catch(e){}}
    b.setAttribute('aria-pressed',CL.showPw);b.textContent=CL.showPw?'Nascondi':'Mostra';b.setAttribute('aria-label',CL.showPw?'Nascondi password':'Mostra password');return true}
  if(a==='clopen'){openAcc();return true}
  if(a==='clgoteam'){CL.open=false;CL.msg='';ui.tab='team';render();try{window.scrollTo(0,0)}catch(e){}return true}
  if(a==='clclose'){closeAcc();return true}
  if(a==='clhide'){CLS.hideBar=1;clSave();renderLiveBar();return true}
  if(a==='clmode'){CL.mode=b.getAttribute('data-v');CL.msg='';renderCloud();return true}
  if(a==='clin'){signIn();return true}
  if(a==='clforgot'){forgotPw();return true}
  if(a==='clnewpw'){newPw();return true}
  if(a==='clup2'){signUp();return true}
  if(a==='cldelacc'){if(!CL.delAcc){CL.delAcc=true;renderCloud();var dd=document.querySelector('.accdel');if(dd)dd.open=true;setTimeout(function(){if(CL.delAcc){CL.delAcc=false;renderCloud();var d2=document.querySelector('.accdel');if(d2)d2.open=true}},5000);return true}
    CL.delAcc=false;var gone=CL.teams.filter(function(x){return x.role==='owner'}).map(function(x){return x.id});
    clBusy(CL.sb.rpc('delete_my_account').then(function(r){if(r.error)throw r.error;return CL.sb.auth.signOut()}).then(function(){
      gone.forEach(function(id){try{localStorage.removeItem(WS+id)}catch(e){}});CLS.lastTeam=null;CLS.team=CLS.team&&gone.indexOf(CLS.team)>=0?null:CLS.team;clSave();
      CL.user=null;CL.msg='Account eliminato. L’app funziona ancora su questo dispositivo, senza salvataggio online.';afterAuth()})).catch(function(){});return true}
  if(a==='clout'){CL.sb.auth.signOut().then(function(){CL.user=null;CL.msg='Sei uscito. I dati restano su questo dispositivo.';afterAuth()});return true}
  if(a==='clcreate'){createTeam();return true}
  if(a==='clacc'){acceptInv($('clInv')&&$('clInv').value);return true}
  if(a==='clteam'){var id=b.getAttribute('data-id')||null;CL.inv=null;CL.askUp=null;CL.msg='';switchTeam(id);return true}
  if(a==='clinv'){makeInvite(b.getAttribute('data-r'));return true}
  if(a==='clshare'){shareInv();return true}
  if(a==='clrole'){var u=b.getAttribute('data-u'),r=b.getAttribute('data-r');clBusy(CL.sb.from('team_members').update({role:r}).eq('team_id',CL.team).eq('user_id',u).then(function(x){if(x.error)throw x.error;return loadMembers()})).catch(function(){});return true}
  if(a==='clrm'){var u2=b.getAttribute('data-u');if(CL.delArm!==u2){CL.delArm=u2;renderCloud();setTimeout(function(){if(CL.delArm===u2){CL.delArm=null;renderCloud()}},4000);return true}
    CL.delArm=null;clBusy(CL.sb.from('team_members').delete().eq('team_id',CL.team).eq('user_id',u2).then(function(x){if(x.error)throw x.error;return loadMembers()})).catch(function(){});return true}
  if(a==='clleave'||a==='cldelteam'){if(!CL.leaveArm){CL.leaveArm=true;renderCloud();setTimeout(function(){CL.leaveArm=false;renderCloud()},4000);return true}
    CL.leaveArm=false;var tid=CL.team;
    var q=a==='clleave'?CL.sb.from('team_members').delete().eq('team_id',tid).eq('user_id',CL.user.id):CL.sb.from('teams').delete().eq('id',tid);
    clBusy(q.then(function(x){if(x.error)throw x.error;return loadTeams()}).then(function(){switchTeam(null);CL.msg=a==='clleave'?'Sei uscito dalla squadra.':'Squadra eliminata.';try{localStorage.removeItem(WS+tid)}catch(e){}})).catch(function(){});return true}
  if(a==='clup'){var yes=b.getAttribute('data-v')==='1';CLS.askedUp=CL.team;
    if(!yes)arch.forEach(function(m){if(CLS.synced[m.id]==null)CLS.skip[m.id]=1});
    clSave();CL.askUp=null;if(yes)upArch(true);renderCloud();return true}
  if(a==='cljoin'){var j=CL.join;CL.join=null;if(!j)return true;
    if(b.getAttribute('data-v')==='1'){CLS.askedUp=j.id;clSave();switchTeam(j.id,{carry:true});upArch(true);schedUp()}
    else switchTeam(j.id,{keepRoster:false});
    CL.msg='Sei entrato in «'+j.name+'».';renderCloud();return true}
  if(a==='clfollow'){var lv=CL.live;if(!lv)return true;
    if(hasData()&&canWrite()){var sn=snapMatch();arch=arch.filter(function(m){return m.id!==sn.id});arch.push(sn);arSave()}else if(hasData()){wsStash('local-'+Date.now())}
    adopt(lv.data);state.mid=lv.id;lsSave();CL.live=null;ui.tab='scout';render();return true}
  return false;
};
