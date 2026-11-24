# Recherche d'offres par titre (EF-30) — scénarios end-to-end

Règles de la semaine 9 (voir `docs/semaine-4/semaine-4.md`) : recherche partielle dans le
titre, insensible à la casse, espaces de début/fin ignorés, combinable avec la période, et
un étudiant ne voit **que les offres publiées**.

## État initial commun

- Base de démonstration fraîche : `npm run db:reset` (serveur arrêté), puis `npm run dev`.
- Frontend : http://localhost:5173 — API : http://localhost:3000, mode démo activé.
- Rôle : **étudiant Louis Claes** (cohorte 2025, aucune candidature). La recherche ne
  modifie aucune donnée, donc les scénarios sont répétables et indépendants de leur ordre.
- Offres du seed utilisées (`docs/utilitaire/seed.md`) :

| Offre | Statut | Visible pour un étudiant |
|---|---|:---:|
| Application React de gestion de flotte | Publiée | oui |
| Migration d'une application vers le cloud | Attribuée | non |
| API REST de facturation | Publiée | oui |
| Tableau de bord de qualité des données | Publiée | oui |
| Assistant conversationnel interne | Publiée | oui |

- Filtre « Période » laissé sur « Toutes les périodes ».

## Scénarios

| N° | Scénario | Actions dans l'interface | Résultat attendu |
|---|---|---|---|
| 1 | Recherche avec résultat (nominal) | Page de connexion → cliquer « Louis Claes » → lien « Offres » → vérifier que les 4 offres publiées sont listées → saisir `APPLICATION` dans « Rechercher par mot-clé » | Le compteur affiche « 1 offre » ; le tableau contient uniquement « Application React de gestion de flotte ». « Migration d'une application vers le cloud » (attribuée) **n'apparaît pas** malgré le mot « application » dans son titre ; « API REST de facturation » n'apparaît plus. |
| 2 | Recherche sans résultat (limite) | Même connexion → « Offres » → saisir `blockchain` dans « Rechercher par mot-clé » | Le message « Aucune offre ne correspond à la recherche. » est affiché ; aucun tableau d'offres ni compteur n'est affiché. En vidant le champ, les 4 offres publiées réapparaissent. |

### Pourquoi ces deux cas

- **Scénario 1** combine trois règles en un seul parcours : correspondance partielle,
  insensibilité à la casse (`APPLICATION` en majuscules) et visibilité limitée aux offres
  publiées (une offre attribuée contient aussi le mot cherché).
- **Scénario 2** vérifie l'état vide spécifique à la recherche, distinct de l'état vide
  initial (« Aucune offre à afficher. »), une distinction demandée à Copilot en semaine 9.
