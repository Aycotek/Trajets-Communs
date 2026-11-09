# Sources et réserves

Les valeurs marquées "démonstration" sont des hypothèses à remplacer par une mesure avant toute décision.

## Climat
- GIEC AR6 GT III, ch. 10 : le transport émet 8,7 GtCO2e directs en 2019 (5,0 en 1990), 23 % du CO2 énergétique mondial ; 70 % viennent du routier ; cadre "éviter, reporter, améliorer". Aucun chiffre sur le covoiturage dans ce chapitre : il situe le contexte, il ne chiffre pas le gain de cette application. https://www.ipcc.ch/report/ar6/wg3/downloads/report/IPCC_AR6_WGIII_Chapter10.pdf
- Résumé pour décideurs : transport = 15 % des émissions mondiales de GES. https://www.ipcc.ch/report/ar6/wg3/downloads/report/IPCC_AR6_WGIII_SPM.pdf

## Méthode CO₂
- ADEME : émissions = km parcourus x facteur d'émission (Base Empreinte). https://employeursprocovoiturage.ademe.fr/wp-content/uploads/2024/12/1-3_fiche-methode-calcul-carbone.pdf
- Facteur voiture 0,170 kgCO2e/km par véhicule : Impact CO2, page « Voiture thermique (Moyenne - Essence) » dont l'URL indique une voiture compacte essence (fabrication 31,7 g + carburant 138 g) ; cela ne prouve pas une moyenne du parc thermique, https://impactco2.fr/outils/transport/voiture-compact-essence, consulté le 9 novembre 2026. Remplace la valeur 0,218 de la première version, qui venait d'un site tiers. Réserve : la page ne détaille pas le parc ; la ligne exacte de la Base Empreinte ADEME (https://base-empreinte.ademe.fr/) reste à relever pour le parc réel.
- Gain d'un trajet : km solo du passager x facteur, moins km de détour du conducteur x facteur. "Diviser par deux" ne vaut que pour deux occupants, même trajet, sans détour.
- L'Observatoire du covoiturage compte l'économie en supposant que le passager aurait pris sa voiture : https://observatoire.covoiturage.gouv.fr/observatoire/comprendre-covoiturage-quotidien/. D'où la méthode prudente.
- Effets de rebond : simulation parisienne (CIRED), 50 à 75 % des bénéfices annulables sans mesures d'accompagnement. Simulation, pas mesure locale. https://www.inshs.cnrs.fr/fr/cnrsinfo/repenser-les-mesures-daccompagnement-liees-au-developpement-du-covoiturage-une-necessite et https://doi.org/10.1016/j.trd.2018.12.006
- Enquête ADEME 2025 : covoiturage courte distance par plateforme pour aller au travail, 23 km en moyenne, 2,2 personnes par voiture. https://infos.ademe.fr/mobilite-transports/2025/covoiturage-une-pratique-qui-roule-pour-un-tiers-des-francais/

## Euros
- Le covoiturage est non onéreux sauf partage des frais (code des transports L3132-1, cité par https://doc.covoiturage.beta.gouv.fr/vous-etes/je-suis-un-employeur/mettre-en-place-le-fmd-dans-ma-structure).
- Barème fiscal 2025, 5 CV : 0,636 EUR/km jusqu'à 5 000 km. Frais réels à usage professionnel : borne haute, pas un coût marginal. https://www.service-public.gouv.fr/particuliers/actualites/A14686
- Forfait mobilités durables (facultatif, covoiturage conducteur et passager couvert, code du travail L3261-3-1) : exonération 600 EUR/an/salarié, 900 avec abonnement de transport en commun. Service-Public vérifié le 22 oct. 2026 https://entreprendre.service-public.gouv.fr/vosdroits/F33808 ; décret 2026-974 cité par https://www.service-public.gouv.fr/particuliers/actualites/A18926 ; BOSS https://boss.gouv.fr/portail/accueil/table-des-parametres/remboursements-de-frais-professi.html. D'anciennes pages indiquent 800 EUR : antérieures, non retenues. À faire valider par la paie avant tout usage.
- La prime covoiturage courte distance de l'État est supprimée depuis le 1er janvier 2025 : https://www.ecologie.gouv.fr/covoiturage

## Entreprises (déclarations des intéressés, pas de preuve causale)
- BlaBlaCar Daily annonce plus de 1 400 employeurs : https://www.blablacardaily.com/entreprises
- Synergie déclare, après un an, plus de 1 500 trajets, plus de 44 000 km et plus de 9,5 tCO2e évitées (méthode non précisée) : https://www.synergie.fr/actualites/semaine-europeenne-mobilite-synergie-blablacar-daily-2026

## Abus (pour concevoir la défense)
- Cas régional : des comptes d'une plateforme ont perçu une aide par trajet sans passager réel ; 400 comptes suspects supprimés en 2022 pour 110 000 conducteurs, fraude estimée à 2 % par la collectivité et jugée probablement sous-évaluée : https://www.latribune.fr/entreprises-finance/services/transport-logistique/covoiturage-courte-distance-les-fraudeurs-dans-le-viseur-957804.html
- Règles du Registre de preuve de covoiturage (chevauchement de plus de 70 %, plus de 4 trajets par personne et par jour, durées et distances incohérentes) : https://doc.covoiturage.beta.gouv.fr/nos-services/le-registre-de-preuve-de-covoiturage/un-service-de-collecte-des-donnees-de-trajet/comportements-frauduleux-anormaux

## Données personnelles
- La liste CNIL des traitements pour lesquels une AIPD est requise cite les traitements de localisation à large échelle : https://cnil.fr/sites/default/files/atoms/files/liste-traitements-aipd-requise.pdf. Si elle s'applique à un déploiement réel dépend de l'échelle et des critères : question pour le DPO, non tranchée ici.

## Faisabilité (à vérifier avant tout engagement)
- Notifications Teams : Microsoft Graph, permission TeamsActivity.Send https://learn.microsoft.com/en-us/microsoftteams/platform/tabs/send-activity-feed-notification
- Tuiles OpenStreetMap : User-Agent identifié, pas de téléchargement en masse https://operations.osmfoundation.org/policies/tiles/
- Quotas de routage et de trafic gratuits (annoncés par les fournisseurs, à lire chez eux) : Google Routes, TomTom (relevé sur sites tiers). Aucun n'est branché ici.

## Routage et fond de carte (ajout)
- Distances et durées : calcul précalculé par precalc.js avec le serveur de démonstration public OSRM (router.project-osrm.org), profil voiture, sur données OpenStreetMap (ODbL). Une requête de matrice et une requête d'itinéraire par point, à raison d'une par seconde, sans abonnement. Résultat daté dans route-data.js. Sans trafic ni horaires, valable seulement pour les points fictifs de cette démo.
- Constat mesuré : le rapport route / vol d'oiseau va de 1,21 à 2,16 selon le point (moyenne 1,63), au-dessus de l'hypothèse 1,3 de la première version.
- Fond de carte : tuiles OpenStreetMap (© contributeurs OpenStreetMap), chargées depuis tile.openstreetmap.org, une vue fixe d'une douzaine de tuiles. La politique d'usage de la fondation OSM convient à une démonstration légère, pas à un déploiement : prévoir un fournisseur sous contrat ou des tuiles hébergées.

## Fond de carte : trois choses distinctes
- Licence des données : OpenStreetMap est sous ODbL, usage libre y compris commercial avec attribution « © contributeurs OpenStreetMap » (https://www.openstreetmap.org/copyright).
- Politique du serveur public de tuiles : https://operations.osmfoundation.org/policies/tiles/ . Service sans garantie, usage raisonnable, attribution, pas de téléchargement en masse, droit de bloquer. Une vue fixe d'une douzaine de tuiles pour une démo en relève. Ce n'est pas une obligation de contrat : c'est une limite d'usage du serveur gratuit.
- Pour un déploiement : tuiles auto-hébergées (données ODbL libres, coût d'hébergement) ou fournisseur de tuiles dont les conditions autorisent l'usage prévu, à comparer sur conditions et quotas. Un contrat n'est pas obligatoire en soi, mais le serveur public de la fondation n'est pas conçu pour une application d'entreprise.
- Serveur de routage : la page de politique d'usage du serveur de démonstration OSRM n'a pas pu être lue lors de cette session ; le précalcul (environ 150 requêtes espacées d'une seconde) est déjà fait et AUCUN nouvel appel ne sera lancé tant que les conditions du serveur ne sont pas connues. precalc.js et legs.js sont fournis pour reproductibilité : à ne lancer que contre une instance dont l'usage est autorisé. Pour la production : instance OSRM ou Valhalla auto-hébergée sur extrait OSM, ou service sous conditions commerciales.
- Alternative autorisée et auto-hébergeable : OSRM ou Valhalla (logiciels libres) sur un extrait OpenStreetMap (Geofabrik, région Normandie), sur une machine de l'entreprise ou un hébergement choisi ; precalc.js et legs.js n'ont alors qu'à changer l'adresse de base. Coût : hébergement et maintenance, à chiffrer. Non réalisé ici.
