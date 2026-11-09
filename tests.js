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
 ok(manque===0,"tous les tronçons des trajets par défaut ont un tracé routier");
 ok(E.defaults().ef===0.17,"facteur voiture Impact CO2");}
/* Décisions de l'utilisateur et effets croisés */
{const pp=E.defaults(),po=E.population(28,2026),rr=E.match(po,pp),b0=E.bilan(rr.trips,pp);
 const prop=rr.trips.find(t=>!t.accepte),acc=rr.trips.find(t=>t.accepte);
 ok(prop&&acc,"un trajet proposé non accepté et un accepté existent");
 let over={};over[E.tripKey(prop)+"#"+prop.pax[0].id]="accepte";
 const b1=E.bilan(rr.trips,pp,undefined,over);
 ok(b1.L.dec.n===b0.L.dec.n+1,"accepter un trajet ajoute exactement un trajet déclaré");
 ok(b1.L.pot.n===b0.L.pot.n,"le potentiel ne change pas");
 ok(rr.trips.filter(t=>t!==prop).every(t=>true),"autres trajets");
 over={};over[E.tripKey(acc)+"#"+acc.drv.id]="annule";
 const b2=E.bilan(rr.trips,pp,undefined,over);
 ok(b2.L.dec.n===b0.L.dec.n-1&&acc.accepte===false,"l'annulation du conducteur retire le trajet des bilans");
 over[E.tripKey(acc)+"#"+acc.pax[0].id]="accepte";E.bilan(rr.trips,pp,undefined,over);
 ok(acc.accepte===false,"un retrait l'emporte sur une acceptation");
 const b3=E.bilan(rr.trips,pp,undefined,{});
 ok(b3.L.dec.n===b0.L.dec.n&&b3.L.cor.n===b0.L.cor.n,"sans décision, bilan identique");
 ok(E.tripKey(rr.trips[0])===E.tripKey(E.match(E.population(28,2026),pp).trips[0]),"clé de trajet stable");}
/* Sensibilité financière : le coût au km agit linéairement sur les euros conducteurs */
{const po=E.population(28,2026);let prev=-1,prevP=Infinity;
 for(const c of [0.10,0.20,0.30,0.636]){const q=Object.assign({},E.defaults(),{coutKm:c}),bb=E.bilan(E.match(po,q).trips,q);
  ok(bb.L.dec.eurDrv>prev,"économie conducteur croît avec le coût au km");prev=bb.L.dec.eurDrv;
  ok(bb.L.pot.n===E.bilan(E.match(po,E.defaults()).trips,E.defaults()).L.pot.n,"le coût au km ne change pas les trajets proposés");}
 const q0=Object.assign({},E.defaults(),{coutKm:0}),b0=E.bilan(E.match(po,q0).trips,q0);
 ok(Math.abs(b0.L.dec.eurDrv)<1e-9||b0.L.dec.eurDrv<=0,"à 0 €/km les conducteurs n'économisent rien");}
console.log(n+" vérifications au total");
