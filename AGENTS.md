# AGENTS.md — planet-crafter-save-tools

Contexte projet pour les agents IA travaillant dans ce dépôt, en complément des instructions générales `~/.ai`.

**Ce fichier n'est plus le domicile des décisions.** Depuis le 2026-09-11, la spécification, les arbitrages et les
questions ouvertes vivent dans le corpus awawa de `docs/` et se lisent avec l'outil. Ce qui reste ici est ce qu'il
faut savoir *avant* d'avoir lancé la moindre commande : où est le corpus, comment le lire, les commandes du dépôt,
et les règles qu'on ne peut pas se permettre de découvrir par une requête.

## Corpus de spécification (awawa)

La spécification du projet est le corpus awawa de `docs/`, rédigé en anglais, noms
d'entités compris : `docs/_schema.awawa` déclare tous les types pour l'ensemble du workspace, puis un fichier
par type dans l'aire qui le porte — `docs/awawa-project-methodology/` pour la méthodologie (`decisions.awawa`,
`processes.awawa`, `limitations.awawa`, `tasks.awawa`, `packages.awawa`, `open_questions.awawa` quand
une question existe) et `sources.awawa` pour les sources ; `docs/awawa-project-specification/` pour la
spécification produit (`sections.awawa`, `rules.awawa`, `commands.awawa`, `hypotheses.awawa`,
`datatables.awawa`). Une entité nouvelle s'ajoute **à la fin** du fichier de son
type (@DECISION.TheCorpusLivesInThePublicRepository). **La racine de workspace est la racine du dépôt** — c'est de là
que les ancres résolvent, `..` y est refusé, et c'est elle que prend le dernier argument de chaque commande. Ne jamais
passer un fichier seul : chaque commande agit sur tout l'espace de travail, et un fichier isolé rapporte comme cassées
des références qui tiennent.

**Chaque aire a son pivot** : `TASK` pour la méthodologie, `RULE` pour la spécification produit. Une question sur le
produit part d'une `RULE` — son `context` tire la `SECTION`, la `DATATABLE` et l'`HYPOTHESIS` qu'elle nomme, et son
pied de page nomme la `COMMAND` qui l'applique. Aucun des cinq types de spécification ne porte d'état « implemented » :
une règle est vraie ou fausse, pas livrée, et ce qui n'est pas encore construit est un `TASK`
(@DECISION.TheSpecificationAreaPivotsOnTheRule).

**Une section arrive avec la règle qui la cite.** `WHEN HOLDS_FOR current` et `WHEN HOLDS_FOR both` portent
`INCOMING CONSTRAINED_BY` : une `SECTION` que le jeu écrit aujourd'hui et qu'aucune `RULE` ne nomme sous
`APPLIES_TO_SECTION` est un `L026`. Les entités s'écrivent donc par paires, section et règle, jamais une section
seule ; c'est ce qui rend la spécification complète par construction, un trou prenant la forme d'une section sans
règle (@DECISION.ASectionIsWrittenWithTheRuleThatCitesIt).

**Une table de valeurs n'est enregistrée qu'une fois son fichier créé.** `DATATABLE` exige `TABLE` et `JSON_SCHEMA`,
deux ancres vers des fichiers suivis par git ; tant que les tables sont des modules TypeScript, aucune `DATATABLE`
ne s'écrit et `@TASK.CHORE52` porte le déplacement entier — fichiers JSON, JSON Schemas, recâblage des modules et
les cinq entités (@DECISION.AValueTableIsRecordedOnceItsFileExists).

**Une ancre nomme un fichier suivi par git.** `L016` ne teste que l'existence du chemin sur le disque et ne consulte
jamais git : une ancre vers `input/`, `output/` ou `.do-not-commit/` est propre chez son auteur et casse en clone
neuf. Les témoins commités sont les fixtures de `packages/ui-save-manager/e2e/fixtures/`, les JSON Schemas de
`packages/shared-save-processing/schemas/`, les tests et les documents de `docs/`
(@DECISION.AnAnchorNamesAFileTrackedByGit).

