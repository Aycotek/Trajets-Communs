/* Bilan de la semaine simulée : passagers servis, non servis, minutes conducteur. Texte seulement (textContent). */
(function(){const E=window.TCENGINE,el=document.getElementById("resume150");if(!el)return;
const h=(t,a,...k)=>{const e=document.createElement(t);if(a)for(const x in a)e.setAttribute(x,a[x]);k.forEach(c=>e.append(c.nodeType?c:document.createTextNode(String(c))));return e};
const JN=["lundi","mardi","mercredi","jeudi","vendredi"];
function draw(){el.replaceChildren();const L=E.last;if(!L){el.append(h("p",null,"Pas encore de bilan."));return}
 const {p,res,pop}=L,ns=res.nonServis||[],byId=Object.fromEntries(pop.map(x=>[x.id,x]));
 const dm=res.trips.map(t=>t.ev.dmin),mx=dm.length?Math.max(...dm):0,sorted=[...dm].sort((a,b)=>a-b),p90=sorted.length?sorted[Math.floor(.9*sorted.length)]:0;
 el.append(h("h2",null,"Bilan simulé de la semaine"));
 if(res.erreurSource){el.append(h("p",{role:"alert"},res.erreurSource));return}
 el.append(h("p",null,res.trips.length+" trajets. Plafond de minutes conducteur : "+(p.maxDrvMin>0?p.maxDrvMin+" min (simulation)":"aucun")+". Minutes ajoutées à un conducteur (arrêts inclus) : maximum "+mx.toFixed(1)+" min, 90e centile "+p90.toFixed(1)+" min."));
 if(res.instable&&res.instable.length)el.append(h("p",{role:"alert"},"Aucun plan prêt pour : "+res.instable.map(d=>JN[d]).join(", ")+" (nombre maximal de tours du rematching atteint, plan non stable)."));
 if(!(p.journeeComplete&&p.rolesFixes))el.append(h("p",{class:"doux"},"Journée complète désactivée : des aller sans retour sont possibles et ne sont pas signalés ici."));
 const cnt={continuite:0,proprietaire:0,sansVoiture:0},cc={a:0,b:0};
 ns.forEach(x=>{cnt[x.cause]=(cnt[x.cause]||0)+1;if(x.cause==="continuite"){byId[x.id]&&byId[x.id].aVoiture?cc.a++:cc.b++}});
 const box=h("div",{class:"sim"});
 box.append(h("p",null,"Présences non conductrices sans groupe : "+ns.length+" (une présence = une personne un jour de la semaine)."));
 box.append(h("ul",null,
  h("li",null,cnt.continuite+" écartées par la règle aller-retour (aucun trajet à sens unique) : "+cc.a+" avec voiture, "+cc.b+" sans."),
  h("li",null,cnt.proprietaire+" avec voiture, non désignées conductrices ce jour-là, sans groupe."),
  h("li",null,cnt.sansVoiture+" sans voiture, sans groupe.")));
 box.append(h("p",{class:"doux"},"Aucun repli n'est défini. Rien ne dit que ces personnes pourraient conduire seules : cela dépend de leur préférence et de leur voiture ce jour-là. Le rematching est une heuristique, il peut perdre des solutions faisables ; les plans complets sont une règle imposée, pas un gain mesuré."));
 if(ns.length){const d=h("details");d.append(h("summary",null,"Détail par personne"));const ul=h("ul");ns.forEach(x=>ul.append(h("li",null,(byId[x.id]?byId[x.id].nom:x.id)+", "+JN[x.day]+" : "+({continuite:"écartée (aller-retour)",proprietaire:"avec voiture, hors groupe",sansVoiture:"sans voiture"}[x.cause]||""))));d.append(ul);box.append(d)}
 el.append(box)}
window.addEventListener("click",()=>setTimeout(draw,50));window.addEventListener("input",()=>setTimeout(draw,50));setTimeout(draw,300);
})();
