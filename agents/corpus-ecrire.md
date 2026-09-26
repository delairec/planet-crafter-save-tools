# Écrire ou modifier une entité du corpus

À lire avant toute création ou modification d'une entité, en complément du schéma (`awawa show TYPE .`).

**Une section arrive avec la règle qui la cite.** `WHEN STATUS active` porte `INCOMING CONSTRAINED_BY` : une
`SECTION` active qu'aucune `RULE` ne nomme sous `APPLIES_TO_SECTION` est un `L026`. Les entités s'écrivent donc par
paires, section et règle, jamais une section seule ; c'est ce qui rend la spécification complète par construction,
un trou prenant la forme d'une section sans règle (@DECISION.ASectionIsWrittenWithTheRuleThatCitesIt).

**Une table de valeurs est un fichier JSON à côté du module qui la lit.** Un tableau, une ligne par rangée, dans le
paquet dont le module l'importe ; aucune rangée ne se recopie dans un module TypeScript ni dans un document markdown.
Son JSON Schema (`<nom>.schema.json`) est rangé avec ceux des autres tables dans `scripts/validate-tables/schemas/`,
à côté du script qui les applique. `bun run validate:tables` valide chaque table contre son schéma, chaque paquet
nommant ses propres tables dans son script. La `DATATABLE` qui la nomme porte `TABLE` et `JSON_SCHEMA`, deux ancres
vers ces fichiers, et une règle qui fait autorité sur ces valeurs la nomme par `VALUES_FROM`
(@DECISION.AValueTableIsAJsonFileBesideTheModuleThatReadsIt).

**Une ancre nomme un fichier suivi par git.** `L016` ne teste que l'existence du chemin sur le disque et ne consulte
jamais git : une ancre vers `input/`, `output/` ou `.do-not-commit/` est propre chez son auteur et casse en clone
neuf. Les témoins commités sont les JSON Schemas de `packages/shared-save-processing/schemas/`, les tests, les
fabriques de saves de `packages/shared-save-processing/testing/`, le générateur
`scripts/generate-scenario-fixtures.ts` et les documents de `docs/`. Les saves des scénarios ne le sont pas : le
setup global de Playwright les écrit à chaque lancement dans `packages/ui-save-manager/e2e/fixtures/`, que git
ignore ; une ancre qui en cite un fragment nomme le fichier suivi qui porte ce texte — la fabrique, le générateur ou
un test qui affirme la ligne sérialisée —, le fragment réécrit quand la forme sauvegardée n'apparaît dans aucune
source. `bun run check:anchors` refuse
une ancre vers un chemin que git ne suit pas, et ignore celles d'une entité archivée : une décision que sa tâche
retire s'archive donc même quand la tâche supprime le module que son `IMPL` nomme
(@DECISION.AnAnchorNamesAFileTrackedByGit).

**L'archive se purge sans script.** La passe de nettoyage se fait à la main, par le plugin awawa-ui ou par un agent
à qui on la demande ; une entité archivée que plus rien ne cite se supprime dans la prochaine pull request qui touche
son fichier (@PROCESS.TheArchiveIsPurgedWithoutAScript).

**Un champ légal dans un seul état n'est déclaré que là.** Un champ conditionné par la valeur d'un autre champ se
déclare dans le bloc `WHEN` de cette valeur, et nulle part ailleurs : `LEGACY_INDEX` sous `WHEN HOLDS_FOR all` et
`WHEN HOLDS_FOR @GAME_RELEASE.1.618`, `CONFLICT` et `RESOLUTION` sous `WHEN DOMAIN merge`. Déclaré au niveau du type
puis rendu requis dans le bloc, il resterait légal partout, la monotonie de `WHEN` ne pouvant rien interdire ;
répété dans chaque bloc qui l'admet, il est refusé ailleurs par `L003`. Une entité qui nomme plusieurs valeurs d'un
champ répétable entre dans le bloc de chacune
(@DECISION.AFieldLegalInOneStateIsDeclaredInThatStateAlone).

**Une observation dans le jeu cite sa version**, une page lue dehors cite son adresse. Le jeu est une entité
`GAME_RELEASE` nommée par sa version telle que le jeu l'imprime — `@GAME_RELEASE.2.102` —, une page externe une
entité `URL` dont `LOCATION` est l'adresse exacte lue, figée sur un commit quand l'hôte le permet. La date de la
lecture reste dans la prose de la `SOURCE` : une même page se lit plusieurs jours
(@DECISION.AGameReleaseIsCitedAsASource, @DECISION.AnExternalPageIsCitedAtTheAddressRead).

