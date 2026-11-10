/* Tracé routier à la demande pour le SEUL groupe sélectionné sur la carte : une requête OSRM /route par tronçon manquant, 1 requête/s max,
   mise en cache de session, aucun chargement en masse. En cas d'échec le trait pointillé (ordre des points) reste, sans prétendre être une route. */
(function(g){const OSRM="https://router.project-osrm.org",cache=new Map(),fail=new Set();let busy=false,last=0;const file=[];
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
g.TCLEGS=g.TCLEGS||{};
g.TCSEL=function(t,redraw){setTimeout(()=>{const b=document.querySelector('#vue-carte .horaire.actif');if(b&&b.scrollIntoView)b.scrollIntoView({inline:'center',block:'nearest'})},0);const R=g.TCROUTE;if(!R||!t||!t.ev||!t.ev.pts)return;const idx={};R.pts.forEach((q,i)=>{idx[q[0].toFixed(5)+","+q[1].toFixed(5)]=i});
 const seq=t.ev.pts.map(q=>idx[q.lat.toFixed(5)+","+q.lng.toFixed(5)]);let ajout=false;
 for(let k=0;k<seq.length-1;k++){const key=seq[k]+">"+seq[k+1];if(seq[k]==null||seq[k+1]==null||g.TCLEGS[key]||fail.has(key)||file.some(f=>f[0]===key))continue;file.push([key,seq[k],seq[k+1]]);ajout=true}
 if(ajout&&!busy)run(redraw)};
g.TCETAT=function(t){const R=g.TCROUTE,idx={};R.pts.forEach((q,i)=>{idx[q[0].toFixed(5)+","+q[1].toFixed(5)]=i});const seq=t.ev.pts.map(q=>idx[q.lat.toFixed(5)+","+q.lng.toFixed(5)]);let ko=false,att=false;
 for(let k=0;k<seq.length-1;k++){const key=seq[k]+">"+seq[k+1];if(g.TCLEGS[key])continue;if(fail.has(key))ko=true;else att=true}
 return ko?"Tracé routier indisponible (serveur OSRM public) : points affichés, aucun itinéraire supposé.":att?"Tracé routier en cours de chargement (OSRM public, 1 requête/s)…":""};
async function run(redraw){busy=true;const R=g.TCROUTE;
 while(file.length){const [key,i,j]=file.shift();const d=Date.now()-last;if(d<1100)await sleep(1100-d);last=Date.now();
  try{const a=R.pts[i],b=R.pts[j];const r=await fetch(OSRM+"/route/v1/driving/"+a[1].toFixed(5)+","+a[0].toFixed(5)+";"+b[1].toFixed(5)+","+b[0].toFixed(5)+"?overview=full&geometries=geojson");const j2=await r.json();if(j2.code!=="Ok")throw 0;
   g.TCLEGS[key]=j2.routes[0].geometry.coordinates.map(c=>[+c[0].toFixed(5),+c[1].toFixed(5)])}catch(e){fail.add(key)}
  if(!file.length)redraw()}
 busy=false}
})(window);
