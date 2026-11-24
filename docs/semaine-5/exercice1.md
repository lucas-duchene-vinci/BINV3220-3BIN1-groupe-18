# Exercice 1 — Recherche d'offres avec Playwright MCP

## Scénario exécuté

Scénario 1 (« Recherche avec résultat (nominal) ») de
[`e2e/recherche-offres/scenarios.md`](../../e2e/recherche-offres/scenarios.md),
sur `http://localhost:5173`.

## Actions effectuées

1. Consulté les onglets Playwright disponibles : une page partagée était ouverte sur
   `about:blank`.
2. Navigué vers `http://localhost:5173`.
3. Vérifié l'écran de connexion de démonstration et repéré le bouton « Louis Claes ».
4. Cliqué sur « Louis Claes », sans saisir de mot de passe.
5. Vérifié la connexion sous l'identité de Louis Claes, rôle étudiant.
6. Cliqué sur le lien « Offres ».
7. Vérifié qu'avant la recherche les quatre offres publiées étaient listées et que
   « Toutes les périodes » était sélectionné.
8. Saisi `APPLICATION` dans « Rechercher par mot-clé ».
9. Vérifié le résultat filtré.

## Résultat et écarts

Le compteur affiche « 1 offre ». Le tableau contient uniquement « Application React de
gestion de flotte ». « Migration d'une application vers le cloud » (offre attribuée) et
« API REST de facturation » n'apparaissent pas dans le résultat.

Le résultat correspond aux attentes du scénario : recherche partielle et insensible à la
casse, tout en ne montrant que les offres publiées à l'étudiant. Aucun écart n'a été
observé.

## Appels d'outils MCP Playwright

| Outil | Paramètres fournis | Résumé du retour |
|---|---|---|
| `browser_tabs` | `action: "list"` | Une page partagée était ouverte sur `about:blank`. |
| `browser_navigate` | `url: "http://localhost:5173"` | Page Gesta chargée à `/`, titre « Gesta ». |
| `browser_snapshot` | `depth: 6` | Écran de connexion de démonstration; la liste des étudiants était présente. |
| `browser_find` | `text: "Louis Claes"` | Bouton « Louis Claes » repéré (référence `e27`). |
| `browser_click` | `target: "e27"`, `element: "Louis Claes demo login button"` | Clic sur le bouton de connexion. |
| `browser_snapshot` | `depth: 6` | Accueil affichant Louis Claes comme étudiant et le lien « Offres ». |
| `browser_click` | `target: "e124"`, `element: "Offres navigation link"` | Navigation vers `/offres`. |
| `browser_snapshot` | `depth: 8` | Les quatre offres publiées sont listées; « Toutes les périodes » est sélectionné. |
| `browser_type` | `target: "e141"`, `element: "Rechercher par mot-clé"`, `text: "APPLICATION"` | Texte saisi dans le champ de recherche. |
| `browser_snapshot` | `depth: 8` | Compteur « 1 offre »; seul « Application React de gestion de flotte » apparaît. |

## Périmètre

Le parcours a été réalisé avec les outils MCP Playwright. Aucun code n'a été modifié et
aucun script de test n'a été généré ou exécuté. Aucune commande ni requête HTTP vers le
serveur Playwright n'a été lancée.
