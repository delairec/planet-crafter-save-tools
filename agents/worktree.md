# Travailler dans un worktree ou lancer un agent

Une tâche menée dans un `git worktree` — c'est le cas de toute tâche lancée en agent de fond — demande quatre gestes
que rien ne rappelle et dont l'oubli ne produit aucune erreur, seulement un verdict faux. Les trois premiers sont
@PROCESS.EveryWorktreeInstallsItsDependencies.

1. **`bun install --frozen-lockfile` dans le worktree, avant le premier test.**
2. **Vérifier la branche de base** : c'est le `BRANCH` de sa wave (`awawa show @WAVE.<n> .`), `master` pour une
   tâche sans wave. `git merge-base --is-ancestor origin/<base> HEAD` doit sortir en 0 ; sinon, recréer la branche
   depuis la base avant d'écrire une ligne.
3. **Lier `input/` depuis le dépôt principal** quand la tâche vérifie une sortie de `bun merge` sur les saves de
   référence : `ln -sfn <dépôt principal>/input input`. La forme de la règle `input` du `.gitignore` suit
   @RULE.ignore_pattern_matches_everywhere de `~/.ai`, comme celle de `.do-not-commit`.
4. **Les commandes d'acceptation, vertes à chaque commit, avant que la pull request soit ouverte ou mise à jour.**
   Les lignes `SPEC` de la tâche, puis, depuis la racine du worktree :
   - `bun test`
   - `bun run lint:types`
   - `bun run guards`
   - `awawa fmt --check .`
   - `awawa lint --strict .`

   `bun run audit:quality` et `bun run test:ui` ne se lancent pas en local
   (@RULE.heavy_tests_not_run_locally de `~/.ai`) : leur résultat se lit sur les jobs `fallow` et `scenarios` de la
   pull request, verts avant qu'elle soit signalée prête.

   C'est cette liste que cite le prompt de lancement d'une vague
   (@DECISION.ATaskBranchRunsTheAcceptanceListOfTheWorktreeInstructions).

`.do-not-commit/` suit la même logique : chaque worktree porte son propre clone, à rafraîchir par `bun run
private:sync` — voir `agents/contexte-prive.md`. **Le corpus, lui, est versionné dans la branche** : `awawa` lancé dans un
worktree lit et écrit le corpus de *ce* worktree, et ce qu'une session y enregistre arrive par sa pull request
comme le reste.

`.do-not-commit/` est un checkout imbriqué : @RULE.no_cd_into_nested_checkout de `~/.ai` s'y applique.

Quand plusieurs agents travaillent en parallèle, leur répertoire temporaire est partagé : donner à chacun un
sous-dossier à son nom, sans quoi ils écrasent mutuellement leurs fichiers de travail.
