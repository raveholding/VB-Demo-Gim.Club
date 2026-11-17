/* ======================================================================
   V29.6 · TORNEOS PRO — inscripciones con cupo y pago, fixture automático (liga, eliminación directa,
   grupos + playoffs) programado en las canchas, posiciones y goleadores en tiempo real, suplentes por
   disponibilidad, transmisión en vivo por RTMP (YouTube, Twitch, Kick, Facebook) con marcador para la
   transmisión y página pública del torneo.
   Reglas: sin servidor ni secretos en la página pública; la clave de transmisión sólo la ve el administrador;
   WhatsApp asistido (lo envía una persona); el video lo emite el celular o la PC con una app RTMP:
   el sistema no recibe ni retransmite video.
   ====================================================================== */
if(isGymBuild()){(function(){
const on=k=>typeof window.gProOn==='function'?window.gProOn(k):true;
const TR=()=>{const g=G();if(!g.pro||typeof g.pro!=='object')g.pro={};const p=g.pro;['trn','courts','cres','tourn'].forEach(k=>{if(!Array.isArray(p[k]))p[k]=[];});if(!p.disp||typeof p.disp!=='object')p.disp={};return p;};
const DEP={'Fútbol 5':{u:'Goles',j:[5,10],dur:60,pts:[3,1,0]},'Fútbol 7':{u:'Goles',j:[7,14],dur:70,pts:[3,1,0]},'Fútbol 11':{u:'Goles',j:[11,22],dur:90,pts:[3,1,0]},'Pádel':{u:'Games',j:[2,3],dur:90,pts:[2,0,1]},'Tenis':{u:'Games',j:[1,2],dur:90,pts:[2,0,1]},'Básquet':{u:'Puntos',j:[5,12],dur:60,pts:[2,0,1]},'Vóley':{u:'Sets',j:[6,12],dur:60,pts:[3,0,1]},'Handball':{u:'Goles',j:[7,14],dur:60,pts:[3,1,0]}};
const FMT={liga:'Liga (todos contra todos)',elim:'Eliminación directa',grupos:'Grupos + playoffs'};
const EST={inscripcion:['Inscripción abierta','warn'],curso:['En juego','ok'],fin:['Finalizado','']};
const PLAT={youtube:{t:'YouTube',srv:'rtmp://a.rtmp.youtube.com/live2',ver:'Pegá el ID del canal (empieza con UC…) o el enlace del video en vivo'},twitch:{t:'Twitch',srv:'rtmp://live.twitch.tv/app',ver:'Nombre del canal de Twitch'},kick:{t:'Kick',srv:'rtmps://fa723fc1b171.global-contribute.live-video.net/app',ver:'Nombre del canal de Kick'},facebook:{t:'Facebook',srv:'rtmps://live-api-s.facebook.com:443/rtmp/',ver:'Enlace público de la transmisión'},otro:{t:'Otro servidor RTMP',srv:'rtmp://',ver:'Enlace donde se ve la transmisión (https)'}};
const CAL={'720p':{t:'720p · 30 cuadros · 2.500 kbps (4G o wifi)',kbps:2500},'1080p':{t:'1080p · 30 cuadros · 4.500 kbps (fibra o wifi fuerte)',kbps:4500},'480p':{t:'480p · 30 cuadros · 1.200 kbps (señal débil)',kbps:1200}};
const isAdm=()=>user&&(user.role==='admin');
const tByid=id=>TR().trn.find(t=>t.id===id);
const team=(t,id)=>(t.teams||[]).find(x=>x.id===id);
const tn=(t,id)=>{const x=team(t,id);return x?x.name:(id===null?'Libre':'A definir');};
const DEPof=t=>DEP[t.sport]||DEP['Fútbol 5'];
const cleanT=(s,n)=>String(s||'').replace(/[<>]/g,'').trim().slice(0,n||60);
const dmyS=d=>d?d.slice(8,10)+'/'+d.slice(5,7):'';
const DIA=['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
const waUrl=(tel,msg)=>{const d=String(tel||'').replace(/\D/g,'');return d?'https://wa.me/'+(d.length<=10?'549'+d:d)+'?text='+encodeURIComponent(msg):'';};
const telOf=x=>{if(!x)return'';const c=x.cust&&gCust(x.cust);return (c&&c.wa)||x.tel||'';};
const waBtn=(tel,msg,label)=>{const u=waUrl(tel,msg);return u?`<button class="btn sm" data-act="gOpenUrl" data-u="${esc(u)}">${esc(label||'💬 WhatsApp')}</button>`:'<span class="sm mut">sin teléfono</span>';};
function insc(t){return(t.teams||[]).filter(x=>x.st==='confirmado');}

/* ---------- migración del módulo anterior (los torneos viejos pasan a liga, con sus resultados) ---------- */
function migrar(){const p=TR();if(p.trnMig)return;p.trnMig=1;(p.tourn||[]).forEach(o=>{if(p.trn.some(t=>t.old===o.id))return;const ids={};const teams=o.teams.map(n=>{const id=uid();ids[n]=id;return{id,name:n,st:'confirmado',pago:{st:'pagado'},jug:[],ts:o.created||now()};});
 const t=nuevo({name:o.name,sport:'Fútbol 5',fmt:'liga'});t.old=o.id;t.teams=teams;t.estado='curso';t.adj={};Object.keys(o.adj||{}).forEach(k=>{if(ids[k])t.adj[ids[k]]=o.adj[k];});
 t.matches=[];o.rounds.forEach((R,ri)=>R.forEach(m=>{t.matches.push({id:uid(),r:ri,fase:'Fecha '+(ri+1),h:ids[m.h],v:ids[m.v],ga:m.ga,gb:m.gb,st:m.ga!==''&&m.gb!==''?'fin':'prog',fecha:'',hora:'',cancha:'',ev:[],sup:[],inv:[]});}));p.trn.push(t);});}
function nuevo(o){const d=DEP[o.sport]||DEP['Fútbol 5'];return{id:uid(),name:cleanT(o.name,60),sport:o.sport||'Fútbol 5',fmt:o.fmt||'liga',ida:!!o.ida,grupos:o.grupos||2,clas:o.clas||2,pts:{w:d.pts[0],d:d.pts[1],l:d.pts[2]},cupo:+o.cupo||8,fee:Math.round(+o.fee||0),jmin:o.jmin||d.j[0],jmax:o.jmax||d.j[1],
 ini:o.ini||addDays(gT(),7),hora:o.hora||'20:00',dur:+o.dur||d.dur,canchas:o.canchas||[],estado:'inscripcion',teams:[],matches:[],adj:{},st:{plat:'youtube',srv:PLAT.youtube.srv,key:'',canal:'',cal:'720p'},pub:true,created:now(),u:user?user.name:''};}

/* ---------- fixture ---------- */
function rr(ids,ida){const T=ids.slice();if(T.length%2)T.push(null);const n=T.length,R=[];for(let r=0;r<n-1;r++){const M=[];for(let i=0;i<n/2;i++){const a=T[i],b=T[n-1-i];if(a&&b)M.push(r%2?[b,a]:[a,b]);}R.push(M);T.splice(1,0,T.pop());}
 return ida?R.concat(R.map(M=>M.map(([a,b])=>[b,a]))):R;}
const FASE=n=>({1:'Final',2:'Semifinal',4:'Cuartos de final',8:'Octavos de final',16:'16avos de final'}[n]||'Ronda de '+(n*2));
function seedOrder(n){let s=[1];while(s.length<n){const m=s.length*2+1;s=s.flatMap(x=>[x,m-x]);}return s;}
function elimMatches(ids,r0,pref){const n=Math.max(2,2**Math.ceil(Math.log2(Math.max(2,ids.length))));const ord=seedOrder(n).map(k=>ids[k-1]||null);const M=[];let prev=[];
 for(let i=0;i<n/2;i++){const m={id:uid(),r:r0,fase:(pref||'')+FASE(n/2),h:ord[2*i],v:ord[2*i+1],ga:'',gb:'',st:'prog',ev:[],sup:[],inv:[],slot:i};M.push(m);prev.push(m);}
 let size=n/4,r=r0+1;while(size>=1){const cur=[];for(let i=0;i<size;i++){const m={id:uid(),r,fase:(pref||'')+FASE(size),h:undefined,v:undefined,ga:'',gb:'',st:'prog',ev:[],sup:[],inv:[],slot:i};prev[2*i].next=m.id;prev[2*i].side='h';prev[2*i+1].next=m.id;prev[2*i+1].side='v';M.push(m);cur.push(m);}prev=cur;size/=2;r++;}
 return M;}
function ganador(t,m){if(m.st==='wo')return m.wo;if(m.h===null)return m.v;if(m.v===null)return m.h;if(m.ga===''||m.gb===''||m.ga==null)return undefined;if(+m.ga>+m.gb)return m.h;if(+m.gb>+m.ga)return m.v;return m.pen||undefined;}
function avanzar(t){let ch=true,n=0;while(ch&&n++<12){ch=false;t.matches.forEach(m=>{if(!m.next)return;const w=ganador(t,m);const nx=t.matches.find(x=>x.id===m.next);if(!nx)return;if(w!==undefined&&nx[m.side]!==w){nx[m.side]=w;ch=true;}if(w===undefined&&nx[m.side]!==undefined&&nx.st!=='fin'){nx[m.side]=undefined;ch=true;}});
 t.matches.forEach(m=>{if((m.h===null||m.v===null)&&m.h!==m.v&&m.st!=='fin'&&m.next){m.st='fin';m.bye=1;ch=true;}});}}
function grupoDe(t){const G0={};insc(t).forEach(x=>{if(x.gr)(G0[x.gr]=G0[x.gr]||[]).push(x.id);});return G0;}
function generar(t){const E=insc(t);if(E.length<2)return'Hacen falta al menos 2 equipos confirmados.';
 if(t.matches.some(m=>m.st==='fin'&&!m.bye))return'El torneo ya tiene resultados: para rehacer el fixture, primero borrá los resultados.';
 let ids=E.map(x=>x.id);ids=ids.sort(()=>0).slice();
 const M=[];if(t.fmt==='liga'){rr(ids,t.ida).forEach((R,ri)=>R.forEach(([h,v])=>M.push({id:uid(),r:ri,fase:'Fecha '+(ri+1),h,v,ga:'',gb:'',st:'prog',ev:[],sup:[],inv:[]})));}
 else if(t.fmt==='elim'){M.push(...elimMatches(ids,0,''));}
 else{const ng=Math.max(2,Math.min(8,+t.grupos||2));const L='ABCDEFGH';E.forEach(x=>{x.gr='';});ids.forEach((id,i)=>{const k=Math.floor(i/ng)%2?ng-1-(i%ng):i%ng;team(t,id).gr=L[k];});
  Object.entries(grupoDe(t)).forEach(([g,G0])=>rr(G0,t.ida).forEach((R,ri)=>R.forEach(([h,v])=>M.push({id:uid(),r:ri,fase:'Grupo '+g+' · Fecha '+(ri+1),gr:g,h,v,ga:'',gb:'',st:'prog',ev:[],sup:[],inv:[]}))));}
 quitarTurnos(t);t.matches=M;avanzar(t);programar(t);t.estado='curso';audit('TORNEO_FIXTURE',t.name+' · '+FMT[t.fmt]+' · '+E.length+' equipos · '+M.length+' partidos');return'';}
/* playoffs desde los grupos: los mejores de cada grupo, cruzados (1.º A vs 2.º B …) */
function playoffs(t){if(t.fmt!=='grupos')return'';if(t.matches.some(m=>m.po))return'Los playoffs ya están armados.';const G0=grupoDe(t);const gs=Object.keys(G0).sort();const k=Math.max(1,+t.clas||2);
 if(t.matches.some(m=>m.gr&&m.st!=='fin'&&m.st!=='wo'))return'Todavía hay partidos de grupo sin resultado.';
 const Q=gs.map(g=>tabla(t,g).slice(0,k).map(x=>x.id));const ids=[];for(let p=0;p<k;p++)gs.forEach((g,i)=>{const q=p%2?Q[gs.length-1-i]:Q[i];if(q[p])ids.push(q[p]);});
 const r0=Math.max(0,...t.matches.map(m=>m.r))+1;const M=elimMatches(ids,r0,'Playoff · ');M.forEach(m=>m.po=1);t.matches.push(...M);avanzar(t);programar(t,M);audit('TORNEO_PLAYOFFS',t.name+' · '+ids.length+' clasificados');return'';}
/* programación en las canchas: cada fecha una semana después, partidos repartidos por cancha y horario; respeta reservas y bloqueos */
function quitarTurnos(t){const p=TR();p.cres=p.cres.filter(b=>b.tor!==t.id||b.st==='presente');}
function libre(c,d,h,dur,mid){const a=gMin(h),p=TR();return !p.cres.some(b=>b.court===c&&b.date===d&&!['cancelado','rechazado'].includes(b.st)&&b.mid!==mid&&gMin(b.time)<a+dur&&gMin(b.time)+(+b.dur||60)>a)&&!(p.cblk||[]).some(k=>(!k.court||k.court===c)&&k.date===d&&a<gMin(k.to||'24:00')&&a+dur>gMin(k.from));}
const gMin=s=>{const a=String(s||'0:0').split(':');return(+a[0]||0)*60+(+a[1]||0);};
const gHm=n=>String(Math.floor(n/60)).padStart(2,'0')+':'+String(n%60).padStart(2,'0');
function programar(t,only){const p=TR();const C=(t.canchas||[]).filter(id=>p.courts.some(c=>c.id===id));const L=(only||t.matches).filter(m=>m.st!=='fin'&&m.st!=='wo'&&!m.bye);const rs=[...new Set(L.map(m=>m.r))].sort((a,b)=>a-b);
 let base=t.ini;if(only){const prev=t.matches.filter(m=>!only.includes(m)&&m.fecha).map(m=>m.fecha).sort().pop();base=prev?addDays(prev,7):t.ini;}
 else{const jug=t.matches.filter(m=>(m.st==='fin'||m.st==='wo')&&m.fecha).map(m=>m.fecha).sort().pop();const r0=Math.min(...rs);if(jug&&rs.length&&addDays(t.ini,7*r0)<=jug)base=addDays(jug,7-7*r0);}
 /* cada partido toma el primer turno libre desde la hora del torneo; si ese día no entra (reservas, bloqueos o cierre), pasa al día siguiente */
 const cierre=c=>{const x=p.courts.find(q=>q.id===c);const z=gMin((x&&x.close)||'24:00');return(z===0?1440:z);};const usado=[];
 const ocupa=(c,d,h)=>usado.some(u=>u.c===c&&u.d===d&&Math.abs(gMin(u.h)-gMin(h))<t.dur);
 rs.forEach((r,ri)=>{const d0=addDays(base,7*(only?ri:r));
  L.filter(m=>m.r===r).forEach(m=>{let ok=false;if(!C.length){m.fecha=d0;m.hora=t.hora;m.cancha='';return;}
   for(let dd=0;dd<7&&!ok;dd++){const d=addDays(d0,dd);for(let mm=gMin(t.hora);!ok&&mm<=1440-t.dur;mm+=t.dur){for(const c of C){if(mm+t.dur>cierre(c))continue;const h=gHm(mm);if(!ocupa(c,d,h)&&libre(c,d,h,t.dur,m.id)){m.fecha=d;m.hora=h;m.cancha=c;usado.push({c,d,h});ok=true;break;}}}}
   if(!ok){m.fecha=d0;m.hora=t.hora;m.cancha='';}});});
 L.forEach(m=>turno(t,m));}
function turno(t,m){const p=TR();p.cres=p.cres.filter(b=>!(b.tor===t.id&&b.mid===m.id));if(!m.cancha||!m.fecha||m.bye)return;
 p.cres.push({id:uid(),court:m.cancha,date:m.fecha,time:m.hora,dur:t.dur,who:'🏆 '+t.name+': '+tn(t,m.h)+' vs '+tn(t,m.v),cust:'',tel:'',price:0,st:'confirmado',tor:t.id,mid:m.id,ts:now()});}

/* ---------- posiciones y goleadores ---------- */
function tabla(t,gr){const ids=insc(t).filter(x=>!gr||x.gr===gr).map(x=>x.id);const S0={};ids.forEach(id=>S0[id]={id,eq:tn(t,id),pj:0,pg:0,pe:0,pp:0,gf:0,gc:0,adj:+(t.adj||{})[id]||0});
 t.matches.forEach(m=>{if(m.po||m.next!==undefined&&t.fmt==='elim')return;if(gr&&m.gr!==gr)return;const A0=S0[m.h],B=S0[m.v];if(!A0||!B)return;
  let a,b;if(m.st==='wo'){a=m.wo===m.h?3:0;b=m.wo===m.v?3:0;}else{if(m.ga===''||m.gb===''||m.ga==null)return;a=+m.ga;b=+m.gb;}
  A0.pj++;B.pj++;A0.gf+=a;A0.gc+=b;B.gf+=b;B.gc+=a;if(a>b){A0.pg++;B.pp++;}else if(a<b){B.pg++;A0.pp++;}else{A0.pe++;B.pe++;}});
 const L=Object.values(S0).map(x=>Object.assign(x,{dg:x.gf-x.gc,pts:x.pg*t.pts.w+x.pe*t.pts.d+x.pp*t.pts.l+x.adj}));
 const h2h=(a,b)=>{let pa=0,pb=0;t.matches.forEach(m=>{if(m.ga===''||m.ga==null)return;if(m.h===a.id&&m.v===b.id){pa+=+m.ga>+m.gb?3:+m.ga===+m.gb?1:0;pb+=+m.gb>+m.ga?3:+m.ga===+m.gb?1:0;}if(m.h===b.id&&m.v===a.id){pb+=+m.ga>+m.gb?3:+m.ga===+m.gb?1:0;pa+=+m.gb>+m.ga?3:+m.ga===+m.gb?1:0;}});return pb-pa;};
 return L.sort((a,b)=>b.pts-a.pts||h2h(a,b)||b.dg-a.dg||b.gf-a.gf||a.eq.localeCompare(b.eq,'es'));}
function goleadores(t){const G0={};t.matches.forEach(m=>(m.ev||[]).forEach(e=>{const k=e.tm+'|'+e.j;G0[k]=G0[k]||{j:e.j,tm:e.tm,n:0};G0[k].n+=e.n||1;}));return Object.values(G0).sort((a,b)=>b.n-a.n||a.j.localeCompare(b.j,'es'));}
function proximos(t,n){return t.matches.filter(m=>m.st!=='fin'&&m.st!=='wo'&&!m.bye&&m.h&&m.v).sort((a,b)=>((a.fecha||'')+(a.hora||'')).localeCompare((b.fecha||'')+(b.hora||''))).slice(0,n||6);}

/* ---------- suplentes por disponibilidad ---------- */
function dispOf(cid){return TR().disp[cid]||null;}
function rosterIds(t,tid){const x=team(t,tid);return x?(x.jug||[]).map(j=>j.cust).filter(Boolean).concat(x.cap?[x.cap]:[]):[];}
function candidatos(t,m){const dow=m.fecha?new Date(m.fecha+'T12:00:00').getDay():-1;const ocup=new Set();
 TR().trn.forEach(o=>o.matches.forEach(x=>{if(x.id===m.id||x.fecha!==m.fecha||!x.hora||!m.hora)return;if(Math.abs(gMin(x.hora)-gMin(m.hora))<(o.dur||60)){[x.h,x.v].forEach(tid=>rosterIds(o,tid).forEach(c=>ocup.add(c)));(x.sup||[]).forEach(s=>ocup.add(s.cust));}}));
 const ya=new Set(rosterIds(t,m.h).concat(rosterIds(t,m.v),(m.sup||[]).map(s=>s.cust)));
 return gMembers().map(c=>({c,d:dispOf(c.id)})).filter(x=>x.d&&x.d.on&&!ya.has(x.c.id)&&!ocup.has(x.c.id)&&(!x.d.dep||!x.d.dep.length||x.d.dep.includes(t.sport))&&(dow<0||!x.d.dias||!x.d.dias.length||x.d.dias.includes(dow)))
  .map(x=>{const vec=(x.d.n||0);return Object.assign(x,{score:(x.d.dep&&x.d.dep.includes(t.sport)?2:0)+(x.d.dias&&x.d.dias.includes(dow)?1:0)-vec*0.1});}).sort((a,b)=>b.score-a.score||gName(a.c).localeCompare(gName(b.c),'es'));}

/* ---------- transmisión: enlaces para ver (embebidos) y para emitir (app RTMP) ---------- */
function verUrl(st){const c=String(st.canal||'').trim();if(!c)return'';
 if(st.plat==='youtube'){const v=/(?:v=|youtu\.be\/|live\/)([\w-]{11})/.exec(c);if(v)return'https://www.youtube.com/embed/'+v[1]+'?autoplay=1&mute=1';if(/^UC[\w-]{22}$/.test(c))return'https://www.youtube.com/embed/live_stream?channel='+c+'&autoplay=1&mute=1';return'';}
 if(st.plat==='twitch')return/^[\w]{3,25}$/.test(c)?'https://player.twitch.tv/?channel='+c+'&parent='+location.hostname+'&muted=true':'';
 if(st.plat==='kick')return/^[\w-]{3,40}$/.test(c)?'https://player.kick.com/'+c+'?muted=true&autoplay=true':'';
 return/^https:\/\//.test(c)?c:'';}
function larix(t){const s=t.st;if(!s.srv||!s.key)return'';const url=s.srv.replace(/\/+$/,'')+'/'+s.key;return'larix://set/v1?conn[][url]='+encodeURIComponent(url)+'&conn[][name]='+encodeURIComponent(t.name.slice(0,30))+'&conn[][overwrite]=on&enc[vid][res]='+(s.cal==='1080p'?'1920x1080':s.cal==='480p'?'854x480':'1280x720')+'&enc[vid][bitrate]='+CAL[s.cal].kbps+'&enc[vid][fps]=30';}
const marcUrl=(t,m)=>location.origin+location.pathname+'#marcador/'+t.id+(m?'/'+m.id:'');
const pubUrl=t=>location.origin+location.pathname+'#torneo/'+t.id;

/* ---------- pantalla ---------- */
let tSel='',tTab='res';
const css=`.tz-kp{grid-template-columns:repeat(2,minmax(0,1fr))!important}.tz-kp>.gp-k{grid-column:auto!important;padding:.8rem}.tz-kp .gp-k b{font-size:1.3rem}@media(min-width:900px){.tz-kp{grid-template-columns:repeat(4,minmax(0,1fr))!important}}
.tz-cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:.8rem;margin:.6rem 0}
.tz-card{border:1px solid var(--line);border-radius:16px;padding:.9rem 1rem;background:var(--card);cursor:pointer;text-align:left;color:inherit;font:inherit;transition:transform .15s,border-color .15s}.tz-card:hover{transform:translateY(-2px);border-color:var(--gold)}
.tz-card h3{margin:.2rem 0 .3rem;font-size:1.08rem}.tz-kpi{display:flex;gap:1rem;flex-wrap:wrap;font-size:.85rem;opacity:.85}
.tz-m{display:grid;grid-template-columns:1fr auto 1fr;gap:.5rem;align-items:center;padding:.55rem .6rem;border:1px solid var(--line);border-radius:12px;margin:.35rem 0;background:var(--card)}
.tz-m .h{text-align:right;font-weight:600}.tz-m .v{font-weight:600}.tz-m .sc{display:flex;gap:.25rem;align-items:center}.tz-m .sc input{width:46px;text-align:center;min-height:40px;font-size:1.05rem}
.tz-m .meta{grid-column:1/-1;display:flex;gap:.4rem;flex-wrap:wrap;align-items:center;font-size:.78rem;opacity:.85}
.tz-m.vivo{border-color:#ef4444;box-shadow:0 0 0 2px rgba(239,68,68,.25)}.tz-live{display:inline-flex;align-items:center;gap:.3rem;background:#ef4444;color:#fff;border-radius:999px;padding:.05rem .55rem;font-weight:700;font-size:.72rem}
.tz-live::before{content:'';width:7px;height:7px;border-radius:50%;background:#fff;animation:tzp 1.2s infinite}@keyframes tzp{50%{opacity:.25}}
.tz-br{display:flex;gap:1.2rem;overflow-x:auto;padding:.4rem 0 .8rem}.tz-col{display:flex;flex-direction:column;justify-content:space-around;gap:.6rem;min-width:200px}
.tz-col h4{margin:0 0 .2rem;font-size:.85rem;opacity:.8}.tz-bm{border:1px solid var(--line);border-radius:10px;overflow:hidden;background:var(--card)}.tz-bm div{display:flex;justify-content:space-between;padding:.35rem .6rem;font-size:.88rem}.tz-bm div+div{border-top:1px solid var(--line)}.tz-bm .w{font-weight:700;color:var(--gold)}
.tz-pos td,.tz-pos th{text-align:center}.tz-pos td:nth-child(2),.tz-pos th:nth-child(2){text-align:left}.tz-pos tr.q td{background:color-mix(in srgb,var(--gold) 12%,transparent)}
.tz-key{font-family:ui-monospace,Menlo,monospace;letter-spacing:.05em}.tz-qr{width:170px;height:170px;background:#fff;padding:6px;border-radius:10px}
#tz-pub{position:fixed;inset:0;z-index:9999;overflow:auto;background:#0b0b0f;color:#f4f4f5;font:15px/1.45 system-ui,-apple-system,Segoe UI,sans-serif}
#tz-pub .w{max-width:980px;margin:0 auto;padding:1rem}#tz-pub h1{font-size:1.5rem;margin:.3rem 0}#tz-pub table{width:100%;border-collapse:collapse}#tz-pub td,#tz-pub th{padding:.45rem .35rem;border-bottom:1px solid #27272a;text-align:center}#tz-pub td:nth-child(2),#tz-pub th:nth-child(2){text-align:left}
#tz-pub .card{background:#18181b;border:1px solid #27272a;border-radius:14px;padding:.9rem;margin:.8rem 0}#tz-pub iframe{width:100%;aspect-ratio:16/9;border:0;border-radius:12px;background:#000}
#tz-pub.marc{background:#00b140!important;display:flex;align-items:flex-start;justify-content:flex-start}#tz-pub .sb{margin:24px;display:inline-flex;flex-wrap:wrap;max-width:calc(100vw - 48px);align-items:stretch;border-radius:12px;overflow:hidden;box-shadow:0 6px 24px rgba(0,0,0,.45);font:700 clamp(16px,3.2vw,26px)/1 system-ui,sans-serif}@media(max-width:700px){#tz-pub .sb .t{min-width:0;flex:1 1 40%}}
#tz-pub .sb .t{background:#111827;color:#fff;padding:14px 18px;min-width:200px}#tz-pub .sb .s{background:#f59e0b;color:#111;padding:14px 18px;min-width:96px;text-align:center}#tz-pub .sb .tg{background:#ef4444;color:#fff;font-size:14px;padding:6px 10px;display:flex;align-items:center}#tz-pub .sb small{display:block;font-size:13px;font-weight:600;opacity:.75;margin-top:6px}`;
try{const s0=document.createElement('style');s0.textContent=css;document.head.appendChild(s0);}catch(e){}

function listaHTML(){const L=TR().trn.slice().sort((a,b)=>(a.estado==='fin')-(b.estado==='fin')||b.created-a.created);
 return`<div class="row"><h1 class="sp">Torneos</h1><button class="btn gold" data-act="tzNuevo">+ Nuevo torneo</button></div>
 ${L.length?`<div class="tz-cards">${L.map(t=>{const E=insc(t),fin=t.matches.filter(m=>m.st==='fin'&&!m.bye).length,tot=t.matches.filter(m=>!m.bye).length,vivo=t.matches.some(m=>m.vivo);
  return`<button type="button" class="tz-card" data-act="tzAbrir" data-id="${t.id}"><div class="row"><span class="tag ${EST[t.estado][1]}">${EST[t.estado][0]}</span>${vivo?'<span class="tz-live">EN VIVO</span>':''}</div><h3>${esc(t.name)}</h3>
  <div class="tz-kpi"><span>${esc(t.sport)}</span><span>${esc(FMT[t.fmt])}</span></div><div class="tz-kpi" style="margin-top:.4rem"><span>👥 ${E.length}/${t.cupo} equipos</span><span>⚽ ${fin}/${tot} partidos</span>${t.fee?'<span>💵 '+money(t.fee)+'</span>':''}</div></button>`;}).join('')}</div>`:'<div class="card"><p>Todavía no hay torneos. Creá el primero: el fixture y la tabla se arman solos.</p></div>'}`;}
function cabHTML(t){const tabs=[['res','Resumen'],['insc','Inscripciones ('+insc(t).length+'/'+t.cupo+')'],['fix','Fixture'],['pos',t.fmt==='elim'?'Llaves':'Posiciones'],['sup','Suplentes'],['tv','Transmisión']];
 return`<div class="row" style="flex-wrap:wrap;gap:.5rem"><button class="btn sm" data-act="tzVolver">← Torneos</button><h1 class="sp" style="margin:0">${esc(t.name)}</h1><span class="tag ${EST[t.estado][1]}">${EST[t.estado][0]}</span>
 <button class="btn sm" data-act="tzPub" data-id="${t.id}">🌐 Página pública</button>${isAdm()?`<button class="btn sm" data-act="tzEditar" data-id="${t.id}">Editar</button><button class="btn sm red" data-act="tzBorrar" data-id="${t.id}">Borrar</button>`:''}</div>
 <p class="sm mut">${esc(t.sport)} · ${esc(FMT[t.fmt])}${t.ida?' · ida y vuelta':''} · desde ${dmy(t.ini)} (${DIA[new Date(t.ini+'T12:00').getDay()]}) ${esc(t.hora)} · ${t.canchas.length?t.canchas.map(id=>esc((TR().courts.find(c=>c.id===id)||{}).name||'')).join(', '):'sin cancha asignada'}</p>
 <div class="gp-tabs" role="tablist">${tabs.map(([k,x])=>`<button role="tab" aria-selected="${tTab===k}" class="btn sm ${tTab===k?'gold':''}" data-act="tzTab" data-t="${k}">${x}</button>`).join('')}</div>`;}
function resHTML(t){const E=insc(t),pend=(t.teams||[]).filter(x=>x.st==='pendiente').length,esp=(t.teams||[]).filter(x=>x.st==='espera').length,deb=E.filter(x=>t.fee&&(!x.pago||x.pago.st!=='pagado')).length;const P0=proximos(t,6);const vivo=t.matches.filter(m=>m.vivo);
 const pos=t.fmt!=='elim'?tabla(t,t.fmt==='grupos'?'A':'').slice(0,5):[];
 return`<div class="gp-bento tz-kp" style="margin:.4rem 0 1rem"><div class="gp-k"><span class="gp-kt">Equipos</span><b>${E.length}/${t.cupo}</b><span class="gp-ks">${pend} por confirmar · ${esp} en espera</span></div>
 <div class="gp-k"><span class="gp-kt">Partidos</span><b>${t.matches.filter(m=>m.st==='fin'&&!m.bye).length}/${t.matches.filter(m=>!m.bye).length}</b><span class="gp-ks">jugados</span></div>
 <div class="gp-k"><span class="gp-kt">Recaudado</span><b>${money(E.filter(x=>x.pago&&x.pago.st==='pagado').length*t.fee)}</b><span class="gp-ks">${deb?deb+' equipo(s) deben':'todo cobrado'}</span></div>
 <div class="gp-k"><span class="gp-kt">Goles / puntos</span><b>${t.matches.reduce((a,m)=>a+(m.ga!==''&&m.ga!=null?+m.ga+ +m.gb:0),0)}</b><span class="gp-ks">${esc(DEPof(t).u.toLowerCase())}</span></div></div>
 ${t.estado==='inscripcion'?`<div class="card"><div class="row"><b class="sp">Inscripción abierta · ${E.length} de ${t.cupo} lugares</b><button class="btn" data-act="tzTab" data-t="insc">Inscribir equipos</button>${E.length>=2&&isAdm()?'<button class="btn gold" data-act="tzGenerar">Armar fixture y empezar</button>':''}</div></div>`:''}
 ${vivo.length?`<div class="card"><h3>🔴 En vivo</h3>${vivo.map(m=>mHTML(t,m)).join('')}</div>`:''}
 ${P0.length?`<div class="card"><h3>Próximos partidos</h3>${P0.map(m=>mHTML(t,m)).join('')}</div>`:''}
 ${pos.length?`<div class="card"><h3>Arriba en la tabla${t.fmt==='grupos'?' · Grupo A':''}</h3>${posTable(t,pos,0)}</div>`:''}`;}
function inscHTML(t){const L=(t.teams||[]).slice().sort((a,b)=>({confirmado:0,pendiente:1,espera:2,baja:3}[a.st]-{confirmado:0,pendiente:1,espera:2,baja:3}[b.st])||a.ts-b.ts);const ST={confirmado:['Confirmado','ok'],pendiente:['Falta confirmar','warn'],espera:['Lista de espera',''],baja:['Baja','bad']};
 return`<div class="row" style="flex-wrap:wrap"><b class="sp">${insc(t).length} de ${t.cupo} lugares · arancel ${t.fee?money(t.fee)+' por equipo':'sin cargo'} · ${t.jmin} a ${t.jmax} jugadores</b><button class="btn gold" data-act="tzInsc" data-id="">+ Inscribir equipo</button><button class="btn" data-act="tzInscLink">📣 Invitar a inscribirse</button></div>
 <div class="tw"><table><thead><tr><th>Equipo</th><th>Capitán</th><th>Jugadores</th><th>Estado</th><th>Pago</th><th></th></tr></thead><tbody>${L.map(x=>{const cap=x.cap&&gCust(x.cap);const pg=x.pago||{st:'pendiente'};
  return`<tr><td><b>${esc(x.name)}</b>${x.gr?' <span class="tag">Grupo '+esc(x.gr)+'</span>':''}</td><td>${cap?esc(gName(cap)):esc(x.capName||'—')}</td><td>${(x.jug||[]).length}${(x.jug||[]).length<t.jmin?' <span class="tag warn">faltan '+(t.jmin-(x.jug||[]).length)+'</span>':''}</td>
  <td><span class="tag ${ST[x.st][1]}">${ST[x.st][0]}</span></td><td>${!t.fee?'—':pg.st==='pagado'?'<span class="tag ok">Pagado</span><div class="sm mut">'+esc(pg.met||'')+(pg.ref?' · '+esc(pg.ref):'')+'</div>':'<span class="tag warn">Pendiente</span>'}</td>
  <td class="r" style="white-space:nowrap">${t.fee&&pg.st!=='pagado'&&x.st!=='baja'?`<button class="btn sm gold" data-act="tzPago" data-id="${x.id}">Cobrar</button>`:''}${x.st==='pendiente'||x.st==='espera'?`<button class="btn sm" data-act="tzConf" data-id="${x.id}">Confirmar</button>`:''}<button class="btn sm" data-act="tzInsc" data-id="${x.id}">Editar</button>${x.st!=='baja'?`<button class="btn sm red" data-act="tzBaja" data-id="${x.id}">Baja</button>`:''}</td></tr>`;}).join('')||'<tr><td colspan="6" class="mut">Sin inscriptos todavía.</td></tr>'}</tbody></table></div>
 <p class="sm mut">Con el cupo lleno, los nuevos equipos quedan en lista de espera y suben solos cuando hay una baja. Un equipo queda confirmado cuando paga (o lo confirmás a mano).</p>`;}
function mHTML(t,m){const u=DEPof(t).u;const can=m.h&&m.v&&!m.bye;const c=TR().courts.find(x=>x.id===m.cancha);const w=ganador(t,m);
 return`<div class="tz-m ${m.vivo?'vivo':''}"><span class="h ${w&&w===m.h?'gold':''}">${esc(tn(t,m.h))}</span><span class="sc">${can?`<input class="tz-g" data-t="${t.id}" data-m="${m.id}" data-s="ga" inputmode="numeric" value="${esc(m.ga==null?'':m.ga)}" aria-label="${esc(u)} de ${esc(tn(t,m.h))}"><span>-</span><input class="tz-g" data-t="${t.id}" data-m="${m.id}" data-s="gb" inputmode="numeric" value="${esc(m.gb==null?'':m.gb)}" aria-label="${esc(u)} de ${esc(tn(t,m.v))}">`:'<span class="sm mut">'+(m.bye?'pasa directo':'—')+'</span>'}</span><span class="v ${w&&w===m.v?'gold':''}">${esc(tn(t,m.v))}</span>
 <div class="meta"><span class="tag">${esc(m.fase)}</span>${m.fecha?'<span>📅 '+DIA[new Date(m.fecha+'T12:00').getDay()]+' '+dmyS(m.fecha)+' '+esc(m.hora)+'</span>':''}${c?'<span>📍 '+esc(c.name)+'</span>':''}${m.vivo?'<span class="tz-live">EN VIVO</span>':''}${m.st==='wo'?'<span class="tag bad">W.O.</span>':''}${(m.sup||[]).length?'<span class="tag">'+m.sup.length+' suplente(s)</span>':''}
 <span class="sp"></span>${can?`<button class="btn sm" data-act="tzPart" data-t="${t.id}" data-m="${m.id}">Detalle</button>`:''}</div></div>`;}
function fixHTML(t){if(!t.matches.length)return`<div class="card"><p>El fixture se arma cuando cierres la inscripción.</p>${insc(t).length>=2&&isAdm()?'<button class="btn gold" data-act="tzGenerar">Armar fixture ahora</button>':'<p class="sm mut">Hacen falta al menos 2 equipos confirmados.</p>'}</div>`;
 const F=[...new Set(t.matches.map(m=>m.fase))];const done=t.fmt==='grupos'&&!t.matches.some(m=>m.po)&&!t.matches.some(m=>m.gr&&m.st!=='fin'&&m.st!=='wo');
 return`<div class="row" style="flex-wrap:wrap"><span class="sp sm mut">Escribí el resultado y la tabla se actualiza al instante. Los partidos ocupan su turno en Canchas.</span>${isAdm()?'<button class="btn sm" data-act="tzReprog">↻ Reprogramar pendientes</button><button class="btn sm" data-act="tzRegen">Rehacer fixture</button>':''}${t.fmt==='grupos'?`<button class="btn sm ${done?'gold':''}" data-act="tzPlayoffs">Armar playoffs</button>`:''}<button class="btn sm" data-act="tzAvisar">📣 Avisar la fecha</button></div>
 ${F.map(f=>`<h3 style="margin:1rem 0 .3rem">${esc(f)}</h3>${t.matches.filter(m=>m.fase===f&&!(m.bye&&m.st==='fin'&&!m.h&&!m.v)).map(m=>mHTML(t,m)).join('')}`).join('')}`;}
function posTable(t,L,q){return`<div class="tw"><table class="tz-pos" data-nosort><thead><tr><th>#</th><th>Equipo</th><th>PJ</th><th>PG</th><th>PE</th><th>PP</th><th title="${esc(DEPof(t).u)} a favor">GF</th><th title="en contra">GC</th><th>DIF</th><th>Pts</th></tr></thead><tbody>${L.map((x,i)=>`<tr class="${q&&i<q?'q':''}"><td>${i+1}</td><td><b>${esc(x.eq)}</b>${x.adj?' <span class="sm mut">('+(x.adj>0?'+':'')+x.adj+')</span>':''}</td><td>${x.pj}</td><td>${x.pg}</td><td>${x.pe}</td><td>${x.pp}</td><td>${x.gf}</td><td>${x.gc}</td><td>${x.dg>0?'+':''}${x.dg}</td><td><b>${x.pts}</b></td></tr>`).join('')}</tbody></table></div>`;}
function bracketHTML(t,po){const M=t.matches.filter(m=>po?m.po:!m.gr);const rs=[...new Set(M.map(m=>m.r))].sort((a,b)=>a-b);
 return`<div class="tz-br">${rs.map(r=>{const L=M.filter(m=>m.r===r).sort((a,b)=>a.slot-b.slot);return`<div class="tz-col"><h4>${esc(L[0].fase)}</h4>${L.map(m=>{const w=ganador(t,m);return`<div class="tz-bm"><div class="${w&&w===m.h?'w':''}"><span>${esc(tn(t,m.h))}</span><b>${m.ga!==''&&m.ga!=null?esc(m.ga):''}</b></div><div class="${w&&w===m.v?'w':''}"><span>${esc(tn(t,m.v))}</span><b>${m.gb!==''&&m.gb!=null?esc(m.gb):''}</b></div></div>`;}).join('')}</div>`;}).join('')}</div>`;}
function posHTML(t){const g=goleadores(t).slice(0,10);let h='';
 if(t.fmt==='liga')h=`<div class="card"><h3>Tabla de posiciones</h3>${posTable(t,tabla(t,''),0)}<p class="sm mut">Puntos: ganado ${t.pts.w} · empatado ${t.pts.d} · perdido ${t.pts.l}. Desempate: puntos, resultado entre ellos, diferencia y ${esc(DEPof(t).u.toLowerCase())} a favor.</p></div>`;
 else if(t.fmt==='grupos')h=Object.keys(grupoDe(t)).sort().map(gr=>`<div class="card"><h3>Grupo ${esc(gr)}</h3>${posTable(t,tabla(t,gr),+t.clas||2)}</div>`).join('')+(t.matches.some(m=>m.po)?`<div class="card"><h3>Playoffs</h3>${bracketHTML(t,true)}</div>`:'');
 else h=`<div class="card"><h3>Llaves</h3>${bracketHTML(t,false)}</div>`;
 return h+`<div class="row"><button class="btn sm" data-act="tzCopiar">Copiar tabla para WhatsApp o redes</button></div>${g.length?`<div class="card"><h3>${DEPof(t).u==='Goles'?'Goleadores':'Mejores anotadores'}</h3><div class="tw"><table><tbody>${g.map((x,i)=>`<tr><td>${i+1}</td><td><b>${esc(x.j)}</b></td><td>${esc(tn(t,x.tm))}</td><td class="r"><b>${x.n}</b></td></tr>`).join('')}</tbody></table></div></div>`:''}`;}
function supHTML(t){const M=gMembers().slice().sort((a,b)=>gName(a).localeCompare(gName(b),'es'));const D=M.filter(c=>(dispOf(c.id)||{}).on);
 return`<div class="card"><h3>Socios disponibles para suplir · ${D.length}</h3><p class="sm mut">Cada socio marca en su perfil si está disponible, para qué deportes y qué días. Cuando un equipo tiene una baja, el sistema filtra a los que pueden ese día y horario (y no juegan a la misma hora) y los convoca.</p>
 <div class="tw"><table data-nosort><thead><tr><th>Socio</th><th>Disponible</th><th>Deportes</th><th>Días</th><th class="r">Suplencias</th></tr></thead><tbody>${M.slice(0,200).map(c=>{const d=dispOf(c.id)||{};return`<tr><td>${esc(gName(c))}</td><td><label class="chk"><input type="checkbox" class="tz-d" data-c="${c.id}" ${d.on?'checked':''} aria-label="Disponible ${esc(gName(c))}"></label></td>
  <td class="sm">${d.on?(d.dep&&d.dep.length?d.dep.map(esc).join(', '):'Todos'):'—'}</td><td class="sm">${d.on?(d.dias&&d.dias.length?d.dias.map(x=>DIA[x]).join(' '):'Todos'):'—'}</td><td class="r">${d.n||0} ${d.on?`<button class="btn sm" data-act="tzDisp" data-c="${c.id}">Ajustar</button>`:''}</td></tr>`;}).join('')}</tbody></table></div></div>
 <div class="card"><h3>Convocatorias de este torneo</h3>${t.matches.filter(m=>(m.inv||[]).length).map(m=>`<div style="margin:.4rem 0"><b>${esc(tn(t,m.h))} vs ${esc(tn(t,m.v))}</b> · ${m.fecha?dmyS(m.fecha)+' '+esc(m.hora):''}<div class="sm">${m.inv.map(i=>{const c=gCust(i.cust);return esc(c?gName(c):'?')+' → '+esc(tn(t,i.tm))+' · '+({inv:'convocado',ok:'✅ aceptó',no:'✕ no puede'}[i.st]||i.st);}).join(' · ')}</div></div>`).join('')||'<p class="sm mut">Todavía no hubo convocatorias. Se hacen desde el detalle de cada partido («Falta un jugador»).</p>'}</div>`;}
function tvHTML(t){const s=t.st||{};const P0=PLAT[s.plat]||PLAT.youtube;const ver=verUrl(s);const lx=larix(t);const vivo=t.matches.filter(m=>m.vivo);const adm=isAdm();
 return`<div class="card"><h3>Canal de la transmisión</h3><p class="sm mut">El video sale del celular (o de la PC con OBS) directo a la plataforma por RTMP. El sistema guarda la configuración, arma el marcador en vivo y muestra la transmisión en la página pública del torneo.</p>
 <div class="grid g2"><div><label for="tz-pl">Plataforma</label><select id="tz-pl" ${adm?'':'disabled'}>${Object.entries(PLAT).map(([k,x])=>`<option value="${k}" ${s.plat===k?'selected':''}>${x.t}</option>`).join('')}</select></div>
 <div><label for="tz-cal">Calidad</label><select id="tz-cal" ${adm?'':'disabled'}>${Object.entries(CAL).map(([k,x])=>`<option value="${k}" ${s.cal===k?'selected':''}>${x.t}</option>`).join('')}</select></div>
 <div><label for="tz-sv">Servidor RTMP</label><input id="tz-sv" value="${esc(s.srv||P0.srv)}" ${adm?'':'disabled'} autocomplete="off"></div>
 <div><label for="tz-k">Clave de transmisión</label>${adm?`<input id="tz-k" type="password" value="${esc(s.key||'')}" autocomplete="off" class="tz-key" placeholder="Clave secreta de la plataforma">`:`<input disabled value="${s.key?'•••• guardada (sólo la ve el administrador)':'sin cargar'}">`}</div>
 <div style="grid-column:1/-1"><label for="tz-cv">Dónde se ve (para la página pública)</label><input id="tz-cv" value="${esc(s.canal||'')}" placeholder="${esc(P0.ver)}" ${adm?'':'disabled'} autocomplete="off"></div></div>
 ${adm?'<button class="btn gold" data-act="tzStSave" style="margin-top:.6rem">Guardar transmisión</button>':''}${s.canal&&!ver?'<div class="warnbox sm">No reconozco ese canal para mostrarlo embebido: revisá el formato.</div>':''}</div>
 <div class="grid g2"><div class="card"><h3>📱 Transmitir con el celular</h3><ol class="sm"><li>Instalá <b>Larix Broadcaster</b> (gratis, Android y iPhone).</li><li>${lx&&adm?'Escaneá este código con el celular: carga el servidor, la clave y la calidad solos.':'Cargá el servidor y la clave en la app (sólo el administrador ve la clave).'}</li><li>Poné el celular horizontal, en trípode, a la altura de la mitad de la cancha.</li><li>Antes de salir en vivo, probá 1 minuto. Si la señal cae, la app reconecta sola.</li></ol>
  ${lx&&adm?`<div class="tz-qr">${typeof QR!=='undefined'&&QR.svg?QR.svg(lx,3,1):''}</div>`:''}</div>
  <div class="card"><h3>💻 Transmitir con OBS (PC)</h3><ol class="sm"><li>Ajustes › Emisión › Servicio «Personalizado»: servidor <code>${esc(s.srv||P0.srv)}</code> y la clave.</li><li>Salida: ${esc(CAL[s.cal||'720p'].t)}, intervalo de fotogramas clave 2 s.</li><li>Abrí el <b>marcador en vivo</b> en esta computadora y sumalo en OBS con «Captura de ventana» + filtro «Croma» (fondo verde).</li></ol><button class="btn sm" data-act="gOpenUrl" data-u="${esc(marcUrl(t))}">Abrir marcador</button><p class="sm mut">Se actualiza solo con cada resultado que cargás en el sistema, sin recargar.</p></div></div>
 <div class="card"><h3>Partidos en vivo</h3><p class="sm mut">Marcá «En vivo» cuando arranca la transmisión: aparece con el reproductor en la página pública y en el marcador.</p>${proximos(t,10).concat(vivo.filter(m=>!proximos(t,10).includes(m))).map(m=>`<div class="row" style="margin:.3rem 0"><span class="sp">${esc(tn(t,m.h))} vs ${esc(tn(t,m.v))} <span class="sm mut">${m.fecha?dmyS(m.fecha)+' '+esc(m.hora):''}</span></span>${m.vivo?'<span class="tz-live">EN VIVO</span>':''}<button class="btn sm ${m.vivo?'red':'gold'}" data-act="tzVivo" data-m="${m.id}">${m.vivo?'Terminar':'🔴 Salir en vivo'}</button><button class="btn sm" data-act="gOpenUrl" data-u="${esc(marcUrl(t,m))}">Marcador</button></div>`).join('')||'<p class="sm mut">No hay partidos por jugar.</p>'}
 ${ver?`<details style="margin-top:.6rem"><summary>Vista previa del reproductor</summary><iframe src="${esc(ver)}" title="Transmisión" style="width:100%;aspect-ratio:16/9;border:0;border-radius:12px;margin-top:.5rem" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe></details>`:''}</div>`;}
function pantalla(){migrar();if(!on('gtorneos'))return`<div class="card"><h2>Módulo apagado</h2><p>Prendelo en Configuración › Rubro y módulos.</p></div>`;const t=tByid(tSel);if(!t)return listaHTML();
 return cabHTML(t)+(tTab==='insc'?inscHTML(t):tTab==='fix'?fixHTML(t):tTab==='pos'?posHTML(t):tTab==='sup'?supHTML(t):tTab==='tv'?tvHTML(t):resHTML(t));}
if(SCREENS.gtorneos){SCREENS.gtorneos.t='Torneos';SCREENS.gtorneos.render=pantalla;SCREENS.gtorneos.after=()=>{};}else reg('gtorneos','Torneos','list','gym',pantalla,null,'Gimnasio');
try{if(typeof UX_DESC!=='undefined')UX_DESC.gtorneos='Inscripciones con cupo y pago, fixture automático en tus canchas, posiciones en vivo, suplentes por disponibilidad y transmisión en YouTube, Twitch o Kick.';}catch(e){}

/* ---------- acciones ---------- */
const T0=()=>tByid(tSel);
A.tzAbrir=el=>{tSel=el.dataset.id;tTab='res';rerender();};A.tzVolver=()=>{tSel='';rerender();};A.tzTab=el=>{tTab=el.dataset.t;rerender();};
function formT(t){const C=TR().courts;const sp=t?t.sport:'Fútbol 5';return`<label for="tf-n">Nombre</label><input id="tf-n" maxlength="60" value="${esc(t?t.name:'')}" placeholder="Torneo Apertura Fútbol 5">
 <div class="grid g2"><div><label for="tf-s">Deporte</label><select id="tf-s">${Object.keys(DEP).map(k=>`<option ${k===sp?'selected':''}>${k}</option>`).join('')}</select></div><div><label for="tf-f">Formato</label><select id="tf-f">${Object.entries(FMT).map(([k,x])=>`<option value="${k}" ${t&&t.fmt===k?'selected':''}>${x}</option>`).join('')}</select></div>
 <div><label for="tf-c">Cupo de equipos</label><input id="tf-c" type="number" min="2" max="64" value="${t?t.cupo:8}"></div><div><label for="tf-a">Arancel por equipo ($)</label><input id="tf-a" inputmode="numeric" value="${t&&t.fee?Math.round(t.fee/100):''}" placeholder="0 = sin cargo"></div>
 <div><label for="tf-jm">Jugadores mínimo</label><input id="tf-jm" type="number" min="1" max="30" value="${t?t.jmin:5}"></div><div><label for="tf-jx">Jugadores máximo</label><input id="tf-jx" type="number" min="1" max="40" value="${t?t.jmax:10}"></div>
 <div><label for="tf-i">Primera fecha</label><input id="tf-i" type="date" value="${t?t.ini:addDays(gT(),7)}"></div><div><label for="tf-h">Hora del primer partido</label><input id="tf-h" type="time" value="${t?t.hora:'20:00'}"></div>
 <div><label for="tf-d">Duración de cada partido (min)</label><input id="tf-d" type="number" min="20" max="180" value="${t?t.dur:60}"></div><div><label for="tf-g">Grupos (formato grupos)</label><input id="tf-g" type="number" min="2" max="8" value="${t?t.grupos:2}"></div></div>
 <label class="chk"><input type="checkbox" id="tf-v" ${t&&t.ida?'checked':''}> Ida y vuelta</label>
 <label>Canchas</label><div class="row" style="flex-wrap:wrap">${C.length?C.map(c=>`<label class="chk"><input type="checkbox" class="tf-cn" value="${c.id}" ${t&&t.canchas.includes(c.id)?'checked':''}> ${esc(c.name)} <span class="sm mut">${esc(c.sport||'')}</span></label>`).join(''):'<span class="sm mut">No hay canchas cargadas: los partidos quedan sin cancha.</span>'}</div>`;}
function leerT(w){const n=cleanT(val('tf-n'));if(n.length<3)return{err:'Escribí el nombre del torneo.'};const cupo=Math.round(+val('tf-c'));if(!(cupo>=2&&cupo<=64))return{err:'El cupo va de 2 a 64 equipos.'};
 const fee=Math.round((+String(val('tf-a')||'0').replace(/\./g,'').replace(',','.')||0)*100);if(fee<0)return{err:'Arancel inválido.'};const jm=Math.round(+val('tf-jm')),jx=Math.round(+val('tf-jx'));if(!(jm>=1&&jx>=jm))return{err:'Revisá la cantidad de jugadores.'};
 const ini=val('tf-i');if(!/^\d{4}-\d{2}-\d{2}$/.test(ini))return{err:'Elegí la primera fecha.'};const hora=val('tf-h')||'20:00';const dur=Math.round(+val('tf-d'));if(!(dur>=20&&dur<=180))return{err:'La duración va de 20 a 180 minutos.'};
 return{name:n,sport:val('tf-s'),fmt:val('tf-f'),cupo,fee,jmin:jm,jmax:jx,ini,hora,dur,grupos:Math.round(+val('tf-g'))||2,ida:$('#tf-v',w).checked,canchas:$$('.tf-cn',w).filter(i=>i.checked).map(i=>i.value)};}
A.tzNuevo=()=>{if(!isAdm()&&!can('gym'))return;modal('Nuevo torneo',formT(null),{wide:true,okText:'Crear e inscribir equipos',onOk:w=>{const o=leerT(w);if(o.err)return w._err(o.err),false;const t=nuevo(o);Object.assign(t,{cupo:o.cupo,fee:o.fee,jmin:o.jmin,jmax:o.jmax,dur:o.dur,canchas:o.canchas,ida:o.ida,grupos:o.grupos});
 TR().trn.push(t);tSel=t.id;tTab='insc';audit('TORNEO_NUEVO',t.name+' · '+t.sport+' · '+FMT[t.fmt]);save();rerender();}});};
A.tzEditar=()=>{const t=T0();if(!t||!isAdm())return;modal('Editar torneo',formT(t),{wide:true,okText:'Guardar',onOk:w=>{const o=leerT(w);if(o.err)return w._err(o.err),false;const fixF=t.matches.length&&(o.fmt!==t.fmt||o.ida!==t.ida);if(fixF)return w._err('El formato no se puede cambiar con el fixture armado: rehacé el fixture primero.'),false;
 const reprog=o.ini!==t.ini||o.hora!==t.hora||o.dur!==t.dur||String(o.canchas)!==String(t.canchas);Object.assign(t,o);if(o.cupo<insc(t).length)t.cupo=insc(t).length;if(reprog&&t.matches.length)programar(t);audit('TORNEO_EDITADO',t.name);save();rerender();}});};
A.tzBorrar=()=>{const t=T0();if(!t||!isAdm())return;confirmBox('Borrar '+esc(t.name),'Se borran inscripciones, fixture, resultados y los turnos que ocupaba en las canchas.',()=>{quitarTurnos(t);TR().trn=TR().trn.filter(x=>x!==t);if(t.old)TR().tourn=TR().tourn.filter(x=>x.id!==t.old);tSel='';audit('TORNEO_BORRADO',t.name);save();rerender();},'Borrar');};
/* inscripción */
A.tzInsc=el=>{const t=T0();if(!t)return;const x=team(t,el.dataset.id)||null;const M=gMembers().slice().sort((a,b)=>gName(a).localeCompare(gName(b),'es'));
 modal(x?'Editar '+x.name:'Inscribir equipo',`<label for="ti-n">Nombre del equipo</label><input id="ti-n" maxlength="40" value="${esc(x?x.name:'')}">
 <div class="grid g2"><div><label for="ti-c">Capitán (socio)</label><select id="ti-c"><option value="">— No es socio —</option>${M.map(c=>`<option value="${c.id}" ${x&&x.cap===c.id?'selected':''}>${esc(gName(c))}</option>`).join('')}</select></div>
 <div><label for="ti-t">Teléfono del capitán (si no es socio)</label><input id="ti-t" inputmode="tel" maxlength="20" value="${esc(x?x.tel||'':'')}"></div></div><label for="ti-cn">Nombre del capitán (si no es socio)</label><input id="ti-cn" maxlength="40" value="${esc(x?x.capName||'':'')}">
 <label for="ti-j">Jugadores (uno por renglón · si es socio, escribí su nombre tal cual)</label><textarea id="ti-j" rows="7">${esc(x?(x.jug||[]).map(j=>j.name).join('\n'):'')}</textarea><p class="sm mut">Entre ${t.jmin} y ${t.jmax} jugadores. Los socios se reconocen solos y pueden ser convocados como suplentes en otros equipos.</p>`,
 {okText:x?'Guardar':'Inscribir',onOk:w=>{const n=cleanT(val('ti-n'),40);if(n.length<2)return w._err('Escribí el nombre del equipo.'),false;if((t.teams||[]).some(y=>y!==x&&y.st!=='baja'&&y.name.toLowerCase()===n.toLowerCase()))return w._err('Ya hay un equipo con ese nombre.'),false;
  const cap=val('ti-c');const tel=String(val('ti-t')||'').replace(/[^\d+]/g,'').slice(0,20);if(!cap&&tel.replace(/\D/g,'').length<8)return w._err('Elegí el capitán socio o cargá su teléfono.'),false;
  const J=[...new Set(val('ti-j').split('\n').map(s=>cleanT(s,40)).filter(Boolean))];if(J.length>t.jmax)return w._err('Máximo '+t.jmax+' jugadores.'),false;
  const byName=nm=>gMembers().find(c=>gName(c).toLowerCase()===nm.toLowerCase());const jug=J.map(nm=>{const c=byName(nm);return{name:nm,cust:c?c.id:''};});
  if(x){Object.assign(x,{name:n,cap,tel,capName:cleanT(val('ti-cn'),40),jug});t.matches.forEach(m=>{if(m.cancha)turno(t,m);});audit('TORNEO_EQUIPO',t.name+' · '+n+' · editado');}
  else{const full=insc(t).length+(t.teams||[]).filter(y=>y.st==='pendiente').length>=t.cupo;const st=full?'espera':(t.fee?'pendiente':'confirmado');
   (t.teams=t.teams||[]).push({id:uid(),name:n,cap,tel,capName:cleanT(val('ti-cn'),40),jug,st,pago:{st:t.fee?'pendiente':'pagado'},ts:now()});audit('TORNEO_INSCRIPCION',t.name+' · '+n+' · '+st);toast(n+(st==='espera'?': cupo lleno, queda en lista de espera':st==='pendiente'?': inscripto, falta el pago':': inscripto y confirmado'));}
  save();rerender();}});};
function subirEspera(t){const libres=t.cupo-insc(t).length-(t.teams||[]).filter(y=>y.st==='pendiente').length;if(libres<=0)return null;const e=(t.teams||[]).filter(y=>y.st==='espera').sort((a,b)=>a.ts-b.ts)[0];if(!e)return null;e.st=t.fee?'pendiente':'confirmado';audit('TORNEO_ESPERA_SUBE',t.name+' · '+e.name);return e;}
A.tzConf=el=>{const t=T0(),x=t&&team(t,el.dataset.id);if(!x)return;if(insc(t).length>=t.cupo)return toast('El cupo está completo.',1);x.st='confirmado';audit('TORNEO_CONFIRMADO',t.name+' · '+x.name);save();rerender();};
A.tzBaja=el=>{const t=T0(),x=t&&team(t,el.dataset.id);if(!x)return;const jugo=t.matches.some(m=>(m.h===x.id||m.v===x.id)&&m.st==='fin'&&!m.bye);
 confirmBox('Baja de '+esc(x.name),jugo?'El equipo ya jugó: sus partidos pendientes quedan por W.O. a favor del rival.':'Si había lista de espera, sube el primero.',()=>{x.st='baja';if(jugo)t.matches.forEach(m=>{if((m.h===x.id||m.v===x.id)&&m.st!=='fin'){m.st='wo';m.wo=m.h===x.id?m.v:m.h;}});
  else if(t.matches.length){t.matches=t.matches.filter(m=>m.h!==x.id&&m.v!==x.id);t.matches.forEach(m=>turno(t,m));}const e=subirEspera(t);avanzar(t);audit('TORNEO_BAJA',t.name+' · '+x.name);save();rerender();if(e)toast('Subió de la lista de espera: '+e.name);},'Dar de baja');};
A.tzPago=el=>{const t=T0(),x=t&&team(t,el.dataset.id);if(!x)return;const cfg=G().cfg||{};const msg='Hola! Para confirmar a «'+x.name+'» en '+t.name+' el arancel es de '+money(t.fee)+'.'+(cfg.mpLink?' Podés pagar acá: '+cfg.mpLink:'')+(cfg.alias?' Alias para transferir: '+cfg.alias+'.':'')+' Cuando pagues, mandanos el comprobante. ¡Gracias!';
 modal('Cobrar inscripción · '+x.name,`<p>Arancel: <b>${money(t.fee)}</b></p><div class="pvx-big" style="display:grid;gap:.5rem"><button class="btn gold" data-act="tzPagoCaja" data-id="${x.id}">💵 Cobrar en Vender (caja y comprobante)</button>
 ${waBtn(telOf({cust:x.cap,tel:x.tel}),msg,'📲 Mandar link de pago por WhatsApp')}</div><hr><label for="tp-m">Ya pagó por</label><select id="tp-m"><option>Transferencia</option><option>Mercado Pago</option><option>Efectivo</option></select><label for="tp-r">Comprobante / referencia</label><input id="tp-r" maxlength="40">`,
 {okText:'Marcar pagado',onOk:w=>{const r=cleanT(val('tp-r'),40);if(val('tp-m')!=='Efectivo'&&r.length<3)return w._err('Anotá el comprobante.'),false;x.pago={st:'pagado',met:val('tp-m'),ref:r,ts:now(),by:user.name};if(x.st==='pendiente')x.st='confirmado';audit('TORNEO_PAGO',t.name+' · '+x.name+' · '+money(t.fee)+' · '+val('tp-m'));save();rerender();}});};
A.tzPagoCaja=el=>{const t=T0(),x=t&&team(t,el.dataset.id);if(!x)return;if(typeof pos!=='undefined'&&pos.lines.length)return toast('Terminá o borrá la operación que está en Vender.',1);
 let p=prod('trn-insc');if(!p){const base=S.products.find(q=>q.rubro==='gm-memb')||S.products[0]||{};p=Object.assign({},base,{id:'trn-insc',name:'Inscripción a torneo',sub:'servicio',price:t.fee,cost:0,stock:9999,noStock:true,menu:false,active:true,barcode:'',plu:'',gymPlan:undefined});delete p.gymPlan;S.products.push(p);}
 pos.lines=[{pid:p.id,name:'Inscripción '+t.name+' · '+x.name,rubro:p.rubro,qty:1,price:t.fee,cost:0,unit:'u',list:t.fee}];pos.sel=0;pos.cust=x.cap||null;pos.chanSet=null;x.pago={st:'pagado',met:'Caja',ref:'',ts:now(),by:user.name};if(x.st==='pendiente')x.st='confirmado';
 audit('TORNEO_PAGO',t.name+' · '+x.name+' · cobrado en Vender');save();$$('#modal-root .ov').forEach(o=>o.remove());toast('Cargado en Vender: elegí el medio y cobrá.');go('vender');};
A.tzInscLink=()=>{const t=T0();if(!t)return;const msg='🏆 '+t.name+' ('+t.sport+') · '+S.tenant.name+'\n📅 Arranca el '+dmy(t.ini)+' a las '+t.hora+'\n👥 Cupo: '+t.cupo+' equipos ('+(t.cupo-insc(t).length)+' lugares libres)'+(t.fee?'\n💵 Inscripción: '+money(t.fee)+' por equipo':'')+'\nPara anotarte respondé este mensaje con el nombre del equipo y los jugadores.\nTabla y fixture: '+pubUrl(t);
 modal('Invitar a inscribirse',`<textarea rows="9" readonly id="tz-im">${esc(msg)}</textarea><div class="row" style="margin-top:.5rem"><button class="btn gold" data-act="gOpenUrl" data-u="${esc('https://wa.me/?text='+encodeURIComponent(msg))}">💬 Compartir por WhatsApp</button><button class="btn" data-act="tzCopyTxt">Copiar</button></div>`,{ok:false,cancelText:'Cerrar'});};
A.tzCopyTxt=async()=>{const x=$('#tz-im');try{await navigator.clipboard.writeText(x.value);toast('Copiado');}catch(e){x.select();}};
/* fixture */
A.tzGenerar=()=>{const t=T0();if(!t||!isAdm())return;const pend=(t.teams||[]).filter(x=>x.st==='pendiente').length;confirmBox('Armar fixture de '+esc(t.name),`${insc(t).length} equipos confirmados${pend?' · '+pend+' sin confirmar quedan afuera':''}. Los partidos se programan en las canchas elegidas desde el ${dmy(t.ini)}.`,()=>{const e=generar(t);if(e)return toast(e,1);save();tTab='fix';rerender();toast('Fixture listo: '+t.matches.filter(m=>!m.bye).length+' partidos');},'Armar');};
A.tzRegen=()=>{const t=T0();if(!t||!isAdm())return;confirmBox('Rehacer el fixture','Se borran los partidos (y sus turnos en canchas) y se arma de nuevo con los equipos confirmados. Sólo se puede si todavía no hay resultados.',()=>{const e=generar(t);if(e)return toast(e,1);save();rerender();},'Rehacer');};
A.tzReprog=()=>{const t=T0();if(!t)return;programar(t);audit('TORNEO_REPROGRAMADO',t.name);save();rerender();toast('Partidos pendientes reprogramados');};
A.tzPlayoffs=()=>{const t=T0();if(!t)return;const e=playoffs(t);if(e)return toast(e,1);save();rerender();toast('Playoffs armados');};
document.addEventListener('change',ev=>{const x=ev.target;if(!x||!x.classList)return;
 if(x.classList.contains('tz-g')){const t=tByid(x.dataset.t);const m=t&&t.matches.find(y=>y.id===x.dataset.m);if(!m)return;const v=x.value.trim();if(v!==''&&!/^\d{1,3}$/.test(v)){x.value='';return toast('Escribí un número.',1);}
  const old=ganador(t,m);m[x.dataset.s]=v;m.st=m.ga!==''&&m.gb!==''&&m.ga!=null&&m.gb!=null?'fin':(m.vivo?'vivo':'prog');if(m.st==='fin'&&m.vivo&&+m.ga===+m.gb&&t.fmt==='elim'){}
  if(t.fmt!=='liga'&&m.st==='fin'&&+m.ga===+m.gb&&(m.next||m.po)&&!m.pen){m.st='prog';setTimeout(()=>A.tzPen({dataset:{m:m.id}}),50);}
  const nw=ganador(t,m);if(old&&nw!==old&&m.next){const nx=t.matches.find(y=>y.id===m.next);if(nx&&nx.st==='fin')toast('Ojo: cambió el ganador y la ronda siguiente ya tenía resultado. Revisala.',1);}
  avanzar(t);if(t.matches.length&&t.matches.every(y=>y.st==='fin'||y.st==='wo'||y.bye)&&!(t.fmt==='grupos'&&!t.matches.some(y=>y.po)))t.estado='fin';audit('TORNEO_RESULTADO',t.name+' · '+tn(t,m.h)+' '+(m.ga||'-')+' - '+(m.gb||'-')+' '+tn(t,m.v));save();rerender();}
 if(x.classList.contains('tz-d')){const p=TR();const d=p.disp[x.dataset.c]||(p.disp[x.dataset.c]={on:false,dep:[],dias:[],n:0});d.on=x.checked;d.ts=now();audit('SUPLENTE_DISPONIBLE',gName(gCust(x.dataset.c))+' · '+(d.on?'sí':'no'));save();rerender();}});
A.tzPen=el=>{const t=T0();const m=t&&t.matches.find(y=>y.id===el.dataset.m);if(!m)return;modal('Empate: ¿quién pasa?',`<p>${esc(tn(t,m.h))} ${esc(m.ga)} - ${esc(m.gb)} ${esc(tn(t,m.v))}. En eliminación tiene que haber un ganador (penales, tie-break o el criterio del torneo).</p><div class="row"><button class="btn gold" data-act="tzPenW" data-m="${m.id}" data-w="h">${esc(tn(t,m.h))}</button><button class="btn gold" data-act="tzPenW" data-m="${m.id}" data-w="v">${esc(tn(t,m.v))}</button></div>`,{ok:false,cancelText:'Después'});};
A.tzPenW=el=>{const t=T0();const m=t&&t.matches.find(y=>y.id===el.dataset.m);if(!m)return;m.pen=el.dataset.w==='h'?m.h:m.v;m.st='fin';avanzar(t);audit('TORNEO_DESEMPATE',t.name+' · pasa '+tn(t,m.pen));save();$$('#modal-root .ov').forEach(o=>o.remove());rerender();};
A.tzPart=el=>{const t=tByid(el.dataset.t)||T0();const m=t&&t.matches.find(y=>y.id===el.dataset.m);if(!m)return;tSel=t.id;const H=team(t,m.h),V=team(t,m.v);const u=DEPof(t).u;const C=TR().courts;
 const jug=x=>(x&&x.jug||[]).map(j=>j.name).concat((m.sup||[]).filter(s=>s.tm===(x&&x.id)).map(s=>gName(gCust(s.cust))+' (suplente)'));
 modal(tn(t,m.h)+' vs '+tn(t,m.v),`<p class="sm">${esc(m.fase)}</p><div class="grid g2"><div><label for="tp-f">Fecha</label><input id="tp-f" type="date" value="${esc(m.fecha||'')}"></div><div><label for="tp-h">Hora</label><input id="tp-h" type="time" value="${esc(m.hora||'')}"></div>
 <div><label for="tp-c">Cancha</label><select id="tp-c"><option value="">Sin cancha</option>${C.map(c=>`<option value="${c.id}" ${m.cancha===c.id?'selected':''}>${esc(c.name)}</option>`).join('')}</select></div><div><label for="tp-w">W.O. (no se presentó)</label><select id="tp-w"><option value="">— Se juega —</option><option value="v" ${m.st==='wo'&&m.wo===m.v?'selected':''}>No vino ${esc(tn(t,m.h))}</option><option value="h" ${m.st==='wo'&&m.wo===m.h?'selected':''}>No vino ${esc(tn(t,m.v))}</option></select></div></div>
 <h4 style="margin:.8rem 0 .3rem">${u==='Goles'?'Goles':'Anotadores'} (tocá el jugador)</h4><div class="grid g2">${[H,V].map(x=>`<div><b class="sm">${esc(x?x.name:'')}</b><div class="row" style="flex-wrap:wrap;gap:.3rem;margin-top:.3rem">${jug(x).map(n=>`<button type="button" class="btn sm" data-act="tzGol" data-m="${m.id}" data-tm="${x.id}" data-j="${esc(n)}">${esc(n)} ${(m.ev||[]).filter(e=>e.tm===x.id&&e.j===n).reduce((a,e)=>a+(e.n||1),0)||''}</button>`).join('')||'<span class="sm mut">Sin jugadores cargados</span>'}</div></div>`).join('')}</div>
 <h4 style="margin:.8rem 0 .3rem">¿Falta un jugador?</h4><p class="sm mut">El sistema busca socios disponibles para ${esc(t.sport)} ese día, que no jueguen a esa hora.</p><button class="btn" data-act="tzSup" data-m="${m.id}">🔎 Buscar suplente</button>
 <div class="row" style="margin-top:.6rem;flex-wrap:wrap">${H?waBtn(telOf({cust:H.cap,tel:H.tel}),recordatorio(t,m,H),'💬 Avisar a '+H.name):''}${V?waBtn(telOf({cust:V.cap,tel:V.tel}),recordatorio(t,m,V),'💬 Avisar a '+V.name):''}</div>`,
 {wide:true,okText:'Guardar',onOk:w=>{const f=val('tp-f'),h=val('tp-h'),c=val('tp-c'),wo=val('tp-w');if(f&&!/^\d{4}-\d{2}-\d{2}$/.test(f))return w._err('Fecha inválida.'),false;
  if(c&&f&&h&&!libre(c,f,h,t.dur,m.id))return w._err('Esa cancha está ocupada en ese horario.'),false;m.fecha=f;m.hora=h;m.cancha=c;turno(t,m);
  if(wo){m.st='wo';m.wo=wo==='h'?m.h:m.v;}else if(m.st==='wo'){m.st='prog';delete m.wo;}avanzar(t);audit('TORNEO_PARTIDO',t.name+' · '+tn(t,m.h)+' vs '+tn(t,m.v)+' · '+(f||'')+' '+(h||''));save();rerender();}});};
function recordatorio(t,m,x){return'Hola '+x.name+'! Recordatorio de '+t.name+': '+tn(t,m.h)+' vs '+tn(t,m.v)+(m.fecha?' el '+DIA[new Date(m.fecha+'T12:00').getDay()]+' '+dmyS(m.fecha)+' a las '+m.hora:'')+((TR().courts.find(c=>c.id===m.cancha)||{}).name?' en '+(TR().courts.find(c=>c.id===m.cancha)||{}).name:'')+'. Llegá 10 minutos antes. Tabla y fixture: '+pubUrl(t);}
A.tzGol=el=>{const t=T0();const m=t&&t.matches.find(y=>y.id===el.dataset.m);if(!m)return;(m.ev=m.ev||[]).push({tm:el.dataset.tm,j:el.dataset.j,n:1,ts:now()});save();const n=m.ev.filter(e=>e.tm===el.dataset.tm&&e.j===el.dataset.j).length;el.textContent=el.dataset.j+' '+n;toast('Anotado: '+el.dataset.j);};
A.tzAvisar=()=>{const t=T0();if(!t)return;const P0=proximos(t,20);const d0=P0[0]&&P0[0].fecha;const L=P0.filter(m=>m.fecha===d0);if(!L.length)return toast('No hay partidos programados.',1);
 modal('Avisar la fecha · '+dmy(d0),`<p class="sm mut">Un mensaje por capitán, con su partido, la hora y la cancha.</p>${L.map(m=>[team(t,m.h),team(t,m.v)].filter(Boolean).map(x=>`<div class="row" style="margin:.25rem 0"><span class="sp">${esc(x.name)}</span>${waBtn(telOf({cust:x.cap,tel:x.tel}),recordatorio(t,m,x),'💬 Avisar')}</div>`).join('')).join('')}`,{ok:false,cancelText:'Cerrar'});};
/* suplentes */
A.tzSup=el=>{const t=T0();const m=t&&t.matches.find(y=>y.id===el.dataset.m);if(!m)return;const L=candidatos(t,m).slice(0,12);$$('#modal-root .ov').forEach(o=>o.remove());
 modal('Suplente para '+tn(t,m.h)+' vs '+tn(t,m.v),`<label for="ts-tm">Equipo que necesita</label><select id="ts-tm"><option value="${m.h}">${esc(tn(t,m.h))}</option><option value="${m.v}">${esc(tn(t,m.v))}</option></select>
 <p class="sm mut">${L.length} socio(s) disponibles para ${esc(t.sport)} el ${m.fecha?DIA[new Date(m.fecha+'T12:00').getDay()]+' '+dmyS(m.fecha)+' '+esc(m.hora):'día del partido'}, ordenados por afinidad.</p>
 ${L.map(x=>{const iv=(m.inv||[]).find(i=>i.cust===x.c.id);return`<div class="row" style="margin:.3rem 0;flex-wrap:wrap"><span class="sp"><b>${esc(gName(x.c))}</b> <span class="sm mut">${x.d.n||0} suplencia(s)</span></span>${iv?'<span class="tag '+(iv.st==='ok'?'ok':iv.st==='no'?'bad':'warn')+'">'+({inv:'convocado',ok:'aceptó',no:'no puede'}[iv.st])+'</span>':''}
  <button class="btn sm gold" data-act="tzConv" data-m="${m.id}" data-c="${x.c.id}">Convocar</button>${iv&&iv.st==='inv'?`<button class="btn sm" data-act="tzConvR" data-m="${m.id}" data-c="${x.c.id}" data-r="ok">Aceptó</button><button class="btn sm" data-act="tzConvR" data-m="${m.id}" data-c="${x.c.id}" data-r="no">No puede</button>`:''}</div>`;}).join('')||'<div class="warnbox">No hay socios disponibles que cumplan: marcá disponibles en la pestaña «Suplentes».</div>'}`,{ok:false,cancelText:'Cerrar'});};
A.tzConv=el=>{const t=T0();const m=t&&t.matches.find(y=>y.id===el.dataset.m);const c=gCust(el.dataset.c);if(!m||!c)return;const tm=val('ts-tm')||m.h;
 (m.inv=m.inv||[]).filter(i=>i.cust!==c.id);m.inv=(m.inv||[]).filter(i=>i.cust!==c.id);m.inv.push({cust:c.id,tm,st:'inv',ts:now()});audit('SUPLENTE_CONVOCADO',t.name+' · '+gName(c)+' → '+tn(t,tm));save();
 const msg='Hola '+String(c.name||'').split(' ')[0]+'! A «'+tn(t,tm)+'» le falta un jugador para '+t.name+': '+tn(t,m.h)+' vs '+tn(t,m.v)+(m.fecha?' el '+DIA[new Date(m.fecha+'T12:00').getDay()]+' '+dmyS(m.fecha)+' a las '+m.hora:'')+'. ¿Podés jugar? Respondé SÍ o NO. ¡Gracias!';
 const u=typeof gWa==='function'?gWa(c,msg):waUrl(c.wa,msg);if(u)openExternal(u);else toast('El socio no tiene WhatsApp o no dio permiso para mensajes.',1);A.tzSup({dataset:{m:m.id}});};
A.tzConvR=el=>{const t=T0();const m=t&&t.matches.find(y=>y.id===el.dataset.m);const i=m&&(m.inv||[]).find(y=>y.cust===el.dataset.c);if(!i)return;i.st=el.dataset.r;i.res=now();
 if(i.st==='ok'){(m.sup=m.sup||[]).push({cust:i.cust,tm:i.tm,ts:now()});const d=TR().disp[i.cust];if(d)d.n=(d.n||0)+1;m.inv.filter(y=>y!==i&&y.st==='inv'&&y.tm===i.tm).forEach(y=>{y.st='no';y.auto=1;});toast(gName(gCust(i.cust))+' juega de suplente en '+tn(t,i.tm));}
 audit('SUPLENTE_RESPUESTA',t.name+' · '+gName(gCust(i.cust))+' · '+i.st);save();A.tzSup({dataset:{m:m.id}});};
A.tzDisp=el=>{const c=gCust(el.dataset.c);const d=TR().disp[el.dataset.c];if(!c||!d)return;modal('Disponibilidad · '+gName(c),`<label>Deportes (vacío = todos)</label><div class="row" style="flex-wrap:wrap">${Object.keys(DEP).map(k=>`<label class="chk"><input type="checkbox" class="td-s" value="${esc(k)}" ${(d.dep||[]).includes(k)?'checked':''}> ${esc(k)}</label>`).join('')}</div>
 <label>Días (vacío = todos)</label><div class="row" style="flex-wrap:wrap">${DIA.map((x,i)=>`<label class="chk"><input type="checkbox" class="td-d" value="${i}" ${(d.dias||[]).includes(i)?'checked':''}> ${x}</label>`).join('')}</div>`,{okText:'Guardar',onOk:w=>{d.dep=$$('.td-s',w).filter(i=>i.checked).map(i=>i.value);d.dias=$$('.td-d',w).filter(i=>i.checked).map(i=>+i.value);d.ts=now();audit('SUPLENTE_DISPONIBLE',gName(c)+' · '+(d.dep.join(', ')||'todos')+' · '+(d.dias.map(x=>DIA[x]).join(' ')||'todos los días'));save();rerender();}});};
/* transmisión */
A.tzStSave=()=>{const t=T0();if(!t||!isAdm())return;const pl=val('tz-pl');const srv=String(val('tz-sv')||'').trim();if(!/^rtmps?:\/\/[^\s]{4,}$/.test(srv))return toast('El servidor tiene que empezar con rtmp:// o rtmps://',1);
 const key=String(val('tz-k')||'').trim();if(key&&!/^[\w\-.?=&]{6,200}$/.test(key))return toast('La clave tiene caracteres que no van: copiala de nuevo desde la plataforma.',1);
 t.st={plat:PLAT[pl]?pl:'youtube',srv,key,canal:cleanT(val('tz-cv'),200),cal:CAL[val('tz-cal')]?val('tz-cal'):'720p'};audit('TORNEO_TRANSMISION',t.name+' · '+PLAT[t.st.plat].t+(key?' · clave cargada':'')); /* la clave no va a la auditoría */save();rerender();toast('Transmisión guardada');};
document.addEventListener('change',ev=>{if(ev.target&&ev.target.id==='tz-pl'){const s=$('#tz-sv');const p=PLAT[ev.target.value];if(s&&p&&(!s.value||Object.values(PLAT).some(x=>x.srv===s.value)))s.value=p.srv;const c=$('#tz-cv');if(c&&p)c.placeholder=p.ver;}});
A.tzVivo=el=>{const t=T0();const m=t&&t.matches.find(y=>y.id===el.dataset.m);if(!m)return;m.vivo=!m.vivo;if(m.vivo){m.st=m.st==='fin'?'fin':'vivo';if(m.ga===''||m.ga==null){m.ga='0';m.gb='0';}m.st='vivo';}else if(m.st==='vivo'){m.st=m.ga!==''&&m.gb!==''?'fin':'prog';avanzar(t);}
 audit('TORNEO_EN_VIVO',t.name+' · '+tn(t,m.h)+' vs '+tn(t,m.v)+' · '+(m.vivo?'inicio':'fin'));save();rerender();};
A.tzCopiar=async()=>{const t=T0();if(!t)return;let txt='🏆 *'+t.name+'* · '+S.tenant.name+'\n';if(t.fmt==='elim')txt+=t.matches.filter(m=>m.st==='fin'&&!m.bye).map(m=>m.fase+': '+tn(t,m.h)+' '+m.ga+' - '+m.gb+' '+tn(t,m.v)).join('\n');
 else{const gs=t.fmt==='grupos'?Object.keys(grupoDe(t)).sort():[''];gs.forEach(g=>{txt+=(g?'\n*Grupo '+g+'*\n':'')+tabla(t,g).map((x,i)=>(i+1)+'. '+x.eq+' — '+x.pts+' pts ('+x.pj+' PJ, DIF '+(x.dg>0?'+':'')+x.dg+')').join('\n')+'\n';});}
 txt+='\nTabla en vivo: '+pubUrl(t);try{await navigator.clipboard.writeText(txt);toast('Tabla copiada');}catch(e){modal('Tabla',`<textarea rows="12" readonly>${esc(txt)}</textarea>`,{ok:false,cancelText:'Cerrar'});}};
A.tzPub=()=>{const t=T0();if(t)openExternal(pubUrl(t));};

/* ---------- página pública (#torneo/<id>) y marcador para la transmisión (#marcador/<torneo>[/<partido>]) ----------
   Nunca muestra teléfonos, pagos ni la clave de transmisión. Se actualiza sola cada 4 segundos. */
let pubT=null;
function pubHTML(t){const vivo=t.matches.filter(m=>m.vivo);const ver=verUrl(t.st||{});const P0=proximos(t,8);const res=t.matches.filter(m=>m.st==='fin'&&!m.bye).slice(-8).reverse();
 const tb=g=>`<table data-nosort><thead><tr><th>#</th><th>Equipo</th><th>PJ</th><th>DIF</th><th>Pts</th></tr></thead><tbody>${tabla(t,g).map((x,i)=>`<tr><td>${i+1}</td><td><b>${esc(x.eq)}</b></td><td>${x.pj}</td><td>${x.dg>0?'+':''}${x.dg}</td><td><b>${x.pts}</b></td></tr>`).join('')}</tbody></table>`;
 const pm=m=>`<div style="display:flex;justify-content:space-between;gap:.5rem;padding:.45rem 0;border-bottom:1px solid #27272a"><span>${esc(tn(t,m.h))}</span><b>${m.ga!==''&&m.ga!=null?esc(m.ga)+' - '+esc(m.gb):(m.fecha?dmyS(m.fecha)+' '+esc(m.hora):'vs')}</b><span style="text-align:right">${esc(tn(t,m.v))}</span></div>`;
 return`<div class="w"><div style="display:flex;justify-content:space-between;align-items:center;gap:.5rem"><div><div style="opacity:.7;font-size:.85rem">${esc(S.tenant.name)} · ${esc(t.sport)}</div><h1>🏆 ${esc(t.name)}</h1></div><button onclick="location.hash='#menu'" style="background:#27272a;color:#fff;border:0;border-radius:10px;padding:.5rem .8rem">Cerrar</button></div>
 ${vivo.length?`<div class="card"><div style="display:flex;gap:.5rem;align-items:center"><span class="tz-live">EN VIVO</span><b>${vivo.map(m=>esc(tn(t,m.h))+' '+esc(m.ga)+' - '+esc(m.gb)+' '+esc(tn(t,m.v))).join(' · ')}</b></div>${ver?`<iframe src="${esc(ver)}" title="Transmisión en vivo" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen style="margin-top:.6rem"></iframe>`:''}</div>`:''}
 ${t.fmt==='elim'?`<div class="card"><h3>Llaves</h3>${res.map(pm).join('')}${P0.map(pm).join('')}</div>`:t.fmt==='grupos'?Object.keys(grupoDe(t)).sort().map(g=>`<div class="card"><h3>Grupo ${esc(g)}</h3>${tb(g)}</div>`).join(''):`<div class="card"><h3>Posiciones</h3>${tb('')}</div>`}
 ${P0.length?`<div class="card"><h3>Próximos partidos</h3>${P0.map(pm).join('')}</div>`:''}${res.length?`<div class="card"><h3>Últimos resultados</h3>${res.map(pm).join('')}</div>`:''}
 <p style="opacity:.55;font-size:.8rem;text-align:center;margin:1.2rem 0">Actualiza solo · Sistema Vincular Business</p></div>`;}
function marcHTML(t,mid){const m=t.matches.find(x=>x.id===mid)||t.matches.find(x=>x.vivo)||proximos(t,1)[0];if(!m)return'';
 return`<div class="sb"><div class="t">${esc(tn(t,m.h))}<small>${esc(t.name)}</small></div><div class="s">${m.ga!==''&&m.ga!=null?esc(m.ga)+' - '+esc(m.gb):'vs'}</div><div class="t" style="text-align:right">${esc(tn(t,m.v))}<small>${esc(m.fase)}</small></div>${m.vivo?'<div class="tg">● EN VIVO</div>':''}</div>`;}
function pubRuta(){const h=location.hash||'';const a=/^#torneo\/([\w-]+)$/.exec(h),b=/^#marcador\/([\w-]+)(?:\/([\w-]+))?$/.exec(h);let ov=document.getElementById('tz-pub');
 if(!a&&!b){if(ov){ov.remove();document.documentElement.style.background='';document.body.style.background='';}clearInterval(pubT);pubT=null;return;}
 migrar();const t=tByid((a||b)[1]);if(!ov){ov=document.createElement('div');ov.id='tz-pub';document.body.appendChild(ov);}
 const paint=()=>{const tt=tByid((a||b)[1]);
  if(!tt){ov.className='';ov.innerHTML='<div class="w"><h1>Torneo no encontrado</h1><p>Revisá el enlace.</p></div>';return;}
  if(b){ov.className='marc';ov.innerHTML=marcHTML(tt,b[2]);}else{ov.className='';ov.innerHTML=pubHTML(tt);}};
 paint();clearInterval(pubT);pubT=setInterval(paint,4000);}
window.addEventListener('hashchange',pubRuta);setTimeout(pubRuta,600);
/* las ventanas del marcador y de la página pública en este mismo equipo reciben cada resultado al instante */
let tzBC=null;try{tzBC=new BroadcastChannel('vb-torneos');tzBC.onmessage=ev=>{const d=ev.data;if(!d||!Array.isArray(d.trn))return;const p=TR();const loc=new Map(p.trn.map(x=>[x.id,x]));p.trn=d.trn.map(x=>{const l=loc.get(x.id);if(l&&l.st)x.st=l.st;return x;});if(Array.isArray(d.courts))p.courts=d.courts;};}catch(e){}
if(typeof save==='function'){const _sv=save;save=function(){const r=_sv.apply(this,arguments);try{if(tzBC&&!document.getElementById('tz-pub'))tzBC.postMessage({trn:JSON.parse(JSON.stringify(TR().trn.map(t=>Object.assign({},t,{st:{plat:(t.st||{}).plat,canal:(t.st||{}).canal}})))),courts:TR().courts.map(c=>({id:c.id,name:c.name}))});}catch(e){}return r;};}

/* ---------- datos de ejemplo ---------- */
let seedN=0;function seedT(){const p=TR();migrar();if(p.trnSeed||!on('gtorneos'))return;if(on('gcanchas')&&!p.courts.length&&seedN++<6){setTimeout(seedT,1500);return;}p.trnSeed=1;const M=gMembers();if(M.length<12){save();return;}let s=11;const R=()=>{s=(s*9301+49297)%233280;return s/233280;};
 const C=p.courts;const f5=C.filter(c=>/f[uú]tbol/i.test(c.sport||'')).map(c=>c.id),pd=C.filter(c=>/p[aá]del/i.test(c.sport||'')).map(c=>c.id);
 /* liga de fútbol 5 con 8 equipos, 2 fechas jugadas, uno en espera */
 let t=p.trn.find(x=>x.old);if(t){t.teams=[];t.matches=[];}else{t=nuevo({name:'Torneo Apertura Fútbol 5',sport:'Fútbol 5',fmt:'liga'});p.trn.push(t);}
 const names=['Los Pibes','La Banda','Oficina Norte','Club Amigos','Equipo Rojo','Profes FC','Atlético Barrio','Real Fulbito'];let k=0;
 if(!t.teams.length)names.forEach((n,i)=>{const jug=[];for(let j=0;j<5;j++){const c=M[(k++)%M.length];jug.push({name:gName(c),cust:c.id});}t.teams.push({id:uid(),name:n,cap:jug[0].cust,tel:'',capName:'',jug,st:'confirmado',pago:{st:i===5?'pendiente':'pagado',met:i%2?'Transferencia':'Caja',ref:i%2?'TRF '+(4400+i):'',ts:now()},ts:now()-864e5*(10-i)});});
 t.teams.push({id:uid(),name:'Los Suplentes',cap:'',tel:'3874001122',capName:'Nico R.',jug:[{name:'Nico R.',cust:''}],st:'espera',pago:{st:'pendiente'},ts:now()});
 Object.assign(t,{cupo:8,fee:3500000,ini:addDays(gT(),-14),hora:'20:00',dur:60,canchas:f5.slice(0,2),estado:'inscripcion'});t.matches=[];generar(t);
 t.matches.filter(m=>m.r<2).forEach(m=>{m.ga=String(Math.floor(R()*5));m.gb=String(Math.floor(R()*4));m.st='fin';const H=team(t,m.h),V=team(t,m.v);for(let g=0;g<+m.ga;g++)m.ev.push({tm:H.id,j:H.jug[Math.floor(R()*H.jug.length)].name,n:1});for(let g=0;g<+m.gb;g++)m.ev.push({tm:V.id,j:V.jug[Math.floor(R()*V.jug.length)].name,n:1});});
 const nx=proximos(t,1)[0];if(nx){nx.fecha=gT();nx.hora='21:00';turno(t,nx);}
 /* pádel por eliminación directa con 8 parejas */
 const t2=nuevo({name:'Copa Pádel Primavera',sport:'Pádel',fmt:'elim'});Object.assign(t2,{cupo:8,fee:2000000,ini:addDays(gT(),2),hora:'18:00',dur:90,canchas:pd.slice(0,1),jmin:2,jmax:3});
 ['Ríos / Paz','Gómez / Sosa','Luna / Vera','Díaz / Molina','Ruiz / Benítez','Castro / Ortiz','Herrera / Rojas','Flores / Acosta'].forEach((n,i)=>{const a=M[(k++)%M.length],b=M[(k++)%M.length];t2.teams.push({id:uid(),name:n,cap:a.id,tel:'',capName:'',jug:[{name:gName(a),cust:a.id},{name:gName(b),cust:b.id}],st:i<7?'confirmado':'pendiente',pago:{st:i<7?'pagado':'pendiente',met:'Mercado Pago',ts:now()},ts:now()-i*36e5});});
 p.trn.push(t2);t2.teams[7].st='confirmado';t2.teams[7].pago={st:'pagado',met:'Efectivo',ts:now()};generar(t2);
 /* disponibles para suplir */
 Array.from({length:Math.min(22,M.length)},(_,i)=>M[(k+i)%M.length]).forEach((c,i)=>{p.disp[c.id]={on:true,dep:i%4===0?['Pádel']:i%4===1?['Fútbol 5']:[],dias:i%3===2?[1,3,5]:[],n:i%4,ts:now()};});
 save();}
const _boot=window.gProBoot;window.gProBoot=function(){const r=_boot&&_boot.apply(this,arguments);try{seedT();}catch(e){console.warn('torneos',e);}return r;};setTimeout(()=>{try{seedT();}catch(e){}},2500);
window.tzDebug={TR,generar,tabla,candidatos,playoffs,verUrl,larix,seedT};
})();}
