# Semaine 10 — MCP et tests end-to-end avec Playwright

### Qu’avons-nous fait ?
- Rédaction de deux scénarios E2E pour la recherche d’offres (EF-30) dans `e2e/recherche-offres/scenarios.md` : une recherche avec résultat (`APPLICATION`) et une recherche sans résultat (`blockchain`).
- Exécution du scénario 1 par Copilot avec le serveur Playwright MCP, lancé dans notre terminal et connecté à VS Code.
- Installation de Playwright Test, configuration de `playwright.config.ts` et génération des tests dans `e2e/recherche-offres/recherche-offres.spec.ts`.
- Lancement des tests deux fois de suite et de `npm run check`, puis introduction d’un défaut temporaire (filtre par titre désactivé) pour vérifier que les tests échouent, avant de restaurer le code.

### Scénarios choisis
Les scénarios sont décrits dans [scenarios.md](../../e2e/recherche-offres/scenarios.md).
- **Scénario 1 (cas nominal)** : on a choisi de chercher `APPLICATION` en majuscules avec un étudiant, parce que ce seul cas vérifie trois règles de la semaine 9 en même temps : la recherche partielle dans le titre, l'insensibilité à la casse et le fait qu'un étudiant ne voit que les offres publiées (« Migration d'une application vers le cloud » contient aussi le mot mais elle est attribuée, donc elle ne doit pas apparaître).
- **Scénario 2 (cas limite)** : une recherche sans résultat (`blockchain`). On voulait vérifier que c'est bien le message propre à la recherche qui s'affiche (« Aucune offre ne correspond à la recherche. ») et pas le message de liste vide, une distinction qu'on avait déjà dû demander à Copilot en semaine 9.
- On a utilisé Louis Claes parce qu'il n'a aucune candidature, et la recherche ne modifie aucune donnée : les scénarios sont donc répétables avec la base de démo.

### Exploration avec Playwright MCP
- **Scénario exécuté :** scénario 1 (recherche avec résultat), avec l'étudiant Louis Claes. Détail complet dans [conversation-mcp.md](conversation-mcp.md).
- **Résultat :** après la saisie de `APPLICATION`, le compteur affiche « 1 offre » et seule « Application React de gestion de flotte » est listée. « Migration d'une application vers le cloud » (offre attribuée, non visible pour un étudiant) et « API REST de facturation » n'apparaissent pas. Aucun écart avec le scénario.
- **Appels d'outils observés :**
  - `browser_navigate` (`url: "http://localhost:5173"`) → a renvoyé la page Gesta chargée sur `/`, titre « Gesta ».
  - `browser_click` (`target: "e27"`, bouton « Louis Claes ») → connexion effectuée, retour sur l'accueil.
  - `browser_type` (`target: "e141"`, champ « Rechercher par mot-clé », `text: "APPLICATION"`) → texte saisi dans le champ de recherche.
  - `browser_snapshot` (`depth: 8`) → arbre d'accessibilité de la page : compteur « 1 offre » et une seule offre dans le tableau. C'est grâce à ce retour que l'agent « voit » le résultat.

### Tests automatisés avec Playwright Test
- **Fichiers créés ou modifiés :** `playwright.config.ts` (testDir `./e2e`, baseURL `http://localhost:5173`, Chromium uniquement, 1 worker, `webServer` qui lance `npm run dev`), `e2e/recherche-offres/recherche-offres.spec.ts`, et `.gitignore` (rapports Playwright et dossier `.playwright-mcp/`).
- **Principales assertions :**
  - scénario 1 : avant la recherche, 4 offres dans le tableau ; après `APPLICATION`, `toBeVisible()` sur « 1 offre » et sur « Application React de gestion de flotte », et surtout `toHaveCount(0)` sur « Migration d'une application vers le cloud » (c'est ce qui vérifie la visibilité des offres) et sur « API REST de facturation ».
  - scénario 2 : après `blockchain`, `toBeVisible()` sur le message « Aucune offre ne correspond à la recherche. » et plus aucun tableau ni compteur ; après avoir vidé le champ, « 4 offres » reviennent.
  - Les tests utilisent `getByRole`, `getByLabel` et `getByText` et des assertions qui réessaient automatiquement (la recherche a un délai de 300 ms), sans `waitForTimeout`.
