*Feedback for the awawa dev team · awawa 2.7.0 · 2026-09-22*

# IDE plugins report 2: four views, and a clean the binary cannot do

What one evening of rebuilding the awawa-ui IntelliJ tool window on top of the `awawa` binary showed: a tree, a board,
a dependency tree and a health list, all read from six `--json` shapes, and one write — a Clean button — that the
binary has no command for. The plugin is ours, not yours; the answers it needed are the ones any editor or web view of
a corpus will need.

- **4** — views, read from six `--json` shapes
- **0** — type names in the plugin
- **1** — write, done by line surgery
- **31** — reference lines removed by hand after the first clean

## The plugin, and the rule it keeps

**awawa-ui** is an IntelliJ tool window installed beside `editors/intellij`, our editor plugin for `.awawa` files,
sharing no code with it. Neither plugin comes from the awawa team. Between 2026-09-21 21:28 and 2026-09-22 01:15, 18
commits replaced its table by four views and added a Clean button, recording sixteen decisions (D20 to D35 of its
`AGENTS.md`), each measured on the planet-crafter-save-tools corpus: 289 entities, 13 files, 18 types.

The rule stands: **the plugin contains no logic**. No parsing of corpus text, no reference resolution, no knowledge of
any entity type. Everything a view shows comes from a reply of the binary, and the one thing it writes — a deletion —
is the place where the rule had to bend.

| What the view shows                                   | Call it is built from                                                                                       |
|-------------------------------------------------------|-------------------------------------------------------------------------------------------------------------|
| Types, entities, status, file, line, incoming counts  | `status --json .`, once per refresh, again 500 ms after a `.awawa` file is saved                             |
| The label, code and facts of a row; the board columns | `context @TYPE.First --depth 0 --with-schema --json .`, `resolved.<TYPE>.fields[].slots[].kind`             |
| The Dependencies view (`After ↔ Before`)              | `converse` in the same resolved block                                                                       |
| The colour of a status                                | the order of the type's own `STATUS` slot in the resolved block — no longer `statuses`                      |
| The Health view                                       | `lint --json .`, exit 1 read as an answer                                                                   |
| What the Clean button finds                           | `status TYPE --where FIELD==VALUE --json .`, once per type                                                   |
| What a deletion would break                           | `refs @TYPE.Name --json .`, once per entity found and per referrer                                          |
| The lines a deletion removes                          | `show FILE --json .`, one entry per entity with its `lines[]`                                                |

## Gaps

Measured on awawa 2.7.0 against the corpus above at commit 73d8c0f. The tag says what the gap cost the plugin.

### 01. No command deletes an entity, nor sets a field

*the one write is line surgery*

`awawa clean --help` answers « unknown command `clean` », then the usage of eight commands, none of which writes an
entity. So the Clean takes the line spans of `show FILE --json`, adds the comment block above and one blank line by
reading the text itself, and encodes one `fmt` convention — a comment attaches to the node below it. The board, for the
same reason, cannot move a card: « `awawa` has no command that sets a field ».

**Proposal** — `awawa rm TARGET… [--with-references] [--json]`: delete the entity, its attached comments and blank line
and, on request, the reference lines to it; `--json` alone prints the plan. And `awawa set TARGET FIELD VALUE`, or
`fmt --set`, so a card can change column.

### 02. A delete leaves every reference dangling, and nothing removes them

*31 lines by hand*

The dry run on a copy of the corpus predicted it: deleting the 14 archived entities leaves 31 unresolved references.
The first real clean confirmed it: the next commit of the corpus removes exactly 31 `APPLIES_TO_TASK @TASK.…` lines in
23 decisions, by hand, in the same sitting. `lint` names each of them (`L004`, entity and line), which is how they were
found; nothing offers to remove them.

**Proposal** — covered by `--with-references` above, or a `lint --fix` for `L004` limited to deleting the line.

### 03. `--where` selects within one type only

*18 calls where one would do*

`awawa status --where STATUS==archived .` exits 2: « `--where` selects within one type: name the TYPE first ». The
plugin therefore asks once per type, 18 times here. A type that does not declare the field also exits 2 — « `STATUS`
is not a field of SCHEMA in this workspace » — with the same code as any other refusal, so the plugin ignores every
refusal of a single type, the expected one and a real failure alike.

**Proposal** — `status --where FIELD==VALUE` without a type, skipping the types that do not declare the field; or a
distinct exit code for « not a field of ».

### 04. `statuses` is the alphabetical union of every lifecycle of the workspace

*the palette read backwards*

`status --json` answers `statuses: ["active", "archived", "draft", "implemented", "todo"]` on a corpus declaring
`active|archived` on 17 types and `draft|todo|implemented|archived` on TASK. Coloured by position, a draft task was
green, an implemented one grey, a task to do purple. The plugin now reads the type's own `STATUS` slot from the
resolved schema — which needs one entity of the type (gap 05). Raised on 2026-09-16 as defect 04, where the per-type
case was « not measured »; it is now.

