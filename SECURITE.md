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
