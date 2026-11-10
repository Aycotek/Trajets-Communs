/* L'application construit 28 profils ; l'essai en utilise 150 (même graine 2026). Capture aussi le dernier appariement pour le bilan. */
(function(g){const E=g.TCENGINE,o=E.population,m=E.match;g.TCLEGS={};/* les tronçons précalculés de l'essai à 28 profils ne correspondent plus aux index : tracés routiers chargés à la demande */
E.population=function(n,seed){return o(150,seed)};
E.match=function(pop,p,state,out){const r=m(pop,p,state,out);if(pop&&pop.length>=100)E.last={p:Object.assign({},p),res:r,pop};return r};
})(window);
