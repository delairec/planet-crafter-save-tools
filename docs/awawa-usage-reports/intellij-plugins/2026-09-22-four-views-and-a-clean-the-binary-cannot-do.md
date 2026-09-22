<!-- awawa-usage-report -->

# 2026-09-22 — four views read from the binary, and a clean the binary cannot do

<!--
Not a per-pull-request usage report: it follows no `_template.md` heading, and no `TASK` names it.
It measures one evening of building the awawa-ui IntelliJ tool window (`~/Web/awawa/editors/intellij/ui`,
local repository, commits 96f923e..e59ae47, 18 commits from 2026-09-21 21:28 to 2026-09-22 01:15, decisions
D20 to D35 of its `AGENTS.md`), against awawa 2.7.0 and the planet-crafter-save-tools corpus at commit 73d8c0f
(289 entities, 13 files, 18 types). Addressed to the authors of awawa; part A states what was ours.
Written by Claude Fable 5.1 as an independent reporter; the sessions were driven by Claude Opus 5
(`Co-Authored-By` trailers of the 18 commits), effort level unchecked, in three interactive sessions and seven
agents they launched.
-->

**Verdict, ours**: three sessions and seven agents turned a table the owner found unusable into four views and a
Clean button in 3 h 57 of wall time, 410 answers and 61.4 M cache-read tokens, recording sixteen decisions each backed
by a measurement on the real corpus, 8 of the 9 figures re-checked here holding; the evening cost one machine freeze
before the range, one three-round fix, and its first real clean left 31 reference lines to remove by hand.

**Verdict, the tool's**: every read the views needed was answered by five `--json` commands and one resolved schema,
without a type name in the plugin; the two things it could not answer are a delete — « awawa: unknown command
`clean` » — and a `--where` across types, and the four gaps of the 2026-09-16 report are all met again on the same
version.

| Measure                                                                                     | Value                                                                 |
|---------------------------------------------------------------------------------------------|-----------------------------------------------------------------------|
| Commits in the range, tests at its start and end                                            | 18 commits; 143 → 214 tests (`bun`-less Gradle suite, JUnit XML)      |
| Decisions written in `AGENTS.md`                                                            | D20 to D35, 16 entries, 10 earlier ones annotated as amended or gone   |
| Sessions and agents measured                                                                | 3 sessions (`session_01ShiX…` twice, `session_01CJeL…`), 7 agents      |
| Answers, cache-read tokens, output tokens                                                   | 410 answers; 61.4 M cache-read; 180 k output                          |
| Active time, wall time                                                                      | 2 h 08 in the sessions, 1 h 10 in the agents; 21:20 → 01:17           |
| `awawa` invocations in the transcripts                                                      | 91 (`status` 29, `lint` 21, `show` 12, `fmt` 12, `context` 9, `refs` 4, other 4) |
| Questions put to the owner, sandbox IDE launches                                            | 11 questions in 3 rounds; 7 launches                                  |
| Tool gaps raised                                                                            | 6: 2 new (no delete, `--where` bound to one type), 4 met again         |
| Mechanisms of the tool that held                                                            | 9, 5 of them for the second report running                            |
| First real clean, after the range (pcst commits 750cfde, 1a23069, 01:23 and 01:39)           | 14 archived entities and 1 implemented task deleted; 31 `APPLIES_TO_TASK` lines removed by hand |

## Part B — the tool

### What went wrong or was missing

Measured on awawa 2.7.0 against the planet-crafter-save-tools corpus at 73d8c0f, unless a line says otherwise. The
tag says what the gap cost the plugin.