**Un document de `docs/` n'est supprimé qu'une fois toutes ses citations repointées.** Un document n'est gardé que
tant qu'il porte un fait qu'aucune autre maison ne tient ; mais avant de le supprimer, compter ses citations dans les
deux mondes. `awawa lint --strict .` voit les ancres du corpus et rien d'autre ; `grep -rn '<nom du document>' .`
trouve les commentaires de code, le README et les autres documents, que rien ne signale. Mesuré le 2026-09-18 à la
suppression de `docs/game-rules.md` : 6 ancres du corpus levées par `L016`, contre 24 commentaires de code, 13 lignes
du README et 2 liens entre documents qu'aucune commande n'a vus. Un commentaire de code cite alors l'entité, jamais
le document : `@see @RULE.TheSaveOnPrimeBecomesSaveA`
(@DECISION.ADocumentIsDeletedOnlyWhenEveryCitationIsRepointed).

**Les règles de fusion vivent dans le corpus, y compris pour le lecteur public.**
`docs/awawa-project-specification/rules.awawa` est leur maison publique unique : le fichier est du texte simple et se
lit tel quel, `awawa show @RULE.<Nom> docs/` en imprime une. Le README en tient l'index — une ligne par sujet nommant
la `RULE` — et ne redit aucune règle (@DECISION.MergeRulesHaveOnePublicHome).

**L'archive se purge à la main.** Aucun script de nettoyage n'est écrit tant que le compte d'entrants publié par
`awawa status TYPE .` suffit à décider : une entité archivée que plus rien ne cite se supprime dans la prochaine
pull request qui touche son fichier
(@PROCESS.TheArchiveIsPurgedByHandWhileFewEntitiesAreArchived).

**Un champ légal dans un seul état n'est déclaré que là.** Un champ conditionné par la valeur d'un autre champ se
déclare dans le bloc `WHEN` de cette valeur, et nulle part ailleurs : `INDEX` sous `WHEN HOLDS_FOR current` et
`WHEN HOLDS_FOR both`, `CONFLICT` et `RESOLUTION` sous `WHEN DOMAIN merge`. Déclaré au niveau du type puis rendu
requis dans le bloc, il resterait légal partout, la monotonie de `WHEN` ne pouvant rien interdire ; répété dans
chaque bloc qui l'admet, il est refusé ailleurs par `L003`
(@DECISION.AFieldLegalInOneStateIsDeclaredInThatStateAlone).

**Une observation dans le jeu cite sa version**, une page lue dehors cite son adresse. Le jeu est une entité
`GAME_RELEASE` nommée par sa version telle que le jeu l'imprime — `@GAME_RELEASE.2.102` —, une page externe une
entité `URL` dont `LOCATION` est l'adresse exacte lue, figée sur un commit quand l'hôte le permet. La date de la
lecture reste dans la prose de la `SOURCE` : une même page se lit plusieurs jours
(@DECISION.AGameReleaseIsCitedAsASource, @DECISION.AnExternalPageIsCitedAtTheAddressRead).

**L'ère n'est pas l'archive** : une `SECTION` que le jeu n'écrit plus reste active avec `HOLDS_FOR legacy` — les
sauvegardes anciennes se lisent encore ; `STATUS archived` ne s'écrit que le jour où le projet cesse de supporter ce
que l'entité décrit. Archiver éteint toute validation de l'entité et retire son corps des paquets `context` qui la
citent : une entité s'archive propre, et rien d'actif ne doit plus pointer vers elle
(@DECISION.TheEraIsNotTheArchive).

**Lancer `awawa` depuis un worktree du dépôt public**, avec `.` pour racine.

```
awawa status .                                          # où en est le projet : entités par type et par STATUS
awawa status TASK --where STATUS==todo .                # ce qui reste à faire
awawa status DECISION --where STATUS!=archived .        # les décisions en vigueur
awawa context @PACKAGE.core_mapping --skip reasoning --skip provenance .   # le paquet de contexte avant d'implémenter
awawa lint --strict .                                   # doit sortir en 0
```

- **Début de session** : `awawa status .`. Ne jamais tenir ailleurs une liste que `status` sait rendre — une liste
  hors du corpus est de l'information dérivée, maintenue à la main, et fausse au commit suivant.
- **Avant d'implémenter ou de spécifier X** : `awawa context @TYPE.X --skip reasoning --with-schema .` et
  `awawa lint --closure @TYPE.X .`. Lire le paquet **au lieu** des fichiers ; son pied de page compte toute omission,
  et la ligne `BLOCKED_BY` dit ce qui bloque X — une arête entrante, qu'aucune traversée ne trouve.
