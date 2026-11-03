* Prompt utilisé pour la séance: 

/plan

Donc pour commencé voici les fonctionnalités que nous devrons implémenter :

À partir du cahier des charges, implémentez :

— EF-32 : un étudiant candidate à une offre publiée, avec un message facultatif. Il peut retirer sa candidature tant qu’elle n’a pas été traitée.
— EF-33 : l’étudiant consulte ses candidatures et leur statut : « En cours », « Retenue », « Non retenue » ou « Retirée ».

Utilisez la liste des offres et les connexions de démonstration existantes. Le bouton « Candidater » peut être placé dans cette liste.

Mais on va faire ça étape par étape ok ? Normalement tu as bien déjà reçu le cahier des charges non ? (je ne suis pas sûr). Si tu n'as pas le cahier des charges, précise-le-moi avant de faire quoique ce soit, ne fais pas l'erreur de faire la tâche en mode aveugle.

Voici les exigences et les limites pour la séance d'aujourd'hui :

— d’examiner le code et le schéma existants ;
— de proposer trois étapes : candidater, consulter ses candidatures, retirer une candidature ;
— d’indiquer les fichiers concernés, les vérifications et les tests envisagés ;
— de signaler les décisions métier à clarifier ;

On fera le développement par étape pour respecter ce plan d'action :

— consultez les modifications dans l’onglet de contrôle de code source de VS Code ;
— identifiez les fichiers modifiés et leur rôle ;
— essayez le comportement obtenu avant de poursuivre ;
— demandez une correction précise si nécessaire ;

Je veux pouvoir faire des tests minimum par moi-même, les conditions qui me sont posées pour le faire moi-même :

— candidature à une offre publiée, avec et sans message ;
— présence de la candidature et de son statut après rechargement ;
— retrait d’une candidature encore en cours ;
— impossibilité de retirer une candidature déjà traitée ;
— séparation des candidatures de deux étudiants différents.

Par contre tu as une condition de qualité du code à RESPECTER ABSOLUMENT :

— Respect de l’existant : architecture et conventions de codage.
— Lisibilité et simplicité : noms explicites, absence de code inutile ou de complexité injustifiée, capacité à expliquer le code ajouté.
— Vérifications techniques : lancez npm run check et consultez les résultats du lint, de TypeScript, des tests et de la compilation.


Utilisation des consignes du cours pour encadré l'agent ia dans la direction que je souhaite.  

* Remarque: 

- Malgré une demande explicite auprès de l'agent de faire le travail par étape pour un suivi correct, il a quand même décidé d'implémenter les fonctionnalités sans s'arrêter pour faire un brief mid-dev. 

- Il a su analyser, lire et respecter les consignes de suivre la structure original du projet, il a su gardé un code minimal et propre nécessaire sans dévier. 

- Explication clair et précise de son choix et de pourquoi il l'a fait avec précision nettes quand il considère une autorisation extérieur non nécessaire. 

* Mes observations: 

- Le code est propre, fonctionnel et respect ce que nous avions décidé de mettre en place. Sur ce point rien à redire. 

- Il a su pensé à la création de test côté backend et frontend sans que je n'ai à lui demander, intéressant, il comprend la tâche dans sa globalité même avec des omitions involontaire côté humain. 

- La qualité de ses tests sont globalements complets et couvrent suffissament de cas de test théorique global. 

* Ce que j'ai fait pour garder le contrôle: 

- J'ai regardé l'entièreté des fichiers qu'il a modifié et créer. J'ai comparé avec le code déjà existant pour être sûr que la structure était la bonne. 

- L'agent et moi avons discuté de ses modifications pour comprendre ce qu'il a fait et son raisonnonement derrière. 

- Lui demandé s'il est sûr de ses choix. 

* Ce que j'aurais pu mieux faire pour garder un contrôle encore plus élevé: 

- Lui écrire un prompt encore plus concis, même si les modèles sont plus évolués et qu'ils comprennent mieux avec des prompts simplifier, la marge d'erreur existe toujours (preuve: non-conformité du développement par étape demandé). 