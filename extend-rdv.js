/* Extension ponctuelle : ajoute 2 points de rendez-vous PUBLICS (aucun domicile, aucune donnée personnelle)
   à la matrice routière, via l'instance FOSSGIS routing.openstreetmap.de dont la politique d'usage
   (vérifiée le 10/11/2026 : 1 requête/s max, User-Agent identifiant, pas d'usage lourd, attribution ODbL)
   est connue et respectée : 3 requêtes au total, 1,1 s d'intervalle, usage unique.
   Même discipline que legs.js (conditions relevées le 9/11/2026). */
require("./route-data.js");const R=globalThis.TCROUTE;const fs=require("fs");
const RDV=[
 {id:"MSA",nom:"Place de l'Église, Mont-Saint-Aignan (centre du village)",lat:49.470794,lng:1.084378},
 {id:"SS",nom:"Place Saint-Sever, Rouen (direction Saint-Sever)",lat:49.430784,lng:1.085467}
];
const pts=R.pts.map(p=>({lat:p[0],lng:p[1]})).concat(RDV.map(p=>({lat:p.lat,lng:p.lng})));
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const B="https://routing.openstreetmap.de/routed-car";
const H={"User-Agent":"TrajetsCommuns-demo/1.0 (demo fictive, precalcul ponctuel; https://github.com/Aycotek/Trajets-Communs)"};
(async()=>{
 const coords=pts.map(p=>p.lng.toFixed(5)+","+p.lat.toFixed(5)).join(";");
 const t=await (await fetch(B+"/table/v1/driving/"+coords+"?annotations=distance,duration",{headers:H})).json();
 if(t.code!=="Ok")throw new Error(JSON.stringify(t).slice(0,200));
 const snap=t.sources.map(s=>({d:+s.distance.toFixed(0)}));
 const routes={};const site=coords.split(";")[0];
 for(let i=pts.length-RDV.length;i<pts.length;i++){
  await sleep(1100);
  const r=await (await fetch(B+"/route/v1/driving/"+coords.split(";")[i]+";"+site+"?overview=simplified&geometries=geojson",{headers:H})).json();
  if(r.code==="Ok")routes[i]=r.routes[0].geometry.coordinates.map(c=>[+c[0].toFixed(4),+c[1].toFixed(4)]);
 }
 const out={date:new Date().toISOString().slice(0,10),
  source:"OSRM via routing.openstreetmap.de (hébergé FOSSGIS, politique d'usage respectée : 1 req/s, UA identifiant, usage léger unique) ; profil voiture ; données © contributeurs OpenStreetMap (ODbL). Matrice initiale du 09/11/2026 régénérée sur cette instance pour homogénéité ; 2 points de rendez-vous publics ajoutés (aucun domicile).",
  pts:pts.map(p=>[+p.lat.toFixed(5),+p.lng.toFixed(5)]),
  km:t.distances.map(r=>r.map(v=>v==null?null:+(v/1000).toFixed(2))),
  min:t.durations.map(r=>r.map(v=>v==null?null:+(v/60).toFixed(2))),
  snapM:snap.map(s=>s.d),
  routes:Object.assign({},R.routes,routes)};
 fs.writeFileSync("route-data.js","/* Généré par precalc.js puis étendu par extend-rdv.js, ne pas modifier à la main. */\n(function(g){g.TCROUTE="+JSON.stringify(out)+"})(typeof window!==\"undefined\"?window:globalThis);\n");
 console.log("points",pts.length,"routes nouvelles",Object.keys(routes).length,"snap max m",Math.max(...snap.map(s=>s.d)));
})().catch(e=>{console.error("ERR",e.message);process.exit(1)});