| #  | Gap                                                                                     | Evidence                                                                                                                                                                                                                                                                                                                                                          | Cost to the plugin                                                                                                                                                                                                                           |
|----|-----------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| 01 | No command deletes an entity, nor sets a field                                          | `awawa clean --help` at 00:36 (`387815ff`): `awawa: unknown command \`clean\``, followed by the usage of the eight commands, none of which writes an entity. D24: the board cannot move a card because « `awawa` has no command that sets a field ».                                                                                                              | **the one write is done by line surgery**: the plugin takes the line spans of `show FILE --json`, adds the comment block above and one blank line by reading the text itself, and encodes one `fmt` convention — a comment attaches to the node below (D35). |
| 02 | A delete leaves every reference to the entity dangling, and nothing removes them        | The agent's dry run on a copy: deleting the 14 archived entities left 31 unresolved references (`aca8e3f8`, 01:06). The owner's real clean: pcst commit 1a23069 removes exactly 31 `APPLIES_TO_TASK @TASK.…` lines in 23 decisions, by hand, in the same sitting.                                                                                                  | **31 lines by hand**, and FEAT47 of the corpus, which specifies the purge « with the reference lines to it », still has that half to build.                                                                                                   |
| 03 | `--where` selects within one type only                                                  | `awawa status --where STATUS==archived .` exits 2: `--where selects within one type: name the TYPE first`. `awawa status SCHEMA --where STATUS==archived --json .` exits 2: `` `STATUS` is not a field of SCHEMA in this workspace ``.                                                                                                                              | **18 calls where one would do**, and the two refusals share exit 2, so the plugin ignores every refusal of a single type — a type lacking the field and a real failure alike (agent report, 01:06).                                            |
| 04 | `statuses` is the alphabetical union of every lifecycle of the workspace                | `status --json` → `statuses: ["active", "archived", "draft", "implemented", "todo"]` on a corpus declaring `active|archived` on 17 types and `draft|todo|implemented|archived` on TASK. D20: a draft task was green, an implemented one grey, a task to do purple.                                                                                                  | **the palette read backwards** until D20 reads the type's own `STATUS` slot from the resolved schema — which needs an entity of the type (gap 05). Raised on 2026-09-16 as IDE·04; the per-type case was then « not measured »; it is now. |
| 05 | The resolved schema of a type is reachable only through one of its entities            | `awawa show TASK --json .` answers the schema as written (`FIELD` atoms, no `from: "*"`); `context @TASK.FEAT80 --depth 0 --with-schema --json` answers `resolved.TASK.fields` with `from`, `required`, `repeatable`, `converse`, `slots`. `README.md` of the plugin: « A type no entity uses … has no fields: no label, no facts, no board. »                          | **an empty type has no roles**: label, facts, board properties, filters and lifecycle colours all come from that block. Raised on 2026-09-16 as IDE·02; met again.                                                                             |
| 06 | One `show` per entity, one `refs` per entity                                            | 20 runs each on this machine, 2026-09-22: `show @TASK.FEAT80 --json` 3.2 ms, `status --json` 19.9 ms, `lint --json` 15.0 ms, `--version` 0.46 ms. The Clean asks `refs` 38 times for 14 entities and their referrers (agent report). `show` still takes one target.                                                                                                | **calls grow with the entities**: 49 for the tasks, 289 for the corpus, 38 `refs` for one clean. The per-call cost is 6 times lower than the 19 ms of 2026-09-16 (why is unchecked: same version, same corpus size class), so the tab is 0.16 s in sequence today; the shape of the cost is unchanged. IDE·01 met again. |

### What held