**`HOLDS_FOR` écrit la vérité du jeu** : la release à partir de laquelle une règle ou une section vaut, nommée une
seule fois. Une entité qui décrit un écart entre releases s'énonce par ce que la release ajoute, jamais par ce qui
manque à la précédente, et ne nomme que cette release : `@GAME_RELEASE.2.004` pour les champs ajoutés à l'entrée
joueur, `@GAME_RELEASE.2.102` pour `logisticsPaused`. **`HOLDS_FOR` — champ de `RULE` et de `SECTION`, d'eux seuls —
ne nomme qu'une release que le code distingue déjà de la précédente**. Une release à venir
ne s'y anticipe pas : elle se nomme depuis une `TASK`, par un `REF @GAME_RELEASE.X` niché sous sa prose, et
`HOLDS_FOR` ne la prend qu'une fois la branche écrite. Une save écrite par une release non
nommée — 2.008, 2.103 — se lit par la branche de la dernière release nommée avant elle. **`HOLDS_FOR all`, seul**,
marque ce qui ne dépend pas de la release — les règles de merge, les invariants du format — et couvre d'office une
release nommée plus tard. Le code ne discrimine jamais une save par sa seule version déclarée
(@DECISION.ASaveIsNeverDiscriminatedByItsVersionAlone).

**L'ère n'est pas l'archive** : une `SECTION` que le jeu n'écrit plus reste active et nomme par `HOLDS_FOR` les
releases qui l'écrivaient — `@GAME_RELEASE.1.618` pour Terrain Layers —, les sauvegardes anciennes se lisant encore ; `STATUS archived` ne s'écrit que le jour où le projet cesse de supporter ce
que l'entité décrit. Archiver éteint toute validation de l'entité et retire son corps des paquets `context` qui la
citent : une entité s'archive propre, et rien d'actif ne doit plus pointer vers elle
(@DECISION.TheEraIsNotTheArchive).

## Rédaction

- **Avant `awawa new`, lire une entité modèle du type avec `awawa show`** plutôt que les fichiers du corpus :
  `@DECISION.AMergeProducesAnOrdinarySave` (décision), `@PROCESS.ATaskBranchIsRebasedNeverMerged` (règle de
  conduite), `@LIMITATION.AnAtSignInAFolderNameCorruptsTheMergedSave` (limitation),
  `@TASK.DOCS1` (tâche), `@SECTION.Players` (section de la save), `@RULE.PlayersAreDeduplicatedByName` (règle),
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
- **Une `SOURCE` née dans une pull request porte son numéro dans son champ `PR`, à côté de la prose** ; `REF` y est
  optionnel et ne nomme jamais `@PROJECT.PCST`, le dépôt auquel appartient déjà toute entité. Quand la prose nomme une
  entité, `REF` l'indexe : `@USAGE_REPORT`, `@URL`, `@GAME_RELEASE` pour ce qui a été observé dans le jeu, `@PROJECT.DNC`
  pour un fichier du dépôt privé. Une provenance d'un genre nouveau fait déclarer son type dans la même PR. Aucune
  `SOURCE` ne se réduit à une date seule.
- **Pas d'historique dans le corpus** : une entité qui cesse de lier est archivée (`STATUS archived`,
  `ARCHIVED_ON`) ou supprimée dans la PR qui y met fin, comme le dit `@RULE.instructions_corpus_archiving` de
  `~/.ai`, `master` étant la branche par défaut qu'elle nomme
  (@PROCESS.AnEntityThatStopsBindingIsArchivedByThePullRequestThatEndsIt) ; une règle remplacée sur le même sujet
  est réécrite en place sous son nom — la forme précédente devient un `REJECTED` si elle enseigne quelque chose. Une
  entité qui n'aurait jamais dû être écrite est supprimée tout de suite.

## Décisions et tâches

**Une décision va dans le corpus et nulle part ailleurs**, et avertir quand elle en contredit une en vigueur — ce
que `awawa status DECISION --where STATUS!=archived .` permet de vérifier. **Le nom d'une tâche est son type
Conventional Commits en majuscules suivi de son numéro** : `awawa new TASK FEAT46 .`. La numérotation est une séquence
unique, tous types confondus (lire le dernier numéro dans `awawa status TASK .`), et le type est celui du titre de la
pull request qui la livrera ; `TITLE` porte le nom lisible. Une tâche passe `todo` quand tu la ratifies, `draft`
avant.
