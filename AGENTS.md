# AGENTS.md — planet-crafter-save-tools

Contexte projet pour les agents IA travaillant dans ce dépôt, en complément des instructions générales `~/.ai`.

**Ce fichier n'est plus le domicile des décisions.** Depuis le 2026-09-11, la spécification, les arbitrages et les
questions ouvertes vivent dans le corpus awawa de `docs/` et se lisent avec l'outil. Ce qui reste ici est ce qu'il
faut savoir *avant* d'avoir lancé la moindre commande ; le reste est dans `agents/`, chargé seulement quand la tâche
le demande.

## Charger avant d'agir

Chaque ligne dont le déclencheur correspond à la tâche est OBLIGATOIRE : lire le fichier avant la première commande,
modification ou réponse qu'il gouverne. Ne charger rien d'autre.

| Déclencheur                                                                                  | Fichier                        |
|----------------------------------------------------------------------------------------------|--------------------------------|
| Créer ou modifier une entité du corpus (décision, tâche, règle, section, source…)            | `agents/corpus-ecrire.md`      |
| Supprimer ou renommer un document de `docs/`, toucher l'index des règles du `README.md`      | `agents/document-supprimer.md` |
| Travailler dans un worktree lié, lancer un agent de fond ou une vague                        | `agents/worktree.md`           |
| Lire une save de référence, un plan ou une ressource du dépôt privé `.do-not-commit/`        | `agents/contexte-prive.md`     |
| Créer, renommer ou supprimer un package, ajouter une dépendance entre packages               | `agents/packages.md`           |
| Ouvrir, rebaser, mettre à jour ou relire une pull request ; travailler sur une branche poussée | `agents/pull-request.md`       |

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

**Le corpus se lit par `awawa`, jamais par `cat`, `grep`, `sed` ni l'outil de lecture de fichiers** : la table de
correspondance est la règle CORPUS-4 de `~/.ai/instructions/corpus.md`. Ici, le dernier argument est toujours `.`.

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
- **Avant d'implémenter ou de spécifier X** : `awawa context @TYPE.X --skip reasoning --skip provenance --with-schema .`
  et `awawa lint --closure @TYPE.X .`. Lire le paquet **au lieu** des fichiers ; son pied de page compte toute omission,
  et la ligne `BLOCKED_BY` dit ce qui bloque X — une arête entrante, qu'aucune traversée ne trouve.
- **Éditer le corpus comme du texte**, puis `awawa fmt .` et `awawa lint --strict .`. `awawa new TYPE Nom .` imprime
  un squelette conforme au schéma : l'utiliser plutôt que réciter le schéma.
- Protocole complet : `awawa --help`. Le manuel et le protocole agent sont dans l'archive awawa.

## Emplacement

Ce fichier est versionné à la racine du dépôt public, le corpus dans `docs/`. Le dépôt
satellite privé `delairec/.do-not-commit`, branche `planet-crafter-save-tools`, reste cloné dans `.do-not-commit/`
(git-ignoré ici) et ne porte plus que ce qui ne peut pas être public
(@DECISION.ThePrivateContextHoldsOnlySavesAndPlans).

**Langue** : le corpus est en anglais, noms d'entités compris. Ce fichier et ceux d'`agents/` restent en français ; le reste du dépôt
public — `README.md`, les `.md` de `docs/`, commentaires de code — est en anglais, et les messages de commit le sont
dans tous les dépôts.

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
- `bun run check:guards` — les gardes du dépôt, enchaînées ; leur liste est celle des scripts `check:*` du `package.json`, plus `validate:tables`.
  Aucune ne lit l'historique git, elles répondent en une fraction de seconde : c'est la moitié d'`audit:quality` à
  lancer en cours d'écriture.
- `bun run check:dependencies` — vérifie la matrice de dépendances par préfixe (manifestes et imports, imports
  type-only et directives JSDoc `@import` compris). La matrice est documentée dans le `README.md` public.
- `bun run audit` — `bun audit` sur les dépendances de production et de développement.
- `awawa status .` et les commandes du corpus — voir la section « Corpus de spécification » plus haut.

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

**Base des tâches, aujourd'hui : `integration/save-format-preserved`.** Le chantier en cours conserve le format de
chaque save au lieu de la convertir (@DECISION.ASaveKeepsTheFormatItWasWrittenIn) ; il touche
`shared-save-processing`, `core-mapping`, les deux CLIs et l'UI, et la branche d'intégration évite que `master`
casse pendant la vague. Toute PR de tâche de la vague se base dessus, et s'y rebase, jamais sur `master`.

Deux exceptions, qui restent basées sur `master` : une tâche extérieure à la vague, et les trois fichiers de
@DECISION.ThreeFilesAreChangedOnMasterFirst. La branche d'intégration se rebase elle-même sur `master` quand
`master` avance.

Le nom de la base reste ici et non dans le corpus parce qu'il change à chaque chantier : une entité dont le `DESC`
se réécrit tous les mois ne gagne rien à être une entité.
