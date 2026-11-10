> Mise à jour du 10 novembre 2026 : l’accueil est maintenant Carte, Quotidien gère un groupe habituel local (binôme ou trinôme), le retrait d’un créneau et une demande de nouveau partenaire. Direction est le dernier onglet. Les préparations sur carte ne remplacent aucun accord et n’entrent pas dans le bilan. Le fond est désormais Plan IGN (data.geopf.fr, Licence Ouverte 2.0), pas le serveur de tuiles OSM. Les tracés routiers restent les précalculs OSRM/OpenStreetMap. Les anciens détails ci-dessous sur le fond OSM et l’ordre des écrans sont historiques. Voir ERGONOMIE.md pour les sources et limites actuelles.

# Options de routage et de tuiles — état préparatoire (10 novembre 2026)

Document de préparation pour la décision « moteur de production », réservée à la direction. Tarifs et conditions relevés le 10 novembre 2026 sur les pages officielles citées ; tout est à revérifier au moment de la décision. Aucun compte créé, aucune dépense engagée, aucune intégration réelle. Les scénarios utilisent des volumes fictifs.

## Contexte

- Site de démonstration à Mont-Saint-Aignan (Rouen) : un extrait régional OpenStreetMap (Normandie) suffit pour étudier ; un extrait France métropolitaine reste possible (4,8 Go au 10 nov. 2026).
  - Normandie : https://download.geofabrik.de/europe/france/normandie.html
  - France : https://download.geofabrik.de/europe/france.html
- Les domiciles des salariés sont des données personnelles. Le choix du service de routage et de géocodage est donc aussi un choix de sous-traitant de données, pas seulement technique.
- Besoin fonctionnel : itinéraires voiture domicile → site (quelques dizaines de points) et une matrice domiciles × domiciles pour l'appariement, recalculée à chaque changement de profil.

## Routage — options hébergées

| Service | Gratuit | Payant (relevé 10/11/2026) | Points clés |
| --- | --- | --- | --- |
| GraphHopper Directions API (DE) | Non commercial, sans garantie | Basic 69 €/mois HT (5 000 crédits/j), Standard 199 € (15 000), Premium 479 € (50 000) | 1 crédit = 1 itinéraire 2-10 points ; matrice = origines × destinations / 2 crédits ; SLA 99,5 % payant ; serveurs Hetzner en Allemagne ; DPA à redemander (PDF daté 2018) |
| openrouteservice / HeiGIT (DE) | Standard : 2 000 directions/j, matrice 500 requêtes/j, 3 500 éléments max/requête | On-premise possible | Résultats CC-BY-SA 4.0 ; attribution OSM ; **conditions d'utilisation incompatibles avec des domiciles : voir ci-dessous** |
| Jawg (FR) | 25 000 vues + 5 000 navigations/mois, commercial interdit | Pro 250 €/mois (100 000), Entreprise 500 €/mois (500 000) | Annonce RGPD et serveurs UE ; quotas mensuels |
| Stadia Maps (US, Valhalla hébergé) | 200 000 crédits/mois | 20 $/mois (1 M), 80 $ (7,5 M), 250 $ (25 M) | Endpoints UE dédiés (tiles-eu / api-eu) et DPA ; société américaine, transferts à encadrer |

Sources : https://www.graphhopper.com/pricing/ , https://www.graphhopper.com/faq/what-is-one-credit/ , https://account.heigit.org/info/plans , https://giscience.github.io/openrouteservice/hosted-api-restrictions , https://www.jawg.io/fr/pricing/ , https://stadiamaps.com/pricing/ , https://docs.stadiamaps.com/eu-gdpr-endpoints/ , https://stadiamaps.com/legal/data-processing-addendum/ , https://www.graphhopper.com/privacy/

### openrouteservice et données personnelles — texte exact

Les conditions d'utilisation HeiGIT (rubrique « Prohibited Conduct », https://openrouteservice.org/terms-of-service/ , consultées le 10 nov. 2026) interdisent notamment :

> « Transmit personal data (apart from the data required by the HeiGIT account management) »

Conséquence : même avec une base légale RGPD, le contrat du service interdit d'envoyer des données personnelles (les coordonnées de domiciles en sont). Le plan gratuit hébergé d'openrouteservice n'est donc pas utilisable pour l'appariement domicile-site sans une permission contractuelle adaptée ; restent l'auto-hébergement (leur offre on-premise ou le code open source) ou un autre service.

## Routage — auto-hébergé (open source, données OpenStreetMap)

