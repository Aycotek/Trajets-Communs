# Architecture cible (prévue, rien de tout cela n'est connecté ni réalisé)

Ce document décrit ce qu'il faudrait pour passer de la démonstration à un service réel. Il ne revendique aucune certification et ne suppose aucune connexion à l'entreprise. Les choix marqués « décision » appartiennent à l'entreprise (DSI, DPO, direction).

## Ce que la démonstration fait déjà
- Moteur d'appariement, bilan à trois niveaux, règles de contrôle, paramètres sourcés. Page statique, aucune donnée stockée, aucune connexion.

## Composants d'un service réel
1. Authentification : application enregistrée dans Microsoft Entra ID du locataire de l'entreprise, connexion unique avec le compte professionnel (OpenID Connect). Décision : accord de l'administrateur du locataire et de la DSI.
2. Notifications Teams : notifications du fil d'activité via Microsoft Graph (https://learn.microsoft.com/en-us/microsoftteams/platform/tabs/send-activity-feed-notification), avec consentement ou permission validée par l'administrateur. Décision : validation de la DSI.
3. Serveur applicatif et base de données : profils, horaires, congés, propositions, confirmations. Chiffrement au repos et en transit, droits par rôle, journal d'audit, suppression et export des données d'une personne. Décision : hébergement (France ou UE, conditions à faire valider par le DPO).
4. Routage et carte : instance de routage auto-hébergée (OSRM ou Valhalla) sur extrait OpenStreetMap, ou service dont les conditions conviennent ; tuiles auto-hébergées ou fournisseur adapté. Le précalcul de la démonstration est remplacé par des calculs à la demande avec cache.
5. Traces et corroboration : application mobile ou confirmation des deux côtés ; information et base légale à définir, minimisation (pas de suivi en dehors du trajet). Décision : DPO, avec analyse d'impact à décider selon la liste de la CNIL des traitements de localisation à large échelle.
6. Paie et incitations : le forfait mobilités durables et toute indemnité passent par la validation de la paie ; aucun versement sur un trajet seulement déclaré.
7. Tableau de bord direction : agrégats avec seuil minimal d'effectif pour éviter la réidentification.

## Sécurité dès la conception (recommandations, pas des obligations légales)
- Grille de contrôles inspirée d'ISO/IEC 27001 annexe A et d'OWASP ASVS, sans prétendre à une certification.
- Séparation des données : domicile exact visible seulement du système, jamais des autres salariés (point de rendez-vous approximatif).
- Détection d'anomalies au service de la défense (règles de cohérence, revue humaine), pas de décision automatique de sanction.
- Tests d'intrusion et revue de code avant ouverture.

## Ce qui reste à décider avant tout développement réel
Hébergement, fournisseur de cartes et routage, base légale des traces, règle de partage de frais et seuils, périmètre pilote, validation paie, accord DSI pour Teams et Entra ID.