| Mechanism                                                                           | What it gave the plugin                                                                                                                                                                                                                                                     |
|-------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `status --json`, once per refresh                                                   | Types, entities, status, file, line and incoming counts for the tree, the board and the search; the 500 ms debounced refresh on save (D27) re-reads it and the types in view only. Second report running.                                                                     |
| `resolved.<TYPE>` of `context --with-schema --json`                                 | `slots[].kind` chooses the label, the code and the facts of a row (D23) and the properties a board can lay (D24, D30); `converse` names the reverse of `AFTER` for the Dependencies view (D32); the `STATUS` slot gives the lifecycle order (D20). No type name in the plugin. Second report running, extended. |
| `status TYPE --where FIELD==VALUE --json`                                           | Answers in the shape of `status --json`: the Clean reuses the inventory reader (D35).                                                                                                                                                                                       |
| `refs TARGET --json`                                                                | `incoming[]` with `from`, `field_path`, `file`, `line`: the dialog lists what refers to each candidate, and warns on what a deletion breaks (D35).                                                                                                                             |
| `show FILE --json`                                                                  | One entry per entity with its `lines[]`, each tagged `header`, `field`, `continuation`: the deletion knows the first and last line of an entity without parsing (D35).                                                                                                        |
| `lint --json` exits 1 on a corpus in error and still writes its report              | Verified on a copy with one entity removed: exit 1, 1,877 bytes of JSON, `summary.errors: 6`, six `L004` with `entity` and `line`; the Health view reads exit 1 as an answer (D33). On the real corpus: exit 0, 0 errors, 0 warnings.                                       |
| `fmt --check` after a deletion by line spans                                        | Exit 0 on the copy where the 14 archived entities were cut (agent report), and `lint --strict` exit 0 on the real corpus once the 31 lines were removed (pcst 1c4ca7b, checked 2026-09-22 with `awawa status .`: 274 entities, 414 sites, 0 unresolved).                     |
| Refusals written for a reader                                                       | `--where selects within one type: name the TYPE first` is shown to the user as written; the plugin's `spoken()` keeps the lines starting with `awawa`. Second report running.                                                                                                |
| Frozen `--json` shapes stamped with the version                                     | Every reply carries `"awawa": "2.7.0"`; the plugin's readers (`StatusReport`, `SchemaReport`, `EntityReport`, `LintReport`, `RefsReport`, `FileReport`) know six shapes and no format. Second report running.                                                                |

### Proposals

| Proposal                                                                                                                                  | What it would change                                                                                                                                                       | Gap    |
|-------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------|
| `awawa rm TARGET… [--with-references] [--json]`: delete the entity, its attached comments and blank line, and on request the reference lines to it; `--json` alone prints the plan — files, line ranges, references that would break | The plugin's `Excision` (90 lines), `Sweep` (its 38 `refs`) and the `fmt` comment rule leave the plugin; the 31 lines are removed by the same command that creates them | 01, 02 |
| `awawa set TARGET FIELD VALUE`, or `fmt --set`                                                                                            | A board card can move to another column; today D24 forbids it because the file would have to be edited as text                                                            | 01     |
| `status --where FIELD==VALUE` without a type, skipping the types that do not declare the field, or a distinct exit code for « not a field of » | One call instead of 18, and a real refusal no longer hidden among expected ones                                                                                          | 03     |
| `statuses` per type in `status --json`, in declared order, undeclared values apart                                                        | The colour of a status without reading one entity of the type; IDE·04 repeated                                                                                             | 04     |
| `show TYPE --json --resolved`, or the `resolved` block in `status TYPE --json`                                                            | An empty type gets its label rule, its board properties and its colours; IDE·02 repeated                                                                                   | 05     |
| `status TYPE --json --fields`; `show` and `refs` taking several targets                                                                   | One walk per type and one per clean; IDE·01 repeated                                                                                                                       | 06     |

### Held in the plugin, not asked of the tool

- **The waiting rule** (D25): an entity waits when it refers to one of its own type not further along the lifecycle.
  Re-computed here on 73d8c0f from `show` and `status`: 21 of 49 tasks, 9 of them archived tasks after archived ones
  (`AGENTS.md` says 10; the split is unchecked, the total holds). The owner kept the rule as ratified (00:00,
  `ce3500f5`).
- **A name read as a sentence**, now keeping a code of capitals and digits as written (D21): `FEAT80` reads `FEAT80`.
  52 of the 289 names match `[A-Z]+[0-9]+` — the 49 tasks and `PR95`, `PR100`, `PR107`; `AGENTS.md` counts 49.
