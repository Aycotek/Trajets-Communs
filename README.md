# Trajets Communs (démonstration)

Démonstration de covoiturage domicile-travail pour un site d'entreprise (pilote : Mont-Saint-Aignan, 76). Page statique, sans serveur.

**Tout est fictif** : 28 profils aux noms d'arbres, domiciles inventés autour de centres de communes, traces de déplacement de test écrites à la main. Seuls le site d'arrivée, les gares et les centres de communes sont réels.

## Ce que la démonstration fait
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

Sources et réserves : `SOURCES.md`. Sécurité : `SECURITE.md`.

## Questions ouvertes
Voir QUESTIONS.md : six risques de fond (retour non assuré, rendez-vous, batterie et réseau, refus et confidentialité, équité, responsabilité) et les décisions qui restent à l'entreprise. Tests : node tests.js (moteur) et tests-ui.html (parcours dans un navigateur).
