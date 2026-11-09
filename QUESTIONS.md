# Questions auxquelles on ne pense pas d'abord

Démonstration fictive "Trajets Communs". Rien ici n'est une garantie. Chaque point dit : le risque, ce que la démo fait vraiment, ce qui reste une décision de l'entreprise, et ce qui n'est pas vérifié.

Chiffres de la démo : semaine par défaut, 28 profils inventés, graine 2026. Ils illustrent le calcul, ils ne prédisent rien.

## Les six risques

### 1. Aller sans retour, voiture restée à la maison
- Risque : quelqu'un laisse sa voiture parce qu'un aller est confirmé, puis le retour tombe (conducteur absent, retard, annulation).
- Ce que fait la démo : le soir, quand l'aller du matin est confirmé et que le retour est annulé ou absent, l'écran le dit en clair : "retour non assuré, aucun retour garanti, ni taxi ni prise en charge par l'entreprise". Aller et retour sont deux accords distincts.
- Mesuré dans la démo : 73 % des créneaux-personne présents ont un trajet proposé (169 sur 230). Donc 27 % n'en ont pas. Le cas "pas de solution" n'est pas rare.
- Décision de l'entreprise : garantir ou non un retour de secours (taxi, navette, voiture partagée, télétravail). La démo ne simule aucune garantie. BlaBlaCar Daily propose une "Garantie Retour" avec un assureur, plafonnée et sous conditions (source : ses pages d'aide publiques, consultées le 9 nov. 2026). C'est un produit commercial, pas une règle transposable.
- Non vérifié : la règle d'annulation tardive et ses effets.

### 2. Sécurité et accessibilité du point de rendez-vous
- Risque : proximité n'est pas sécurité. Un domicile la nuit, un parking isolé, une gare sans accès pour fauteuil roulant.
- Ce que fait la démo : prise en charge en gare ou à domicile ; l'adresse d'un domicile n'est connue du conducteur qu'après confirmation ; les noms ne sont pas montrés avant la règle d'identité choisie. L'application elle-même vise le clavier, le lecteur d'écran et une liste texte équivalente à la carte.
- Pas géré : véhicule adapté, accompagnement, éclairage, horaires de nuit, signalement d'un incident.
- Décision : liste de points de rendez-vous autorisés, règle pour les horaires de nuit, circuit de signalement.

### 3. Batterie, réseau, téléphone
- Risque : une preuve de trajet qui exige le GPS exclut les téléphones faibles, les zones sans réseau, les personnes sans smartphone professionnel.
- Ce que fait la démo : trois niveaux jamais mélangés (proposé, déclaré, corroboré). Une trace manquante ou incomplète donne "à vérifier", jamais "fraude". Aucune géolocalisation réelle n'est utilisée.
- Décision : repli sans application (déclaration à deux, code court) et qui a le droit de contester.
- Non vérifié : la fiabilité d'une trace sur de vrais téléphones.

### 4. Refus, confidentialité, pression sociale
- Risque : un collègue refuse de partager un trajet, ou se sent surveillé ; la hiérarchie voit qui roule avec qui ; la participation devient une obligation de fait.
- Ce que fait la démo : accepter et refuser sont des gestes explicites, sans justification demandée ; la vue direction n'affiche ni noms ni adresses ; une récurrence est une demande modifiable ; rien n'est accepté à la place de la personne.
- Réserves : des données de localisation de salariés relèvent d'une analyse d'impact CNIL dans les cas listés par la CNIL (liste citée dans SOURCES.md). L'information et la consultation des représentants du personnel sont à faire vérifier par un juriste : je n'ai pas de source primaire sur ce point.
- Décision : participation strictement volontaire, aucune évaluation individuelle, durée de conservation courte.

### 5. Équité : conduite, attente, détours
- Risque : toujours les mêmes conduisent ; quelqu'un attend longtemps ; un détour est supporté sans contrepartie.
- Mesuré dans la démo (28 profils, une semaine) : 20 personnes peuvent conduire, entre 3 et 5 trajets chacune (moyenne 4,2). Temps en plus d'un passager : 0 min en médiane, 8 min au maximum. Détour du conducteur : médiane 2,3 km, maximum 7,9 km.
- Anomalie à corriger : des détours négatifs apparaissent (jusqu'à -5,7 km), c'est-à-dire un itinéraire avec passagers plus court que le trajet du conducteur seul. C'est un artefact du calcul (routes précalculées), pas un gain réel. À investiguer.
- Décision : quelle compensation pour un détour ou une attente (partage de frais borné, avantage, rien), et qui arbitre.

### 6. Qui est responsable quand il n'y a pas de solution ?
- Risque : l'application propose, l'entreprise est tenue pour responsable si la proposition échoue.
- Ce que fait la démo : proposition et engagement sont séparés. Un accord unilatéral ne confirme rien ; "Pas d'alternative proposée" s'affiche sans promesse de repli.
- Décision (irréductible, côté entreprise) : le statut du service (aide, pas obligation), la communication aux salariés, l'assurance du conducteur et de l'employeur pour un trajet partagé. Aucun de ces points n'est vérifié ici.

## Mes propres angles
- Masse critique : le matching dépend de la densité. Avec peu de participants par commune, la couverture tombe. La démo ne dit rien du taux réel d'adoption.
- Chocs collectifs : grève des transports, intempéries, travaux. La demande de places monte d'un coup, l'offre non. À tester dans un pilote, pas dans la démo.
- Jours variables, congés, télétravail : le calcul part des horaires déclarés. Un oubli de congé crée de fausses propositions. La démo fait déclarer les absences, sans calendrier réel.
- Parking sur site : un covoiturage libère-t-il des places ? Décision et mesure à faire, pas simulées.
- Fraude et détournement : fausses confirmations de fin de trajet, trajets fictifs entre complices pour toucher un avantage. La démo applique des règles de contrôle sur traces de test (voir l'onglet Contrôles) ; elles ne prouvent rien sur de vrais usages.
- Fiscalité et plafond : le forfait mobilités durables est plafonné à 600 € (900 € avec transport en commun), sources dans SOURCES.md. La prime d'État au covoiturage a été supprimée au 1er janvier 2025 (même source). Tout avantage versé est une décision de l'entreprise.
- Lassitude des notifications : la cible est Teams, simulée ici. Trop de messages et les gens coupent tout. Décision : ce qui mérite une notification, ce qui reste dans la semaine.
- Sortie et arrêt : un bouton "tout effacer" et un arrêt du service sans perte d'accès pour les salariés. La démo n'a qu'un "Effacer mes choix simulés", et ses choix ne survivent pas à l'onglet.
- Mesure du succès : trajets réellement faits, kilomètres évités, satisfaction, et coût par trajet. Les chiffres CO2 de la démo reposent sur 0,17 kg/km (Impact CO2, page "voiture thermique, moyenne essence"), pas sur la flotte réelle : la Base Empreinte ADEME est à consulter pour la flotte.

## Décisions que seul Arthur ou l'entreprise peut prendre
1. Retour de secours : oui ou non, sous quelle forme.
2. Qui porte le risque quand une proposition échoue (assurance, communication).
3. Quels avantages, versés par qui, avec quel plafond.
4. Quels points de rendez-vous et quels horaires sont autorisés.
5. Quelle preuve de présence est acceptable pour un téléphone sans GPS.
