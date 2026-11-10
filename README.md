> Mise à jour du 10 novembre 2026 : l’accueil est maintenant Carte, Quotidien gère un groupe habituel local (binôme ou trinôme), le retrait d’un créneau et une demande de nouveau partenaire. Direction est le dernier onglet. Les préparations sur carte ne remplacent aucun accord et n’entrent pas dans le bilan. Le fond est désormais Plan IGN (data.geopf.fr, Licence Ouverte 2.0), pas le serveur de tuiles OSM. Les tracés routiers restent les précalculs OSRM/OpenStreetMap. Les anciens détails ci-dessous sur le fond OSM et l’ordre des écrans sont historiques. Voir ERGONOMIE.md pour les sources et limites actuelles.

# Trajets Communs (démonstration)

Démonstration de covoiturage domicile-travail pour un site d'entreprise (pilote : Mont-Saint-Aignan, 76). Page statique, sans serveur.

**Tout est fictif** : 28 profils aux noms d'arbres, domiciles inventés autour de centres de communes, traces de déplacement de test écrites à la main. Seuls le site d'arrivée, les gares et les centres de communes sont réels.

## Ce que la démonstration fait
- Page d'accueil = la carte : tous les collaborateurs fictifs visibles, trajets préparés depuis la carte (détail, acceptation, refus) ; la partie direction est en dernier onglet.
- Appariement "chacun son tour" : plages horaires par jour, congés, détour maximal, temps en plus maximal, prise en charge à domicile ou à la gare, rotation des conducteurs.
- Bilan à trois niveaux, jamais mélangés : potentiel estimé, trajets déclarés, trajets corroborés.
- CO₂ en deux méthodes (brute et prudente), euros pour les collaborateurs, coût pour l'entreprise (options A et B).
- Règle d'identité des captures (identités visibles à 30 minutes du départ) et variante (dès l'acceptation).
- Règles de contrôle anti-abus testées sur des traces de test, avec seuils réglables.
- Chaque hypothèse affiche sa source ou dit qu'elle est de démonstration.

## Ce que la démonstration ne fait pas
Connexion avec un compte professionnel, notifications Teams, comptes persistants, temps de route réels, traces GPS réelles, paiements : rien de cela n'existe. L'onglet "Réel" liste ce qui reste à faire. Aucune certification n'est revendiquée.

## Utiliser
Ouvrir `index.html` via un serveur statique (par exemple `python3 -m http.server`) ou la page GitHub Pages du dépôt. Aucune dépendance, aucun appel réseau.

Sources et réserves : `SOURCES.md`. Sécurité : `SECURITE.md`. Bilan démo vs production et décisions restantes : `BILAN.md`. Tests automatiques à chaque push : `.github/workflows/tests.yml` (statut seul, sans bloquer la publication Pages).

## Questions ouvertes
Voir QUESTIONS.md : six risques de fond (retour non assuré, rendez-vous, batterie et réseau, refus et confidentialité, équité, responsabilité) et les décisions qui restent à l'entreprise. Tests : node tests.js (moteur) et tests-ui.html (parcours dans un navigateur).
