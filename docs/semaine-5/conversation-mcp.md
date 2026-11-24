# Semaine 10 — Conversation Copilot : exécution du scénario 1 avec Playwright MCP

> Transcription générée par Copilot à partir d'une seule session VS Code, qui a couvert à la fois
> l'exploration MCP et les tests Playwright. Elle a été découpée en deux fichiers :
> [conversation-mcp.md](conversation-mcp.md) (échanges 1 à 4) et
> [conversation-tests.md](conversation-tests.md) (échanges 5 à 8).

## Échange 1

**Utilisateur :**

Le serveur Playwright MCP est DÉJÀ lancé par moi dans mon terminal et connecté
à VS Code (serveur « playwright »). Ne le lance pas, n'exécute aucune commande et
ne communique pas avec lui en HTTP. Passe UNIQUEMENT par le client MCP de VS Code,
avec les outils du serveur « playwright » (browser_navigate, browser_snapshot,
browser_type, browser_click…). N'utilise pas navigateur intégré / navigatePage /
openBrowserPage. Si ces outils ne sont pas disponibles, arrête-toi et dis-le-moi.

Exécute le scénario 1 décrit dans e2e/recherche-offres/scenarios.md sur
http://localhost:5173 (connexion : cliquer sur « Louis Claes », pas de mot de passe).
Ne modifie pas le code et ne génère pas de script de test.

À la fin : actions réellement effectuées, observations et écarts avec le scénario,
et un tableau de chaque appel d'outil MCP (nom, paramètres, résumé du retour).

**Copilot :**

## Résultat

Scénario 1 exécuté sur `http://localhost:5173`, sans modifier le code ni générer de script de test.

- Connexion effectuée en cliquant sur **Louis Claes**.
- Sur **Offres**, les **4 offres publiées** étaient listées au départ et **Toutes les périodes** était sélectionné.
- Après avoir saisi `APPLICATION`, le compteur affichait **1 offre** et le tableau ne contenait que **Application React de gestion de flotte**.
- L’offre attribuée **Migration d'une application vers le cloud** et **API REST de facturation** n’apparaissaient pas dans le résultat filtré.
- **Écart avec le scénario : aucun observé.**

Le scénario de référence est [scenarios.md](../../e2e/recherche-offres/scenarios.md).

## Appels d’outils MCP Playwright

| Outil | Paramètres | Résumé du retour |
|---|---|---|
| `browser_tabs` | `action: "list"` | Une page partagée était ouverte sur `about:blank`. |
| `browser_navigate` | `url: "http://localhost:5173"` | Page Gesta chargée à `/`. |
| `browser_snapshot` | `depth: 6` | Page de connexion démo; sections Administrateurs, Étudiants et Contacts d'entreprise. |
| `browser_find` | `text: "Louis Claes"` | Bouton de connexion **Louis Claes** repéré (`e27`). |
| `browser_click` | `target: "e27"`, `element: "Louis Claes demo login button"` | Connexion effectuée; retour sur `/`. |
| `browser_snapshot` | `depth: 6` | Accueil affichant **Louis Claes**, rôle **Étudiant**, et le lien **Offres**. |
| `browser_click` | `target: "e124"`, `element: "Offres navigation link"` | Navigation vers `/offres`. |
| `browser_snapshot` | `depth: 8` | 4 offres publiées visibles; période **Toutes les périodes** sélectionnée. |
| `browser_type` | `target: "e141"`, `element: "Rechercher par mot-clé"`, `text: "APPLICATION"` | Texte saisi dans le champ de recherche. |
| `browser_snapshot` | `depth: 8` | Compteur **1 offre**; seule **Application React de gestion de flotte** est listée. |

## Échange 2

**Utilisateur :**

note moi tout ce que tu as fait dans un fichier exercice1.md dans docs/semaine-5/

**Copilot :**

J’ai consigné le parcours, les résultats et le tableau des appels MCP dans [exercice1.md](./exercice1.md). Vérifié après création.

## Échange 3

**Utilisateur :**

juste pour savoir où sont exactement les tests ? Les as tu écris ?

**Copilot :**

Non, je n’ai pas écrit de tests automatisés. J’ai exécuté le scénario manuellement avec Playwright MCP.

- Les scénarios à suivre sont dans [scenarios.md](../../e2e/recherche-offres/scenarios.md).
- [example.spec.ts](../../e2e/example.spec.ts) est un exemple Playwright existant qui teste le site playwright.dev, pas l’application Gesta.
- Le compte rendu de mon exécution est dans [exercice1.md](./exercice1.md).

## Échange 4

**Utilisateur :**

Ok je vois

**Copilot :**

👍

