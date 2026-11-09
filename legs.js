/* Précalcul des tronçons de la semaine par défaut (node legs.js). Conditions relevées le 9/11/2026 : politique du serveur de démonstration OSRM (wiki Project-OSRM, Api-usage-policy) et conditions FOSSGIS : usage léger, User-Agent identifiant l application, une seule connexion pour un script, attribution ODbL, pas de téléchargement massif ; aucune garantie, accès révocable. Pas de service de production sur ce serveur. */
require("./route-data.js");require("./data.js");const E=require("./engine.js");const fs=require("fs");
const R=globalThis.TCROUTE,idx={};R.pts.forEach((q,i)=>{idx[q[0].toFixed(5)+","+q[1].toFixed(5)]=i});
const k=q=>idx[q.lat.toFixed(5)+","+q.lng.toFixed(5)];
const p=E.defaults(),pop=E.population(28,2026),r=E.match(pop,p);
const need=new Set();
r.trips.forEach(t=>{const a=t.ev.pts;for(let i=0;i<a.length-1;i++)need.add(k(a[i])+">"+k(a[i+1]))});
const existing=fs.existsSync("legs.json")?JSON.parse(fs.readFileSync("legs.json")):{};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const list=[...need].filter(x=>!existing[x]);console.log("legs",need.size,"à faire",list.length);
 const t0=Date.now();
 for(const key of list){if(Date.now()-t0>95000)break;
  const [i,j]=key.split(">").map(Number);
  const u="https://router.project-osrm.org/route/v1/driving/"+R.pts[i][1].toFixed(5)+","+R.pts[i][0].toFixed(5)+";"+R.pts[j][1].toFixed(5)+","+R.pts[j][0].toFixed(5)+"?overview=simplified&geometries=geojson";
  try{const x=await (await fetch(u,{headers:{"User-Agent":"TrajetsCommuns-demo/1.0 (demo fictive, precalcul ponctuel; https://github.com/Aycotek/Trajets-Communs)","Referer":"https://aycotek.github.io/Trajets-Communs/"}})).json();if(x.code==="Ok")existing[key]=x.routes[0].geometry.coordinates.map(c=>[+c[0].toFixed(4),+c[1].toFixed(4)])}catch(e){}
  await sleep(1100)}
 fs.writeFileSync("legs.json",JSON.stringify(existing));
 const left=[...need].filter(x=>!existing[x]).length;console.log("restant",left);
 if(left===0){fs.writeFileSync("route-legs.js","/* Généré par legs.js. Tronçons routiers OSRM/OpenStreetMap (ODbL) des trajets de la semaine par défaut. */\n(function(g){g.TCLEGS="+JSON.stringify(existing)+"})(typeof window!==\"undefined\"?window:globalThis);\n");console.log("écrit",fs.statSync("route-legs.js").size)}
})();
