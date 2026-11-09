# Parcours utilisateur de bout en bout et fonctions de carte (Trajets Communs)

Statut : étude. Les faits sur BlaBlaCar Daily viennent de ses pages publiques (liste en fin de document, consultées le 9 novembre 2026). Les fonctions de carte et les propositions sont des choix de produit, pas des faits sourcés. Rien de tout cela n'est branché à une entreprise.

## 1. Ce que fait BlaBlaCar Daily (sources publiques)
- Inscription : l'utilisateur définit son trajet domicile-travail, ses horaires et les jours où il peut covoiturer. Il peut ne chercher que l'aller ou le retour et avoir des horaires différents selon les jours.
- Trajets générés automatiquement 7 jours à l'avance, à partir de ce profil. Un passager peut réserver jusqu'à 4 trajets par jour. Les changements durables (déménagement, nouveaux horaires), le mode vacances et le passage en conducteur se font depuis le calendrier.
- Mise en relation : l'application cherche les conducteurs sur le trajet selon horaires et lieux, propose les plus adaptés parmi des profils vérifiés, le passager n'a plus qu'à accepter. Lieux de rendez-vous et de dépose modifiables par le conducteur.
- Un trajet non réservé peut être désactivé, décalé ou transformé (« Je suis conducteur ») en trois touches depuis le Planning.
- Départ : bouton « Partir maintenant » si le conducteur part plus tôt, qui lance le GPS et prévient les passagers. Le conducteur ou le passager confirme la présence à bord.
- Preuve et validation : photo des deux mains du conducteur sur le volant avant le départ, géolocalisation conservée pendant le trajet, validation automatique par l'algorithme après la fin du trajet (fin manuelle ou automatique au bout de 45 minutes).
- Paiement : carte ou solde dans l'application ; le conducteur reçoit son paiement dans son solde une fois le trajet validé.
- Annulation passager : plus d'une heure avant, pas de débit ; moins d'une heure ou absence, le conducteur reçoit le montant. Annulation conducteur : pas de pénalité, mais suspension possible en cas d'annulations fréquentes ou de dernière minute.
- Garantie Retour (avec la MAIF) : si le conducteur annule le retour dans les 12 h avant le départ, retour pris en charge en VTC ou taxi jusqu'à 50 €, sous conditions (aller validé, trajet domicile-travail, subvention ou entreprise partenaire, une fois par 30 jours en entreprise partenaire ; invitation préalable à 2 autres conducteurs ; déclenchement possible 30 min avant le départ).
- Localisation : les conditions indiquent que le partage de position est facultatif quand le trajet n'est pas subventionné, et demandé quand il l'est.
- Réserve : ce sont les règles d'un produit commercial. Une application d'entreprise n'a pas les mêmes contraintes légales ni financières (voir cadrage v2).

## 2. Parcours cible de la démonstration, de l'inscription au retour
1. Première ouverture : choisir un profil (démo) ou, en réel, se connecter avec le compte professionnel (une seule étape, pas de nouveau mot de passe).
2. Quelques questions seulement : domicile (ou gare), voiture oui/non, jours habituels, horaires d'arrivée et de départ. Valeurs proposées par défaut, tout modifiable plus tard.
3. Tout est généré : la semaine suivante est prête sans action. L'utilisateur voit un seul écran « Ma semaine » : Lun matin, Lun soir, etc., chaque case dit « trajet proposé », « en attente », « confirmé » ou « seul ce jour ».
4. Accepter en une touche. Une récurrence (même covoitureur sur un créneau) n'existe que si l'utilisateur la demande explicitement ; c'est un consentement visible, modifiable et révocable à tout moment. Rien n'est accepté à sa place, aucun argent n'est engagé ou déduit sans son choix.
5. Veille du trajet et départ : rappel avec heure et point de rendez-vous. « Je pars maintenant », « Je suis en retard de 10 min » (prévient les autres sans annuler).
6. Pendant : le moins de manipulations possible. Pas de photo obligatoire dans la démo ; en réel, la corroboration doit être décidée avec le DPO.
7. Après : fin automatique et confirmation légère des deux côtés. Attention : une confirmation passive ne prouve ni la présence ni l'éligibilité à un versement ; ce niveau de preuve reste celui du cadrage (déclaré, puis corroboré) et décide de l'argent, pas la fin automatique.
8. Aléas : conducteur absent, retard, passager absent, congé posé tardivement, changement d'horaires, trajet de retour annulé, plus aucune personne sur son trajet, météo ou grève. Pour chacun : une alternative visible en un écran, mais seulement si elle existe réellement (autre conducteur disponible, gare). Aucune promesse de taxi ou de prise en charge par l'entreprise tant que celle-ci ne l'a pas décidée ; sinon l'écran dit « pas d'alternative proposée ».

