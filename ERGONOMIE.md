# Parcours carte et quotidien : principes et limites

10 novembre 2026. Recherche demandée par Arthur, puis application au démonstrateur.

## Sources lues et décisions de conception

1. **Naumann et al., Intuitive Use of User Interfaces: Defining a Vague Concept (2007), article de conférence HCI.** L'usage intuitif dépend d'une personne, d'une tâche et du contexte : il utilise des connaissances antérieures sans effort conscient. Ce n'est pas une propriété que l'on peut attribuer au site seul. Application proposée : vocabulaire de trajet quotidien, carte familière, actions explicites. La familiarité de la carte reste une hypothèse à vérifier auprès des salariés.
http://www.ekphorie.de/ham/pub/pdf/HCI07_Naumann_et_al.pdf

2. **Sweller, van Merriënboer et Paas, Cognitive Architecture and Instructional Design: 20 Years Later (2019), revue scientifique Educational Psychology Review.** La mémoire de travail est limitée pour l'information nouvelle ; réduire les demandes inutiles facilite l'apprentissage. Cette recherche porte sur l'apprentissage, pas sur la validation de notre application. Application prudente : séparer découverte de partenaires et routine, montrer le détail après sélection plutôt que tous les contrôles à la fois.
https://link.springer.com/article/10.1007/s10648-019-09465-5

3. **Norman, Affordance, Conventions, and Design (1999), article interactions.** Distinguer action possible, perception et convention ; les conventions et indications visibles comptent dans les interfaces graphiques. Application : boutons nommés avec leur résultat, liste de collaborateurs équivalente aux points de carte, retour visible sur une demande.
https://perso.lisn.upsaclay.fr/mbl/ENS/DEA-IHM/papers/Norman-Affordances.pdf

4. **Nielsen, 10 Usability Heuristics, guide professionnel, pas un papier scientifique.** Reconnaissance plutôt que rappel, visibilité de l'état, contrôle utilisateur et prévention des erreurs. Application : groupe habituel affiché, actions « pas ce trajet » et « nouveau partenaire » distinctes ; aucune préférence ne devient un accord automatique.
https://www.nngroup.com/articles/ten-usability-Heuristics/

5. **ISO 9241-110:2020, norme internationale, page de présentation publique.** Principes d'interaction centrés sur l'adéquation à la tâche et la compréhension. Le texte intégral payant n'a pas été lu. Application : Carte pour préparer, Quotidien pour la routine, Direction en dernier. Aucune conformité à la norme n'est revendiquée.
https://www.iso.org/standard/75258.html

## Ce qui est réellement réalisé

- Accueil Carte, 28 profils fictifs. Clic personne ou sélection dans la liste pour voir son trajet du créneau et chercher des partenaires compatibles.
- Compatibilité de binômes calculée avec le moteur existant : présence, horaires, places, détour, temps en plus. Les options sont classées par proximité à vol d'oiseau entre domiciles fictifs ; ce n'est pas une optimisation globale.
- Visualisation d'un binôme sur la carte, puis préférence « groupe habituel ». La recherche propose aussi jusqu’à six trinômes compatibles, visualisables puis conservables. Un groupe proposé existant peut aussi être conservé.
- Quotidien affiche ce groupe et permet de le revoir, de se retirer du créneau ou de signaler une demande d'autre partenaire. Cette demande apparaît sur la carte, sans envoyer de message réel.
- Préférences et demandes gardées dans sessionStorage uniquement, perdues à la fermeture de l'onglet. Elles ne remplacent ni accord des autres ni réservation. Les propositions préparatoires ne déplacent pas les personnes déjà sur un trajet et ne sont pas ajoutées au bilan.
- Les accords des trajets proposés restent séparés. Un nouvel accord est nécessaire quand les participants changent. Aucun paiement, compte professionnel, vraie notification ou recrutement de salarié n'existe.

## Ce qui reste à vérifier

Aucun test d'utilisabilité avec de vrais salariés : la refonte n'est pas « scientifiquement prouvée intuitive ». Prévoir des essais de tâches : trouver une personne proche, préparer un binôme, garder un groupe, ne pas partir un jour, chercher un autre partenaire. Observer réussite, hésitations et erreurs, puis corriger. Les tests automatiques vérifient le fonctionnement, pas la compréhension humaine.

Pas de persistance serveur, gestion réelle des groupes récurrents, collecte de demandes ni résolution globale des conflits entre groupes. Pas de test réel au lecteur d'écran ni sur Safari iPhone. Les jours fériés restent manuels.

## Fond cartographique

Le fond public Plan IGN est indépendant du service de tuiles OSM refusant des requêtes. Les métadonnées de la couche GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2 indiquent Licence Ouverte et accès public. Le service WMTS est accessible sans compte ni clé. Attribution visible IGN, source liée et mention de mise à jour continue. La carte transmet IP et zone affichée à IGN ; le service n’est pas garanti sans interruption. Aucun nouvel accès à un autre endpoint OSM ne sert de contournement. La politique referrer est strict-origin-when-cross-origin.

Sources : https://cartes.gouv.fr/cgu/ ; https://geoservices.ign.fr/que-deviennent-les-cles-de-services-web ; https://inspire-geoportal.ec.europa.eu/srv/api/records/IGNF_PLAN-IGN?language=all ; https://www.etalab.gouv.fr/licence-ouverte-open-licence/
