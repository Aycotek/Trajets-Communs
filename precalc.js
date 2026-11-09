/* ATTENTION : ne lancer que contre une instance de routage dont les conditions d'usage sont connues et respectées (serveur de démonstration public : politique non vérifiée, aucun nouvel appel prévu). Précalcul unique (node precalc.js) : distances et durées routières entre les points FICTIFS de la démo,
   via le serveur de démonstration public OSRM sur données OpenStreetMap (© contributeurs OpenStreetMap, ODbL).
   Quelques requêtes seulement, une par seconde, aucun abonnement. Résultat daté dans route-data.js. */
require("./data.js");const E=require("./engine.js"),D=global.TCDATA||globalThis.TCDATA;
const fs=require("fs");
const pop=E.population(28,2026);
const pts=[];const key=p=>p.lat.toFixed(5)+","+p.lng.toFixed(5);
const add=p=>{if(!pts.find(q=>key(q)===key(p)))pts.push({lat:p.lat,lng:p.lng})};
add(D.SITE);pop.forEach(x=>{add(x.home);if(x.gare)add(x.gare)});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const B="https://router.project-osrm.org";
(async()=>{
 const coords=pts.map(p=>p.lng.toFixed(5)+","+p.lat.toFixed(5)).join(";");
 const t=await (await fetch(B+"/table/v1/driving/"+coords+"?annotations=distance,duration")).json();
 if(t.code!=="Ok")throw new Error(JSON.stringify(t).slice(0,200));
 const snap=t.sources.map(s=>({d:+s.distance.toFixed(0)}));
 const routes={};
 for(let i=1;i<pts.length;i++){
  await sleep(1100);
  const r=await (await fetch(B+"/route/v1/driving/"+coords.split(";")[i]+";"+coords.split(";")[0]+"?overview=simplified&geometries=geojson")).json();
  if(r.code==="Ok")routes[i]=r.routes[0].geometry.coordinates.map(c=>[+c[0].toFixed(4),+c[1].toFixed(4)]);
 }
 const out={date:new Date().toISOString().slice(0,10),source:"OSRM serveur de démonstration public (router.project-osrm.org), profil voiture, données © contributeurs OpenStreetMap (ODbL)",
  pts:pts.map(p=>[+p.lat.toFixed(5),+p.lng.toFixed(5)]),
  km:t.distances.map(r=>r.map(v=>v==null?null:+(v/1000).toFixed(2))),
  min:t.durations.map(r=>r.map(v=>v==null?null:+(v/60).toFixed(2))),
  snapM:snap.map(s=>s.d),routes};
 fs.writeFileSync("route-data.js","/* Généré par precalc.js, ne pas modifier à la main. */\n(function(g){g.TCROUTE="+JSON.stringify(out)+"})(typeof window!==\"undefined\"?window:globalThis);\n");
 console.log("points",pts.length,"routes",Object.keys(routes).length,"taille",fs.statSync("route-data.js").size,"snap max m",Math.max(...snap.map(s=>s.d)));
})().catch(e=>{console.error("ERR",e.message);process.exit(1)});
