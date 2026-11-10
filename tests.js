/* Tests du moteur : node tests.js. Vérifient les invariants, pas la réalité métier. */
const assert=require("assert");require("./route-data.js");require("./route-legs.js");require("./data.js");const E=require("./engine.js");
let n=0;const ok=(c,m)=>{assert(c,m);n++};
const p=E.defaults(),pop=E.population(28,2026);
ok(pop.length===28,"28 profils");
ok(pop.every(x=>/fictif|arbre|^[A-Z]/i.test(x.id+x.nom||"x")),"profils présents");
const r1=E.match(pop,p),r2=E.match(E.population(28,2026),p);
ok(r1.trips.length===r2.trips.length&&r1.trips.length>0,"déterministe et non vide");
const cap=p.places||p.capacite||4;
for(const t of r1.trips){
  ok(t.ev.detour<=p.maxDetourKm+1e-6,"détour max respecté");
  ok(!t.pax.some(x=>x.id===t.drv.id),"conducteur différent des passagers");
  ok(t.ev.km>0&&t.ev.arrive>t.ev.depart,"durée positive");
  ok(t.m.prudent<=t.m.brut+1e-9,"prudent <= brut");
}
const b=E.bilan(r1.trips,p);
ok(b.L.cor.n<=b.L.dec.n&&b.L.dec.n<=b.L.pot.n,"corroboré <= déclaré <= potentiel");
const p2=Object.assign({},p,{maxDetourKm:1});const r3=E.match(pop,p2);
ok(r3.trips.length<=r1.trips.length,"détour plus strict, pas plus de trajets");
const p3=Object.assign({},p,{detourFacteur:2});
ok(E.match(pop,p3).trips.length<=r1.trips.length+5,"facteur route plus haut, pas d'explosion");
console.log(n+" vérifications passées");
const rouenParis=E.hav?E.hav({lat:49.4432,lng:1.0993},{lat:48.8566,lng:2.3522}):null;
if(rouenParis!==null){assert(Math.abs(rouenParis-112)<3,"haversine Rouen-Paris");console.log("haversine ok "+rouenParis.toFixed(1));}

/* Invariants sur ensembles (toujours vrais) et sur la métrique nette (pas toujours monotone). */
const ids=(L)=>new Set(L.map(t=>t.id));
for(const seed of [2026,1,2,3,4,5]){
  const pp=E.defaults(),po=E.population(28,seed),rr=E.match(po,pp);
  const bb=E.bilan(rr.trips,pp);
  const acc=rr.trips.filter(t=>t.accepte),cor=acc.filter(t=>t.controle.verdict==="corroboré");
  ok(acc.length>0&&cor.length>0,"niveaux non vides, graine "+seed);
  ok(cor.every(t=>acc.includes(t))&&acc.every(t=>rr.trips.includes(t)),"corroboré inclus dans déclaré inclus dans potentiel (ensembles), graine "+seed);
  const somme=cor.reduce((a,t)=>a+t.m.prudent,0);
  ok(Math.abs(somme-bb.L.cor.prud)<1e-6,"bilan = somme des trajets, graine "+seed);
  ok(bb.L.cor.n<=bb.L.dec.n,"nombre de trajets corroborés <= déclarés");
}
/* La graine 1 est un cas réel ou le CO2 net prudent corroboré dépasse le déclaré : retirer un trajet non corroboré dont le net est négatif fait monter le total. */
{const pp=E.defaults(),rr=E.match(E.population(28,1),pp),bb=E.bilan(rr.trips,pp);
 ok(bb.L.cor.prud>bb.L.dec.prud,"cas documenté : net non monotone (graine 1)");
 const retires=rr.trips.filter(t=>t.accepte&&t.controle.verdict!=="corroboré");
 ok(retires.reduce((a,t)=>a+t.m.prudent,0)<0,"les trajets retirés ont un net négatif cumulé");}
