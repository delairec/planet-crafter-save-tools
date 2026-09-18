# Écrire ou modifier une entité du corpus

À lire avant toute création ou modification d'une entité, en complément du schéma (`awawa show TYPE .`).

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

## Rédaction

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

## Décisions et tâches

**Une décision va dans le corpus et nulle part ailleurs**, et avertir quand elle en contredit une en vigueur — ce
que `awawa status DECISION --where STATUS!=archived .` permet de vérifier. **Le nom d'une tâche est son type
Conventional Commits en majuscules suivi de son numéro** : `awawa new TASK FEAT46 .`. La numérotation est une séquence
unique, tous types confondus (lire le dernier numéro dans `awawa status TASK .`), et le type est celui du titre de la
pull request qui la livrera ; `TITLE` porte le nom lisible. Une tâche passe `todo` quand tu la ratifies, `draft`
avant.
