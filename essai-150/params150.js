/* Paramètres de SIMULATION ajoutés pour l'essai 150 : aucun seuil n'est adopté, ni préférence d'Arthur, ni règle de production. */
(function(g){const D=g.TCDATA;
D.PARAMS.push(
 {k:"maxDrvMin",l:"Plafond de minutes ajoutées au conducteur (0 = aucun plafond). Paramètre de simulation",v:0,min:0,max:30,step:1,src:"Paramètre de simulation : les minutes incluent 2 min d'arrêt par passager. Aucun seuil n'est recommandé ni adopté ; à décider avec les personnes concernées."},
 {k:"rolesFixes",l:"Rôles du jour fixés (1) ou libres (0). Les flexibles conduisent si leur trajet direct est au moins la médiane des flexibles du jour",v:1,min:0,max:1,step:1,src:"Règle de simulation du banc. Avec 0, un propriétaire peut être conducteur et passager : voitures mal placées, non couvert par la vérification."},
 {k:"journeeComplete",l:"Journée complète (1) : aucun passager n'a un aller sans retour ou l'inverse ; sinon il est non servi",v:1,min:0,max:1,step:1,src:"Rematching par point fixe (retrait des passagers appariés d'un seul côté). Heuristique : peut perdre des solutions faisables. Un non servi n'a aucun trajet ni repli proposé. Sans effet si les rôles sont libres."}
);})(typeof globalThis!=="undefined"?globalThis:window);