**Proposal** — `statuses` per type in `status --json`, in declared order, undeclared values apart.

### 05. The resolved schema of a type is reachable only through one of its entities

*an empty type has no roles*

`show TASK --json` answers the schema as written; the resolved form — inherited `from: "*"`, `required`, `repeatable`,
`converse`, `slots` — exists only under `context <an entity> --with-schema --json`. Label, facts, board properties,
filters and lifecycle colours all come from that block, so a type no entity uses has none of them; the plugin's README
lists it as a known limit. Raised on 2026-09-16 as defect 02; met again.

**Proposal** — `show TYPE --json --resolved`, or the `resolved` block in `status TYPE --json`.

### 06. One `show` per entity, one `refs` per entity

*calls grow with the entities*

Twenty runs each on 2026-09-22: `show @TASK.FEAT80 --json` 3.2 ms, `status --json` 19.9 ms, `lint --json` 15.0 ms,
`--version` 0.46 ms. The per-call cost is six times lower than the 19 ms of 2026-09-16 (why is unchecked: same version,
same machine), so a 49-task type reads in 0.16 s in sequence; the shape of the cost is unchanged — 289 calls for the
corpus, and 38 `refs` for a clean of 14 entities. `show` still takes one target. Raised on 2026-09-16 as defect 01.

**Proposal** — `status TYPE --json --fields`; `show` and `refs` taking several targets.

## What held

| Mechanism                                                           | What it gave the plugin                                                                                                                                       |
|---------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `status --json`, once per refresh                                   | Every view's rows, and a refresh on save that re-reads only the types in view. Second report running.                                                        |
| `resolved.<TYPE>` of `context --with-schema --json`                 | `slots[].kind` chooses the label, code and facts of a row and the properties a board can lay; `converse` orients the Dependencies view; the `STATUS` slot gives the lifecycle. Second report running, extended. |
| `status TYPE --where FIELD==VALUE --json`                           | The shape of `status --json`: the Clean reuses the inventory reader.                                                                                          |
| `refs TARGET --json`                                                | `incoming[]` with `from`, `field_path`, `file`, `line`: the dialog lists what refers to each candidate and warns on what a deletion breaks.                     |
| `show FILE --json`                                                  | One entry per entity, its `lines[]` tagged `header`, `field`, `continuation`: the first and last line of an entity without parsing.                            |
| `lint --json` exits 1 on a corpus in error and still writes its report | Verified on a copy with one entity removed: exit 1, 1,877 bytes, six `L004` with `entity` and `line`. The Health view reads exit 1 as an answer.           |
| `fmt --check` after a deletion by line spans                        | Exit 0 on the copy where the 14 entities were cut; `lint --strict` exit 0 on the real corpus once the 31 lines were removed.                                    |
| Refusals written for a reader                                       | « `--where` selects within one type: name the TYPE first » is shown as written. Second report running.                                                        |
| Frozen `--json` shapes, stamped with the version                    | Six readers in the plugin, no format. Second report running.                                                                                                  |

## Held in the plugin, not asked of the tool

- **The waiting rule.** An entity waits when it refers to one of its own type not further along the lifecycle:
  21 of 49 tasks here, 9 of them archived tasks after archived ones. No field name is known; the owner kept the rule
  as ratified.
- **The roles of a row** come from `required`, `repeatable` and `slots[].kind` alone: the label is the first required
  single string (`TITLE`, written on 49 of 49 tasks at 82 characters on average), the facts are the short fields
  (`STATUS` 6 characters, `WAVE` 1, a reference 12 to 22), the long strings (`RATIONALE`, 550 on average) are left to
  the double click.
- **A name read as a sentence**, now keeping a code of capitals and digits as written: `FEAT80` reads `FEAT80`;
  52 of 289 names are such codes.

## If you add one thing

1. **`awawa rm TARGET… --with-references`** (gaps 01 and 02). It takes the only write out of the plugin and the 31
   lines out of the owner's hands; with `status --where` across types (gap 03) a clean is two calls instead of 18 plus
   38.

---

*Written on awawa 2.7.0 against the planet-crafter-save-tools corpus at 73d8c0f, from the awawa-ui plugin at commits
96f923e..e59ae47, a local repository not published. The full report — our own conduct included — is
`docs/awawa-usage-reports/intellij-plugins/2026-09-22-four-views-and-a-clean-the-binary-cannot-do.md` in that
project's repository. The timings were re-taken on 2026-09-22; the 131 / 105 / 34 ms of the clean's three phases come
from the building agent's dry run and were not re-run.*
