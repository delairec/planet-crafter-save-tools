# Ouvrir, rebaser, mettre à jour ou relire une pull request

## Branches

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
