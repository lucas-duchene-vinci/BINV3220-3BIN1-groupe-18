# Bilan — Guides et senseurs du dépôt Gesta

**Date de l’inventaire :** 10 novembre 2026  
**Périmètre :** documentation, configuration, scripts, règles d’exécution et tests.
`node_modules/`, `dist/` et la base binaire locale sont exclus.

## 1. Définitions et méthode

- **Guide :** mécanisme qui donne des consignes avant l’action.
- **Senseur :** mécanisme qui observe le code ou son comportement et produit un retour.
- **Feedforward :** consigne fournie avant l’action.
- **Feedback :** retour produit après observation ou exécution.

| | Guide — feedforward | Senseur — feedback |
|---|---|---|
| **Inférentiel** | `README.md`, `docs/utilitaire/architecture.md`, `docs/utilitaire/cdc_gesta_developpement.md`, `docs/utilitaire/seed.md`, `backend/API.md` et `.github/pull_request_template.md`. | Aucun senseur inférentiel automatique. Le template demande une revue humaine, un test navigateur et une conversation exportée, mais ne les réalise pas. |
| **Computationnel** | `package.json`, scripts des workspaces, configurations TypeScript/Oxlint, migrations SQLite et `backend/src/services/permissions.ts`. | Oxlint, TypeScript, Vitest, Supertest, Testing Library, builds TypeScript/Vite et tests SQLite. |

## 2. Mécanismes présents

### G1 — Documentation de cadrage

Les guides décrivent l’architecture en couches, les contrats API, les profils, les
statuts, le format des erreurs, les commandes et les règles de migration.
Le jeton est envoyé comme valeur complète de `Authorization`, sans préfixe `Bearer`,
et toute évolution du schéma passe par un nouveau fichier de migration ordonné.

**État :** décrit/configuré seulement.

### G2 — Template de pull request

`.github/pull_request_template.md` demande de renseigner la fonctionnalité, les
changements, les vérifications, les tests d’erreur, les droits backend, la documentation
API, les migrations, le test navigateur avec les profils concernés et la conversation
exportée avec l’agent. La checklist exige notamment que `npm run check` passe sans erreur
ni avertissement.

**État :** décrit/configuré seulement ; aucune PR n’a été créée ou revue pendant la séance.

### G3 — Guides computationnels de qualité

Les fichiers `package.json`, les configurations TypeScript et Oxlint imposent Node.js
`>= 22.14`, TypeScript strict, des imports cohérents, l’absence de `any` explicite,
l’égalité stricte, le respect des règles React Hooks et zéro avertissement Oxlint.
`npm run check` enchaîne lint, vérification des types, tests et build.

**État :** exécuté et vérifié.

### G4 — Guides métier et données

`permissions.ts`, `authenticate.ts`, `authorize.ts` et les migrations imposent
l’évaluation des permissions avant l’opération, les réponses 401/403, les clés
étrangères, les valeurs autorisées, les dates cohérentes et une seule candidature
active par étudiant et par offre.

**État :** exécuté et vérifié par les tests backend.

### S1 à S4 — Senseurs automatisés

- **Oxlint :** observe les violations de style et de règles TypeScript/React/JavaScript.
  Résultat : aucune erreur ni avertissement.
- **TypeScript :** observe les erreurs de typage, imports et variables inutilisées.
  Résultat : backend et frontend réussis.
- **Tests :** Vitest, Supertest et Testing Library observent l’API, l’authentification,
  les permissions, SQLite et les comportements React. Résultat : 10 fichiers et
  117 tests backend réussis ; 8 fichiers et 49 tests frontend réussis.
- **Builds :** observent la compilation et les artefacts. Les builds backend et frontend
  ont réussi ; Vite a transformé 60 modules.

## 3. Comparaison avec Web 2

