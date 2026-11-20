## 1. Audit des tests

| Cas à vérifier | Test existant et assertion utile | Manque confirmé ou constat écarté |
|---|---|---|
| Parcours UI de candidature (EF-32/EF-33) | `OffersPage.test.tsx` : aucun test ne vérifie le clic sur « Candidater », l'envoi du formulaire et la fermeture après succès. | **Manque confirmé :** le parcours complet de candidature n'est pas testé. |
| Autorisations des routes de candidature | Les tests backend examinés ne couvrent pas suffisamment les autorisations ADMIN/CONTACT pour GET, POST et DELETE. | **Manque confirmé :** couverture insuffisante des autorisations selon les rôles. |
| Validations HTTP | Vérifier les tests existants pour les identifiants d'offre, le message, le corps de requête et l'identifiant de retrait. | **Partiellement confirmé :** plusieurs cas limites restent à vérifier individuellement. |
| États vides et erreurs de ApplicationsPage | `ApplicationsPage.test.tsx` : deux tests couvrent l'affichage des statuts et le retrait. Aucun ne vérifie les erreurs de chargement, la liste vide, la session expirée ou l'échec du retrait. | **Manque confirmé :** plusieurs états ne sont pas testés. |
| Unicité des candidatures actives | L'index `applications_active_offer_student` existe. Il faut rechercher un test qui vérifie le rejet d'une deuxième candidature active et l'autorisation après retrait. | **À confirmer :** l'existence de l'index ne prouve pas que son comportement est testé. |
## 2. TDD — Recherche EF-30

La fonctionnalité demandée concerne la recherche par mot-clé dans le titre des offres.

Avant l'implémentation, Copilot a préparé et exécuté des tests backend et frontend. Après examen, j'ai demandé 2 corrections :
- vérification de la véritable URL envoyée à l'API lorsque la recherche et la période sont combinées ;
- distinction entre l'état vide initial et l'absence de résultats après une recherche.

J'ai ensuite validé explicitement le lot de tests avant d'autoriser l'implémentation.

**Phase RED :**
- Backend : 14 tests réussis et 4 échoués.
- Frontend : 6 tests réussis et 2 échoués.

Les échecs concernaient des comportements absents : recherche dans le titre, combinaison avec la période, conservation de la visibilité des offres et affichage du champ de recherche et du message adapté.

**Phase GREEN :**
Après l'implémentation et les corrections nécessaires :
- Backend : 18/18 tests réussis.
- Frontend : 8/8 tests réussis.

lors de sa première tentative, Copilot a commencé à modifier des fichiers applicatifs avant de me présenter les tests et d’obtenir mon accord. Je l’ai interrompu et lui ai demandé de respecter la procédure TDD. Il a alors repris la préparation des tests et m’a présenté les résultats de la phase RED avant de poursuivre.

## 3. Recherche EF-30 et vérifications

Les cas couverts comprennent :
- recherche partielle dans le titre, sans distinction de casse ;
- suppression des espaces en début et fin ;
- recherche vide ;
- recherche d'une expression composée de plusieurs mots ;
- combinaison avec le filtre par période ;
- respect de la visibilité des offres publiées pour les étudiants ;
- absence de correspondance et message adapté.

Résultats de `npm run check` :
- 126 tests backend réussis ;
- 52 tests frontend réussis ;
- lint, typecheck et build réussis.

Les tests ciblés sont également réussis : 18 tests backend et 8 tests frontend.


