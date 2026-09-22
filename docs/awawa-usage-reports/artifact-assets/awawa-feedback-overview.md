*Feedback for the awawa dev team · awawa 2.7.0 · 2026-09-22*

# awawa feedback: the overview

One project — a seven-package monorepo worked daily by AI agents — moved its specification into an awawa corpus and
reported what it met, six times in under two weeks. This page gathers the six reports into one list: **one proposed
remediation per row, and facing it every defect or gap it would close**, whatever report raised it. Only what is
yours to handle is kept — the binary, the schema language, the manual, the skills and the distribution. What was
ours — our method, our starter, our conduct — stays in the reports.

- **6** — reports, 2026-09-12 to 2026-09-22, all on awawa 2.7.0
- **73** — defects or gaps raised about the tool, 7 of them with nothing asked
- **50** — remediations once the repetitions are merged
- **16** — remediations raised by two reports or more

## The six reports

| Code | Report | Date | What it measured |
|---|---|---|---|
| M1 | Migration 1 | 2026-09-12 | two days migrating the project's methodology into a first corpus: 131 entities, 148 anchors |
| F | Field report | 2026-09-15 | eleven independent reports on daily agent sessions over that corpus; a count « n / 11 » is the number of reports that met the defect |
| M2 | Migration 2 | 2026-09-16 | the schema rebuilt from what the first had cost: 45 throwaway corpora, 141 probe rows, a scan of 59 sessions |
| IDE | IDE plugins report | 2026-09-16 | a read-only table view built on the `--json` replies, under the rule that the plugin holds no logic |
| M3 | Migration 3 | 2026-09-18 | a product specification added as a second area of the same workspace: 12 sessions, 60 probe lines, 404 `awawa` calls |
| CTX | Context savings example | 2026-09-22 | what one session loaded into the agent's context by reading the corpus and its instructions, in lines of output, and the levers that would lower it |

A reference reads « report · number »: `F·02` is defect 02 of the field report, `M3·5` defect 5 of section 5 of
Migration 3. Migration 1 and the context report number nothing; `M1·6` is the sixth row of the « What went wrong »
table of Migration 1, `CTX·1` the first row of the « Additional levers » table of the context report.

## Where to start

Ranked by how many reports raised the gap and by the cost they measured, not by preference.

1. **Expand incoming edges in `context`** (R1) — three reports. One `context` was followed by five to fifteen `show`
   in 9 of 11 field reports; over 59 sessions, 19 `context` calls against 249 one-entity reads.
2. **Tell live referrers from closed ones in the footer** (R2) — 10 of 11 field reports: the most read output of the
   tool is the one that most often reads wrong.
3. **Give a type its file, and `new` a destination** (R16, R17) — the last routine reason an agent opens a corpus
   file with a text tool: 4 of 11 field reports, 3 entities misfiled, and still 5 `tail` reads in the last walk.
4. **Let listings read what the schema resolves** (R6, R7) — a `DEFAULT` is honoured by gating and by no listing:
   256 of 275 entities are counted under `(none)`, and « the active ones » cannot be selected.
5. **Let a slot take several types** (R23) — two reports. Today it leaves a provenance field untyped or split in
   two, and makes the 11 to 13 rules about the game unwritable under a required `anchor`.

## Reading a corpus