/* Routage : routes précalculées vs estimation. */
{const pa=E.defaults(),pb=Object.assign({},pa,{routeReel:0});
 const R=globalThis.TCROUTE;ok(R&&R.pts.length>=30&&R.km[1][0]>0,"matrice routière chargée");
 const ra=E.match(E.population(28,2026),pa),rb=E.match(E.population(28,2026),pb);
 ok(ra.trips.length>0&&rb.trips.length>0,"deux modes de calcul fonctionnent");
 const i=1,hv=E.hav({lat:R.pts[i][0],lng:R.pts[i][1]},{lat:R.pts[0][0],lng:R.pts[0][1]});
 ok(R.km[i][0]>=hv*0.99,"distance routière >= vol d'oiseau");}
{const R=globalThis.TCROUTE,L=globalThis.TCLEGS,idx={};R.pts.forEach((q,i)=>{idx[q[0].toFixed(5)+","+q[1].toFixed(5)]=i});
 const rr=E.match(E.population(28,2026),E.defaults());let manque=0;
 rr.trips.forEach(t=>{for(let i=0;i<t.ev.pts.length-1;i++){const a=t.ev.pts[i],b=t.ev.pts[i+1];if(!L[idx[a.lat.toFixed(5)+","+a.lng.toFixed(5)]+">"+idx[b.lat.toFixed(5)+","+b.lng.toFixed(5)]])manque++}});
 ok(manque<=25,"tronçons sans tracé précalculé : "+manque+" (dessinés en pointillé, aucun appel OSRM)");
 ok(E.defaults().ef===0.17,"facteur voiture Impact CO2");}
/* Consentements : un accord unilatéral ne confirme rien */
{const pp=E.defaults(),po=E.population(28,2026),rr=E.match(po,pp),b0=E.bilan(rr.trips,pp);
 const K=E.tripKey;
 const pend=rr.trips.find(t=>!t.simAccepte),conf=rr.trips.find(t=>t.simAccepte);
 ok(pend&&conf,"un trajet non accepté par tirage et un accepté existent");
 let over={};over[K(pend)+"#"+pend.drv.id]="accepte";
 let b1=E.bilan(rr.trips,pp,undefined,over);
 ok(pend.accepte===false&&b1.L.dec.n===b0.L.dec.n,"accord unilatéral du conducteur : non confirmé, bilan inchangé");
 over={};over[K(pend)+"#"+pend.pax[0].id]="accepte";E.bilan(rr.trips,pp,undefined,over);
 ok(pend.accepte===false,"accord unilatéral d'un passager : non confirmé");
 over={};[pend.drv,...pend.pax].forEach(q=>over[K(pend)+"#"+q.id]="accepte");
 b1=E.bilan(rr.trips,pp,undefined,over);
 ok(pend.accepte===true&&b1.L.dec.n===b0.L.dec.n+1&&b1.L.pot.n===b0.L.pot.n,"tous acceptent : exactement un déclaré de plus, potentiel inchangé");
 over={};over[K(conf)+"#"+conf.drv.id]="accepte";E.bilan(rr.trips,pp,undefined,over);
 ok(conf.accepte===true,"accord d'un participant, autres simulés favorables : confirmé");
 E.bilan(rr.trips,pp,undefined,{});
 ok(E.bilan(rr.trips,pp,undefined,{}).L.dec.n===b0.L.dec.n,"sans décision, bilan identique");
 ok(K(rr.trips[0])===K(E.match(E.population(28,2026),pp).trips[0]),"clé de trajet stable");}
