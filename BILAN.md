# Bilan borné : démonstration vs production, et décisions restantes

État au 10 novembre 2026. Document de cadrage, sans engagement : aucun backend, aucun contrat, aucune authentification réelle n'a été lancé.

## Ce que la démonstration montre
- Un calcul d'appariement déterministe et testé (3325 vérifications moteur, tests de parcours navigateur à chaque push via GitHub Actions).
- Un parcours complet : proposer, accepter, refuser, revenir sur sa décision, retards et retraits simulés, récurrence explicite et non durable, gel des trajets confirmés ailleurs.
- Une carte lisible au clavier et sans la couleur seule (rond = avec voiture, losange = sans voiture), avec équivalent texte, utilisable à 390 px de large.
- Un bilan à trois niveaux jamais mélangés : potentiel estimé, déclaré, corroboré.

## Ce qu'elle ne prouve pas
- Ni adoption, ni économies réelles : profils, domiciles, traces et taux d'acceptation sont inventés. La couverture de 75 % est celle d'un jeu fictif.
- Le facteur 0,170 kgCO2e/km est celui d'Impact CO2 « Voiture thermique (Moyenne - Essence) » (revérifié le 10/11/2026 : 170 g = 31,7 g fabrication + 138 g carburant). C'est une moyenne nationale d'une catégorie, par véhicule-km, sans trafic : pas la flotte de l'entreprise, qui reste à établir (Base Empreinte ADEME).
- L'accessibilité lecteur d'écran n'est pas vérifiée (aucun lecteur d'écran réel disponible ici) ; aucune conformité RGAA/WCAG n'est revendiquée.
- Le serveur public de routage OSRM a servi à un précalcul ponctuel ; il ne convient pas à un produit (aucune garantie, accès révocable).

## Intégration continue : ce qu'elle fait et ne fait pas
- Le workflow tests (moteur + parcours) donne un statut rouge ou vert à chaque push.
- Il n'empêche PAS la publication : GitHub Pages est déployé par son propre workflow (pages-build-deployment), indépendant. Vérifié : aucun ruleset ni protection de branche ne rend le vert obligatoire (liste des rulesets vide le 10/11/2026). En faire une barrière serait une décision (protection de branche), non prise.

## Décisions restantes (à trancher par l'entreprise, pas par la démo)
1. Moteur de routage de production : auto-hébergé (OSRM, Valhalla) ou fournisseur dont les conditions couvrent l'usage. Aucun devis.
2. Fond de carte : tuiles auto-hébergées ou fournisseur (le serveur public OSM limite l'usage ; l'IP et la zone vue des visiteurs y sont exposées).
3. Comptes et notifications Teams : application enregistrée, accord administrateur, DSI. Ici tout est simulé.
4. Cadre juridique : partage de frais sans profit (Service-Public F31403), FMD facultatif avec plafonds d'exonération 600/900 EUR (F33808), analyse d'impact CNIL probable. À faire valider par un juriste.
5. Financement et règles de paiement : aucune trace ne prouve un droit de paiement ; la règle reste à décider.
6. Pilote : mesurer la couverture et l'adoption réelles avant toute généralisation.