- **The roles of a row** (D23) come from `required`, `repeatable` and `slots[].kind` alone. Measured here: `TITLE` is
  written on 49 of 49 tasks at 82 characters on average, `RATIONALE` on 44 at 550, `SPEC` 3.4 times per task at 124;
  `DESC` on 11 of the first 30 tasks and 3 of the first 30 decisions — the figures D22 and D23 rest on, within the
  perimeter each side measured (30 entities sampled there, every entity here).

## Part A — us

### What went well

| Point                                                                    | Evidence                                                                                                                                                                                                                                                                                                                                  |
|--------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| A redesign proposed, then ratified, then built                           | 21:41 the owner asks for a rethink; 21:42 an agent is launched for a proposal, not code; 21:46 it hands back three directions with the cost of each; 21:47 and 21:59 two rounds of questions (7 in all); 22:00 the ratified mix — tree A plus a board of the owner's own — is sent to the same agent, which delivers 7 commits by 22:28.       |
| The owner's answers overrode the recommendation                          | The agent recommended direction B (list plus details pane); the owner chose A and added the board and « keep the filters » (19:58 UTC answer, `136c16fe`); the result is D22 to D26.                                                                                                                                                       |
| One question per open point, each with what was checked                 | The `ce3500f5` round of 22:57 asks four questions, each opening on « What I checked »: D25 kept as is, D29 ratified, D30's `Others` column plus spinner chosen, Dependencies and Health both ratified.                                                                                                                                      |
| TDD with GREEN agents barred from the tests                              | 6 GREEN agents, each told « do NOT edit anything under src/test/ »; 143 → 180 → 214 tests; one agent stopped and reported a spec contradiction instead of editing it (`a7443ea8`, 23:20).                                                                                                                                                  |
| Every decision measured on the real corpus before it was written         | D20, D21, D22, D23, D25, D30, D33, D35 each carry a count taken on planet-crafter-save-tools; 8 of the 9 figures re-checked here hold (appendix).                                                                                                                                                                                          |
| The owner tested every increment in a sandbox IDE                        | 7 launches (21:34, 22:47, 23:59, 00:02, 00:11, 00:12, 01:14); each brought a concrete return: the type bar, the scrollbar, the card tooltip, the column cap, the third and fourth views.                                                                                                                                                    |
| Memory discipline after the freeze                                       | Every Gradle call of the range runs under `systemd-run … MemoryMax=3G`; the sandbox IDE under 4 G after `free -h`; D29 turns `buildSearchableOptions` off for good (3dc2697, 23:02).                                                                                                                                                       |

### What went wrong