| # | Remediation | Defects and gaps it closes | Raised in |
|---|---|---|---|
| R1 | `context` expands incoming edges on request, to a depth — `--with-referrers` | `F·02` referrers are named, never expanded: five to fifteen `show` after each `context`, 9 / 11 · `M2·10` a pivot whose edges are all incoming reads as `refs` plus one `show` per entity · `M3·5` two of the five questions of a reading loop cost 1 + 1 calls | F, M2, M3 |
| R2 | The incoming footer splits its count by gating — `BLOCKED_BY (root, 0 live, 4 archived)` | `F·01` closed referrers are counted with the live ones, 10 / 11 · `M2·21` a todo task reads as blocked by a question already ruled | F, M2 |
| R3 | `context` prints the `STATUS` and the archive date of a suppressed target, or expands it on request | `M3·4` an active entity citing an archived one gets `// suppressed: @X` and loses its body, with no reason and no date | M3 |
| R4 | `context` opens on a one-line summary: edges in, edges out, anchors | `F·14` a package of twelve lines for a disconnected entity looks like any other; a whole area stayed disconnected for days | F |
| R5 | The `skipped` footer prints counts; the enumeration moves to `--json` | `M3·13` three `skipped` lines are 20.7 % of the largest package of the corpus, 3 559 of 17 154 characters | M3 |
| R6 | `--where` reads nested fields, fields declared only in a `WHEN` block, and `DEFAULT` values | `M2·2` a default cannot be selected on · `M2·9` a nested field is « not a field of » its type · `M2·19` a `WHEN`-only field is unknown until one entity writes it · `M2·17` an edge defaulted by `DEFAULT @X` is invisible to `refs`, `status` and `--where` | M2 |
| R7 | `status` counts a defaulted `STATUS` under its default | `M2·2` `status` prints `(none)` for an entity that omits a defaulted `STATUS` · `M3·12` the `active` column is 0 on every row, 256 of 275 entities under `(none)` | M2, M3 |
| R8 | `--where` matches a substring and the identity — `FIELD~=text`, `NAME~=text` | `F·11` equality alone cannot query a free-text field · `M1·8` four grammars of `SOURCE` in two days, none selectable · `M2·13` no listing by name prefix | M1, F, M2 |
| R9 | `status TYPE --by FIELD` prints one count per declared value, zero included | `M3·11` a declared enum value carried by 0 of 21 entities read like a value in use through four steps and four reviews | M3 |
| R10 | `status TYPE --json --fields` returns the field values of every entity of a type; `show` takes several targets | `IDE·01` a table of 232 entities costs 232 walks of the workspace, 4.4 s · `M3` usage: 35 `show` invocations in one audit session | IDE, M3 |
| R11 | `show TYPE --json --resolved` returns the schema of a type as resolved — `INCLUDE`, `WHEN` and wildcard fields | `IDE·02` the resolved schema is reachable only through an entity of the type, so a type at zero entities has no columns | IDE |
| R12 | A reachable target for the wildcard entry — a bare `show SCHEMA`, or a documented escape for `*` | `F·12` `@SCHEMA.*` is listed and no target reaches it: the one entry that can only be read by opening the file | F |
| R13 | `show TARGET --json` returns typed atoms — kind, text, unescaped value, resolved target | `IDE·03` atoms come back as source text, so a view must carry the token rules itself | IDE |
| R14 | `statuses` in `status --json` keeps to the declared values, per type, and lists undeclared ones apart | `IDE·04` an invalid `STATUS` value joins the lifecycle list as one more stage | IDE |
| R15 | On an unresolved name in a git checkout, name the commit that removed it, or say « never written » | `F·05` a deleted entity is indistinguishable from one never written, 3 / 11 | F |
| R51 | `show` takes `--skip CATEGORY`, as `context` does | `CTX·1` a task read by `show` carries its `RATIONALE` and `SOURCE`: about 60 lines where only its `SPEC` lines were used | CTX |

## Writing a corpus

| # | Remediation | Defects and gaps it closes | Raised in |
|---|---|---|---|
| R16 | A type declares its file, or file pattern, in the schema | `F·16` an entity in the wrong file lints clean · `M2` measure: 3 entities misfiled by domain | F, M2 |
| R17 | `new TYPE Name --into FILE` appends after the last entity of the type | `F·03` every append starts with `tail` and `wc -l`, 4 / 11 · `M3` usage: 5 `tail` reads to find where an entity goes | F, M3 |
| R18 | `new` prints everything the schema requires: nested requirements under their parent, the `INCOMING` obligation of a `WHEN` block, one line per condition | `M2·12` a nested requirement is omitted from the `WHEN` summary · `M3·1` the incoming obligation is omitted, and it is the one an author cannot see by reading the entity · `M2·20` a shadowed block prints its line twice | M2, M3 |
| R19 | `new` warns on stderr when the name is already taken | `F·13` the duplicate surfaces as a lint finding several steps later | F |
| R20 | `fmt` writes entities in a canonical order — by name, or by a declared sort key | `M2·22` two pull requests appending to the same file conflict at rebase, one conflict per pair | M2 |
| R21 | `diff --git <rev> [PATH]` reads the old side from the repository | `F·09` entity-level diff needs a copy made before editing; a session that forgets loses it, 2 / 11 | F |
| R22 | Declared extra paths are scanned for `@TYPE.Name` mentions: `refs` lists them, `lint` reports an unresolved one, `fmt --rename` rewrites them | `M3·10` at the deletion of a document `lint` saw 6 of 45 citation sites; 51 identity mentions in code and README that a rename leaves stale in silence | M3 |