/* Retrait d'une personne : recalcul réel du créneau */
{let vus=0;
 for(const seed of [2026,1,2,3,4,5,6,7]){
  const pp=E.defaults(),po=E.population(28,seed),rr=E.match(po,pp);
  const multi=rr.trips.find(t=>t.pax.length>=2),uni=rr.trips.find(t=>t.pax.length===1);
  const cas=[];if(multi)cas.push([multi,multi.pax[0],"pax"]);if(uni)cas.push([uni,uni.drv,"drv"],[uni,uni.pax[0],"seul"]);
  for(const [t,who,type] of cas){
   const out={};out[t.day+t.dir+"|"+who.id]=true;
   const r2=E.match(po,pp,undefined,out);vus++;
   const slot=r2.trips.filter(q=>q.day===t.day&&q.dir===t.dir);
   ok(!slot.some(q=>q.drv.id===who.id||q.pax.some(y=>y.id===who.id)),"la personne retirée n'est plus dans aucun trajet du créneau");
   ok(slot.every(q=>q.pax.length<=pp.places&&q.ev.detour<=pp.maxDetourKm+1e-6),"capacité et détour respectés après retrait");
   const touch=slot.find(q=>q.drv.id===t.drv.id);
   if(type==="pax"){ok(!touch||touch.pax.length<=t.pax.length,"retrait d'un passager : le trajet ne grossit pas");if(touch&&touch.pax.length===t.pax.length-1){ok(touch.ev.km<=t.ev.km+1e-6,"un passager en moins : trajet pas plus long")}}
   if(type==="drv")ok(!slot.some(q=>q.pax.some(y=>y.id===t.pax[0].id))||slot.some(q=>q.drv.id!==t.drv.id),"conducteur retiré : le passager est replacé avec un autre conducteur ou sans trajet");
   const bb=E.bilan(r2.trips,pp);ok(bb.L.cor.n<=bb.L.dec.n&&bb.L.dec.n<=bb.L.pot.n,"ensembles corroboré <= déclaré <= potentiel après retrait");
   ok(!out[t.day+t.dir+"|"+"x"],"clé");
  }}
 ok(vus>=6,"cas de retrait exercés ("+vus+")");
 const base=E.match(E.population(28,2026),E.defaults());
 ok(E.match(E.population(28,2026),E.defaults(),undefined,{}).trips.length===base.trips.length,"sans retrait, même résultat");}
/* Non-régression : un retrait ne touche que le trajet concerné ; tout le reste de la semaine est gelé */
{let cas=0;const sig=(L)=>L.map(t=>E.tripKey(t)+"@"+t.ev.km.toFixed(4)).sort();
 for(const seed of [2026,1,2,3,4,5,6,7]){
  const pp=E.defaults(),po=E.population(28,seed),rr=E.match(po,pp);
  for(const t of rr.trips.slice(0,12)){
   for(const who of [t.drv,t.pax[0]]){
    const out={};out[t.day+t.dir+"|"+who.id]=true;const r2=E.match(po,pp,undefined,out);cas++;
    const autres=(L)=>L.filter(q=>!(q.day===t.day&&q.dir===t.dir));
    ok(JSON.stringify(sig(autres(r2.trips)))===JSON.stringify(sig(autres(rr.trips))),"lundi annulé ne modifie aucun autre créneau de la semaine");
    const memeCreneau=(L)=>L.filter(q=>q.day===t.day&&q.dir===t.dir&&q.drv.id!==t.drv.id&&!q.pax.some(y=>y.id===who.id));
    const avant=memeCreneau(rr.trips).filter(q=>q.drv.id!==who.id&&!q.pax.some(y=>y.id===who.id));
    const apres=r2.trips.filter(q=>q.day===t.day&&q.dir===t.dir);
    ok(avant.filter(q=>q.drv.id!==t.drv.id).every(q=>apres.some(a=>E.tripKey(a)===E.tripKey(q))),"les autres trajets du même créneau, non concernés, restent identiques");
   }}}
 ok(cas>=100,"retraits exercés pour la non-régression ("+cas+")");}
/* Départ ajouté tard : aucun trajet existant ne change */
{let cas=0;
 for(const seed of [2026,1,2,3,4,5]){
  const pp=E.defaults(),po=E.population(28,seed),rr=E.match(po,pp);
  const abs=[];po.forEach(x=>x.jours.forEach((j,d)=>{if(!j.present)abs.push([x,d])}));
  for(const [x,d] of abs.slice(0,6))for(const dir of["matin","soir"]){
   const out={};out[d+dir+"|"+x.id]="+";const r2=E.match(po,pp,undefined,out);cas++;
   const k=L=>L.map(t=>E.tripKey(t)).sort().join(";");
   const avant=rr.trips,apres=r2.trips;
   ok(avant.every(t=>apres.some(q=>E.tripKey(q)===E.tripKey(t))),"ajout tardif : tous les trajets existants restent identiques");
   const nouveaux=apres.filter(q=>!avant.some(t=>E.tripKey(t)===E.tripKey(q)));
   ok(nouveaux.every(q=>[q.drv,...q.pax].some(y=>y.id===x.id)),"ajout tardif : un nouveau trajet contient forcément la personne ajoutée");
   ok(nouveaux.every(q=>q.pax.length<=pp.places&&q.ev.detour<=pp.maxDetourKm+1e-6),"ajout tardif : capacité et détour respectés");
  }}
 ok(cas>=20,"ajouts tardifs exercés ("+cas+")");}
