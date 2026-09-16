# 2026-09-16 — Starting an awawa corpus in a project that has none: a bootstrap method

| Field                                           | Value                                                                                                                                                                                                                             |
|-------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Author of this report**                       | Claude Fable 5.1, effort unchecked (interactive session)                                                                                                                                                                          |
| **Models that drove the sessions under review** | Sonnet 5 for the session scan (retrospective, part 1), Fable 5.1 for the review of the target structure and this synthesis; the models of the 56 sessions of period A are unchecked (transcripts read by script only)             |
| **Sessions measured**                           | period A: 56 sessions from tag `before-awawa` (2026-09-11 17:23:31+02:00) to the first write in `work_in_progress.md` (2026-09-16 10:19:40 UTC); period B: the 3 sessions of the refinement work; scripts `scan.py`, `metrics.py` |
| **Delivered**                                   | a bootstrap method in ten steps, what it refuses and why, the tool's defects and strengths observed on `awawa 2.7.0`, and the proposals to the awawa team that follow from them                                                   |

This report is addressed to the awawa team. It is not a per-pull-request report: it measures five days of a first
corpus (137 `DECISION`, 61 `OPEN_QUESTION`, 12 `TASK`, 7 `PACKAGE` on 2026-09-15) and one day of designing its
replacement, and it says what a project starting its first corpus should do in which order. The same method is
reused for this project's own second migration.

## Verdict in two lines

**Ours**: the first corpus was written for the writer — every ruling under one type and one four-value `STATUS`
ladder, history kept as entities, everything recorded — and read one entity at a time; 32 rulings and 45 throwaway
corpora later, the target keeps four ruling shapes, one archive mechanism and a schema line for every recording
threshold, so that the tool checks what the review skill used to ask.

**The tool's**: `awawa 2.7.0` checks what a schema declares — required and nested-required fields, anchors to the
symbol, shapes on values, `WHEN`-gated requirements, converses — reliably enough to carry the method; what it lacks
is listings (`--where` on a nested field, on a `WHEN`-only field, on a default), an any-of requirement, and a
canonical entity order.

## The numbers the verdict rests on

| # | Measure                                                   | Period A (56 sessions) | Period B (3 sessions) | Command / source                  |
|---|-----------------------------------------------------------|------------------------|-----------------------|-----------------------------------|
| 1 | User messages typed                                       | 342                    | 17                    | `metrics.py sessions_messages`    |
| 2 | `awawa` commands                                          | 688                    | 54                    | `metrics.py awawa_commands`       |
| 3 | `context` calls vs `show` + `cat`/`sed` on `.awawa` files | 19 vs 249              | 8 vs 9                | same                              |
| 4 | `lint` invocations, of which exit ≠ 0                     | 123, 3                 | 7, 3                  | `metrics.py lints`                |
| 5 | L016 (anchor) findings among all lint findings            | 52 of 93               | 0 of 15               | same                              |
| 6 | Share of tool-result characters coming from the corpus    | 41.8 % of 4.13 M       | 15.4 % of 0.47 M      | `metrics.py tool_chars_by_source` |
| 7 | Share coming from injected skill instructions             | 23.2 %                 | 10.7 %                | `metrics.py injected`             |
| 8 | Mean length of an assistant text block (characters)       | 1 026                  | 1 136                 | `metrics.py response_len`         |
| 9 | User messages asking for a table, a recap or a correction | 29                     | 3                     | `metrics.py user_asks`            |

| #  | Measure on the corpus                                                     | Value                                                                                                                                                           | Perimeter                                                      |
|----|---------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------|
| 1  | History lines written in edits                                            | 47 `STATUS superseded`, 26 `SUPERSEDES`, 34 `CLOSES`, 44 `:v2`, 231 `STATUS implemented/specified`                                                              | period A edits, scan of 2026-09-16                             |
| 2  | Dead entities loaded by every `context` that reaches them                 | 40 closed questions + 6 superseded decisions                                                                                                                    | branch `docs/corpus-cleanup`, 2026-09-15                       |
| 3  | Questions written only to be closed (husks: `DESC` + `STATUS superseded`) | 8 of 61                                                                                                                                                         | same                                                           |
| 4  | `draft` entities                                                          | 0 of 198                                                                                                                                                        | same                                                           |
| 5  | New entities in period A                                                  | 13 `DECISION`, 11 `OPEN_QUESTION`, 10 `TASK`                                                                                                                    | `awawa new` calls, scan of 2026-09-16                          |
| 6  | Live questions on which a task waits                                      | 0 of 20                                                                                                                                                         | `status OPEN_QUESTION docs`, `show`, 2026-09-16                |
| 7  | Entities whose subject is the tool, not the project                       | 3 limitations of awawa, 4 rules that had left for the general instructions                                                                                      | `findings.md` §5; removed on request three times (14–15 Sept.) |
| 8  | `SOURCE` lines / entities / nested `REF` to a source entity               | 227 / 207 / 0                                                                                                                                                   | `show FILE --json`, 2026-09-16                                 |
| 9  | `SOURCE` lines citing a pull request in prose / distinct numbers          | 162 / 44                                                                                                                                                        | same                                                           |
| 10 | `SOURCE` lines citing a usage-report path that no longer exists           | 19                                                                                                                                                              | PR #93 moved the files; nothing reported it                    |
| 11 | Fields hiding in `DESC`/`RATIONALE` prose                                 | 21 occurrences of 5 recurring openings                                                                                                                          | `findings.md` §4                                               |
| 12 | Cost of settling the target structure                                     | 32 rulings, 14 review steps, 45 named throwaway corpora + 17 lettered variants, 141 probe rows, 9 refused forms, 23 defects, 25 strengths, one day (2026-09-16) | `work_in_progress.md`, counted by `grep`/`awk`                 |