- **OSRM** (BSD-2) : rapide et mature ; un commentaire de mainteneur (2018) indique 16 Go de RAM pour un extrait France : https://github.com/Project-OSRM/osrm-backend/issues/5265 . Chiffre daté et indicatif ; un extrait Normandie demande nettement moins. Pas de trafic temps réel natif.
- **Valhalla** (MIT) : multimodal, matrices, isochrones ; discussion 2022 : « 8 cœurs / 30 Go / SSD » jugé raisonnable pour la planète entière : https://github.com/valhalla/valhalla/issues/3829 . Indicatif aussi.
- GraphHopper et openrouteservice sont aussi auto-hébergeables (Apache-2).
- Coût réel : une VM (ordre : 8-16 Go RAM, SSD) + maintenance + mises à jour périodiques des données OSM. Aucun quota, aucune donnée personnelle envoyée à un tiers.

## Tuiles de fond de carte

- **Tuiles publiques OSMF** (tile.openstreetmap.org) : pas une interdiction de licence, mais un service best-effort sans SLA dont l'usage lourd peut être bloqué sans préavis. Texte exact (https://operations.osmfoundation.org/policies/tiles/ , 10 nov. 2026) : « Commercial services, or those that seek donations, should be especially aware that access may be withdrawn at any point: you may no longer be able to serve your paying customers if access is withdrawn. » Exigences : URL HTTPS exacte, attribution visible, User-Agent identifiant l'application, Referer valide, cache local ≥ 7 jours, interdiction du téléchargement en masse.
- **Hébergées** : Jawg (UE, voir ci-dessus), MapTiler Cloud (Free 0 $ : 100 000 requêtes/mois avec logo ; Flex 30 $/mois : 500 000 ; https://www.maptiler.com/cloud/pricing/), Stadia (ci-dessus).
- **Auto-hébergées** : MapTiler Server + données (licence par territoire) ou chaîne OpenMapTiles.

## Géocodage d'adresses (France)

- L'ancienne API Adresse (api-adresse.data.gouv.fr) est dépréciée et décommissionnée fin janvier 2026.
- Service actuel : géocodage de la Géoplateforme (IGN), https://data.geopf.fr/geocodage/search/ , gratuit, 50 appels/IP/seconde (erreur 429 au-delà) ; levée de limite possible pour les acteurs publics.
- Sources : https://adresse.data.gouv.fr/outils/api-doc/adresse , https://fab-geocommuns.github.io/carte-facile-site/fr/documentation/aller-plus-loin/api-adresse/

## Volumétrie — deux scénarios fictifs explicites

Besoin : ~4-10 itinéraires par participant et par semaine (recalculs) + 1 matrice domiciles × domiciles hebdomadaire.

- **S50** (50 salariés) : ~200-500 itinéraires/sem + matrice 50×50 = 2 500 éléments/sem. Tenable par : ORS gratuit (1 requête matrice, 2 000 directions/j), GraphHopper Basic, auto-hébergé. Tuiles ~5 000 vues/mois : plans gratuits Stadia/MapTiler tenables (Jawg gratuit exclu, commercial).
- **S500** (500 salariés) : matrice 500×500 = 250 000 éléments. ORS : ~72 requêtes de 3 500 éléments, tenable (500 requêtes/j). GraphHopper : 125 000 crédits/matrice → au-delà du Premium (50 000/j), plan Custom nécessaire. Auto-hébergé : sans quota.

## Recommandation préparatoire (conception, réversible, sans dépense engagée)

1. **Pilote** : auto-héberger OSRM sur un extrait Normandie (VM modeste) et géocoder via la Géoplateforme ou une BAN auto-hébergée (données ouvertes) : aucun quota, aucune donnée personnelle envoyée à un tiers commercial, coût limité à la VM et à la maintenance.
2. **Si l'entreprise préfère du clé en main** : Jawg (FR, annonce UE) ou GraphHopper (DE) avec DPA signé ; vérifier le registre de traitement et la minimisation (des coordonnées arrondies à la rue peuvent suffire à l'appariement).
3. **Tuiles** : ne pas bâtir sur les tuiles OSMF (retrait possible à tout moment) ; tuiles auto-hébergées ou plan commercial UE avec DPA.
4. **openrouteservice hébergé gratuit : écarté** pour des domiciles (texte contractuel cité), quel que soit son attrait financier.
5. **Trafic temps réel** : aucune option open source ne le fournit nativement ; s'il devient requis, c'est un critère éliminatoire qui rouvre la comparaison (fournisseurs commerciaux avec données de trafic).

## Ce qui reste tranché par la direction

Budget récurrent vs maintenance interne ; validation DPO (AIPD, registre, minimisation des domiciles) ; volumétrie réelle issue de l'enquête mobilité ; besoin ou non de trafic temps réel ; responsable de la maintenance du service retenu.