/* Sensibilité financière : le coût au km agit linéairement sur les euros conducteurs */
{const po=E.population(28,2026);let prev=-1,prevP=Infinity;
 for(const c of [0.10,0.20,0.30,0.636]){const q=Object.assign({},E.defaults(),{coutKm:c}),bb=E.bilan(E.match(po,q).trips,q);
  ok(bb.L.dec.eurDrv>prev,"économie conducteur croît avec le coût au km");prev=bb.L.dec.eurDrv;
  ok(bb.L.pot.n===E.bilan(E.match(po,E.defaults()).trips,E.defaults()).L.pot.n,"le coût au km ne change pas les trajets proposés");}
 const q0=Object.assign({},E.defaults(),{coutKm:0}),b0=E.bilan(E.match(po,q0).trips,q0);
 ok(Math.abs(b0.L.dec.eurDrv)<1e-9||b0.L.dec.eurDrv<=0,"à 0 €/km les conducteurs n'économisent rien");}
/* Direction du détour et crédit CO2 */
{const pp=E.defaults();let negs=0;
 for(const seed of [2026,1,2,3]){const po=E.population(28,seed),rr=E.match(po,pp);
  for(const t of rr.trips){const R=globalThis.TCROUTE;
   const solo=t.dir==="matin"?E.hav(t.drv.home,t.ev.pts[t.ev.pts.length-1]):0;
   if(t.ev.detour<0){negs++;const m2=Object.assign({},t.m);ok(t.m.detourCO2>=0,"un détour négatif ne crédite jamais de CO2");}
   ok(t.m.detourCO2>=0,"CO2 de détour jamais négatif");}}
 console.log("détours négatifs (route via arrêt plus courte en km que la directe) : "+negs+" sur 4 semaines, CO2 de détour mis à 0");}
/* Unicité de placement : une personne dans un seul trajet par créneau, sur 10 graines */
{for(const seed of [2026,1,2,3,4,5,6,7,8,9]){const po=E.population(28,seed),rr=E.match(po,E.defaults());
 const seen=new Set();
 for(const tr of rr.trips)for(const x of [tr.drv,...tr.pax]){const k=tr.day+tr.dir+"|"+x.id;ok(!seen.has(k),"aucun doublon "+k);seen.add(k)}}}
/* Profils extrêmes */
{const p9=E.defaults();
 const noCar=E.population(28,7).map(x=>Object.assign({},x,{aVoiture:false}));
 ok(E.match(noCar,p9).trips.length===0,"aucune voiture : aucun trajet, pas de plantage");
 const absLun=E.population(28,7).map(x=>Object.assign({},x,{jours:x.jours.map((j,i)=>i===0?Object.assign({},j,{present:false}):j)}));
 ok(E.match(absLun,p9).trips.every(tr=>tr.day!==0),"tous absents lundi : aucun trajet lundi");
 const meme=E.population(28,7).map(x=>Object.assign({},x,{home:{lat:49.44,lng:1.09},mode:"domicile",gare:null}));
 const rm=E.match(meme,p9);
 ok(rm.trips.length>0,"tous au même endroit : des trajets se forment");
 ok(rm.trips.every(tr=>tr.ev.detour<=0.2),"tous au même endroit : détour quasi nul");}

/* Injection : aucune écriture HTML brute dans le code applicatif */
{const fs=require("fs");const src=[""+fs.readFileSync("app.js"),""+fs.readFileSync("engine.js"),""+fs.readFileSync("data.js")].join("\n");
 ok(!/innerHTML|outerHTML|insertAdjacentHTML|document\.write/.test(src),"aucune écriture HTML brute (innerHTML et équivalents absents)");
 ok(/e\.textContent=attrs\[k\]/.test(src),"le constructeur h() écrit le texte via textContent");}
console.log(n+" vérifications au total");
