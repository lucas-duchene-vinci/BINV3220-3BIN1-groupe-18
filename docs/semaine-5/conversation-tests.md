# Semaine 10 — Conversation Copilot : configuration et génération des tests Playwright

> Transcription générée par Copilot à partir d'une seule session VS Code, qui a couvert à la fois
> l'exploration MCP et les tests Playwright. Elle a été découpée en deux fichiers :
> [conversation-mcp.md](conversation-mcp.md) (échanges 1 à 4) et
> [conversation-tests.md](conversation-tests.md) (échanges 5 à 8).

## Échange 5

**Utilisateur :**

Playwright Test est déjà installé à la racine (npm init playwright@latest).
Adapte playwright.config.ts sans rien casser d'autre :
- garde testDir: './e2e' ;
- use.baseURL: 'http://localhost:5173' ;
- garde un seul projet : chromium (supprime firefox et webkit) ;
- fullyParallel: false et workers: 1 (les tests partagent la base de démo) ;
- webServer : { command: 'npm run dev', url: 'http://localhost:5173',
  reuseExistingServer: true, timeout: 120000 } (npm run dev démarre l'API et le frontend).

Supprime aussi le fichier d'exemple e2e/example.spec.ts, et ajoute /.playwright-mcp/
au .gitignore (dossier créé par le serveur MCP à l'étape précédente).

N'utilise pas MCP, ne lance aucune commande et ne modifie pas le code applicatif.
Montre-moi le diff final de playwright.config.ts.

**Copilot :**

C’est fait. J’ai modifié [playwright.config.ts](../../playwright.config.ts), ajouté `/.playwright-mcp/` à [.gitignore](../../.gitignore) et supprimé `e2e/example.spec.ts`. Aucun code applicatif n’a été modifié. Je n’ai utilisé ni MCP ni commandes, et n’ai pas lancé les tests.

Diff de `playwright.config.ts` :

```diff
-  /* Run tests in files in parallel */
-  fullyParallel: true,
+  /* Tests share the demo database, so keep them sequential. */
+  fullyParallel: false,
   /* Fail the build on CI if you accidentally left test.only in the source code. */
   forbidOnly: !!process.env.CI,
   /* Retry on CI only */
   retries: process.env.CI ? 2 : 0,
-  /* Opt out of parallel tests on CI. */
-  workers: process.env.CI ? 1 : undefined,
+  workers: 1,
   /* Reporter to use. See https://playwright.dev/docs/test-reporters */
   reporter: 'html',
   /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
   use: {
     /* Base URL to use in actions like `await page.goto('')`. */
-    // baseURL: 'http://localhost:3000',
+    baseURL: 'http://localhost:5173',

     /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
     trace: 'on-first-retry',
   },

-  /* Configure projects for major browsers */
+  /* Configure the Chromium project. */
   projects: [
     {
       name: 'chromium',
       use: { ...devices['Desktop Chrome'] },
     },
-
-    {
-      name: 'firefox',
-      use: { ...devices['Desktop Firefox'] },
-    },
-
-    {
-      name: 'webkit',
-      use: { ...devices['Desktop Safari'] },
-    },
-
-    /* Test against mobile viewports. */
-    // ...
-
-    /* Test against branded browsers. */
-    // ...
   ],

-  /* Run your local dev server before starting the tests */
-  // webServer: {
-  //   command: 'npm run start',
-  //   url: 'http://localhost:3000',
-  //   reuseExistingServer: !process.env.CI,
-  // },
+  webServer: {
+    command: 'npm run dev',
+    url: 'http://localhost:5173',
+    reuseExistingServer: true,
+    timeout: 120000,
+  },
 });
```

## Échange 6

**Utilisateur :**

À partir des scénarios 1 et 2 de e2e/recherche-offres/scenarios.md,
génère des tests end-to-end avec Playwright Test et TypeScript dans
e2e/recherche-offres/recherche-offres.spec.ts.
Indique le numéro du scénario dans le nom de chaque test.

N'utilise pas MCP : produis des fichiers de test classiques.
Les tests doivent passer par l'interface utilisateur, vérifier les
résultats avec des assertions explicites et utiliser des sélecteurs
robustes. Prévois des données de test maîtrisées pour que les tests
soient répétables et ne dépendent pas de leur ordre d'exécution.

Précisions sur l'application :
- connexion : bouton « Louis Claes » sur la page de connexion (mode démo), dans un
  beforeEach, puis lien de navigation « Offres » ;
- champ de recherche : getByLabel('Rechercher par mot-clé') (input type search) ;
- la recherche a un délai de 300 ms : utilise les assertions auto-retry
  (expect(...).toHaveText / toBeVisible / toHaveCount), jamais waitForTimeout ;
- privilégie getByRole('row', ...), getByRole('cell', ...) et getByText exact ;
- les tests ne modifient aucune donnée : documente-le en commentaire en tête du fichier.

Assertions attendues :
- scénario 1 : avant recherche, 4 lignes d'offres ; après « APPLICATION », compteur
  « 1 offre », une seule ligne « Application React de gestion de flotte », et ni
  « Migration d'une application vers le cloud » ni « API REST de facturation » ;
- scénario 2 : après « blockchain », message « Aucune offre ne correspond à la
  recherche. » visible, aucun tableau ; après avoir vidé le champ, 4 offres reviennent.

Ne lance pas les tests toi-même (la sandbox bloque le navigateur) : je les lancerai.
Si un test échoue ensuite, explique d'abord si le problème vient du test, de sa
configuration ou de l'application. Ne modifie pas le code applicatif sans mon accord.

**Copilot :**

Les deux tests Playwright sont dans [recherche-offres.spec.ts](../../e2e/recherche-offres/recherche-offres.spec.ts). Leurs noms précisent les scénarios 1 et 2; chacun se reconnecte via `beforeEach` et utilise des assertions auto-retry, sans attente fixe.

Ils vérifient les résultats demandés et ne modifient aucune donnée : ils reposent sur les quatre offres du seed de démonstration. Je n’ai pas lancé les tests, conformément à votre demande.

## Échange 7

**Utilisateur :**

Pour vérifier que les tests E2E détectent un vrai défaut, introduis TEMPORAIREMENT
un défaut simple : dans backend/src/repositories/offers.repository.ts, désactive le
filtrage par titre (commente la condition sur @pattern dans la requête SQL).
Ne touche à rien d'autre. Dis-moi exactement ce que tu as modifié pour que je puisse
le restaurer.

**Copilot :**

J’ai modifié uniquement la requête dans [offers.repository.ts](../../backend/src/repositories/offers.repository.ts) :

```sql
      AND (@pattern IS NULL OR 1 = 1)
      -- AND (@pattern IS NULL OR o.title LIKE @pattern ESCAPE '\\')
```

La première ligne maintient le paramètre `@pattern` dans la requête tout en rendant le filtre toujours vrai; sans elle, le paramètre fourni par le dépôt ne serait plus utilisé. Le filtrage par titre est donc désactivé. Je n’ai rien changé d’autre et n’ai pas lancé les tests.

Pour restaurer, remplace ces deux lignes par :

```sql
      AND (@pattern IS NULL OR o.title LIKE @pattern ESCAPE '\\')
```

## Échange 8

**Utilisateur :**

Restaure exactement le code d'origine de offers.repository.ts (annule le défaut
temporaire) et confirme avec git diff que ce fichier n'a plus aucune modification.

**Copilot :**

J’ai restauré la condition d’origine dans [offers.repository.ts](../../backend/src/repositories/offers.repository.ts) :

```sql
AND (@pattern IS NULL OR o.title LIKE @pattern ESCAPE '\\')
```

`git diff -- backend/src/repositories/offers.repository.ts` ne retourne aucune sortie : ce fichier n’a plus de modification détectée par Git.