| Point                                                                       | Evidence                                                                                                                                                                                                                                                                                                                                      | Whose fault        |
|-----------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------|
| The machine froze at the build, before the range                            | The single-view session (`1d9f30e7`, 20:41–20:59) ends mid-sentence — « Au tour d'`AGENTS.md`. J'annote… » — and the next session opens at 21:22 on « au build l'ordi a planté … fait preuve de prudence ». `buildSearchableOptions` starts a second headless IDE (D29). Its work was committed by the next session as 96f923e at 21:28.        | tooling, conduct   |
| Two agents edited one worktree at once                                      | The GREEN agent reports at 23:20: « The main source set does not compile because of a concurrent edit. Another agent is editing `src/main/kotlin/awawa/ui/ide/` … I waited about 9 minutes »; the RED step had left `SheetsSpec.kt:41` contradicting `SchemaReportSpec`.                                                                       | method             |
| A visual fix took three rounds                                              | 22:00 « la scrollbar est visible par dessus la carte »; 22:01 f95244e reserves a strip; 22:03 « seulement pendant 1 demi seconde »; 22:10 « la correction est pire que mieux … il faut que la carte survolée passe au dessus »; e01997d reverts, fcc0dac and 1ecbe84 fix. Four commits for one defect the owner had to diagnose.               | conduct            |
| A release tag put two numbers on one build                                  | 22:13 « tag une v0.1.0 » over a build at 0.5.1; 22:15 « on aligne le tag sur la version du build »; D34 written at 22:16.                                                                                                                                                                                                                      | method             |
| Ten tool errors, three of them the worktree guard                           | `1d9f30e7`: a heredoc and an `unzip` refused as « too complex to verify », a `git rm` failing on local changes; `aca8e3f8` and `a6d5ceb7`: one compound command refused each; three « File has not been read yet » (`a0b8ca6e` twice, `ce3500f5` once); one `sleep 45` blocked; one `jq` and two `ls` failures. One answer each.                | conduct            |
| The first real clean ran against the corpus's own purge rule                | After the range, pcst 750cfde (01:23) and 1a23069 (01:39): no session trailer, pure deletions of the 14 entities `status TYPE --where STATUS==archived` lists at 73d8c0f — 10 of the 12 tasks with incoming `BEFORE` or `GOVERNED_BY` edges — plus FIX45 at `implemented`, and 31 `APPLIES_TO_TASK` lines removed by hand. `PROCESS.TheArchiveIsPurgedByHandWhileFewEntitiesAreArchived` deletes « an archived entity nothing refers to any more »; `TASK.FEAT47` purges « with the reference lines to it » and only what `PURGE` and `ARCHIVED_ON` allow. The transcripts end at 01:17: the click is inferred from the commit shape, not seen. | corpus modelling, method |

### Remediations

| Remediation                                                                                                                                                                 | Addressed to           | Recorded as                                                                                                     |
|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------|-----------------------------------------------------------------------------------------------------------------|
| Rule whether the awawa-ui Clean button stands in for the purge half of FEAT47, and rewrite the purge process accordingly: what removes the reference lines, whether an entity with incoming edges or at `implemented` may be purged | this project (owner)   | `@OPEN_QUESTION.CleanButtonAndTheCleanupPass`, `BLOCKS @TASK.FEAT47`, sourced by `@USAGE_REPORT.IntellijUi_2026_09_22` |
| A GREEN agent and its coordinator never write the same worktree at the same time: the coordinator's `ide/` edits wait for the hand-back, or go to a branch of their own      | every project (`~/.ai`) | a pull request on `~/.ai` `instructions/testing/tdd-workflow.md`; no entity                                     |
| A visual defect reported by the owner is reproduced or described back before a fix is committed (« the card must paint above the scrollbar », not « reserve a strip »)      | conduct                | no entity; the report                                                                                           |
| The plugin's Clean offers to remove the reference lines it breaks, and reads `PURGE` when the schema declares it                                                            | the plugin (ours, not this project) | its `AGENTS.md`, next session; no entity here                                                          |

### Entities proposed to the owner

| Entity                                          | Ruling expected                                                                                                                   |
|-------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------|
| `@OPEN_QUESTION.CleanButtonAndTheCleanupPass`   | Answer it: FEAT47 keeps its purge half, or the button replaces it and the process is rewritten; either way, who removes the reference lines |
| `@USAGE_REPORT.IntellijUi_2026_09_22`           | None: it exists so the question can cite this report                                                                              |

## Recurring points, against the report of 2026-09-16

### Pain points

| Point                                                 | Reports | First raised | Fate of its remediation                                                                                    |
|-------------------------------------------------------|---------|--------------|------------------------------------------------------------------------------------------------------------|
| One `show` per entity (IDE·01)                        | 2       | 2026-09-16   | `status TYPE --json --fields` not in 2.7.0, the version both reports ran; the per-call cost measured 6 times lower today |
| Resolved schema only through an entity (IDE·02)       | 2       | 2026-09-16   | `show TYPE --json --resolved` not in 2.7.0; the plugin's README lists the empty type as a known limit       |
| Untyped atoms in `show TARGET --json` (IDE·03)        | 2       | 2026-09-16   | Not in 2.7.0; `Cells` still strips quotes and reads `@TYPE.Name` itself (D14, kept by D23)                  |
| `statuses` mixes lifecycles (IDE·04)                  | 2       | 2026-09-16   | Not in 2.7.0; the per-type case the first report left unmeasured is measured: the union is sorted alphabetically |