- **Exécutions :** `npx playwright test` lancé deux fois de suite : 2 tests passés à chaque fois.
- **`npm run check` :** réussi (lint, typecheck, tests backend et frontend, build). Cette commande ne lance pas les tests E2E (elle n'appelle que Vitest), donc on garde `npx playwright test` comme commande séparée.

### Vérification : le test détecte-t-il un vrai défaut ?
- **Défaut introduit temporairement** dans `backend/src/repositories/offers.repository.ts` : la condition de recherche `AND (@pattern IS NULL OR o.title LIKE @pattern ESCAPE '\\')` a été remplacée par `AND (@pattern IS NULL OR 1 = 1)`. La recherche ignore alors le texte saisi et renvoie toutes les offres visibles, sans faire planter l'API.
- **Échec constaté :** `npx playwright test` → les 2 tests échouent sur leurs assertions, pas sur une erreur de configuration ou de connexion. Le scénario 1 attend « 1 offre » mais les 4 offres restent affichées ; le scénario 2 attend le message « Aucune offre ne correspond à la recherche. » mais le tableau reste affiché.
- **Après restauration :** `git diff` ne montre plus aucune modification dans `backend/` ni `frontend/`, et `npx playwright test` → 2 passed. Le défaut n'est pas présent dans la PR.

### Comparaison MCP / Playwright Test
1. **Que permet Playwright MCP ?** Il donne à l'agent des outils pour piloter un vrai navigateur pendant la conversation : ouvrir une page, cliquer, taper du texte et lire l'état de la page. Par exemple, on a vu passer `browser_type` pour saisir `APPLICATION` dans le champ de recherche, puis `browser_snapshot` qui a renvoyé l'arbre de la page avec « 1 offre ».
2. **Qu'apportent les scripts Playwright Test ?** Ils sont versionnés et peuvent être relancés à l'identique, sans agent et sans interprétation de l'IA, par exemple dans une CI. Le résultat est vérifié par des assertions précises (passed / failed) et non par un compte rendu de l'agent, qu'on doit croire sur parole. On l'a bien vu : Copilot a déjà affirmé avoir ouvert une page alors que ce n'était pas le cas.
3. **Quand préférer l'un ou l'autre ?** MCP est utile pour explorer rapidement une fonctionnalité, reproduire un bug ou vérifier un parcours une fois, sans écrire de code. Les tests automatisés sont préférables dès qu'un comportement doit être vérifié à chaque modification (non-régression, CI), parce qu'ils sont reproductibles et ne dépendent pas de l'agent.

### Quels problèmes avons-nous rencontrés ?
- Gros poblèmes de connexion au server MCP pour l'exercice 1 par github Copilot, nous avons réglé le pproblème à l'aide de Claude lui même ayant eu du mal, voici l'explication de Claude sur le problème rencontrer: 
  - **Sandbox de Copilot** : le réseau est filtré (`chat.agent.networkFilter`), et l'accès à `localhost` a d'abord été refusé. Il a fallu l'autoriser explicitement (`localhost` ajouté aux domaines autorisés).
  - **Mauvais outil utilisé** : au lieu des outils du serveur MCP (`browser_navigate`, `browser_click`…), Copilot appelait le navigateur intégré de VS Code (`openBrowserPage` / `navigatePage`), qui n'est pas du MCP et que le filtre réseau bloque.
  - **Client HTTP « fait maison »** : dans une session, Copilot a écrit son propre client pour parler en HTTP directement au serveur sur `localhost:8931`, ce que la consigne interdisait. Il a ensuite affirmé que la page était ouverte sans l'avoir vérifié, puis l'a reconnu quand on l'a contredit.
  - **Serveur non chargé par VS Code** : la cause réelle était que le serveur `playwright` n'était rattaché à aucune session de chat. `.mcp.json` n'était pas pris en compte par notre version de VS Code (et avait en plus perdu sa ligne `"type": "http"`). La solution a été de déclarer le serveur dans `.vscode/mcp.json` (clé `servers`), puis de le démarrer manuellement (Extensions → MCP Servers – Installed → Start Server : « Connection state: Running »), et enfin d'ouvrir une nouvelle session de chat pour que les outils `browser_*` y apparaissent.
  - **Ce que nous en retenons** : une affirmation de l'agent ne suffit pas. Il faut vérifier dans les appels d'outils (et dans le navigateur) que l'action a réellement eu lieu.
 
- Un manque de perfomance générale sur certaines tâches par cette version de github Copilot mais sinon pour la partie des tests e2e il n'y a eu aucun soucis dans son ensemble il a su respecter les consignes, tout est correct après vérification humaine et tous les tests passent. Petit précision mais une fonctionnalité en cas d'erreur des tests mis par github Copilot bloque la console pour afficher l'erreur dans une page html du navigateur par défaut, mais il est précisé qu'il suffit juste de faire ctrl-c pour tout arrêté. 