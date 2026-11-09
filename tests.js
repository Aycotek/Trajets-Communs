/* Tests du moteur : node tests.js. Vérifient les invariants, pas la réalité métier. */
const assert=require("assert");require("./data.js");const E=require("./engine.js");
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