The scan of 2026-09-16 (80 sessions, 1 172 `awawa` commands, 22 failed lints) and the retrospective scan (59
sessions, 742 commands, 6 exits ≠ 0) differ by perimeter: the first counts every session up to its own run,
including about 21 sessions of 2026-09-16 that belong to neither period, and counts a lint as failed on any finding
rather than on its exit code. This report cites the retrospective figures, which are split by period and
reproducible by script.

## Part A — Us: the method

### The bootstrap, in ten steps

Each step names what to do, the measure that justifies it, and what the tool then checks in place of a rule to
remember. The order is the order of dependence: a later step assumes the earlier ones.

#### 1. Decide the recording threshold before the first schema line

Record a decision only if a future pull request could do the reverse by mistake; a question only if a task is
blocked on it; a limitation only if it is the project's; nothing about the tool, nothing that is a general rule
living elsewhere, nothing about the product until the corpus is asked to specify it. Write each threshold as a
required reference field, so that lint enforces it.

| # | Measure                                                                               | Value                                                                                                                                         |
|---|---------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------|
| 1 | Entities created per task created, period A                                           | 13 decisions and 11 questions for 10 tasks                                                                                                    |
| 2 | User messages on over-recording                                                       | 2026-09-14 « l'ia s'est emballée », 2026-09-15 « trop de décisions que je n'aurais pas consigné », 2026-09-12 « 80 décisions c'est beaucoup » |
| 3 | Live questions that block a task                                                      | 0 of 20; 7 block a decision, 7 a package, 6 nothing                                                                                           |
| 4 | Entities about the tool or about a rule that had left the project, removed on request | 7, three removal requests                                                                                                                     |
| 5 | What the tool checks once `BLOCKS @TASK` is `REQUIRED` on `OPEN_QUESTION`             | L006 on every question no task waits on (probe p21)                                                                                           |

The review skill of the first corpus asked for « every decision in the corpus ». That sentence produced the
over-recording; the threshold replaces it with one schema line per type.

#### 2. Fix the reading loop before choosing the edges

Decide which commands a session runs (`status` to orient, `context` with `--skip` to load a package, `refs` then
`show` for what points at an entity) and what each one costs, then choose the direction of every edge so that
`context` finds what a session needs.

| # | Measure                                                                   | Value                                                                             |
|---|---------------------------------------------------------------------------|-----------------------------------------------------------------------------------|
| 1 | `context` calls against one-entity reads (`show`, `cat`, `sed`), period A | 19 against 249: the corpus was written for `context` and read entity by entity    |
| 2 | `context @TASK.T45 --depth 1` on the live corpus                          | 196 lines; 68 with `--skip reasoning`                                             |
| 3 | `context` on a planning pivot whose edges are all incoming (`TASK`)       | 1 entity, 3 lines at any depth: `context` expands outgoing edges only (probe p22) |
| 4 | `context` with `CATEGORY provenance` on `SOURCE` and `--skip provenance`  | 16 → 4 lines on one decision (probe p25)                                          |

Consequence in the target: `CATEGORY reasoning` on `REJECTED` and `RATIONALE`, `CATEGORY provenance` on `SOURCE`, so
the default read is the obligations and their anchors; a task's package is read as `refs` plus one `show` per
entity, and the method says so instead of flipping edges to fake a traversal.

#### 3. Write the planning pivot first

