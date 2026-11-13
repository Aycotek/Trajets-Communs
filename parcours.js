/* Parcours d'arrivée : commune, heure de départ le matin, heure de départ du travail le soir, puis proposition sur la carte.
   DÉMONSTRATION : les 28 profils sont fictifs, aucun compte, aucune donnée envoyée. Le point de départ de la personne est un domicile fictif de sa commune
   (pour utiliser les durées routières précalculées). Le moteur (engine.js) plafonne à 0 les détours et minutes négatifs AFFICHÉS : avec de vraies routes OSRM (optimisées en temps), la route directe peut être plus longue en km que la route via l'arrêt. */
(function(){
"use strict";
const D=window.TCDATA,E=window.TCENGINE,R=window.TCROUTE,L=Object.assign({},window.TCLEGS||{},window.TCLEGS2||{});
const root=document.getElementById("vue-parcours");
if(!root||!D||!E)return;
const p=E.defaults(),pop=E.population(28,2026);
const JN=["lundi","mardi","mercredi","jeudi","vendredi"];
const svgNS="http://www.w3.org/2000/svg";
/* Règles de proposition (seuils VALIDÉS par Arthur le 13 nov. 2026 ; textes publics à revoir avant publication) : le trajet habituel du conducteur passe à moins de CERCLE_KM
   du point de prise en charge et le trajet n'ajoute pas plus de MAXMIN_CONDUCTEUR minutes de route au conducteur, arrêt compris. */
const CERCLE_KM=2,MAXMIN_CONDUCTEUR=8;
function h(tag,attrs,...kids){const e=document.createElement(tag);if(attrs)for(const k in attrs){if(k==="class")e.className=attrs[k];else if(k.startsWith("on"))e.addEventListener(k.slice(2),attrs[k]);else if(k==="text")e.textContent=attrs[k];else e.setAttribute(k,attrs[k])}kids.flat().forEach(c=>{if(c==null)return;e.append(c.nodeType?c:document.createTextNode(String(c)))});return e}
function sv(tag,attrs,...kids){const e=document.createElementNS(svgNS,tag);if(attrs)for(const k in attrs)e.setAttribute(k,attrs[k]);kids.flat().forEach(c=>{if(c==null)return;e.append(c.nodeType?c:document.createTextNode(String(c)))});return e}
const f1=x=>(Math.round(x*10)/10).toLocaleString("fr-FR",{minimumFractionDigits:1,maximumFractionDigits:1});
const hm=E.hm;
const idx={};if(R)R.pts.forEach((q,i)=>{idx[q[0].toFixed(5)+","+q[1].toFixed(5)]=i});
const kk=q=>q.lat.toFixed(5)+","+q.lng.toFixed(5);
function tt(a,b){const i=idx[kk(a)],j=idx[kk(b)];if(R&&i!==undefined&&j!==undefined&&R.min[i][j]!=null)return R.min[i][j];return E.hav(a,b)*p.detourFacteur/p.vitesse*60}
function mer(lat,lng,z){const n=256*Math.pow(2,z),r=Math.PI/180;return {x:(lng+180)/360*n,y:(1-Math.log(Math.tan(lat*r)+1/Math.cos(lat*r))/Math.PI)/2*n}}

/* ---------- État ---------- */
const COMMUNES=D.COMMUNES.map(c=>c.n).sort((a,b)=>a.localeCompare(b,"fr"));
const st={adr:null,matP:null,geoP:null,geoVous:undefined,calc:false,erreur:null,etape:1,commune:null,dep:null,quit:null,jour:0,dir:"matin",sel:0,garde:null,vous:null,match:null,best:null,nonVerifies:0};
const lieu=()=>st.adr?st.adr.label:st.commune;
try{const s=JSON.parse(sessionStorage.getItem("tc_parcours")||"null");
 if(s&&COMMUNES.includes(s.commune)&&Number.isInteger(s.dep)&&s.dep>=330&&s.dep<=720&&Number.isInteger(s.quit)&&s.quit>=720&&s.quit<=1200){st.commune=s.commune;st.dep=s.dep;st.quit=s.quit;st.etape=4}
 else if(s&&COMMUNES.includes(s.commune)){st.commune=s.commune}}catch(_){}
function sauve(){if(st.adr)return;try{sessionStorage.setItem("tc_parcours",JSON.stringify({commune:st.commune,dep:st.dep,quit:st.quit}))}catch(_){}}

/* ---------- Géométrie des trajets habituels et mesures ---------- */
/* Le trajet habituel domicile -> site d'un point fictif est précalculé dans TCROUTE.routes (géométrie OSRM).
   Pour une adresse réelle, sa géométrie est récupérée à la demande (voir ajouteDomicile) ; si elle est
   indisponible, la proximité ne peut pas être vérifiée et le trajet n'est pas proposé. */
function geoPre(c){if(!R||!R.routes)return null;const i=idx[kk(c)];const g=i!==undefined?R.routes[String(i)]:null;return g?g.map(q=>({lat:q[1],lng:q[0]})):null}
function proxPtGeo(pt,geo){if(!geo||!geo.length)return null;let m=Infinity;for(const q of geo){const d=E.hav(pt,q);if(d<m)m=d}return m}
function geoConducteur(t){if(t.drv.id==="VOUS")return st.adr?(st.geoVous===undefined?null:st.geoVous):geoPre(st.vous.home);return geoPre(t.drv.home)}
/* Minutes réellement ajoutées au conducteur : durée du trajet avec arrêt(s) (2 min par arrêt, déjà dans ev.dur) moins sa durée habituelle, même direction. */
function drvExtraMin(t){const hab=t.dir==="matin"?tt(t.drv.home,D.SITE):tt(D.SITE,t.drv.home);return Math.max(0,t.ev.dur-hab)} /* toutes les durées viennent de la matrice OSRM réelle ; une valeur négative (route directe la plus rapide mais pas la plus courte en temps, arrêt inclus) s'affiche 0, jamais négative */
/* Distance minimale entre le point de prise en charge et la géométrie du trajet habituel du conducteur ; null si non vérifiable. */
function proxTrajet(t){const geo=geoConducteur(t);if(!geo)return null;const ptPrise=x=>x.mode==="gare"&&x.gare?x.gare:x.home;const pts=t.drv.id==="VOUS"?t.pax.map(ptPrise):[st.vous.home];let m=0;for(const pt of pts){const d=proxPtGeo(pt,geo);if(d==null)return null;if(d>m)m=d}return m}

/* ---------- Calcul de la proposition ---------- */
function domicileFictif(nom){const c=D.COMMUNES.find(x=>x.n===nom);const loc=pop.filter(x=>x.commune===nom);const liste=loc.length?loc:pop;let best=liste[0];for(const x of liste)if(E.hav(x.home,c)<E.hav(best.home,c))best=x;return {home:best.home,exact:loc.length>0}}
function calcule(){
 const c=st.adr?{n:st.adr.label}:D.COMMUNES.find(x=>x.n===st.commune),d=st.adr?{home:{lat:+st.adr.lat.toFixed(5),lng:+st.adr.lng.toFixed(5)},exact:!st.adr.commune}:domicileFictif(st.commune);
 const solo=tt(d.home,D.SITE);
 st.vous={id:"VOUS",nom:"Vous",commune:c.n,home:d.home,role:"flexible",aVoiture:true,mode:"domicile",gare:null,adresse:st.adr?st.adr.label:"",jours:null};
 st.exact=d.exact;st.arr=st.dep+solo;
 /* Le moteur raisonne en heure d'arrivée au site. On cherche donc, pour chaque personne et chaque jour, l'arrivée qui donne EXACTEMENT votre heure de départ
    (domicile le matin, travail le soir) : on corrige l'arrivée visée tant que votre heure de départ calculée s'écarte de celle saisie. Écart final accepté : 10 min au plus. */
 function tripsPour(y){
  const out=new Map();
  for(const o of [0,-5,5,-10,10]){
   const T=st.dep+o,Q=st.quit+o,A=[0,1,2,3,4].map(()=>Math.round(T+solo));let trips=[];
   for(let k=0;k<5;k++){
    st.vous.jours=A.map(a=>({present:true,a0:a,a1:a,d0:Q,d1:Q}));
    trips=E.match([st.vous,y],p).trips;let ch=false;
    trips.filter(t=>t.dir==="matin").forEach(t=>{const dd=Math.round(T-monHoraire(t).quand);if(dd!==0&&Math.abs(dd)<=20){A[t.day]+=dd;ch=true}});
    if(!ch)break;
   }
   trips.forEach(t=>{const key=t.day+t.dir;if(out.has(key))return;if(t.dir==="matin"?Math.abs(monHoraire(t).quand-st.dep)>10:Math.abs(t.ev.depart-st.quit)>10)return;out.set(key,t)});
  }
  return [...out.values()];
 }
 st.match=pop.map(y=>({y,trips:tripsPour(y),ok:[],n:0,extra:0,prox:0}));
 st.nonVerifies=0;
 /* Deux portes par trajet : minutes ajoutées au conducteur plafonnées, passage à moins de CERCLE_KM du point de prise en charge.
    Proximité non vérifiable (tracé habituel indisponible) : le trajet est exclu et l'exclusion est comptée, sans exception silencieuse. */
 st.match.forEach(m=>{m.trips.forEach(t=>{t._extra=drvExtraMin(t);t._prox=proxTrajet(t);
  if(t._prox==null){if(t._extra<=MAXMIN_CONDUCTEUR)st.nonVerifies++;return}
  if(t._extra>MAXMIN_CONDUCTEUR||t._prox>CERCLE_KM)return;
  m.ok.push(t);m.n++;m.extra+=t._extra;m.prox+=t._prox})});
 const ok=st.match.filter(m=>m.n>0).sort((a,b)=>b.n-a.n||a.extra/a.n-b.extra/b.n||a.prox/a.n-b.prox/b.n);
 st.best=ok.length?ok[0]:null;st.nbPartenaires=ok.length;
 st.jour=0;st.dir="matin";st.sel=0;st.garde=null;
 majOptions();
}
function majOptions(){
 const o=[];
 st.match.forEach(m=>{const t=m.ok.find(t=>t.day===st.jour&&t.dir===st.dir);if(t)o.push({t,m,reco:st.best===m})});
 o.sort((a,b)=>(b.reco-a.reco)||a.t._extra-b.t._extra||a.t._prox-b.t._prox);
 st.options=o.slice(0,4);
}
function monHoraire(t){
 const moi=t.drv.id==="VOUS";
 if(moi)return {conduit:true,quand:t.ev.depart};
 const k=t.ev.order.findIndex(x=>x.id==="VOUS")+1;let s=t.ev.depart;
 for(let j=0;j<k;j++)s+=tt(t.ev.pts[j],t.ev.pts[j+1]);
 return {conduit:false,quand:s+2*(k-1)};
}
const nomCourt=y=>y.nom.replace("Profil ","");
const col=["#6b1d2c","#2d5a8a","#2f6b3f","#8a2a8a"];

/* ---------- Carte ---------- */
/* Fenêtre fixe (420 x 340) : seul le trajet sélectionné est dessiné et cadré (marge 46 px). Son tracé suit les routes réelles :
   tronçons OSRM précalculés (route-legs.js + route-legs2.js), géométrie récupérée à la demande pour les tronçons manquants
   (limite 1 requête/1,1 s, cache de session, pointillé indicatif en cas d'échec, re-rendu à l'arrivée). */
const geoCache=new Map(); /* clé "lat,lng>lat,lng" -> géométrie [{lat,lng}], null (échec) ou undefined (en cours) */
async function cherchLeg(a,b,key){
 try{const j=await osrm("/route/v1/driving/"+a.lng.toFixed(5)+","+a.lat.toFixed(5)+";"+b.lng.toFixed(5)+","+b.lat.toFixed(5)+"?overview=full&geometries=geojson");
  geoCache.set(key,j.routes[0].geometry.coordinates.map(q=>({lat:q[1],lng:q[0]})))}catch(e){geoCache.set(key,null)}
 if(st.etape===4&&!st.calc&&!st.erreur)rend(true);
}
function trace(t,demander){
 const seq=t.ev.pts.map(q=>idx[kk(q)]);const legs=[];
 for(let q=0;q<t.ev.pts.length-1;q++){
  const a=t.ev.pts[q],b=t.ev.pts[q+1];
  if(seq[q]!==undefined&&seq[q]===seq[q+1]){legs.push([]);continue}
  const pre=seq[q]!==undefined&&seq[q+1]!==undefined?L[seq[q]+">"+seq[q+1]]:null;
  if(pre){legs.push(pre);continue}
  const key=kk(a)+">"+kk(b);
  if(geoCache.has(key)){const g=geoCache.get(key);legs.push(g===undefined?null:g)}
  else{legs.push(null);if(demander){geoCache.set(key,undefined);cherchLeg(a,b,key)}}
 }
 const complet=legs.length>0&&legs.every(x=>x!==null);
 const geo=complet?[].concat(...legs).map(q=>Array.isArray(q)?{lat:q[1],lng:q[0]}:q):t.ev.pts;
 return {geo,complet};
}
function pointA(geo,fr){ /* point situé à la fraction fr de la longueur du tracé */
 if(geo.length<2)return geo[0];let tot=0;const d=[];for(let i=1;i<geo.length;i++){const l=E.hav(geo[i-1],geo[i]);d.push(l);tot+=l}
 let x=tot*fr;for(let i=0;i<d.length;i++){if(x<=d[i]||i===d.length-1){const u=d[i]?Math.min(1,x/d[i]):0;return {lat:geo[i].lat+(geo[i+1].lat-geo[i].lat)*u,lng:geo[i].lng+(geo[i+1].lng-geo[i].lng)*u}}x-=d[i]}
 return geo[geo.length-1];
}
function carte(opts){
 const VW=420,VH=340;
 const trips=opts.options.map(o=>o.t),sel=opts.sel;
 const montrer=sel?opts.options.filter(o=>o.t===sel):opts.options;
 const tr=montrer.map(o=>trace(o.t,!!sel));
 const PAD=sel?46:34;
 const pts=montrer.length?tr.flatMap(x=>x.geo):[...pop.map(x=>x.home)];
 const all=[D.SITE,...pts];if(st.vous)all.push(st.vous.home);
 let z=15,mn,mx;
 for(;z>=8;z--){const m=all.map(q=>mer(q.lat,q.lng,z));mn={x:Math.min(...m.map(a=>a.x)),y:Math.min(...m.map(a=>a.y))};mx={x:Math.max(...m.map(a=>a.x)),y:Math.max(...m.map(a=>a.y))};if(mx.x-mn.x<=VW-2*PAD&&mx.y-mn.y<=VH-2*PAD)break}
 const cx=(mn.x+mx.x)/2,cy=(mn.y+mx.y)/2,ox=cx-VW/2,oy=cy-VH/2;
 const P=q=>{const m=mer(q.lat,q.lng,z);return {x:m.x-ox,y:m.y-oy}};
 const svg=sv("svg",{class:"carte-svg pc-svg",viewBox:"0 0 "+VW+" "+VH,role:"img","aria-label":sel?"Carte Plan IGN : le trajet sélectionné, tracé selon les routes réelles ; les autres options se choisissent par les cartes horaires sous la carte":(montrer.length?"Carte Plan IGN : votre point de départ, le site d'arrivée et les trajets proposés par la route, numérotés comme les cartes horaires":"Carte Plan IGN : le site d'arrivée et les domiciles fictifs")});
 svg.append(sv("rect",{x:0,y:0,width:VW,height:VH,fill:"#efe6d6"}));
 const tx0=Math.floor(ox/256),tx1=Math.floor((ox+VW)/256),ty0=Math.floor(oy/256),ty1=Math.floor((oy+VH)/256);
 for(let i=tx0;i<=tx1;i++)for(let j=ty0;j<=ty1;j++)svg.append(sv("image",{href:"https://data.geopf.fr/wmts?SERVICE=WMTS&VERSION=1.0.0&REQUEST=GetTile&LAYER=GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2&STYLE=normal&FORMAT=image/png&TILEMATRIXSET=PM_0_19&TILEMATRIX="+z+"&TILEROW="+j+"&TILECOL="+i,x:i*256-ox,y:j*256-oy,width:256,height:256,opacity:".9"}));
 svg.addEventListener("error",e=>{if(e.target&&e.target.tagName==="image"){const n=root.querySelector("#pc-tuiles");if(n)n.hidden=false}},true);
 if(!montrer.length)pop.forEach(x=>{const a=P(x.home);svg.append(sv("circle",{cx:a.x,cy:a.y,r:4,fill:x.aVoiture?"#6b1d2c":"#b9802f","fill-opacity":".6",stroke:"#3e0f19","stroke-width":1}))});
 const nums=[];
 montrer.forEach((o,k)=>{const i=opts.options.indexOf(o),t=o.t,c=col[i%col.length],faint=t!==sel,{geo,complet}=tr[k];
  const path=geo.map(q=>{const a=P(q);return a.x.toFixed(1)+","+a.y.toFixed(1)}).join(" ");
  svg.append(sv("polyline",{points:path,fill:"none",stroke:"#fff","stroke-width":faint?5:9,"stroke-linejoin":"round","stroke-linecap":"round","stroke-opacity":faint?".6":".95"}));
  const l=sv("polyline",{points:path,fill:"none",stroke:c,"stroke-width":faint?2.4:5,"stroke-linejoin":"round","stroke-linecap":"round","stroke-dasharray":complet?"":"9 6","stroke-opacity":faint?".75":"1",class:"trace"});
  l.addEventListener("click",()=>{st.sel=i;rend(true)});svg.append(l);
  t.pax.forEach(x=>{if(faint)return;const a=P(x.home);svg.append(sv("circle",{cx:a.x,cy:a.y,r:6,fill:"#fff",stroke:c,"stroke-width":3}))});
  nums.push([i,c,faint,pointA(geo,.28+.16*i)]);
 });
 /* repères : site, vous */
 const s0=P(D.SITE),va=st.vous?P(st.vous.home):null,mat=st.dir==="matin",so=sel?opts.options.find(o=>o.t===sel):null;
 const poses=[];
 function pastille(a,txt,fill,dy){const fs=13,w=txt.length*7.9+18,hh=22;const x=Math.max(3,Math.min(VW-w-3,a.x-w/2));
  const ok=y=>y>=3&&y<=VH-hh-3&&!poses.some(q=>x<q[0]+q[2]+4&&q[0]<x+w+4&&y<q[1]+hh+4&&q[1]<y+hh+4);
  let y=a.y+dy;if(!ok(y)){const alt=[a.y-hh-16,a.y+16,a.y-hh-42,a.y+42].find(ok);if(alt!==undefined)y=alt}
  y=Math.max(3,Math.min(VH-hh-3,y));poses.push([x,y,w]);
  const g=sv("g",{class:"pc-pastille"});g.append(sv("rect",{x,y,width:w,height:hh,rx:11,fill,stroke:"#fff","stroke-width":2}),sv("text",{x:x+w/2,y:y+hh*.7,"text-anchor":"middle","font-size":fs,"font-weight":"700",fill:"#fff"},txt));return g}
 /* numéros des options, au-dessus des tracés */
 nums.forEach(([i,c,faint,a])=>{const g=sv("g",{class:"trace",opacity:faint?".92":"1"});const p=P(a);
  g.append(sv("circle",{cx:p.x,cy:p.y,r:faint?10:12,fill:c,stroke:"#fff","stroke-width":2.5}),sv("text",{x:p.x,y:p.y+(faint?4:4.8),"text-anchor":"middle","font-size":faint?12:14,"font-weight":"700",fill:"#fff"},String(i+1)),sv("title",null,"Option "+(i+1)+" : voir ce trajet"));
  g.addEventListener("click",()=>{st.sel=i;rend(true)});svg.append(g)});
 svg.append(sv("polygon",{points:[[s0.x,s0.y-13],[s0.x+11,s0.y+7],[s0.x-11,s0.y+7]].map(q=>q.join(",")).join(" "),fill:"#3e0f19",stroke:"#fff","stroke-width":2.5}));
 if(st.vous){svg.append(sv("circle",{cx:va.x,cy:va.y,r:13,fill:"#e3b765","fill-opacity":".4",stroke:"#8f5f16","stroke-width":1.5}),sv("circle",{cx:va.x,cy:va.y,r:7,fill:"#e3b765",stroke:"#3e0f19","stroke-width":2.5}))}
 const proche=va&&Math.hypot(s0.x-va.x,s0.y-va.y)<70,dS=proche?-40:(s0.y>VH/2?-40:18),dV=proche?16:(va&&va.y>s0.y?16:-38);
 if(so&&st.vous){const mh=monHoraire(so.t);
  svg.append(pastille(s0,mat?"Arrivée "+hm(so.t.ev.arrive):"Départ du travail "+hm(so.t.ev.depart),"#3e0f19",dS));
  svg.append(pastille(va,mat?"Vous : départ "+hm(mh.quand):"Chez vous ~"+hm(mh.conduit?so.t.ev.arrive:mh.quand),"#8f5f16",dV));
 }else{svg.append(pastille(s0,"Site d'arrivée","#3e0f19",dS));if(st.vous)svg.append(pastille(va,"Vous","#8f5f16",dV))}
 svg.append(sv("text",{x:VW-4,y:VH-4,"font-size":9,"text-anchor":"end",fill:"#333",stroke:"#fff","stroke-width":2.5,"paint-order":"stroke"},"© IGN · Plan IGN · Licence Ouverte"));
 return svg;
}

/* ---------- Adresse précise (au choix) ---------- */
/* Recherche d'adresse : IGN Géoplateforme (data.geopf.fr/geocodage). Durées : OSRM serveur public (router.project-osrm.org), profil voiture, sans trafic.
   L'adresse n'est ni enregistrée ni stockée par cette page (sessionStorage ignoré quand une adresse est choisie). Les services tiers peuvent tenir leurs propres journaux. Limite OSRM public : 1 requête par seconde. */
const OSRM="https://router.project-osrm.org";
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
let derniere=0;
async function osrm(path){const d=Date.now()-derniere;if(d<1100)await sleep(1100-d);derniere=Date.now();const r=await fetch(OSRM+path);if(!r.ok)throw new Error("OSRM "+r.status);const j=await r.json();if(j.code!=="Ok")throw new Error("OSRM "+j.code);return j}
function oublieDomicile(){const base=R&&R.nBase;if(!base)return;for(const k of Object.keys(idx))if(idx[k]>=base)delete idx[k];R.pts.length=base;R.km.length=base;R.min.length=base;for(let i=0;i<base;i++){R.km[i].length=base;R.min[i].length=base}}
async function ajouteDomicile(a){
 if(!R)throw new Error("Source routière absente");
 if(!R.nBase)R.nBase=R.pts.length;oublieDomicile();
 st.geoVous=undefined;
 const base=R.nBase,co=[[a.lng,a.lat],...R.pts.map(q=>[q[1],q[0]])].map(q=>q[0].toFixed(5)+","+q[1].toFixed(5)).join(";");
 const idsAll=Array.from({length:base},(_,i)=>i+1).join(";");
 const aller=await osrm("/table/v1/driving/"+co+"?sources=0&destinations="+idsAll+"&annotations=duration,distance");
 const retour=await osrm("/table/v1/driving/"+co+"?sources="+idsAll+"&destinations=0&annotations=duration,distance");
 /* Géométrie du trajet habituel depuis cette adresse : récupérée à la demande, non bloquante en cas d'échec
    (les options « vous conduisez » sont alors exclues, faute de proximité vérifiable, et l'exclusion est affichée). */
 st.geoP=osrm("/route/v1/driving/"+a.lng.toFixed(5)+","+a.lat.toFixed(5)+";"+D.SITE.lng.toFixed(5)+","+D.SITE.lat.toFixed(5)+"?overview=full&geometries=geojson").then(j=>j.routes[0].geometry.coordinates.map(q=>({lat:q[1],lng:q[0]}))).catch(()=>null);
 const n=base,rowM=[],rowK=[];
 for(let j=0;j<base;j++){const m=aller.durations[0][j],k=aller.distances[0][j];if(m==null||k==null)throw new Error("Adresse non reliée au réseau routier");rowM.push(m/60);rowK.push(k/1000)}
 for(let i=0;i<base;i++){const m=retour.durations[i][0],k=retour.distances[i][0];if(m==null||k==null)throw new Error("Adresse non reliée au réseau routier");R.min[i][n]=m/60;R.km[i][n]=k/1000}
 rowM.push(0);rowK.push(0);R.min.push(rowM);R.km.push(rowK);R.pts.push([+a.lat.toFixed(5),+a.lng.toFixed(5)]);
 idx[a.lat.toFixed(5)+","+a.lng.toFixed(5)]=n;
}
async function lance(){
 st.erreur=null;
 if(!st.adr){calcule();rend();return}
 st.calc=true;rend();
 try{await (st.matP||ajouteDomicile(st.adr));st.geoVous=st.geoP?await st.geoP:null;st.calc=false;calcule()}catch(e){st.calc=false;st.erreur="Les durées routières depuis cette adresse n'ont pas pu être calculées ("+(e&&e.message||"erreur")+"). Aucune proposition n'est affichée plutôt qu'une estimation approximative."}
 rend();
}
function adresseUI(){
 const w=h("div",{class:"pc-adr"});
 const inp=h("input",{id:"pc-adr-in",type:"text",autocomplete:"off",enterkeyhint:"search",placeholder:"ex. Tourville-la-Rivière ou 12 rue de la République, Rouen","aria-label":"Votre adresse exacte ou votre commune"});
 const liste=h("div",{class:"pc-sugg",role:"group","aria-label":"Adresses suggérées"}),msg=h("p",{class:"doux",role:"status"});
 let tm,seq=0;
 inp.addEventListener("input",()=>{clearTimeout(tm);const q=inp.value.trim();liste.replaceChildren();msg.textContent="";if(q.length<5)return;
  tm=setTimeout(async()=>{const my=++seq;try{const r=await fetch("https://data.geopf.fr/geocodage/completion/?type=StreetAddress&maximumResponses=8&text="+encodeURIComponent(q));const j=await r.json();if(my!==seq)return;
   const res=j.results||[],ok=res.filter(x=>x.kind==="housenumber"),villes=res.filter(x=>x.kind==="municipality");
   liste.replaceChildren(...ok.slice(0,6).map(x=>h("button",{type:"button",class:"pc-puce pc-sug",onclick:()=>{st.adr={lat:x.y,lng:x.x,label:x.fulltext};st.commune=null;st.erreur=null;st.etape=2;st.matP=ajouteDomicile(st.adr);st.matP.catch(()=>{});rend()},text:x.fulltext})),
    ...villes.slice(0,3).map(x=>h("button",{type:"button",class:"pc-puce pc-sug",onclick:()=>{st.adr={lat:x.y,lng:x.x,label:x.city,commune:true};st.commune=null;st.erreur=null;st.etape=2;st.matP=ajouteDomicile(st.adr);st.matP.catch(()=>{});rend()},text:"Commune : "+x.city+(x.zipcode?" ("+x.zipcode+")":"")+", centre de la commune"})));
   if(!ok.length&&!villes.length)msg.textContent=res.length?"Ajoutez le numéro de la rue pour un point exact, ou le nom de votre commune seule.":"Aucune adresse ni commune trouvée."}catch(e){msg.textContent="La recherche d'adresse est indisponible pour le moment."}},350)});
 w.append(inp,liste,msg,h("details",{class:"pc-secours pc-conf"},h("summary",{text:"Détails : services utilisés et journaux"}),h("p",{class:"note-limite",text:"Confidentialité : ce que vous tapez est envoyé au service d'adresses de l'IGN (Géoplateforme), puis les coordonnées de l'adresse choisie au serveur d'itinéraires public OSRM, pour calculer les durées. Cette page ne stocke pas l'adresse et ne la met pas dans la session sauvegardée ; le navigateur (historique, saisie automatique) et ces services peuvent garder leurs propres traces."})));
 return w;
}
function attente(){
 if(st.calc)return h("div",{class:"carte pc-carte"},h("h2",{text:"Calcul des durées routières…"}),h("p",{class:"doux",role:"status",text:"Itinéraires depuis votre adresse vers les 28 profils fictifs et le site. Quelques secondes : le service public limite le rythme des demandes."}));
 return h("div",{class:"carte pc-carte"},h("h2",{text:"Pas de proposition"}),h("p",{role:"alert",text:st.erreur}),h("div",{class:"barre-outils"},h("button",{type:"button",class:"actif",onclick:()=>{st.erreur=null;st.etape=1;rend()},text:"Changer d'adresse"})));
}

/* ---------- Interface ---------- */
let focus=null,boot=true;
function puces(liste,actuel,choisit,cls){return h("div",{class:"pc-grille "+(cls||""),role:"group"},liste.map(v=>h("button",{type:"button",class:"pc-puce"+(v.val===actuel?" actif":""),"aria-pressed":String(v.val===actuel),onclick:()=>choisit(v.val),text:v.txt})))}
function recap(){
 const r=h("div",{class:"pc-recap"});
 const it=(t,e)=>h("button",{type:"button",class:"pc-etiq",onclick:()=>{st.etape=e;rend()},"aria-label":"Modifier : "+t},t," ",h("span",{"aria-hidden":"true",text:"✎"}));
 if(lieu()&&st.etape>1)r.append(it(st.adr?(st.adr.commune?st.adr.label+" (centre de la commune)":"Adresse choisie"):st.commune,1));
 if(st.dep!=null&&st.etape>2)r.append(it("Départ "+hm(st.dep),2));
 if(st.quit!=null&&st.etape>3)r.append(it("Retour "+hm(st.quit),3));
 return r.children.length?r:null;
}
function etapes(){
 const n=st.etape;
 const titres=["Où habitez-vous ?","À quelle heure partez-vous de chez vous le matin ?","À quelle heure quittez-vous le travail le soir ?"];
 const aides=["Adresse exacte ou commune, au choix. L'adresse ou la commune tapée part au service d'adresses de l'IGN, puis ses coordonnées au serveur d'itinéraires OSRM ; cette page ne la stocke pas. Avec une adresse, le départ est le point exact ; avec une commune, c'est le centre de la commune, une position approximative.","Heure à laquelle vous quittez votre domicile pour aller travailler. Les propositions restent à 10 minutes maximum de cette heure.","Heure à laquelle vous quittez le travail pour rentrer. Les propositions restent à 10 minutes maximum de cette heure."];
 const t=h("h2",{id:"pc-titre",tabindex:"-1",text:titres[n-1]});focus=t;
 const card=h("div",{class:"carte pc-carte"},
  h("div",{class:"pc-prog","aria-label":"Étape "+n+" sur 3"},[1,2,3].map(i=>h("i",{class:i<=n?"on":""}))),
  h("p",{class:"surtitre",text:"Étape "+n+" sur 3"}),t,h("p",{class:"doux",text:aides[n-1]}));
 const rc=recap();if(rc)card.append(rc);
 if(n===1)card.append(adresseUI());
 if(n===2){const l=[];for(let m=390;m<=540;m+=15)l.push({val:m,txt:hm(m)});card.append(puces(l,st.dep,v=>{st.dep=v;st.etape=3;sauve();rend()},"pc-heures"))}
 if(n===3){const l=[];for(let m=960;m<=1170;m+=15)l.push({val:m,txt:hm(m)});card.append(puces(l,st.quit,v=>{st.quit=v;st.etape=4;sauve();lance()},"pc-heures"))}
 if(n>1)card.append(h("div",{class:"barre-outils"},h("button",{type:"button",onclick:()=>{st.etape=n-1;rend()},text:"Retour"})));
 return card;
}
function resultat(){
 const o=st.options,sel=o[st.sel]?o[st.sel].t:null;
 const card=h("div",{class:"carte pc-carte"});
 const titre=h("h2",{id:"pc-titre",tabindex:"-1",text:st.best?"Votre proposition de covoiturage":"Pas de proposition avec ces horaires"});focus=titre;
 card.append(titre);
 const rc=h("div",{class:"pc-recap"},
  h("button",{type:"button",class:"pc-etiq",onclick:()=>{st.etape=1;rend()},"aria-label":"Modifier mes réponses"},(st.adr?(st.adr.commune?st.adr.label+" (centre de la commune)":"Adresse choisie"):st.commune)+" · départ "+hm(st.dep)+" · retour "+hm(st.quit)+" ",h("span",{"aria-hidden":"true",text:"✎"})));
 card.append(rc);
 if(!st.best){
  card.append(h("p",{text:"Aucun des "+pop.length+" profils fictifs n'a un trajet compatible avec vos horaires et raisonnable pour celui qui roule : propositions limitées aux trajets dont le conducteur passe à moins de "+CERCLE_KM+" km du point de prise en charge et qui n'ajoutent pas plus de "+MAXMIN_CONDUCTEUR+" min de route, arrêt compris (15 min en plus maximum pour un passager). Un trajet dont la proximité ne peut pas être vérifiée, faute de tracé habituel disponible, n'est pas proposé."+(st.nonVerifies>0?" "+st.nonVerifies+" trajet(s) compatible(s) avec vos horaires écarté(s) pour cette raison.":"")+" Aucun trajet n'est promis."}),h("p",{class:"doux",text:"Essayez de décaler l'heure de départ ou de retour."}),h("div",{class:"barre-outils"},h("button",{type:"button",class:"actif",onclick:()=>{st.etape=2;rend()},text:"Changer mes horaires"})));
  return card;
 }
 const y=st.best.y;
 card.append(h("p",{class:"pc-reco"},h("b",{text:y.nom+" · "+y.commune}),h("span",{class:"doux",text:" (fictif) · compatible "+st.best.n+" trajet"+(st.best.n>1?"s":"")+" sur 10 cette semaine (5 matins, 5 soirs)"})));
 const sens=h("div",{class:"seg-sens",role:"group","aria-label":"Sens du trajet"});
 [["matin","Matin : vers le site"],["soir","Soir : retour"]].forEach(([d,t])=>sens.append(h("button",{type:"button",class:d===st.dir?"actif":"","aria-pressed":String(d===st.dir),onclick:()=>{st.dir=d;st.sel=0;majOptions();rend()},text:t})));
 card.append(sens);
 return card;
}
function railOptions(){
 const rail=h("div",{class:"rail-trajets",role:"group","aria-label":"Trajets proposés pour ce jour, avec les horaires"});
 st.options.forEach((o,i)=>{const t=o.t,mh=monHoraire(t),on=i===st.sel;
  const b=h("button",{type:"button",class:"horaire"+(on?" actif":""),"aria-pressed":String(on),onclick:()=>{st.sel=i;rend(true)}},
   h("b",null,h("span",{class:"pc-num","aria-hidden":"true",text:String(i+1)}),(st.dir==="matin"?"Départ ":"Départ du site ")+hm(st.dir==="matin"?mh.quand:t.ev.depart)),h("span",{text:(st.dir==="matin"?"arrivée "+hm(t.ev.arrive):"chez vous ~"+hm(mh.conduit?t.ev.arrive:mh.quand))+" · "+nomCourt(o.m.y)}),h("span",{text:mh.conduit?"vous conduisez":"vous êtes passager"}),h("span",{class:"pc-min",text:"+"+Math.round(t._extra)+" min de route "+(mh.conduit?"pour vous":"pour le conducteur")}),o.reco?h("span",{class:"pc-reco-etiq",text:"Recommandé"}):null);
  b.style.setProperty("--c",col[i%col.length]);rail.append(b)});
 return rail;
}
function detail(){
 const o=st.options[st.sel];
 const box=h("div",{class:"carte-detail pc-detail",id:"pc-detail"});
 if(!o){box.append(h("p",{text:"Aucun trajet compatible "+JN[st.jour]+" "+(st.dir==="matin"?"matin":"soir")+" dans ce jeu fictif. Choisissez un autre jour."}));return box}
 const t=o.t,mh=monHoraire(t),y=o.m.y;
 const jr=JN[st.jour][0].toUpperCase()+JN[st.jour].slice(1);
 box.append(h("h3",{text:jr+(st.dir==="matin"?" matin":" soir")+" avec "+y.nom+" · "+y.commune}));
 const lignes=[];
 if(st.dir==="matin"){
  lignes.push(mh.conduit?"Vous conduisez : départ de chez vous à "+hm(t.ev.depart)+(t.pax.length?", vous prenez "+t.pax.map(x=>x.nom).join(" et ")+" en chemin":"")+".":"Vous êtes pris en charge près de chez vous vers "+hm(mh.quand)+" par "+t.drv.nom+", dont le départ est à "+hm(t.ev.depart)+".");
  lignes.push("Vous aviez indiqué "+hm(st.dep)+" : écart de "+Math.round(Math.abs(mh.quand-st.dep))+" min.");
  lignes.push("Arrivée au site à "+hm(t.ev.arrive)+".");
 }else{
  lignes.push("Départ du travail à "+hm(t.ev.depart)+(mh.conduit?", vous conduisez.":", avec "+t.drv.nom+" au volant.")+" Vous aviez indiqué "+hm(st.quit)+" : écart de "+Math.round(Math.abs(t.ev.depart-st.quit))+" min.");
  lignes.push(mh.conduit?"Retour chez vous vers "+hm(t.ev.arrive)+".":"Vous êtes déposé près de chez vous vers "+hm(mh.quand)+".");
 }
 lignes.push("Trajet du conducteur : "+f1(t.ev.km)+" km, soit +"+Math.round(t._extra)+" min de plus que "+(mh.conduit?"votre":"son")+" trajet habituel, arrêt compris.");
 lignes.push(mh.conduit?"Vous passez à "+f1(t._prox)+" km de son point de prise en charge.":"Son trajet habituel passe à "+f1(t._prox)+" km de votre point de départ.");
 lignes.forEach(l=>box.append(h("p",{text:l})));
 const cle=st.jour+st.dir+o.m.y.id;
 if(st.garde===cle)box.append(h("p",{class:"sim",role:"status",text:"Proposition gardée pour cette session de démonstration. Dans un vrai service, l'autre personne recevrait votre demande et devrait accepter ; ici rien n'est envoyé, réservé ni payé."}));
 else box.append(h("div",{class:"barre-outils"},h("button",{type:"button",class:"actif",onclick:()=>{st.garde=cle;rend(true)},text:"Garder cette proposition (simulation)"})));
 return box;
}
function jours(){
 const bar=h("div",{class:"seg-jours",role:"group","aria-label":"Jour de la semaine"});
 ["Lun","Mar","Mer","Jeu","Ven"].forEach((j,i)=>bar.append(h("button",{type:"button",class:i===st.jour?"actif":"","aria-pressed":String(i===st.jour),onclick:()=>{st.jour=i;st.sel=0;majOptions();rend(true)},text:j})));
 return bar;
}
function rend(garderPos){
 const y0=window.scrollY;
 root.replaceChildren();
 const wrap=h("div",{class:"pc"});
 if(st.etape<4){
  wrap.append(etapes());
  wrap.append(h("div",{class:"carte pc-carte-zone"},h("div",{class:"carte-zone"},carte({options:[],sel:null}))));
 }else if(st.calc||st.erreur){
  wrap.append(attente());
 }else{
  wrap.append(resultat());
  if(st.best){
   const cz=h("div",{class:"carte pc-carte-zone"});
   cz.append(jours(),h("div",{class:"carte-zone"},carte({options:st.options,sel:st.options[st.sel]?st.options[st.sel].t:null})),railOptions(),detail());
   wrap.append(cz);
   const liste=h("ol",{class:"liste-carte"},st.options.map(o=>{const mh=monHoraire(o.t);return h("li",null,h("b",{text:o.m.y.nom}),(" : "+(st.dir==="matin"?"votre départ "+hm(mh.quand)+", arrivée "+hm(o.t.ev.arrive):"départ du travail "+hm(o.t.ev.depart)+", chez vous vers "+hm(mh.conduit?o.t.ev.arrive:mh.quand))+", "+(mh.conduit?"vous conduisez":"vous êtes passager")+".")) }));
   wrap.append(h("details",{class:"carte"},h("summary",{text:"Version texte de la carte ("+st.options.length+" trajet(s) "+JN[st.jour]+")"}),st.options.length?liste:h("p",{class:"doux",text:"Aucun trajet ce jour et ce sens."})));
  }else wrap.append(h("div",{class:"carte pc-carte-zone"},h("div",{class:"carte-zone"},carte({options:[],sel:null}))));
 }
 wrap.append(h("p",{id:"pc-tuiles",class:"note-limite",hidden:"",text:"Le fond de carte Plan IGN n'a pas pu être chargé, ou seulement en partie. Les trajets et la version texte restent utilisables."}));
 wrap.append(h("div",{class:"sim",role:"note"},"Démonstration : 28 profils inventés, aucun compte, aucun vrai collègue, rien n'est envoyé ni réservé. "+(st.vous?"Vous êtes supposé flexible (conducteur ou passager selon le trajet) ; "+st.nbPartenaires+" profils sur "+pop.length+" ont au moins un trajet compatible avec vos horaires et ces règles. Les propositions viennent de conducteurs dont le trajet passe à moins de "+CERCLE_KM+" km du point de prise en charge et n'ajoutent pas plus de "+MAXMIN_CONDUCTEUR+" min de route au conducteur, arrêt compris. Un trajet dont la proximité ne peut pas être vérifiée, faute de tracé habituel disponible, n'est pas proposé."+(st.nonVerifies>0?" "+st.nonVerifies+" trajet(s) compatible(s) avec vos horaires écarté(s) pour cette raison.":"")+" "+(st.adr?(st.adr.commune?"Votre point de départ est le centre de "+st.adr.label+", une position approximative et non une adresse exacte ; les durées sont calculées à la demande par le serveur public OSRM, sans trafic, et le tracé du trajet sélectionné suit les routes réelles (calcul OSRM à la demande ; pointillé indicatif en cas d'échec).":"Votre point de départ est l'adresse choisie ; les durées sont calculées à la demande par le serveur public OSRM, sans trafic, et le tracé du trajet sélectionné suit les routes réelles (calcul OSRM à la demande ; pointillé indicatif en cas d'échec)."):"Votre point de départ est un domicile fictif de "+st.commune+(st.exact?"":" (le plus proche, cette commune n'en compte pas dans le jeu)")+", pour utiliser les durées routières précalculées.")+" La carte indique votre heure de départ (matin) ou de départ du travail (soir) ; les numéros renvoient aux cartes horaires. Les tracés suivent les routes (calcul OSRM précalculé, sans trafic : les durées sont des estimations hors circulation). Pointillé : tracé indicatif quand un tronçon n'est pas disponible. ":"")+"Fond Plan IGN : votre navigateur envoie votre adresse IP et la zone affichée au serveur de tuiles IGN."));
 wrap.append(h("p",{class:"doux pc-lien"},"Voir tous les trajets de la démonstration dans l'onglet ",h("button",{type:"button",class:"pc-lien-btn",onclick:()=>{const b=document.querySelector('.onglets button[data-vue="carte"]');if(b)b.click()},text:"Carte"}),"."));
 root.append(wrap);
 if(garderPos){window.scrollTo(0,y0)}
 else if(!boot&&focus){try{focus.focus()}catch(_){}}
 boot=false;
}
if(st.etape===4){try{calcule()}catch(_){st.etape=1}}
else if(st.commune)st.etape=2;
if(st.etape===4&&!st.vous)st.etape=1;
rend(true);
})();
