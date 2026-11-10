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
const kk=q=>q.lat.toFixed(5)+","+q.lng.toFixed(5);
function tt(a,b){const i=idx[kk(a)],j=idx[kk(b)];if(R&&i!==undefined&&j!==undefined&&R.min[i][j]!=null)return R.min[i][j];return E.hav(a,b)*p.detourFacteur/p.vitesse*60}
function mer(lat,lng,z){const n=256*Math.pow(2,z),r=Math.PI/180;return {x:(lng+180)/360*n,y:(1-Math.log(Math.tan(lat*r)+1/Math.cos(lat*r))/Math.PI)/2*n}}

/* ---------- État ---------- */
const COMMUNES=D.COMMUNES.map(c=>c.n).sort((a,b)=>a.localeCompare(b,"fr"));
const st={etape:1,commune:null,dep:null,quit:null,jour:0,dir:"matin",sel:0,garde:null,vous:null,match:null,best:null};
try{const s=JSON.parse(sessionStorage.getItem("tc_parcours")||"null");
 if(s&&COMMUNES.includes(s.commune)&&Number.isInteger(s.dep)&&s.dep>=330&&s.dep<=720&&Number.isInteger(s.quit)&&s.quit>=720&&s.quit<=1200){st.commune=s.commune;st.dep=s.dep;st.quit=s.quit;st.etape=4}
 else if(s&&COMMUNES.includes(s.commune)){st.commune=s.commune}}catch(_){}
function sauve(){try{sessionStorage.setItem("tc_parcours",JSON.stringify({commune:st.commune,dep:st.dep,quit:st.quit}))}catch(_){}}