- **Éditer le corpus comme du texte**, puis `awawa fmt .` et `awawa lint --strict .`. `awawa new TYPE Nom .` imprime
  un squelette conforme au schéma : l'utiliser plutôt que réciter le schéma.
- **Avant `awawa new`, lire une entité modèle du type avec `awawa show`** plutôt que les fichiers du corpus :
  `@DECISION.AMergeProducesAnOrdinarySave` (décision), `@PROCESS.ATaskBranchIsRebasedNeverMerged` (règle de
  conduite), `@LIMITATION.AnAtSignInAFolderNameCorruptsTheMergedSave` (limitation),
  `@TASK.FIX45` (tâche), `@SECTION.Players` (section de la save), `@RULE.PlayersAreDeduplicatedByName` (règle),
  `@COMMAND.MergeSaves` (commande), `@HYPOTHESIS.AWorldObjectMayCarryALinkedObjectList` (hypothèse). Pas de fichier d'exemple : la
  marche le chargerait et `status` le compterait (@DECISION.AgentsMdNamesOneModelEntityPerType).
- **Les commentaires `//` ne sont lus par aucune commande.** Un fait écrit là n'atteint pas la session suivante ; ce
  qu'un outil doit savoir est un champ.
- `DESC` est une instruction, pas de la documentation : fragment en minuscules, sans point final, un fait par `DESC`.
  Il est relu à chaque récupération, donc écrit au minimum de jetons. Le raisonnement va dans `RATIONALE`, qui porte
  `CATEGORY reasoning` et se laisse donc écarter par `--skip` ; l'obligation va dans `SPEC`, une ligne falsifiable
  par obligation, son `IMPL` niché dessous.
- **Une mention dans une phrase n'est indexée par rien.** Nicher `REF @TYPE.Nom` sous le champ de prose qui la nomme.
- **Une relation pointe vers ce dont elle parle** : `BLOCKS` sur la question, `UNTIL` sur ce qu'une tâche retire,
  `APPLIES_TO_PACKAGE` / `APPLIES_TO_TASK` sur la décision. L'arête inverse est calculée — `refs`, et les lignes
  `BLOCKED_BY`, `RETIRES`, `GOVERNED_BY` / `referenced by` de `context` — jamais écrite.
- **Seuil d'enregistrement** : une `DECISION` ou un `PROCESS` ne s'écrit que si une pull request future pourrait faire
  l'inverse par erreur ; une `OPEN_QUESTION` que si une tâche l'attend (`BLOCKS @TASK` est requis). Une règle générale
  vit dans `~/.ai`, jamais ici.
- **Quel type** : une règle qui tient quelque part dans le dépôt est une `DECISION` (`SPEC` et son `IMPL` requis) ;
  sans rien à ancrer, c'est un `PROCESS`. Un défaut du projet laissé en place est une `LIMITATION` (`SYMPTOM`,
  `UNTIL`) ; un défaut d'un outil externe ne s'enregistre pas, seul le contournement du projet devient une `DECISION`
  avec `UNTIL`. Ce que la save ou le jeu est, sans arbitrage, appartient à l'aire de spécification produit : une
  `RULE` quand une vraie sauvegarde ou une source du jeu peut la contredire, une `HYPOTHESIS` quand rien ne la prouve
  et qu'on sait nommer ce qui la réfuterait, une `SECTION` pour une partie de la save écrite à un index fixe, une
  `COMMAND` pour ce qu'un utilisateur invoque, une `DATATABLE` pour un fichier de valeurs qu'aucune règle ne résume.
- **Toute `SOURCE` nomme une entité source** (`REF` requis) : `@PULL_REQUEST.PCST<n>`, `@PROJECT.DNC` pour un fichier
  du dépôt privé, `@USAGE_REPORT`, `@URL`, `@GAME_RELEASE` pour ce qui a été observé dans le jeu. Une provenance d'un
  genre nouveau fait déclarer son type dans la même PR.
- **Pas d'historique dans le corpus** : une entité qui cesse de lier est archivée dans la PR qui y met fin
  (`STATUS archived`, `ARCHIVED_ON`), une règle remplacée sur le même sujet est réécrite en place sous son nom — la forme
  précédente devient un `REJECTED` si elle enseigne quelque chose. Une entité qui n'aurait jamais dû être écrite est
  supprimée tout de suite.
