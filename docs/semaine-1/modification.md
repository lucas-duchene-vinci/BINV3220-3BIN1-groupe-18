# Modification — filtre des offres par période

## Objectif

Ajouter un filtre facultatif transmis à l'API sous la forme
`GET /offers?period=P1`, sans modifier les règles de visibilité existantes et sans
ajouter de dépendance ni de migration SQLite.

## Fichiers modifiés

### Backend

- `backend/src/models/offer.ts`
  - Centralisation des codes de période dans `PERIOD_CODES`.
  - Le type `PeriodCode` est dérivé de cette liste afin que la validation HTTP et le
    repository utilisent les mêmes valeurs (`P1`, `P2`, `OTHER`).
- `backend/src/controllers/offers.controller.ts`
  - Lecture du paramètre de requête facultatif `period`.
  - Validation des valeurs autorisées.
  - Retour d'une erreur `400 INVALID_QUERY` pour une valeur absente de la liste
    autorisée ou un paramètre répété.
- `backend/src/services/offers.service.ts`
  - Transmission du filtre de période au repository.
  - Conservation du filtre de visibilité calculé à partir du profil de l'utilisateur.
- `backend/src/repositories/offers.repository.ts`
  - Ajout du filtre optionnel `period`.
  - Application du filtre sur `periods.code` dans la requête SQL existante.
  - Aucun changement de schéma : la relation entre `offers.period_id` et `periods` existait déjà.
- `backend/API.md`
  - Documentation du paramètre, de l'exemple HTTP et de l'erreur de validation.
- `backend/tests/offers.test.ts`
  - Vérification du filtrage administrateur.
  - Vérification de la combinaison du filtre avec la visibilité étudiant.
  - Vérification du rejet d'une période inconnue.
  - Les tests existants sans paramètre couvrent le comportement facultatif.

### Frontend

- `frontend/src/pages/OffersPage.tsx`
  - Ajout d'une sélection de période avec l'option par défaut « Toutes les périodes ».
  - Conservation du choix dans l'état local et transmission au hook.
- `frontend/src/hooks/useOffers.ts`
  - Prise en compte de la période dans les paramètres et les dépendances de l'effet.
  - Un changement de sélection déclenche un nouveau chargement.
- `frontend/src/services/offers.service.ts`
  - Ajout du paramètre `period` facultatif.
  - Construction de `?period=...` uniquement lorsqu'une période est sélectionnée.
- `frontend/tests/OffersPage.test.tsx`
  - Vérification que l'absence de filtre appelle `/api/offers`.
  - Vérification qu'une sélection de `P1` appelle `/api/offers?period=P1`.

## Procédé

1. Vérification du parcours existant des offres côté page, hook, service HTTP,
   contrôleur, service métier et repository.
2. Réutilisation des codes déjà présents dans le modèle et dans la table `periods`.
3. Ajout du filtre après la détermination de la visibilité : le paramètre réduit les
   résultats, mais ne peut pas élargir les droits du profil connecté.
4. Ajout d'un contrôle frontend facultatif, avec une valeur vide représentant
   l'absence de filtre.
5. Ajout des tests backend et frontend ciblés.
