> Mise à jour du 10 novembre 2026 : l’accueil est maintenant Carte, Quotidien gère un groupe habituel local (binôme ou trinôme), le retrait d’un créneau et une demande de nouveau partenaire. Direction est le dernier onglet. Les préparations sur carte ne remplacent aucun accord et n’entrent pas dans le bilan. Le fond est désormais Plan IGN (data.geopf.fr, Licence Ouverte 2.0), pas le serveur de tuiles OSM. Les tracés routiers restent les précalculs OSRM/OpenStreetMap. Les anciens détails ci-dessous sur le fond OSM et l’ordre des écrans sont historiques. Voir ERGONOMIE.md pour les sources et limites actuelles.

# Sécurité : ce que fait cette démonstration, et ce que le réel exigerait

Aucune certification (ISO/IEC 27001 ou autre) n'est revendiquée. L'annexe A de l'ISO/IEC 27001:2022 (https://www.iso.org/standard/27001) et l'OWASP ASVS 5.0.0 (https://owasp.org/www-project-application-security-verification-standard/) servent de grille de contrôles, rien de plus.

## Dans cette page
- Aucune donnée réelle, aucun cookie, aucun stockage navigateur, aucune requête réseau (connect-src 'none').
- Politique de sécurité de contenu stricte : scripts et styles du même site uniquement, pas de script en ligne.
- Les données affichées sont insérées comme du texte, jamais comme du HTML.
- Vue direction : noms et adresses jamais affichés. Adresse du domicile affichée seulement au conducteur du trajet, après confirmation (règle simulée).

## Pour un déploiement réel (non réalisé)
| Risque | Contrôle à prévoir |
|---|---|
| Accès non autorisé aux domiciles et trajets | Authentification forte via le compte professionnel, droits par rôle, chiffrement, journal d'audit |
| Collecte excessive de localisation | Minimisation, durée de conservation courte, suppression après corroboration, information des personnes |
| Usurpation ou doublon de compte | Une identité professionnelle par compte, un appareil par compte |
| Détournement d'avantages financiers | Aucun versement sans trajet corroboré, plafonds, revue humaine, audit par échantillon |
| Fuite via les fournisseurs (cartes, routage) | Contrat, région d'hébergement, quotas, pas de données personnelles inutiles |
| Faille applicative | Revue de code, tests, test d'intrusion avant mise en service |
| Analyse d'impact et base légale | Décision du DPO de l'entreprise, avis des représentants du personnel |

Mise à jour : la seule requête externe autorisée par la politique de sécurité du contenu est l'image des tuiles OpenStreetMap (img-src). Aucun script, aucune connexion de données (connect-src 'none'). Les tuiles révèlent à OpenStreetMap l'adresse IP du visiteur et la zone affichée : à traiter dans l'analyse de vie privée avant un vrai déploiement.
