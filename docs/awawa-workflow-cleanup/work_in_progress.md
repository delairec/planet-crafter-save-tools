# FICHIER DE TRAVAIL

Ce fichier sert de base pour la construction d'un nouveau corpus. On élabore d'abord un "squelette", sans rien écrire en
dehors de ce fichier (work_in_progress.md).
Une fois qu'on a établi la structure de corpus cible, on commencera la migration. Les nouveaux fichiers awawa seront
placés dans awawa-project-methodology.
Ne lit aucun autre fichier, à part celui-ci et findings.md.
C'est un travail de pure réflexion, et on ne prend pas en compte les décisions et les gardes actuelles, puisque le but
est le changement. Une règle existante (corpus, `~/.ai`, manuel awawa) qui empêche d'atteindre l'objectif est
contournée, pas respectée.

Objectif (2026-09-16) : un corpus qui aide le projet à avancer — planifier les tâches, retenir les décisions utiles et
rien d'obsolète, retrouver l'information sans bruit, pour un agent comme pour un humain, sans consommer de quota pour
rien, sans que les contraintes deviennent des pain points.

Amendement (2026-09-16, après le scan des sessions) : on ne supprime pas une entité qui a cessé de lier, on l'archive ;
la suppression vient après un délai, ou tout de suite pour ce qui n'aurait jamais dû être enregistré.

## Structure de corpus actuelle

Reconstructed from `findings.md`, plus `TASK` and `PACKAGE` read through the tool on 2026-09-16 (`show`, `status`,
`refs`;
no corpus file opened): what neither states is not listed.

### Types

| Type            | Volume                                               | Fields known                                                                                                        | Pain point (findings §)                                                             |
|-----------------|------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------|
| `SCHEMA *`      | —                                                    | `DESC`, `RATIONALE`, `SPEC` › `IMPL`, `STATUS`, `REF` (nested under prose fields), `SOURCE`                         | one `STATUS` ladder gated for every type (§2)                                       |
| `DECISION`      | 137 — 95 implemented, 36 specified, 6 superseded     | `REJECTED` (required), `CLOSES`, `APPLIES_TO_PACKAGE`, `APPLIES_TO_TASK`, `SUPERSEDES`                              | nine families under one type (§3); fields hidden in `DESC` prose (§4)               |
| `OPEN_QUESTION` | 61 — 21 specified (= open), 40 superseded (= closed) | `RECOMMENDATION`, `BLOCKS`, `RATIONALE`, `SOURCE`                                                                   | `specified`/`superseded` misused as open/closed; 8 husk questions (§2, §6)          |
| `TASK`          | 12 — 11 implemented, 1 specified                     | `NAME task_name`, `BLOCKS` (fieldset `Blocage`), `AFTER` (→ `BEFORE`), `WAVE`, `PR`; read by the tool on 2026-09-16 | ladder shared with `SCHEMA *`; name carries a `:vN` and a PascalCase label (§ TASK) |
| `PACKAGE`       | 7 — 7 implemented                                    | `NAME package_name`, `PREFIX` (required); read by the tool on 2026-09-16                                            | `PREFIX` restates the name; `implemented` says nothing (§ PACKAGE)                  |

### `SCHEMA *` conditions

| Condition            | Effect                                     |
|----------------------|--------------------------------------------|
| `STATUS implemented` | `SPEC` required, `IMPL` resolving under it |
| `STATUS superseded`  | incoming `CLOSED_BY` or `SUPERSEDED_BY`    |

### Files

`_schema.awawa` (cross-cutting schema) and one file per domain, schema beside its data: `packages`, `tests`, `erreurs`,
`format-save`, `documentation`, `outillage`, `fusion`, `taches`, `limitations`, `processus`, `questions` (seen in
`refs` output on 2026-09-16).

## Ce que les sessions ont montré (scan du 2026-09-16)

80 sessions entre le tag `before-awawa` (2026-09-11 17:23) et le 2026-09-16 ; 281 messages tapés par l'utilisateur,
1 172 commandes `awawa`, 243 lints dont 22 en échec.