Sources : [slides Web 2](https://github.com/e-vinci/BINV2150A-slides), séances 01 à 15,
et [dépôt des exercices](https://github.com/e-vinci/BINV2150A-exercices). Le dossier
`solutions/` ne contient que `.gitkeep` ; les boilerplates confirment l’organisation
backend en contrôleurs, services, modèles et mappers.

| Attente Web 2 (source) | Guide examiné | Correspondance | Écart ou ajout proposé |
|---|---|---|---|
| Architecture en couches, types et modules (séance 01, exercices backend). | `.github/copilot-instructions.md` : `controllers → services → repositories → SQLite` et `pages → hooks → services/utils → models`. | **Oui** | Exiger le parcours complet des couches et les tests pour chaque fonctionnalité. |
| Types explicites, imports/exports et organisation par modules (séances 01 et 10). | TypeScript strict, imports backend en `.ts`, absence de `any`. | **Oui** | Préciser le placement des types frontend et interdire les imports circulaires. |
| API REST, verbes HTTP, statuts et documentation (séance 02). | `backend/API.md` décrit routes, corps, réponses et statuts ; format `{ error: { code, message } }`. | **Oui** | Mettre à jour `API.md` pour chaque route avec succès et erreurs. |
| Validation des entrées et erreurs exploitables (séances 02 et 12). | Validation dans les contrôleurs ; limites de `q` à 100 et `message` à 1000. | **Oui** | Ajouter la validation frontend sans remplacer celle du backend et tester chaque entrée invalide. |
| Authentification, autorisation, JWT, hachage avec sel et secrets (séances 03 et 04). | `authenticate` puis `authorize` ; mode démo interdit en production. | **Partielle** | Exiger, pour une authentification réelle, le hachage avec sel, l’absence de secrets dans les logs et l’usage de variables d’environnement. |
| Événements et formulaires React (`submit`, `preventDefault`, champs contrôlés ; séances 06 et 12). | Hooks, annulation et `onUnauthorized` ; tests d’erreur dans le template. | **Partielle** | Ajouter labels associés, erreurs reliées aux champs, désactivation pendant l’envoi et traitement explicite du succès/échec. |
| Composants, props, état et état partagé (séances 07 à 14). | Composants réutilisables, hooks propriétaires de l’état et `App.tsx` propriétaire de la session. | **Oui** | Interdire la duplication d’une même donnée dans plusieurs états et préférer props/remontée d’état. |
| Routage et navigation (séance 15). | React Router et pages par route sont mentionnés, sans détail sur la navigation ou la route inconnue. | **Partielle** | Ajouter routes nommées, liens accessibles, rechargement de l’URL et page 404. |
| Accessibilité : HTML sémantique, labels, clavier, focus, contraste et messages compréhensibles. | Aucun passage explicite dans les guides ni dans le template de PR. | **Non** | Ajouter une checklist et un test manuel au clavier ; l’audit automatisé ne suffit pas. |
| Tests des comportements, interactions et erreurs. | `npm run check`, tests d’erreur et test navigateur demandés par les guides. | **Oui** | Tester chaque nouveau comportement : accès refusé, entrée invalide, chargement, erreur et succès frontend. |
| Authentification réelle par JWT et hachage des mots de passe. | `backend/API.md` documente le mode démo sans mot de passe, limité au développement. | **Contradiction encadrée** | Ajouter une rubrique « hors production » et rappeler les exigences avant mise en production. |

## 4. Synthèse

L’architecture, TypeScript, REST, la validation backend, l’authentification/autorisation,
React et la validation automatisée sont bien guidés et vérifiables.

Les formulaires React, la sécurité liée aux mots de passe et le routage sont seulement
partiellement couverts. Le mode d’authentification de démonstration doit rester limité
au développement.

L’accessibilité est le principal manque : il faut documenter la sémantique HTML, les
labels, le clavier, le focus, le contraste et un test manuel, puis ajouter ces points
à la checklist de PR.

## 5. Traçabilité EF-32 / EF-33

Source : `docs/semaine-2/bilan.md`, `docs/semaine-2/conversation.md` et
`backend/tests/applications.test.ts`.

| Exigence | Cas vérifié | Couverture |
|---|---|---|
| EF-32 | Candidature à une offre publiée, message facultatif trimé et statut initial. | **Couvert** |
| EF-32 | Candidature sans message. | **Couvert** |
| EF-32 | Offre non publiée refusée. | **Couvert** |
| EF-32 | Seconde candidature active refusée. | **Couvert** |
| EF-32 | Message de plus de 1000 caractères refusé. | **Couvert** |
| EF-32 | Retrait d’une candidature en cours. | **Couvert** |
| EF-32 | Retrait d’une candidature traitée refusé. | **Couvert** |
| EF-32 | Retrait de la candidature d’un autre étudiant refusé. | **Couvert** |
| EF-32 | Nouvelle candidature possible après retrait. | **Couvert** |
| EF-33 | Un étudiant ne consulte que ses candidatures. | **Couvert** |
| EF-33 | Statuts `IN_PROGRESS` et `WITHDRAWN`. | **Couvert** |
| EF-33 | Statuts `SELECTED` et `REJECTED`. | **Couvert** |
| EF-33 | Liste vide pour un étudiant sans candidature : statut 200 et `body === []` pour Dmytro. | **Ajouté et couvert** |

## 6. Journal de vérification

| Commande ou vérification | Résultat |
|---|---|
| `npm run check` | Bloquée par la politique PowerShell sur le wrapper `npm`, particularité du shell Windows. |
| `npm.cmd run test -w backend -- tests/applications.test.ts` | Réussi : 1 fichier, 10 tests. |
| `npm.cmd run check` avant le dernier test ajouté | Réussi : lint, types, 120 tests backend, 49 tests frontend et builds. |
| `npm.cmd run check` après le dernier test | À relancer pour confirmer 121 tests backend, 49 tests frontend et les builds. |
| Revue humaine, navigateur et PR | Non réalisées pendant la séance ; elles restent demandées par le template. |

## Conclusion

Les guides couvrent correctement l’architecture, les conventions TypeScript, les contrats
REST, la validation backend, les droits et la validation automatisée. Ils couvrent
partiellement les formulaires React, le routage et la sécurité d’une authentification réelle.
L’accessibilité est absente des consignes explicites et constitue l’ajout prioritaire.