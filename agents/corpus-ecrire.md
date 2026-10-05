# Écrire ou modifier une entité du corpus

À lire avant toute création ou modification d'une entité, en complément du schéma (`awawa show TYPE .`).

**Une section arrive avec la règle qui la cite** (@DECISION.ASectionIsWrittenWithTheRuleThatCitesIt) : une
`SECTION` active qu'aucune `RULE` ne nomme sous `APPLIES_TO_SECTION` est un `L026`.

**Une table de valeurs est un fichier JSON à côté du module qui la lit**
(@DECISION.AValueTableIsAJsonFileBesideTheModuleThatReadsIt). La `DATATABLE` qui la nomme porte `TABLE` et
`JSON_SCHEMA`, deux ancres vers ces fichiers, et une règle qui fait autorité sur ces valeurs la nomme par
`VALUES_FROM`.

**Une ancre nomme un fichier suivi par git** (@DECISION.AnAnchorNamesAFileTrackedByGit). Les témoins commités sont
les JSON Schemas de `packages/core-mapping/src/save/infrastructure/wireFormat/schemas/`, les tests, les fabriques de saves de
`packages/core-mapping/src/save/infrastructure/wireFormat/testing/`, le générateur `scripts/fixtures/generate-scenario-fixtures.ts` et les documents de
`docs/`. Les saves des scénarios ne le sont pas : le setup global de Playwright les écrit à chaque lancement dans
`packages/ui-save-manager/e2e/fixtures/`, que git ignore.

**L'archive se purge sans script** (@PROCESS.TheArchiveIsPurgedWithoutAScript).

**Un champ légal dans un seul état n'est déclaré que là**
(@DECISION.AFieldLegalInOneStateIsDeclaredInThatStateAlone) : `LEGACY_INDEX` sous `WHEN HOLDS_FOR all` et
`WHEN HOLDS_FOR @GAME_RELEASE.1.618`, `CONFLICT` et `RESOLUTION` sous `WHEN DOMAIN merge`. Une entité qui nomme
plusieurs valeurs d'un champ répétable entre dans le bloc de chacune.

**Une observation dans le jeu cite sa version, une page lue dehors cite son adresse**
(@DECISION.AGameReleaseIsCitedAsASource, @DECISION.AnExternalPageIsCitedAtTheAddressRead) : `@GAME_RELEASE.2.102`.

**`HOLDS_FOR` écrit la vérité du jeu** (@DECISION.AGameReleaseIsCitedAsASource,
@DECISION.ASaveIsNeverDiscriminatedByItsVersionAlone) : la release à partir de laquelle une règle ou une section
vaut, nommée une seule fois. Une entité qui décrit un écart entre releases s'énonce par ce que la release ajoute,
jamais par ce qui manque à la précédente, et ne nomme que cette release : `@GAME_RELEASE.2.004` pour les champs
ajoutés à l'entrée joueur, `@GAME_RELEASE.2.102` pour `logisticsPaused`. **`HOLDS_FOR` — champ de `RULE` et de
`SECTION`, d'eux seuls — ne nomme qu'une release que le code distingue déjà de la précédente**. Une release à venir
ne s'y anticipe pas : elle se nomme depuis une `TASK`, par un `REF @GAME_RELEASE.X` niché sous sa prose, et
`HOLDS_FOR` ne la prend qu'une fois la branche écrite.

**L'ère n'est pas l'archive** (@DECISION.TheEraIsNotTheArchive) : Terrain Layers reste active et nomme
`@GAME_RELEASE.1.618` par `HOLDS_FOR`.

## Rédaction

- **Avant `awawa new`, lire une entité modèle du type avec `awawa show`** plutôt que les fichiers du corpus :
  `@DECISION.AMergeProducesAnOrdinarySave` (décision), `@PROCESS.ATaskBranchIsRebasedNeverMerged` (règle de
  conduite), `@LIMITATION.AnAtSignInAFolderNameCorruptsTheMergedSave` (limitation),
  `@TASK.DOCS1` (tâche), `@SECTION.Players` (section de la save), `@RULE.PlayersAreDeduplicatedByName` (règle),
  `@COMMAND.MergeSaves` (commande), `@HYPOTHESIS.ALinkedInventoryPlanetIsCarriedOnlyByAnExchangePlatform` (hypothèse). Pas de fichier d'exemple : la
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
- **Seuil d'enregistrement** : celui d'une `DECISION` ou d'un `PROCESS` est @RULE.decision_holds_ruling_rejections_reason
  de `~/.ai`, et ce qui est général va dans `~/.ai` par @RULE.general_rules_go_to_instructions ; une `OPEN_QUESTION`
  ne s'écrit que si une tâche l'attend (`BLOCKS @TASK` est requis).
- **Quel type** : une règle qui tient quelque part dans le dépôt est une `DECISION` (`SPEC` et son `IMPL` requis) ;
  sans rien à ancrer, c'est un `PROCESS`. Un défaut du projet laissé en place est une `LIMITATION` (`SYMPTOM`,
  `UNTIL`) ; d'un défaut d'un outil externe, seul le contournement du projet devient une `DECISION` avec `UNTIL`.
  Ce que la save ou le jeu est, sans arbitrage, appartient à l'aire de spécification produit : une
  `RULE` quand une vraie sauvegarde ou une source du jeu peut la contredire, une `HYPOTHESIS` quand rien ne la prouve
  et qu'on sait nommer ce qui la réfuterait, une `SECTION` pour une partie de la save écrite à un index fixe, une
  `COMMAND` pour ce qu'un utilisateur invoque, une `DATATABLE` pour un fichier de valeurs qu'aucune règle ne résume.
- **Une `SOURCE` née dans une pull request** suit @DECISION.APullRequestIsCitedByItsNumberNeverByAnEntity. Quand la
  prose nomme une entité, `REF` l'indexe : `@USAGE_REPORT`, `@URL`, `@GAME_RELEASE` pour ce qui a été observé dans le
  jeu, `@PROJECT.DNC` pour un fichier du dépôt privé. Une provenance d'un genre nouveau fait déclarer son type dans la
  même PR. Aucune `SOURCE` ne se réduit à une date seule.
- **Pas d'historique dans le corpus** : @PROCESS.AnEntityThatStopsBindingIsArchivedByThePullRequestThatEndsIt et
  @PROCESS.WhatShouldNeverHaveBeenRecordedIsDeletedAtOnce.

## Décisions et tâches

Une décision suit @RULE.decisions_recorded de `~/.ai`. **Le nom d'une tâche est son type
Conventional Commits en majuscules suivi de son numéro** : `awawa new TASK FEAT46 .`. La numérotation est une séquence
unique, tous types confondus (lire le dernier numéro dans `awawa status TASK .`), et le type est celui du titre de la
pull request qui la livrera ; `TITLE` porte le nom lisible. Une tâche passe `todo` quand tu la ratifies, `draft`
avant.