## The schema language

| # | Remediation | Defects and gaps it closes | Raised in |
|---|---|---|---|
| R23 | A slot accepts several types, `anchor` included — `@PULL_REQUEST\|@USAGE_REPORT`, `anchor\|@URL` | `M2·1` a provenance field is either untyped or split into one field per source type (`L020`) · `M3·7` a required `anchor` cannot be satisfied by a proof that is a page or a game build | M2, M3 |
| R24 | An any-of requirement — `REQUIRED ONE OF A, B` | `M2·8` « at least one of these fields » costs a discriminant field whose value the presence of the other already says | M2 |
| R25 | A `WHEN` block may forbid a field, or key on a field's presence | `M2·7` no mutual exclusion between fields: `WHEN` is monotonic and keys on a value · `M3·6` a field legal in every state but one is declared once per admitting state; a `FIELDSET` field cannot be redeclared to key it (`L013`) | M2, M3 |
| R26 | `INCOMING` is accepted at type level | `M3·2` it is `L023` outside a `WHEN` block; the wrapper `WHEN STATUS active` on a defaulted `STATUS` works, and two schema reviews missed it | M3 |
| R27 | `REQUIRED` refuses an empty string | `M2·6` `REJECTED ""` passes `--strict`: the requirement is a prompt, not a proof | M2 |
| R28 | Bounds on free text — `REPEATABLE 1..2`, `MAXLEN 120`, a pattern on a prose field | `M1·7` 188 `DESC` for 80 decisions, up to four per entity, against the fragment doctrine · `F·15` a writing convention cannot be declared, so it stays a habit of review | M1, F |
| R29 | A constraint on the `STATUS` of a reference's target — `TARGET STATUS closed` | `M1·10` a question set back to open while a decision still closes it passes `lint --strict` | M1 |
| R30 | `WHEN` inside a `FIELDSET`, or the limit documented next to `L023` | `M1·4` a ladder shared by three types cannot be declared once with its `GATE` blocks | M1 |
| R31 | A `NAME` shape may depend on the entity's fields — under a `WHEN`, or built from fields (`NAME {PROJECT}{NUMBER}`) | `M1·5` a name prefix cannot follow a field, so `KIND` ↔ prefix stays a discipline · `M2·14` a name repeats two fields and nothing checks that the three agree | M1, M2 |
| R33 | An `EXTERNAL` type keeps `refs`, `show` and its `NAME` shape on references | `M2·16` a source type cannot be external without losing its hub role | M2 |

## Anchors, archive, consistency

| # | Remediation | Defects and gaps it closes | Raised in |
|---|---|---|---|
| R34 | A gated rule « anchor names a directory », or a slot option `anchor:file`; and one sentence in the manual: `implemented` means anchored, not verified | `M1·6` 35 of 148 `IMPL` anchors point at a directory and can never fail · `F·06` still a tenth to a sixth of the anchors, 3 / 11 | M1, F |
| R35 | A lint option resolves anchors against the files git tracks | `M3·8` an anchor into a gitignored file lints clean for its author and is `L016` in CI and in a fresh clone | M3 |
| R36 | A lint mode reads through `GATE suppressed`; failing that, the manual says what archiving silences | `M3·3` an archived entity is checked for nothing but its archive block: `L006`, `L007`, `L004` and `L016` all silent, so an entity archived unclean is never reported again | M3 |
| R37 | A mechanical proxy for contradiction: warn when the anchor of a non-implemented `SPEC` intersects the anchor of an implemented one and no reference ties the two | `F·04` two entities in force contradict each other and `lint --strict` exits 0 — the most expensive consequences observed, 4 / 11 | F |

## The workspace

| # | Remediation | Defects and gaps it closes | Raised in |
|---|---|---|---|
| R38 | The workspace root is told apart from the selection — a root marker or a `--root` flag; at the least, a hint when every anchor misses on the same prefix | `M1·2` `awawa status docs` reports 148 `L016` on a clean corpus · `M3·9` `lint docs` reports 512; no command can be scoped to one area of a two-area workspace, and a probe must copy the repository | M1, M3 |
| R39 | The walk warns, once, about a skipped dot-prefixed directory that holds `.awawa` files | `M1·9` a `.awawa` directory is invisible, with no diagnostic | M1 |