/* ---------- Calcul de la proposition ---------- */
function domicileFictif(nom){const c=D.COMMUNES.find(x=>x.n===nom);const loc=pop.filter(x=>x.commune===nom);const liste=loc.length?loc:pop;let best=liste[0];for(const x of liste)if(E.hav(x.home,c)<E.hav(best.home,c))best=x;return {home:best.home,exact:loc.length>0}}
function calcule(){
 const c=D.COMMUNES.find(x=>x.n===st.commune),d=domicileFictif(st.commune);
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
   trips.forEach(t=>{const key=t.day+t.dir;if(out.has(key))return;if(t.dir==="matin"?Math.abs(monHoraire(t).quand-st.dep)>10:Math.abs(t.ev.depart-st.quit)>10)return;out.set(key,t)});
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

/* ---------- Carte ---------- */
/* Fenêtre fixe (420 x 340) : la carte garde la même hauteur quelle que soit la distance. Les tracés suivent les routes (tronçons OSRM précalculés,
   route-legs.js + route-legs2.js) ; sans tronçon précalculé, trait pointillé indicatif. */
function trace(t){
 const seq=t.ev.pts.map(q=>idx[kk(q)]);const legs=[];for(let q=0;q<seq.length-1;q++)legs.push(seq[q]!==undefined&&seq[q]===seq[q+1]?[]:L[seq[q]+">"+seq[q+1]]);
 const complet=legs.length>0&&legs.every(Boolean);
 const geo=complet?[].concat(...legs).map(q=>({lat:q[1],lng:q[0]})):t.ev.pts;
 return {geo,complet};
}
function pointA(geo,fr){ /* point situé à la fraction fr de la longueur du tracé */
 if(geo.length<2)return geo[0];let tot=0;const d=[];for(let i=1;i<geo.length;i++){const l=E.hav(geo[i-1],geo[i]);d.push(l);tot+=l}
 let x=tot*fr;for(let i=0;i<d.length;i++){if(x<=d[i]||i===d.length-1){const u=d[i]?Math.min(1,x/d[i]):0;return {lat:geo[i].lat+(geo[i+1].lat-geo[i].lat)*u,lng:geo[i].lng+(geo[i+1].lng-geo[i].lng)*u}}x-=d[i]}
 return geo[geo.length-1];
}
function carte(opts){
 const VW=420,VH=340,PAD=34;
 const trips=opts.options.map(o=>o.t),sel=opts.sel;
 const tr=opts.options.map(o=>trace(o.t));
 const pts=trips.length?tr.flatMap(x=>x.geo):[...pop.map(x=>x.home)];
 const all=[D.SITE,...pts];if(st.vous)all.push(st.vous.home);
 let z=15,mn,mx;
 for(;z>=8;z--){const m=all.map(q=>mer(q.lat,q.lng,z));mn={x:Math.min(...m.map(a=>a.x)),y:Math.min(...m.map(a=>a.y))};mx={x:Math.max(...m.map(a=>a.x)),y:Math.max(...m.map(a=>a.y))};if(mx.x-mn.x<=VW-2*PAD&&mx.y-mn.y<=VH-2*PAD)break}
 const cx=(mn.x+mx.x)/2,cy=(mn.y+mx.y)/2,ox=cx-VW/2,oy=cy-VH/2;
 const P=q=>{const m=mer(q.lat,q.lng,z);return {x:m.x-ox,y:m.y-oy}};
 const svg=sv("svg",{class:"carte-svg pc-svg",viewBox:"0 0 "+VW+" "+VH,role:"img","aria-label":trips.length?"Carte Plan IGN : votre point de départ, le site d'arrivée et les trajets proposés par la route, numérotés comme les cartes horaires":"Carte Plan IGN : le site d'arrivée et les domiciles fictifs"});
 svg.append(sv("rect",{x:0,y:0,width:VW,height:VH,fill:"#efe6d6"}));
 const tx0=Math.floor(ox/256),tx1=Math.floor((ox+VW)/256),ty0=Math.floor(oy/256),ty1=Math.floor((oy+VH)/256);
 for(let i=tx0;i<=tx1;i++)for(let j=ty0;j<=ty1;j++)svg.append(sv("image",{href:"https://data.geopf.fr/wmts?SERVICE=WMTS&VERSION=1.0.0&REQUEST=GetTile&LAYER=GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2&STYLE=normal&FORMAT=image/png&TILEMATRIXSET=PM_0_19&TILEMATRIX="+z+"&TILEROW="+j+"&TILECOL="+i,x:i*256-ox,y:j*256-oy,width:256,height:256,opacity:".9"}));
 svg.addEventListener("error",e=>{if(e.target&&e.target.tagName==="image"){const n=root.querySelector("#pc-tuiles");if(n)n.hidden=false}},true);
 if(!trips.length)pop.forEach(x=>{const a=P(x.home);svg.append(sv("circle",{cx:a.x,cy:a.y,r:4,fill:x.aVoiture?"#6b1d2c":"#b9802f","fill-opacity":".6",stroke:"#3e0f19","stroke-width":1}))});
 const ordre=opts.options.map((o,i)=>i).filter(i=>opts.options[i].t!==sel);if(sel)ordre.push(opts.options.findIndex(o=>o.t===sel));
 const nums=[];
 ordre.forEach(i=>{const o=opts.options[i],t=o.t,c=col[i%col.length],faint=t!==sel,{geo,complet}=tr[i];
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

/* ---------- Interface ---------- */
let focus=null,boot=true;
function puces(liste,actuel,choisit,cls){return h("div",{class:"pc-grille "+(cls||""),role:"group"},liste.map(v=>h("button",{type:"button",class:"pc-puce"+(v.val===actuel?" actif":""),"aria-pressed":String(v.val===actuel),onclick:()=>choisit(v.val),text:v.txt})))}
function recap(){
 const r=h("div",{class:"pc-recap"});
 const it=(t,e)=>h("button",{type:"button",class:"pc-etiq",onclick:()=>{st.etape=e;rend()},"aria-label":"Modifier : "+t},t," ",h("span",{"aria-hidden":"true",text:"✎"}));
 if(st.commune&&st.etape>1)r.append(it(st.commune,1));
 if(st.dep!=null&&st.etape>2)r.append(it("Départ "+hm(st.dep),2));
 if(st.quit!=null&&st.etape>3)r.append(it("Retour "+hm(st.quit),3));
 return r.children.length?r:null;
}
function etapes(){
 const n=st.etape;
 const titres=["Où habitez-vous ?","À quelle heure partez-vous de chez vous le matin ?","À quelle heure quittez-vous le travail le soir ?"];
 const aides=["Choisissez votre commune. Aucune adresse n'est demandée : la démonstration couvre "+COMMUNES.length+" communes autour du site d'arrivée.","Heure à laquelle vous quittez votre domicile pour aller travailler. Les propositions restent à 10 minutes maximum de cette heure.","Heure à laquelle vous quittez le travail pour rentrer. Les propositions restent à 10 minutes maximum de cette heure."];
 const t=h("h2",{id:"pc-titre",tabindex:"-1",text:titres[n-1]});focus=t;
 const card=h("div",{class:"carte pc-carte"},
  h("div",{class:"pc-prog","aria-label":"Étape "+n+" sur 3"},[1,2,3].map(i=>h("i",{class:i<=n?"on":""}))),
  h("p",{class:"surtitre",text:"Étape "+n+" sur 3"}),t,h("p",{class:"doux",text:aides[n-1]}));
 const rc=recap();if(rc)card.append(rc);
 if(n===1)card.append(puces(COMMUNES.map(c=>({val:c,txt:c})),st.commune,c=>{st.commune=c;st.etape=2;sauve();rend()},"pc-communes"));
 if(n===2){const l=[];for(let m=390;m<=540;m+=15)l.push({val:m,txt:hm(m)});card.append(puces(l,st.dep,v=>{st.dep=v;st.etape=3;sauve();rend()},"pc-heures"))}
 if(n===3){const l=[];for(let m=960;m<=1170;m+=15)l.push({val:m,txt:hm(m)});card.append(puces(l,st.quit,v=>{st.quit=v;st.etape=4;sauve();calcule();rend()},"pc-heures"))}
 if(n>1)card.append(h("div",{class:"barre-outils"},h("button",{type:"button",onclick:()=>{st.etape=n-1;rend()},text:"Retour"})));
 return card;
}
function resultat(){
 const o=st.options,sel=o[st.sel]?o[st.sel].t:null;
 const card=h("div",{class:"carte pc-carte"});
 const titre=h("h2",{id:"pc-titre",tabindex:"-1",text:st.best?"Votre proposition de covoiturage":"Pas de proposition avec ces horaires"});focus=titre;
 card.append(h("p",{class:"surtitre",text:"Démonstration · profils fictifs"}),titre);
 const rc=h("div",{class:"pc-recap"},
  h("button",{type:"button",class:"pc-etiq",onclick:()=>{st.etape=1;rend()},"aria-label":"Modifier mes réponses"},st.commune+" · départ "+hm(st.dep)+" · retour "+hm(st.quit)+" ",h("span",{"aria-hidden":"true",text:"✎"})));
 card.append(rc);
 if(!st.best){
  card.append(h("p",{text:"Aucun des "+pop.length+" profils fictifs n'a un trajet compatible avec vos horaires (détour maximal "+p.maxDetourKm+" km, "+p.maxExtraMin+" min en plus). Aucun trajet n'est promis."}),h("p",{class:"doux",text:"Essayez de décaler l'heure de départ ou de retour."}),h("div",{class:"barre-outils"},h("button",{type:"button",class:"actif",onclick:()=>{st.etape=2;rend()},text:"Changer mes horaires"})));
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
 if(st.etape<4){
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
 wrap.append(h("div",{class:"sim",role:"note"},"Démonstration : 28 profils inventés, aucun compte, aucun vrai collègue, rien n'est envoyé ni réservé. "+(st.vous?"Vous êtes supposé flexible (conducteur ou passager selon le trajet) ; "+st.nbPartenaires+" profils sur "+pop.length+" ont au moins un trajet compatible avec vos horaires. Votre point de départ est un domicile fictif de "+st.commune+(st.exact?"":" (le plus proche, cette commune n'en compte pas dans le jeu)")+", pour utiliser les durées routières précalculées. La carte indique votre heure de départ (matin) ou de départ du travail (soir) ; les numéros renvoient aux cartes horaires. Les tracés suivent les routes (calcul OSRM précalculé, sans trafic : les durées sont des estimations hors circulation). Pointillé : tracé indicatif quand un tronçon n'est pas disponible. ":"")+"Fond Plan IGN : votre navigateur envoie votre adresse IP et la zone affichée au serveur de tuiles IGN."));
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
