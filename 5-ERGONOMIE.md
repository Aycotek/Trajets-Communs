# Ce qui rend un parcours intuitif, et comment c'est appliqué ici

Document écrit le 10 novembre 2026, à la demande d'Arthur : chercher ce que dit la recherche sur l'intuitivité d'un site ou d'un processus, puis l'appliquer au parcours centré sur la carte. Aucune prétention : l'intuitivité ne se décrète pas, elle se mesure avec de vrais utilisateurs (voir Limites).

## Ce que dit la recherche

1. **Intuitif = qui réutilise ce qu'on sait déjà.** L'usage intuitif d'une interface se définit comme une interaction qui s'appuie sur l'expérience antérieure, de façon peu consciente et peu coûteuse cognitivement (Naumann et al., « Intuitive Use of User Interfaces: Defining a Vague Concept », HCI International 2007, http://www.ekphorie.de/ham/pub/pdf/HCI07_Naumann_et_al.pdf ; Hurtienne & Blessing, « Design for Intuitive Use », image schema theory, http://joernhurtienne.com/Publications_files/Paper_386_HurtienneBlessing.pdf). Conséquence ici : le point de départ du parcours est une carte routière et des trajets domicile-travail, deux choses que chaque salarié connaît déjà — pas un tableau de chiffres.

2. **Reconnaissance plutôt que rappel** (heuristique n°6 de Nielsen, « 10 Usability Heuristics for User Interface Design », https://www.nngroup.com/articles/ten-usability-Heuristics/). Montrer les options vaut mieux que demander de se souvenir. Conséquence : l'ensemble des collaborateurs est visible sur la carte d'accueil ; on clique un tracé ou un point pour voir le trajet, au lieu de chercher un nom dans une liste.

3. **Charge cognitive et nombre de choix.** La charge extrinsèque (tout ce qui ne sert pas la tâche) doit être réduite (théorie de la charge cognitive ; revue van Merriënboer & Sweller, 2010, https://asmepublications.onlinelibrary.wiley.com/doi/10.1111/j.1365-2923.2009.03498.x). Le temps de décision croît avec le nombre d'alternatives (loi de Hick-Hyman ; synthèse https://ixdf.org/literature/article/the-hick-hyman-law-an-argument-against-complexity-in-user-interface-design). Conséquence : la page d'accueil n'offre qu'une chose à faire (regarder la carte, choisir un trajet) ; les chiffres de la direction sont relégués en dernier onglet.

4. **Signifiants et retour visible** (Norman, *The Design of Everyday Things* ; synthèse https://www.interaction-design.org/literature/topics/signifiers). Un élément cliquable doit le signaler, et chaque action doit produire un retour perceptible immédiat. Conséquence : les tracés de trajets sont cliquables avec info-bulle (« cliquer pour le détail »), et chaque décision (accepter, refuser, revenir) réaffiche l'état du créneau aussitôt.

5. **Adéquation à la tâche, auto-descriptivité, contrôlabilité** (ISO 9241-110:2020, principes d'interaction, https://www.iso.org/standard/75258.html). Conséquence : un écran par tâche — « Carte » pour trouver et préparer, « Quotidien » pour garder la routine, « Direction » pour chiffrer — et chaque écran dit ce qu'il fait et ce qui est simulé.

6. **Une routine s'installe par répétition dans un contexte stable** (Lally et al., « How are habits formed », European Journal of Social Psychology, 2010, https://onlinelibrary.wiley.com/doi/abs/10.1002/ejsp.674 : en médiane ~66 jours pour automatiser un comportement quotidien). Conséquence : l'onglet « Quotidien » permet de reconduire le même trajet avec le même binôme ou trinôme d'une semaine à l'autre sans tout recommencer, et de signaler un changement sur un créneau seul.

## Application concrète (10 novembre 2026)

- La carte devient la page d'accueil : tous les collaborateurs fictifs visibles (ronds avec voiture, losanges sans voiture), trajets tracés sur les routes.
- Les trajets se préparent depuis la carte : clic sur un tracé ou un point de prise en charge (ou liste équivalente) → fiche détaillée du trajet, règle d'identité des captures, horloge simulée, et décision pour le profil de démonstration (accepter, refuser, revenir). L'ancien onglet « Trajets », liste sans géographie, est supprimé : on ne prépare plus un trajet sans voir où sont les gens.
- « Ma semaine » devient « Quotidien » : la routine (mêmes partenaires, récurrence explicite et non durable, signalement d'un changement) plutôt qu'une grille administrative.
- « Direction » passe en dernier onglet : les chiffres restent accessibles mais ne sont plus la porte d'entrée.

## Limites honnêtes

- Aucun test avec de vrais utilisateurs n'a été mené : cette refonte applique des principes publiés, elle ne prouve pas que le parcours est intuitif. Le vérifier demande un test d'utilisabilité (faire accomplir les tâches clés à 5 à 8 salariés, mesurer réussite, temps et hésitations).
- Les sources ci-dessus sont des principes généraux, pas une validation de ce parcours précis.
- Aucune conformité RGAA/WCAG n'est revendiquée ; l'équivalent texte de la carte existe mais n'a pas été éprouvé au lecteur d'écran.