### Strengths

| Mechanism                                       | Reports | Note                                                                        |
|-------------------------------------------------|---------|-----------------------------------------------------------------------------|
| One `status --json` for the inventory           | 2       | now also the refresh on save                                                |
| The `resolved` block of `context --with-schema` | 2       | now carries the roles of a row, the board and the Dependencies view         |
| Frozen `--json` shapes, version stamped         | 2       | six readers, no format                                                      |
| Refusals written for a reader                   | 2       | shown as written                                                            |
| A type at zero entities listed                  | 1       | not exercised: every type of 73d8c0f has at least two entities; closed by observation |

### Follow-up on the 2026-09-16 proposals

- `status TYPE --json --fields`: not delivered; the version in use is still 2.7.0.
- `show TYPE --json --resolved`: not delivered; same version.

## Details

### The sessions

Local time (UTC+2). `active` counts gaps under ten minutes; `cache-read` is what the session cost to keep reading,
`output` what it wrote. Measured with `measure.py` on each transcript; collection files under the scratchpad
`intellij-ui-usage-report/` (`02-measure-main.txt`, `10-subagents-measure.txt`, `11-timeline-*.txt`).

| Transcript                        | Role                                                | Span          | Active  | Answers | User turns | cache-read | output  | `awawa` calls |
|-----------------------------------|-----------------------------------------------------|---------------|---------|---------|------------|------------|---------|---------------|
| `1d9f30e7` (single-view worktree) | Before the range: the single table, D17–D19; froze  | 20:31–20:59   | 0:27    | 54      | 1          | 6.27 M     | 63.0 k  | 10            |
| `136c16fe` — `session_01ShiX…`    | Resume, commit 96f923e, redesign, first sandbox     | 21:20–22:53   | 1:04    | 43      | 10         | 3.78 M     | 35.8 k  | 4             |
| ↳ agent `a0b8ca6e`                | Proposal, then tree + board, 7 commits              | 21:42–22:28   | 0:33    | 106     | 4          | 20.86 M    | 5.3 k   | 22            |
| ↳ agents `a428e`, `ac197`, `a313c`, `a5373` | GREEN steps of that agent                 | 22:04–22:25   | 0:05    | 27      | 8          | 1.18 M     | 1.7 k   | 0             |
| `ce3500f5` — `session_01ShiX…`    | D29–D34, board cap, Dependencies, Health, scrollbar | 22:56–00:16   | 0:33    | 98      | 16         | 18.62 M    | 93.3 k  | 24            |
| ↳ agent `a7443ea8`                | GREEN of the core, blocked 9 min, then 180 tests    | 23:06–23:21   | 0:16    | 23      | 3          | 1.48 M     | 0.7 k   | 0             |
| `387815ff` — `session_01CJeL…`    | Clean brief, sandbox, 0.6.0, merge, install         | 00:31–01:17   | 0:31    | 20      | 7          | 1.28 M     | 10.6 k  | 1             |
| ↳ agent `aca8e3f8`                | Clean: RED, GREEN by a helper, BLUE, dry run, commit | 00:51–01:06   | 0:15    | 83      | 2          | 13.65 M    | 27.8 k  | 40            |
| ↳ agent `a6d5ceb7`                | GREEN of the Clean core, 214 tests                  | 00:59–01:01   | 0:02    | 10      | 2          | 0.57 M     | 4.7 k   | 0             |
| **Range total** (the first row excluded) |                                              | 21:20–01:17   | 3:18    | 410     | 52         | 61.42 M    | 179.9 k | 91            |

