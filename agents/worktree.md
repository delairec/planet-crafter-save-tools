# Travailler dans un worktree ou lancer un agent

Une tâche menée dans un `git worktree` — c'est le cas de toute tâche lancée en agent de fond — demande trois gestes
que rien ne rappelle et dont l'oubli ne produit aucune erreur, seulement un verdict faux.

1. **`bun install --frozen-lockfile` dans le worktree, avant le premier test.** Sans lui, Bun résout les packages du
   workspace via le `node_modules` du dépôt principal : les tests s'exécutent sur les sources d'une autre branche et
   passent au vert sans rien dire. C'est le piège le plus coûteux des trois, parce qu'il rend un verdict, et le mauvais.
2. **Vérifier la branche de base.** Un worktree créé par l'outillage part de la branche par défaut du dépôt, qui
   n'est pas forcément la base des tâches — la section « Branches » d'`AGENTS.md` nomme celle en vigueur, et elle seule.
   Avant tout travail, `git merge-base --is-ancestor origin/<base> HEAD` doit sortir en 0 ; sinon, recréer la
   branche depuis la base avant d'écrire une ligne.
3. **`input/` n'est pas versionné et n'existe donc pas dans un worktree neuf.** Les tâches qui vérifient une sortie de
   `bun merge` sur les saves de référence le lient depuis le dépôt principal
   (`ln -sfn <dépôt principal>/input input`). La règle `input` du `.gitignore` n'a pas de barre finale précisément
   pour attraper ce lien ; même forme et même raison pour `.do-not-commit`
   (@DECISION.ThePrivateContextIgnoreRuleHasNoTrailingSlash).

`.do-not-commit/` suit la même logique : chaque worktree porte son propre clone, à rafraîchir par `bun run
private:sync` — voir `agents/contexte-prive.md`. **Le corpus, lui, est versionné dans la branche** : `awawa` lancé dans un
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