| Constat                                                                                                                                                                          | Mesure                                                                                                                               | Réponse de la cible                                                             |
|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------|
| L'historique dans le corpus est du bruit (11/09, 12/09 « 80 décisions c'est beaucoup », 14/09 « réécrire plutôt que superseded ; draft tant que pas sur la branche de travail ») | écrits dans les éditions : 47 `STATUS superseded`, 26 `SUPERSEDES`, 34 `CLOSES`, 44 `:v2`, 231 lignes `STATUS implemented/specified` | C1, C2                                                                          |
| Les défauts d'awawa n'ont rien à faire dans le projet (retirés à la demande 3 fois, 14/09 et 15/09)                                                                              | 3 limitations, 4 « règles parties dans `~/.ai` »                                                                                     | `LIMITATION` projet seulement ; les rapports d'usage pour l'outil               |
| Un seul `STATUS` pour tous les types n'a pas de sens (12/09)                                                                                                                     | un ladder sur `SCHEMA *`                                                                                                             | C2 : `active\|archived` partout, un cycle de vie sur `TASK` seulement           |
| Sur-enregistrement (14/09 « l'ia s'est emballée », 15/09 « trop de décisions que je n'aurais pas consigné »)                                                                     | 13 `new DECISION`, 11 `new OPEN_QUESTION` pour 10 `new TASK` ; le skill de revue impose « chaque décision dans le corpus »           | seuil d'enregistrement, point à trancher 6                                      |
| Corpus en anglais (15/09 ×2 : la traduction du vocabulaire technique rend le suivi difficile)                                                                                    | corpus français                                                                                                                      | ajouté : anglais partout, noms d'entités compris                                |
| `TASK` typées par un préfixe déduit du type, nom parlant (11/09, 12/09)                                                                                                          | non décrit                                                                                                                           | section `TASK`                                                                  |
| Étendre awawa à la spécification du produit lui-même (14/09, verbatim du rapport d'usage)                                                                                        | corpus = gestion de projet seulement                                                                                                 | tranché 2026-09-16 : le corpus reste méta (gestion de projet), rien côté métier |

Ce que la cible ne touche pas, et qui pèse plus lourd sur le quota que le corpus (15 % des caractères de résultats
d'outils sont du corpus) : les instructions injectées à chaque session (skill awawa ×43, `/awawa-pr-review` ×25 :
1,8 M caractères), la lecture brute des fichiers (200 `cat`/`sed` + 238 `show` contre 42 `context`), la longueur des
réponses (1 016 caractères en moyenne ; 30 messages sur 281 demandent un tableau ou un recap), les erreurs de syntaxe
de continuation de chaîne (L014, 54 lignes). Ce sont des leviers de commandes et de style, à traiter séparément.

## Scan des sessions (rétrospective, 2026-09-16)

Source : `~/.claude/projects/-home-chillie-Web-planet-crafter-save-tools/*.jsonl` (224 fichiers), lus par script,
jamais à la main. Scripts dans le scratchpad de la session : `scan.py` (découpage en périodes) et `metrics.py`
(une mesure par sous-commande). Découpage :

- période A : du tag `before-awawa` (2026-09-11 17:23:31+02:00) à l'ouverture de ce travail de raffinement, prise
  comme le premier `Write`/`Edit` sur `work_in_progress.md` (2026-09-16 10:19:40 UTC) — `scan.py`, 56 sessions.
- période B : les sessions qui écrivent dans `work_in_progress.md` (3 sessions, dont celle-ci) — `scan.py`.

### Sessions et messages

`python3 metrics.py sessions_messages`

| Période | Sessions | Messages utilisateur tapés |
|---------|----------|----------------------------|
| A       | 56       | 342                        |
| B       | 3        | 17                         |

### Commandes `awawa` par sous-commande

`python3 metrics.py awawa_commands`

| Période | status | context | show | refs | lint | fmt | new | diff | Total | `cat`/`sed` sur `.awawa` | `context` vs (`show` + `cat`/`sed`) |
|---------|--------|---------|------|------|------|-----|-----|------|-------|--------------------------|-------------------------------------|
| A       | 218    | 19      | 141  | 24   | 159  | 101 | 21  | 5    | 688   | 108                      | 19 vs 249                           |
| B       | 15     | 8       | 2    | 5    | 9    | 9   | 6   | 0    | 54    | 7                        | 8 vs 9                              |

### Lints

`python3 metrics.py lints`

| Période | Invocations `awawa lint` | Résultats en échec (exit≠0) | Règles L0xx dans la sortie de lint                                                                              |
|---------|--------------------------|-----------------------------|-----------------------------------------------------------------------------------------------------------------|
| A       | 123                      | 3                           | L001:8, L003:9, L007:2, L010:1, L013:1, L014:2, L016:52, L017:1, L018:1, L020:5, L022:1, L023:3, L024:7, L025:1 |
| B       | 7                        | 3                           | L006:13, L023:2                                                                                                 |

### Caractères de résultats d'outils

`python3 metrics.py tool_chars_by_source` (part corpus, par appariement `tool_use_id` → commande `Bash` référençant
`awawa`/`.awawa`) et `python3 metrics.py injected` (part instructions injectées, premier bloc de texte suivant
chaque appel `Skill`)

| Période | Total     | Part corpus        | Part instructions injectées (skills)                                                                                                                                                                                                                                                        |
|---------|-----------|--------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| A       | 4 128 354 | 1 726 382 (41,8 %) | 955 798 (23,2 %) — détail : `update-config` 522 303, `awawa` 167 351, `claude-api` 106 183, `awawa-schema` 52 455, `artifact-capabilities` 28 452, `artifact-design` 24 418, `awawa-pr-review` 18 233, `worktree-clean` 12 064, `awawa-plan-wave-start` 12 115, `awawa-usage-report` 12 224 |
| B       | 469 397   | 72 370 (15,4 %)    | 50 043 (10,7 %) — détail : `awawa-schema` 31 473, `awawa` 18 570                                                                                                                                                                                                                            |

Appels au skill `awawa-pr-review` : 1 (période A), 0 (période B) ; aucune invocation de la commande
`/awawa-pr-review` elle-même dans les deux périodes.

### Longueur des réponses de l'assistant

`python3 metrics.py response_len`

| Période | Blocs de texte | Longueur moyenne (caractères) |
|---------|----------------|-------------------------------|
| A       | 534            | 1 026                         |
| B       | 25             | 1 136                         |

### Messages utilisateur demandant un tableau, un recap ou une correction

`python3 metrics.py user_asks` (regex sur `tableau|table|récap|corrig|erreur|tu t'es trompé|non,|pas ça`, verbatims
tronqués à 100 caractères)

Période A — 29 messages :

| Date (UTC)                         | Verbatim                                                                                              |
|------------------------------------|-------------------------------------------------------------------------------------------------------|
| 2026-09-11 20:29                   | non le dépôt public lui il continue de vivre normalement, pas sur la branche awawa, d'ailleurs on p…  |
| 2026-09-11 20:39                   | j'ai rien compris à ton truc de conflit, je sais plus où on en est. Fait un recap de ce que je dois … |
| 2026-09-11 21:33                   | fait un tableau parce que là je comprend pas ce que tu me racontes                                    |
| 2026-09-11 21:58                   | le préfixe DEP était uniquement pour dependabot en réalité. Les tâches dans plan-secu.md seront préf… |
| 2026-09-11 22:00                   | # Reprise — réduire plan.md, migrer plan-secu.md en entités SEC ## Où travailler - Worktree : `~/We…  |
| 2026-09-11 22:42                   | on a vraiment besoin de garder la table de correspondance?                                            |
| 2026-09-13 14:42                   | redonne le contexte de la question avec un tableau si ça aide                                         |
| 2026-09-14 10:41                   | Les écrits qui concernent des corrections qui doivent être apportée à l'outil awawa ne doivent vivre… |
| 2026-09-14 10:47                   | corrige la commande. Je voudrais aussi ajouter une section dans le template des rapports: un verbati… |
| 2026-09-15 00:06 UTC (01:06 local) | dans 1h tu feras un clean des worktree+branches mergées ou sans commits, puis rebase de la PR #81 et… |
| 2026-09-15 00:09 UTC (01:09 local) | je te corrige: fusionnées dans refactor/review-clean-archi-violations-in-core-mapping-package (c'es…  |
| 2026-09-15 10:17                   | claude me propose ceci en remédiation à des problèmes rencontrés en sessions, mais je préférerais un… |
| 2026-09-15 10:21                   | non on travaille ici en mode quick fix. Pour le moment j'utilise que claude, mais peut être qu'on pe… |
| 2026-09-15 10:26                   | tu n'as pas mis de déclencheur c'est normal? et c'est quoi "cron"? Et ceci est une autre proposition… |
| 2026-09-15 10:59                   | Reprise d'une session sur ~/.ai (instructions agnostiques) et ~/.claude (commandes Claude Code). Mod… |
| 2026-09-15 11:14                   | corrige ai-turns et reprends les budgets. Est-ce que la statusline s'appuie sur ai-turns? comment je… |
| 2026-09-15 11:38                   | liste les questions auxquelles je dois répondre dans un tableau, puis écrit un prompt de reprise de … |
| 2026-09-15 11:44                   | Reprise session ~/.ai + ~/.claude. Mode quick fix : travail direct dans le worktree principal de ~/.… |
| 2026-09-15 11:49                   | ceci est une proposition de remédiation de claude insights, il faut l'adapter pour être incluse à .a… |
| 2026-09-15 11:50                   | Proposition de claude insights: "Scan my recent session history and CLAUDE.md. List every instructio… |
| 2026-09-15 11:58                   | corrige les défauts trouvés. Pour la scission, ton option B, ça veut dire que awawa-pr-review invoqu… |
| 2026-09-15 14:45                   | (1) j'ai mergé et j'ai pull. (2) c'est quoi que tu dois installer j'ai pas compris? (3) après mon pu… |
| 2026-09-15 16:03                   | 1, 2, et 5: ok. Le piège du worktree (6) a normalement déjà été résolu (pas encore testé) durant les… |
| 2026-09-15 16:33                   | fais un tableau markdown des défauts de l'outil awawa trouvé en relisant les rapports dans docs/awaw… |
| 2026-09-15 17:22                   | "Si ce que tu veux consigner, c'est la raison du choix", non pas du tout. Je voulais juste pouvoir é… |
| 2026-09-15 22:12                   | je comprends pas ce que je dois faire, tableau                                                        |
| 2026-09-15 23:07                   | vérifie les PR dependabot, commence par le rebase (master a reçu des commits), et fais moi un recap … |
| 2026-09-15 23:47                   | Plutôt on fait la PR qui corrige en premier, ensuite au rebase de la pr dependabot ça devrait se met… |
| 2026-09-16 10:34                   | oui, ce hook ne devrait pas être installé dans un dépôt qui n'est pas géré par awawa, il faut corrig… |

Période B — 3 messages :

| Date (UTC)       | Verbatim                                                                                              |
|------------------|-------------------------------------------------------------------------------------------------------|
| 2026-09-16 11:07 | merci, maintenant, si tu scannes mes sessions précedentes à partir de la date du tag "before-awawa" … |
| 2026-09-16 11:47 | je suis d'accord avec tes postulats, tu peux mettre à jour le fichier. Une seule chose: "ne jamais r… |
| 2026-09-16 20:09 | Corpus cleanup, suite. Fichier de travail : docs/awawa-workflow-cleanup/work_in_progress.md (main wo… |

### Période B seulement — sondes et entités

`python3 metrics.py period_b_probes` et `python3 metrics.py period_b_entities`

| Mesure                                                                                              | Valeur            |
|-----------------------------------------------------------------------------------------------------|-------------------|
| Répertoires de sondes sur corpus jetable référencés (`scratchpad/p*`)                               | 2 (`p35`, `p35b`) |
| Lignes de commande référençant un de ces répertoires                                                | 4                 |
| Entités distinctes nommées dans une commande `awawa` (corpus jetable et corpus du projet confondus) | 15                |

Entités les plus citées : `TASK.DOCS46` (5), `PACKAGE.CoreMapping` (4), `TASK.T1` (4), `TASK.DEP2` (4),
`UNKNOWN_SOURCE.ForumThread` (4), `DECISION.Untyped` (4), `FACT.SaveIsJson` (2), `DECISION.MergeKeepsBothWorlds` (2),
`PULL_REQUEST.PCST62` (2), `DECISION.Archived` (2), `DECISION.NoRef` (2), `FIELDSET.Ruling` (1), `FIELDSET.Ladder`
(1), `ARCHIVED_TASK.DEP2` (1), `PROJECT.PCST` (1).

## Challenge du squelette précédent (2026-09-16)

The previous skeleton split `DECISION` into six ruling types, each with a five-value ladder and its own `WHEN` table.
Measured against the objective above, it moves the pain rather than removing it. Three challenges, each with what the
probe on `awawa 2.7.0` showed (throwaway corpus, scratchpad).

### C1 — History leaves the live corpus; archived entities are suppressed, then deleted after a delay

Every terminal `STATUS` value of the previous skeleton (`superseded`, `retired`, `rejected`, `closed`, `withdrawn`,
`refuted`) exists to keep an entity in the corpus after it stopped binding. What that costs today: 40 closed questions
and 6 superseded decisions loaded by `context`, an `INCOMING` edge to maintain per terminal value, a `:v2` naming idiom,
`SUPERSEDES`, `CLOSES` and their converses, and 8 husk questions written only to be closed.

Ruling: **one archive mechanism for every type, declared once on `SCHEMA *`**: `STATUS active|archived`, `DEFAULT
active`, `archived` gated `suppressed` and requiring `ARCHIVED_ON`. An entity that stops binding is archived in the
pull request that ends it. Probed: `context` does not expand a suppressed entity and names it in its footer
(`// suppressed: @TASK.DEP2`), every reference to it stays valid and counted, `status TYPE --where STATUS==archived`
lists them, `--strict` refuses an `archived` without `ARCHIVED_ON` (L006). A replaced ruling on the same subject is
edited in place under its name (the 2026-09-14 rule): the previous form is a `REJECTED` line when the lesson matters,
nothing otherwise. Deletion is for two cases only: an entity that should never have been recorded, and an archived
entity past the delay (cleanup pass, see « Archive et suppression »).

Consequences: no `superseded`, `retired`, `rejected`, `closed`, `withdrawn`, `refuted` values; no
`SUPERSEDES`/`SUPERSEDED_BY`, no `CLOSES`/`CLOSED_BY`, no `:vN` suffix; no `FIXED_BY` on a limitation (fixed =
archived, the test lives in the code). `status` prints an entity that omits `STATUS` under `(none)`, not `active`
(the display does not materialise the `DEFAULT`; usage-report material, nothing to do here).

### C2 — `draft`, `open`/`closed`, `implemented` are not states

0 `draft` among 198 entities measured (findings §1). A ruling proposed but not ratified is a pull request under review,
or an `OPEN_QUESTION` with a `RECOMMENDATION`. A question answered is a question archived by the ruling's pull request.
« Accepted but not built » is an `APPLIES_TO_TASK` to a task not implemented; `--where` cannot see a nested `IMPL`
anyway (probed: exit 2, « `IMPL` is not a field of DECISION »).

Ruling: **no lifecycle beyond `active|archived`, except on `TASK`**, because planning is the one thing the corpus
tracks over time.

### C3 — One ruling type, distinguished by a field, not five types

The previous skeleton refused `OUTILLAGE` because « its schema would be identical to `DECISION`'s — the type would buy
nothing but a name ». The same test applied to the others: `CONVENTION` differs from `DECISION` by one optional anchor
(`ENFORCED_BY`), `PRACTICE` by naming `SPEC` `STEP`, `CORPUS_RULE` by what `IMPL` anchors, `CONFIDENTIALITY` by two
fields four entities use. Five types cost five schemas, five classification decisions at write time (findings §7.1), a
retype of 137 entities and every `@DECISION.X` reference site (findings §7.3). What they buy is retrieval by family,
which one required enum field gives for free (`status DECISION --where KIND==process`, probed).

Ruling: **`DECISION` stays the single ruling type**. `KIND product|process|corpus` was the field proposed to keep the
family retrievable; dropped on 2026-09-16 (point 2): no family axis, neither a field nor a type. The name `DECISION` is
kept on purpose: no reference site changes. Only the two families with a different *shape* become types: `LIMITATION`
(no
`REJECTED`, `SYMPTOM`/`REOPEN_WHEN`) and `FACT` (no `REJECTED`, `GAME_VERSION`/`ATTESTED_BY`): 18 entities to retype
instead of 137.

Amended 2026-09-16 (point 18): the criterion stands, its result changes once `SPEC › IMPL` is required on `DECISION`.
A ruling on how the work is led has nothing in the repository to anchor, so its shape differs (no `IMPL`, no
`APPLIES_TO_*`, no `RESTS_ON`): it is a third type, `PROCESS`, about ten entities of `processus.awawa` after points 6
and 7. `KIND` stays refused: the family is a shape, not a field.

### What changes against the previous skeleton

| Previous skeleton                                   | Revised                                                                                                                                       | Why                                                                               |
|-----------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------|
| 6 ruling types + `LIMITATION` + `FACT`              | `DECISION` + `PROCESS` + `LIMITATION` + `FACT`                                                                                                | C3; `KIND` dropped 2026-09-16; `PROCESS` added (point 18)                         |
| 5-value ladder × 6 types, `WHEN` table each         | `active\|archived` on `SCHEMA *`; a ladder on `TASK` only                                                                                     | C1, C2                                                                            |
| `SUPERSEDES`, `CLOSES`, converses, `INCOMING` edges | none; archive, or edit in place                                                                                                               | C1                                                                                |
| `OPEN_QUESTION` `open\|closed\|withdrawn`           | a question is active or archived                                                                                                              | C2                                                                                |
| `WORKS_AROUND` anchor to a usage report             | `UNTIL` string: the condition that retires the ruling                                                                                         | what a workaround needs is its expiry, not its provenance                         |
| `FIXED_BY` on `LIMITATION`                          | none; fixed = archived; the fixing task, until it merges, is `UNTIL @TASK` (point 20)                                                         | C1                                                                                |
| `Obligation` and `Ruling` fieldsets                 | `Ruling` only (`REJECTED` + `REF`, `UNTIL`), included by `DECISION` and `PROCESS`; `SPEC` declared per type because its nested anchors differ | two types carry them (point 18)                                                   |
| name shape `[A-Z][A-Za-z0-9]*(:v[0-9]+)?`           | `[A-Z][A-Za-z0-9]*`; `TASK` names are their identifier                                                                                        | no versions; stable task links                                                    |
| schema of a type beside its domain data             | all schema in `_schema.awawa`                                                                                                                 | six types, one place to read with `--with-schema`; probed layout-blind (point 32) |
| one file per domain                                 | one file per type, lower case plural, appended at the end; the four source types in `sources.awawa`                                           | point 32: the domain is read by nothing; the file follows the type                |
| corpus in French                                    | corpus in English, entity names included                                                                                                      | sessions of 2026-09-15                                                            |

## Structure de corpus cible

Column conventions:

- **Accepted values** is the awawa type expression; `(→ X)` names the `CONVERSE` of a reference field.
- A nested field is written `PARENT › CHILD`.
- Language: English everywhere, entity names included.

### SCHEMA *

| Field name      | Role                                                                                                                                                                                                                                                                                                                                                                                 | Accepted values  | Is repeatable | Is required    |
|-----------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------|---------------|----------------|
| DESC            | what no other field of the entity holds; written only when nothing else carries it (ruled 2026-09-16)                                                                                                                                                                                                                                                                                | string           | no            | no             |
| DESC › REF      | an entity the prose mentions                                                                                                                                                                                                                                                                                                                                                         | reference        | yes           | no             |
| RATIONALE       | why the entity is as it is; `CATEGORY reasoning`, skipped by `--skip`                                                                                                                                                                                                                                                                                                                | string           | no            | no             |
| RATIONALE › REF | an entity the prose mentions                                                                                                                                                                                                                                                                                                                                                         | reference        | yes           | no             |
| SOURCE          | where the entity came from, in prose (see « Sources »); ruled 2026-09-16: `string`, the source entity under `REF`; `CATEGORY provenance` (point 28): `context --skip provenance` leaves the source entities out                                                                                                                                                                      | string           | yes           | no             |
| SOURCE › REF    | the `PULL_REQUEST`, `USAGE_REPORT`, `URL` or `PROJECT` (a file of another repository) entity the prose names; **required** (point 30): a `SOURCE` line that names no entity is L006, so a provenance of a kind with no type cannot be parked in prose — its type is declared in the same pull request; gated like every `REQUIRED` (an archived entity's `SOURCE` without it passes) | reference        | yes           | yes (point 30) |
| STATUS          | `DEFAULT active`: written only to archive; `TASK` shadows it with its ladder                                                                                                                                                                                                                                                                                                         | active\|archived | no            | no (default)   |
| ARCHIVED_ON     | the day the entity was archived; starts the delay before deletion; declared **inside `WHEN STATUS archived` only** (point 31): on an active entity it is L003                                                                                                                                                                                                                        | date             | no            | when archived  |
| PURGE           | whether the cleanup pass deletes the entity once the delay has run; `DEFAULT true` (point 31: archived = no longer needed), `PURGE false` keeps it indefinitely; declared inside `WHEN STATUS archived` only, except on `TASK`, which redeclares it at type level because the pass archives a task unattended and the choice is written before                                       | true\|false      | no            | no (default)   |

| Condition field (WHEN) | Condition value | GATE       | Require field                                                |
|------------------------|-----------------|------------|--------------------------------------------------------------|
| STATUS                 | active          | error      | —                                                            |
| STATUS                 | archived        | suppressed | ARCHIVED_ON (declared here), PURGE (declared here, optional) |

Probed 2026-09-16 (review pass): `WHEN STATUS active GATE error` fires on an entity that omits `STATUS` — the `DEFAULT`
is read by gating, so an active entity is strict without `--strict`. It is not read by `status`: the entity shows as
`(none)`, `--where STATUS==active` selects nothing, and « the active ones » is written `--where STATUS!=archived`.

`DESC` on a `SCHEMA`, `FIELDSET` or `SHAPE` entry stays required by the tool (L022, independent of the wildcard), and a
schema entry accepts no other prose than `DESC`, `RATIONALE`, `SPEC` (L023 refuses `ROLE`): the role of a type is its
schema `DESC`, and that is why `DESC` cannot be renamed nor restricted to schema entries. On data entities it is
optional.

`PURGE` and `ARCHIVED_ON` are not read through `--where` (ruled 2026-09-16, point 31): a field declared only inside a
`WHEN` block is unknown to `--where` until one entity of the type writes it (« not a field of LIMITATION in this
workspace », exit 2; probed p36), and `--where` has no date comparison. The cleanup pass lists
`status TYPE --where STATUS==archived --json`, then reads each entity with `show --json` (both values are atoms) and
the default with `show TYPE --json` / `show @SCHEMA.* --json` (the `DEFAULT` atom is exposed, at type level and
inside the `WHEN`).

Entity names: `NAME pascal`, `[A-Z][A-Za-z0-9]*`, declared on `SCHEMA *`; `TASK` shadows it with `task_id`.

### DECISION

Membership: a ruling the project follows **and that holds somewhere in the repository** (code, config, schema, hook,
instructions). It binds while active; it is archived when it stops binding, rewritten in place when replaced on the
same subject. A ruling with nothing in the repository to anchor is a `PROCESS` (next section): the test is one clause,
« can an `IMPL` be written? », and the tool applies it (a `DECISION` without `IMPL` is L006).

Ratified 2026-09-16 (points 16–18):

| Field name         | Role                                                                                                                                                                                                     | Accepted values           | Is repeatable | Is required                                                                 |
|--------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------|---------------|-----------------------------------------------------------------------------|
| REJECTED           | an alternative considered and refused, including the previous form of this ruling when replaced; `CATEGORY reasoning`, skipped by `context --skip reasoning`; declared once in `FIELDSET Ruling`         | string                    | yes           | yes, gated: error while active, suppressed once archived                    |
| REJECTED › REF     | an entity the prose mentions; `refs` on that entity lists where it was refused                                                                                                                           | reference                 | yes           | no                                                                          |
| SPEC               | one falsifiable obligation                                                                                                                                                                               | string                    | yes           | yes, gated as above                                                         |
| SPEC › IMPL        | where the obligation holds: code, config, schema, hook, instructions                                                                                                                                     | anchor                    | yes           | **yes** (point 18): a ruling that cannot name where it holds is a `PROCESS` |
| SPEC › ENFORCED_BY | the guard, test or workflow that fails when the obligation is broken; what remains of the `CONVENTION` family without a type                                                                             | anchor                    | yes           | no                                                                          |
| APPLIES_TO_PACKAGE | the package the ruling is limited to; absent = all (4 of 7 packages carry none today)                                                                                                                    | @PACKAGE (→ GOVERNED_BY)  | yes           | no                                                                          |
| APPLIES_TO_TASK    | the task that builds it; a ruling whose task is `todo` is « accepted, not built »; **purged with the task** by the cleanup pass: after `implemented` the edge is provenance, which `SOURCE › REF` covers | @TASK (→ GOVERNED_BY)     | yes           | no                                                                          |
| RESTS_ON           | a fact the ruling depends on; `refs` on the fact lists what to re-examine when it changes; kept (ruled 2026-09-16): `FACT` is the bridge to the second migration, the one that will specify the product  | @FACT (→ GROUNDS)         | yes           | no                                                                          |
| UNTIL              | what retires the ruling: the task whose merge retires it, or the observable condition in prose when no task does (a second maintainer); ruled 2026-09-16; declared once in `FIELDSET Ruling`             | @TASK\|string (→ RETIRES) | no            | no                                                                          |

No `KIND` (ruled 2026-09-16, point 2): no family axis on a ruling. A rule the schema already enforces is not a
decision: its home is the schema declaration and its `DESC`.

`SPEC` required on every decision: 32 of 137 have none today (findings §1); each gets one or is not carried over.
`IMPL` required under it (point 18): a live decision whose `SPEC` has no anchor becomes a `PROCESS` or is dropped.

Converse names: `GOVERNED_BY` is the word the current corpus already gives to the reverse edge of both `APPLIES_TO_*`
(read with `show @DECISION docs` on 2026-09-16); the previous skeleton's `CONSTRAINED_BY` renamed it for no recorded
reason and is dropped. A converse is computed, never written on the target: a task carries no field for `UNTIL` or
`APPLIES_TO_TASK`, `context @TASK.X` prints `RETIRES` and `GOVERNED_BY` in its footer and `status TASK` counts them.
`refs` on the target prints the field name of every site (`APPLIES_TO_TASK`, `REJECTED.REF`), so a shared converse
stays distinguishable.

`FIELDSET Ruling` (schema mechanism, neither a field nor a type): `REJECTED` with its nested `REF`, `CATEGORY` and
`REQUIRED`, and `UNTIL` with its `CONVERSE`, declared once and spliced by `INCLUDE @FIELDSET.Ruling` into `DECISION`
and `PROCESS`. The alternative, redeclaring both fields on both types, keeps two copies aligned by hand. `SPEC` is not
in the fieldset because its nested anchors differ between the two types.

Probed 2026-09-16 on 2.7.0, ahead of this entity's review (throwaway corpus p9): `IMPL` and `ENFORCED_BY` nested under
`SPEC` are resolved by L016 (a missing path is an error); `--where APPLIES_TO_TASK==@TASK.T1` and `--where
UNTIL==@TASK.T2` select on a reference field; `refs @TASK.T1` lists the `APPLIES_TO_TASK` sites and `context @TASK.T1`
prints the converse in its footer; `refs` on the package and on the fact list `APPLIES_TO_PACKAGE` and `RESTS_ON`;
`FIELD UNTIL @TASK|string` is accepted (a reference beside a literal term is not L020) and both forms lint, which
answers the free-text proposal for `UNTIL`; a `@DECISION.X` written inside a `REJECTED` string without a nested
`REF` is L025 (error on an active entity), so `REJECTED › REF` earns its place.

Probed 2026-09-16 at this entity's review (throwaway corpus p10, `lint --strict` clean with the table above):

| Probe                                                 | Result                                                                                                                                                                                        |
|-------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `UNTIL "until @TASK.T2 lands"` on a `string` slot     | L025: the task in prose is indexed by nothing, and `UNTIL` declares no nested `REF`; `UNTIL @TASK.T2` is the only typed form                                                                  |
| `CONVERSE RETIRES` on the union slot `@TASK\|string`  | accepted; `context @TASK.T2` prints `RETIRES (root, 1)`, `status TASK` counts `RETIRES 1`: `refs` on a merged task lists the workarounds to archive                                           |
| `CATEGORY reasoning` on `REJECTED`                    | `context --skip reasoning` drops the lines and does not traverse their `REF` (28 → 20 lines on 3 decisions); footer `skipped (reasoning): @DECISION.Other, 3 fields on @DECISION.WithAnchors` |
| `IMPL "src/merge.ts::nonexistent"`                    | L016 checks the symbol, not only the path: an anchored obligation is falsifiable at the symbol                                                                                                |
| `RESTS_ON` against the live corpus (through the tool) | the 6 fact decisions of `format-save` receive 2 edges, both `RATIONALE.REF` (one decision, one question): the field formalises what prose already cites                                       |
| `status DECISION docs` on 2026-09-16                  | 145 (97 implemented, 36 specified, 12 superseded) against 137/6 in findings: the outline's volumes are recounted at migration                                                                 |

Probed 2026-09-16 at the ratification of the remaining rows (throwaway corpora p11, p12, p15):

| Probe                                                  | Result                                                                                                                                                                                                                |
|--------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| decision without `REJECTED`, without `SPEC`            | L006 error on an active entity; an **archived** decision without either passes `lint` and `lint --strict`: `REQUIRED` is gated by the wildcard's `WHEN STATUS`                                                        |
| `REJECTED ""`                                          | passes `--strict`: the requirement is a prompt (`new` prints the line), not a proof (defects section)                                                                                                                 |
| `refs @DECISION.Other`                                 | `incoming (1) … @DECISION.Full REJECTED.REF`: the entity cited as a refused alternative receives an edge                                                                                                              |
| `IMPL` at entity level, outside `SPEC`                 | L003 « field IMPL is not declared on DECISION »: no anchor without an obligation                                                                                                                                      |
| `IMPL "_schema.awawa::FIELD REJECTED string"`          | resolved: a corpus-rule ruling can anchor the schema, but such a rule is not a decision (above)                                                                                                                       |
| `ENFORCED_BY` to a missing path                        | L016, same check as `IMPL`; the tool tells the two apart by name only, and `--where` sees neither (nested): retrieval is `grep -n ENFORCED_BY`                                                                        |
| `IMPL` `REQUIRED` nested under `SPEC` (p12)            | L006 « required field IMPL is absent from DECISION.SPEC » on every `SPEC` without one: the classification test, run by the tool                                                                                       |
| `APPLIES_TO_TASK` to an archived task                  | `--strict` clean, `status TASK` counts `GOVERNED_BY 1` on the archived task; the line goes with the task at purge (`PURGE true` default on `TASK`)                                                                    |
| `context @DECISION.Full`                               | 6 entities, 24 lines: package, task, fact and `UNTIL` task expanded; `--skip reasoning` 5 entities, 19 lines                                                                                                          |
| live corpus, `status PACKAGE docs`, `status TASK docs` | 63 `APPLIES_TO_PACKAGE` on 3 packages (core_mapping 37, ui_save_manager 22, shared_save_processing 4), 41 `APPLIES_TO_TASK` on 5 tasks, all `implemented`: carried over as they are, they decay with the tasks' purge |
| `status DECISION --where REJECTED==nothing`            | selects on a repeatable string by exact value                                                                                                                                                                         |

### PROCESS

Membership (ruled 2026-09-16, point 18): a ruling on how the work is led, with **nothing in the repository to
anchor**: branch, worktree, pull request, review, what a session does. The complement of `DECISION`: an obligation
that no `IMPL` can name. Same archive, same rewrite in place.

| Field name         | Role                                                                                                               | Accepted values           | Is repeatable | Is required |
|--------------------|--------------------------------------------------------------------------------------------------------------------|---------------------------|---------------|-------------|
| REJECTED (+ REF)   | as on `DECISION`, from `FIELDSET Ruling`                                                                           | string                    | yes           | yes, gated  |
| SPEC               | one falsifiable obligation                                                                                         | string                    | yes           | yes, gated  |
| SPEC › ENFORCED_BY | the hook or workflow that fails when the obligation is broken (`conventional-commits.yml` enforces a process rule) | anchor                    | yes           | no          |
| UNTIL              | as on `DECISION`, from `FIELDSET Ruling`                                                                           | @TASK\|string (→ RETIRES) | no            | no          |

No `IMPL`, no `APPLIES_TO_*` (a process rule is not package-scoped; a temporary one carries `UNTIL`), no `RESTS_ON`.
`status PROCESS` lists the family: what `KIND` was to buy, obtained by a shape, not by a field.

Live corpus, read with `status DECISION docs` and `show` on the 39 decisions of `processus.awawa` (2026-09-16): 16
`implemented` with anchors (`AGENTS.md` ×3, `docs/_schema.awawa` ×5, corpus files ×5, code/scripts/`.github` ×4), 20
`specified` with no anchor at all, 3 `superseded`. Of the 20: about 6 are rules that left for `~/.ai` (point 7), about
2 are enforced by the tool (not decisions), about 10 hold in a git tag, `.git/machete`, a skill outside the repository
or a habit: the `PROCESS` volume, to recount at migration. Two `processus` decisions anchor product code
(`nameMergedFile.ts`, `worldObjectLabels.ts`): they are `DECISION`s misfiled by domain.

Probed 2026-09-16 on 2.7.0 (throwaway corpus p15, `lint --strict` clean):

| Probe                                                  | Result                                                                                                                   |
|--------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------|
| `FIELDSET Ruling` included by `DECISION` and `PROCESS` | accepted with nested `REF`, `CATEGORY reasoning` and `CONVERSE RETIRES`; `--skip reasoning` follows the fieldset's field |
| `refs @TASK.T2` with `UNTIL` from both types           | both sites listed under `UNTIL`; one converse name from two types is not L013                                            |
| `DECISION` written with a `SPEC` and no `IMPL`         | L006 « required field IMPL is absent from DECISION.SPEC »: the entity is a `PROCESS` or is dropped                       |
| `new PROCESS Foo`                                      | two required lines (`REJECTED`, `SPEC`), `ENFORCED_BY` nested optional, `UNTIL` optional                                 |
| `status PROCESS`                                       | lists the two process rulings; `context @PROCESS.X --skip reasoning` 2 entities, 7 lines                                 |
| a second `SCHEMA DECISION` block in the same file      | L005 duplicate identity: the tool refuses, never merges                                                                  |

### LIMITATION

Membership: a known defect **of this project** left in place. A defect of an external tool is not recorded (its report
goes to the tool's authors); the project's workaround is a `DECISION` with `UNTIL`. The defect is accepted while
active; the task that fixes it is its `UNTIL`; once fixed, the limitation is archived and the proving test lives in
the code.

Ratified 2026-09-16 (point 20):

| Field name         | Role                                                                                                                                                                                                   | Accepted values           | Is repeatable | Is required                                              |
|--------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------|---------------|----------------------------------------------------------|
| SYMPTOM            | what a user or a developer observes                                                                                                                                                                    | string                    | no            | yes, gated: error while active, suppressed once archived |
| WORKAROUND         | what to do while the defect stands                                                                                                                                                                     | string                    | yes           | no                                                       |
| WORKAROUND › REF   | an entity the workaround mentions; a `@TYPE.X` in the prose without it is L025                                                                                                                         | reference                 | yes           | no                                                       |
| UNTIL              | the task that fixes it, or the observable condition that makes the fix due when no task exists; same word and converse as on the rulings, redeclared on the type (no `FIELDSET Ruling`: no `REJECTED`) | @TASK\|string (→ RETIRES) | no            | yes, gated as above                                      |
| SEEN_IN            | the code where the defect sits, or the test that pins the current behaviour; L016 resolves it                                                                                                          | anchor                    | yes           | no                                                       |
| APPLIES_TO_PACKAGE | the package that carries the defect                                                                                                                                                                    | @PACKAGE (→ LIMITED_BY)   | yes           | no                                                       |

No `REJECTED`: a limitation is accepted, not chosen among alternatives. No `SPEC`: nothing is required of anyone. No
`SYMPTOM › REF`: an observation names no entity, and L025 says so the day one does. `REOPEN_WHEN` (previous form) is
replaced by `UNTIL`: the link from a limitation to the task that fixes it had no typed home (`TASK` carries no field
for it), and `refs @TASK.X` / `status TASK` now list what a task retires, rulings and limitations alike. « Reopened »
(the ladder of findings §3) is `status LIMITATION --where UNTIL==@TASK.X`; « closed » is archived.

Live corpus, read with `status DECISION docs` and `show` on the 12 decisions of `limitations.awawa` (2026-09-16):

| Entity (abridged)                       | STATUS today           | Target                                                                                                                                                         |
|-----------------------------------------|------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------|
| ErreursTardivesDeLaSectionTrois         | specified              | **LIMITATION**: symptom, reopening condition (third `RATIONALE`), `SEEN_IN validateSaveContent.js`                                                             |
| OnzeMachinesSansNiveauDEnergie          | specified              | **LIMITATION** « sans tâche »; `SEEN_IN energyLevelsByWorldObjectName.ts`; its two `SPEC` are rulings (`DECISION`)                                             |
| EtatDAttenteDHydratation                | implemented            | **LIMITATION** (the state no scenario covers) **and a `DECISION`** (locators by role: `SPEC`/`IMPL`, `APPLIES_TO_TASK`) — split ratified 2026-09-16 (point 20) |
| PreloadHorsRacineDePackage → BunOptions | specified              | a Bun defect: `DECISION` with `UNTIL "Bun resolves bunfig.toml upward"`                                                                                        |
| PiedDePageBlockedBy (+ `:v2`)           | superseded / specified | awawa defect (point 7): the guard is a `PROCESS` with `UNTIL`, or nothing                                                                                      |
| AwawaDiffContreUneCopie                 | specified              | same                                                                                                                                                           |
| ReferentsLusParShow                     | specified              | same                                                                                                                                                           |
| MarqueDOrdreDesOctets                   | implemented            | `DECISION` (two `REJECTED`, two `SPEC`/`IMPL`): the husk idiom filed it here                                                                                   |
| GarantieDUnicite                        | implemented            | `DECISION` (`IMPL docs/game-rules.md::GR-ID-1`)                                                                                                                |
| StandardDeuxMerged                      | specified              | `DECISION` without `SPEC`: gets one or is not carried over                                                                                                     |
| RegleDuContextePrivePerdSaBarreFinale   | implemented            | `DECISION` misfiled (`.gitignore`)                                                                                                                             |

Three limitations out of the « ~12 » of findings §3 (ratified 2026-09-16: the outline's step 4 is recounted, and the
hydration entity is written as two, one `LIMITATION` and one `DECISION`); the 8 husk questions go with the idiom. Each
of the three carries
a reopening condition and a code anchor today, the anchor housed in a `SPEC › IMPL` that is no obligation: that is what
`SEEN_IN` takes over.

Six `SOURCE` lines cite `known-issues/*.md`. The folder lived in the private context repository (`.do-not-commit`,
tag `pcst/before-awawa`, 20 files) and left it in the commit that handed the specification to the corpus; it exists
nowhere at HEAD. Ruled 2026-09-16 (point 28): kept as prose with the path and the tag,
`SOURCE "known-issues/<file>.md, tag pcst/before-awawa"` + `REF @PROJECT.DNC` (the private repository,
`delairec/.do-not-commit`, is a `PROJECT`); the tag is the only place where the original measures survive. Measured
through the tool: 8 lines on 7 entities (6 in `limitations.awawa`, plus the NomDeDossier question), all carried over (3
`LIMITATION`, 3 `DECISION`, StandardDeuxMerged conditional). Probed (p25): the pair lints, `refs @PROJECT.X` lists
the `SOURCE.REF` sites.

Probed 2026-09-16 on 2.7.0 (throwaway corpus p16 = p15 + the `SCHEMA LIMITATION` above, `lint --strict` clean):

| Probe                                                                                                   | Result                                                                                                                                               |
|---------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------|
| `APPLIES_TO_PACKAGE` with `CONVERSE LIMITED_BY` beside the same field named `GOVERNED_BY` on `DECISION` | accepted; `status PACKAGE`: `incoming 3 (GOVERNED_BY 1, LIMITED_BY 2)`; `context @PACKAGE.X` prints both footer lines                                |
| `UNTIL @TASK\|string CONVERSE RETIRES REQUIRED` redeclared on the type, outside the fieldset            | accepted; `refs @TASK.T1` lists `@LIMITATION.X UNTIL`; `context @TASK.T1` footer `RETIRES (root, 1)`; `status TASK` counts `RETIRES` from both types |
| `--where UNTIL==@TASK.T1`, `--where APPLIES_TO_PACKAGE==@PACKAGE.X`, `--where STATUS!=archived`         | select                                                                                                                                               |
| `WORKAROUND "apply @DECISION.Full"` without `REF`                                                       | L025 error; with the nested `REF`, `refs @DECISION.Full` lists the `WORKAROUND.REF` site                                                             |
| `SYMPTOM "see @DECISION.Full"` without `REF`                                                            | L025 error too: every string that names an entity pays a nested `REF` or an error                                                                    |
| limitation without `UNTIL`                                                                              | L006                                                                                                                                                 |
| `SEEN_IN "src/merge.ts::nonexistent"`                                                                   | L016 at the symbol                                                                                                                                   |
| archived limitation without `SYMPTOM` nor `UNTIL`                                                       | `--strict` clean (`REQUIRED` gated by the wildcard)                                                                                                  |
| `new LIMITATION Foo`                                                                                    | two required lines: `SYMPTOM`, `UNTIL`                                                                                                               |
| `context @LIMITATION.X` with a `WORKAROUND › REF` to a decision                                         | 6 entities, 26 lines: the `REF` expands the decision and its neighbourhood; `--depth 1` or `--skip` cuts it                                          |

### FACT

Membership: it states what the save file or the game is, and arbitrates nothing of ours. **Temporary type** (ruled
2026-09-16, restated at its review): a bridge so the migration loses no information. The second migration will specify
the whole project and may replace it by something else; no assumption is made here about that shape.

Live corpus, read with `status DECISION docs` and `show` on the six decisions of `format-save.awawa`, the hunger
question
and `UneIdentiteDeJoueurEstPorteeParLEntree` (2026-09-16, review pass): **none of the six is a fact** — each carries two
or three substantive `REJECTED` (BigInt, textual post-processing, a second parser…) and `SPEC › IMPL` to code, two also
to `docs/game-rules.md`; findings §3's « six entities pay a fictional `REJECTED` » is not what the tool shows. They stay
`DECISION`s. **0 entities to retype**; the facts are sentences in the prose of five decisions and one question, written
as entities at migration:

| Fact                                                                       | Extracted from                                          | `ATTESTED_BY` probable            |
|----------------------------------------------------------------------------|---------------------------------------------------------|-----------------------------------|
| a save has 11 sections indexed 0–10, the last one reserved and empty       | `UneSaveCompteOnzeSectionsIndexeesDeZeroADix`           | `save-file.schema.json`           |
| a section line is one JSON entry                                           | `UnFormatDEntreeNAQuUnAnalyseur`                        | fixtures                          |
| the player identifier exceeds a double's exact range; the only int64 field | `UnIdentifiantInt64EstPorteParSonTexteDecimal`          | the round-trip test               |
| float fields carry a `.0` suffix; records are flat                         | `LeSuffixeDesFlottantsEstAppliqueALEmission`            | fixtures                          |
| a player identifier is a Steam account the game reuses across games        | `UneIdentiteDeJoueurEstPorteeParLEntree`                | none (a game fact)                |
| an animal's hunger level lies between −100 and 100 — a hypothesis          | `LesBornesDeHungerSontPoseesSurUneHypothese` (question) | none: `BASIS hypothesis`, `UNTIL` |

The two `RATIONALE.REF` edges recorded under `DECISION` cite decisions, not facts (the hunger question cites the
schema-rule decision, the float-check decision cites the float-suffix decision): they stay `RATIONALE › REF`, none
becomes `RESTS_ON`. The hunger question becomes a `FACT` and its `BLOCKS @PACKAGE` line goes (one of the 10 of point
(b)).

Ratified 2026-09-16 (point 22, `BASIS` row included):

| Field name  | Role                                                                                                                                                                                               | Accepted values           | Is repeatable | Is required                                              |
|-------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------|---------------|----------------------------------------------------------|
| DESC        | the statement; the one type where `DESC` is always written; redeclared on the type with `REQUIRED` (shadows `SCHEMA *`)                                                                            | string                    | no            | yes, gated: error while active, suppressed once archived |
| DESC › REF  | an entity the statement mentions                                                                                                                                                                   | reference                 | yes           | no                                                       |
| BASIS       | `attested` (`DEFAULT`, not written) or `hypothesis`; the discriminant through which « `ATTESTED_BY` or `UNTIL`, at least one » is written, the tool having no any-of requirement (defects section) | attested\|hypothesis      | no            | no (default)                                             |
| ATTESTED_BY | the fixture, test, schema or save sample that proves it; declared on the type, `REQUIRED` inside `WHEN BASIS attested`; optional on a hypothesis (partial evidence)                                | anchor                    | yes           | yes when attested                                        |
| UNTIL       | declared inside `WHEN BASIS hypothesis` only: the counter-example in prose, or the task that settles it; same word and converse as on the rulings                                                  | @TASK\|string (→ RETIRES) | no            | yes when hypothesis                                      |

No `REJECTED`, no `GAME_VERSION` (dropped 2026-09-16), no `APPLIES_TO_PACKAGE`, no `BLOCKS`. An external page is
`SOURCE` prose with `REF @URL.X` (type `URL`, point 23). A fact refuted is corrected in place or archived; before
either, `refs` lists the decisions resting on it (`GROUNDS`, the converse of `DECISION.RESTS_ON`, computed).

`DESC` is not repeatable: one fact is one statement, a second statement is a second `FACT` (a second `DESC` is L010
under the target's `SCHEMA *`; the live schema makes `DESC` repeatable, which is why the six decisions carry two or
three). Only `DESC › REF` repeats.

Probed 2026-09-16 on 2.7.0 (throwaway corpora p17 = p16 + facts, p17b, p17z, p19; `lint --strict`):

| Probe                                                                                                                                                                                          | Result                                                                                                                                                         |
|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `FACT Empty` without any field, `DESC` from the wildcard only                                                                                                                                  | passes `--strict`: an empty fact is legal unless `DESC` is required on the type                                                                                |
| `FIELD DESC string REQUIRED` redeclared on `SCHEMA FACT` (p17b)                                                                                                                                | accepted, shadows the wildcard: L006 « required field DESC is absent from FACT »; an archived fact without `DESC` passes; `new FACT` prints `DESC` first       |
| a second `DESC` on a fact (p19)                                                                                                                                                                | L010 « field DESC is not REPEATABLE, but appears 2 times under FACT »                                                                                          |
| `BASIS attested\|hypothesis DEFAULT attested`, `ATTESTED_BY` under `WHEN BASIS attested` (`REQUIRED`), `UNTIL @TASK\|string CONVERSE RETIRES` under `WHEN BASIS hypothesis` (`REQUIRED`) (p19) | schema accepted; `new FACT` prints `DESC` required, `// BASIS attested` and both `WHEN BASIS …: … (required)` lines                                            |
| attested fact: `DESC` + `ATTESTED_BY`, no `BASIS` written                                                                                                                                      | clean: the `DEFAULT` is read by the `WHEN`                                                                                                                     |
| attested fact without `ATTESTED_BY`                                                                                                                                                            | L006 « required field ATTESTED_BY is absent from FACT »                                                                                                        |
| `BASIS hypothesis` + `UNTIL "…"`, or `UNTIL @TASK.T1`                                                                                                                                          | clean; `refs @TASK.T1` lists the `FACT … UNTIL` site with the rulings' and limitations' `UNTIL`                                                                |
| `BASIS hypothesis` + `ATTESTED_BY`; attested + `UNTIL` (p19, both fields `WHEN`-only)                                                                                                          | L003 « field … is not declared on FACT », both ways: exactly one, stricter than asked                                                                          |
| p20: `ATTESTED_BY` declared on the type, `REQUIRED` under `WHEN BASIS attested`; `UNTIL` under `WHEN BASIS hypothesis` only                                                                    | a hypothesis with `ATTESTED_BY` and `UNTIL` passes; attested without `ATTESTED_BY` is L006; attested with `UNTIL` is L003: « at least one », the retained form |
| archived hypothesis without `UNTIL` nor `DESC`                                                                                                                                                 | clean (`REQUIRED` gated by the wildcard)                                                                                                                       |
| `status FACT --where BASIS==hypothesis`                                                                                                                                                        | selects the explicit ones; the default stays invisible to `--where`, as for `STATUS`                                                                           |
| `ATTESTED_BY "fixtures/save.json::\"sections\""`                                                                                                                                               | L016 resolves the literal inside a JSON fixture; a missing path is L016                                                                                        |
| `status FACT --where ATTESTED_BY==src/merge.ts::mergeSaves`                                                                                                                                    | selects (top-level anchor field, exact value)                                                                                                                  |
| `RESTS_ON @FACT.Refuted` (archived) from an active decision                                                                                                                                    | `--strict` clean; `context @DECISION.Full` footer `// suppressed: @FACT.Refuted`; `status FACT` counts `GROUNDS 1` on the archived fact                        |
| `context @FACT.X`, `refs @FACT.X`                                                                                                                                                              | footer `GROUNDS (root, 1): @DECISION.Full`; `refs` lists the `RESTS_ON` site                                                                                   |
| `SCHEMA FACT` declared, zero entities (p17z)                                                                                                                                                   | `lint --strict` clean, `status FACT` prints `FACT (0)`: a declared type with no entity costs nothing                                                           |
| `SOURCE "https://…/Save_file#Sections"` as a plain string                                                                                                                                      | passes: a URL with `#` is an ordinary string — replaced by `REF @URL.X` (point 23)                                                                             |

### OPEN_QUESTION

Membership: a project-level point left undecided **on which a task waits**. Archived by the pull request that rules
it; the ruling does not cite it (its provenance is the `PULL_REQUEST` under `SOURCE › REF`), and it is purged after
the delay. The alternatives are examined against the code of the day by the session that rules, and become the
`REJECTED` lines of the decision: the question stores the stake and the evidence (`RATIONALE`), never a candidate
answer.

Ratified 2026-09-16 (point 24):

| Field name | Role                                                                                                   | Accepted values      | Is repeatable | Is required                                              |
|------------|--------------------------------------------------------------------------------------------------------|----------------------|---------------|----------------------------------------------------------|
| DESC       | the question, one statement; redeclared on the type with `REQUIRED` (shadows `SCHEMA *`, as on `FACT`) | string               | no            | yes, gated: error while active, suppressed once archived |
| DESC › REF | an entity the question mentions; a challenged decision is reached this way                             | reference            | yes           | no                                                       |
| BLOCKS     | the task that cannot proceed until it is ruled                                                         | @TASK (→ BLOCKED_BY) | yes           | yes, gated as above                                      |

No `PURGE` of its own (point 31): the wildcard's default is `true`, so a ruled question is purged after the delay
without a shadow (the `PURGE DEFAULT true` row of point 24 is absorbed by the wildcard).

No `RECOMMENDATION` (dropped 2026-09-16, with its nested `REF` and `REJECTED`): a recommendation stored with the
question was once ratified unverified; without the field, the session that rules re-examines what is right to do
against the code of that day. The recording threshold of point 6 — « a question is recorded only if a task is blocked
on it » — is therefore one required field, checked by the tool (L006), no longer a sentence of the review skill; its
second clause (« or a recommendation waits for ratification ») goes with the field. No `BLOCKS` to a decision or a
package (point (b) closed): a decision the answer would amend is `DESC › REF`, and `context` on that decision prints
the question in its `referenced by` footer line without a typed field; a package is carried by the `LIMITATION` or
the `FACT` the question turns out to be. Name: `pascal` from `SCHEMA *`, shorter than today (`status` prints names
only; a numbered identifier is read by nobody in a listing, unlike a task number the user knows). « What the answer
changes » goes in `RATIONALE`; a second statement is a second question (L010).

Live corpus, read with `status OPEN_QUESTION docs` and `show` on the 20 `specified` questions (2026-09-16; 41
`superseded`, against 21/40 in findings): **0 block a task**, 7 block a decision (the one the answer would amend), 7
block a package (8 edges), 6 block nothing; 9 carry a `RECOMMENDATION`, each with `REJECTED` under it (the live schema
requires it there); 2 to 3 `DESC` each. None survives as an `OPEN_QUESTION` under the table above; each is retyped
or dropped at migration:

| Live question (abridged)                                                                                         | Target                                                                                                                                                   |
|------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------|
| NomDeDossierAvecArobase (a pinning test under `SPEC › IMPL`)                                                     | `LIMITATION`, `SEEN_IN` the test, `APPLIES_TO_PACKAGE core_mapping`                                                                                      |
| LAuditDeSecuriteRouge, LaPolitiqueDeContenu, LaVentilationParMachine, LesLibellesDeSection, UnCaractereDecoratif | `LIMITATION` (`UNTIL` task or condition), package from the `BLOCKS` line where one exists                                                                |
| WoIdsNEstAttestee, LesBornesDeHunger (point 22), LeLienEntreEpaveEtPortail                                       | `FACT`, `BASIS hypothesis`, `UNTIL` the counter-example                                                                                                  |
| LesAlertesDependabot                                                                                             | a `TASK` (`DEP` prefix, no `PR` if the gesture is manual); nothing recorded after it, or a `DECISION` anchored on the workflow if the audit is scheduled |
| LesReglesDeCirculation                                                                                           | nothing if the `~/.ai` pull request has merged (to verify at migration); else a `PROCESS` with `UNTIL "the pull request merges"`                         |
| the 7 « general rule or project rule » questions blocking a decision, UneSaveSansJoueur, and the rest            | not carried over: no task waits, and a general rule lives in no project record                                                                           |

Probed 2026-09-16 on 2.7.0 (throwaway corpus p21 = p20 + `SCHEMA OPEN_QUESTION` above, `lint --strict` clean):

| Probe                                                                       | Result                                                                                                                                                                                    |
|-----------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| question without `DESC`; two `DESC`                                         | L006 « required field DESC is absent from OPEN_QUESTION »; L010                                                                                                                           |
| question without `BLOCKS`                                                   | L006 « required field BLOCKS is absent from OPEN_QUESTION »: the recording threshold, run by the tool; an archived question without either passes `--strict`                              |
| `BLOCKS @DECISION.Full`, `BLOCKS @PACKAGE.X`                                | L009 « field BLOCKS expects @TASK »                                                                                                                                                       |
| `BLOCKS @TASK.T2` (implemented), archived question with a dangling `BLOCKS` | both pass `--strict`                                                                                                                                                                      |
| `@DECISION.Full` in `DESC` prose without `REF`                              | L025                                                                                                                                                                                      |
| `context @TASK.T1`, `status TASK`, `--where BLOCKS==@TASK.T1`               | footer `BLOCKED_BY (root, 2)`; `incoming 5 (BLOCKED_BY 2, GOVERNED_BY 1, RETIRES 2)`; selects                                                                                             |
| `context @DECISION.Full` with a question citing it under `DESC › REF`       | footer `referenced by (root, 3): … @OPEN_QUESTION.Recommended`; `refs` lists the `DESC.REF` site: a challenged decision needs no typed edge                                               |
| `context @OPEN_QUESTION.X` citing a decision                                | 7 entities, 32 lines (the decision and its neighbourhood); `--depth 1` 3 entities, 20 lines                                                                                               |
| decision → archived question by `DESC › REF`; then the question deleted     | `--strict` clean, footer `suppressed: @OPEN_QUESTION.Ruled`; L004 once deleted: the pass would delete the `REF` line and leave the prose orphaned — the ruling does not cite the question |
| `PURGE DEFAULT true` shadowed on the type                                   | `new` prints `// PURGE true`; `--where STATUS==archived --where PURGE!=false` lists the archived question without `PURGE`, not the one at `PURGE false`                                   |
| `RECOMMENDATION › REJECTED` `REQUIRED` (before the field was dropped)       | L006 « … absent from OPEN_QUESTION.RECOMMENDATION » only when a recommendation exists; `--skip reasoning` dropped it (`1 field on @OPEN_QUESTION.X`); `REJECTED ""` passed                |
| `new OPEN_QUESTION Foo`                                                     | two required lines: `DESC`, `BLOCKS`                                                                                                                                                      |

### TASK

The planning pivot: `OPEN_QUESTION.BLOCKS`, `DECISION.APPLIES_TO_TASK` and the fix of a `LIMITATION` all point at it.
The only type with a lifecycle.

Current schema, read with `awawa show @TASK docs`, `awawa show @FIELDSET.Blocage docs`,
`awawa show @SHAPE.task_name docs`
and `awawa status TASK docs` on 2026-09-16 (12 tasks: 11 `implemented`, 1 `specified`; incoming edges `BEFORE`,
`BLOCKED_BY` from questions, `GOVERNED_BY` from `DECISION.APPLIES_TO_TASK`):

| Current field                                                                                     | Fate                                                                                                 | Reason                                                                                                                                                                                                                              |
|---------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `NAME task_name` `(T\|DEP)[0-9]+_[A-Z][A-Za-z0-9]*(:v[0-9]+)?`                                    | replaced by `NAME task_id`                                                                           | the name is the identifier, `TITLE` takes the PascalCase part; no `:vN` (C1); the prefix is the Conventional Commits type of the task, the number one global sequence (point 26)                                                    |
| `STATUS` from `SCHEMA *` (`draft\|specified\|implemented\|superseded`)                            | shadowed by `draft\|todo\|implemented\|archived`                                                     | `specified` renamed `todo`: it names a task to do, not a written spec; `superseded` becomes `archived` (C1); `draft` redefined: written, not ratified by the user (point 25)                                                        |
| `SPEC string` + `IMPL anchor` from `SCHEMA *` (2 to 10 `SPEC`, 3 to 19 `IMPL` on every live task) | kept, declared on the type; `IMPL` required once `implemented`                                       | `SPEC` is the acceptance criterion; `IMPL` is where it is proven, written at delivery (point 25)                                                                                                                                    |
| `DESC`, repeatable (7 of 12 tasks carry two)                                                      | one `DESC` (wildcard, L010)                                                                          | the six second `DESC` read on 2026-09-16: 2 restate a `SPEC`, 1 restates a computed `BEFORE` edge, 1 is a `RATIONALE`, 2 are commit plans — which is what `DESC` is for; no field to add (point 25)                                 |
| `BLOCKS reference` via `INCLUDE @FIELDSET.Blocage` (→ `BLOCKED_BY`)                               | dropped, fieldset removed                                                                            | used once (`T45 BLOCKS @PACKAGE.core_mapping`): a task that blocks a task is that task's `AFTER`; a task that blocks a package is what `APPLIES_TO_PACKAGE` on its decisions says; `BLOCKS` is declared on `OPEN_QUESTION` only     |
| `AFTER @TASK`, repeatable, `CONVERSE BEFORE`                                                      | kept                                                                                                 | the ordering the wave planner reads; `context` follows it                                                                                                                                                                           |
| `WAVE string`                                                                                     | kept                                                                                                 | the wave of the plan; a string, no shape: a wave is named by the plan, not validated                                                                                                                                                |
| `PR string`, repeatable (`"62"` and `"#90"` today; T37 carries two)                               | replaced by `DELIVERED_BY @PULL_REQUEST` (→ `DELIVERS`), not repeatable, required once `implemented` | a task is one pull request (live decision, PR #69), now checked by L010 and L006 instead of remembered; a task delivered without a pull request is outside the corpus by nature; a reopened pull request does not happen (point 25) |
| two `DESC` on the schema entry                                                                    | one `DESC`                                                                                           | the second described the ladder; the `WHEN` blocks and the `STATUS` `DESC` say it now                                                                                                                                               |
| —                                                                                                 | `TITLE` added                                                                                        | the readable name the identifier no longer carries                                                                                                                                                                                  |

Target:

Ratified 2026-09-16 (points 25 and 26):

| Field name   | Role                                                                                                                                                                                         | Accepted values                    | Is repeatable | Is required                     |
|--------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------|---------------|---------------------------------|
| TITLE        | what the task delivers, in one line                                                                                                                                                          | string                             | no            | yes                             |
| STATUS       | draft: written, not yet ratified by the user, the wave planner ignores it; todo: ratified, ready to start; implemented: merged; archived by the cleanup pass once no todo task is `AFTER` it | draft\|todo\|implemented\|archived | no            | yes                             |
| SPEC         | one acceptance criterion: what is observable once the task is delivered; it says nothing of how                                                                                              | string                             | yes           | yes                             |
| SPEC › IMPL  | where the criterion is proven — the test or the code; written at delivery, never prose; L016 resolves it                                                                                     | anchor                             | yes           | yes once `implemented` (`WHEN`) |
| AFTER        | the task that must merge before this one; the reverse edge `BEFORE` is computed                                                                                                              | @TASK (→ BEFORE)                   | yes           | no                              |
| WAVE         | the wave of the plan it belongs to, a number written bare (`WAVE 4`; `"4"` is L007)                                                                                                          | uint                               | no            | no                              |
| DELIVERED_BY | the pull request that delivers it; one task is one pull request (L010); a task delivered without one is outside the corpus by nature                                                         | @PULL_REQUEST (→ DELIVERS)         | no            | yes once `implemented` (`WHEN`) |

| Condition field (WHEN) | Condition value | GATE       | Require field                 |
|------------------------|-----------------|------------|-------------------------------|
| STATUS                 | draft           | error      | —                             |
| STATUS                 | todo            | error      | —                             |
| STATUS                 | implemented     | error      | SPEC › IMPL, DELIVERED_BY     |
| STATUS                 | archived        | suppressed | ARCHIVED_ON (from `SCHEMA *`) |

`draft` is gated `error` like `todo`: a draft task is lint-clean and committable, and lives in the corpus until the
user ratifies it by writing `todo`; the only reader that tells them apart is the wave planner, which launches
`--where STATUS==todo`. The previous definition (« being written, may point at entities not yet there », gate
warning) could not survive `lint --strict` after every edit; two linked tasks are written in the same edit. A
`RATIFIED_ON` field instead was refused: `--where` has no presence test. `TASK` redeclares `PURGE true|false` with
`DEFAULT true` **at type level**, the only type to do so (point 31): the pass archives a task unattended, so
`PURGE false` (keep it) is written while the task is still active; on every other type the field is legal once
archived only.

Archiving a task is the cleanup pass's job, not the merging pull request's: a task is `implemented` at merge and
archived once `status TASK --where STATUS!=implemented --where STATUS!=archived --where AFTER==@TASK.X` returns
nothing (one command, probed p36d; the `todo`-only form of point 25 missed a `draft` task `AFTER` it — amended,
point 31), the pass writing `ARCHIVED_ON` that day; the purge follows 30 days later. On an `implemented` task the
pass also reads `refs --json` (each site carries the source's `status`): an active entity whose `UNTIL` names the
task is archived by the pass (the entity wrote its own end), an active question whose `BLOCKS` names it is
reported, never archived (a judgement).

Probed on 2.7.0 (throwaway corpus, 2026-09-16) with the `SCHEMA *` and `TASK` above: the wildcard's `WHEN STATUS
archived` requirement fires on a `TASK` whose `STATUS` is shadowed (L006 on an archived task without `ARCHIVED_ON`,
no `WHEN` to repeat on `TASK`); `NAME task_id` shadows `pascal` (`T1`..`T4` lint clean); a `draft` task with a
dangling `AFTER` is a warning, an error under `--strict`; `status TASK --where STATUS==todo` selects;
`context` on a `todo` task expands its `draft` dependency and lists the dangling target as `unresolved`;
`new TASK` prints `TITLE`, `STATUS`, `AFTER`, `WAVE`, `PR`, `DESC`, `ARCHIVED_ON` and the conditional requirement.

Live corpus, read with `status TASK docs` and `show` on the 12 tasks (2026-09-16, this entity's review): `lint` from
the repository root is clean (235 entities; `lint docs` reports 84 L016 because the workspace is narrower than the
anchors, as the tool's help says). Every task carries `SPEC` (2 to 10) with `IMPL` (3 to 19), the anchors of T45
(`specified`) resolve; `RATIONALE` 2 to 7 with `REF @DECISION`; `WAVE "4"` on 10; `PR` on 11, written `"62"` and
`"#90"`, two on T37; `AFTER` on 10; `BLOCKS @PACKAGE` once (T45); `SOURCE` on 4 (« revue de la PR #15, fil … »).
Reading cost: `context @TASK.T45 --depth 1` is 196 lines (its three `RATIONALE.REF` decisions open), 68 with
`--skip reasoning`; T37 is 56 lines, one entity.

Probed 2026-09-16 at this entity's review (throwaway corpus p22 = p21 + the `TASK` target, variants pa–pk,
`lint --strict`):

| Probe                                                                                            | Result                                                                                                                                                                                                                                                                                                         |
|--------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `FIELD WAVE uint`: `WAVE 4`, `WAVE "4"`, `WAVE "four"`                                           | 4 passes; `"4"` and `"four"` are L007; `--where WAVE==4` selects (the quoted one too: textual comparison); `new` prints `// WAVE uint`                                                                                                                                                                         |
| `SPEC` on a task, not declared on the type                                                       | L003: the wildcard no longer carries it                                                                                                                                                                                                                                                                        |
| `SPEC` + `IMPL` declared on `TASK`, `IMPL` `REQUIRED` redeclared under `WHEN STATUS implemented` | a todo `SPEC` without `IMPL` passes; an implemented one is L006 « required field IMPL is absent from TASK.SPEC »; the `WHEN` redeclaration must repeat `REQUIRED`/`REPEATABLE` on `SPEC` or it is L021 (monotonic); `new` prints « WHEN STATUS implemented: SPEC (required) » without naming the nested `IMPL` |
| todo task with `IMPL` to a file not yet written                                                  | L016 error (gate error); a draft was a warning under the old gate, an error under `--strict`: `IMPL` is written at delivery                                                                                                                                                                                    |
| `DELIVERED_BY @PULL_REQUEST` (→ `DELIVERS`), `PULL_REQUEST 62` with `PROJECT @PROJECT.X`         | clean; `refs @PULL_REQUEST.62` lists the task's `DELIVERED_BY` and a decision's `SOURCE.REF`; `status PULL_REQUEST` counts `DELIVERS 1`; `context @TASK.T2 --depth 1` 2 entities, 7 lines; `--where DELIVERED_BY==@PULL_REQUEST.62` selects; a second line is L010                                             |
| `PR` (or `DELIVERED_BY`) `REQUIRED` under `WHEN STATUS implemented`                              | L006 on the implemented task without one; `new` prints « WHEN STATUS implemented: PR (required) »                                                                                                                                                                                                              |
| todo task `AFTER` an implemented and an archived task                                            | clean; `context` footer `suppressed: @TASK.T0`; `status TASK --where STATUS==todo --where AFTER==@TASK.T2` lists the waiting task, empty on a task nothing waits on: the archive test of the pass                                                                                                              |
| `refs --json @TASK.T2`                                                                           | each site carries `from.status` (`"todo"`, `null` when omitted: the default invisible again)                                                                                                                                                                                                                   |
| `TITLE ""`                                                                                       | passes (defect already recorded)                                                                                                                                                                                                                                                                               |
| wildcard `PURGE` inside `WHEN STATUS archived` only, `TASK` `PURGE` at type level                | an active task with `PURGE false` passes; `new` prints both `// PURGE true` and the `WHEN` line; reread at step 13: ratified (point 31)                                                                                                                                                                        |
| clean draft / draft with a dangling `AFTER` (gate warning)                                       | 0 diagnostic / L004 warning, error under `--strict`: nothing distinguishes a clean draft from a todo but the planner                                                                                                                                                                                           |
| `context @TASK.T1` (todo, 6 incoming edges: blocked by 3, governed by 1, retires 2)              | 1 entity, 3 lines at any depth: `context` expands outgoing edges only; a task's package (blockers, rulings, what it retires) is its footer, read by `refs` then one `show` per entity; no edge is flipped for that                                                                                             |
| `status TASK --where NAME==FEAT1`                                                                | « `NAME` is not a field »: no listing by name prefix, `status TASK` + grep                                                                                                                                                                                                                                     |
| shape `(FEAT\|FIX\|CHORE\|DOCS\|CI\|BUILD\|REFACTOR\|TEST\|PERF)[0-9]+`                          | compiles; `@TASK.FIX2` resolves, `new TASK FIX9`                                                                                                                                                                                                                                                               |

**The name is the identifier**: `NAME task_id`, shape
`(BUILD|CHORE|CI|DOCS|FEAT|FIX|PERF|REFACTOR|REVERT|STYLE|TEST)[0-9]+`; the prefix is the Conventional Commits type
of the task, the number is one global sequence continuing today's (`T45` becomes `FIX45`, the next task is 46), `TITLE`
carries the readable name. Every reference (`@TASK.FIX45`) is what the user already says aloud, and stays valid whatever
`TITLE` becomes. No `KIND` field on `TASK`: it would restate the prefix.

#### Kind of task (ratified 2026-09-16, point 26)

The user asked for sub-categories (feature, bug, chore). Three forms, measured against the tool:

| Form                                          | For                                                                                                                                     | Against                                                                                                                                                                                                                      |
|-----------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| types `FEATURE`, `BUG`, `CHORE`               | `status FEATURE` lists one kind                                                                                                         | every planning edge is typed `@TASK` (`AFTER`, `BLOCKS`, `UNTIL`, `APPLIES_TO_TASK`, `DELIVERED_BY`'s converse) and a slot names one reference type (L020): three copies of every edge field; same shape, so not a type (C3) |
| field `KIND feat\|fix\|chore`                 | `--where KIND==fix`; `new` prompts it; a task changes kind by editing one line                                                          | invisible in a citation (`@TASK.T46` says nothing), one more line per task, `KIND` refused twice already for restating a name                                                                                                |
| name prefix (today's `T\|DEP\|AWA`, extended) | the kind is in every citation, branch and pull request title; the set is closed by the shape (a wrong prefix is L024); no line to write | no `--where` on the name (listing + grep); a task that changes kind is renamed (`fmt --rename`, one command, every site rewritten)                                                                                           |

Ratified: the prefix, with the **eleven Conventional Commits types** as the set — the pull request title must carry
one already (commands.md, checked by `conventional-commits.yml`), so task and pull request say the same word: `build`,
`chore`, `ci`, `docs`, `feat`, `fix`, `perf`, `refactor`, `revert`, `style`, `test`, upper-cased in the name. `DEP`
becomes `CHORE` (the type of a Dependabot pull request), `AWA` becomes `DOCS`. Numbering, the global sequence
ratified:

| Numbering                                 | For                                                                                                                                                                                                                  | Against                                                                                                                                                                          |
|-------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| one global sequence (`FEAT46`, `FIX47`)   | the number alone identifies, as « T45 » does today aloud and in branch names; a task that changes kind keeps its number (`FIX46` → `CHORE46`); the live sequence continues: T45 becomes `FIX45`, the next task is 46 | the next number is read across all prefixes (one `status TASK` glance); gaps inside each kind                                                                                    |
| one sequence per prefix (`FEAT1`, `FIX1`) | dense per kind; the last number counts the kind                                                                                                                                                                      | the prefix must always be said (`FIX3` vs `FEAT3`); a task that changes kind changes number, breaking every citation outside the corpus; `DEP3` today already collides with `T3` |

Why not `TASK` + `ARCHIVED_TASK` with an `ID` field (the alternative proposed on 2026-09-16), probed on 2.7.0:

| Need                                     | `STATUS archived` (one type)                               | `ARCHIVED_TASK` + `ID` field                                                                                                                                         |
|------------------------------------------|------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| links from other entities survive        | yes: `@TASK.DEP2` unchanged, `incoming 2` still counted    | no: `fmt --rename` refuses a type change (« --rename keeps the type »), every site is rewritten by hand, and a field typed `@TASK` refuses `@ARCHIVED_TASK.X` (L009) |
| archived tasks out of `context` and lint | yes: not expanded, named in the footer, gated `suppressed` | yes                                                                                                                                                                  |
| link checked by the tool                 | yes: L004/L009 on `@TASK.X`                                | an `ID` string is read by nothing: no L004, no `refs`, no `context`                                                                                                  |
| listing                                  | `status TASK --where STATUS==archived`                     | `status ARCHIVED_TASK`                                                                                                                                               |
| cost per archive                         | two lines (`STATUS`, `ARCHIVED_ON`)                        | a move between types plus the sites                                                                                                                                  |

### PACKAGE

Membership: a package of the monorepo. No lifecycle: active while the package exists, archived when it leaves the
workspace. It is a target, never a source: `APPLIES_TO_PACKAGE` on decisions and limitations points at it.

Current schema, read with `awawa show @PACKAGE docs`, `awawa show @SHAPE.package_name docs` and
`awawa status PACKAGE docs` on 2026-09-16 (7 packages, all `implemented`; incoming edges `GOVERNED_BY` from
`APPLIES_TO_PACKAGE` and `BLOCKED_BY` from questions and one task):

| Current field                                                               | Fate                | Reason                                                                                                                                                                                  |
|-----------------------------------------------------------------------------|---------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `NAME package_name` `(core\|util\|cli\|ui\|shared)(_[a-z0-9]+)+(:v[0-9]+)?` | kept, `:vN` dropped | the real name, underscore where the manifest has a hyphen; no versions (C1)                                                                                                             |
| `PREFIX core\|util\|cli\|ui\|shared`, required                              | dropped             | restates the first segment of the name, the reason that refuses `KIND` on `TASK`; the prefix → allowed dependencies table lives in the instructions, and `status PACKAGE` lists by name |
| `STATUS implemented` from `SCHEMA *`                                        | dropped             | no ladder (C2): `implemented` on all 7 carried no information; a removed package is archived                                                                                            |

Live corpus, read with `show` on the 7 packages and `refs` (2026-09-16, this entity's review): every package carries
`SPEC › IMPL` from the wildcard, 8 `SPEC` in all — 6 anchor `packages/<name>/package.json::<name>` (the manifest, under
the wrong field), 1 anchors `src/application/responses` (core_mapping, one Response per file), 1 anchors `fallow.toml`
(ui_save_manager, out of the quality perimeter). All 8 are obligations, not descriptions: ~5 are rulings on exports and
perimeter (core_mapping ×2, ui_save_manager, shared_platforms, shared_save_processing) and become `DECISION`s with
`APPLIES_TO_PACKAGE`; 3 restate the prefix → dependencies table of the instructions (cli_merge, cli_validate,
util_types) and are not carried over. core_mapping carries two `DESC`, the second restating a `SPEC` (L010 under the
target); 2 `SOURCE` (« T28, PR #59 », « décision du 2026-09-03, question Q5 ») and 1 `RATIONALE` follow the ruling
they justify. Incoming today: 63 `GOVERNED_BY` on 3 packages, 11 `BLOCKED_BY` (10 questions, 1 task) that leave with
point 24; `LIMITED_BY` arrives with the limitations.

Ratified 2026-09-16 (point 27):

| Field name | Role                                                                                                                                                                                                                   | Accepted values | Is repeatable | Is required                                              |
|------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------|---------------|----------------------------------------------------------|
| DESC       | what the package does, in one line — its reason to exist, kept in the entity by principle; redeclared on the type with `REQUIRED` (shadows `SCHEMA *`, as on `FACT` and `OPEN_QUESTION`)                               | string          | no            | yes, gated: error while active, suppressed once archived |
| DESC › REF | an entity the line mentions                                                                                                                                                                                            | reference       | yes           | no                                                       |
| MANIFEST   | the package manifest, path **and** literal: `packages/core-mapping/package.json::core-mapping`; L016 says when the package left the workspace (path) and when its manifest name no longer matches the entity (literal) | anchor          | no            | yes, gated as above                                      |

No `PREFIX`, no `STATUS` of its own, no `KIND`, no dependency field (the manifest and the instructions' table carry
them). `MANIFEST` is what the live corpus already writes on 6 packages under `SPEC › IMPL`, given its own field now
that `SPEC` leaves the wildcard: the anchor is the only link from the entity to the workspace, and a removed package is
L016 the day it leaves, without waiting for the case. The `::` literal is a raw text search (`::"name": "core-mapping"`
works too), so it also proves the `_`/`-` mapping the defects section wanted to keep in a `DESC`. A package renamed in
its manifest is `fmt --rename`, one command (probed: 2 sites rewritten; a name outside the shape is refused by L024).

Probed 2026-09-16 on 2.7.0 (throwaway corpora p23 = p22 + the `TASK` target + `PROJECT`/`PULL_REQUEST` stubs, pv1–pv6,
p24 = the table above, `lint --strict` clean):

| Probe                                                                              | Result                                                                                                                                                                                                   |
|------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| shape `(core\|util\|cli\|ui\|shared)(_[a-z0-9]+)+` on `NAME`                       | `core_mapping`, `cli_merge`, `core_mapping_v2` pass; `core`, `CoreMapping`, `core_mapping:v2`, `Core_mapping` L024; `core-mapping` L017 (not an identifier)                                              |
| `SPEC`, `PREFIX`, second `DESC` on a package                                       | L003, L003, L010: the wildcard carries none of them                                                                                                                                                      |
| `new PACKAGE core_x`                                                               | two required lines, `DESC` first then `MANIFEST`; before point 27, zero                                                                                                                                  |
| package without `DESC`                                                             | L006 « required field DESC is absent from PACKAGE »; archived without `DESC` nor `MANIFEST`: `--strict` clean (gated)                                                                                    |
| `MANIFEST "packages/cli-merge/package.json"` with the folder absent                | L016 « anchor path … does not exist under the workspace root »: the removed package, on the entity                                                                                                       |
| `MANIFEST "…/core-mapping/package.json::cli-merge"` (path present, literal absent) | L016 « `cli-merge` does not occur in ./packages/core-mapping/package.json »: the renamed package                                                                                                         |
| `--where MANIFEST==packages/core-mapping/package.json::core-mapping`               | selects (top-level anchor, exact value)                                                                                                                                                                  |
| `status PACKAGE`                                                                   | `(none)` on the active ones, `archived` on the archived one, `incoming 2 (GOVERNED_BY 1, LIMITED_BY 1)`; `--where STATUS!=archived` lists the active ones                                                |
| `context @PACKAGE.core_mapping`                                                    | 1 entity, 2 lines at any depth; footer `GOVERNED_BY (root, 1)`, `LIMITED_BY (root, 1)`: a package reads as `refs` then `show`, like `TASK`                                                               |
| active decision `APPLIES_TO_PACKAGE` an archived package                           | `--strict` clean; `context` on the decision: footer `suppressed: @PACKAGE.ui_save_manager`                                                                                                               |
| `fmt --rename @PACKAGE.core_mapping @PACKAGE.core_map`; `… @PACKAGE.CoreMap`       | 2 sites rewritten in 1 file; refused « misses shape package_name … (L024) »                                                                                                                              |
| `PULL_REQUEST 62` under `NAME pascal` of `SCHEMA *` (stub for p23)                 | L024 « name 62 misses shape pascal »: the earlier « `PULL_REQUEST 62` is a valid name » held without the wildcard's `NAME`; the type needs its own `NAME` shape — settled at step 10 (`pr_id`, point 28) |

### Archive et suppression

Ratified 2026-09-16 (point 31):

| Rule                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | Home                                                                                                                   |
|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------|
| An entity that stops binding is archived in the pull request that ends it: `STATUS archived`, `ARCHIVED_ON` that day                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | `PROCESS` (nothing in the repository anchors it)                                                                       |
| A ruling replaced on the same subject is rewritten in place under its name; the previous form is a `REJECTED` line when it teaches something                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | the `DESC` of `REJECTED` in the schema already says it; no entity                                                      |
| Deleted at once, by hand: an entity that should never have been recorded (see the recording threshold, point 6)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | `PROCESS`, with the threshold                                                                                          |
| `ARCHIVED_ON` and `PURGE` are declared inside `WHEN STATUS archived` of `SCHEMA *` only: an active entity carrying either is L003; `TASK` alone redeclares `PURGE` at type level (written before the unattended archive)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | `SCHEMA *`                                                                                                             |
| `PURGE DEFAULT true`: archived means no longer needed; `PURGE false` keeps an archived entity indefinitely                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | the `DESC` of `PURGE` in the schema                                                                                    |
| The delay: 30 days from `ARCHIVED_ON`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | the `DECISION` below (a constant in the script, anchored)                                                              |
| The cleanup pass is **a script declared in `package.json`, run by the user when they want** — no schedule, the cleanup is not urgent; it works on a branch and opens a pull request whose body is its report, like Dependabot; nothing to do → no pull request, no output                                                                                                                                                                                                                                                                                                                                                                                                                                                     | a `DECISION`, `SPEC › IMPL` on `package.json::<script name>` and on the script; the script name is chosen at migration |
| The pass, in order: (0) `fmt --check` and `lint --strict` clean, otherwise it stops and reports; (1) archive every `implemented` task no `draft`/`todo` task is `AFTER`, and every active entity whose `UNTIL` names an `implemented` task; (2) purge, entity by entity, atomically: archived, `PURGE` true (written or default), `ARCHIVED_ON` + 30 days past — `refs --json` lists the reference lines, they are deleted, then the block, then `lint --strict`; on failure the entity is restored and reported; (3) delete every `PULL_REQUEST` and `USAGE_REPORT` at `incoming 0`, looping until none is left (a report's deletion frees its pull request); never a `PROJECT`; (4) `fmt` + `lint --strict`; (5) the report | same decision                                                                                                          |
| What it reports: the tasks and entities archived; the entities purged with the reference lines removed (`@DECISION.Live APPLIES_TO_TASK`); the sources deleted at `incoming 0`; what it kept and why (`PURGE false`, delay not run, purge would break lint — with the L006); the stale edges: an active question whose `BLOCKS` names an `implemented` task                                                                                                                                                                                                                                                                                                                                                                   | same decision                                                                                                          |

Values read by the pass: `status TYPE --where STATUS==archived --json` for the candidates, `show @X --json` for `PURGE`
and `ARCHIVED_ON`, `show TYPE --json` and `show @SCHEMA.* --json` for the `DEFAULT`, `refs --json` for the sites (file,
line, field path, source status), `status TYPE --json` for `incoming`. Not `--where PURGE`: see `SCHEMA *`.

Probed 2026-09-16 on 2.7.0 (throwaway corpora p36 = the whole target schema with `PURGE DEFAULT false` and an
`OPEN_QUESTION` shadow, p36b = `DEFAULT true` and no shadow, p36c, p36d, p36p, p36x; 20 entities covering each case
of the pass; `lint --strict` clean on both variants):

| Probe                                                                                                                                                                                 | Result                                                                                                                                                                                                                                                                                                                                                         |
|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| p36x: `ARCHIVED_ON` or `PURGE` on an active `DECISION`; `ARCHIVED_ON` on a `todo` `TASK` (shadowed `STATUS`); `PURGE` on an active `OPEN_QUESTION` (declared in a `WHEN` of the type) | L003 all four; an archived `TASK` without `ARCHIVED_ON` is L006 from the wildcard: point 19's refinement holds under a shadowed `STATUS` too                                                                                                                                                                                                                   |
| `WHEN STATUS archived` on `SCHEMA OPEN_QUESTION` with `FIELD PURGE … DEFAULT true`, keyed on the wildcard's `STATUS`                                                                  | accepted; but `new OPEN_QUESTION` prints two `WHEN STATUS archived` lines (the type's, the wildcard's): dropped with the `DEFAULT true` wildcard                                                                                                                                                                                                               |
| `status T --where STATUS==archived --where PURGE!=false` (the query of point 5)                                                                                                       | exit 2 « `PURGE` is not a field of OPEN_QUESTION in this workspace » until one entity of the type writes `PURGE`; same for `ARCHIVED_ON` on `LIMITATION`; once one entity writes it, the query selects (p36c, p36d). A type-level field is always known (`--where RATIONALE==x`: 0 of 3, exit 0). Defect                                                       |
| `show @X --json`, `show TASK --json`, `show @SCHEMA.* --json`                                                                                                                         | `ARCHIVED_ON` and `PURGE` values as atoms; the `DEFAULT` atom exposed at type level and inside the wildcard's `WHEN`: the pass reads the defaults from the schema                                                                                                                                                                                              |
| archived `TASK` with `IMPL "src/gone.ts::nothing"`                                                                                                                                    | `--strict` clean: `GATE suppressed` silences L016 too; an archived entity kept with `PURGE false` never rots                                                                                                                                                                                                                                                   |
| archive test of point 25, `--where STATUS==todo --where AFTER==@TASK.FIX1`                                                                                                            | 0: misses the `draft` CHORE4 `AFTER` FIX1; `--where STATUS!=implemented --where STATUS!=archived --where AFTER==@TASK.FIX1` (two `!=` cumulated) lists it                                                                                                                                                                                                      |
| `refs --json @TASK.FIX1` (implemented)                                                                                                                                                | every site carries `file`, `line`, `col`, `from.status` (`null` = active), `field_path`: exact lines to delete, and the stale `UNTIL`/`BLOCKS` in one call                                                                                                                                                                                                     |
| `status PULL_REQUEST --json`                                                                                                                                                          | `incoming` per entity: PCST90 at 0, PCST70 at 1 from an archived task, PCST80 at 1 from a `USAGE_REPORT` nothing cites                                                                                                                                                                                                                                         |
| `context @TASK.FEAT3`                                                                                                                                                                 | footer `BLOCKED_BY (root, 1): @OPEN_QUESTION.Ruled`: the **archived** question counts as blocking, its status unsaid; `refs --json` says it                                                                                                                                                                                                                    |
| p36d, archive step scripted (`status --json`, `refs --json`, one line rewritten, one inserted)                                                                                        | FEAT10 archived (`STATUS archived` + `ARCHIVED_ON`, `fmt --check` clean); FEAT2 kept (FEAT3 todo waits), FIX1 kept (CHORE4 draft waits); stale listed: `Live UNTIL → FIX1`, `Open BLOCKS → FIX1`                                                                                                                                                               |
| p36p, purge step scripted (80 lines of Python calling only `status --json`, `show --json`, `refs --json`, `lint --strict`, `fmt`)                                                     | FIX0 purged with its `AFTER` line on FEAT3; FIX5 kept (`PURGE false`); **FIX6 kept: its purge breaks lint** (L006 `UNTIL` absent from `LIMITATION.Lim`), restored and reported; Gone, Kept, Ruled purged; PCST70, PCST90, the PR80 report deleted, then PCST80 on the **second loop** (its only incoming was the report); final `fmt` + `lint --strict` exit 0 |

### Shapes

| Shape          | Matches                                                                                     | Used by                                                                                                                                              |
|----------------|---------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------|
| `pascal`       | `[A-Z][A-Za-z0-9]*`                                                                         | `SCHEMA *` `NAME`                                                                                                                                    |
| `task_id`      | `(BUILD\|CHORE\|CI\|DOCS\|FEAT\|FIX\|PERF\|REFACTOR\|REVERT\|STYLE\|TEST)[0-9]+` (point 26) | `TASK` `NAME`                                                                                                                                        |
| `package_name` | `(core\|util\|cli\|ui\|shared)(_[a-z0-9]+)+`                                                | `PACKAGE` `NAME`                                                                                                                                     |
| `date`         | `\d{4}-\d{2}-\d{2}`                                                                         | `ARCHIVED_ON`                                                                                                                                        |
| `repo`         | `[A-Za-z0-9.-]+/[A-Za-z0-9.-]+`                                                             | `PROJECT.GIT_REPOSITORY` (renamed 2026-09-16, point 28)                                                                                              |
| `url`          | `https?://[^\s"]+`                                                                          | `URL.LOCATION` (ratified 2026-09-16, point 23)                                                                                                       |
| `project_name` | `[A-Z]+`                                                                                    | `PROJECT` `NAME` (point 28): `PCST`, `AI`, `DNC`                                                                                                     |
| `pr_id`        | `[A-Z]+[0-9]+`                                                                              | `PULL_REQUEST` `NAME` (point 28): the project name then the number, `PCST62`; the tool cannot check it against the entity's fields (defects section) |
| `file_name`    | `awawa_usage_report_[A-Za-z0-9]+(_[A-Za-z0-9]+)*`                                           | `USAGE_REPORT` `NAME` (point 29): the prefix then the subject, `awawa_usage_report_PR87` in the common case                                          |

Ratified 2026-09-16 (review pass), probed on 2.7.0: the five patterns compile and discriminate (`T38b`, `Foo`, `core`,
`2026-9-16`, `"16/09/2026"`, `no-slash`, `a/b/c` refused; L007/L024 are gated, so an error on an active entity). The
`_` of `package_name` is imposed by the tool: a hyphen is not an identifier (`core-mapping` is L017), see the defects
section. Dropped: `game_version` (`FACT` carries no version, ruled 2026-09-16). `pr_id` was dropped the same day (no
invented
alias) and reinstated at the `PULL_REQUEST` review with another meaning: not an alias, the `PROJECT` name followed by
the number, because a name is unique per type and two projects share their numbers (point 28). Probed on 2.7.0 (p32):
`PCST62`, `AI12`, `DNC7` pass; `PCST_1`, `Pcst2` and a project `DO_NOT` are L024. `file_name` added at the
`USAGE_REPORT`
review (point 29), probed on p34.

### File layout (awawa-project-methodology)

Ratified 2026-09-16 (point 32):

| File                                                                                                                              | Holds                                                                                                                                                       |
|-----------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `_schema.awawa`                                                                                                                   | every declaration: `SCHEMA *`, the nine shapes, `FIELDSET Ruling`, the eleven `SCHEMA` entries; no `SCHEMA` beside its data                                 |
| `decisions.awawa`, `processes.awawa`, `limitations.awawa`, `facts.awawa`, `open_questions.awawa`, `tasks.awawa`, `packages.awawa` | one file per type, named by the type in lower case, plural; the entities of that type only, in order of appearance: a new entity is **appended at the end** |
| `sources.awawa`                                                                                                                   | the four source types together: `PROJECT`, `PULL_REQUEST`, `USAGE_REPORT`, `URL`                                                                            |

No file per domain: the domain exists in no field of the target, a file name is read by no command (the corpus is read
through the tool), and choosing one was a classification decision at write time — three entities misfiled by domain in
the live corpus (two `processus` decisions anchoring product code, `RegleDuContextePrivePerdSaBarreFinale` in
`limitations`). The file follows the type, which the tool checks (L003/L006); an entity changes file only when it
changes type, which is a text edit anyway (`fmt --rename` keeps the type). A type with no entity has no file. Appending
at the end: two pull requests appending to the same file conflict at rebase (probed below), resolved by keeping both
blocks; accepted. The live ruling `@DECISION.LeCorpusEstDecoupeParDomaine` (read with `show`, 2026-09-16) chose the
domain split to spread the rebase conflicts of one `spec.awawa` and rejected « one file until 5 000 lines » for the
same reason; the per-type split spreads them as well (the wave planner writes `tasks.awawa`, a task pull request
`decisions.awawa`), without the domain judgement.

Probed 2026-09-16 on 2.7.0 (throwaway corpus p36b copied into four layouts: `one` = everything in one file, `bytype` =
`_schema.awawa` + one file per type, `bydomain` = `_schema.awawa` + three mixed files, `beside` = each `SCHEMA T` beside
its data; 34 entities, `lint --strict` and `fmt --check` clean on all four):

| Probe                                                                            | Result                                                                                                                                                                                                                               |
|----------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `status`, `context --with-schema @TASK.FEAT3`, `lint --closure @TASK.FEAT3`      | byte-identical on the four layouts (md5 equal): every command loads the whole walk, none reads by file                                                                                                                               |
| `context --with-schema @TASK.FEAT3`                                              | 4 entities, 128 lines, 113 of them schema (`SCHEMA *`, the entries of the types reached, the `SHAPE` of their fields; `NAME` shapes not appended); identical whether the schema is grouped or beside the data: `beside` buys nothing |
| `status TYPE`, `refs`, `show FILE:LINE`, `lint` output                           | the only places the file appears: `file:line` per site; `lint` groups its findings by file (one file: no grouping)                                                                                                                   |
| `show FILE`                                                                      | `one/corpus.awawa` 253 rows (the whole corpus, schema included), `bytype/tasks.awawa` 39, `beside/tasks.awawa` 81 (the schema first); live corpus: 4 870 rows over 12 files                                                          |
| `fmt --check` on a file whose entities were reversed                             | clean: **`fmt` does not order entities**, the written order is canonical (defects section)                                                                                                                                           |
| `@LIMITATION.Lim` moved to a new file (`bydomain` → `moved`)                     | `fmt --check` 0, `lint --strict` 0, **`awawa diff`: 0 added, 0 removed, 0 changed**; `refs` and `status` print the new `file:line`: a move costs the tool nothing, git one delete + add hunk                                         |
| `_schema.awawa` renamed `zz.awawa`                                               | identical output: the name means nothing to the tool, the `_` is a sort convention                                                                                                                                                   |
| `SCHEMA TASK` in two files                                                       | L005 « duplicate identity … also at `_schema.awawa:94` »: no merge across files                                                                                                                                                      |
| one-file corpus named directly (`lint one/corpus.awawa`)                         | clean, anchors resolved from its directory (the documented form)                                                                                                                                                                     |
| `git merge-file`: two branches each append an entity at the end of the same file | **conflict** (one hunk); one inserts at the top, the other at the end: clean; two files: clean by construction. The conflict is the insertion position, not the file count                                                           |
| live corpus, `status docs --json` grouped by file                                | `questions.awawa` is a per-type file already (52 questions), `packages` and `taches` carry a `SCHEMA` + `SHAPE` beside their data, `_schema.awawa` holds 4 of the 6 `SCHEMA` entries                                                 |

### Sources (proposed 2026-09-16, to review entity by entity)

`SOURCE string` held three kinds of provenance in prose. Ruled 2026-09-16: a source is an entity. A provenance with
no type yet was to be an `UNKNOWN_SOURCE` surfacing until its type exists; dropped 2026-09-16 (point 30): the missing
type is declared in the same pull request, and `SOURCE › REF` is required so the case cannot be parked in prose. Ruled
2026-09-16 (review pass): `SOURCE` stays
a `string` with a nested `REF reference`, like every prose field — a typed slot `@PULL_REQUEST|@USAGE_REPORT` is L020
(one reference type per slot), a bare `reference` checks nothing beyond existence (`SOURCE @TASK.T1` passed silently),
and one field per source type was refused. Probed: `refs @PULL_REQUEST.X` lists the sites under `SOURCE.REF`, `show`
prints the pair, L004 fires on a missing target.

A name is an identifier: `#` and a leading `.` are refused (L017, L018, L014 probed), so `.ai#12` cannot be a name;
`PCST#62` re-probed 2026-09-16 (p31): L014 and L018, the `#` splits the line in two atoms, and `refs` refuses the
target.
The repository is a field; the name is the `PROJECT` name followed by the number (point 28).

#### PULL_REQUEST

Membership: a pull request cited as the origin of an entity or as what delivers a task, in any repository the corpus
knows as a `PROJECT`. Never archived by hand: one with nothing pointing at it is deleted by the cleanup pass.

Ratified 2026-09-16 (point 28):

| Field name | Role                                                                                   | Accepted values            | Is repeatable | Is required |
|------------|----------------------------------------------------------------------------------------|----------------------------|---------------|-------------|
| PROJECT    | the repository it belongs to; L004 refuses an unknown project, so the shape lists none | @PROJECT (→ PULL_REQUESTS) | no            | yes         |
| NUMBER     | the pull request number in that repository; `--where NUMBER==62`                       | uint                       | no            | yes         |
| DESC       | the pull request title, from `gh pr view N --json title`; optional (wildcard)          | string                     | no            | no          |

Name: `NAME pr_id`, the `PROJECT` name followed by the number, `PCST62`, `AI12`, `DNC7`. The name is only the address:
the tool addresses an entity by its name and never by its fields, a name cannot be built from a field, and two projects
share their numbers, so `62` alone would be L005 the day a second project's 62 is cited. Nothing checks that the name
matches `PROJECT` and `NUMBER` (accepted 2026-09-16, defects section). `#` is not a name character.

Refused 2026-09-16, each probed on 2.7.0:

| Form                                                                     | Why refused                                                                                                                                                                                                                                   |
|--------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `NAME pr_number` `[0-9]+`, name = number, no project in it               | unique per type: a second project's 62 is L005; a segmented `Ai.12` is L024 under `[0-9]+`                                                                                                                                                    |
| segmented `PlanetCrafterSaveTools.62` (p27, p28)                         | works end to end, but the shape applies to each segment alone: `62`, `Pcst`, `Pcst.62.1`, `62.Pcst` all pass; the user did not want a dot in a name                                                                                           |
| project prefix in the name, no `PROJECT` field (p26)                     | the shape must then list the projects (`(Pcst\|Ai\|Dnc)[0-9]+`): two lists to keep aligned; no typed edge, no L004 on an unknown project                                                                                                      |
| `SCHEMA PULL_REQUEST` `EXTERNAL`, no entity (p25i)                       | zero writes, but `status PULL_REQUEST (0)`, no `DELIVERS`/`PULL_REQUESTS` converse, no title; `refs` prints the sites then exits 1; `show` refuses; `@PULL_REQUEST.Foo` passes: the shape is not checked on a reference to an external type   |
| `PROJECT @PROJECT` with `DEFAULT @PROJECT.X`, PR without the line (p25b) | accepted, `new` prints the line commented; but the `DEFAULT` line of the schema counts as a reference site (`@SCHEMA.PULL_REQUEST FIELD.DEFAULT`), the defaulted edge is invisible to `refs` and `--where PROJECT!=` lists it with the others |
| `WHEN PROJECT @PROJECT.Ai` to require a field on one project (p25c)      | accepted by lint and inert: no L006, `new` prints nothing (defect)                                                                                                                                                                            |

Probed 2026-09-16 on 2.7.0 (p25 = `SCHEMA *` + `PROJECT` + `PULL_REQUEST` + `TASK` + `DECISION`, then p29, p30, p32
with the table above; `lint --strict` clean):

| Probe                                                                                        | Result                                                                                                                                                                                                                                                        |
|----------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `PCST62` and `AI62`, same number, two projects                                               | clean; `--where NUMBER==62` lists both, `--where PROJECT==@PROJECT.AI` one                                                                                                                                                                                    |
| `refs @PULL_REQUEST.PCST62`; `context`                                                       | `DELIVERED_BY` and `SOURCE.REF` sites; footer `DELIVERS (root, 1)`, `referenced by (root, 1)`                                                                                                                                                                 |
| `status PROJECT`; `refs @PROJECT.PCST`                                                       | `incoming 1 (PULL_REQUESTS 1)` each; the project's pull requests, the edge the name alone did not give                                                                                                                                                        |
| `@PROJECT.FOO` under `PROJECT`                                                               | L004: the unknown project is refused by the field, which is why the shape lists no project                                                                                                                                                                    |
| `new PULL_REQUEST PCST93`                                                                    | two required lines: `PROJECT`, `NUMBER`; `DESC` commented                                                                                                                                                                                                     |
| `fmt --rename @PULL_REQUEST.Pcst62 @PULL_REQUEST.Pcst63`; `… @PULL_REQUEST.63`               | 2 sites rewritten; refused L024 (p26)                                                                                                                                                                                                                         |
| PR archived by hand, cited by an implemented task and a decision (p25e)                      | clean; footer `suppressed: @PULL_REQUEST.62` on both; not the mechanism retained (deleted at `incoming 0` instead)                                                                                                                                            |
| `context @DECISION.Full` with `SOURCE › REF` to the PR (p25)                                 | 4 entities, 16 lines (PR and its project expanded); `--depth 1` 3/14; `CATEGORY provenance` on `SOURCE` + `--skip provenance`: 1 entity, 4 lines, footer `skipped (provenance): @PULL_REQUEST.62 @PROJECT.PrivateContext`                                     |
| PR at `incoming 0` deleted (p25h)                                                            | clean; `status PULL_REQUEST --json` carries `incoming` per entity: the pass's criterion is one listing                                                                                                                                                        |
| `status PULL_REQUEST` with `100`, `62`, `90`                                                 | sorted as text (`100` first); harmless with the prefix                                                                                                                                                                                                        |
| `@PULL_REQUEST.AI12` under `DESC › REF` of a decision waiting on an `.ai` pull request (p26) | `refs @PULL_REQUEST.AI12` finds the waiting entity: an external dependency is indexed by a prose `REF`; no typed lifecycle edge exists (`UNTIL @TASK\|string`, `AFTER @TASK`: L020 forbids a second reference type in a slot), to revisit if the case appears |

Live corpus, measured 2026-09-16 through the tool (`show FILE --json` to find the `SOURCE` lines, then `show` per
entity): 227 `SOURCE` lines on 207 entities, 99 nested `REF` (all to decisions, tasks or questions, none to a source);
162 lines cite `PR #n`, 44 distinct numbers, **all of this repository**; 19 cite a usage report; 7 cite a review
thread (`fil NNN`); 8 cite `known-issues/*.md` and 5 « AGENTS.md privé » (the private repository); ~53 cite a date or
a task only. The pull request bodies, by contrast, do cite `.ai` and `.do-not-commit` pull requests (user, 2026-09-16):
the shape admits them from the first schema. Migration: a `SOURCE` with no pull request receives the one that
introduced the entity, found by `git log -S '<entity name>' -- docs` (probed on two decisions: merge commit `(#15)`);
a thread id is dropped, its pull request kept; ~44 entities of 3 lines.

#### PROJECT

Membership: a repository the corpus cites, as the home of a pull request or of a file. It is a target, never a source:
`PULL_REQUEST.PROJECT` and `SOURCE › REF` point at it; it knows nothing of its pull requests, `refs`, `status` and
`context` compute them under `PULL_REQUESTS`. The manual (§ schema) makes `PROJECT` « ordinary project-level
configuration, one entity in the corpus »: a starter convention, nothing the tool enforces (three entities lint clean).
The live corpus declares a `SCHEMA PROJECT` and one entity, `@PROJECT.PlanetCrafterSaveTools`, two `DESC`, `incoming 0`
(read 2026-09-16).

Ratified 2026-09-16 (point 28):

| Field name     | Role                                                            | Accepted values | Is repeatable | Is required |
|----------------|-----------------------------------------------------------------|-----------------|---------------|-------------|
| GIT_REPOSITORY | the repository on the forge, `owner/name` (renamed from `REPO`) | repo            | no            | yes         |
| DESC           | what the repository is, one line; optional (wildcard)           | string          | no            | no          |

Name: `NAME project_name`, `[A-Z]+`. Three entities from the first schema, named by the user:

| Entity | `GIT_REPOSITORY`                     | Why                                                                                                                          |
|--------|--------------------------------------|------------------------------------------------------------------------------------------------------------------------------|
| `PCST` | `delairec/planet-crafter-save-tools` | this repository; replaces `PlanetCrafterSaveTools`                                                                           |
| `AI`   | `delairec/.ai`                       | the instructions, a module of the user's IDE, with pull requests of its own; 0 lines cite one today, the bodies do           |
| `DNC`  | `delairec/.do-not-commit`            | the private context (`git remote` read 2026-09-16); 13 `SOURCE` lines cite its files (8 `known-issues`, 5 `AGENTS.md privé`) |

Probed 2026-09-16 (p25g, p30, p32): a project without `GIT_REPOSITORY` is L006, two `DESC` L010, `"no-slash"` L007,
`Pcst` and `DO_NOT` L024 under `[A-Z]+`; `new PROJECT NEW` prints one required line. A review thread is its pull
request: the thread id is noise. A conversation is not a source; the pull request that recorded the ruling is.

Cost: one entity per pull request cited, two lines plus `DESC`, written once and shared by every entity it produced.

#### USAGE_REPORT

Membership: a dated usage report under `docs/awawa-usage-reports/`, cited as the origin of an entity. Written only
when cited, like a `PULL_REQUEST`: a file nothing cites has no entity. Never archived by hand: one with nothing
pointing at it is deleted by the cleanup pass (`incoming 0`).

Ratified 2026-09-16 (point 29):

| Field name | Role                                                                                                                                                                                                                                                                   | Accepted values                | Is repeatable | Is required |
|------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------|---------------|-------------|
| FILE       | the report file, `path::tag` — the literal is a raw text search in the file; the tag is a line placed **at the top of the report template** (`docs/awawa-usage-reports/_template.md`), not a heading (ruled 2026-09-16); L016 reports a moved report and a missing tag | anchor                         | no            | yes         |
| EVALUATES  | the pull request the report measures; absent on an aggregate or tool-defects report, several on an aggregate                                                                                                                                                           | @PULL_REQUEST (→ EVALUATED_BY) | yes           | no          |
| DESC       | the report title; optional (wildcard)                                                                                                                                                                                                                                  | string                         | no            | no          |

Name: `NAME file_name` (a generic shape name, asked 2026-09-16: the pattern is the report's, the name is not),
`awawa_usage_report_` then the subject: `awawa_usage_report_PR87` in the common case,
`awawa_usage_report_PR62_launch`, `awawa_usage_report_tool_defects_aggregate`. The date is in `FILE`, the pull
request in `EVALUATES`: the name is only the address (point 28). `Report20260915Pr83` (the earlier form) was
refused: a shape carrying the date repeats what `FILE` holds and refuses the reports without a pull request.

Live corpus, measured 2026-09-16 through the tool (`show` on the 227 `SOURCE` lines): no `SCHEMA USAGE_REPORT`
today; 19 lines cite a report file, all on `OPEN_QUESTION`s (11 → pr-65, 1 → pr-71, 3 → pr-75, 2 → pr-76, 2 → pr-78:
five reports), 5 of them `specified`, 14 `superseded`; none survives as a question (point 24), so 0 to ~5 report
entities at migration, written with the questions retyped. The 3 decisions mentioning « rapport d'usage » cite a
pull request (#63, #69/#70), not a file. The 19 lines cite a flat path (`docs/awawa-usage-reports/2026-09-12-pr-65.md`)
that exists nowhere at HEAD: PR #93 moved the reports into `2026_09_15-11_reports_migration_and_field/`, and nothing
reported it — the L016 that `FILE` buys. At HEAD: 12 files in that archive (two on PR 62, `launch` and `review`, two
aggregates without a pull request), 5 exports under `artifact-assets`, 1 under `intellij-plugin-ui`, `_template.md`.

The tag: one line at the top of `_template.md`, copied into every report by the template, so every `FILE` anchor carries
the same `::tag` and a report written outside the template is L016. To do at the right place — the template, before the
first `USAGE_REPORT` entity is written (step 5 of the outline); the tag's text is chosen then. The eleven archived
reports predate it: their anchors carry the tag once it is added to them, or the path alone.

Refused 2026-09-16, each probed on 2.7.0:

| Form                                                   | Why refused                                                                                                                                    |
|--------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------|
| no type: `SOURCE › FILE anchor` on the wildcard (p33e) | lints, but `--where FILE==` is exit 2 (nested), `refs` lists nothing on the report, and the path repeats on every citing entity (11 for pr-65) |
| `EVALUATES` `REQUIRED` (p33d)                          | L006 on the two aggregate reports: real files with no pull request                                                                             |
| `NAME report_id` `Report[0-9]{8}[A-Za-z0-9]*` (p33f)   | `Report20260915Pr83` passes, `Pr62Launch` and `ToolDefectsAggregate` are L024; the date is already in `FILE`                                   |

Probed 2026-09-16 on 2.7.0 (p33 = `SCHEMA *` + `PROJECT` + `PULL_REQUEST` + `TASK` + `OPEN_QUESTION` + `DECISION` +
the type above, p34 with the shape and `EVALUATES`; `lint --strict` clean):

| Probe                                                                                                       | Result                                                                                                                                                                                                   |
|-------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `FILE` to the old flat path; `::## Verdict`; `::## Missing` (a heading stood for the tag in the probe)      | L016 « path does not exist »; resolved; L016 « does not occur »: a moved report and a missing tag are errors on the entity                                                                               |
| `EVALUATES @PULL_REQUEST` `REPEATABLE`, `CONVERSE EVALUATED_BY`; the aggregate evaluating two pull requests | `refs @PULL_REQUEST.PCST83` lists the report under `EVALUATES`; `context` on the pull request: footer `EVALUATED_BY (root, 1)`; `status PULL_REQUEST` counts `EVALUATED_BY 2` on the one evaluated twice |
| `SOURCE "usage report on PR 83, recorded by PR 67"` + `REF @USAGE_REPORT.X` + `REF @PULL_REQUEST.PCST67`    | clean; `refs` on the report lists the `SOURCE.REF` sites; `context` on the question 6 entities, 20 lines, `--skip provenance` 2 / 6, footer `skipped (provenance): @USAGE_REPORT.… @PULL_REQUEST.PCST67` |
| `context @USAGE_REPORT.X`                                                                                   | 3 entities, 8 lines (pull request and project expanded); footer `referenced by (root, 2)`                                                                                                                |
| `--where EVALUATES==@PULL_REQUEST.PCST83`, `--where FILE==docs/…/2026-09-15-pr-83.md`                       | select                                                                                                                                                                                                   |
| `status USAGE_REPORT --json`                                                                                | `incoming` per entity: the cleanup pass's criterion, one listing (as for `PULL_REQUEST`)                                                                                                                 |
| `USAGE_REPORT PCST83` beside `PULL_REQUEST PCST83` (p33a)                                                   | clean: a name is unique per type, not per corpus                                                                                                                                                         |
| archived report cited by an active question (p33g)                                                          | clean; footer `suppressed: @USAGE_REPORT.…` (not the mechanism retained: deleted at `incoming 0`)                                                                                                        |
| shape `awawa_usage_report_[A-Za-z0-9]+(_[A-Za-z0-9]+)*` (p34)                                               | `awawa_usage_report_PR83`, `…_PR62_launch`, `…_tool_defects_aggregate` pass; `Pr83`, `awawa_usage_report_`, `Awawa_usage_report_PR83` L024; `…_PR-83` L017 (a hyphen is not an identifier)               |
| `new USAGE_REPORT awawa_usage_report_PR79`                                                                  | one required line (`FILE`), `EVALUATES` and `DESC` commented                                                                                                                                             |
| `fmt --rename` to `…_PR84`; to `Pr84`                                                                       | 2 sites rewritten; refused L024                                                                                                                                                                          |

#### URL

Membership: an external page cited as a source — a wiki page, a forum thread. Ratified 2026-09-16 (point 23): a source
entity like the others, so `refs @URL.X` lists what rests on the page; the address is typed by a shape, not left as a
string.

| Field name | Role        | Accepted values | Is repeatable | Is required |
|------------|-------------|-----------------|---------------|-------------|
| LOCATION   | the address | url (shape)     | no            | yes         |

Name: an identifier (`WikiSaveFile`), the address is the field (`://` and `#` cannot be in a name). `DESC` optional (the
page title). Probed on 2.7.0 (p18): `SHAPE url MATCH "https?://[^\s\"]+"` typing `FIELD LOCATION url` — an
address with `?`, `/`, `#` passes, an address without scheme or with a space is L007 (error on an active entity);
`new URL Foo` prints `LOCATION // url`; `SOURCE "wiki, section list"` + `REF @URL.WikiSaveFile` on a fact: `refs
@URL.WikiSaveFile` lists the `SOURCE.REF` site. Not an `UNKNOWN_SOURCE`: the type exists from the first schema.

#### UNKNOWN_SOURCE — dropped (ratified 2026-09-16, point 30)

Was: a provenance whose type does not exist yet, one field `TYPED_BY @TASK` required, written the day it is met,
retyped and deleted once the type exists. Dropped: the need measured on the live corpus is 0 (the 227 `SOURCE` lines
all fall into the four source types), and the placeholder does the same work later — the `SCHEMA` entry — with three
more writes (the placeholder, a `TASK` to declare a type, a retype by hand since `fmt --rename` refuses a type change,
then a deletion) and one more entity opened by every `context` in between.

What replaces it: **`SOURCE › REF REQUIRED` on `SCHEMA *`**. The day a provenance of a new kind is met, the session
writes it in prose, `lint` refuses the line (L006), and the session declares the source type in the same pull request:
one `SCHEMA` entry (`DESC`, a `NAME` shape where the name wants one, one typed field for the address, as `URL`), one
entity, the `REF`. The instruction lives in the `DESC` of `SOURCE` on `SCHEMA *` (« no type fits: declare it in the
same pull request »), read by `show @SCHEMA.*` and every `context --with-schema`; L006 says what is missing, never what
to do (`suggestion: null`). Two escapes, visible at review only: no `SOURCE` line at all (the field is optional), or a
`REF` to an existing entity that is not the source (`reference` checks existence, not the type — point 10's limit).
Nothing in the tool says « unknown type »: a new word after `@` is L004, the message of a typo.

Probed 2026-09-16 on 2.7.0 (throwaway corpora p35 = the type as tabled with `CONVERSE TYPES`, p35b = type dropped and
`REF` required; `lint --strict` clean):

| Probe                                                                          | Result                                                                                                                                                                                               |
|--------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| p35: `TYPED_BY @TASK` with `CONVERSE TYPES`                                    | `status TASK` prints `incoming 1 (TYPES 1)` on the task, `context @TASK.DOCS46` footer `TYPES (root, 1)`: the converse alone surfaces it on the task, a `BLOCKS` would add nothing (point (f), moot) |
| p35: `status .`                                                                | one `UNKNOWN_SOURCE 1` row in the global table: the orient signal is in the first call of a session                                                                                                  |
| p35: `refs @UNKNOWN_SOURCE.X`; `context` on the citing decision                | the `SOURCE.REF` sites; 3 entities, 13 lines (placeholder and its task open), `--skip provenance` 1 / 4                                                                                              |
| p35: `new UNKNOWN_SOURCE Foo`                                                  | one required line                                                                                                                                                                                    |
| p35b: `SOURCE` without `REF`                                                   | L006 « required field REF is absent from DECISION.SOURCE », on every such line (the second of two too), without `--strict`                                                                           |
| p35b: archived entity's `SOURCE` without `REF`; archived `SPEC` without `IMPL` | both pass: a nested `REQUIRED` is gated by the wildcard's `WHEN STATUS` like a top-level one                                                                                                         |
| p35b: `new DECISION`                                                           | `// REF reference` under `SOURCE`, not marked required (defect already recorded)                                                                                                                     |
| p35b: `REF @TASK.T1` under `SOURCE`                                            | satisfies the requirement: existence only                                                                                                                                                            |
| p35b: `lint --json --rule L006`                                                | `message` names the missing field and its path, `suggestion: null`; the schema `DESC` of `SOURCE` is printed by `show @SCHEMA.*` and `context --with-schema`                                         |

### Free-text fields — inventory and proposals (2026-09-16, to review)

Ruled: free text is limited to what cannot be a reference, an enum, a shape or a number. Every `string` field of
the target, with the proposal for the review:

| Field                                | Proposal                                                                                                                    | Reason                                                                                                           |
|--------------------------------------|-----------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------|
| `SCHEMA *` `DESC`, `RATIONALE`       | string, kept — **ratified 2026-09-16**                                                                                      | prose by nature; `REF` nested indexes what they mention; `DESC` optional on entities                             |
| `SCHEMA *` `SOURCE`                  | string + `REF reference`, `REF` required — **ratified 2026-09-16** (points 10, 30)                                          | see « Sources »                                                                                                  |
| `DECISION` `REJECTED`, `SPEC`        | string, kept — **ratified 2026-09-16**                                                                                      | an alternative and an obligation are sentences; `SPEC › IMPL` (required) and `ENFORCED_BY` anchor them           |
| `PROCESS` `REJECTED`, `SPEC`         | string, kept — **ratified 2026-09-16**                                                                                      | same; `ENFORCED_BY` alone anchors a process obligation                                                           |
| `DECISION` `UNTIL`                   | `@TASK\|string` (→ `RETIRES`) — **ratified 2026-09-16**                                                                     | a task is checked and listed by `refs`; a condition without a task stays prose; the task in prose is L025        |
| `LIMITATION` `SYMPTOM`, `WORKAROUND` | string, kept — **ratified 2026-09-16**                                                                                      | observations; `WORKAROUND › REF` indexes what the prose mentions                                                 |
| `LIMITATION` `REOPEN_WHEN`           | replaced by `UNTIL @TASK\|string` (→ `RETIRES`) — **ratified 2026-09-16**                                                   | same slot as on the rulings; the fixing task is listed by `refs`, the condition stays prose                      |
| `OPEN_QUESTION` `RECOMMENDATION`     | dropped — **ratified 2026-09-16** (point 24)                                                                                | a stored recommendation was once ratified unverified; the ruling session re-examines against the code of the day |
| `TASK` `TITLE`                       | string, kept — **ratified 2026-09-16** (point 25)                                                                           | the readable name                                                                                                |
| `TASK` `SPEC`                        | string, kept — **ratified 2026-09-16** (point 25)                                                                           | an acceptance criterion is a sentence; `SPEC › IMPL` (required once implemented) anchors its proof               |
| `TASK` `WAVE`                        | `uint`, optional — **ratified 2026-09-16** (point 25)                                                                       | a wave is a number in the plan; no text needed                                                                   |
| `TASK` `PR`                          | `DELIVERED_BY @PULL_REQUEST` (→ `DELIVERS`), not repeatable, required once implemented — **ratified 2026-09-16** (point 25) | the same entity `SOURCE` points at; `refs` on the pull request then lists what it delivered                      |
| `FACT` `GAME_VERSION`                | dropped 2026-09-16                                                                                                          | no version on a temporary type                                                                                   |
| `PULL_REQUEST` `DESC`                | string, optional — **ratified 2026-09-16** (point 28)                                                                       | the title, read by a human in a listing; `PROJECT` and `NUMBER` are typed                                        |
| `PROJECT` `GIT_REPOSITORY`           | `repo` shape — **ratified 2026-09-16** (point 28)                                                                           | `owner/name`, checked by L007                                                                                    |
| `USAGE_REPORT` `DESC`                | string, optional — **ratified 2026-09-16** (point 29)                                                                       | the report title; `FILE` and `EVALUATES` are typed                                                               |

### Skeleton `awawa new` prints for the schema above (probed)

```
DECISION Foo
	REJECTED // string
		// REF reference
	// UNTIL @TASK|string
	SPEC // string
		IMPL // anchor
		// ENFORCED_BY anchor
	// APPLIES_TO_PACKAGE @PACKAGE
	// APPLIES_TO_TASK @TASK
	// RESTS_ON @FACT
	// DESC string
		// REF reference
	// RATIONALE string
		// REF reference
	// SOURCE string
		// REF reference
	// STATUS active
	// WHEN STATUS archived: ARCHIVED_ON (required), PURGE
```

Three required lines to write a decision: `REJECTED`, `SPEC`, `IMPL` (re-probed 2026-09-16 with the `DECISION` table
as ratified, p15; the fieldset's fields print first; `new` prints neither `CATEGORY` nor `CONVERSE`). Two for a
`PROCESS`: `REJECTED`, `SPEC`; two for a `LIMITATION`: `SYMPTOM`, `UNTIL` (p16); two for an `OPEN_QUESTION`: `DESC`,
`BLOCKS` (p21); three for a `TASK`: `TITLE`, `STATUS`, `SPEC`, plus `IMPL` and `DELIVERED_BY` at delivery (p22); two for
a `PACKAGE`: `DESC`, `MANIFEST` (p24); two for a `PULL_REQUEST`: `PROJECT`, `NUMBER`, one for a `PROJECT`:
`GIT_REPOSITORY` (p32), one for a `USAGE_REPORT`: `FILE` (p34). `STATUS`,
`ARCHIVED_ON` and `PURGE` are not written until the entity is archived (and cannot be, L003 — point 31; re-probed p36:
`new` prints them on the `WHEN` line only). That is the write-time cost of the corpus. A
`SOURCE` line, when written, costs its `REF` (required, point 30); `new` prints it commented all the same (p35b).

## Points ouverts — traités

| # | Point (previous skeleton)                             | Resolution                                                                                                                                                                             |
|---|-------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| 1 | `implemented` state on `DECISION`                     | No ladder (C2). « Accepted, not built » = `APPLIES_TO_TASK` to a task not implemented. `--where` cannot filter on nested `IMPL` (probed, exit 2).                                      |
| 2 | `SUPERSEDES` on the successor                         | Moot (C1): a replaced ruling is rewritten in place; a dropped one is archived.                                                                                                         |
| 3 | `LIMITATION.SUBJECT` dropped, `WORKS_AROUND`          | Confirmed for `SUBJECT`. `WORKS_AROUND` replaced by `UNTIL` (string). Retrieval: `grep -n UNTIL`; `--where UNTIL!=x` also matches entities without the field (probed).                 |
| 4 | Added ladder values (`retired`, `draft`, `withdrawn`) | Reversed: one `archived` value on `SCHEMA *` replaces them all (C1).                                                                                                                   |
| 5 | Can a `FIELDSET` carry `WHEN` blocks?                 | **No**: L023 « `WHEN` is not a FIELDSET declaration » (probed). Moot: the only shared `WHEN` is on `SCHEMA *`.                                                                         |
| 6 | Shared `CONVERSE` names                               | One converse from `APPLIES_TO_PACKAGE` and `APPLIES_TO_TASK`: no L013, `context` prints the edge (probed). Named `GOVERNED_BY` on 2026-09-16 (point 16). `CLOSED_BY` no longer exists. |
| 7 | `BLOCKS` targets                                      | `@TASK` only. L009 checks it.                                                                                                                                                          |
| 8 | `TASK` and `PACKAGE` out of scope                     | `TASK` in scope: name = identifier, `TITLE`, ladder, archive. Its other fields read on 2026-09-16 (§ TASK). `PACKAGE` read the same way: `PREFIX` dropped, `:vN` dropped (§ PACKAGE).  |

## Points tranchés le 2026-09-16

| #  | Point                                                   | Ruling                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
|----|---------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| 1  | C1 (archive, not delete), C2, C3                        | Ratified.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| 2  | `KIND` field or file layout as the family               | Neither: no family axis on `DECISION`, no `KIND`, no split by type. What the file layout becomes is the open point (a) below. Amended by point 18: a second ruling type where the shape differs (`PROCESS`); `KIND` stays refused.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| 3  | `SPEC` required on every `DECISION`                     | Ratified; a decision without one gets one at migration or is not carried over.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| 4  | `TASK` archive                                          | One type, `STATUS archived`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| 5  | Archive delay and cleanup pass                          | 30 days; a new unattended procedure; `PURGE` decides (default false, `TASK` default true). Amended by point 31: default `true` everywhere, a `package.json` script run by hand, no schedule.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| 6  | Recording threshold                                     | Ratified: a `DECISION` is recorded only if a future pull request could do the reverse by mistake; an `OPEN_QUESTION` only if a task is blocked on it or a recommendation waits for ratification. The review skill is edited in the same pull request.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| 7  | 4 `EXTERNAL_RULE` candidates, 3 awawa limitations       | Examined one by one at migration; expected outcome: not carried over; a workaround still applied becomes a `DECISION` with `UNTIL`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| 8  | Product specification                                   | Refused for now: the corpus stays meta (project management); nothing on the business side.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| —  | `SOURCE`                                                | Typed: `PULL_REQUEST`, `USAGE_REPORT`, `UNKNOWN_SOURCE` entities, `SOURCE reference` (see « Sources »). Amended by points 10 (`string` + `REF`), 23 (`URL`), 28 (`PROJECT`) and 30 (`UNKNOWN_SOURCE` dropped, `REF` required).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| —  | Free text                                               | Limited to what cannot be typed; inventory above, each proposal reviewed with its entity.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| —  | `ARCHIVED_ON` and deletion                              | `PURGE true\|false` beside it, `DEFAULT false`, `TASK` `DEFAULT true`. Amended by point 31: `DEFAULT true`, both inside `WHEN STATUS archived`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| 9  | `SCHEMA *` — `DESC` (review pass, 2026-09-16)           | Optional on entities: written only when no other field carries the information. Stays required by the tool on schema entries (L022); no `ROLE` field possible (L023).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| 10 | `SCHEMA *` — `SOURCE` (review pass, 2026-09-16)         | `string` with nested `REF reference`, like every prose field; the typed union is L020, one field per type refused. Point (d) keeps only the three source types and their shapes.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| 11 | `SCHEMA *` — free text (review pass, 2026-09-16)        | `DESC`, `RATIONALE` string: ratified. Reading rule recorded: the active ones are `--where STATUS!=archived`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| 12 | Shapes (review pass, 2026-09-16)                        | `pascal`, `task_id`, `package_name` (`_` imposed by the tool), `date`, `repo` ratified; `game_version` and `pr_id` dropped.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| 13 | `FACT` temporary (review pass, 2026-09-16)              | Kept only so the migration loses nothing; no `GAME_VERSION`; its real shape waits for the project specification. Closes point (c).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| 14 | `PROJECT` entity (review pass, 2026-09-16)              | A pull request names its repository by `PROJECT @PROJECT`, replacing `REPO`; no alias in its name. Fields and name shape reviewed with `PULL_REQUEST`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| 15 | Defects of the tool (review pass, 2026-09-16)           | Noted in the dedicated section at the end of this file, for one usage report on the whole work; never in the corpus.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| 16 | `DECISION`, first four points (review pass, 2026-09-16) | `UNTIL @TASK\|string` with `CONVERSE RETIRES`; `CATEGORY reasoning` on `REJECTED`; `RESTS_ON @FACT` kept, `FACT` being the bridge to the second migration; the converse of both `APPLIES_TO_*` keeps its current name `GOVERNED_BY`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| 17 | `DECISION`, remaining rows (review pass, 2026-09-16)    | `REJECTED` required with nested `REF`, `SPEC` required, both gated by the wildcard's `WHEN STATUS` (error active, suppressed archived); `ENFORCED_BY` optional under `SPEC`; `APPLIES_TO_PACKAGE` as is; `APPLIES_TO_TASK` as is, purged with the task; `REJECTED`/`SPEC` stay free text.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| 18 | `PROCESS` type (review pass, 2026-09-16)                | `SPEC › IMPL` required on `DECISION`; a ruling with nothing in the repository to anchor is a `PROCESS` (`REJECTED`, `SPEC` + optional `ENFORCED_BY`, `UNTIL`; no `IMPL`, `APPLIES_TO_*`, `RESTS_ON`). Shared fields declared once in `FIELDSET Ruling`. Amends point 2 and C3 on the criterion's result, not on the criterion: a type only for a different shape.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| 19 | Mutually exclusive fields (review pass, 2026-09-16)     | No such mechanism in the tool (`WHEN` is monotonic and keys on a value, never on a field's presence); exclusivity is written as one slot with alternatives, as a field declared only inside a `WHEN` block of a discriminant, or as two types. Defect recorded; the `WHEN`-only refinement for `ARCHIVED_ON`/`PURGE` is noted under « Archive et suppression ».                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| 20 | `LIMITATION` (review pass, 2026-09-16)                  | `SYMPTOM` required; `WORKAROUND` repeatable with nested `REF`; `REOPEN_WHEN` replaced by `UNTIL @TASK\|string` (→ `RETIRES`), required, redeclared on the type; `SEEN_IN anchor` added; `APPLIES_TO_PACKAGE` (→ `LIMITED_BY`) as is; free text ratified. Membership read against the 12 live entities: 3 limitations, the outline recounted; the hydration entity splits into a `LIMITATION` and a `DECISION`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| 22 | `FACT` (review pass, 2026-09-16)                        | Temporary bridge, no assumption on what the second migration makes of it. `DESC` required on the type (the statement, one per fact, not repeatable); at least one of `ATTESTED_BY` and `UNTIL @TASK\|string` (→ `RETIRES`) required, written through `BASIS attested\|hypothesis` (`DEFAULT attested`): `ATTESTED_BY` required when attested, `UNTIL` declared and required under `hypothesis` only, `ATTESTED_BY` optional there (ratified; the tool has no any-of requirement, recorded as a defect). The hunger question is a fact (hypothesis). Read against the live corpus: the six `format-save` entities are decisions, 0 to retype; ~6 facts to write from prose.                                                                                                                                                                                                                                                                                                                                  |
| 23 | `URL` source type (review pass, 2026-09-16)             | A fourth source type, one field `LOCATION` typed by `SHAPE url`; an external page is `SOURCE` prose with `REF @URL.X`. Shapes recorded as a strength of the tool.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| 21 | Retrospective before the migration (2026-09-16)         | Once the migration plan is tied up and before its first step: analyse the sessions and this refinement work, and write a proposal for the awawa team on how to start a corpus in a project that has none — a bootstrap method. It serves the second migration too. Step 0 of the outline.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| 25 | `TASK` (review pass, 2026-09-16)                        | `SPEC` (acceptance criterion, knows nothing of the implementation) required, `SPEC › IMPL anchor` required once `implemented` (`WHEN`), never prose; `draft` kept with a new meaning — written, not ratified by the user, gated error, ignored by the wave planner; `WAVE uint` optional; `PR` replaced by `DELIVERED_BY @PULL_REQUEST` (→ `DELIVERS`), not repeatable (one task is one pull request, a reopened one does not happen), required once `implemented` (a task without a pull request is outside the corpus); a task is archived by the cleanup pass once no todo task is `AFTER` it; the second `DESC` of 7 live tasks folds into `SPEC`, `RATIONALE`, a computed edge or the single `DESC`, no field added; `context` reading outgoing only is recorded, no edge flipped.                                                                                                                                                                                                                     |
| 26 | Kind of task (review pass, 2026-09-16)                  | Carried by the name prefix, not by a type (L020 on every `@TASK` slot, same shape) nor a `KIND` field; the set is the eleven Conventional Commits types, upper-cased, so task and pull request title say the same word; one global number sequence continuing today's (`T45` → `FIX45`); `DEP` → `CHORE`, `AWA` → `DOCS`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| 27 | `PACKAGE` (review pass, 2026-09-16)                     | `NAME package_name` without `:vN`; `PREFIX` and the wildcard `STATUS` dropped; `DESC` required on the type by principle (the package's reason to exist lives in its entity, no new field); `MANIFEST anchor` required, path **and** literal (`packages/core-mapping/package.json::core-mapping`), so L016 reports a removed package and a renamed one — no longer deferred; the 8 live `SPEC` are rulings: ~5 become `DECISION`s with `APPLIES_TO_PACKAGE`, 3 restate the instructions' dependency table and are dropped.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| 28 | `PULL_REQUEST` and `PROJECT` (review pass, 2026-09-16)  | `PULL_REQUEST`: `PROJECT @PROJECT` (→ `PULL_REQUESTS`) and `NUMBER uint` required, `DESC` optional (title), `NAME pr_id` = the project name then the number (`PCST62`), the name being only the address (the tool addresses by name, never by fields, and cannot build a name from a field: limit recorded; nothing checks the name against the fields, accepted); `PROJECT`: `GIT_REPOSITORY repo` required (renamed from `REPO`), `NAME project_name` upper case, three entities `PCST`, `AI`, `DNC` from the first schema; the shape lists no project, L004 on the field does it; the 8 `known-issues` lines kept as prose + `REF @PROJECT.DNC`; `CATEGORY provenance` on `SOURCE`; a pull request at `incoming 0` deleted by the cleanup pass; migration: the pull request of a date-only `SOURCE` comes from `git log -S`, thread ids dropped, titles from `gh pr view`. Attention point: a dependency on another repository's pull request is indexed by a prose `REF`, with no typed lifecycle edge. |
| 24 | `OPEN_QUESTION` (review pass, 2026-09-16)               | `DESC` required on the type (one statement); `BLOCKS @TASK` (→ `BLOCKED_BY`) required: the recording threshold of point 6 becomes one schema line, its « recommendation » clause dropped with the field; no `RECOMMENDATION` (a stored one was once ratified unverified; the ruling session re-examines); `PURGE DEFAULT true`; the ruling does not cite the question; name `pascal`. Closes point (b): no `BLOCKS` to a package or a decision, the 20 live questions are retyped (`LIMITATION`, `FACT`, one `TASK`) or dropped.                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| 30 | `UNKNOWN_SOURCE` (review pass, 2026-09-16)              | Dropped: need measured at 0 (the 227 live `SOURCE` lines fall into the four source types), and the placeholder does the schema entry's work later with three more writes. Replaced by `SOURCE › REF REQUIRED` on `SCHEMA *`: a `SOURCE` line naming no entity is L006, so a provenance of a new kind gets its type declared in the same pull request (one `SCHEMA` entry, one entity, the `REF`); the instruction lives in the `DESC` of `SOURCE`. Limits recorded: `reference` checks existence, not the type; L006 carries no suggestion; an unknown type after `@` reads as L004. Closes points (d) and (f) (the converse of `TYPED_BY` would have surfaced it on the task without a `BLOCKS`, moot). Eleven `SCHEMA` entries.                                                                                                                                                                                                                                                                           |
| 31 | Archive et suppression (review pass, 2026-09-16)        | `ARCHIVED_ON` and `PURGE` declared inside `WHEN STATUS archived` of `SCHEMA *` only (point 19's refinement, L003 on an active entity); `PURGE DEFAULT true` — archived means no longer needed —, `PURGE false` keeps; `TASK` alone redeclares `PURGE` at type level (written before the unattended archive), the `OPEN_QUESTION` shadow of point 24 dropped; the cleanup pass is a `package.json` script run by the user when they want, no schedule, working on a branch and opening a pull request whose body is its report; order and report as tabled; the archive test of point 25 counts `draft` tasks too; an active entity whose `UNTIL` names an `implemented` task is archived by the pass, a question whose `BLOCKS` names one is reported; homes: the conduct rules are `PROCESS`, the pass and the delay one `DECISION` anchored on the script, `PURGE`'s meaning its schema `DESC`.                                                                                                           |
| 29 | `USAGE_REPORT` (review pass, 2026-09-16)                | `FILE anchor` required (`path::tag`, the tag being a line at the top of the report template `_template.md`, not a heading — to add to the template at the right place before step 5); `EVALUATES @PULL_REQUEST` (→ `EVALUATED_BY`) optional, repeatable (aggregate reports evaluate several or none); `DESC` optional (title); `NAME file_name` = `awawa_usage_report_` then the subject (`awawa_usage_report_PR87`), the date staying in `FILE`; one entity per report cited, deleted by the cleanup pass at `incoming 0`; refused: no type with a nested `SOURCE › FILE`, a required `EVALUATES`, a date-carrying name shape. Migration: the 19 citing lines (all on questions, 5 live) get the archive path of PR #93. **Before the migration, the user cleans `docs/` by hand** (asked 2026-09-16): a reminder, no instruction.                                                                                                                                                                         |
| 32 | File layout (review pass, 2026-09-16)                   | `_schema.awawa` declares every type (no `SCHEMA` beside its data); one file per type, named by the type in lower case, plural (`decisions.awawa`, `processes.awawa`, `limitations.awawa`, `facts.awawa`, `open_questions.awawa`, `tasks.awawa`, `packages.awawa`), holding that type's entities only, in order of appearance, a new entity appended at the end; the four source types grouped in `sources.awawa`. No file per domain: the domain is in no field, a file name is read by no command, and it was a classification decision at write time. Probed: `status`, `context --with-schema`, `lint --closure` byte-identical across four layouts, `diff` blind to a move, `fmt` blind to the order; two pull requests appending to the same file conflict at rebase, accepted. Closes point (a), the last one.                                                                                                                                                                                        |

## Points ouverts — à trancher (session suivante, entité par entité)

All settled on 2026-09-16; the 14-step review is complete. Step 0 of the outline (retrospective, point 21) is done
the same day. Next: the user's manual clean of `docs/` (step 0b), before any migration.

- (a) settled 2026-09-16 (point 32): `_schema.awawa` + one file per type (lower case plural, append at the end), the
  four source types in `sources.awawa`; no file per domain.
- (b) settled 2026-09-16 (point 24): no `BLOCKS_PACKAGE`; the package-blocking questions are limitations or facts,
  the package carried by their own field.
- (c) settled 2026-09-16 (point 13): `FACT` is temporary.
- (d) settled 2026-09-16 (point 30): `UNKNOWN_SOURCE` dropped, `SOURCE › REF` required (the `SOURCE` field, point 10;
  the alias list, point 14; `URL`, point 23; `TASK.DELIVERED_BY @PULL_REQUEST`, point 25; `PULL_REQUEST` and `PROJECT`,
  point 28; `USAGE_REPORT`, point 29).
- (e) **Free text**: each proposal of the inventory, with its entity (`SCHEMA *` rows settled, point 11; `DECISION` and
  `PROCESS` rows settled, points 16–18; `OPEN_QUESTION` row settled, point 24; `TASK` rows settled, point 25).
- (g) settled 2026-09-16 (point 26): name prefix = Conventional Commits type, one global sequence.
- (f) settled 2026-09-16 (point 30): moot, the type is dropped; had it stayed, `CONVERSE TYPES` on `TYPED_BY` shows it
  on the task, no `BLOCKS`.

## Migration outline (once ratified)

The new corpus is written in `awawa-project-methodology`; the old files stay in git history, which is the archive of
whatever is not carried over. The archive mechanism applies from the first pull request on the new corpus.

File layout (point 32): `_schema.awawa` (step 1), then one file per type — `decisions.awawa` and `processes.awawa`
(steps 3, 6, 7b, 1b), `limitations.awawa` and `facts.awawa` (step 4), `sources.awawa` (step 5), `tasks.awawa` (step 7),
`packages.awawa` (step 7b); `open_questions.awawa` only if a question survives (0 expected, point 24: a type with no
entity has no file). Inside a file the migration writes the entities in the live corpus's order (file by file as today,
then by position), which becomes their order of appearance; every later entity is appended at the end.

| Step | What                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | Volume (findings §1, §3, §6)                                           | Tool support                                                                  |
|------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------|-------------------------------------------------------------------------------|
| 0    | **retrospective — done 2026-09-16** (point 21): session scan (section « Scan des sessions (rétrospective) ») and the proposal to the awawa team, written directly as `docs/awawa-usage-reports/migration/2026-09-16-corpus-bootstrap-method.md` (the user chose the folder over a section of this file; untracked, to commit with the migration's first pull request or before): ten bootstrap steps with their measures, what it refuses, the 23 defects and 25 strengths annexed integrally, ten proposals to the tool's authors, the four out-of-corpus levers named and left to the project                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | the sessions, this file, `findings.md`                                 | session scan, one usage report                                                |
| 0b   | **the user cleans `docs/` by hand, before step 1** (asked 2026-09-16): a reminder only, what the clean covers is theirs to decide                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | `docs/`                                                                | —                                                                             |
| 1    | write `_schema.awawa` above (`ARCHIVED_ON` and `PURGE DEFAULT true` inside `WHEN STATUS archived` only, `TASK` redeclaring `PURGE` (point 31); `DESC` optional on entities except `FACT`, `OPEN_QUESTION`, `PACKAGE`; `SOURCE string` + `REF` **required** with `CATEGORY provenance` and the « declare the type » instruction in its `DESC` (point 30), nine shapes, `FIELDSET Ruling`, eleven `SCHEMA` entries incl. `URL`, `PROJECT`, `PULL_REQUEST`, no `UNKNOWN_SOURCE`)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | 1 file                                                                 | `lint --strict`, `new`                                                        |
| 1b   | write the cleanup script declared in `package.json` (point 31: run by hand, branch + pull request, report as body; archive, purge, `incoming 0` loop, `fmt` + `lint --strict`; the p36p/p36d probes are its draft) and the `DECISION` anchored on it (`SPEC › IMPL package.json::<script>`, the 30-day constant); the three conduct rules as `PROCESS`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | 1 script + 1 `DECISION` + 3 `PROCESS`                                  | `lint --strict` on the decision's anchors                                     |
| 2    | do not carry over: `superseded` decisions, closed questions (incl. 8 husks), the 7 entities of point 7, and every live question no task waits on — the 7 « general or project rule » ones, UneSaveSansJoueur, LesReglesDeCirculation if its `~/.ai` pull request has merged (point 24)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | 12 + 41 + 7 + ~10                                                      | `status OPEN_QUESTION`, L006 on `BLOCKS` lists what is left                   |
| 3    | carry over the live decisions in English (no live question survives as one: 0 of 20 block a task; the others are retyped at step 4 or dropped at step 2), `STATUS`/`SUPERSEDES`/`CLOSES` lines dropped; a workaround decision gets `UNTIL @TASK.X` when a task retires it, prose otherwise; the two `RATIONALE.REF` sites of `format-save` cite decisions and stay as they are (corrected at the `FACT` review, no `RESTS_ON` to derive); a ruling whose `SPEC` can anchor nothing is retyped `PROCESS` (about 10, mostly `processus.awawa`; its 2 code-anchored decisions stay `DECISION`)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | ~124 + 21 (145/12 superseded live on 2026-09-16: recount at migration) | scripted text pass, then `fmt` + `lint`; L006 on `IMPL` lists the candidates  |
| 4    | retype the limitations → `LIMITATION` (`SYMPTOM`, `WORKAROUND`, `UNTIL`, `SEEN_IN` from `DESC`/`RATIONALE`/`SPEC › IMPL` prose, findings §4) — 3 of the 12 in `limitations.awawa`, the hydration one split into a `LIMITATION` and a `DECISION`; the other 9 are `DECISION`s (5, one Bun workaround with `UNTIL`) or point 7 (3); plus ~6 live questions that are defects (point 24: NomDeDossier with its pinning test, LAudit, LaPolitique, LaVentilation, LesLibelles, UnCaractereDecoratif), 2 more facts from questions (WoIds, LeLien) and one `DEP` task (LesAlertes) — and **write** the facts as `FACT` entities from the prose of five decisions and the hunger question (0 to retype: the six `format-save` entities stay `DECISION`; `DESC` required, `ATTESTED_BY` or `BASIS hypothesis` + `UNTIL`), then `RESTS_ON` from the decisions they were extracted from                                                                                                                                                                                                                                                                     | 3 (+1 split) + ~6 limitations from questions + ~8 new facts + 1 task   | text pass (`fmt --rename` keeps the type); L006 lists the facts without proof |
| 5    | write the three `PROJECT` entities (`PCST`, `AI`, `DNC`; `PlanetCrafterSaveTools` renamed), then one `PULL_REQUEST` per pull request cited (`PCST<n>`, `PROJECT`, `NUMBER`, `DESC` from `gh pr view <n> --json title`): 44 distinct numbers in `SOURCE` today plus the implemented tasks' (point 28); rewrite every `SOURCE` string into prose plus a nested `REF`: the pull request it names, or the one `git log -S '<entity name>' -- docs` finds for the ~53 lines with a date or a task only, the thread id dropped from the 7 `fil NNN` lines; the 8 `known-issues` and 5 `AGENTS.md privé` lines get `REF @PROJECT.DNC`; a usage report → `USAGE_REPORT` (`awawa_usage_report_PR<n>`, `FILE` with the archive path of PR #93 and the `::tag` once the tag line is added at the top of `_template.md` — done first, in this step, and to the archived reports cited; `EVALUATES` the pull request measured; 0 to ~5 entities, the 19 citing lines being on questions, point 29), a page → `URL`; what fits none gets its source type declared in the same pull request, L006 on `SOURCE › REF` listing every line still in prose (point 30) | 3 + ~44 + 227 lines                                                    | scripted text pass, `lint` (L004, L006 on `REF`, L007 on `url`, `pr_id`)      |
| 6    | give a `SPEC` and an `IMPL` to the decisions without one, retype to `PROCESS` what cannot anchor, drop the rest                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | ≤ 32 + the unanchored `SPEC`s                                          | `lint` (L006 on `SPEC`, on `DECISION.SPEC.IMPL`)                              |
| 7    | `TASK`: rename to identifiers (`T45` → `FIX45`, the implemented ones by their type, `DEP3` → `CHORE3`), add `TITLE`, fold the second `DESC` (point 25 table: 2 into `SPEC`, 1 into `RATIONALE`, 1 dropped, 2 into `DESC`), drop `BLOCKS @PACKAGE` on T45, `WAVE "4"` → `WAVE 4`, `SPEC`/`IMPL` kept as they are; the 10 implemented tasks no todo task is `AFTER` are archived at once (`ARCHIVED_ON` = migration day, no `DELIVERED_BY` needed: the requirement is gated by `implemented`); T44 (T45 is `AFTER` it) stays `implemented` with `DELIVERED_BY @PULL_REQUEST.X` and its `PULL_REQUEST` entity                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | 12 (10 archived, 1 implemented, 1 todo)                                | `fmt --rename`, L006 on `DELIVERED_BY`                                        |
| 7b   | `PACKAGE`: the 7 entities keep their name (`:vN` never written), drop `PREFIX` and `STATUS`, keep one `DESC` (the second of core_mapping goes), gain `MANIFEST "packages/<name>/package.json::<name>"` from the `SPEC › IMPL` that carried it; the 8 `SPEC` leave the package: ~5 rewritten as `DECISION`s with `APPLIES_TO_PACKAGE` (core_mapping exports and responses, ui_save_manager fallow, shared_platforms contract, shared_save_processing exports) with their `RATIONALE`/`SOURCE`, 3 dropped (dependency table of the instructions); the `BLOCKS @PACKAGE` edges leave with steps 2, 4 and 7 (point 27)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | 7 + ~5 decisions                                                       | L006 on `DESC`/`MANIFEST`, L016 on the manifests, L003 on the stray `SPEC`    |
| 8    | `awawa diff` old/new, `lint --strict`, `status`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | —                                                                      | `diff`                                                                        |

## Défauts et forces d'awawa relevés pendant le travail (un seul rapport d'usage à la fin ; jamais dans le corpus)

| Observed (2.7.0, 2026-09-16)                                                                                                                                                                                                                                          | What it costs the project                                                                                                                                                                                 |
|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| A slot cannot name several reference types (`@PULL_REQUEST\|@USAGE_REPORT` is L020); `reference` checks existence only                                                                                                                                                | a provenance field is either untyped or split into one field per source type                                                                                                                              |
| `status` prints `(none)` for an entity that omits a `STATUS` with a `DEFAULT`, and `--where` cannot select on the default                                                                                                                                             | « the active ones » is `STATUS!=archived`; a `DEFAULT` is read by gating but by no listing                                                                                                                |
| A schema entry accepts no prose field beyond `DESC`, `RATIONALE`, `SPEC` (L023), and `DESC` is required on it (L022)                                                                                                                                                  | the wildcard cannot make `DESC` a schema-only field; entity `DESC` and schema `DESC` share one name                                                                                                       |
| An entity name is an identifier: the hyphen is refused (`core-mapping` is L017), so a package cannot carry its manifest name                                                                                                                                          | `package_name` writes `core_mapping` for `core-mapping`; one mapping to keep in a `DESC`                                                                                                                  |
| `PROJECT` is listed as a schema keyword yet accepted as a type and field name — settled 2026-09-16: the manual calls it « ordinary project-level configuration », nothing is enforced                                                                                 | none                                                                                                                                                                                                      |
| A `REQUIRED` string is satisfied by `""` (`REJECTED ""` passes `--strict`)                                                                                                                                                                                            | the requirement is a prompt in `new`, not a proof; a fictional line costs nothing to write                                                                                                                |
| No mutual exclusion between fields: `WHEN` is monotonic (L021) and keys on a value, never on a field's presence                                                                                                                                                       | exclusivity is written as one slot with alternatives, a `WHEN`-only field under a discriminant, or two types                                                                                              |
| No « at least one of these fields » requirement: `REQUIRED` is per field, and nothing keys on a field's presence (corrected 2026-09-16: the need on `FACT` is any-of, not exclusion)                                                                                  | « `ATTESTED_BY` or `UNTIL`, at least one » costs a discriminant `BASIS attested\|hypothesis` whose value the presence of `UNTIL` already says, one word per hypothesis                                    |
| `--where` sees no nested field (`IMPL`, `ENFORCED_BY` under `SPEC`: exit 2 « not a field of DECISION »)                                                                                                                                                               | « the decisions enforced by a workflow » is `grep -n ENFORCED_BY`, not a listing                                                                                                                          |
| `context` expands outgoing edges only; what points at the root is a footer of names (by design: « what points at the package from outside it, which traversal cannot find »)                                                                                          | a planning pivot whose edges are all incoming (`TASK`: blocked by, governed by, retired) reads as `refs` plus one `show` per entity, never as one package                                                 |
| `--where` compares text: `WAVE "4"` is refused by L007 on a `uint` field yet selected by `--where WAVE==4`                                                                                                                                                            | none once the corpus lints; a listing on a dirty corpus can include what lint refuses                                                                                                                     |
| `new` summarises a `WHEN` block by its top-level fields (« SPEC (required) ») and omits a nested requirement (`IMPL`)                                                                                                                                                 | the writer learns the nested requirement from L006, not from the skeleton                                                                                                                                 |
| `NAME` is not a `--where` field                                                                                                                                                                                                                                       | no listing by name prefix: `status TASK` + grep                                                                                                                                                           |
| A name cannot be built from a field, and no field from another: the tool addresses an entity by its name only, a reference in a field is a pointer, never a computation                                                                                               | a pull request's name must repeat its project and number (`PCST62` beside `PROJECT`, `NUMBER`), and nothing checks that the three agree                                                                   |
| `WHEN` on a reference field (`WHEN PROJECT @PROJECT.Ai`) is accepted by lint and inert: no requirement fires, `new` prints nothing                                                                                                                                    | a per-project requirement cannot be written; the silence hides the error                                                                                                                                  |
| A type declared `EXTERNAL` loses more than L004: `refs` on one of its names prints the sites then exits 1 « not defined », `show` refuses, no converse is computed, and its `NAME` shape is not checked on the references (`@PULL_REQUEST.Foo` passes)                | a source type cannot be external without losing its hub role                                                                                                                                              |
| `DEFAULT @PROJECT.X` on a reference field: the schema line itself counts as a reference site (`refs`: `@SCHEMA.PULL_REQUEST FIELD.DEFAULT`), and the defaulted edge is invisible to `refs`, `status` and `--where`                                                    | a default on a reference saves a line and loses the listing                                                                                                                                               |
| `status` sorts names as text (`100` before `62`)                                                                                                                                                                                                                      | none with a project prefix; a numeric name would list out of order                                                                                                                                        |
| `--where` does not know a field declared only inside a `WHEN` block until one entity of the type writes it: « `PURGE` is not a field of LIMITATION in this workspace », exit 2 (a usage error, not an empty listing); a type-level field with no writer lists 0       | the cleanup pass cannot list « archived and `PURGE` not false » with `--where`; it reads `show --json` per archived entity (point 31)                                                                     |
| `new` prints one `WHEN STATUS archived` line per declaration when a type shadows a block of the wildcard                                                                                                                                                              | two lines for one condition; avoided by not shadowing (point 31)                                                                                                                                          |
| The `referenced by` footer of `context` (`BLOCKED_BY (root, 1): @OPEN_QUESTION.Ruled`) does not say the source is archived                                                                                                                                            | a todo task reads as blocked by a question already ruled; `refs --json` (`from.status`) tells                                                                                                             |
| `fmt` keeps the entity order as written: there is no canonical order, so a new entity has no deterministic position; two pull requests appending at the end of the same file conflict at rebase (`git merge-file`, one hunk), at different positions they merge clean | one conflict per pair of parallel pull requests adding to the same type, resolved by keeping both blocks (point 32 accepts it); a sorted canonical order would spread the insertions for free             |
| L006 names the missing field and its path, `suggestion` is `null` in `--json`; a reference to a type the schema does not declare is L004, the message of a typo                                                                                                       | what to do when a `SOURCE` names no entity is read from the schema `DESC` (`show @SCHEMA.*`, `--with-schema`), not from the finding; « unknown source type » is not a diagnosis the tool makes (point 30) |

Strengths observed the same day, on the same probes:

| Observed (2.7.0, 2026-09-16)                                                                                                                                                                                                                                                                   | What it buys the project                                                                                                                                              |
|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `REQUIRED` is gated by the wildcard's `WHEN STATUS`: an archived entity missing a required field passes even `--strict`                                                                                                                                                                        | archiving costs two lines, never a rewrite to keep lint clean                                                                                                         |
| A nested `REQUIRED` (`IMPL` under `SPEC`) is enforced, with the path in the message (`DECISION.SPEC`)                                                                                                                                                                                          | « a decision holds somewhere » is checked by the tool, and the check classifies `PROCESS`                                                                             |
| A field declared only inside a `WHEN` block is L003 outside it, on any enum field, not only `STATUS`                                                                                                                                                                                           | conditional legality, the nearest thing to exclusivity                                                                                                                |
| L016 resolves an anchor to the symbol (`path::literal`), in code and in the corpus's own schema file                                                                                                                                                                                           | an obligation is falsifiable at the symbol                                                                                                                            |
| `refs` prints the field name of every site (`REJECTED.REF`, `APPLIES_TO_TASK`) under a shared `CONVERSE`                                                                                                                                                                                       | one converse name for two fields, still distinguishable                                                                                                               |
| `INCLUDE @FIELDSET.X` splices a set of fields into a type: nested fields, `REQUIRED`, `CATEGORY` and `CONVERSE` travel with it, `--skip`, `refs` and `new` read the spliced fields as the type's own                                                                                           | `REJECTED` and `UNTIL` declared once for `DECISION` and `PROCESS`: no second copy to keep aligned by hand, and a third ruling type would cost one line                |
| A duplicate `SCHEMA` block is L005, never merged                                                                                                                                                                                                                                               | no silent override                                                                                                                                                    |
| A `SHAPE` types a field, not only a `NAME`: `LOCATION url`, `ARCHIVED_ON date` are checked at the value by L007 (recorded at the user's request, 2026-09-16)                                                                                                                                   | a string with a shape is a typed field: an address, a date, an identifier are refused when malformed, with no code to write                                           |
| A wildcard prose field redeclared on one type with `REQUIRED` (`DESC` on `FACT`) is enforced there only (L006), and `new` prints it first                                                                                                                                                      | `DESC` optional everywhere, mandatory where it is the entity's substance                                                                                              |
| A `WHEN` on any enum field reads that field's `DEFAULT`, and a field declared only inside the block is L003 outside it (`BASIS attested\|hypothesis` on `FACT`)                                                                                                                                | an any-of requirement (`ATTESTED_BY` / `UNTIL`) costs one enum field, and the common case writes nothing                                                              |
| A declared type with zero entities lints clean and `status` prints it at 0                                                                                                                                                                                                                     | a type can be declared ahead of its first entity                                                                                                                      |
| An anchor's `::literal` is a raw text search in the file (`package.json::core-mapping`), reported by L016 with the literal and the file                                                                                                                                                        | a package entity is tied to its manifest by name: a removed package and a renamed one are both lint errors, one line per package (point 27)                           |
| A required reference field (`BLOCKS @TASK` on `OPEN_QUESTION`) turns a recording threshold into L006, and `context` on the target prints untyped incoming edges (`DESC.REF`) under `referenced by`                                                                                             | « a question is recorded only if a task waits on it » is checked by lint; a challenged decision sees its question without a typed field                               |
| A `WHEN` block can require a **nested** field (`IMPL` under `SPEC` once `STATUS implemented`) and a reference field (`DELIVERED_BY`)                                                                                                                                                           | « an acceptance criterion is proven at delivery » and « a delivered task names its pull request » are L006, not rules to remember                                     |
| A nested `REQUIRED` under an optional wildcard prose field (`REF` under `SOURCE`) fires only when the parent is written, on every occurrence of it, and stays gated by `STATUS` (p35b)                                                                                                         | « a source is an entity » is L006 the day a provenance is written in prose alone, with no placeholder type to carry the case (point 30)                               |
| `--where` on a repeatable reference field with a `STATUS` filter (`--where STATUS==todo --where AFTER==@TASK.X`), and `refs --json` carrying the source's `status`                                                                                                                             | the archive test of the cleanup pass is one command; stale edges onto an implemented task are listed by the same call                                                 |
| A non-repeatable reference field (`DELIVERED_BY`) is L010 on a second line                                                                                                                                                                                                                     | « one task is one pull request » is checked, the decision that said it is not carried over                                                                            |
| A required reference field is L004 on an unknown target (`PROJECT @PROJECT.FOO`), so a name shape needs no list of projects                                                                                                                                                                    | one list (the `PROJECT` entities), never two (point 28)                                                                                                               |
| `CATEGORY` on a prose field with nested `REF` (`SOURCE`) is followed by `--skip`: the sources and the entities they reach leave the package (16 → 4 lines)                                                                                                                                     | provenance costs nothing on a `context` that does not ask for it                                                                                                      |
| `DEFAULT` accepts a reference (`DEFAULT @PROJECT.X`), `new` prints it commented                                                                                                                                                                                                                | available, not retained (above)                                                                                                                                       |
| `GATE suppressed` silences every diagnostic of the entity, L016 included: an archived task whose anchors are gone lints clean                                                                                                                                                                  | an archived entity kept indefinitely costs no lint noise                                                                                                              |
| `show --json` exposes the schema's `DEFAULT` atom, at type level and inside a `WHEN`; `refs --json` carries file, line, field path and the source's status per site; `status --json` carries `incoming` per entity                                                                             | the whole cleanup pass is 80 lines over four JSON reads and `lint --strict`, no parser of its own (point 31)                                                          |
| Every command but `show FILE` and the `file:line` of `status TYPE`, `refs` and `lint` is layout-blind: `status`, `context --with-schema`, `lint --closure` byte-identical across four layouts, `diff` reports nothing on an entity moved between files, the schema file's name is a convention | the file layout is a git and review choice, never a retrieval one: moving an entity costs the tool nothing, and a per-type split needs no domain judgement (point 32) |
| Two `--where FIELD!=value` cumulate (`STATUS!=implemented --where STATUS!=archived`)                                                                                                                                                                                                           | « draft or todo » is written without an OR                                                                                                                            |
| The manual settles `PROJECT`: an ordinary type, « one entity per corpus » being the starter's convention; three entities lint clean                                                                                                                                                            | the keyword row of this table is closed                                                                                                                               |

## Prompts de reprise (étape 0 du Migration outline, en deux sessions)

Ordre : le scan d'abord (session 1, Sonnet 5), la synthèse ensuite (session 2, Fable 5.1) — la synthèse lit le
résultat du scan dans ce fichier. Modèle conseillé en tête de chaque prompt.

### Session 1 — scan des sessions (modèle conseillé : Sonnet 5) — fait le 2026-09-16, voir « Scan des sessions (rétrospective, 2026-09-16) »

```
Corpus cleanup, rétrospective, partie 1 : le scan des sessions. Fichier de travail :
docs/awawa-workflow-cleanup/work_in_progress.md (main worktree, non suivi par git ; on y écrit directement, c'est
voulu). Lis-en la section « Ce que les sessions ont montré (scan du 2026-09-16) » et la section « Défauts et forces
d'awawa » ; ne lis rien d'autre du fichier, ni aucun fichier du projet ou du corpus. On ne migre rien, on ne crée
aucun fichier .awawa, on n'écrit que dans work_in_progress.md.

Tâche : reproduire et étendre le scan du 2026-09-16 par script, sans lire les transcripts à la main. Source : les
transcripts JSONL de ce projet (~/.claude/projects/-home-chillie-Web-planet-crafter-save-tools/*.jsonl), deux
périodes séparées : (A) du tag `before-awawa` (2026-09-11 17:23) à l'ouverture de ce travail de raffinement, (B) les
sessions du raffinement lui-même (celles qui écrivent dans work_in_progress.md). Scripts et résultats intermédiaires
dans le scratchpad, jamais dans le projet.

Mesures, par période, en tableaux : nombre de sessions et de messages utilisateur ; commandes `awawa` par
sous-commande (status, context, show, refs, lint, fmt, new, diff) et part des `context` contre `show` + `cat`/`sed`
sur des fichiers .awawa ; lints lancés et en échec, règles en cause (L0xx) ; caractères de résultats d'outils, part
venant du corpus, part venant des instructions injectées (skill awawa, /awawa-pr-review, autres skills) ; longueur
moyenne des réponses de l'assistant ; messages utilisateur qui demandent un tableau, un recap ou une correction
(liste des verbatims courts, datés, sans interprétation) ; pour la période B seulement : nombre de sondes sur corpus
jetable (répertoires p* du scratchpad), et commandes awawa par entité revue.

Livrable : une nouvelle section « Scan des sessions (rétrospective, <date>) » insérée juste avant « ## Challenge du
squelette précédent », tableaux seulement, chaque mesure avec la commande ou le script qui la produit (chemin dans
le scratchpad). Aucune recommandation, aucune interprétation : la synthèse est l'affaire de la session suivante.
Termine par la mise à jour de ce prompt (marque-le fait, avec la date).
```

### Session 2 — synthèse et méthode de bootstrap (modèle conseillé : Fable 5.1) — fait le 2026-09-16

Livrable écrit directement dans `docs/awawa-usage-reports/migration/2026-09-16-corpus-bootstrap-method.md` (choix de
l'utilisateur en séance, contredisant le prompt ci-dessous sur ce seul point : pas de section « Rétrospective —
proposition à l'équipe awawa » dans ce fichier, pas de déplacement ultérieur). Ordre des trois premières étapes
retenu : seuil, lecteur, pivot. Défauts et forces annexés intégralement. Étape 0b (nettoyage manuel de `docs/`)
reste à faire par l'utilisateur avant l'étape 1.

```
Corpus cleanup, rétrospective, partie 2 : la synthèse. Fichier de travail :
docs/awawa-workflow-cleanup/work_in_progress.md (main worktree, non suivi par git ; on y écrit directement, c'est
voulu). Lis-le en entier, puis findings.md dans le même dossier. Ne lis aucun autre fichier du projet ni du corpus ;
le corpus actuel (docs/) se lit par l'outil seulement (awawa show, status, refs, context). Les sondes se font sur un
corpus jetable dans le scratchpad, jamais dans le projet. On ne migre rien, on ne crée aucun fichier .awawa, on
n'écrit que dans work_in_progress.md. Prérequis : la section « Scan des sessions (rétrospective) » existe (session 1
faite) ; sinon arrête-toi et dis-le.

La revue de la « Structure de corpus cible » est terminée (14 étapes, points 9–32, aucun point ouvert). Étape 0 du
Migration outline (point 21) : écrire la proposition pour l'équipe awawa sur la manière de démarrer un corpus dans un
projet qui n'en a pas — une méthode de bootstrap, réutilisable pour la seconde migration. Matériau : les deux scans
(2026-09-16 et rétrospective), le « Challenge du squelette précédent », les 32 points tranchés et ce qu'ils ont coûté
à établir, la section « Défauts et forces d'awawa ».

Commence par proposer le plan du livrable et attends ma réponse : ce qu'il affirme (les étapes du bootstrap, dans
l'ordre, chacune avec la mesure qui la justifie), ce qu'il refuse (ce qui a été essayé et mesuré comme coûteux :
squelette à six types, historique dans le corpus, recommandations stockées, sur-enregistrement), sa forme (un
rapport d'usage unique, dans docs/awawa-usage-reports/, jamais dans le corpus) et ce qui en revient au projet
(les levers de commandes et de style hors corpus, listés à la fin du scan du 2026-09-16). Après ratification du
plan, écris le livrable dans work_in_progress.md, section « Rétrospective — proposition à l'équipe awawa », en
anglais (il est destiné à être publié) ; son déplacement dans docs/awawa-usage-reports/ est une étape ultérieure,
après l'étape 0b (nettoyage manuel de docs/ par l'utilisateur, un rappel, pas une instruction). Termine par la mise
à jour du Migration outline et de ce prompt.
```