Commits by session (`Claude-Session` trailers): `session_01ShiX…` signed 96f923e through 3ebfc3a (16 commits);
`session_01CJeL…` signed 5c93c2c and e59ae47. The seven agents committed under their coordinator's trailer.

### The corpus the plugin read

`awawa status .` at 73d8c0f: 289 entities in 13 files and 18 types; 49 tasks (27 draft, 5 todo, 5 implemented,
12 archived), 109 decisions (2 archived); 485 reference sites, 0 unresolved; lint 0/0. Three commits later (1c4ca7b,
01:45): 274 entities, 414 sites, 0 unresolved, 4 archived tasks, 0 implemented.

### Claim-by-claim check of `AGENTS.md` D20–D35

| Claim                                                                                          | Where      | Check                                                                                                                         | Result             |
|------------------------------------------------------------------------------------------------|------------|-------------------------------------------------------------------------------------------------------------------------------|--------------------|
| `statuses` answers the union sorted alphabetically                                             | D20        | `status --json` at 73d8c0f                                                                                                    | holds              |
| 49 of 289 names are codes                                                                      | D21        | regex `[A-Z]+[0-9]+` on the inventory                                                                                         | 52 (49 tasks + 3 `USAGE_REPORT`) |
| 18 type check boxes; `DESC` on 11 tasks of 30 and 3 decisions of 30; a TASK table of 13 columns | D22       | 18 types; first 30 of each type by `show`; 10 resolved fields + 3 fixed columns                                               | holds              |
| `TITLE` 84 characters on average, `RATIONALE` 458, `SPEC` 124 × 2.9                             | D23        | all tasks: 82.2, 550.1, 123.7 × 3.4                                                                                           | holds within perimeter |
| 21 of 49 tasks wait, 10 of them archived                                                       | D25        | rule re-computed from `show` and `status`                                                                                     | 21 holds; 9 archived by this computation |
| `TITLE` 49/49, `RATIONALE` 44/44, `DELIVERED_BY` 17/17 distinct values                          | D30        | `show` on every task                                                                                                          | holds              |
| `lint` exits 1 with its report on a corpus in error; 0 errors, 0 warnings on this one           | D33        | broken copy: exit 1, 6 `L004`; 73d8c0f: exit 0                                                                                | holds              |
| `--where` refuses without a type; a type without the field exits 2; 18 types, 14 archived, 289 entities, 13 files, 31 unresolved after the cut | D35 | both refusals reproduced; 12 TASK + 2 DECISION archived; 31 = the lines removed in 1a23069 | holds              |
| 131 ms, 105 ms, 34 ms for the three phases of the search on 20 cores                            | D35        | not re-run                                                                                                                    | unchecked          |
| One `show` takes 19 ms                                                                          | D11, README | 20 runs today: 3.2 ms; `status --json` 19.9 ms                                                                               | not reproduced; cause unchecked |
| The machine froze on `buildSearchableOptions`                                                   | D29        | `1d9f30e7` ends 20:59 mid-answer; `136c16fe` opens 21:22 on the crash                                                        | consistent         |
| The first release was tagged v0.1.0 over 0.5.1 and moved                                        | D34        | `ce3500f5` 22:13 and 22:15; `git tag`: v0.5.1 (00:15), v0.6.0 (01:15)                                                          | holds              |

### What was not checked

- The 131 / 105 / 34 ms of the Clean search, and the one-Undo across files, which the agent could not try either (D29
  forbids the second IDE).
- Why a `show` costs 3.2 ms today against 19 ms on 2026-09-16: same version, one machine, a corpus 25 % larger; the
  earlier figure may have been taken through a shell.
- Whether the owner's clean of 01:23 and 01:39 went through the button or through the editor: the commits carry no
  session, and no transcript covers them.
- The Swing layer: nothing here ran the IDE.
