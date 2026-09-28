# Ouvrir, rebaser, mettre à jour ou relire une pull request

## Branches

- Repli de l'expérimentation awawa : @PROCESS.AwawaAdoptionIsRevertibleByTagNotBranch.
- Fichiers modifiés sur `master` d'abord : @DECISION.ThreeFilesAreChangedOnMasterFirst.
- **Une branche de tâche est rebasée sur sa base, jamais fusionnée avec elle** — le dépôt est une pile `git machete`
  (@PROCESS.ATaskBranchIsRebasedNeverMerged). Garder une réf de secours jusqu'au vert des tests, et vérifier que
  `gh pr view <N> --json mergeable` rend `MERGEABLE` avant de considérer le travail fini.

## Suivi d'une PR : une PR par tâche, rien après la fusion

Une PR par tâche porte le code, les changements du corpus, les arbitrages et le rapport d'usage
(@PROCESS.EverythingLandsInTheTaskPullRequest).

- **L'agent de tâche écrit dans la PR ce que la tâche change au corpus** : la tâche passe `implemented` avec
  `DELIVERED_BY <N>` et l'`IMPL` de chaque `SPEC` ; la question qu'elle tranche est archivée. L'archivage des tâches
  livrées revient à la passe de nettoyage, pas à la PR.
- **`/awawa-pr-review <N>`** traite la revue (@PROCEDURE.awawa_pr_review de `~/.ai`).
- **`/awawa-usage-report <N>`, une fois la revue traitée et la PR signalée prête**
  (@DECISION.AUsageReportIsCommittedInTheTaskPullRequest, @PROCEDURE.awawa_usage_report de `~/.ai`).
- **Après ta fusion : `/worktree-clean`**, et rien d'autre.

## Le corps d'une PR décrit la tête de branche

@RULE.pull_request_body_describes_head de `~/.ai`.

**Le corps de la PR d'intégration d'une wave liste, pour la tête de sa branche, chaque PR de tâche fusionnée dedans
avec la tâche qu'elle a livrée.** La session qui fusionne une PR de tâche dans la branche d'intégration réécrit ce
corps dans la foulée, et la PR d'intégration reçoit son commentaire de disponibilité avant que tu la fusionnes.
Constaté sur la PR #176 (wave 9) : son corps décrivait le premier de ses 12 commits, son titre seul avait été
réécrit, et aucun commentaire de disponibilité n'avait été posté.