## Diagnostics and help

| # | Remediation | Defects and gaps it closes | Raised in |
|---|---|---|---|
| R40 | `L014` and `L007` quote the string a continuation cannot attach to, name its field, and print the `+` form | `F·07` 54 and 36 diagnostics in two sessions, neither repaired from the output · `M2·24` a misplaced `+` is reported by its symptom; 54 `L014` lines in the session scan | F, M2 |
| R41 | `L006` on a nested field carries the schema `DESC` of its parent as suggestion; a reference to an undeclared type says so instead of `L004` | `M2·23` `suggestion` is `null`, and « unknown source type » reads as a typo | M2 |
| R42 | `L025` drops « nest a field » when the parent declares no nested reference | `M3·14` on an anchor literal the suggestion cannot be applied | M3 |
| R43 | `--help` on each subcommand prints that subcommand's usage and flags | `F·08` `awawa lint --help` answers « unknown flag », 2 / 11 | F |
| R44 | Tab-only indentation is documented next to `L001`, or made configurable | `F·10` `L001` is an error on a corpus the parser reads correctly, and nothing says whether that is by design | F |

## Manual, skills, distribution

| # | Remediation | Defects and gaps it closes | Raised in |
|---|---|---|---|
| R45 | The manual and the `awawa-schema` skill document the per-type ladder, with an example | `M1·3` two days on one ladder on `SCHEMA *` — `implemented` on a question — before a throwaway corpus showed `STATUS` can be declared per type | M1 |
| R46 | A one-screen page, « the corpus in ten minutes », before §3 of the manual; the multi-file shape shown early | `M1·11` the single-file start concentrated every conflict, and the split was a second migration | M1 |
| R47 | A page on what stays in the agent instructions and what becomes an entity | `M1·14` one rule with three homes, two decisions copied word for word | M1 |
| R48 | One line in the « Update » step: format first, match text afterwards | `M1·13` an edit script matching text as written fails after `fmt` | M1 |
| R49 | A CI story: a release archive at a stable URL with a checksum, and a workflow recipe pinning the version | `M1·12` no gate in continuous integration; the corpus's cleanliness depends on the session | M1 |
| R50 | Shorter skills, the depth left to the manual | `M2` usage: `awawa` 167 351 characters over 43 loads · `M3` usage: 9 593 characters × 11 loads and 10 491 × 6, 168 k in twelve sessions | M2, M3 |

## Recorded, with nothing asked

| Defect | Why nothing is asked |
|---|---|
| `M1·1` the migration scope was never asked | answered by the starter offered with Migration 2, and by its second version offered with Migration 3 |
| `M2·3` a schema entry accepts no prose field beyond `DESC`, `RATIONALE`, `SPEC`, and requires `DESC` | cost accepted: entity `DESC` and schema `DESC` share one name |
| `M2·4` the hyphen is refused in an entity name | the `::literal` of an anchor carries the mapping to the real name |
| `M2·5` `PROJECT` is listed as a keyword yet accepted as a type and a field name | settled by the manual; `SCHEMA` and `SHAPE` are accepted as field names too (Migration 3, section 9) |
| `M2·11` `--where` compares text | no cost once the corpus lints |
| `M2·15` a `WHEN` on a reference field is accepted and inert | not reproduced on 2026-09-18: on 2.7.0 `WHEN VIA @SECTION.Main` raises `L006` on the entity that writes that reference, and on the one that omits the field when its `DEFAULT` is that reference. R32, which asked for it, is withdrawn, and its number stays vacant |
| `M2·18` `status` sorts names as text | no cost with a project prefix |

## What holds

Every report lists what worked on the same footing as what did not: 8 mechanisms in Migration 1, 18 in the field
report, 25 in Migration 2, 6 in the IDE report, 24 in Migration 3. Three held in all eleven reports of the field
report: anchor and reference integrity, a required `REJECTED` on a decision, and closure integrity. The remediations
above are asked of a tool that carried the method through three migrations.

---

*Synthesised on 2026-09-18 from the first five reports and extended on 2026-09-22 with the context savings example,
all written on awawa 2.7.0. One defect was probed again for this
page and withdrawn, `M2·15`; every other figure keeps the perimeter of the report it comes from, and a claim wrong
at the source is wrong here.*
