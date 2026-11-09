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
console.log(n+" vérifications au total");
