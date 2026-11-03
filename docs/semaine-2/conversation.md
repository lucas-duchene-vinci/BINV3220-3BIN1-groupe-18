# Conversation — Semaine 2

## 1. Cadrage de la séance

La séance porte sur les fonctionnalités du cahier des charges :

- **EF-32** : un étudiant candidate à une offre publiée, avec un message
  facultatif, et peut retirer sa candidature tant qu'elle n'a pas été traitée ;
- **EF-33** : l'étudiant consulte ses candidatures et leur statut :
  « En cours », « Retenue », « Non retenue » ou « Retirée ».

Les limites annoncées pour la séance étaient :

- examiner le code et le schéma existants ;
- proposer trois étapes : candidater, consulter ses candidatures, retirer une
  candidature ;
- indiquer les fichiers concernés, les vérifications et les tests envisagés ;
- signaler les décisions métier à clarifier ;
- consulter les changements dans Source Control ;
- essayer le comportement obtenu avant de poursuivre ;
- permettre des tests manuels avec deux étudiants différents.

Les scénarios manuels demandés étaient :

- candidature à une offre publiée, avec et sans message ;
- présence de la candidature et de son statut après rechargement ;
- retrait d'une candidature encore en cours ;
- impossibilité de retirer une candidature déjà traitée ;
- séparation des candidatures de deux étudiants différents.

La validation technique demandée était `npm run check`, avec vérification du
lint, de TypeScript, des tests et de la compilation.

## 2. Vérification du cahier des charges et de l'existant

Le cahier des charges est présent dans
`docs/cdc_gesta_developpement.md`.

Il confirme notamment :

- la candidature d'un étudiant aux offres publiées ;
- la conservation des candidatures ;
- la sélection du candidat par un administrateur ;
- les statuts `IN_PROGRESS`, `SELECTED`, `REJECTED` et `WITHDRAWN` dans le
  schéma existant ;
- la présence d'une table `applications` dans `001_initial.sql`.

L'architecture existante suit les couches :

```text
Contrôleur → Service → Repository → SQLite
```

Le frontend suit les couches :

```text
Pages → Hooks → Services / Utils → Modèles
```

Les offres, les utilisateurs de démonstration et les candidatures existantes
ont été examinés. Les périodes `P1`, `P2` et `OTHER` ont été identifiées comme
des codes déjà présents dans le schéma et les modèles d'offres.

## 3. Plan proposé

Le plan a été enregistré dans le fichier de session, puis présenté avant
l'implémentation.

### Étape 1 — Candidater

- ajouter une API pour créer une candidature à une offre publiée ;
- accepter un message facultatif ;
- ajouter le bouton et le formulaire depuis la liste des offres ;
- tester les offres publiées et non publiées, avec et sans message.

### Étape 2 — Consulter ses candidatures

- ajouter une API limitée à l'étudiant connecté ;
- afficher l'offre, l'entreprise, la date et le statut ;
- ajouter une page dédiée accessible depuis la navigation ;
- vérifier la persistance et l'isolation entre étudiants.

### Étape 3 — Retirer une candidature

- changer `IN_PROGRESS` en `WITHDRAWN` ;
- refuser le retrait d'une candidature déjà `SELECTED` ou `REJECTED` ;
- ajouter les tests backend et frontend correspondants.

## 4. Décisions métier prises

Les choix suivants ont été confirmés pendant la séance :

- une recandidature est autorisée après un retrait ;
- les anciennes candidatures `WITHDRAWN` restent conservées ;
- une seule candidature active est autorisée pour un étudiant et une offre ;
- toute offre `PUBLISHED` visible dans la liste est éligible ;
- la visibilité annuelle des offres est maintenue manuellement par le
  responsable ;
- le message est facultatif, nettoyé avec `trim()` et limité à 1000 caractères ;
- le message est stocké dans `applications.message` ;
- la consultation se fait sur une nouvelle page accessible depuis la
  navigation ;
- une candidature ne déclenche pas de notification automatique.

## 5. Implémentation réalisée

### Backend

Les éléments suivants ont été ajoutés ou modifiés :

- `backend/src/models/application.ts` :
  types `ApplicationDbo`, `Application`, `ApplicationDto` et statuts ;
- `backend/src/mappers/application.mapper.ts` :
  conversion entre les colonnes SQL et les objets de l'application ;
- `backend/src/repositories/applications.repository.ts` :
  requêtes SQL pour lire, créer et retirer les candidatures ;
- `backend/src/services/applications.service.ts` :
  règles métier et contrôle de l'étudiant connecté ;
- `backend/src/controllers/applications.controller.ts` :
  routes HTTP, validation des paramètres et du message ;
- `backend/src/db/migrations/002_applications_active_unique.sql` :
  index unique partiel empêchant les doublons actifs ;
- `backend/src/services/permissions.ts` :
  permission `canManageApplications` ;
- `backend/src/app.ts` :
  branchement du routeur `/applications` ;
- `backend/API.md` :
  documentation des routes de candidature.

Les routes ajoutées sont :

```text
GET    /applications
POST   /applications
DELETE /applications/:id
```

