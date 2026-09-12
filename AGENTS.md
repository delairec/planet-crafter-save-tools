# AGENTS.md — planet-crafter-save-tools

Contexte projet pour les agents IA travaillant dans ce dépôt, en complément des instructions générales `~/.ai`.

**Ce fichier n'est plus le domicile des décisions.** Depuis le 2026-09-11, la spécification, les arbitrages et les
questions ouvertes vivent dans le corpus awawa de `docs/` et se lisent avec l'outil. Ce qui reste ici est ce qu'il
faut savoir *avant* d'avoir lancé la moindre commande : où est le corpus, comment le lire, les commandes du dépôt,
et les règles qu'on ne peut pas se permettre de découvrir par une requête.

## Corpus de spécification (awawa)

La spécification du projet est le corpus awawa de `docs/` : un fichier `.awawa` par domaine, plus
`docs/_schema.awawa` pour le schéma transverse (@DECISION.LeCorpusEstDecoupeParDomaine). **La racine de workspace
est la racine du dépôt** — c'est de là que les ancres `IMPL` résolvent, et c'est elle que prend le dernier argument
de chaque commande (@DECISION.LeCorpusVitDansLeDepotPublic). Ne jamais passer un fichier seul : chaque commande agit
sur tout l'espace de travail, et un fichier isolé rapporte comme cassées des références qui tiennent.

**Lancer `awawa` depuis un worktree du dépôt public**, avec `.` pour racine.

```
awawa status .                      # où en est le projet : entités par type et par STATUS
awawa status OPEN_QUESTION --where STATUS!=superseded .   # ce qui n'est pas tranché
awawa context @PACKAGE.core_mapping --skip reasoning .     # le paquet de contexte avant d'implémenter
awawa lint --strict .               # doit sortir en 0
```

- **Début de session** : `awawa status .`. Ne jamais tenir ailleurs une liste que `status` sait rendre — une liste
  hors du corpus est de l'information dérivée, maintenue à la main, et fausse au commit suivant.
- **Avant d'implémenter ou de spécifier X** : `awawa context @TYPE.X --skip reasoning --with-schema .` et
  `awawa lint --closure @TYPE.X .`. Lire le paquet **au lieu** des fichiers ; son pied de page compte toute omission,
  et la ligne `BLOCKED_BY` dit ce qui bloque X — une arête entrante, qu'aucune traversée ne trouve.
- **Éditer le corpus comme du texte**, puis `awawa fmt .` et `awawa lint --strict .`. `awawa new TYPE Nom .` imprime
  un squelette conforme au schéma : l'utiliser plutôt que réciter le schéma.
- **Les commentaires `//` ne sont lus par aucune commande.** Un fait écrit là n'atteint pas la session suivante ; ce
  qu'un outil doit savoir est un champ.
- `DESC` est une instruction, pas de la documentation : fragment en minuscules, sans point final, un fait par `DESC`.
  Il est relu à chaque récupération, donc écrit au minimum de jetons. Le raisonnement va dans `RATIONALE`, qui porte
  `CATEGORY reasoning` et se laisse donc écarter par `--skip` ; l'obligation va dans `SPEC`, une ligne falsifiable
  par obligation, son `IMPL` niché dessous.
- **Une mention dans une phrase n'est indexée par rien.** Nicher `REF @TYPE.Nom` sous le champ de prose qui la nomme.
- **Une relation pointe vers ce dont elle parle** : `BLOCKS` sur la question, `CLOSES` sur la décision. L'arête
  inverse est calculée — `refs`, et les lignes `BLOCKED_BY` / `referenced by` de `context` — jamais écrite.
- **Un défaut constaté est une `OPEN_QUESTION`**, son sort une `DECISION` qui la ferme
  (@DECISION.LeCorpusRemplaceLesFichesDeKnownIssues). Une limitation acceptée est un point *fermé* : la question
  passe `superseded` et **c'est la décision qui porte symptôme, cause et garde**, parce que `superseded` vaut
  `GATE suppressed` et disparaît des paquets de récupération
  (@DECISION.UneLimitationAccepteeGardeSaMatiereDansLaDecision).
