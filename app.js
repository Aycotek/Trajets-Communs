(function(){
"use strict";
const D=window.TCDATA,E=window.TCENGINE;
const S={p:E.defaults(),pop:E.population(28,2026),day:0,dir:"matin",avant:90,regleId:"capture",viewer:"dg",profil:"P01",scen:"conforme",res:null,bil:null,carteJour:0,carteDir:"matin",recur:{},alea:null,carteDz:0,moved:null};
const $=s=>document.querySelector(s);
function h(tag,attrs,...kids){const e=document.createElement(tag);if(attrs)for(const k in attrs){if(k==="class")e.className=attrs[k];else if(k.startsWith("on"))e.addEventListener(k.slice(2),attrs[k]);else if(k==="text")e.textContent=attrs[k];else e.setAttribute(k,attrs[k])}
 kids.flat().forEach(c=>{if(c==null||c===false)return;e.append(c.nodeType?c:document.createTextNode(String(c)))});return e}
const svgNS="http://www.w3.org/2000/svg";
function sv(tag,attrs,...kids){const e=document.createElementNS(svgNS,tag);if(attrs)for(const k in attrs)e.setAttribute(k,attrs[k]);kids.flat().forEach(c=>{if(c==null)return;e.append(c.nodeType?c:document.createTextNode(String(c)))});return e}
const f1=x=>(Math.round(x*10)/10).toLocaleString("fr-FR",{minimumFractionDigits:1,maximumFractionDigits:1});
const f0=x=>Math.round(x).toLocaleString("fr-FR");
const eur=x=>(x<0?"−":"")+Math.abs(x).toLocaleString("fr-FR",{minimumFractionDigits:0,maximumFractionDigits:0})+" €";
const eur2=x=>(x<0?"−":"")+Math.abs(x).toLocaleString("fr-FR",{minimumFractionDigits:2,maximumFractionDigits:2})+" €";
const kg=x=>(x<0?"−":"")+f1(Math.abs(x))+" kg";
const byId=id=>S.pop.find(x=>x.id===id);

try{S.dec=JSON.parse(sessionStorage.getItem("tc_dec")||"{}");S.recur=JSON.parse(sessionStorage.getItem("tc_rec")||"{}");S.out=JSON.parse(sessionStorage.getItem("tc_out")||"{}")}catch(_){S.dec={};S.recur={};S.out={}}
S.dec=S.dec||{};S.recur=S.recur||{};S.out=S.out||{};
try{if(sessionStorage.getItem("tc_cx")){S.cx=true;document.documentElement.classList.add("cx")}}catch(_){ }
function refreshAll(){recompute();vueDG();vueTrajets();vueCarte();vueControles();vueProfil();vueSemaine()}
function saveSim(){try{sessionStorage.setItem("tc_dec",JSON.stringify(S.dec));sessionStorage.setItem("tc_rec",JSON.stringify(S.recur));sessionStorage.setItem("tc_out",JSON.stringify(S.out))}catch(_){}}
function recompute(){S.res=E.match(S.pop,S.p,undefined,S.out);S.bil=E.bilan(S.res.trips,S.p,undefined,S.dec)}
function simBandeau(t){return h("div",{class:"sim",role:"note"},t)}

/* ---------- Décision ---------- */
function vueDG(){vueDG0();vueFin()}
function vueDG0(){
 const el=$("#vue-dg");el.replaceChildren();
 const L=S.bil.L,p=S.p,w=p.semaines;
 const present=S.pop.length;
 const rate=(a,b)=>b?Math.round(100*a/b)+" %":"-";
 el.append(h("div",{class:"carte"},
  h("h2",{text:"Ce que la direction peut décider"}),
  h("p",{text:"Une semaine simulée pour "+present+" profils fictifs vers le site de Mont-Saint-Aignan. Chaque chiffre dit s'il est estimé, déclaré ou corroboré, et sur quelle hypothèse il repose."}),
  simBandeau("Simulation : profils, domiciles, traces de test et taux d'acceptation sont inventés. Ils illustrent le calcul, ils ne prédisent pas l'adoption réelle."),
  h("h3",{text:"Trois niveaux, jamais mélangés"}),
  etage([["Potentiel estimé : trajets proposés par l'algorithme",L.pot.n,"",L.pot.n],["Trajets déclarés : propositions acceptées",L.dec.n,"c2",L.pot.n],["Trajets corroborés : traces de test conformes",L.cor.n,"c3",L.pot.n]]),
  h("div",{class:"grille"},
   kpi(rate(L.cor.n,L.dec.n),"des trajets déclarés corroborés (test)"),
   kpi(L.cor.people.size+" / "+present,"profils ayant fait au moins un trajet corroboré"),
   kpi(L.cor.paxCarless,"places occupées par des profils sans voiture (corroborées)"),
   kpi(f1(S.res.trips.reduce((q,t)=>q+t.pax.length,0)/Math.max(1,S.res.trips.length)),"passagers par trajet proposé, en moyenne")
  )));
 const an=x=>x*w;
 el.append(h("div",{class:"carte"},
  h("h3",{text:"CO₂ : deux méthodes affichées côte à côte"}),
  h("p",{class:"doux",text:"Brute : le passager aurait pris sa voiture (logique des observatoires). Prudente : seulement une part des passagers avec voiture l'aurait prise ; un passager sans voiture se déplaçait autrement. Dans les deux cas on retranche le détour du conducteur."}),
  h("table",{class:"tab"},
   h("thead",null,h("tr",null,h("th",{text:"Niveau"}),h("th",{class:"n",text:"Brute /sem."}),h("th",{class:"n",text:"Prudente /sem."}),h("th",{class:"n",text:"Prudente /an"}))),
   h("tbody",null,["pot","dec","cor"].map(k=>h("tr",null,h("td",{text:{pot:"Potentiel",dec:"Déclaré",cor:"Corroboré"}[k]}),h("td",{class:"n",text:kg(L[k].brut)}),h("td",{class:"n",text:kg(L[k].prud)}),h("td",{class:"n",text:kg(an(L[k].prud))}))))),
  h("div",{class:"note-limite",text:"Un passager sans voiture peut faire augmenter les émissions (le détour du conducteur s'ajoute) : c'est un gain d'accès, pas un gain CO₂. Une modélisation parisienne (CIRED) indique que sans mesures d'accompagnement 50 à 75 % des bénéfices d'un covoiturage urbain peuvent être annulés par des reports de mode et des distances plus longues. Le nombre de trajets décroît toujours de potentiel à déclaré à corroboré, mais le CO₂ net, lui, peut remonter : un trajet écarté dont le net est négatif (gros détour) fait baisser le total quand il disparaît. Sources et réserves dans SOURCES.md."}),
  h("p",{class:"doux",text:"Facteur d'émission utilisé : "+p.ef+" kgCO₂e par km et par voiture (Impact CO2, page voiture thermique « Moyenne - Essence », revérifié le 10 nov. 2026 : 170 g CO2e/km, soit 31,7 g de fabrication et 138 g de carburant ; valeur par véhicule-km, pas une moyenne du parc, modifiable dans Réglages). Le parc réel demande la Base Empreinte ADEME."})));
 const eurAn=(L.cor.eurPax+L.cor.eurDrv)*w;
 const partDec=p.tarifTrajet*L.cor.n*w;
 const perPerson=L.cor.n?p.tarifTrajet*L.cor.n*w/Math.max(1,L.cor.people.size):0;
 el.append(h("div",{class:"carte"},
  h("h3",{text:"Euros pour les collaborateurs et pour l'entreprise"}),
  h("div",{class:"grille"},
   kpi(eur(L.cor.eurDrv*w),"économie nette des conducteurs, trajets corroborés, par an"),
   kpiN(L.cor.eurPax*w,"bilan des passagers, trajets corroborés, par an"),
   kpi(eur(partDec),"option B : participation de l'entreprise par an (tarif "+eur2(p.tarifTrajet)+")"),
   kpi(eur(p.coutFixe),"coût annuel de la solution : à renseigner")),
  h("p",{class:"doux",text:"Option A (partage de frais) : chaque occupant paie une part égale du coût du trajet, le conducteur ne gagne rien (le covoiturage est non onéreux, sauf partage des frais). Les passagers sans voiture peuvent payer plus que leur autre mode : c'est visible ici, à discuter."}),
  perPerson>600?h("div",{class:"alerte",text:"Avec ce tarif, la participation moyenne par profil actif dépasse 600 € par an : au-delà du plafond d'exonération indiqué par Service-Public (2026), à faire valider par la paie."}):null,
  h("div",{class:"note-limite",text:"Tarif de l'option B, coûts et paramètres : réglables dans Réglages. Rien n'est versé, aucun paiement n'existe dans cette démonstration."})));
 el.append(h("div",{class:"carte"},h("h3",{text:"Ce que ces chiffres ne prouvent pas"}),
  h("ul",null,
   h("li",{text:"Un trajet corroboré prouve que deux traces ont bougé ensemble, pas qu'aucun accord entre les deux personnes n'a gonflé le bénéfice."}),
   h("li",{text:"Le passager aurait-il pris sa voiture ? Seule une enquête interne le dit. La méthode prudente le paramètre."}),
   h("li",{text:"Les taux d'acceptation et de conformité viennent d'hypothèses de démonstration : un pilote réel les mesurera."}),
   h("li",{text:"Les chiffres publiés par des entreprises partenaires de plateformes sont leurs déclarations ; ils montrent un usage, pas l'effet causal du dispositif."}))));
}
function etage(rows){const max=Math.max(1,...rows.map(r=>r[3]));return h("div",{class:"etage"},rows.map(r=>{const b=h("div",{class:"barre-n "+r[2],text:String(r[1])});b.style.width=Math.max(8,100*r[1]/max)+"%";return h("div",null,h("div",{class:"doux",text:r[0]}),b)}))}
function kpi(v,l){return h("div",{class:"kpi"},h("b",{text:String(v)}),h("span",{text:l}))}
function kpiN(v,l){return h("div",{class:"kpi"+(v<0?" neg":"")},h("b",{text:eur(v)}),h("span",{text:l}))}

/* ---------- Trajets ---------- */
function vueTrajets(){
 const el=$("#vue-trajets");el.replaceChildren();
 const bar=h("div",{class:"barre-outils"});
 E.JOURS.forEach((j,i)=>bar.append(h("button",{class:i===S.day?"actif":"",onclick:()=>{S.day=i;vueTrajets()},text:j})));
 ["matin","soir"].forEach(d=>bar.append(h("button",{class:d===S.dir?"actif":"",onclick:()=>{S.dir=d;vueTrajets()},text:d==="matin"?"Matin":"Soir"})));
 const vsel=h("select",{"aria-label":"Voir comme",onchange:e=>{S.viewer=e.target.value;vueTrajets()}},h("option",{value:"dg",text:"Vue direction (agrégée)"}),S.pop.map(x=>h("option",{value:x.id,text:"Voir comme "+x.nom})));vsel.value=S.viewer;
 const rsel=h("select",{"aria-label":"Règle d'identité",onchange:e=>{S.regleId=e.target.value;vueTrajets()}},h("option",{value:"capture",text:"Identités visibles à 30 min du départ"}),h("option",{value:"ouverte",text:"Identités visibles dès l'acceptation"}));rsel.value=S.regleId;
 const clock=h("input",{type:"range",min:0,max:180,step:5,value:S.avant,"aria-label":"Minutes avant le départ",oninput:e=>{S.avant=+e.target.value;lab.textContent="Il reste "+S.avant+" min avant le départ (horloge simulée)";renderList()}});
 const lab=h("span",{class:"doux",text:"Il reste "+S.avant+" min avant le départ (horloge simulée)"});
 el.append(h("div",{class:"carte"},h("h2",{text:"Trajets proposés"}),bar,h("div",{class:"barre-outils"},vsel,rsel),h("div",{class:"barre-outils"},clock),lab,
  simBandeau("Règle des captures : avant 30 min les participants peuvent annuler et ne se connaissent pas ; ensuite le trajet est confirmé et les identités sont données. L'adresse exacte du domicile n'est montrée qu'au conducteur du trajet, après confirmation. Les deux variantes sont comparables ici : le choix reste à la direction."),
  h("div",{id:"liste-trajets"})));
 function renderList(){
  const box=$("#liste-trajets");box.replaceChildren();
  const ts=S.res.trips.filter(t=>t.day===S.day&&t.dir===S.dir);
  const idle=S.pop.filter(x=>x.jours[S.day].present&&!ts.some(t=>t.drv.id===x.id||t.pax.some(q=>q.id===x.id)));
  if(!ts.length)box.append(h("p",{class:"doux",text:"Aucun trajet proposé ce jour et ce sens avec les réglages actuels."}));
  ts.forEach(t=>box.append(carteTrajet(t)));
  box.append(h("p",{class:"doux",text:idle.length+" profil(s) présent(s) sans trajet proposé ce jour et ce sens (aucun partenaire compatible avec les horaires, le détour maximal ou le temps en plus)."}));
 }
 renderList();
}
function carteTrajet(t){
 const viewer=S.viewer,isPart=viewer===t.drv.id||t.pax.some(x=>x.id===viewer);
 const verrou=S.avant<=30;
 let etat,visible;
 if(!t.accepte){etat=["e-prop","Proposition non acceptée"];visible=false}
 else if(S.regleId==="ouverte"){etat=["e-conf","Accepté : identités visibles"];visible=true}
 else if(verrou){etat=["e-conf","Confirmé : identités visibles"];visible=true}
 else{etat=["e-res","Réservé : annulable, identités masquées"];visible=false}
 const nom=(x,role)=>visible&&isPart&&x.id!==viewer?x.nom:(x.id===viewer?"Vous ("+x.nom+")":(role+" "+"●●●●"));
 const lignes=[h("div",null,"Conducteur : ",h("b",{text:nom(t.drv,"Conducteur")})),
  ...t.pax.map(x=>h("div",null,"Passager : ",h("b",{text:nom(x,"Passager")}),x.mode==="gare"?" · arrive à la gare "+x.gare.nom:" · prise en charge à domicile"))];
 if(visible&&viewer===t.drv.id)t.pax.forEach(x=>lignes.push(h("div",{class:"doux",text:"Prise en charge de "+x.nom+" : "+(x.mode==="gare"?"gare "+x.gare.nom:x.adresse+" (adresse fictive)")})));
 if(!isPart&&viewer!=="dg")lignes.push(h("div",{class:"doux",text:"Vous n'êtes pas sur ce trajet : seul le nombre de participants est visible."}));
 if(viewer==="dg")lignes.push(h("div",{class:"doux",text:"Vue direction : noms et adresses jamais affichés."}));
 const m=t.m,e=t.ev;
 return h("div",{class:"trajet"},
  h("div",{class:"trajet-tete"},h("span",{class:"heure",text:(t.dir==="matin"?"Départ ":"Départ du site ")+E.hm(e.depart)+" → arrivée "+E.hm(e.arrive)}),h("span",{class:"puce-etat "+etat[0],text:etat[1]})),
  lignes,
  h("div",{class:"ligne-m"},h("span",{text:"Trajet estimé "+f1(e.km)+" km"}),h("span",{text:"détour conducteur "+f1(e.detour)+" km"}),h("span",{text:"temps en plus passager max "+f0(Math.max(...e.extras.map(x=>x.extra)))+" min"}),h("span",{text:"CO₂ net brut "+kg(m.brut)+" · prudent "+kg(m.prudent)}),h("span",{text:"part de frais par occupant "+eur2(m.share)})),
  h("div",{class:"doux",text:"Distances et durées "+(S.p.routeReel&&window.TCROUTE?"routières précalculées (OSRM/OpenStreetMap, sans trafic)":"estimées à vol d'oiseau x "+S.p.detourFacteur)+"."}));
}

/* ---------- Carte : fond OpenStreetMap + tracés routiers précalculés ---------- */
function mer(lat,lng,z){const n=256*Math.pow(2,z),r=Math.PI/180;return {x:(lng+180)/360*n,y:(1-Math.log(Math.tan(lat*r)+1/Math.cos(lat*r))/Math.PI)/2*n}}
function deplacer(dn,de,focus){const m=S.moved;if(!m)return;m.lat+=dn*0.0018;m.lng+=de*0.0018/Math.cos(m.lat*Math.PI/180);vueCarte();if(focus){const n=document.getElementById(focus);if(n)n.focus()}}
function panneauDeplace(){
 const sel=h("select",{id:"dep-qui","aria-label":"Personne dont on déplace le point de départ",onchange:e=>{S.moved=e.target.value?{id:e.target.value,lat:byId(e.target.value).home.lat,lng:byId(e.target.value).home.lng}:null;vueCarte();document.getElementById("dep-qui").focus()}},h("option",{value:"",text:"Choisir une personne fictive"}),...S.pop.map(q=>h("option",{value:q.id,text:q.nom})));
 sel.value=S.moved?S.moved.id:"";
 const d=h("details",{open:S.moved?"":null},h("summary",{text:"Tester un point de départ déplacé"}),sel);
 if(S.moved){
  const mo=byId(S.moved.id),km=E.hav({lat:S.moved.lat,lng:S.moved.lng},D.SITE);
  d.append(h("div",{class:"barre-outils",role:"group","aria-label":"Déplacer le point de 200 mètres"},
   h("button",{type:"button",onclick:()=>deplacer(1,0,"dep-n"),id:"dep-n",text:"Nord"}),h("button",{type:"button",onclick:()=>deplacer(-1,0,"dep-s"),id:"dep-s",text:"Sud"}),
   h("button",{type:"button",onclick:()=>deplacer(0,-1,"dep-o"),id:"dep-o",text:"Ouest"}),h("button",{type:"button",onclick:()=>deplacer(0,1,"dep-e"),id:"dep-e",text:"Est"}),
   h("button",{type:"button",onclick:()=>{S.moved=null;vueCarte();document.getElementById("dep-qui").focus()},text:"Remettre en place"})));
  d.append(h("p",{role:"status",class:"sim",text:"Point déplacé de "+mo.nom+" : itinéraire, durée et prise en charge non calculés. Les routes précalculées ne couvrent que les points d'origine et ne sont pas réutilisées pour ce nouveau point. Distance à vol d'oiseau jusqu'au site : "+f1(km)+" km, à titre indicatif. Les trajets et les bilans ne changent pas."}));
 }else d.append(h("p",{class:"doux",text:"Le point déplacé n'est pas routé : la démonstration n'a pas de moteur de routage en ligne, et le serveur public d'itinéraires n'est pas utilisé."}));
 return d;
}
function vueCarte(){
 const el=$("#vue-carte");el.replaceChildren();
 const bar=h("div",{class:"barre-outils"});
 E.JOURS.forEach((j,i)=>bar.append(h("button",{class:i===S.carteJour?"actif":"",onclick:()=>{S.carteJour=i;S.carteSel=null;S.carteDz=0;vueCarte()},text:j})));
 ["matin","soir"].forEach(d=>bar.append(h("button",{class:d===S.carteDir?"actif":"",onclick:()=>{S.carteDir=d;S.carteSel=null;S.carteDz=0;vueCarte()},text:d==="matin"?"Matin":"Soir"})));
 const tsAll=S.res.trips.filter(t=>t.day===S.carteJour&&t.dir===S.carteDir);
 const sel=S.carteSel!=null&&tsAll[S.carteSel]?tsAll[S.carteSel]:null;
 const choix=h("select",{"aria-label":"Choisir un trajet à agrandir",onchange:e=>{S.carteSel=e.target.value===""?null:+e.target.value;S.carteDz=0;vueCarte()}},h("option",{value:"",text:"Tous les trajets"}),...tsAll.map((t,i)=>h("option",{value:String(i),text:"Zoom : "+t.drv.nom.replace("Profil ","")+" + "+t.pax.length+" passager(s), "+E.hm(t.ev.depart)+"-"+E.hm(t.ev.arrive)})));
 choix.value=sel?String(S.carteSel):"";bar.append(choix);
 const zb=h("div",{class:"barre-outils",role:"group","aria-label":"Zoom de la carte"},
  h("button",{type:"button",id:"z-plus",...((S.carteDz||0)>=3?{disabled:true}:{}),"aria-label":"Zoom avant",onclick:()=>{S.carteDz=(S.carteDz||0)+1;vueCarte();document.getElementById("z-plus").focus()},text:"Zoom +"}),
  h("button",{type:"button",id:"z-moins",...((S.carteDz||0)<=-1?{disabled:true}:{}),"aria-label":"Zoom arrière",onclick:()=>{S.carteDz=(S.carteDz||0)-1;vueCarte();document.getElementById("z-moins").focus()},text:"Zoom −"}),
  h("button",{type:"button",id:"z-reset","aria-label":"Vue d'ensemble",onclick:()=>{S.carteDz=0;vueCarte();document.getElementById("z-reset").focus()},text:"Vue d'ensemble"}));
 const all=sel?[...sel.ev.pts]:[D.SITE,...S.pop.map(x=>x.home)];
 if(S.moved)all.push(S.moved,byId(S.moved.id).home);
 const la=all.map(q=>q.lat),lo=all.map(q=>q.lng);
 const box={a:Math.min(...la)-.006,b:Math.max(...la)+.006,c:Math.min(...lo)-.01,d:Math.max(...lo)+.01};
 let z=14,tl,br,nx,ny;
 for(;z>=9;z--){tl=mer(box.b,box.c,z);br=mer(box.a,box.d,z);nx=Math.floor(br.x/256)-Math.floor(tl.x/256)+1;ny=Math.floor(br.y/256)-Math.floor(tl.y/256)+1;if(nx*ny<=16)break}
 const dz=Math.max(-1,Math.min(3,S.carteDz||0));
 let ox=Math.floor(tl.x/256)*256,oy=Math.floor(tl.y/256)*256,W=nx*256,H=ny*256,vb=null,Wv=W;
 if(dz!==0){const zn=Math.max(9,Math.min(17,z+dz)),cm=mer((box.a+box.b)/2,(box.c+box.d)/2,zn);z=zn;ox=Math.floor((cm.x-384)/256)*256;oy=Math.floor((cm.y-384)/256)*256;nx=4;ny=4;W=1024;H=1024;Wv=768;vb=[cm.x-ox-384,cm.y-oy-384,768,768].map(v=>v.toFixed(1)).join(" ")}
 const P=q=>{const m=mer(q.lat,q.lng,z);return {x:m.x-ox,y:m.y-oy}};
 const f=Wv/420;
 const svg=sv("svg",{class:"carte-svg",viewBox:vb||("0 0 "+W+" "+H),role:"img","aria-label":"Carte OpenStreetMap avec domiciles fictifs, gares, site d'arrivée et tracés routiers"});
 svg.append(sv("rect",{x:0,y:0,width:W,height:H,fill:"#efe6d6"}));
 const tx0=ox/256,ty0=oy/256;
 for(let i=0;i<nx;i++)for(let j=0;j<ny;j++)svg.append(sv("image",{href:"https://tile.openstreetmap.org/"+z+"/"+(tx0+i)+"/"+(ty0+j)+".png",x:i*256,y:j*256,width:256,height:256,opacity:".92"}));
 const R=window.TCROUTE,idx={};if(R)R.pts.forEach((q,i)=>{idx[q[0].toFixed(5)+","+q[1].toFixed(5)]=i});
 const kk=q=>q.lat.toFixed(5)+","+q.lng.toFixed(5);
 const ts=sel?[sel]:tsAll;
 const col=["#6b1d2c","#b9802f","#2f6b3f","#2d5a8a","#8a2a8a","#7a5a2a"];
 let tracesReelles=0;
 ts.forEach((t,i)=>{const c=col[i%col.length];const g=R&&R.routes[idx[kk(t.drv.home)]];
  const L=window.TCLEGS||{};const seq=t.ev.pts.map(q=>idx[kk(q)]);const legs=[];for(let q=0;q<seq.length-1;q++)legs.push(L[seq[q]+">"+seq[q+1]]);
  const complet=legs.length>0&&legs.every(Boolean);
  const geo=complet?[].concat(...legs):g;
  if(geo){if(complet)tracesReelles++;const path=geo.map(q=>{const a=P({lat:q[1],lng:q[0]});return a.x.toFixed(1)+","+a.y.toFixed(1)}).join(" ");
   svg.append(sv("polyline",{points:path,fill:"none",stroke:"#fff","stroke-width":6*f*.5,"stroke-linejoin":"round","stroke-opacity":".9"}));
   svg.append(sv("polyline",{points:path,fill:"none",stroke:c,"stroke-width":3.4*f*.5,"stroke-linejoin":"round","stroke-dasharray":complet?"":"8 5"}))}
  else{const path=t.ev.pts.map(q=>{const a=P(q);return a.x.toFixed(1)+","+a.y.toFixed(1)}).join(" ");svg.append(sv("polyline",{points:path,fill:"none",stroke:c,"stroke-width":3*f*.5,"stroke-dasharray":"6 4"}))}
  t.pax.forEach(x=>{const a=P(x.mode==="gare"&&x.gare?x.gare:x.home);svg.append(sv("circle",{cx:a.x,cy:a.y,r:7*f*.85,fill:"#fff",stroke:c,"stroke-width":3*f*.85}))})});
 const inTrip=new Set();ts.forEach(t=>{inTrip.add(t.drv.id);t.pax.forEach(x=>inTrip.add(x.id))});
 S.pop.forEach(x=>{const a=P(x.home);const present=x.jours[S.carteJour].present;
  const r=(inTrip.has(x.id)?6:4.5)*f*.85,fill=!present?"#fff":x.aVoiture?"#6b1d2c":"#b9802f";
  const at={fill,stroke:"#3e0f19","stroke-width":f*.4,"stroke-dasharray":present?"":"2 2","fill-opacity":inTrip.has(x.id)?1:.6};
  if(x.aVoiture)svg.append(sv("circle",Object.assign({cx:a.x,cy:a.y,r},at)));
  else{const q=r*1.15;svg.append(sv("polygon",Object.assign({points:[[a.x,a.y-q],[a.x+q,a.y],[a.x,a.y+q],[a.x-q,a.y]].map(p=>p.join(",")).join(" ")},at)))}});
 D.GARES.forEach(g=>{const a=P(g);const r=6*f*.85;svg.append(sv("rect",{x:a.x-r,y:a.y-r,width:2*r,height:2*r,fill:"#2d5a8a",stroke:"#fff","stroke-width":f*.3}));svg.append(sv("text",{x:a.x+r+3,y:a.y+4,"font-size":11*f*.85,fill:"#1f3e60",stroke:"#fff","stroke-width":f*.8,"paint-order":"stroke"},g.nom))});
 const s0=P(D.SITE),r0=9*f*.85;
 svg.append(sv("polygon",{points:[[s0.x,s0.y-r0*1.6],[s0.x+r0*1.4,s0.y+r0],[s0.x-r0*1.4,s0.y+r0]].map(q=>q.join(",")).join(" "),fill:"#3e0f19",stroke:"#fff","stroke-width":f*.4}));
 svg.append(sv("text",{x:s0.x+r0*1.8,y:s0.y-r0*.5,"font-size":13*f*.85,"font-weight":"700",fill:"#3e0f19",stroke:"#fff","stroke-width":f,"paint-order":"stroke"},"Site d'arrivée"));
 if(S.moved){const mo=byId(S.moved.id),a0=P(mo.home),a1=P(S.moved);
  svg.append(sv("line",{x1:a0.x,y1:a0.y,x2:a1.x,y2:a1.y,stroke:"#3e0f19","stroke-width":f*.5,"stroke-dasharray":"3 3"}));
  const mk=sv("circle",{cx:a1.x,cy:a1.y,r:9*f*.85,fill:"#fff","fill-opacity":".6",stroke:"#3e0f19","stroke-width":f*.7,"stroke-dasharray":"4 3",id:"pt-deplace",style:"touch-action:none;cursor:grab",tabindex:"0",role:"button","aria-label":"Point déplacé, flèches du clavier pour le bouger de 200 mètres"});
  svg.append(mk);svg.append(sv("text",{x:a1.x+12*f*.85,y:a1.y+4,"font-size":11*f*.85,fill:"#3e0f19",stroke:"#fff","stroke-width":f*.8,"paint-order":"stroke"},"non calculé"));
  mk.addEventListener("keydown",ev=>{const d={ArrowUp:[1,0],ArrowDown:[-1,0],ArrowLeft:[0,-1],ArrowRight:[0,1]}[ev.key];if(d){ev.preventDefault();deplacer(d[0],d[1],"pt-deplace")}});
  mk.addEventListener("pointerdown",ev=>{mk.setPointerCapture(ev.pointerId);mk.dataset.drag="1"});
  mk.addEventListener("pointermove",ev=>{if(!mk.dataset.drag)return;const m=svg.getScreenCTM().inverse(),pt=svg.createSVGPoint();pt.x=ev.clientX;pt.y=ev.clientY;const q=pt.matrixTransform(m);mk.setAttribute("cx",q.x);mk.setAttribute("cy",q.y);mk.dataset.x=q.x;mk.dataset.y=q.y});
  mk.addEventListener("pointerup",()=>{if(!mk.dataset.drag)return;delete mk.dataset.drag;if(mk.dataset.x){const px=+mk.dataset.x+ox,py=+mk.dataset.y+oy,n=256*Math.pow(2,z),lng=px/n*360-180,lat=Math.atan(Math.sinh(Math.PI*(1-2*py/n)))*180/Math.PI;S.moved.lat=lat;S.moved.lng=lng;vueCarte()}});}
 svg.append(sv("text",{x:W-4,y:H-5,"font-size":8*f*.85,"text-anchor":"end",fill:"#333",stroke:"#fff","stroke-width":f*.5,"paint-order":"stroke"},"© contributeurs OpenStreetMap"));
 el.append(h("div",{class:"carte"},h("h2",{text:"Carte des trajets"}),bar,zb,svg,
  h("div",{class:"leg"},h("span",null,h("i",{class:"d1"}),"rond : avec voiture"),h("span",null,h("i",{class:"d2 los"}),"losange : sans voiture"),h("span",{text:"carré bleu : gare · cercle blanc cerclé : prise en charge · pointillé : absent ce jour"})),
  h("p",{class:"doux",text:"Fond : OpenStreetMap (© contributeurs, ODbL), chargé depuis tile.openstreetmap.org. Tracés : itinéraire routier du conducteur vers le site, précalculé le "+(R?R.date:"?")+" (OSRM, sans trafic). Trajets à plusieurs : conducteur, prises en charge puis site, tracés sur les routes quand les tronçons sont précalculés, sinon en pointillé : "+tracesReelles+" trajet(s) tracé(s) sur "+ts.length+"."}),
  simBandeau("Domiciles inventés (calés sur la route la plus proche pour le calcul). Données OpenStreetMap libres (ODbL), mais le serveur public de tuiles est limité à un usage léger : pour un déploiement, tuiles auto-hébergées ou fournisseur dont les conditions conviennent. Important : en affichant la carte, votre navigateur envoie votre adresse IP et la zone affichée au serveur de tuiles OpenStreetMap. Ce sont des données réelles du visiteur, même si tous les profils sont inventés. Les tracés viennent d'un précalcul ponctuel sur le serveur de démonstration OSRM (sans garantie, ne convient pas à un produit). Détail dans SOURCES.md.")));
 el.querySelector(".carte").append(panneauDeplace());
 const i1=el.querySelector(".leg i.d1"),i2=el.querySelector(".leg i.d2");i1.style.background="#6b1d2c";i2.style.background="#b9802f";
 const liste=h("ol",{class:"liste-carte"},ts.map(t=>h("li",null,h("b",{text:t.drv.nom}),(" conduit : "+t.ev.pts.slice(0,-1).length+" arrêt(s) avant le site, départ "+E.hm(t.ev.depart)+", arrivée "+E.hm(t.ev.arrive)+", "+f1(t.ev.km)+" km, détour "+f1(t.ev.detour)+" km. Passagers : "+t.pax.map(x=>x.nom+(x.mode==="gare"?" (gare "+x.gare.nom+")":" (domicile)")).join(", ")+"."))));
 el.querySelector(".carte").append(h("details",{open:""},h("summary",{text:"Version texte de la carte ("+ts.length+" trajet(s))"}),ts.length?liste:h("p",{class:"doux",text:"Aucun trajet ce jour et ce sens."})));
}

/* ---------- Profil ---------- */
function vueProfil(){
 const el=$("#vue-profil");el.replaceChildren();
 const x=byId(S.profil);
 const sel=h("select",{"aria-label":"Profil",onchange:e=>{S.profil=e.target.value;vueProfil()}},S.pop.map(q=>h("option",{value:q.id,text:q.nom+" ("+q.role+")"})));sel.value=S.profil;
 const tbl=h("table",{class:"tab"},h("thead",null,h("tr",null,["Jour","Présent","Arrivée entre","Départ entre"].map(t=>h("th",{text:t})))));
 const tb=h("tbody");
 const toT=m=>E.hm(m);
 const LABS={a0:"Arrivée entre, début",a1:"Arrivée entre, fin",d0:"Départ entre, début",d1:"Départ entre, fin"};
 const PAIRE={a0:"a1",a1:"a0",d0:"d1",d1:"d0"};
 const parseHM=v=>{const m=/^\s*(\d{1,2})\s*(?:[:hH]\s*(\d{2}))?\s*$/.exec(v||"");if(!m)return null;const H=+m[1],M=m[2]?+m[2]:0;if(H>23||M>59)return null;return H*60+M;};
 x.jours.forEach((j,i)=>{
  const cb=h("input",{type:"checkbox","aria-label":"Présent "+E.JOURS[i],onchange:e=>{j.present=e.target.checked;refresh()}});cb.checked=j.present;
  const tin=(key)=>{const msg=h("span",{class:"hm-err",role:"alert"});
   const t=h("input",{type:"text",class:"hm",inputmode:"numeric",maxlength:"5",placeholder:"07:30",value:toT(j[key]),
    "aria-label":LABS[key]+" "+E.JOURS[i]+", format 24 heures, par exemple 07:30",
    onchange:e=>{const inp=e.target,m=parseHM(inp.value);
     const ko=t2=>{inp.classList.add("ko");inp.setAttribute("aria-invalid","true");msg.textContent=t2};
     if(m===null)return ko("Heure invalide : écris par exemple 07:30 (de 00:00 à 23:59).");
     const autre=j[PAIRE[key]],debut=key==="a0"||key==="d0";
     if(debut&&m>autre)return ko("Le début doit être avant la fin ("+E.hm(autre)+").");
     if(!debut&&m<autre)return ko("La fin doit être après le début ("+E.hm(autre)+").");
     inp.classList.remove("ko");inp.removeAttribute("aria-invalid");msg.textContent="";
     inp.value=E.hm(m);if(m!==j[key]){j[key]=m;refresh()}}});
   return h("span",{class:"hm-wrap"},t,msg)};
  tb.append(h("tr",null,h("td",{text:E.JOURS[i]}),h("td",null,cb,j.present?"":" congé"),h("td",null,h("div",{class:"plage"},tin("a0"),tin("a1"))),h("td",null,h("div",{class:"plage"},tin("d0"),tin("d1")))));
 });
 tbl.append(tb);
 el.append(h("div",{class:"carte"},h("h2",{text:"Profil de démonstration"}),
  simBandeau("Ceci n'est pas une connexion. Un vrai compte demande une authentification (par exemple le compte professionnel via Teams), une base de données et l'accord de la DSI : voir l'onglet Réel. Ici on choisit un profil fictif pour montrer l'effet des horaires et des congés."),
  h("div",{class:"barre-outils"},sel),
  h("p",null,h("b",{text:x.nom}),", "+x.commune+", "+(x.aVoiture?(x.role==="flexible"?"a une voiture et accepte d'alterner":"a une voiture et conduit"):"n'a pas de voiture")+(x.mode==="gare"?", arrive par la gare "+x.gare.nom:", prise en charge à domicile")),
  h("p",{class:"doux",text:"Adresse fictive : "+x.adresse}),
  tbl,
  h("p",{class:"doux",text:"Les heures se saisissent au format 24 heures (par exemple 07:30 ou 7h30). Chaque changement relance l'appariement : décale une plage ou pose un congé, puis regarde l'onglet Trajets."}),
  h("div",{id:"mes-trajets"})));
 function mes(){const box=$("#mes-trajets");box.replaceChildren();
  const ts=S.res.trips.filter(t=>t.drv.id===x.id||t.pax.some(q=>q.id===x.id));
  box.append(h("h3",{text:"Trajets proposés cette semaine : "+ts.length}));
  ts.forEach(t=>box.append(h("div",{class:"doux",text:E.JOURS[t.day]+" "+t.dir+" : "+(t.drv.id===x.id?"conducteur":"passager")+", départ "+E.hm(t.ev.depart)+", arrivée "+E.hm(t.ev.arrive)})));}
 mes();
 function refresh(){recompute();mes();vueDG();vueTrajets();vueCarte();vueControles();vueSemaine()}
}


function vueFin(){
 const el=$("#vue-dg");
 const sc=[["Faible",0.10],["Réglage actuel",S.p.coutKm],["Élevé",0.30],["Barème fiscal 2025, 5 CV (borne haute, pas un coût réel)",0.636]];
 const rows=sc.map(([n,c])=>{const p=Object.assign({},S.p,{coutKm:c});const r=E.match(S.pop,p);const b=E.bilan(r.trips,p,undefined,S.dec);const L=b.L;
  return h("tr",null,h("td",{text:n+" ("+String(c).replace(".",",")+" €/km)"}),h("td",{class:"num",text:eur(L.dec.eurPax)}),h("td",{class:"num",text:eur(L.dec.eurDrv)}),h("td",{class:"num",text:eur(L.cor.eurPax)}),h("td",{class:"num",text:eur(L.cor.eurDrv)}))});
 el.append(h("div",{class:"carte"},h("h2",{text:"Euros : sensibilité au coût par km (une semaine)"}),
  h("p",{class:"doux",text:"Le coût au km est l'hypothèse la plus fragile du volet financier. Les euros sont une économie ou un surcoût pour les participants, pas de l'argent versé : aucun paiement n'existe dans cette démonstration. Le partage de frais reste borné par la règle de non-profit du conducteur (voir cadrage)."}),
  h("table",{class:"tab"},h("thead",null,h("tr",null,h("th",{rowspan:"2",text:"Hypothèse"}),h("th",{colspan:"2",class:"grp",text:"Déclaré"}),h("th",{colspan:"2",class:"grp",text:"Corroboré"})),h("tr",null,["Passagers","Conducteurs","Passagers","Conducteurs"].map(t=>h("th",null,h("span",{class:"sr-only",text:t}),h("span",{"aria-hidden":"true",text:t==="Passagers"?"Pass.":"Cond."}))))),h("tbody",null,rows)),
  h("p",{class:"doux",text:"Un montant négatif pour les passagers signifie qu'ils paient plus que leur alternative dans ce modèle. Lecture à confirmer avec la règle de partage de frais retenue par l'entreprise."})));
}

/* ---------- Ma semaine : une case par jour et par sens, états honnêtes, aléas simulés ---------- */
const slotK=(day,dir,id)=>day+dir+"|"+id;
function apres(focus){saveSim();S.alea=null;refreshAll();if(focus){const n=document.getElementById(focus);if(n)n.focus()}}
function accepter(t,ids,focus){ids.forEach(id=>{S.dec[E.tripKey(t)+"#"+id]="accepte"});apres(focus)}
function retirer(day,dir,uid,val,focus){S.out[slotK(day,dir,uid)]=val;delete S.recur[uid+day+dir];apres(focus)}
function rétablir(day,dir,uid,focus){delete S.out[slotK(day,dir,uid)];apres(focus)}
function retraitsAutres(day,dir,uid){return S.pop.filter(q=>q.id!==uid&&S.out[slotK(day,dir,q.id)]&&S.out[slotK(day,dir,q.id)]!=="+")}
function etatCase(x,day,dir){
 const j=x.jours[day];
 if(!j.present&&!S.out[slotK(day,dir,x.id)])return {k:"conge",t:"Congé ou absent",d:"Aucun trajet à proposer ce jour."};
 const mo0=S.out[slotK(day,dir,x.id)],mo=mo0==="+"?null:mo0,ajoute=mo0==="+";
 if(mo)return {k:"refus",t:mo==="refuse"?"Refusé par vous":"Annulé par vous",d:"Vous êtes retiré de ce créneau : le trajet est recalculé sans vous, capacité, détour et bilans compris. Vous pouvez revenir sur ce choix.",trip:null,mo};
 const t=S.res.trips.find(q=>q.day===day&&q.dir===dir&&(q.drv.id===x.id||q.pax.some(y=>y.id===x.id)));
 if(!t)return {k:"seul",t:"Pas de trajet proposé",d:"Aucun partenaire compatible avec vos horaires, le détour maximal ou le temps en plus. Rien n'est réservé. Aucun repli (taxi, prise en charge par l'entreprise) n'est promis.",trip:null};
 const mien=S.dec[E.tripKey(t)+"#"+x.id]==="accepte";
 if(!mien)return {k:"prop",t:"Proposition à accepter",d:"Rien n'est engagé tant que vous ne l'acceptez pas."+(t.accepte?" Dans les bilans de population ce trajet est compté accepté par un tirage simulé, pas par vous.":""),trip:t};
 if(t.accepte)return {k:"conf",t:"Confirmé (autres participants simulés)",d:"Vous avez accepté et les autres acceptations sont simulées. Avec de vrais utilisateurs, chacun devrait accepter. Cet état n'établit ni présence ni droit à un paiement.",trip:t};
 return {k:"att",t:"Accepté par vous, en attente des autres",d:"Votre acceptation seule ne confirme rien : les autres participants (simulés) n'ont pas accepté. Le trajet n'est pas compté dans les bilans.",trip:t};
}
function cav(court,detail,cls){return h("div",{class:cls||"doux"},court,detail?h("details",null,h("summary",{text:"Détails"}),h("p",{text:detail})):null)}
function vueSemaine(){
 const el=$("#vue-semaine");el.replaceChildren();
 const x=byId(S.profil);
 const sel=h("select",{"aria-label":"Profil",onchange:e=>{S.profil=e.target.value;S.alea=null;vueSemaine()}},S.pop.map(q=>h("option",{value:q.id,text:q.nom+" ("+q.role+")"})));sel.value=S.profil;
 const grille=h("div",{class:"semaine",role:"list"});
 E.JOURS.forEach((jn,day)=>["matin","soir"].forEach(dir=>{
  const e=etatCase(x,day,dir),key=day+dir,idb="b-"+key;
  const ligne=h("div",{class:"case-sem e-"+e.k,role:"listitem"},
   h("div",{class:"case-tete"},h("b",{text:jn+" "+(dir==="matin"?"matin":"soir")}),h("span",{class:"puce-etat",text:e.t})),
   (()=>{const k=e.d.indexOf(". ");return k>0&&k<e.d.length-2?cav(e.d.slice(0,k+1),e.d.slice(k+2)):h("div",{class:"doux",text:e.d})})());
  const bar=h("div",{class:"barre-outils"});
  const t=e.trip;
  const autres=retraitsAutres(day,dir,x.id);
  if(autres.length)ligne.append(cav("Retrait simulé de "+autres.length+" participant(s) fictif(s) : seuls les trajets concernés sont recalculés, le reste de la semaine ne bouge pas.","Capacité, détour, temps en plus et bilans sont recalculés pour ces trajets. Un trajet dont les participants, l'heure ou le point de prise en charge changent demande un nouvel accord : l'ancien n'est pas reporté.","sim"));
  if(autres.length)bar.append(h("button",{type:"button",id:idb+"-rest",onclick:()=>{autres.forEach(q=>delete S.out[slotK(day,dir,q.id)]);apres(idb+"-rest")},text:"Rétablir les participants simulés"}));
  const aj=S.out[slotK(day,dir,x.id)]==="+";
  if(e.k==="conge")bar.append(h("button",{type:"button",id:idb+"-add",onclick:()=>{S.out[slotK(day,dir,x.id)]="+";apres(idb+"-add")},text:"Ajouter un départ tard pour ce créneau"}));
  if(aj){ligne.append(cav("Départ ajouté tard : seuls de nouveaux trajets avec des personnes sans trajet sont cherchés.","Aucun trajet existant, confirmé ou non, ne change de composition, d'heure ou de point de prise en charge. Si rien ne convient, il n'y a pas de trajet : aucun repli n'est promis.","sim"));bar.append(h("button",{type:"button",id:idb+"-add",onclick:()=>{delete S.out[slotK(day,dir,x.id)];apres(idb+"-add")},text:"Annuler cet ajout"}))}
  if(dir==="soir"&&(e.k==="refus"||e.k==="seul")&&etatCase(x,day,"matin").k==="conf")ligne.append(h("div",{class:"sim",role:"status",text:"Votre aller du matin est confirmé mais ce retour n'est pas assuré. Aucun retour garanti : ni taxi ni prise en charge par l'entreprise n'est promis."}));
  if(e.k==="refus")bar.append(h("button",{type:"button",id:idb+"-ann",onclick:()=>rétablir(day,dir,x.id,idb+"-acc"),text:"Revenir sur ma décision"}));
  if(t){
   const role=t.drv.id===x.id?"conducteur":"passager",rk=E.tripKey(t)+"#"+x.id;
   ligne.append(h("div",null,"Vous seriez "+role+" : départ "+E.hm(t.ev.depart)+(dir==="matin"?", arrivée au site ":", arrivée ")+E.hm(t.ev.arrive)+", "+f1(t.ev.km)+" km, "+(t.pax.length)+" passager(s), "+f1(t.ev.detour)+" km de détour conducteur."));
   if(role==="passager"){const me=t.pax.find(q=>q.id===x.id);ligne.append(h("div",null,"Point de prise en charge : "+(me.mode==="gare"?"gare "+me.gare.nom:"votre domicile (adresse fictive, connue du conducteur après confirmation)")+". Conducteur : profil fictif, identité selon la règle de l'onglet Trajets."))}
   else ligne.append(h("div",null,"Passagers : "+t.pax.map(q=>q.mode==="gare"?"gare "+q.gare.nom:"domicile d'un passager (adresse après confirmation)").join(" ; ")+"."));
   const autresIds=[t.drv,...t.pax].filter(q=>q.id!==x.id).map(q=>q.id);
   if(e.k==="prop"){
    bar.append(h("button",{type:"button",id:idb+"-acc",onclick:()=>accepter(t,[x.id],idb+"-ret"),text:"Accepter ce trajet"}),
     h("button",{type:"button",id:idb+"-ref",onclick:()=>retirer(day,dir,x.id,"refuse",idb+"-ann"),text:"Refuser"}));
   }
   if(e.k==="att")bar.append(h("button",{type:"button",id:idb+"-sim",onclick:()=>accepter(t,autresIds,idb+"-ret"),text:"Simuler : les autres acceptent"}),
     h("button",{type:"button",id:idb+"-ret",onclick:()=>retirer(day,dir,x.id,"annule",idb+"-ann"),text:"Je ne peux plus faire ce trajet"}));
   if(e.k==="prop"||e.k==="att"||e.k==="conf"){
    const cible=role==="passager"?t.drv:t.pax[0];
    bar.append(h("button",{type:"button",id:idb+"-aut",onclick:()=>retirer(day,dir,cible.id,"annule-sim",idb+"-rest"),text:role==="passager"?"Simuler : le conducteur se retire":"Simuler : un passager se retire"}));
   }
   if(e.k==="conf"){
    const rec=S.recur[x.id+key];
    const cb=h("input",{type:"checkbox",id:"rec-"+key,onchange:ev=>{if(ev.target.checked)S.recur[x.id+key]=true;else delete S.recur[x.id+key];saveSim();vueSemaine();const n=document.getElementById("rec-"+key);if(n)n.focus()}});cb.checked=!!rec;
    ligne.append(h("label",{class:"rec",for:"rec-"+key},cb," Je demande à reproduire ce créneau chaque semaine"));
    if(rec)ligne.append(cav("Demande valable pour cette session de démonstration seulement, non durable, sans engagement.","Elle disparaît à la fermeture de l'onglet. Dans un vrai produit, l'autre personne devrait accepter. Vous la retirez en décochant ; aucun argent n'est engagé."));
    if(role==="conducteur")bar.append(h("button",{type:"button",onclick:()=>{S.alea=S.alea&&S.alea.key===key&&S.alea.k==="absent"?null:{key,k:"absent"};vueSemaine()},text:"Simuler : un passager est absent"}));
    bar.append(h("button",{type:"button",onclick:()=>{S.alea=S.alea&&S.alea.key===key&&S.alea.k==="retard"?null:{key,k:"retard"};vueSemaine()},text:"Je suis en retard de 10 min"}),h("button",{type:"button",id:idb+"-ret",onclick:()=>retirer(day,dir,x.id,"annule",idb+"-ann"),text:"Je ne peux plus faire ce trajet"}));
    if(S.alea&&S.alea.key===key&&S.alea.k==="absent")ligne.append(h("div",{class:"sim",role:"status",text:"Absence simulée d'un passager au point de prise en charge. Elle ne prouve pas sa faute et n'ouvre aucun droit à un paiement ou une pénalité dans cette démonstration. Le trajet reste compté comme confirmé : un vrai produit demande une règle (délai d'attente, preuve contraire) fixée par l'entreprise, et la corroboration de ce trajet serait à vérifier."}));
    if(S.alea&&S.alea.key===key&&S.alea.k==="retard"){const extra=Math.max(...t.ev.extras.map(q=>q.extra));
     ligne.append(h("div",{class:"sim",role:"status",text:"Retard simulé : aucun message réel n'est envoyé et personne n'est prévenu. Le trajet n'est pas annulé. Temps en plus déjà prévu pour un passager : "+f0(extra)+" min ; avec 10 min de retard, "+f0(extra+10)+" min pour un maximum fixé à "+S.p.maxExtraMin+" min"+(extra+10>S.p.maxExtraMin?" : le maximum serait dépassé, la décision de partir ou non reviendrait aux personnes concernées.":" : le maximum reste respecté.")}))}
   }
  }
  if(bar.children.length)ligne.append(bar);
  grille.append(ligne)}));
 el.append(h("div",{class:"carte"},h("h2",{text:"Ma semaine"}),
  h("div",{class:"sim",role:"note"},"Démonstration : rien n'est accepté, réservé ni payé à votre place. Les autres participants sont fictifs et simulés, aucun message réel n'est envoyé.",h("details",null,h("summary",{text:"Détails"}),h("p",{text:"La semaine est proposée à l'avance à partir du profil ; vous acceptez ou refusez chaque trajet. Vos choix ne sont gardés que dans cet onglet (sessionStorage), rien n'est durable."}))),
  h("div",{class:"barre-outils"},sel,h("button",{type:"button",onclick:()=>{S.dec={};S.recur={};S.out={};saveSim();S.alea=null;refreshAll()},text:"Effacer mes choix simulés"})),grille));
}

/* ---------- Contrôles anti-abus ---------- */
function vueControles(){
 const el=$("#vue-controles");el.replaceChildren();
 const r={};D.REGLES.forEach(x=>r[x.k]=S.p[x.k]);
 const sc=E.SCENARIOS[S.scen];
 const ev=E.reglesEval(sc.t,r);
 const sel=h("select",{"aria-label":"Scénario de trace de test",onchange:e=>{S.scen=e.target.value;vueControles()}},Object.keys(E.SCENARIOS).map(k=>h("option",{value:k,text:E.SCENARIOS[k].l})));sel.value=S.scen;
 const L=S.res.trips;const cnt={"corroboré":0,"à vérifier":0,"rejeté":0};L.filter(t=>t.accepte).forEach(t=>cnt[t.controle.verdict]++);
 const vc=v=>v==="corroboré"?"v-corr":v==="à vérifier"?"v-rev":"v-rej";
 const tab=h("table",{class:"tab"},h("thead",null,h("tr",null,h("th",{text:"Mesure du trajet de test"}),h("th",{class:"n",text:"Valeur"}))),h("tbody",null,
  [["Distance au point de rencontre (m)",sc.t.rencontreM],["Écart horaire (min)",sc.t.ecartMin],["Part du trajet faite ensemble",Math.round(sc.t.copres*100)+" %"],["Vitesse moyenne (km/h)",sc.t.vit],["Distance tracée / attendue",sc.t.ratio],["Appareil partagé entre comptes",sc.t.appareilDouble?"oui":"non"],["Trajets le même jour",sc.t.trajetsJour],["Même binôme dans la semaine",sc.t.binomeSem]].map(a=>h("tr",null,h("td",{text:a[0]}),h("td",{class:"n",text:String(a[1])})))));
 el.append(h("div",{class:"carte"},h("h2",{text:"Contrôles anti-abus"}),
  h("p",{text:"Principe : aucun avantage financier sans trajet corroboré, et un humain regarde ce que les règles ne tranchent pas. Un trajet 'corroboré' prouve que deux traces ont bougé ensemble, il ne prouve pas l'absence de complicité."}),
  simBandeau("Les mesures ci-dessous sont des jeux de test écrits à la main, pas des positions de vraies personnes. Elles servent à vérifier que les règles réagissent comme prévu et à régler les seuils."),
  h("div",{class:"barre-outils"},sel),tab,
  h("p",null,"Verdict : ",h("span",{class:"verdict "+vc(ev.verdict),text:ev.verdict})),
  ev.flags.length?h("ul",null,ev.flags.map(f=>h("li",null,"["+(f.gr==="rejet"?"rejet":"revue")+"] "+f.m))):h("p",{class:"doux",text:"Aucune règle déclenchée."}),
  h("h3",{text:"Résultat sur la semaine simulée (trajets déclarés)"}),
  h("div",{class:"grille"},kpi(cnt["corroboré"],"corroborés"),kpi(cnt["à vérifier"],"à vérifier par un humain"),kpi(cnt["rejeté"],"rejetés")),
  h("div",{class:"note-limite",text:"Limites assumées : le binôme qui s'entend pour déclarer des trajets réels mais non nécessaires, ou qui gonfle la valeur d'un trajet, reste difficile à voir avec des traces seules. Réponses : peu d'argent par trajet, plafonds, audit par échantillon, comparaison avec les badgeages d'accès et la présence déclarée, suppression du compte en cas d'abus. Un signal vu dans la presse régionale : des primes versées sans passager réel sur une plateforme grand public. Sources dans SOURCES.md."})));
 const th=h("div",{class:"carte"},h("h3",{text:"Seuils des règles"}),h("p",{class:"doux",text:"Chaque seuil est un choix à valider avec la direction. Le Registre de preuve de covoiturage applique par exemple : rejet au-delà de 4 trajets par personne et par jour, et au-delà de 70 % de chevauchement entre deux trajets d'un même passager."}));
 D.REGLES.forEach(x=>th.append(champ(x.l,S.p[x.k],x.step||1,0,x.k==="vmax"?300:x.k==="rayonM"?2000:x.k==="tolMin"?60:x.k==="maxJour"?10:x.k==="binomeSem"?20:3,v=>{S.p[x.k]=v;recompute();vueDG();vueTrajets();vueCarte();vueControles()},"Seuil de démonstration.")));
 el.append(th);
}

/* ---------- Réglages ---------- */
function champ(label,val,step,min,max,onch,src){
 const out=h("span",{class:"v",text:String(val)});
 const inp=h("input",{type:"range",min:String(min),max:String(max),step:String(step),value:String(val),"aria-label":label,onchange:e=>{onch(+e.target.value)},oninput:e=>{out.textContent=e.target.value}});
 return h("div",{class:"champ-l"},h("label",{text:label}),out,inp,src?h("div",{class:"src",text:src}):null);
}
function vueReglages(){
 const el=$("#vue-reglages");el.replaceChildren();
 const c=h("div",{class:"carte"},h("h2",{text:"Hypothèses et paramètres"}),h("p",{class:"doux",text:"Chaque valeur dit d'où elle vient. Une hypothèse de démonstration doit être remplacée par une mesure ou une source avant toute décision."}));
 const cx=h("input",{type:"checkbox",id:"cx-case"});cx.checked=!!S.cx;
 cx.addEventListener("change",()=>{S.cx=cx.checked;document.documentElement.classList.toggle("cx",S.cx);try{sessionStorage.setItem("tc_cx",S.cx?"1":"")}catch(_){};});
 c.append(h("label",{class:"ligne-cx"},cx,"Contraste renforcé : textes et bordures plus marqués, décor retiré (mémorisé le temps de la session)"));
 D.PARAMS.forEach(x=>c.append(champ(x.l,S.p[x.k],x.step,x.min,x.max,v=>{S.p[x.k]=v;recompute();vueDG();vueTrajets();vueCarte();vueControles();vueProfil();vueSemaine()},x.src)));
 c.append(h("div",{class:"barre-outils"},h("button",{onclick:()=>{S.p=E.defaults();recompute();all()},text:"Revenir aux valeurs initiales"})));
 el.append(c);
}

/* ---------- Réel ---------- */
function vueReel(){
 const el=$("#vue-reel");el.replaceChildren();
 const rows=[
  ["Connexion avec le compte professionnel (Teams)","non","Simulée par un sélecteur de profils. Réel : application Teams enregistrée dans Microsoft Entra ID, connexion unique, accord de l'administrateur du tenant et de la DSI."],
  ["Notifications Teams","non","Absentes. Réel : notifications du fil d'activité via Microsoft Graph, avec permission d'envoi consentie ou validée par l'administrateur."],
  ["Comptes persistants et domiciles","non","Rien n'est stocké : cette page est statique. Réel : serveur, base chiffrée, droits par rôle, journal d'audit, suppression des données."],
  ["Temps de route et trafic en direct","non","Distances et durées précalculées (OSRM sur OpenStreetMap, sans trafic) pour les points fictifs. Réel : moteur de routage et fond de carte sous contrat, avec quotas et licences à vérifier."],
  ["Traces de déplacement réelles","non","Jeux de test uniquement. Réel : application mobile, information et base légale, droits des personnes."],
  ["Analyse d'impact (AIPD) et DPO","à faire","À décider avec le DPO de l'entreprise : la CNIL liste les traitements de localisation à large échelle parmi ceux qui peuvent en exiger une."],
  ["Hébergement sécurisé et tests d'intrusion","non","Pas de serveur ici. Réel : hébergement choisi par l'entreprise, revue de code, test d'intrusion."],
  ["Certification ISO/IEC 27001","jamais revendiquée","Une certification vient d'un organisme accrédité. La conception s'inspire de l'annexe A comme grille de contrôles, rien de plus."],
  ["Versements aux salariés","non","Aucun paiement n'existe. Réel : règles de paie, plafonds du forfait mobilités durables, attestation sur l'honneur."]
 ];
 el.append(h("div",{class:"carte"},h("h2",{text:"Ce qui reste à faire pour le réel"}),h("p",{text:"Cette démonstration montre le calcul et l'expérience. Elle ne remplace pas un déploiement : voici ce qui n'est pas fait."}),
  h("ul",{class:"statuts"},rows.map(r=>h("li",null,h("b",{text:r[0]+" : "}),h("span",{class:r[1]==="non"||r[1]==="jamais revendiquée"?"s-non":"s-sim",text:r[1]}),h("div",{class:"doux",text:r[2]})))),
  h("p",{class:"doux",text:"Sécurité de cette page : aucune requête externe, aucun cookie, aucune donnée saisie envoyée, politique de sécurité de contenu stricte. Détail dans SECURITE.md."})));
}

function all(){vueSemaine();vueDG();vueTrajets();vueCarte();vueProfil();vueControles();vueReglages();vueReel()}
document.querySelectorAll(".onglets button").forEach(b=>b.addEventListener("click",()=>{document.querySelectorAll(".onglets button").forEach(x=>x.classList.toggle("actif",x===b));document.querySelectorAll(".vue").forEach(v=>v.classList.toggle("actif",v.id==="vue-"+b.dataset.vue));window.scrollTo(0,0)}));
{const tabs=[...document.querySelectorAll(".onglets button")];
 const maj=()=>tabs.forEach(x=>x.setAttribute("aria-selected",x.classList.contains("actif")?"true":"false"));
 tabs.forEach((b,i)=>{b.addEventListener("click",maj);
  b.addEventListener("keydown",e=>{let j=null;const d={ArrowRight:1,ArrowLeft:-1}[e.key];
   if(d!=null)j=(i+d+tabs.length)%tabs.length;else if(e.key==="Home")j=0;else if(e.key==="End")j=tabs.length-1;
   if(j!=null){e.preventDefault();tabs[j].focus();tabs[j].click()}})});
 maj();}
recompute();all();
const hv=(location.hash||"").slice(1);if(hv){const b=document.querySelector('.onglets button[data-vue="'+hv.replace(/[^a-z]/g,"")+'"]');if(b){b.click();const m=/-(\d+)$/.exec(location.hash);if(m&&hv.startsWith('carte')){S.carteSel=+m[1];vueCarte()}}}
})();