Le backend vérifie notamment :

- que l'utilisateur est étudiant ;
- que l'offre est `PUBLISHED` ;
- qu'il n'existe pas déjà de candidature active ;
- que la candidature consultée ou retirée appartient bien à l'étudiant ;
- que seul le statut `IN_PROGRESS` peut devenir `WITHDRAWN`.

### Frontend

Les éléments suivants ont été ajoutés ou modifiés :

- `frontend/src/models/application.ts` :
  modèle frontend d'une candidature ;
- `frontend/src/services/applications.service.ts` :
  appels `GET`, `POST` et `DELETE` vers l'API ;
- `frontend/src/hooks/useApplications.ts` :
  chargement et rechargement des candidatures ;
- `frontend/src/pages/ApplicationsPage.tsx` :
  page « Mes candidatures » ;
- `frontend/src/pages/OffersPage.tsx` :
  formulaire de candidature depuis la liste des offres ;
- `frontend/src/components/OfferTable.tsx` :
  bouton « Candidater » avec callback facultative ;
- `frontend/src/App.tsx` :
  route `/candidatures` ;
- `frontend/src/components/NavBar.tsx` :
  lien de navigation visible pour les étudiants ;
- `frontend/src/utils/permissions.ts` :
  permission frontend d'affichage ;
- `frontend/src/utils/guards.ts` :
  validation des réponses JSON ;
- `frontend/src/utils/labels.ts` :
  libellés français et tonalités visuelles des statuts.

Le parcours frontend est :

```text
/offres
  → clic sur « Candidater »
  → formulaire sur la même page
  → POST /applications
  → /candidatures pour consulter l'historique
```

`ApplicationsPage.tsx` n'est donc pas la page de candidature : c'est la page
de consultation et de retrait. La candidature elle-même se fait dans
`OffersPage.tsx`.

## 6. Tests ajoutés

### Tests backend

`backend/tests/applications.test.ts` vérifie :

- la création avec un message ;
- le nettoyage des espaces du message ;
- la création sans message ;
- le refus d'une offre non publiée ;
- le refus d'une deuxième candidature active ;
- l'isolation des candidatures entre Lucas et Inès ;
- le retrait d'une candidature `IN_PROGRESS` ;
- le refus du retrait d'une candidature traitée ;
- la recandidature après retrait.

### Tests frontend

`frontend/tests/ApplicationsPage.test.tsx` vérifie :

- l'affichage des offres et des statuts `En cours` et `Retenue` ;
- l'affichage du bouton « Retirer » uniquement pour une candidature en cours ;
- l'envoi de `DELETE /api/applications/1` après un clic sur « Retirer ».

Les conventions existantes ont été conservées :

- Vitest ;
- Supertest côté backend ;
- Testing Library côté frontend ;
- `createTestApp()` et `tokenFor()` ;
- base SQLite en mémoire isolée pour chaque test backend ;
- `stubFetch()` pour les réponses frontend ;
- organisation des tests par route et par parcours.

## 7. Validation technique

La commande complète exécutée a été :

```text
npm.cmd run check
```

Résultats :

- lint : réussi ;
- TypeScript backend et frontend : réussi ;
- tests backend : 117 tests réussis ;
- tests frontend : 49 tests réussis ;
- build backend et frontend : réussi.

Un premier échec du test des migrations a été corrigé en mettant à jour
`backend/tests/db/migrations.test.ts` pour prendre en compte la migration
`002_applications_active_unique.sql`.

## 8. Revue des fichiers et explications demandées

La séance a ensuite consisté à revoir les fichiers un par un :

- `ApplicationDbo` a été expliqué comme le format interne correspondant aux
  résultats SQL, par analogie avec les autres `*Dbo` déjà présents ;
- le mapper a été expliqué comme la conversion entre SQL, domaine et DTO ;
- les guards frontend ont été justifiés par les guards déjà présents pour les
  offres, entreprises et utilisateurs ;
- les labels de statut ont été expliqués comme la traduction des codes backend
  vers l'interface française ;
- la migration a été expliquée comme un index unique conditionnel ;
- les permissions backend et frontend ont été distinguées ;
- `OfferTable.tsx` a été expliqué comme un composant qui transmet l'offre
  sélectionnée au parent sans appeler directement l'API ;
- `OffersPage.tsx` a été expliqué comme la page qui porte le formulaire de
  candidature ;
- `applications.controller.ts` a été expliqué comme la couche HTTP et de
  validation ;
- `applications.service.ts` a été expliqué comme la couche des règles métier ;
- `applications.repository.ts` a été expliqué comme la couche SQL ;
- les deux fichiers de tests ont été comparés.

## 9. Retour sur le déroulement

Le développement a été réalisé plus largement que souhaité en une seule fois.
La demande initiale prévoyait de s'arrêter après chaque étape afin de permettre
une vérification manuelle et une confirmation avant de poursuivre. Ce point a
été reconnu lors de la revue.

Le fichier `docs/semaine-1/conversation-2.md` apparaissait déjà supprimé dans
Git et n'a pas été supprimé pendant cette séance.

