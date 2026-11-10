/* Parcours d'arrivée : commune, heure de départ le matin, heure de départ du travail le soir, puis proposition sur la carte.
   DÉMONSTRATION : les 28 profils sont fictifs, aucun compte, aucune donnée envoyée. Le point de départ de la personne est un domicile fictif de sa commune
   (pour utiliser les durées routières précalculées). Utilise le moteur existant (engine.js) sans le modifier. */
(function(){
"use strict";
const D=window.TCDATA,E=window.TCENGINE,R=window.TCROUTE,L=Object.assign({},window.TCLEGS||{},window.TCLEGS2||{});
const root=document.getElementById("vue-parcours");
if(!root||!D||!E)return;
const p=E.defaults(),pop=E.population(28,2026);
const JN=["lundi","mardi","mercredi","jeudi","vendredi"];
const svgNS="http://www.w3.org/2000/svg";
function h(tag,attrs,...kids){const e=document.createElement(tag);if(attrs)for(const k in attrs){if(k==="class")e.className=attrs[k];else if(k.startsWith("on"))e.addEventListener(k.slice(2),attrs[k]);else if(k==="text")e.textContent=attrs[k];else e.setAttribute(k,attrs[k])}kids.flat().forEach(c=>{if(c==null)return;e.append(c.nodeType?c:document.createTextNode(String(c)))});return e}
function sv(tag,attrs,...kids){const e=document.createElementNS(svgNS,tag);if(attrs)for(const k in attrs)e.setAttribute(k,attrs[k]);kids.flat().forEach(c=>{if(c==null)return;e.append(c.nodeType?c:document.createTextNode(String(c)))});return e}
const f1=x=>(Math.round(x*10)/10).toLocaleString("fr-FR",{minimumFractionDigits:1,maximumFractionDigits:1});
const hm=E.hm;
const idx={};if(R)R.pts.forEach((q,i)=>{idx[q[0].toFixed(5)+","+q[1].toFixed(5)]=i});
const lieu=()=>st.adr?st.adr.label:st.commune;
const kk=q=>q.lat.toFixed(5)+","+q.lng.toFixed(5);
const routeOK=pts=>!!R&&pts.every(q=>idx[kk(q)]!==undefined);
function tt(a,b){const i=idx[kk(a)],j=idx[kk(b)];if(R&&i!==undefined&&j!==undefined&&R.min[i][j]!=null)return R.min[i][j];return E.hav(a,b)*p.detourFacteur/p.vitesse*60}
function mer(lat,lng,z){const n=256*Math.pow(2,z),r=Math.PI/180;return {x:(lng+180)/360*n,y:(1-Math.log(Math.tan(lat*r)+1/Math.cos(lat*r))/Math.PI)/2*n}}

/* ---------- État ---------- */
const COMMUNES=D.COMMUNES.map(c=>c.n).sort((a,b)=>a.localeCompare(b,"fr"));
const st={adr:null,calc:false,erreur:null,etape:1,commune:null,dep:null,quit:null,jour:0,dir:"matin",sel:0,garde:null,vous:null,match:null,best:null};
try{const s=JSON.parse(sessionStorage.getItem("tc_parcours")||"null");
 if(s&&COMMUNES.includes(s.commune)&&Number.isInteger(s.dep)&&s.dep>=330&&s.dep<=720&&Number.isInteger(s.quit)&&s.quit>=720&&s.quit<=1200){st.commune=s.commune;st.dep=s.dep;st.quit=s.quit;st.etape=4}
 else if(s&&COMMUNES.includes(s.commune)){st.commune=s.commune}}catch(_){}
function sauve(){if(st.adr)return;try{sessionStorage.setItem("tc_parcours",JSON.stringify({commune:st.commune,dep:st.dep,quit:st.quit}))}catch(_){}}

/* ---------- Calcul de la proposition ---------- */
function domicileFictif(nom){const c=D.COMMUNES.find(x=>x.n===nom);const loc=pop.filter(x=>x.commune===nom);const liste=loc.length?loc:pop;let best=liste[0];for(const x of liste)if(E.hav(x.home,c)<E.hav(best.home,c))best=x;return {home:best.home,exact:loc.length>0}}
function calcule(){
 const c=st.adr?{n:st.adr.label}:D.COMMUNES.find(x=>x.n===st.commune),d=st.adr?{home:{lat:+st.adr.lat.toFixed(5),lng:+st.adr.lng.toFixed(5)},exact:true}:domicileFictif(st.commune);
 const solo=tt(d.home,D.SITE);
 st.vous={id:"VOUS",nom:"Vous",commune:c.n,home:d.home,role:"flexible",aVoiture:true,mode:"domicile",gare:null,adresse:"",jours:null};
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
   trips.forEach(t=>{const key=t.day+t.dir;if(out.has(key))return;if(!routeOK(t.ev.pts))return;if(t.dir==="matin"?Math.abs(monHoraire(t).quand-st.dep)>10:Math.abs(t.ev.depart-st.quit)>10)return;out.set(key,t)});
  }
  return [...out.values()];
 }
 st.match=pop.map(y=>({y,trips:tripsPour(y),n:0,det:0}));
 st.match.forEach(m=>{m.trips.forEach(t=>{m.n++;m.det+=t.ev.detour})});
 const ok=st.match.filter(m=>m.n>0).sort((a,b)=>b.n-a.n||a.det/a.n-b.det/b.n||E.hav(st.vous.home,a.y.home)-E.hav(st.vous.home,b.y.home));
 st.best=ok.length?ok[0]:null;st.nbPartenaires=ok.length;
 st.jour=0;st.dir="matin";st.sel=0;st.garde=null;
 majOptions();
}
function majOptions(){
 const o=[];
 st.match.forEach(m=>{const t=m.trips.find(t=>t.day===st.jour&&t.dir===st.dir);if(t)o.push({t,m,reco:st.best===m})});
 o.sort((a,b)=>(b.reco-a.reco)||a.t.ev.detour-b.t.ev.detour||E.hav(st.vous.home,a.m.y.home)-E.hav(st.vous.home,b.m.y.home));
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

/* ---------- Carte (essai Leaflet 1.9.4, BSD-2-Clause) ---------- */
/* Fond Plan IGN, tracés routiers OSRM précalculés (route-legs.js + route-legs2.js). Sans tronçon précalculé : option écartée (pas de trait direct présenté comme route). */
const pend=[];
function trace(t){
 const seq=t.ev.pts.map(q=>idx[kk(q)]);const legs=[];for(let q=0;q<seq.length-1;q++)legs.push(seq[q]!==undefined&&seq[q]===seq[q+1]?[]:L[seq[q]+">"+seq[q+1]]);
 const complet=legs.length>0&&legs.every(Boolean);
 if(!complet)for(let q=0;q<seq.length-1;q++)if(seq[q]!==undefined&&seq[q+1]!==undefined&&!legs[q]&&seq[q]!==seq[q+1])enfile(seq[q]+">"+seq[q+1]);
 return {geo:complet?[].concat(...legs).map(q=>[q[1],q[0]]):null,complet};
}
function carte(opts){
 const box=h("div",{class:"pc-leaf",role:"region","aria-label":opts.options.length?"Carte Plan IGN : votre départ, le site et les trajets proposés par la route, numérotés comme les cartes horaires":"Carte Plan IGN : le site d'arrivée"});
 pend.push(()=>{
  const LL=window.L;if(!LL){box.append(h("p",{class:"note-limite",text:"La carte n'a pas pu être chargée. La version texte reste disponible."}));return}
  const mob=LL.Browser.mobile;
  const map=LL.map(box,{zoomControl:true,attributionControl:true,dragging:!mob,tap:false,scrollWheelZoom:false,minZoom:8,maxZoom:17});
  LL.tileLayer("https://data.geopf.fr/wmts?SERVICE=WMTS&VERSION=1.0.0&REQUEST=GetTile&LAYER=GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2&STYLE=normal&FORMAT=image/png&TILEMATRIXSET=PM_0_19&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}",{maxNativeZoom:18,attribution:"© IGN · Plan IGN · Licence Ouverte · Leaflet"}).on("tileerror",()=>{const n=root.querySelector("#pc-tuiles");if(n)n.hidden=false}).addTo(map);
  const bounds=LL.latLngBounds([[D.SITE.lat,D.SITE.lng]]);if(st.vous)bounds.extend([st.vous.home.lat,st.vous.home.lng]);
  const sel=opts.sel,mat=st.dir==="matin";
  const ordre=opts.options.map((o,i)=>i).filter(i=>opts.options[i].t!==sel);if(sel)ordre.push(opts.options.findIndex(o=>o.t===sel));
  if(!opts.options.length)pop.forEach(x=>{LL.circleMarker([x.home.lat,x.home.lng],{radius:4,color:"#3e0f19",weight:1,fillColor:x.aVoiture?"#6b1d2c":"#b9802f",fillOpacity:.6}).addTo(map);bounds.extend([x.home.lat,x.home.lng])});
  let manq=0;
  ordre.forEach(i=>{const o=opts.options[i],t=o.t,c=col[i%col.length],faint=t!==sel,{geo}=trace(t);
   if(!geo){manq++;return}
   geo.forEach(q=>bounds.extend(q));
   LL.polyline(geo,{color:"#fff",weight:faint?5:9,opacity:faint?.6:.95,lineCap:"round",lineJoin:"round",interactive:false}).addTo(map);
   const pl=LL.polyline(geo,{color:c,weight:faint?3:5,opacity:faint?.8:1,lineCap:"round",lineJoin:"round"}).addTo(map);
   pl.on("click",()=>{st.sel=i;rend(true)});
   const mid=geo[Math.min(geo.length-1,Math.floor(geo.length*(.3+.15*i)))];
   const ic=LL.divIcon({className:"pc-num-map n"+(i%4)+(faint?" faint":""),html:String(i+1),iconSize:[faint?22:26,faint?22:26]});
   LL.marker(mid,{icon:ic,keyboard:true,title:"Option "+(i+1)}).on("click",()=>{st.sel=i;rend(true)}).addTo(map);
   if(!faint)t.pax.forEach(x=>LL.circleMarker([x.home.lat,x.home.lng],{radius:6,color:c,weight:3,fillColor:"#fff",fillOpacity:1}).addTo(map));
  });
  const so=sel?opts.options.find(o=>o.t===sel):null;
  LL.marker([D.SITE.lat,D.SITE.lng],{icon:LL.divIcon({className:"pc-site-map",html:"▲",iconSize:[22,22]}),interactive:false}).addTo(map).bindTooltip(so?(mat?"Arrivée "+hm(so.t.ev.arrive):"Départ du travail "+hm(so.t.ev.depart)):"Site d'arrivée",{permanent:true,direction:"top",offset:[0,-10],className:"pc-tip pc-tip-site"});
  if(st.vous){const mh=so?monHoraire(so.t):null;
   LL.circleMarker([st.vous.home.lat,st.vous.home.lng],{radius:8,color:"#3e0f19",weight:3,fillColor:"#e3b765",fillOpacity:1,interactive:false}).addTo(map).bindTooltip(so?(mat?"Vous : départ "+hm(mh.quand):"Chez vous ~"+hm(mh.conduit?so.t.ev.arrive:mh.quand)):"Vous",{permanent:true,direction:"bottom",offset:[0,10],className:"pc-tip pc-tip-vous"})}
  if(manq&&box.parentNode)box.parentNode.append(h("p",{class:"doux",role:"status",text:(enCours.size||file.length?"Tracé routier en cours de chargement pour ":"Tracé routier indisponible pour ")+manq+" option(s) : elles ne sont pas dessinées en trait droit."}));
  map.fitBounds(bounds,{padding:[34,34],maxZoom:15});
  if(mob){const b=h("button",{type:"button",class:"pc-deplace","aria-pressed":"false",onclick:()=>{const on=b.getAttribute("aria-pressed")!=="true";b.setAttribute("aria-pressed",String(on));b.textContent=on?"Déplacement activé : toucher pour libérer le défilement":"Déplacer la carte";on?map.dragging.enable():map.dragging.disable()},text:"Déplacer la carte"});box.parentNode&&box.parentNode.append(b)}
  setTimeout(()=>map.invalidateSize(),50);
 });
 return box;
}

/* ---------- Adresse précise (essai) ---------- */
/* Recherche d'adresse : IGN Géoplateforme (data.geopf.fr/geocodage). Durées et tracés : OSRM serveur public (router.project-osrm.org), profil voiture, sans trafic.
   L'adresse n'est ni enregistrée ni stockée par cette page. Les services tiers peuvent tenir leurs propres journaux. Limite OSRM public : 1 requête par seconde. */
const OSRM="https://router.project-osrm.org";
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
let derniere=0;
async function osrm(path){const d=Date.now()-derniere;if(d<1100)await sleep(1100-d);derniere=Date.now();const r=await fetch(OSRM+path);if(!r.ok)throw new Error("OSRM "+r.status);const j=await r.json();if(j.code!=="Ok")throw new Error("OSRM "+j.code);return j}
const enCours=new Set(),echecs=new Set(),file=[];let actif=false;
function oublieDomicile(){const base=R&&R.nBase;if(!base)return;for(const k of Object.keys(L)){const [i,j]=k.split(">").map(Number);if(i>=base||j>=base)delete L[k]}enCours.clear();echecs.clear();file.length=0;for(const k of Object.keys(idx))if(idx[k]>=base)delete idx[k];R.pts.length=base;R.km.length=base;R.min.length=base;for(let i=0;i<base;i++){R.km[i].length=base;R.min[i].length=base}}
async function ajouteDomicile(a){
 if(!R)throw new Error("Source routière absente");
 if(!R.nBase)R.nBase=R.pts.length;oublieDomicile();
 const base=R.nBase,co=[[a.lng,a.lat],...R.pts.map(q=>[q[1],q[0]])].map(q=>q[0].toFixed(5)+","+q[1].toFixed(5)).join(";");
 const idsAll=Array.from({length:base},(_,i)=>i+1).join(";");
 const aller=await osrm("/table/v1/driving/"+co+"?sources=0&destinations="+idsAll+"&annotations=duration,distance");
 const retour=await osrm("/table/v1/driving/"+co+"?sources="+idsAll+"&destinations=0&annotations=duration,distance");
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
 try{await (st.matP||ajouteDomicile(st.adr));st.calc=false;calcule()}catch(e){st.calc=false;st.erreur="Les durées routières depuis cette adresse n'ont pas pu être calculées ("+(e&&e.message||"erreur")+"). Aucune proposition n'est affichée plutôt qu'une estimation approximative."}
 rend();
}
function enfile(key){if(L[key]||enCours.has(key)||echecs.has(key))return;const [i,j]=key.split(">").map(Number);enCours.add(key);file.push([key,i,j]);if(!actif)boucle()}
async function boucle(){actif=true;while(file.length){const [key,i,j]=file.shift();try{const a=R.pts[i],b=R.pts[j];const r=await osrm("/route/v1/driving/"+a[1].toFixed(5)+","+a[0].toFixed(5)+";"+b[1].toFixed(5)+","+b[0].toFixed(5)+"?overview=full&geometries=geojson");L[key]=r.routes[0].geometry.coordinates.map(c=>[+c[0].toFixed(5),+c[1].toFixed(5)])}catch(e){echecs.add(key)}enCours.delete(key);if(st.etape===4&&!st.calc)rend(true)}actif=false}
function adresseUI(){
 const w=h("div",{class:"pc-adr"});
 const inp=h("input",{id:"pc-adr-in",type:"text",autocomplete:"off",enterkeyhint:"search",placeholder:"ex. 12 rue de la République, Rouen","aria-label":"Votre adresse avec le numéro"});
 const liste=h("div",{class:"pc-sugg",role:"group","aria-label":"Adresses suggérées"}),msg=h("p",{class:"doux",role:"status"});
 let tm,seq=0;
 inp.addEventListener("input",()=>{clearTimeout(tm);const q=inp.value.trim();liste.replaceChildren();msg.textContent="";if(q.length<5)return;
  tm=setTimeout(async()=>{const my=++seq;try{const r=await fetch("https://data.geopf.fr/geocodage/completion/?type=StreetAddress&maximumResponses=8&text="+encodeURIComponent(q));const j=await r.json();if(my!==seq)return;
   const ok=(j.results||[]).filter(x=>x.kind==="housenumber");
   liste.replaceChildren(...ok.slice(0,6).map(x=>h("button",{type:"button",class:"pc-puce pc-sug",onclick:()=>{st.adr={lat:x.y,lng:x.x,label:x.fulltext};st.commune=null;st.etape=2;st.matP=ajouteDomicile(st.adr);st.matP.catch(()=>{});rend()},text:x.fulltext})));
   if(!ok.length)msg.textContent=(j.results||[]).length?"Ajoutez le numéro de la rue pour un point exact.":"Aucune adresse trouvée."}catch(e){msg.textContent="La recherche d'adresse est indisponible pour le moment."}},350)});
 w.append(inp,liste,msg,h("p",{class:"note-limite",text:"Confidentialité : ce que vous tapez est envoyé au service d'adresses de l'IGN, puis les coordonnées de l'adresse choisie au serveur d'itinéraires public OSRM. Cette page ne l'enregistre pas ; ces services peuvent garder leurs propres journaux."}));
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
 if(lieu()&&st.etape>1)r.append(it(st.adr?"Adresse choisie":st.commune,1));
 if(st.dep!=null&&st.etape>2)r.append(it("Départ "+hm(st.dep),2));
 if(st.quit!=null&&st.etape>3)r.append(it("Retour "+hm(st.quit),3));
 return r.children.length?r:null;
}
function etapes(){
 const n=st.etape;
 const titres=["Quelle est votre adresse ?","À quelle heure partez-vous de chez vous le matin ?","À quelle heure quittez-vous le travail le soir ?"];
 const aides=["Tapez votre adresse avec le numéro, puis choisissez-la dans la liste. Les autres personnes de la démonstration restent fictives.","Heure à laquelle vous quittez votre domicile pour aller travailler. Les propositions restent à 10 minutes maximum de cette heure.","Heure à laquelle vous quittez le travail pour rentrer. Les propositions restent à 10 minutes maximum de cette heure."];
 const t=h("h2",{id:"pc-titre",tabindex:"-1",text:titres[n-1]});focus=t;
 const card=h("div",{class:"carte pc-carte"},
  h("div",{class:"pc-prog","aria-label":"Étape "+n+" sur 3"},[1,2,3].map(i=>h("i",{class:i<=n?"on":""}))),
  h("p",{class:"surtitre",text:"Étape "+n+" sur 3"}),t,h("p",{class:"doux",text:aides[n-1]}));
 const rc=recap();if(rc)card.append(rc);
 if(n===1){card.append(adresseUI());card.append(h("details",{class:"pc-secours"},h("summary",{text:"Sans adresse : choisir une commune (domicile fictif)"}),puces(COMMUNES.map(c=>({val:c,txt:c})),st.commune,c=>{st.adr=null;st.commune=c;st.etape=2;sauve();rend()},"pc-communes")))}
 if(n===2){const l=[];for(let m=390;m<=540;m+=15)l.push({val:m,txt:hm(m)});card.append(puces(l,st.dep,v=>{st.dep=v;st.etape=3;sauve();rend()},"pc-heures"))}
 if(n===3){const l=[];for(let m=960;m<=1170;m+=15)l.push({val:m,txt:hm(m)});card.append(puces(l,st.quit,v=>{st.quit=v;st.etape=4;sauve();lance()},"pc-heures"))}
 if(n>1)card.append(h("div",{class:"barre-outils"},h("button",{type:"button",onclick:()=>{st.etape=n-1;rend()},text:"Retour"})));
 return card;
}
function resultat(){
 const o=st.options,sel=o[st.sel]?o[st.sel].t:null;
 const card=h("div",{class:"carte pc-carte"});
 const titre=h("h2",{id:"pc-titre",tabindex:"-1",text:st.best?"Votre proposition de covoiturage":"Pas de proposition avec ces horaires"});focus=titre;
 card.append(h("p",{class:"surtitre",text:"Démonstration · profils fictifs"}),titre);
 const rc=h("div",{class:"pc-recap"},
  h("button",{type:"button",class:"pc-etiq",onclick:()=>{st.etape=1;rend()},"aria-label":"Modifier mes réponses"},lieu()+" · départ "+hm(st.dep)+" · retour "+hm(st.quit)+" ",h("span",{"aria-hidden":"true",text:"✎"})));
 card.append(rc);
 if(!st.best){
  card.append(h("p",{text:!R?"Source routière absente : durées routières indisponibles, aucune proposition n'est affichée.":"Aucun des "+pop.length+" profils fictifs n'a un trajet compatible avec vos horaires (détour maximal "+p.maxDetourKm+" km, "+p.maxExtraMin+" min en plus). Aucun trajet n'est promis."}),h("p",{class:"doux",text:"Essayez de décaler l'heure de départ ou de retour."}),h("div",{class:"barre-outils"},h("button",{type:"button",class:"actif",onclick:()=>{st.etape=2;rend()},text:"Changer mes horaires"})));
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
   h("b",null,h("span",{class:"pc-num","aria-hidden":"true",text:String(i+1)}),(st.dir==="matin"?"Départ ":"Départ du site ")+hm(st.dir==="matin"?mh.quand:t.ev.depart)),h("span",{text:(st.dir==="matin"?"arrivée "+hm(t.ev.arrive):"chez vous ~"+hm(mh.conduit?t.ev.arrive:mh.quand))+" · "+nomCourt(o.m.y)}),h("span",{text:mh.conduit?"vous conduisez":"vous êtes passager"}),o.reco?h("span",{class:"pc-reco-etiq",text:"Recommandé"}):null);
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
 lignes.push("Trajet du conducteur : "+f1(t.ev.km)+" km"+(t.ev.detour>0.05?", dont "+f1(t.ev.detour)+" km de détour "+(mh.conduit?"pour prendre "+(t.pax.map(x=>x.nom).join(" et ")||"votre passager"):"pour vous prendre"):"")+".");
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
 if(st.etape===4&&(st.calc||st.erreur)){wrap.append(attente())}
 else if(st.etape<4){
  wrap.append(etapes());
  wrap.append(h("div",{class:"carte pc-carte-zone"},h("div",{class:"carte-zone"},carte({options:[],sel:null}))));
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
 wrap.append(h("div",{class:"sim",role:"note"},"Démonstration : 28 profils inventés, aucun compte, aucun vrai collègue, rien n'est envoyé ni réservé. "+(st.vous?"Vous êtes supposé flexible (conducteur ou passager selon le trajet) ; "+st.nbPartenaires+" profils sur "+pop.length+" ont au moins un trajet compatible avec vos horaires. "+(st.adr?"Votre point de départ est l'adresse choisie ; durées et tracés calculés par OSRM (serveur public, sans trafic). ":"Votre point de départ est un domicile fictif de "+st.commune+(st.exact?"":" (le plus proche, cette commune n'en compte pas dans le jeu)")+", pour utiliser les durées routières précalculées. ")+"La carte indique votre heure de départ (matin) ou de départ du travail (soir) ; les numéros renvoient aux cartes horaires. Les tracés suivent les routes (calcul OSRM précalculé, sans trafic : les durées sont des estimations hors circulation). Pointillé : tracé indicatif quand un tronçon n'est pas disponible. ":"")+"Fond Plan IGN : votre navigateur envoie votre adresse IP et la zone affichée au serveur de tuiles IGN."));
 wrap.append(h("p",{class:"doux pc-lien"},"Voir tous les trajets de la démonstration dans l'onglet ",h("button",{type:"button",class:"pc-lien-btn",onclick:()=>{const b=document.querySelector('.onglets button[data-vue="carte"]');if(b)b.click()},text:"Carte"}),"."));
 root.append(wrap);
 while(pend.length)pend.shift()();
 if(garderPos){window.scrollTo(0,y0)}
 else if(!boot&&focus){try{focus.focus()}catch(_){}}
 boot=false;
}
if(st.etape===4){try{calcule()}catch(_){st.etape=1}}
else if(st.commune)st.etape=2;
if(st.etape===4&&!st.vous)st.etape=1;
rend(true);
})();
