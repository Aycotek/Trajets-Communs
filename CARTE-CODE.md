# Carte du code et des dépendances

Carte écrite à la main à partir de la lecture du source (10 novembre 2026), faute d'outil de cartographie automatique disponible. Elle couvre uniquement le code de cette démonstration. GitHub affiche les schémas Mermaid directement.

## Modules

```mermaid
graph LR
  index.html --> base.css
  index.html --> extra.css
  index.html --> data.js
  index.html --> route-data.js
  index.html --> route-legs.js
  index.html --> engine.js
  index.html --> app.js
  tests.js --> engine.js
  tests.js --> data.js
  tests.js --> route-data.js
  tests.js --> route-legs.js
  tests-ui.html --> tests-ui.js
  tests-ui.js -->|cadre iframe| index.html
  ci[.github/workflows/tests.yml] -->|node| tests.js
  ci -->|chrome sans tête| tests-ui.html
```

- `data.js` : paramètres par défaut, hypothèses et textes. Aucune donnée réelle.
- `route-data.js` : matrice distances/durées précalculées entre les 31 points fictifs (générée par `precalc.js`, non publié).
- `route-legs.js` : tracés routiers des tronçons de la semaine par défaut (généré par `legs.js`, publié, usage ponctuel documenté dans SOURCES.md).
- `engine.js` : moteur pur et déterministe. Entrées = profils et paramètres, sorties = trajets et bilans. Aucun DOM, aucun réseau.
- `app.js` : rendu des onglets et interactions. Tout l'état volatil est dans `sessionStorage` (clés `tc_dec`, `tc_rec`, `tc_out`), rien de durable.

## Flux de données

```mermaid
flowchart TD
  P[profils fictifs data.js + population graine 2026] --> M[E.match appariement glouton]
  R[route-data.js matrice] --> M
  L2[route-legs.js tracés] --> V[app.js vues]
  M --> T[trajets proposés]
  T --> B[E.bilan trois niveaux : potentiel, déclaré, corroboré]
  T --> V
  B --> V
  U[choix visiteur : accepter, refuser, retirer, ajouter] --> S[sessionStorage]
  S --> M2[E.match recalcul borné aux trajets touchés]
  M2 --> V
```

## Invariants maintenus par les tests (3328 vérifications)

```mermaid
flowchart LR
  I1[une personne = un seul trajet par créneau, 10 graines] 
  I2[détour <= maximum, même après retrait]
  I3[corroboré inclus dans déclaré inclus dans potentiel]
  I4[un accord unilatéral ne confirme jamais]
  I5[un retrait ne touche que les trajets concernés]
  I6[un détour négatif ne crédite jamais de CO2]
```

- Invariants d'interface (tests-ui.html, à chaque push) : parcours complet accepter/refuser/revenir, carte (zoom, liste texte, point déplacé « non calculé »), aléas (retard, absence, ajout tardif), clavier (flèches entre onglets, `aria-selected`).
- Hors périmètre volontairement : pas de backend, pas de comptes, pas de notifications réelles. Voir BILAN.md pour la frontière démonstration / production.
