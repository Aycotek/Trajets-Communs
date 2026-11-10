/* L'application construit 28 profils ; l'essai en utilise 150 (même graine 2026). Capture aussi le dernier appariement pour le bilan. */
(function(g){const E=g.TCENGINE,o=E.population,m=E.match;g.TCLEGS={};/* les tronçons précalculés de l'essai à 28 profils ne correspondent plus aux index : tracés routiers chargés à la demande */
const PT=g.TCROUTE.pts;/* cas dispersé : mêmes 150 personnes (rôles, horaires, voitures) que le cas de départ, seuls les domiciles changent (points du réseau routier, plus étalés dans chaque commune) */
function applique(pop){pop.forEach((x,i)=>{const q=PT[1+i];x.home={lat:q[0],lng:q[1]};if(x.mode==="gare"){let b=null,bd=1e9;for(const s of g.TCDATA.GARES){const d=E.hav(x.home,s);if(d<bd){bd=d;b=s}}if(bd<12)x.gare=b;else{x.gare=null;x.mode="domicile"}}});return pop}
g.TCDISP={applique};
E.population=function(n,seed){return applique(o(150,2026))};
E.match=function(pop,p,state,out){const r=m(pop,p,state,out);if(pop&&pop.length>=100)E.last={p:Object.assign({},p),res:r,pop};return r};
})(window);