`TASK` is the only type with a lifecycle (`draft|todo|implemented|archived`), its name is its identifier (the
Conventional Commits type of the task, upper-cased, and one global number: `FIX45`), and every other type points at
it (`BLOCKS`, `APPLIES_TO_TASK`, `UNTIL`, `DELIVERED_BY`'s converse). Start there: a corpus with tasks and nothing
else already plans.

| # | Measure                                                                                            | Value                                                                                                                                           |
|---|----------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------|
| 1 | `STATUS` values carrying information, first corpus                                                 | `TASK` 11 `implemented` / 1 `specified`; `PACKAGE` 7 of 7 `implemented`; `processus` decisions 20 `specified` that no anchor could ever promote |
| 2 | Incoming edges on the 12 live tasks                                                                | `BEFORE`, `BLOCKED_BY`, `GOVERNED_BY` — every planning question is answered on the task                                                         |
| 3 | Pull-request reference written as free text                                                        | `PR "62"` and `PR "#90"` on the same corpus, two on one task                                                                                    |
| 4 | What the tool checks with `DELIVERED_BY @PULL_REQUEST` not repeatable, required once `implemented` | L010 on a second pull request, L006 on a delivered task without one (probe p22)                                                                 |
| 5 | Task kind as a name prefix, set closed by the shape                                                | a wrong prefix is L024; `@TASK.FIX45` says the kind in every citation, branch and title                                                         |

#### 4. One archive mechanism, no history in the corpus

Declare `STATUS active|archived` once on `SCHEMA *`, `DEFAULT active`, `WHEN STATUS archived GATE suppressed`
requiring `ARCHIVED_ON`. An entity that stops binding is archived in the pull request that ends it; a ruling
replaced on the same subject is rewritten in place under its name, the previous form becoming a `REJECTED` line when
it teaches something. No `superseded`, no `SUPERSEDES`/`CLOSES` and their converses, no `:vN`.

| # | Measure                                  | Value                                                                                                                                                        |
|---|------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------|
| 1 | History written by hand in five days     | 47 `superseded`, 26 `SUPERSEDES`, 34 `CLOSES`, 44 `:v2`, 231 `STATUS` lines                                                                                  |
| 2 | Dead weight loaded by `context`          | 46 entities; 8 questions existed only to be closed                                                                                                           |
| 3 | `draft` as a state                       | 0 of 198 entities: a ruling not ratified is a pull request under review                                                                                      |
| 4 | What the tool does on an archived entity | not expanded, named in the `context` footer, references still valid and counted, `REQUIRED` fields no longer demanded even under `--strict` (probes C1, p11) |
| 5 | Cost per archive                         | two lines                                                                                                                                                    |

#### 5. A type only for a different shape

Split a type only when the set of required fields differs: `DECISION` (`REJECTED`, `SPEC › IMPL` to the repository),
`PROCESS` (the same without an anchor: how the work is led), `LIMITATION` (`SYMPTOM`, `UNTIL`, no `REJECTED`),
`FACT` (`DESC`, `ATTESTED_BY` or a hypothesis with `UNTIL`). The membership test is the one the tool runs: a
`DECISION` whose `SPEC` cannot name an `IMPL` is L006, and is a `PROCESS`. No family field (`KIND`), no type for a
family that shares a shape.

| # | Measure                                             | Value                                                                                                                                                          |
|---|-----------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------|
| 1 | Cost of the six-ruling-type skeleton first proposed | 5 schemas, 5 `WHEN` tables, a classification choice on every write, 137 entities to retype with every `@DECISION.X` site                                       |
| 2 | Cost with the shape criterion                       | about 13 retypes (3 limitations, ~10 processes) and ~8 facts written from prose                                                                                |
| 3 | A family read from prose and refuted by the tool    | `findings.md` §3 counted 6 facts paying a fictional `REJECTED`; `show` on the six: each has 2–3 substantive `REJECTED` and `SPEC › IMPL` to code — 0 to retype |
| 4 | Shared fields                                       | `FIELDSET Ruling` (`REJECTED` + `REF`, `UNTIL`) included by two types: one declaration (probe p15)                                                             |
| 5 | What the tool checks                                | L006 « required field IMPL is absent from DECISION.SPEC » classifies; `status PROCESS` lists the family (probe p15)                                            |

#### 6. Type the sources from the first schema

Declare `PROJECT` (`GIT_REPOSITORY`), `PULL_REQUEST` (`PROJECT`, `NUMBER`), `USAGE_REPORT` (`FILE` anchor,
`EVALUATES`), `URL` (`LOCATION` shape) on day one, and `SOURCE string` with a nested `REF reference` that is
`REQUIRED`. A provenance of a kind with no type cannot be parked in prose: L006 fires, and the type is declared in
the same pull request.

| # | Measure                                   | Value                                                                                                                                                                 |
|---|-------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| 1 | Provenance in prose, first corpus         | 227 `SOURCE` lines, 0 `REF` to a source entity, 162 citing a pull request by number                                                                                   |
| 2 | Cost of typing them late                  | 3 projects, ~44 pull-request entities, 227 lines to rewrite, ~53 with a date only whose pull request is found by `git log -S`                                         |
| 3 | Report paths that rotted silently         | 19 lines to files moved by PR #93; `FILE anchor` makes that L016                                                                                                      |
| 4 | Share of the design cost spent on sources | 23 of the 45 named throwaway corpora (p25–p35b), 5 of the 32 rulings                                                                                                  |
| 5 | What the tool checks                      | L004 on an unknown project, L006 on a `SOURCE` without `REF`, L007 on a malformed address, `refs @PULL_REQUEST.PCST62` lists what it produced (probes p25, p32, p35b) |

#### 7. Type everything that can be typed

Free text is limited to what cannot be a reference, an enum, a shape or a number. A date, an address, a repository,
an identifier is a `SHAPE`; a place in the repository is an `anchor` with `path::literal` (`MANIFEST`, `IMPL`,
`SEEN_IN`, `FILE`); a field legal in one state only is declared inside that state's `WHEN` block.

| # | Measure                                                                    | Value                                                                                                                                                            |
|---|----------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| 1 | The check that actually fires, period A                                    | L016 (anchors): 52 of 93 lint findings                                                                                                                           |
| 2 | Fields hidden in prose, first corpus                                       | `DESC "limitation acceptée, awawa 2.7.0 : …"` ×8, `DESC "garde : …"` ×5, `"la règle vit dans ~/.ai …"` ×4, `DESC "non : …"` ×3, `RATIONALE "rouvrir quand …"` ×1 |
| 3 | A required string satisfied by nothing                                     | `REJECTED ""` passes `--strict` (probe p11)                                                                                                                      |
| 4 | A removed or renamed package, with `MANIFEST "packages/x/package.json::x"` | L016 on the path, L016 on the literal (probe p24)                                                                                                                |
| 5 | A field declared only inside a `WHEN` block, written outside it            | L003 (probe p36x): conditional legality, on any enum field                                                                                                       |

#### 8. One file per type, the schema in one file, append at the end, English

The domain of an entity is in no field and no command reads a file name; a per-domain layout was a classification
choice at write time. Keep every declaration in `_schema.awawa`, one file per type, a new entity appended at the
end, the source types together. Write the corpus in the language the technical vocabulary is in, entity names
included.

| # | Measure                                                                 | Value                                                                                |
|---|-------------------------------------------------------------------------|--------------------------------------------------------------------------------------|
| 1 | `status`, `context --with-schema`, `lint --closure` across four layouts | byte-identical (md5), 34 entities                                                    |
| 2 | Entities misfiled by domain, first corpus                               | 3                                                                                    |
| 3 | `awawa diff` on an entity moved between files                           | 0 added, 0 removed, 0 changed                                                        |
| 4 | Rebase conflict between two pull requests adding to one file            | one hunk when both append at the end, none at different positions (`git merge-file`) |
| 5 | User messages on the corpus language                                    | 2 on 2026-09-15: a translated vocabulary makes the work hard to follow               |

#### 9. Ship the cleanup script with the first pull request

Archiving is the ending pull request's job; purging is a script's: archive every `implemented` task no `draft` or
`todo` task is `AFTER`, and every entity whose `UNTIL` names an implemented task; purge what is archived, `PURGE`
not false and 30 days past `ARCHIVED_ON`, atomically under `lint --strict`; delete every source entity at
`incoming 0`; open a pull request whose body is the report. Run by hand, no schedule.

| # | Measure                    | Value                                                                                                                                                             |
|---|----------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| 1 | Draft of the pass          | 80 lines of Python over `status --json`, `show --json`, `refs --json`, `lint --strict`, `fmt` (probe p36p)                                                        |
| 2 | What it did on 20 entities | 4 purged with their reference lines, 1 kept on `PURGE false`, 1 kept because its purge broke lint (restored, reported), 3 sources deleted, one on the second loop |
| 3 | Without it                 | step 4 does not hold: the archive becomes the history it replaced                                                                                                 |

#### 10. Probe every schema line on a throwaway corpus before writing it in the project

Every row of the target was probed on `awawa 2.7.0` in the session's scratchpad before ratification, and each ruling
carries its probe. What the tool refused or accepted silently went into the defects and strengths tables of this
report, never into the corpus.

| # | Measure                                            | Value                                                                                                                                                                                                      |
|---|----------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| 1 | Throwaway corpora                                  | 45 named (`p9`…`p36x`) + 17 lettered variants                                                                                                                                                              |
| 2 | Probe rows recorded                                | 141; refused forms 9                                                                                                                                                                                       |
| 3 | Lint rules cited in the design file                | L006 ×47, L016 ×26, L003 ×16, L004 ×15, L024 ×14, L010 ×13                                                                                                                                                 |
| 4 | Rulings whose first form did not survive its probe | `pr_id` (dropped, then reinstated with another meaning), `UNKNOWN_SOURCE` (dropped), `REOPEN_WHEN` (replaced), `PURGE DEFAULT false` (reversed), `WHEN`-only `ATTESTED_BY`/`UNTIL` (too strict, re-probed) |
| 5 | Defects and strengths collected                    | 23 and 25, in part B                                                                                                                                                                                       |

### The first schema, as what `awawa new` asks

The write-time cost of the target, probed on 2.7.0: the required lines a writer must fill per type.

| #  | Type            | Required lines                                     | At a later state                               | Probe    |
|----|-----------------|----------------------------------------------------|------------------------------------------------|----------|
| 1  | `DECISION`      | `REJECTED`, `SPEC`, `SPEC › IMPL`                  | —                                              | p15      |
| 2  | `PROCESS`       | `REJECTED`, `SPEC`                                 | —                                              | p15      |
| 3  | `LIMITATION`    | `SYMPTOM`, `UNTIL`                                 | —                                              | p16      |
| 4  | `FACT`          | `DESC`, `ATTESTED_BY` (or `UNTIL` on a hypothesis) | —                                              | p19, p20 |
| 5  | `OPEN_QUESTION` | `DESC`, `BLOCKS @TASK`                             | —                                              | p21      |
| 6  | `TASK`          | `TITLE`, `STATUS`, `SPEC`                          | `SPEC › IMPL`, `DELIVERED_BY` once implemented | p22      |
| 7  | `PACKAGE`       | `DESC`, `MANIFEST`                                 | —                                              | p24      |
| 8  | `PULL_REQUEST`  | `PROJECT`, `NUMBER`                                | —                                              | p32      |
| 9  | `PROJECT`       | `GIT_REPOSITORY`                                   | —                                              | p32      |
| 10 | `USAGE_REPORT`  | `FILE`                                             | —                                              | p34      |
| 11 | `URL`           | `LOCATION`                                         | —                                              | p18      |

`STATUS`, `ARCHIVED_ON` and `PURGE` are never written on an active entity (L003 outside the `WHEN` block); a `SOURCE`
line costs its `REF`.

### What went wrong in the first corpus, and what it refuses

| #  | What                                                                                           | Evidence                                                                                                             | Whose fault      |
|----|------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------|------------------|
| 1  | Six ruling types under one four-value ladder, then a six-type skeleton with five-value ladders | `processus` 20 `specified` never promotable; 5 schemas and 137 retypes costed before the shape criterion replaced it | corpus modelling |
| 2  | History kept as entities                                                                       | 47 `superseded`, 44 `:v2`, 8 husk questions, 46 dead entities in `context`                                           | schema           |
| 3  | Recommendations stored on questions                                                            | 9 of 20 live questions carry one; one was ratified without examination against the code                              | method           |
| 4  | Over-recording, tool defects and general rules in the project's corpus                         | 24 rulings for 10 tasks; 7 entities removed on three requests                                                        | conduct, method  |
| 5  | Corpus by domain, schema beside its data                                                       | 3 entities misfiled; the layout is read by no command                                                                | corpus modelling |
| 6  | Provenance in prose                                                                            | 227 lines, 0 typed; 19 dead paths                                                                                    | schema           |
| 7  | A placeholder type for an unknown source (`UNKNOWN_SOURCE`)                                    | need measured at 0; three more writes than declaring the type                                                        | corpus modelling |
| 8  | A second task type for the archive (`ARCHIVED_TASK` + `ID`)                                    | `fmt --rename` refuses a type change, L009 on every `@TASK` slot, an `ID` string is read by nothing                  | corpus modelling |
| 9  | A family field (`KIND`) on decisions, on tasks, on packages                                    | refused three times: it restates a shape, a name prefix or a name segment                                            | corpus modelling |
| 10 | The corpus read as files                                                                       | 108 `cat`/`sed` on `.awawa` in period A against 19 `context`; the rule existed                                       | conduct          |
| 11 | The corpus written in French with English type names                                           | 2 user messages on 2026-09-15                                                                                        | method           |

### Remediations, by return

| # | Change                                                                                                       | What it fixes                                                     |
|---|--------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------|
| 1 | The ten steps above, in that order, for this project's second migration and for any project's first corpus   | the ten rows of the table above                                   |
| 2 | The review skill's « every decision in the corpus » replaced by the thresholds of step 1, each a schema line | over-recording; the skill no longer needs the sentence            |
| 3 | The usage-report template gets a tag line at its top before the first `USAGE_REPORT` entity is written       | `FILE path::tag` makes a report written outside the template L016 |

### What stays with the project, outside the corpus

Four levers weigh more on the quota than the corpus does and are not the corpus's to fix; they are named here and
left to the project's commands and style.

| # | Lever                                    | Measure, period A                                                                                 |
|---|------------------------------------------|---------------------------------------------------------------------------------------------------|
| 1 | Instructions injected by skills          | 23.2 % of tool-result characters; `update-config` 522 303, `awawa` 167 351 over 43 calls          |
| 2 | Raw reads of corpus files                | 108 `cat`/`sed` on `.awawa` against 19 `context`                                                  |
| 3 | Length of assistant answers              | 1 026 characters per text block; 29 of 342 user messages ask for a table, a recap or a correction |
| 4 | String-continuation syntax errors (L014) | 54 lines (scan of 2026-09-16)                                                                     |

## Part B — The tool

### What went well

Every strength below was observed on 2.7.0 on 2026-09-16, on the probes named in part A; the second column says
what it buys a project that follows the method.

| #  | Promise                                                                                                                                                                                                                                                                                        | Kept | Evidence                                                                                                                                                   |
|----|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------|------------------------------------------------------------------------------------------------------------------------------------------------------------|
| 1  | `REQUIRED` is gated by the wildcard's `WHEN STATUS`: an archived entity missing a required field passes even `--strict`                                                                                                                                                                        | yes  | archiving costs two lines, never a rewrite to keep lint clean                                                                                              |
| 2  | A nested `REQUIRED` (`IMPL` under `SPEC`) is enforced, with the path in the message (`DECISION.SPEC`)                                                                                                                                                                                          | yes  | « a decision holds somewhere » is checked by the tool, and the check classifies `PROCESS`                                                                  |
| 3  | A field declared only inside a `WHEN` block is L003 outside it, on any enum field, not only `STATUS`                                                                                                                                                                                           | yes  | conditional legality, the nearest thing to exclusivity                                                                                                     |
| 4  | L016 resolves an anchor to the symbol (`path::literal`), in code and in the corpus's own schema file                                                                                                                                                                                           | yes  | an obligation is falsifiable at the symbol                                                                                                                 |
| 5  | `refs` prints the field name of every site (`REJECTED.REF`, `APPLIES_TO_TASK`) under a shared `CONVERSE`                                                                                                                                                                                       | yes  | one converse name for two fields, still distinguishable                                                                                                    |
| 6  | `INCLUDE @FIELDSET.X` splices a set of fields into a type: nested fields, `REQUIRED`, `CATEGORY` and `CONVERSE` travel with it, `--skip`, `refs` and `new` read the spliced fields as the type's own                                                                                           | yes  | `REJECTED` and `UNTIL` declared once for `DECISION` and `PROCESS`: no second copy to keep aligned by hand, and a third ruling type would cost one line     |
| 7  | A duplicate `SCHEMA` block is L005, never merged                                                                                                                                                                                                                                               | yes  | no silent override                                                                                                                                         |
| 8  | A `SHAPE` types a field, not only a `NAME`: `LOCATION url`, `ARCHIVED_ON date` are checked at the value by L007                                                                                                                                                                                | yes  | a string with a shape is a typed field: an address, a date, an identifier are refused when malformed, with no code to write                                |
| 9  | A wildcard prose field redeclared on one type with `REQUIRED` (`DESC` on `FACT`) is enforced there only (L006), and `new` prints it first                                                                                                                                                      | yes  | `DESC` optional everywhere, mandatory where it is the entity's substance                                                                                   |
| 10 | A `WHEN` on any enum field reads that field's `DEFAULT`, and a field declared only inside the block is L003 outside it (`BASIS attested\|hypothesis` on `FACT`)                                                                                                                                | yes  | an any-of requirement (`ATTESTED_BY` / `UNTIL`) costs one enum field, and the common case writes nothing                                                   |
| 11 | A declared type with zero entities lints clean and `status` prints it at 0                                                                                                                                                                                                                     | yes  | a type can be declared ahead of its first entity                                                                                                           |
| 12 | An anchor's `::literal` is a raw text search in the file (`package.json::core-mapping`), reported by L016 with the literal and the file                                                                                                                                                        | yes  | a package entity is tied to its manifest by name: a removed package and a renamed one are both lint errors, one line per package                           |
| 13 | A required reference field (`BLOCKS @TASK` on `OPEN_QUESTION`) turns a recording threshold into L006, and `context` on the target prints untyped incoming edges (`DESC.REF`) under `referenced by`                                                                                             | yes  | « a question is recorded only if a task waits on it » is checked by lint; a challenged decision sees its question without a typed field                    |
| 14 | A `WHEN` block can require a **nested** field (`IMPL` under `SPEC` once `STATUS implemented`) and a reference field (`DELIVERED_BY`)                                                                                                                                                           | yes  | « an acceptance criterion is proven at delivery » and « a delivered task names its pull request » are L006, not rules to remember                          |
| 15 | A nested `REQUIRED` under an optional wildcard prose field (`REF` under `SOURCE`) fires only when the parent is written, on every occurrence of it, and stays gated by `STATUS`                                                                                                                | yes  | « a source is an entity » is L006 the day a provenance is written in prose alone, with no placeholder type to carry the case                               |
| 16 | `--where` on a repeatable reference field with a `STATUS` filter (`--where STATUS==todo --where AFTER==@TASK.X`), and `refs --json` carrying the source's `status`                                                                                                                             | yes  | the archive test of the cleanup pass is one command; stale edges onto an implemented task are listed by the same call                                      |
| 17 | A non-repeatable reference field (`DELIVERED_BY`) is L010 on a second line                                                                                                                                                                                                                     | yes  | « one task is one pull request » is checked, the decision that said it is not carried over                                                                 |
| 18 | A required reference field is L004 on an unknown target (`PROJECT @PROJECT.FOO`), so a name shape needs no list of projects                                                                                                                                                                    | yes  | one list (the `PROJECT` entities), never two                                                                                                               |
| 19 | `CATEGORY` on a prose field with nested `REF` (`SOURCE`) is followed by `--skip`: the sources and the entities they reach leave the package (16 → 4 lines)                                                                                                                                     | yes  | provenance costs nothing on a `context` that does not ask for it                                                                                           |
| 20 | `DEFAULT` accepts a reference (`DEFAULT @PROJECT.X`), `new` prints it commented                                                                                                                                                                                                                | yes  | available, not retained (see the defects)                                                                                                                  |
| 21 | `GATE suppressed` silences every diagnostic of the entity, L016 included: an archived task whose anchors are gone lints clean                                                                                                                                                                  | yes  | an archived entity kept indefinitely costs no lint noise                                                                                                   |
| 22 | `show --json` exposes the schema's `DEFAULT` atom, at type level and inside a `WHEN`; `refs --json` carries file, line, field path and the source's status per site; `status --json` carries `incoming` per entity                                                                             | yes  | the whole cleanup pass is 80 lines over four JSON reads and `lint --strict`, no parser of its own                                                          |
| 23 | Every command but `show FILE` and the `file:line` of `status TYPE`, `refs` and `lint` is layout-blind: `status`, `context --with-schema`, `lint --closure` byte-identical across four layouts, `diff` reports nothing on an entity moved between files, the schema file's name is a convention | yes  | the file layout is a git and review choice, never a retrieval one: moving an entity costs the tool nothing, and a per-type split needs no domain judgement |
| 24 | Two `--where FIELD!=value` cumulate (`STATUS!=implemented --where STATUS!=archived`)                                                                                                                                                                                                           | yes  | « draft or todo » is written without an OR                                                                                                                 |
| 25 | The manual settles `PROJECT`: an ordinary type, « one entity per corpus » being the starter's convention; three entities lint clean                                                                                                                                                            | yes  | the keyword question is closed                                                                                                                             |

### What went wrong

Every defect below was observed on 2.7.0 on 2026-09-16 against a throwaway corpus (checked against a run); the
second column says what it costs a project that follows the method.

| #  | Defect                                                                                                                                                                                                                                                                | Observation                                                                                                                                                                                    | Checked against |
|----|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------|
| 1  | A slot cannot name several reference types (`@PULL_REQUEST\|@USAGE_REPORT` is L020); `reference` checks existence only                                                                                                                                                | a provenance field is either untyped or split into one field per source type                                                                                                                   | run             |
| 2  | `status` prints `(none)` for an entity that omits a `STATUS` with a `DEFAULT`, and `--where` cannot select on the default                                                                                                                                             | « the active ones » is `STATUS!=archived`; a `DEFAULT` is read by gating but by no listing                                                                                                     | run             |
| 3  | A schema entry accepts no prose field beyond `DESC`, `RATIONALE`, `SPEC` (L023), and `DESC` is required on it (L022)                                                                                                                                                  | the wildcard cannot make `DESC` a schema-only field; entity `DESC` and schema `DESC` share one name                                                                                            | run             |
| 4  | An entity name is an identifier: the hyphen is refused (`core-mapping` is L017), so a package cannot carry its manifest name                                                                                                                                          | `package_name` writes `core_mapping` for `core-mapping`; the `::literal` of `MANIFEST` carries the mapping                                                                                     | run             |
| 5  | `PROJECT` is listed as a schema keyword yet accepted as a type and field name                                                                                                                                                                                         | none, once the manual is read: « ordinary project-level configuration »                                                                                                                        | manual, run     |
| 6  | A `REQUIRED` string is satisfied by `""` (`REJECTED ""` passes `--strict`)                                                                                                                                                                                            | the requirement is a prompt in `new`, not a proof; a fictional line costs nothing to write                                                                                                     | run             |
| 7  | No mutual exclusion between fields: `WHEN` is monotonic (L021) and keys on a value, never on a field's presence                                                                                                                                                       | exclusivity is written as one slot with alternatives, a `WHEN`-only field under a discriminant, or two types                                                                                   | run             |
| 8  | No « at least one of these fields » requirement: `REQUIRED` is per field, and nothing keys on a field's presence                                                                                                                                                      | « `ATTESTED_BY` or `UNTIL`, at least one » costs a discriminant `BASIS attested\|hypothesis` whose value the presence of `UNTIL` already says, one word per hypothesis                         | run             |
| 9  | `--where` sees no nested field (`IMPL`, `ENFORCED_BY` under `SPEC`: exit 2 « not a field of DECISION »)                                                                                                                                                               | « the decisions enforced by a workflow » is `grep -n ENFORCED_BY`, not a listing                                                                                                               | run             |
| 10 | `context` expands outgoing edges only; what points at the root is a footer of names                                                                                                                                                                                   | a planning pivot whose edges are all incoming (`TASK`: blocked by, governed by, retired) reads as `refs` plus one `show` per entity, never as one package                                      | run, manual     |
| 11 | `--where` compares text: `WAVE "4"` is refused by L007 on a `uint` field yet selected by `--where WAVE==4`                                                                                                                                                            | none once the corpus lints; a listing on a dirty corpus can include what lint refuses                                                                                                          | run             |
| 12 | `new` summarises a `WHEN` block by its top-level fields (« SPEC (required) ») and omits a nested requirement (`IMPL`)                                                                                                                                                 | the writer learns the nested requirement from L006, not from the skeleton                                                                                                                      | run             |
| 13 | `NAME` is not a `--where` field                                                                                                                                                                                                                                       | no listing by name prefix: `status TASK` + grep                                                                                                                                                | run             |
| 14 | A name cannot be built from a field, and no field from another: the tool addresses an entity by its name only                                                                                                                                                         | a pull request's name must repeat its project and number (`PCST62` beside `PROJECT`, `NUMBER`), and nothing checks that the three agree                                                        | run             |
| 15 | `WHEN` on a reference field (`WHEN PROJECT @PROJECT.Ai`) is accepted by lint and inert: no requirement fires, `new` prints nothing                                                                                                                                    | a per-project requirement cannot be written; the silence hides the error                                                                                                                       | run             |
| 16 | A type declared `EXTERNAL` loses more than L004: `refs` on one of its names prints the sites then exits 1 « not defined », `show` refuses, no converse is computed, and its `NAME` shape is not checked on the references (`@PULL_REQUEST.Foo` passes)                | a source type cannot be external without losing its hub role                                                                                                                                   | run             |
| 17 | `DEFAULT @PROJECT.X` on a reference field: the schema line itself counts as a reference site (`refs`: `@SCHEMA.PULL_REQUEST FIELD.DEFAULT`), and the defaulted edge is invisible to `refs`, `status` and `--where`                                                    | a default on a reference saves a line and loses the listing                                                                                                                                    | run             |
| 18 | `status` sorts names as text (`100` before `62`)                                                                                                                                                                                                                      | none with a project prefix; a numeric name would list out of order                                                                                                                             | run             |
| 19 | `--where` does not know a field declared only inside a `WHEN` block until one entity of the type writes it: « `PURGE` is not a field of LIMITATION in this workspace », exit 2; a type-level field with no writer lists 0                                             | the cleanup pass cannot list « archived and `PURGE` not false » with `--where`; it reads `show --json` per archived entity                                                                     | run             |
| 20 | `new` prints one `WHEN STATUS archived` line per declaration when a type shadows a block of the wildcard                                                                                                                                                              | two lines for one condition; avoided by not shadowing                                                                                                                                          | run             |
| 21 | The `referenced by` footer of `context` (`BLOCKED_BY (root, 1): @OPEN_QUESTION.Ruled`) does not say the source is archived                                                                                                                                            | a todo task reads as blocked by a question already ruled; `refs --json` (`from.status`) tells                                                                                                  | run             |
| 22 | `fmt` keeps the entity order as written: there is no canonical order, so a new entity has no deterministic position; two pull requests appending at the end of the same file conflict at rebase (`git merge-file`, one hunk), at different positions they merge clean | one conflict per pair of parallel pull requests adding to the same type, resolved by keeping both blocks; a sorted canonical order would spread the insertions for free                        | run             |
| 23 | L006 names the missing field and its path, `suggestion` is `null` in `--json`; a reference to a type the schema does not declare is L004, the message of a typo                                                                                                       | what to do when a `SOURCE` names no entity is read from the schema `DESC` (`show @SCHEMA.*`, `--with-schema`), not from the finding; « unknown source type » is not a diagnosis the tool makes | run             |

### Remediations

Proposals to the awawa team, each with what it would have changed on this work.

| #  | Proposal                                                                                                                                                        | What it would have changed on this work                                                                                                                                                                 |
|----|-----------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| 1  | `fmt` writes entities in a canonical order (by name, or by a declared sort key)                                                                                 | the accepted rebase conflict of the per-type layout disappears: two pull requests adding to `decisions.awawa` merge clean                                                                               |
| 2  | `--where` reads nested fields (`SPEC.IMPL`), fields declared only inside a `WHEN` block, and a `DEFAULT` value; `status` prints the default instead of `(none)` | « the active ones » becomes `STATUS==active`; the cleanup pass lists its candidates in one call instead of one `show --json` per archived entity; « enforced by a workflow » is a listing, not a `grep` |
| 3  | An any-of requirement (`REQUIRED ONE OF A, B`) or a `WHEN` keyed on a field's presence                                                                          | `FACT` loses its `BASIS` discriminant; a limitation's `UNTIL` could require « a task or a condition » without a union slot                                                                              |
| 4  | `REQUIRED` refuses an empty string                                                                                                                              | `REJECTED ""` stops passing `--strict`; a fictional line costs at least a word                                                                                                                          |
| 5  | `new` prints nested requirements under their parent and inside `WHEN` summaries                                                                                 | the writer learns `IMPL` is required from the skeleton, not from L006                                                                                                                                   |
| 6  | The `referenced by` footer of `context` marks an archived source                                                                                                | a todo task blocked by a ruled question reads as such without `refs --json`                                                                                                                             |
| 7  | A `WHEN` on a reference field is either honoured or refused by lint                                                                                             | a per-project requirement can be written, or its impossibility is an error instead of silence                                                                                                           |
| 8  | An `EXTERNAL` type keeps `refs`, `show` and its `NAME` shape on references                                                                                      | a source type could be external without losing its hub role                                                                                                                                             |
| 9  | L006 on a nested `REF` carries the schema `DESC` of the parent as its suggestion                                                                                | « no type fits: declare it in the same pull request » reaches the writer from the finding                                                                                                               |
| 10 | A name shape may reference fields (`NAME {PROJECT}{NUMBER}`), or lint checks a declared consistency                                                             | `PCST62` beside `PROJECT PCST` and `NUMBER 62` is checked instead of accepted                                                                                                                           |

## Recurring points

Previous reports of this folder were not read for this synthesis (the retrospective read `work_in_progress.md` and
`findings.md` only, by instruction); « times seen » is therefore unchecked except where the project's own
instructions record the count.

### Recurring pain points

| # | Point                                                | Times seen                                                                                                       | First raised in               | Seen again here                                                       | Remediation proposed then      | Done?                                                                                          |
|---|------------------------------------------------------|------------------------------------------------------------------------------------------------------------------|-------------------------------|-----------------------------------------------------------------------|--------------------------------|------------------------------------------------------------------------------------------------|
| 1 | The corpus read as files instead of through the tool | 8 consecutive reports (the user's instructions record `2026-09-12-pr-65.md` to `2026-09-15-pr-83.md`) + this one | `2026-09-12-pr-65.md`, part A | 108 `cat`/`sed` on `.awawa` in period A against 19 `context`          | a written rule                 | no: the rule exists and the ratio stands; the lever is outside the corpus (part A, last table) |
| 2 | Tool defects recorded in the project's corpus        | unchecked                                                                                                        | unchecked                     | 3 awawa limitations, 4 rules that had left, removed on three requests | the usage report as their home | partly: removed on request, not prevented; step 1 makes it a threshold                         |
| 3 | Over-recording                                       | unchecked                                                                                                        | unchecked                     | 24 rulings for 10 tasks in period A; three user messages              | none recorded                  | no; step 1 and `BLOCKS @TASK REQUIRED`                                                         |
| 4 | Provenance in prose                                  | unchecked                                                                                                        | unchecked                     | 227 `SOURCE` lines, 0 typed, 19 dead paths                            | none recorded                  | no; step 6                                                                                     |

Raised before and not seen again, closed by observation: unchecked.

### Recurring strengths

| # | Mechanism                            | Times seen | First noted in | Held again here                                                                               |
|---|--------------------------------------|------------|----------------|-----------------------------------------------------------------------------------------------|
| 1 | L016 anchors as the check that fires | unchecked  | unchecked      | 52 of 93 findings in period A; resolved at the symbol and inside a JSON fixture on the probes |
| 2 | `lint --strict` after every edit     | unchecked  | unchecked      | 123 invocations in period A, 3 exits ≠ 0; every probe corpus of period B left clean           |

Noted before and not seen holding here: unchecked.

## Follow-up on the previous report's remediations

Not applicable: this report is the first in `migration/` and the previous reports were not read (above).

## Appendix

### Measurements

Figures from `metrics.py` over the JSONL transcripts of this project (224 files), read by script only; active time
and token counts were not measured by the scan and are unchecked.

| # | Period | Sessions | User turns | `awawa` calls by subcommand                                                        | `cat`/`sed` on `.awawa` |
|---|--------|----------|------------|------------------------------------------------------------------------------------|-------------------------|
| 1 | A      | 56       | 342        | status 218, context 19, show 141, refs 24, lint 159, fmt 101, new 21, diff 5 (688) | 108                     |
| 2 | B      | 3        | 17         | status 15, context 8, show 2, refs 5, lint 9, fmt 9, new 6, diff 0 (54)            | 7                       |

| # | Period | `lint` invocations | exit ≠ 0 | Rules in the output                                                                                             |
|---|--------|--------------------|----------|-----------------------------------------------------------------------------------------------------------------|
| 1 | A      | 123                | 3        | L001:8, L003:9, L007:2, L010:1, L013:1, L014:2, L016:52, L017:1, L018:1, L020:5, L022:1, L023:3, L024:7, L025:1 |
| 2 | B      | 7                  | 3        | L006:13, L023:2                                                                                                 |

| # | Period | Tool-result characters | From the corpus    | From injected skill instructions                                                                                                                                                                                                                                                  |
|---|--------|------------------------|--------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| 1 | A      | 4 128 354              | 1 726 382 (41.8 %) | 955 798 (23.2 %): `update-config` 522 303, `awawa` 167 351, `claude-api` 106 183, `awawa-schema` 52 455, `artifact-capabilities` 28 452, `artifact-design` 24 418, `awawa-pr-review` 18 233, `worktree-clean` 12 064, `awawa-plan-wave-start` 12 115, `awawa-usage-report` 12 224 |
| 2 | B      | 469 397                | 72 370 (15.4 %)    | 50 043 (10.7 %): `awawa-schema` 31 473, `awawa` 18 570                                                                                                                                                                                                                            |

| Corpus lines changed                                                   | PR lines changed | Share |
|------------------------------------------------------------------------|------------------|-------|
| unchecked (no pull request: this report measures a period, not a diff) | —                | —     |

### Claims checked

| # | Claim                                                                                   | Check                                                                                                 | Verdict                                                                                                                                                                                |
|---|-----------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| 1 | `findings.md` §3: six `format-save` decisions are facts paying a fictional `REJECTED`   | `show` on the six on 2026-09-16: each carries 2–3 substantive `REJECTED` and `SPEC › IMPL` to code    | wrong                                                                                                                                                                                  |
| 2 | `findings.md` §1: 137 `DECISION`, 6 superseded; 61 `OPEN_QUESTION`, 21 open / 40 closed | `status DECISION docs` on 2026-09-16: 145 / 12 superseded; `status OPEN_QUESTION docs`: 20 / 41       | overstated by date: the corpus moved between the two readings; the outline recounts at migration                                                                                       |
| 3 | Scan of 2026-09-16: 80 sessions, 1 172 `awawa` commands, 22 failed lints                | retrospective scan by period: 59 sessions, 742 commands, 6 exits ≠ 0                                  | confirmed on a wider perimeter (sessions of 2026-09-16 outside both periods; lint counted as failed on any finding)                                                                    |
| 4 | Retrospective scan, period B: 2 throwaway-corpus directories                            | the design file names 45 corpora `p9`…`p36x` and 17 lettered variants                                 | wrong as a measure of the design cost: the scan's metric matches `scratchpad/p*` on the three sessions writing the file, and the review sessions probed elsewhere or under other paths |
| 5 | « `PULL_REQUEST 62` is a valid name » (earlier ruling)                                  | probe p23: L024 « name 62 misses shape pascal » once `SCHEMA *` declares `NAME pascal`                | wrong: held only without the wildcard's `NAME`; replaced by `pr_id`                                                                                                                    |
| 6 | `BLOCKS @TASK` required on `OPEN_QUESTION` carries the recording threshold              | probe p21: L006 on a question without `BLOCKS`; L009 on `BLOCKS @DECISION` or `@PACKAGE`              | confirmed                                                                                                                                                                              |
| 7 | A `DECISION` whose `SPEC` has no anchor is classified `PROCESS` by the tool             | probe p12/p15: L006 « required field IMPL is absent from DECISION.SPEC »                              | confirmed                                                                                                                                                                              |
| 8 | The file layout is read by no command                                                   | four layouts, `status` / `context --with-schema` / `lint --closure` md5-equal; `diff` blind to a move | confirmed                                                                                                                                                                              |
| 9 | The cleanup pass needs no parser of its own                                             | probe p36p: 80 lines over `status --json`, `show --json`, `refs --json`, `lint --strict`, `fmt`       | confirmed                                                                                                                                                                              |