- **Rouvrir une limitation acceptée** : la décision passe `superseded`, une successeure `:v2` la `SUPERSEDES` et dit
  ce qui a changé, la question repasse `specified`. Le schéma exige qu'une entité `superseded` soit atteinte par
  `CLOSED_BY` ou `SUPERSEDED_BY` — une décision retirée qui ne nomme pas ce qui la remplace tombe en `L026`. Remettre
  la question à `specified` sans toucher à la décision passe `lint --strict` sans un mot : c'est mesuré, et c'est la
  moitié qui reste une discipline (@DECISION.UneDecisionRetireeNommeSaSuccesseure).
- **Une entité remplacée n'est jamais supprimée** : elle passe `superseded`, et sa successeure écrit `SUPERSEDES`.
- **Après la fusion d'une PR** : `/awawa-pr-merged <N>`, puis `/awawa-usage-report <N>`, qui fait écrire par un
  agent indépendant le rapport de `docs/awawa-usage-reports/` mesurant ce que le corpus a coûté et rendu sur cette
  PR, points récurrents compris (@DECISION.UnRapportDUsageEstEcritApresChaqueFusionParUneSessionIndependante).
- Protocole complet : `awawa --help`. Le manuel et le protocole agent sont dans l'archive awawa.

## Emplacement

Ce fichier est versionné à la racine du dépôt public, le corpus dans `docs/`. Le dépôt satellite privé
`delairec/.do-not-commit`, branche `planet-crafter-save-tools`, reste cloné dans `.do-not-commit/` (git-ignoré ici)
et ne porte plus que ce qui ne peut pas être public (@DECISION.LeCorpusVitDansLeDepotPublic).

Organisation de `.do-not-commit/planet-crafter-save-tools/` :