## 3. Fonctions usuelles d'une carte de covoiturage à ajouter (propositions)
Priorité 1 (utile à la démonstration) :
- Zoom, déplacement, bouton « recentrer sur le site », échelle et attribution (zoom par trajet déjà fait).
- Point de départ choisi ou glissé sur la carte, avec adresse affichée. Tant que l'itinéraire n'est pas recalculé par un moteur autorisé, l'écran affiche « non calculé » : l'ancienne matrice précalculée ne sert jamais pour un point déplacé.
- Accessibilité : tout se fait au clavier et au lecteur d'écran, avec une liste textuelle des trajets équivalente à la carte (pas seulement du contraste). Zoom et déplacement sur mobile sans bloquer le défilement de la page (boutons +/- et geste à deux doigts, pas de capture du défilement à un doigt).
- Heure de départ, d'arrivée et durée affichées sur le tracé ; distance du détour.
- Filtre jour, sens, créneau ; trajet sélectionné dans une liste.
- Gare et point de prise en charge distincts du domicile.
Priorité 2 :
- Isochrone ou zone « accessible en moins de N minutes du site » pour montrer qui est covoiturable.
- Carte de chaleur des domiciles (agrégée, jamais de point individuel visible des collègues) pour la direction.
- Basculer fond de carte, légende, contraste élevé.
- Partage de position pendant le trajet, uniquement si la base légale le permet.
Priorité 3 (réel seulement) :
- Temps de trajet avec trafic, alertes de retard, recalcul d'itinéraire.

## 4. Questions à se poser (liste ouverte, à traiter avec les parties prenantes)
Utilisateur : qui conduit quand personne ne veut ? Que se passe-t-il le jour où le conducteur est en retard ? Faut-il une règle claire de tolérance (par exemple 10 minutes) ? Comment éviter de se sentir surveillé ? Faut-il montrer l'adresse exacte à un collègue ? Qui prévient la personne quand le trajet est annulé, et quand ?
Fiabilité : que faire d'un retour annulé à la dernière minute dans une entreprise sans solution de repli (VTC pris en charge, transport en commun, voiture partagée) ? Quelle limite d'annulations avant un rappel, sans sanction automatique ?
Données : qui voit quoi ? Trace GPS conservée combien de temps ? Alternative sans GPS (confirmation des deux côtés) suffisante ? Décision DPO et analyse d'impact à trancher.
Argent : qui paie quoi, selon la règle de partage de frais (cadrage v2) ? Pas de versement sans trajet corroboré. Paie à valider pour le forfait mobilités durables.
Fonctionnement « comme une usine » : mesurer chaque jour combien de trajets proposés sont acceptés, réalisés, annulés ; temps moyen entre inscription et premier trajet ; part de profils sans proposition. Un tableau pour la direction et un pour l'équipe qui exploite.
Adoption : combien de gestes par jour (cible : zéro à un) ? Comment démarrer sans masse critique (quelques sites, communication, premiers trajets garantis) ? Que voit une personne qui n'a personne sur son trajet ?

## 5. Sources
- https://www.blablacardaily.com/passagers
- https://support.blablacardaily.com/fr-fr/contents/Gerer-mes-trajets-en-tant-que-passager-Fe7WC-8X
- https://support.blablacardaily.com/contents/Annuler-ou-modifier-un-trajet-en-tant-que-passager-Fe7kC_BL
- https://support.blablacardaily.com/contents/Annuler-ou-modifier-un-trajet-en-tant-que-conducteur-Fe7lC_BW
- https://support.blablacardaily.com/contents/A-quel-moment-mon-trajet-est-il-valide-Fe7FC-35
- https://support.blablacardaily.com/contents/la-garantie-retour-q6VtL6do/steps/q6X865cs
- https://support.blablacardaily.com/contents/Methodes-de-paiement-Fe7cC--Q
- https://www.blablacardaily.com/terms