- **Tout se fait dans la PR de tâche, rien après la fusion** : promotions et arbitrages écrits par l'agent de
  tâche, vérifiés par `/awawa-pr-review <N>`, puis le rapport d'usage commité sur la branche par
  `/awawa-usage-report <N>` — voir « Suivi d'une PR : une PR par tâche, rien après la fusion ».
- Protocole complet : `awawa --help`. Le manuel et le protocole agent sont dans l'archive awawa.

## Emplacement

Ce fichier est versionné à la racine du dépôt public, le corpus dans `docs/`. Le dépôt
satellite privé `delairec/.do-not-commit`, branche `planet-crafter-save-tools`, reste cloné dans `.do-not-commit/`
(git-ignoré ici) et ne porte plus que ce qui ne peut pas être public
(@DECISION.ThePrivateContextHoldsOnlySavesAndPlans).

Organisation de `.do-not-commit/planet-crafter-save-tools/` :

- `plans/plan.md` — ce que le corpus ne dit pas : le protocole de vérification et ses mesures (md5 de la sortie de
  référence, forme de la sortie d'erreur). Ni les tâches, ni leur ordre : l'ordre est calculé à partir des `AFTER`
  du corpus, et la chronologie se lit dans git et dans les pull requests.
- `resources.md` — sources externes utiles au projet (identifiants de world objects, wiki, saves), décrites par ce
  qu'elles sont réellement et par ce qui y est fiable ou non. À enrichir au fil des sources rencontrées.
- `saves/` — saves de référence privées, fichiers très lourds (jusqu'à 3 Mo, 8 Mo au total) : ne les ouvrir que si
  la tâche l'exige, et jamais en entier. Ne jamais les copier dans l'arbre public.

**Une décision va dans le corpus et nulle part ailleurs**, et avertir quand elle en contredit une en vigueur — ce
que `awawa status DECISION --where STATUS!=archived .` permet de vérifier. **Le nom d'une tâche est son type
Conventional Commits en majuscules suivi de son numéro** : `awawa new TASK FEAT46 .`. La numérotation est une séquence
unique, tous types confondus (lire le dernier numéro dans `awawa status TASK .`), et le type est celui du titre de la
pull request qui la livrera ; `TITLE` porte le nom lisible. Une tâche passe `todo` quand tu la ratifies, `draft`
avant.

**Langue** : le corpus est en anglais, noms d'entités compris. Ce fichier reste en français ; le reste du dépôt
public — `README.md`, les `.md` de `docs/`, commentaires de code — est en anglais, et les messages de commit le sont
dans tous les dépôts.

**Rafraîchir le clone privé avant de lire une save ou un plan.** `.do-not-commit/` est un clone figé au dernier
`bun install`, et chaque worktree lié porte le sien : `bun run private:sync` (fetch plus fast-forward sur la branche
du projet). Le corpus, lui, ne demande plus rien — il est dans la branche.

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
- `bun run check:guards` — les gardes du dépôt, enchaînées ; leur liste est celle des scripts `check:*` du `package.json`.
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
   (@DECISION.ThePrivateContextIgnoreRuleHasNoTrailingSlash).

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
`git rev-parse --show-toplevel` doit rendre la racine du dépôt public. Constaté le 2026-09-10 sur la vague T39/T30.

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
(@DECISION.DissolvedPackagesAreNotRecreated).

## Anonymisation des noms de joueurs

Cette section reste ici en toutes lettres : c'est la seule règle du projet dont l'oubli publie une donnée
personnelle, et elle doit être lisible sans avoir rien lancé. Les entités
@DECISION.NoRealPlayerNameInPublicContent et @DECISION.SteamIdentifiersAreAnonymisedLikeNames portent le
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

**Base des tâches, aujourd'hui : `master`.** Le chantier de conformité est fusionné (PR #15). Le nom de la base
reste ici et non dans le corpus parce qu'il change à chaque chantier : une entité dont le `DESC` se réécrit tous les
mois ne gagne rien à être une entité.

**Les trois dépôts gardent leur cycle ordinaire pendant l'expérimentation awawa.** Le repli tient à un tag, pas à une
branche : `pcst/before-awawa` dans `.do-not-commit`, `before-awawa` dans `~/.ai`, `before-awawa` sur la base des
tâches du dépôt public, chacun sur l'état d'avant le corpus
(@PROCESS.AwawaAdoptionIsRevertibleByTagNotBranch).

**Quand la base n'est pas `master`, deux exceptions.** `.github/dependabot.yml` et les deux workflows
`claude.yml` / `claude-code-review.yml` se modifient d'abord sur `master`
(@DECISION.ThreeFilesAreChangedOnMasterFirst).

**Une branche de tâche est rebasée sur sa base, jamais fusionnée avec elle** — le dépôt est une pile `git machete`
(@PROCESS.ATaskBranchIsRebasedNeverMerged). Concrètement, avant de travailler sur une branche déjà
poussée, et en particulier avant de traiter une revue : `git fetch origin <base>` puis
`git merge-base --is-ancestor origin/<base> HEAD` ; s'il sort en 1, rebaser sur `origin/<base>` et pousser avec
`--force-with-lease`, avant de lire le premier commentaire. Garder une réf de secours jusqu'au vert des tests, et
vérifier que `gh pr view <N> --json mergeable` rend `MERGEABLE` avant de considérer le travail fini.

## Suivi d'une PR : une PR par tâche, rien après la fusion

**Il n'y a plus de commentaire « À faire à la fusion », ni de mise à jour du corpus ni de rapport après la
fusion.** Le corpus vit dans la branche : ce que la PR de tâche y écrit est vrai dans l'arbre de la branche, vrai
dans la base quand la fusion le porte, jamais vrai si la PR meurt (@PROCESS.EverythingLandsInTheTaskPullRequest).
Une PR par tâche porte le code, les changements du corpus, les arbitrages et le rapport d'usage.

- **L'agent de tâche écrit dans la PR ce que la tâche change au corpus** : la tâche passe `implemented` avec
  `DELIVERED_BY <N>` — le numéro de la PR, sans entité `PULL_REQUEST` : celle-ci ne s'écrit que pour une PR citée
  comme source — et l'`IMPL` de chaque `SPEC` ; les décisions qu'elle livre sont écrites ou
  réécrites en place ; ce qui cesse de lier est archivé ; la question qu'elle tranche est archivée. L'archivage des
  tâches livrées et la purge après 30 jours reviennent à la passe de nettoyage, pas à la PR.
- **`/awawa-pr-review <N>`** : traiter la revue, enregistrer dans le corpus chaque décision qu'elle produit *avant*
  de répondre au fil qui l'a produite — sous le seuil d'enregistrement —, vérifier contre le diff chaque `IMPL`
  écrit, rebaser sur la base, faire tourner les contrôles et `awawa lint --strict .`, signaler la PR prête.
- **`/awawa-usage-report <N>`, une fois la revue traitée et la PR signalée prête** : faire commiter sur la branche
  de la PR, par un agent indépendant — session neuve, sans mémoire du travail jugé, jamais un fork —, le rapport de
  `docs/awawa-usage-reports/pull-requests/<date>-pr-<N>.md` mesurant ce que le corpus a coûté et rendu sur l'arbitrage,
  l'implémentation et la revue, points récurrents compris. Seule une PR qu'une `TASK` nomme dans `DELIVERED_BY` en
  reçoit un (@DECISION.AUsageReportIsCommittedInTheTaskPullRequest).
- **Après ta fusion : `/worktree-clean`**, et rien d'autre.

## Le corps d'une PR décrit la tête de branche

**Le corps d'une pull request décrit la tête de branche, pas l'intention d'ouverture** : tout commit qui change la
conception l'invalide, qu'une revue soit passée ou non. Dans une pile `git machete`, ce corps est ce que lit la tâche
empilée pour savoir ce qu'elle rebase, et ce que lit le relecteur suivant pour savoir ce qu'il relit ; aucun outil ne
signale qu'il décrit une conception abandonnée. Avant de demander une revue et avant de déclarer la PR prête, relire
le corps contre le journal des commits depuis la base et le réécrire si la conception a bougé ; la règle est
générale et vit dans `~/.ai/instructions/commands.md`.

Constaté le 2026-09-11 sur la PR #59 (T28), puis le 2026-09-12 sur la PR #61 (DEP2), où le corps décrivait encore
un montage par lien symbolique abandonné trois commits plus tôt.
