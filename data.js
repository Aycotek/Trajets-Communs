/* Données FICTIVES de démonstration. Aucun salarié réel, aucune adresse de domicile réelle.
   Seuls les points de repère (site d'arrivée, gares, centres de communes) sont réels. */
(function(g){
const D={};
D.SITE={nom:"Site d'arrivée (pilote)",adresse:"1 rue Guglielmo Marconi, 76130 Mont-Saint-Aignan",lat:49.47717,lng:1.09159};
D.GARES=[
 {id:"RD",nom:"Rouen Rive Droite",lat:49.44891,lng:1.09414},
 {id:"OI",nom:"Oissel",lat:49.34308,lng:1.10185},
 {id:"EL",nom:"Elbeuf - Saint-Aubin",lat:49.30271,lng:1.01013},
 {id:"BA",nom:"Barentin",lat:49.54918,lng:0.95362}
];
D.COMMUNES=[
 {n:"Bois-Guillaume",lat:49.47075,lng:1.11542,w:3},
 {n:"Déville-lès-Rouen",lat:49.46996,lng:1.04991,w:2},
 {n:"Darnétal",lat:49.44679,lng:1.15322,w:2},
 {n:"Canteleu",lat:49.45130,lng:1.03551,w:2},
 {n:"Le Mesnil-Esnard",lat:49.41272,lng:1.14553,w:2},
 {n:"Isneauville",lat:49.49836,lng:1.14224,w:2},
 {n:"Sotteville-lès-Rouen",lat:49.41474,lng:1.09154,w:3},
 {n:"Franqueville-Saint-Pierre",lat:49.40400,lng:1.17125,w:2},
 {n:"Rouen centre",lat:49.44353,lng:1.09843,w:4},
 {n:"Le Petit-Quevilly",lat:49.42989,lng:1.05433,w:2},
 {n:"Oissel",lat:49.34308,lng:1.10185,w:1},
 {n:"Elbeuf",lat:49.30271,lng:1.01013,w:1},
 {n:"Barentin",lat:49.54918,lng:0.95362,w:1}
];
D.NOMS=["Tilleul","Hêtre","Bouleau","Érable","Sapin","Frêne","Chêne","Orme","Saule","Peuplier","Cèdre","Noyer","Aulne","Charme","Mélèze","Platane","Cyprès","Merisier","Sureau","Troène","Genêt","Lilas","Tamaris","Houx","Buis","Févier","Ginkgo","Catalpa"];
/* 'src' dit d'où vient la valeur : source, ou hypothèse de démonstration à remplacer. */
D.PARAMS=[
 {k:"ef",l:"Facteur d'émission voiture (kgCO2e par km et par voiture)",v:0.17,min:0.05,max:0.4,step:0.001,src:"Impact CO2 (outil public), page « Voiture thermique (Moyenne - Essence) » dont l'adresse indique une voiture compacte essence : 170 g CO2e/km dont 31,7 g de fabrication et 138 g de carburant, https://impactco2.fr/outils/transport/voiture-compact-essence (consulté le 9 nov. 2026). Valeur par véhicule, pas par passager. Ce n'est pas une moyenne prouvée du parc thermique : le parc réel de l'entreprise (diesel, hybride, électrique) demande la ligne exacte de la Base Empreinte ADEME."},
 {k:"efAlt",l:"Facteur autre mode, passager sans voiture (kgCO2e/km)",v:0.05,min:0,max:0.3,step:0.005,src:"Hypothèse de démonstration (bus, train, déposé). À remplacer par l'enquête mobilité interne."},
 {k:"partVoiture",l:"Part des passagers avec voiture qui l'auraient prise (méthode prudente)",v:0.6,min:0,max:1,step:0.05,src:"Hypothèse de démonstration, à mesurer par enquête interne. La méthode brute suppose 100 % (logique de l'Observatoire du covoiturage)."},
 {k:"coutKm",l:"Coût de la voiture partageable (EUR/km)",v:0.2,min:0.05,max:0.7,step:0.01,src:"Hypothèse de démonstration : carburant, usure, assurance (postes de partage de frais autorisés). Le barème fiscal 2025 5 CV (0,636 EUR/km jusqu'à 5 000 km) sert de borne haute, ce n'est pas un coût marginal."},
 {k:"coutAlt",l:"Coût autre mode, passager sans voiture (EUR/km)",v:0.1,min:0,max:0.5,step:0.01,src:"Hypothèse de démonstration."},
 {k:"routeReel",l:"Distances et durées : 1 = routes précalculées, 0 = estimation à vol d'oiseau",v:1,min:0,max:1,step:1,src:"Routes précalculées le "+((globalThis.TCROUTE||{}).date||"?")+" par le serveur de démonstration OSRM sur données OpenStreetMap (ODbL), sans trafic ni horaires. Valable seulement pour les points fictifs de cette démo."},
 {k:"detourFacteur",l:"Facteur route / vol d'oiseau",v:1.3,min:1,max:2,step:0.05,src:"Utilisé seulement si le réglage précédent vaut 0."},
 {k:"vitesse",l:"Vitesse moyenne estimée (km/h)",v:35,min:15,max:70,step:1,src:"Utilisé seulement si les routes précalculées sont désactivées."},
 {k:"maxDetourKm",l:"Détour maximal du conducteur (km)",v:8,min:1,max:25,step:1,src:"Choix produit, à fixer avec la direction."},
 {k:"maxExtraMin",l:"Temps en plus maximal pour un passager (min)",v:15,min:0,max:40,step:1,src:"Choix produit."},
 {k:"places",l:"Places passagers par voiture",v:3,min:1,max:4,step:1,src:"Choix produit."},
 {k:"bonusAcces",l:"Pondération sociale par passager sans voiture (kgCO2e équivalents)",v:1,min:0,max:5,step:0.5,src:"Choix produit : propose un trajet même quand le bilan CO2 est nul ou négatif, parce qu'il rend le trajet possible."},
 {k:"accept",l:"Part des propositions acceptées (trajets déclarés)",v:0.6,min:0,max:1,step:0.05,src:"Hypothèse de démonstration, à mesurer lors d'un vrai pilote."},
 {k:"okTrace",l:"Part des trajets déclarés dont la trace de test est conforme",v:0.88,min:0,max:1,step:0.01,src:"Hypothèse de démonstration (jeu de traces de test, pas de vraies traces)."},
 {k:"semaines",l:"Semaines travaillées par an",v:45,min:30,max:52,step:1,src:"Hypothèse de démonstration."},
 {k:"tarifTrajet",l:"Option B : participation de l'entreprise par trajet corroboré (EUR)",v:0,min:0,max:5,step:0.25,src:"À fixer par la direction. Plafond d'exonération du forfait mobilités durables 2026 : 600 EUR/an/salarié (Service-Public, 22 oct. 2026). Traitement social et fiscal à faire valider par la paie."},
 {k:"coutFixe",l:"Coût annuel de la solution pour l'entreprise (EUR)",v:0,min:0,max:100000,step:500,src:"À renseigner : développement, hébergement, exploitation. Non estimé ici."}
];
D.REGLES=[
 {k:"rayonM",l:"Rayon du point de rencontre (m)",v:150,step:10},
 {k:"tolMin",l:"Écart horaire toléré (min)",v:10,step:1},
 {k:"copres",l:"Part du trajet effectuée ensemble (min.)",v:0.8,step:0.05},
 {k:"vmax",l:"Vitesse moyenne maximale plausible (km/h)",v:130,step:5},
 {k:"ratioMin",l:"Distance tracée / attendue (min.)",v:0.8,step:0.05},
 {k:"ratioMax",l:"Distance tracée / attendue (max.)",v:1.5,step:0.05},
 {k:"maxJour",l:"Trajets par personne et par jour (max.)",v:4,step:1},
 {k:"binomeSem",l:"Même binôme : revue humaine au-delà de (trajets/semaine)",v:8,step:1}
];
g.TCDATA=D;
})(typeof window!=="undefined"?window:globalThis);