- `plans/plan.md` — ce que le corpus ne dit pas : le protocole de vérification et ses mesures (md5 de la sortie de
  référence, forme de la sortie d'erreur). Ni les tâches, ni leur ordre : l'ordre est calculé à partir des `AFTER`
  du corpus, et la chronologie se lit dans git et dans les pull requests.
- `resources.md` — sources externes utiles au projet (identifiants de world objects, wiki, saves), décrites par ce
  qu'elles sont réellement et par ce qui y est fiable ou non. À enrichir au fil des sources rencontrées.
- `saves/` — saves de référence privées, fichiers très lourds (jusqu'à 3 Mo, 8 Mo au total) : ne les ouvrir que si
  la tâche l'exige, et jamais en entier. Ne jamais les copier dans l'arbre public.

**Une décision va dans le corpus et nulle part ailleurs**, et avertir quand elle en contredit une enregistrée — ce
que `awawa status DECISION .` permet de vérifier (@DECISION.LeCorpusEstLeSeulDomicileEtHistoryEstSupprime). Un défaut
constaté est une `OPEN_QUESTION` (@DECISION.LeCorpusRemplaceLesFichesDeKnownIssues), une tâche une entité `TASK`
qui reste après sa fusion
(@DECISION.UneTacheFusionneeResteDansLeCorpus). **Le nom d'une tâche est son étiquette, un souligné, puis ce qu'elle
couvre** : `awawa new TASK T40_NomLisible .` — le schéma le vérifie, et l'étiquette seule est refusée
(@DECISION.UneTachePorteSonEtiquetteEtUnNomLisible). La famille d'outillage du dépôt, hors chantier de conformité,
garde ses numéros `DEP{N}`, sous la même forme.

**Langue** : le corpus et ce fichier restent en français bien qu'ils soient publics, par exception à la règle
générale « documentation publique commitée en anglais » ; le reste du dépôt public — `README.md`, les `.md` de
`docs/`, commentaires de code — est en anglais, et les messages de commit le sont dans tous les dépôts
(@DECISION.LaSpecificationResteEnFrancaisMemePubliee).

**Rafraîchir le clone privé avant de lire une save ou un plan.** `.do-not-commit/` est un clone figé au dernier
`bun install`, et chaque worktree lié porte le sien : `bun run private:sync` (fetch plus fast-forward sur la branche
du projet). Le corpus, lui, ne demande plus rien — il est dans la branche
(@DECISION.LeContextePriveSeReduitAuxSavesEtAuxPlans).

## Commandes

Depuis la racine du dépôt (workspace Bun) :

- `bun test` / `bun test:watch` — tous les tests unitaires (par package : `bun run --filter <package> test`).
- `bun run test:ui` — scénarios d'UI (Playwright, chromium/firefox/webkit) sur la build de production, serveur
  démarré et arrêté par la suite ; `bun run test:ui:install` télécharge les moteurs une fois.
- `bun run lint:types` — `tsc --noEmit` à la racine, puis le `lint:types` de chaque package (un `tsconfig.json` par
  package, étendant celui de la racine). Seul `ui-*` déclare les libs DOM ; une globale navigateur référencée depuis
  `core-*` ou `cli-*` échoue donc au lieu de se résoudre en silence.
- `bun run build:ui` — build de `ui-save-manager` (SolidStart).
- `bun merge` — lance `cli-merge` (traite `input/` vers `output/`, surchargeables via `--input=`/`--output=`).
- `bun validate -- --file=<chemin>` — lance `cli-validate` sur une save.
- `bun run node:merge` / `bun run node:validate -- --file=<chemin>` — les mêmes outils sous Node au lieu de Bun.
- `bun run audit:quality` — `check:guards` puis `fallow audit` et `fallow health` (porte qualité entière, pour une
  copie de travail). La CI couvre le même terrain en deux jobs plutôt qu'en une commande : `guards` lance
  `check:guards`, `fallow` lance l'audit et le rapport de santé via l'action, qui les cadre sur la base de la pull
  request et les rend dans le résumé du run. Ne pas rebrancher `audit:quality` tel quel dans un job : ses scripts
  fallow passent `--base master`, et un `actions/checkout` ne laisse que des références de suivi — mesuré,
  `--base master` y sort en 2, `--base origin/master` en 0.
- `bun run check:guards` — les trois gardes du dépôt : `check:assertions`, `check:fixtures`, `check:dependencies`.
  Aucune ne lit l'historique git, elles répondent en une fraction de seconde : c'est la moitié d'`audit:quality` à
  lancer en cours d'écriture.
- `bun run check:dependencies` — vérifie la matrice de dépendances par préfixe (manifestes et imports, imports
  type-only et directives JSDoc `@import` compris). La matrice est documentée dans le `README.md` public.
- `bun run audit` — `bun audit` sur les dépendances de production et de développement.
- `awawa status .` et les commandes du corpus — voir la section « Corpus de spécification » plus haut.

## Travail dans un arbre de travail lié (worktree)

Une tâche menée dans un `git worktree` — c'est le cas de toute tâche lancée en agent de fond — demande trois gestes
que rien ne rappelle et dont l'oubli ne produit aucune erreur, seulement un verdict faux.

1. **`bun install --frozen-lockfile` dans le worktree, avant le premier test.** Sans lui, Bun résout les packages du
   workspace via le `node_modules` du dépôt principal : les tests s'exécutent sur les sources d'une autre branche et
   passent au vert sans rien dire. C'est le piège le plus coûteux des trois, parce qu'il rend un verdict, et le mauvais.
2. **Vérifier la branche de base.** Un worktree créé par l'outillage part de la branche par défaut du dépôt, qui
   n'est pas forcément la base des tâches — la section « Branches » plus bas nomme celle en vigueur, et elle seule.
   Avant tout travail, `git merge-base --is-ancestor origin/<base> HEAD` doit sortir en 0 ; sinon, recréer la
   branche depuis la base avant d'écrire une ligne.
3. **`input/` n'est pas versionné et n'existe donc pas dans un worktree neuf.** Les tâches qui vérifient une sortie de
   `bun merge` sur les saves de référence le lient depuis le dépôt principal
   (`ln -sfn <dépôt principal>/input input`). La règle `input` du `.gitignore` n'a pas de barre finale précisément
   pour attraper ce lien ; même forme et même raison pour `.do-not-commit`
   (@DECISION.LaRegleDuContextePrivePerdSaBarreFinale).

`.do-not-commit/` suit la même logique : chaque worktree porte son propre clone, à rafraîchir par `bun run
private:sync` — voir « Emplacement ». **Le corpus, lui, est versionné dans la branche** : `awawa` lancé dans un
worktree lit et écrit le corpus de *ce* worktree, et ce qu'une session y enregistre arrive par sa pull request
comme le reste.

**Ne jamais `cd` dans `.do-not-commit/`.** C'est un dépôt à part entière imbriqué dans celui-ci, et un worktree est
découpé dans le dépôt qui contient le **répertoire de travail du shell au moment de l'appel**. Une session qui entre
dans le clone privé pour y lire une save donne ensuite à chaque agent qu'elle lance un worktree du dépôt privé au
lieu du projet : la garde d'isolation refuse alors tout `git` visant le dépôt public, et l'agent se rabat sur un
clone à lui — le travail aboutit, hors de l'isolation prévue, et `/worktree-clean` ne voit pas ce clone. Lire le
clone là où il est (`git -C .do-not-commit <commande>`, chemins absolus pour le reste) ; avant de lancer un agent,
`git rev-parse --show-toplevel` doit rendre la racine du dépôt public. Constaté le 2026-09-10 sur la vague T39/T30
(@DECISION.UnWorktreeEstDecoupeDansLeDepotDuRepertoireCourant).

Quand plusieurs agents travaillent en parallèle, leur répertoire temporaire est partagé : donner à chacun un
sous-dossier à son nom, sans quoi ils écrasent mutuellement leurs fichiers de travail.

## Organisation des packages

Matrice de dépendances par préfixe (appliquée, voir les instructions `~/.ai`) : `core-*` → `shared-*`, `util-*` ;
`util-*` → aucune ; `cli-*` → `shared-*`, `util-*`, `core-*` ; `ui-*` → `shared-*`, `util-*`, `core-*` ;
`shared-*` → `util-*`. Elle est vérifiée par `bun run check:dependencies` et documentée dans le `README.md` public :
elle n'est pas recopiée dans le corpus.

**Ce que fait chaque package est dans le corpus** : `awawa status PACKAGE .`, puis `awawa show @PACKAGE.<Nom> .`.
Ne pas tenir la liste ici en double.

Note historique : `util-parsing`, `util-messages` et `shared-mapping` ont été dissous, `util-platforms` renommé
`shared-platforms`. Ne pas les recréer, ni créer un nouveau package `util-*` sauf helper réellement générique
(@DECISION.LesPackagesDissousNeSontPasRecrees).

## Anonymisation des noms de joueurs

Cette section reste ici en toutes lettres : c'est la seule règle du projet dont l'oubli publie une donnée
personnelle, et elle doit être lisible sans avoir rien lancé. Les entités
@DECISION.AucunNomReelDansUnContenuPublic et @DECISION.LesIdentifiantsSteamSontAnonymisesCommeLesNoms portent le
même contenu dans le corpus.

Les saves privées portent les noms réels des joueurs, qui n'ont pas consenti à leur publication. **Aucun nom réel
ne doit apparaître dans un contenu public** : corps et titre de PR, commentaires de revue, code, tests, fixtures
publiques, `docs/`, `README.md`, messages de commit. Seuls ces pseudonymes sont autorisés en public : `Salengor`,
`Chileny`, `Sovagoz`, `Nikowa`, `Sakia`, `Anya`.

Les **identifiants de compte Steam** sont anonymisés au même titre que les noms : un contenu public porte un
identifiant synthétique de la famille `765611900000000xx`, jamais celui d'un compte réel. Un identifiant de
démonstration doit rester un couple d'arrondi vrai — texte exact non représentable en `double`, valeur imprimée par
`JSON.stringify` différente — sinon la démonstration devient fausse. Les fixtures publiques portent
`76561190000000001` et `76561190000000007`.

**Aucune correspondance entre un pseudonyme et un nom réel n'est conservée nulle part**, et la substitution n'en a
pas besoin : `76561198…` est un identifiant réel, `765611900000000xx` un identifiant synthétique, et ce couple de
motifs suffit à reconnaître ce qui ne doit pas sortir. Le dépôt privé garde les noms réels dans `saves/`, qui sont la
source de vérité ; c'est au moment de sortir en public qu'il faut substituer. L'historique git
déjà poussé n'est pas réécrit — le coût est hors de proportion, et la branche `refactor/...` sera vraisemblablement
écrasée (squash) à sa fusion dans `master`.

## Branches

**Base des tâches, aujourd'hui : `refactor/review-clean-archi-violations-in-core-mapping-package`.** Toute branche de
tâche en part et sa PR la prend pour base, jamais `master`, qui est en retard sur elle. Cette base est temporaire ;
une fois le chantier de conformité fusionné, `master` redevient la base et cette ligne est le seul endroit à
corriger (@DECISION.LaBaseDesTachesEstTemporairementLaBrancheDeConformite).

Le nom de la branche est resté ici et non dans le corpus parce qu'il change à chaque chantier : une entité dont le
`DESC` se réécrit tous les mois ne gagne rien à être une entité.

**Les trois dépôts gardent leur cycle ordinaire pendant l'expérimentation awawa.** Le repli tient à un tag, pas à une
branche : `pcst/before-awawa` dans `.do-not-commit`, `before-awawa` dans `~/.ai`, `before-awawa` sur la base des
tâches du dépôt public, chacun sur l'état d'avant le corpus
(@DECISION.LExperimentationAwawaEstReversibleParUnTagPasParUneBranche).

**Deux exceptions à cette base, et deux seulement.** `.github/dependabot.yml` (DEP1) et les deux workflows
`claude.yml` / `claude-code-review.yml` se modifient d'abord sur `master`
(@DECISION.TroisFichiersPartentDeMasterEtNonDeLaBase).

**Une branche de tâche est rebasée sur sa base, jamais fusionnée avec elle** — le dépôt est une pile `git machete`
(@DECISION.UneBrancheDeTacheEstRebaseeJamaisFusionnee). Concrètement, avant de travailler sur une branche déjà
poussée, et en particulier avant de traiter une revue : `git fetch origin <base>` puis
`git merge-base --is-ancestor origin/<base> HEAD` ; s'il sort en 1, rebaser sur `origin/<base>` et pousser avec
`--force-with-lease`, avant de lire le premier commentaire. Garder une réf de secours jusqu'au vert des tests, et
vérifier que `gh pr view <N> --json mergeable` rend `MERGEABLE` avant de considérer le travail fini.

## Suivi d'une PR : deux commandes, deux moments

**Il n'y a plus de commentaire « À faire à la fusion ».** Ce que cette checklist inventoriait entre dans le corpus au
moment où la décision est prise, et non à la fusion : une décision est une entité `DECISION`, un défaut une
`OPEN_QUESTION`, une tâche fusionnée reste et passe `implemented`
(@DECISION.LeCorpusRemplaceLaChecklistDeFusion).

- **`/awawa-pr-review <N>`, avant la fusion** : traiter la revue, enregistrer dans le corpus chaque décision qu'elle
  produit *avant* de répondre au fil qui l'a produite, rebaser sur la base, faire tourner les contrôles et
  `awawa lint --strict .`, signaler la PR prête.
- **`/awawa-pr-merged <N>`, après ta fusion** : promouvoir les `STATUS`, fermer les questions que la fusion tranche,
  promouvoir vers `~/.ai` les règles qui y vont, nettoyer worktree et branche.

**Une règle apprise en revue qui pourrait aller dans `~/.ai` s'écrit en `OPEN_QUESTION`**, pas dans un commentaire :
général ou spécifique au projet est ton arbitrage, et rien hors du corpus ne survit à la session qui l'a apprise.
`/awawa-pr-merged` les retrouve par `awawa status OPEN_QUESTION --where STATUS!=superseded .` et te pose la question.

Les commandes `/pr-review-followup` et `/pr-merge-followup` restent pour les projets sans corpus ; elles décrivent
des fiches sur disque que ce projet n'a plus.

## Le corps d'une PR décrit la tête de branche

**Le corps d'une pull request décrit la tête de branche, pas l'intention d'ouverture** : tout commit qui change la
conception l'invalide, qu'une revue soit passée ou non. Dans une pile `git machete`, ce corps est ce que lit la tâche
empilée pour savoir ce qu'elle rebase, et ce que lit le relecteur suivant pour savoir ce qu'il relit ; aucun outil ne
signale qu'il décrit une conception abandonnée. Avant de demander une revue et avant de déclarer la PR prête, relire
le corps contre le journal des commits depuis la base et le réécrire si la conception a bougé
(@DECISION.LeCorpsDeLaPrDecritLaTeteDeBranche).

Constaté le 2026-09-11 sur la PR #59 (T28), puis le 2026-09-12 sur la PR #61 (DEP2), où le corps décrivait encore
un montage par lien symbolique abandonné trois commits plus tôt.
