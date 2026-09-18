*Feedback for the awawa dev team · awawa 2.7.0 · 2026-09-18*

# Migration 3: a second area, walked with the starter

Two days after the starter was handed over, the project that wrote it ran its from-scratch flow for the first time: a
product specification — save format, merge rules, command contract — moved out of three markdown documents into a
second area of the workspace that already held the methodology corpus. This report is what that walk found, about the
starter, about awawa 2.7.0 and about our own conduct. It stands alone: nothing in it needs another report to be read.

- **12** — sessions, 495 API turns, 61.9 M weighted tokens
- **40** — specification entities written, in a workspace grown from 219 to 275 entities
- **32** — defects found in the starter
- **24 / 14** — mechanisms of the tool that held, defects or limits met

## 1. Verdict

**The starter's**: Flow S carried the area from its inventory to a linted corpus of 40 entities and the deletion of the
first document it replaces, in eight steps and two audits; walking it found 32 defects, 9 of them in what a step
records, asks and ends on, 4 in the assumption of an empty workspace, and 12 in what no measure of the flow looks at —
coverage of the prose, a declared value nobody carries, what the walk leaves behind.

**The tool's**: `awawa 2.7.0` imposed or refused every declaration the walk probed once each conditional field sat in
its `WHEN` block — 8 lines « accepted in silence » in the first 28 probe lines, 0 in the 32 that followed — and
reported the 7 anchors broken by deleting a document in one run. What it does not see is what sits outside the corpus
(39 of 45 citation sites), what is archived (every check but the archive block's own), and whether git tracks the file
an anchor names.

**Ours**: the sessions read one file per turn (49 of the 54 turns of one step carried a single tool call), carried a
count for four steps that no command had produced (30 rules, there were 37), and stated two facts about the tool that
a probe contradicts; all three are corrected in section 9.

| Measure | Value | Perimeter |
|---|---|---|
| Sessions, turns, weighted tokens, output tokens | 12 · 495 · 61.89 M · 641 k | the twelve sessions of the walk, 2026-09-17 to 2026-09-18, script scan of the transcripts, turns deduplicated by message id, weighted = cache read + cache creation |
| `awawa` invocations | 404 — `lint` 125, `fmt` 71, `show` 70, `status` 68, `context` 28, `new` 24, `refs` 12, `--version` 3, `--help` 3 | same scan, every `awawa <subcommand>` of every shell command |
| Probe lines | 60 — 28 in S4 and S5, 32 in S6 to S8; 8 « accepted in silence », all in S4 and S5 | the probe tables of the five steps that touched a declaration |
| Workspace | 219 entities in 8 files → 275 entities in 12 files, 0 error, 0 warning | `awawa lint --strict --summary .`, 2026-09-17 and 2026-09-18 |
| Markdown replaced | 3 documents, 917 lines → 1 deleted (219 lines), 2 waiting on a task | `wc -l`, 2026-09-17; `git rm`, 2026-09-18 |
| Starter defects | 32, each with its measured evidence and a proposed remediation | section 7 |
| Tool: mechanisms that held, defects or limits | 24 · 14 | sections 4 and 5; every defect re-run on a throwaway or on the real corpus on 2026-09-18 |

## 2. How the walk ran

The project already held one corpus — its methodology: decisions, processes, tasks, 219 entities. The object of this
walk is a different one, the product itself, and the first question was whether it should be a second corpus. It is
not: the workspace is the unit of resolution, so the specification became a **second area of the same workspace** —
one `SCHEMA *`, moved above both areas, and references crossing from one area to the other. The starter's Flow S was
then run one step per session, the owner arbitrating every step, and a work file carried the state from one session
to the next.

Entry answers, carried by every step: a second area of an existing workspace; a product specification; the pull
request as the unit of change; tool defects recorded.

| Session | Turns | Weighted | Output | `awawa` calls | What it produced |
|---|---|---|---|---|---|
| Entry — can one project hold two corpora? | 12 | 0.65 M | 8.4 k | 17 | the workspace, not the directory, is the unit: one `SCHEMA *`, cross-area references valid |
| S1 — inventory | 15 | 1.06 M | 10.1 k | 5 | an inventory and five questions, written nowhere (starter defect 1) |
| S2 — types and thresholds | 41 | 4.11 M | 55.1 k | 11 | 5 types with their recording threshold, 8 rulings, the work file |
| S3 — reading loop | 29 | 2.47 M | 41.4 k | 21 | 5 questions mapped to their commands, 7 reference fields with their direction, 3 `CATEGORY` |
| S4 — skeleton | 43 | 4.45 M | 52.3 k | 38 | 108 schema lines, 5 data files, 14 probe lines |
| S5 — pivot and archive | 51 | 5.80 M | 64.1 k | 59 | **0 schema line**; the pivot ruling, 14 probe lines on 22 probe entities |
| S6 — sources and shapes | 58 | 7.23 M | 55.2 k | 46 | 1 source type, 2 `SHAPE`, 4 conditional fields moved into their `WHEN` blocks, 12 probe lines |
| S7 — first entities | 54 | 8.02 M | 85.1 k | 51 | 38 entities, 8 retyped, one type deleted, 13 probe lines |
| Cost analysis, asked by the owner | 33 | 3.17 M | 30.7 k | 2 | the cost of a step, split by phase |
| S8 — cleanup | 70 | 13.00 M | 88.2 k | 53 | 1 document deleted, 45 citation sites repointed, 7 probe lines |
| S7b — audit of the merge typing | 46 | 5.93 M | 84.3 k | 69 | 37 statements audited, 5 reclassified, 3 `CONFLICT` lines rewritten |
| S7c — audit of the domains | 43 | 6.01 M | 66.0 k | 32 | 21 rules audited, 0 gap; 44 statements of the kept documents classified; 58 fields cleaned |
| **Total** | **495** | **61.89 M** | **641 k** | **404** | |

Every figure is a whole session, scanned on 2026-09-18. The two audits were not steps of the starter: the owner asked
for them after S7, because nothing in the flow checks that an extracted entity is typed as its source claimed.

### What the walk produced

| Object | Before | After |
|---|---|---|
| Areas | 1 | 2, the schema raised above both |
| `SCHEMA` entries, the wildcard included | 12 | 17 — `SECTION`, `RULE`, `COMMAND`, `HYPOTHESIS`, `DATATABLE`, `GAME_RELEASE` added, `FACT` retyped and deleted |
| `SHAPE` | 9 | 11 — `version_segment`, `json_key` |
| Specification entities | 0 | 40 — 12 `SECTION`, 21 `RULE`, 5 `HYPOTHESIS`, 2 `COMMAND`; `DATATABLE`, `GAME_RELEASE` and `URL` at 0 by ruling |
| Rulings recorded | 93 `DECISION`, 12 `PROCESS` | 106 `DECISION`, 13 `PROCESS` |
| Workspace | 219 entities, 8 files | 275 entities, 12 files, 0 unresolved reference |

The schema grew where it was designed to and nowhere else: S4 added 108 lines, S6 moved four fields, the schema reviews
added three fields and rewrote two `DESC`; S5, S7, S8 and both audits added no declaration.

### The schema of the area, as what `awawa new` asks

| Type | Required lines | Conditional |
|---|---|---|
| `SECTION` | `HOLDS_FOR current\|legacy\|both`, `LABEL`, `ATTESTED_BY` (anchor) | `INDEX` and `LEGACY_INDEX` declared and required per era; cited under `CONSTRAINED_BY` when `current` or `both` |
| `RULE` | `HOLDS_FOR`, `DOMAIN format\|game\|merge` (repeatable, no default), `SPEC` › `ATTESTED_BY` | under `DOMAIN merge`: `CONFLICT`, `RESOLUTION`, `APPLIES_TO_SECTION` |
| `COMMAND` | `INVOCATION`, `IMPL` (anchor) | — |
| `HYPOTHESIS` | `UNTIL @TASK\|string` | — |
| `DATATABLE` | `TABLE` (anchor), `KEY json_key`, `JSON_SCHEMA` (anchor) | — |
| `GAME_RELEASE` | none: the name is the version, checked per segment by `NAME version_segment` | — |

## 3. What the method bought, measured

Three figures say what the walk's discipline returned, before the detail of the tool and of the starter.

| What was done | What it returned |
|---|---|
| Every conditional declaration probed twice, once satisfied and once violated, on a copy of the whole workspace | 8 silent acceptances found in S4 and S5; the conforming half alone had linted clean on all of them |
| A field legal in one state declared inside that state's `WHEN` block and nowhere else | the 2 silent acceptances of S4 became 3 `L003`; 0 silent line in the 32 probe lines that followed |
| A schema review between steps, reading every declaration together | 14 points raised across six reviews, 13 of them distinct: 3 fields added (`SECTION.ATTESTED_BY`, `DATATABLE.JSON_SCHEMA`, `INCOMING CONSTRAINED_BY`), 2 `DESC` rewritten, 1 decision on anchors and git, 1 type whose `DESC` admits none of the values of its own discriminant |
| The five questions of the reading loop re-run on the real entities | 4 of 5 answered in the predicted number of calls; the fifth waits on a type with no entity yet |
| An audit of the extracted entities against their source, statement by statement | 37 statements where every step had said 30; 5 reclassified; 3 of 14 `CONFLICT` lines untrue; 4 statements of the source with no home in the corpus |

## 4. What went well

Observed on 2.7.0 during the walk, on the probe tables or on the real corpus. The last column says what the mechanism
bought this project.

| # | Promise | What it bought |
|---|---|---|
| 1 | One workspace carries two areas under one `SCHEMA *`, and a reference resolves across them | a specification that cites the methodology's decisions and tasks, with no second schema to keep aligned |
| 2 | References are by identity: the schema file moved one directory up (`git mv`) and no reference broke | the move cost 1 anchor and 3 path mentions in the instructions, counted before it was made |
| 3 | `L013` checks a new name against every name the workspace reserves, fields and converses alike | 18 new names checked against 41 reserved ones in one lint of a full copy |
| 4 | One `CONVERSE` name is shared by several fields, on one type and across types (`GROUNDS` on `DECISION.RESTS_ON`, `DECISION.ASSUMES`, `RULE.ASSUMES`) | one footer line gathers everything that rests on a hypothesis, whatever its type |
| 5 | A `WHEN` on a `REPEATABLE` enum fires when its value is one among several (`DOMAIN format` + `DOMAIN merge`), and not on another value alone | a rule common to two domains is one entity, and the merge obligations still bind it |
| 6 | A field declared only inside a `WHEN` block is `L003` outside it, and the same field may be declared in several mutually exclusive blocks with no `L013` | `INDEX` on a `legacy` section, `CONFLICT` on a `format` rule: refused, where a type-level declaration had accepted both in silence |
| 7 | A nested `REQUIRED` is reported on the parent's line (`ATTESTED_BY` absent from `RULE.SPEC`) | « every obligation names what proves it » is located at the obligation, not at the entity |
| 8 | `CATEGORY` works on a nested field, and `--skip` removes the fields and accounts for them in the footer | `--skip attestation` keeps `SPEC` and drops its proofs: 21 → 12 lines on a decision, 27 → 13 on a rule |
| 9 | `INCOMING` inside a `WHEN` block is `L026`, naming the entity, the converse, the block and the schema line | « a section the game writes is constrained by at least one rule » is a gate; the twelve sections were written in pairs with the rule that cites them because of it |
| 10 | A `NAME` shape is checked per dot-separated segment, and `L024` names the failing segment | `GAME_RELEASE 2.102` is a legal name and a reference target; `2.102b` is refused on `102b` |
| 11 | A `SHAPE` on a field value matches quoted or bare, and refuses at the boundary (`"gId2"` accepted, `"world_object_name"` refused) | the one string a command consumes — the key a `jq` filter selects on — cannot be prose |
| 12 | `L016` tells a missing path from a missing literal in its message | deleting a document and rewriting a README raised the two kinds in one run, each readable without opening a file |
| 13 | Deleting a file raises `L016` on every anchor into it, in the same run | 7 anchors broke at the deletion of one document, all 7 reported at once; nothing passed in silence inside the corpus |
| 14 | A typed reference field refuses a leftover reference to a deleted type by the type check (`L009 … expects @RULE, given @FACT.X`), and `L002` refuses an entity of that type | the retyping of 8 entities and the deletion of their type ended on a gate, not on a `grep` |
| 15 | `refs` per entity found the sixth incoming edge of the retyped entities, which the count made two steps earlier had missed | a migration ledger built from the tool, not from memory |
| 16 | `fmt --rename` renames an identity and its indexed sites; the retired name is `L004` anywhere it survives | one `LIMITATION` renamed when the document in its name was deleted |
| 17 | `L025` reports an entity identity written in prose and indexed by nothing | 6 `SOURCE` lines naming the entity a statement moved to were given their nested `REF` in the turn that wrote them |
| 18 | `L006` on a `SPEC` left with no `IMPL` | an obligation whose only proof was the deleted document had to be deleted, not left standing anchorless |
| 19 | The fields of the `WHEN STATUS archived` block stay checked under `GATE suppressed` (`ARCHIVED_ON` absent is `L006`, malformed is `L007`), and are `L003` on an active entity | the archive costs two lines and cannot be half-written |
| 20 | `--where STATUS!=archived` keeps every entity whose `STATUS` is unwritten | « the live ones » is one call |
| 21 | The `context` footer lists incoming edges under their `CONVERSE` name, for the root and for the rest | a question starting from a section reads its rules' identities in one call: 1 entity, 10 lines |
| 22 | `fmt` re-wraps a long line at the canonical width and reorders nothing | 58 prose fields rewritten by substitution on joined lines, none wrapped by hand; a schema diff of 108 insertions and 0 deletions |
| 23 | A declared type with no entity, an empty data file and a comment-only file all lint clean | five data files created ahead of their first entity |
| 24 | Anchors resolve in a plain copy of the tracked files, outside git | a probe workspace built from `git ls-files` has 0 factitious `L016`, so an anchor probe reads true |

The `REQUIRED` under `WHEN DOMAIN merge` deserves a line of its own: it is why each of the 14 merge rules carried a
`CONFLICT` line at all, and the audit found 3 of the 14 untrue. The schema did not check them; it made them
falsifiable.

## 5. What went wrong

Every row was observed during the walk and run again on 2026-09-18 while writing this report, on the real corpus or
on a throwaway one; the evidence quotes the walk's figures where the re-run only confirmed them. The last column says
what the defect cost this project.

| # | Defect or limit | Evidence | What it cost |
|---|---|---|---|
| 1 | `new` omits the `INCOMING` obligation of a `WHEN` block | `awawa new SECTION Probe .` prints `// WHEN HOLDS_FOR current: INDEX (required)` and nothing of the `INCOMING CONSTRAINED_BY` the same block carries; `L026` fires as soon as the entity is written alone | the one obligation an author cannot see by reading the entity is the one the skeleton drops |
| 2 | `INCOMING` is legal only inside a `WHEN` block | at type level: `L023 INCOMING is not a SCHEMA declaration; expected one of DESC, RATIONALE, SPEC, EXTERNAL, INCLUDE, FIELD, WHEN, NAME`. Wrapped in `WHEN STATUS active` on a `STATUS` with `DEFAULT active`, it fires `L026` on an entity that writes no `STATUS` | two schema reviews concluded that an orphan source entity could not be reported and left the guard to a reading of incoming counts; the workaround was found only while writing this report |
| 3 | `GATE suppressed` extinguishes every check on the archived entity but the archive block's own fields | on one archived rule, 4 `L006` silent; an archived `INDEX "not-a-number"` raises no `L007`, a reference to a missing entity no `L004`, an anchor on a missing file no `L016` (377 before, 377 after); each active twin raises its finding | an entity archived unclean is reported by nothing, ever again; the project wrote a rule that the change which archives lints first |
| 4 | `context` reduces an archived target to `// suppressed: @SECTION.X` | an active rule pointing at an archived section: 1 entity, 7 lines, the section's `LABEL` and indices absent; the incoming side, on the archived entity, is still reported | the reader of a live rule loses the body of what it constrains, and the line says neither why nor since when; the project keeps a removed section active under an era field instead of archiving it |
| 5 | `context` expands outgoing edges only | the type two of the five questions start from declares no outgoing reference: `context @SECTION.Players` returns 1 entity, its five rules as identities in the footer; their `SPEC` costs a second call | 1 + 1 calls for two of five questions; the alternative, a converse written by hand on the section, was refused as derived information nothing would keep true |
| 6 | `WHEN` adds obligations and never forbids | a field legal in every state but one has no declaration: `INDEX` is declared in two blocks, `LEGACY_INDEX` in two; the keying field cannot be conditioned, and a field spliced by a `FIELDSET` cannot be redeclared to key it (`L013`) | `HOLDS_FOR` stays required on a rule about the game, where the era of the save format says nothing, and is written `both` |
| 7 | A slot holds one reference type (`L020`) and cannot mix `anchor` with a reference | `FIELD TWO @A\|@B` is `L020`, and `FIELD MIX anchor\|@A` is refused as syntax (`L014 '@' is only valid at the start of a reference`). `ATTESTED_BY anchor` is required under every `SPEC` of `RULE`; the proof of a rule about the game is a wiki page or a game build — a `URL` or a `GAME_RELEASE` entity — never a file of the repository | the 11 to 13 game rules still to write are unwritable as the type stands, or attested by our own code; the fix is a sibling field under `WHEN DOMAIN game` |
| 8 | `L016` resolves an anchor against the disk; git is never consulted | an anchor into a file listed in `.gitignore`, inside a git repository, lints clean; the natural witness of a save format is a real save, and the saves sit in gitignored directories | an anchor there lints clean for its author and is `L016` in CI and in a fresh clone; 487 anchors, 0 ignored today, held by a written decision and a guard script still to build |
| 9 | The `PATH` argument is at once the selection and the workspace root | `awawa lint --summary docs` → 512 `L016`, all factitious, the anchors resolving from `docs/`; `awawa lint --summary docs/awawa-project-specification` → 48 `L004` and 40 `L002`, the schema and the other area being out of the walk | no command can be scoped to one area of a two-area workspace; three probe workspaces carried 361 to 383 factitious `L016` until the copy was built from every tracked file |
| 10 | Nothing outside the corpus is indexed | at the deletion of a document `lint` saw 6 of 45 citation sites; the other 39 — 24 code comments, 13 README lines, 2 document links — were found by `grep`. Today `refs @RULE.TheSaveOnPrimeBecomesSaveA` lists 1 site, while 2 code comments and 1 README row cite that identity; `fmt --rename` rewrites « every indexed reference site, nothing else » | 51 identity mentions outside the corpus (36 under `packages/`, 14 in the README, 1 in a document) that a rename would leave stale with nothing reporting it |
| 11 | No listing counts the entities per value of an enum field | `DOMAIN game` carried 0 of 21 `RULE` through four steps and four schema reviews; `status TYPE --where FIELD==VALUE` answers one value per call, and `status` groups by `STATUS` alone | a declared value nobody carries read exactly like a value in use, until an audit the owner asked for |
| 12 | `status` counts an entity with a defaulted `STATUS` under `(none)` | `awawa status .`: the `active` column is 0 on every row, 256 of 275 entities under `(none)`, with `DEFAULT active` declared on `SCHEMA *` | the overview reads as a workspace with no active entity |
| 13 | The `skipped` footer of `context` enumerates every pruned field, entity by entity | `context @COMMAND.MergeSaves --depth 2` with three `--skip`: 33 entities, 318 lines, 17 154 characters, of which the three `skipped` lines are 3 559 — 20.7 % | the largest package of the corpus spends a fifth of its size listing what it was asked to leave out |
| 14 | `L025` on an anchor literal that spells an identity suggests a fix the field cannot take | `L025 @RULE.X is mentioned in prose and indexed by nothing; nest a field carrying it under IMPL`, while `IMPL` declares no nested reference | one gate round; the rule is right — an anchor quotes a file, it does not name an entity — and the suggestion is not |

Defects 6 and 7 are the documented design of `WHEN` and of a slot, and 3 of `GATE`; they are listed for what they cost,
not as faults.

## 6. Proposed remediations

Each proposal with what it would have changed on this walk, and the defects of section 5 it closes.

| # | Proposal | What it would have changed | Defects |
|---|---|---|---|
| 1 | `new` names the incoming obligation in the `WHEN` footer line — `// WHEN HOLDS_FOR current: INDEX (required), referenced under CONSTRAINED_BY (required)` | a section's author learns from the skeleton that it arrives with a rule | 1 |
| 2 | `INCOMING` is accepted at type level | « a source entity nothing cites is reported » is one line, and the two reviews do not conclude it cannot be written | 2 |
| 3 | A lint mode that reads through `GATE suppressed` | the change that archives an entity proves it clean, and a later audit of the archive is one command | 3 |
| 4 | `context` prints, for a suppressed target, its `STATUS` and `ARCHIVED_ON`, or expands it on request | an archived section stays readable from the rule that cites it; the era field stops being the only way to keep a removed section visible | 4 |
| 5 | `context` expands incoming edges on request, to a depth | Q1 and Q2 of the reading loop are one call each; the direction of an edge stops deciding what a session can read at once | 5 |
| 6 | A `WHEN` block may forbid a field | `INDEX` and `LEGACY_INDEX` are declared once each; `HOLDS_FOR` is not written on a rule the era does not concern | 6 |
| 7 | A slot accepts several types, references and `anchor` included | `ATTESTED_BY` takes a file, a `URL` or a `GAME_RELEASE`, and the game rules are writable without a second field | 7 |
| 8 | A lint option that resolves anchors against the files git tracks | the decision and its guard script are one flag in CI | 8 |
| 9 | The workspace root is told apart from the selection — a root marker, or a `--root` flag | `lint` and `status` run on one area with anchors and schema resolved; a probe copies an area, not the repository | 9 |
| 10 | Declared extra paths are scanned for `@TYPE.Name` mentions: `refs` lists them, `lint` reports an unresolved one, `fmt --rename` rewrites them | the 39 citation sites found by `grep` are found by the gate, and « a code comment cites the entity » is checked rather than trusted | 10 |
| 11 | `status TYPE --by FIELD` prints one count per declared value, zero included | `DOMAIN game` at 0 of 21 is on the screen from the step that declared it | 11 |
| 12 | `status` counts a defaulted `STATUS` under its default | 256 entities read as `active` | 12 |
| 13 | The `skipped` footer prints counts; the enumeration moves to `--json` | the package of the largest question shrinks by a fifth | 13 |
| 14 | `L025` drops the « nest a field » suggestion when the parent declares no nested reference | the finding is fixed from its message | 14 |

## 7. The starter, walked

The starter under review is the one handed over with the second migration report, unchanged during the walk (one
commit, 2026-09-17). Flow S was walked whole, on an implemented project joining an existing workspace. The 32 defects
keep the numbers the walk gave them, in the order they were met; they are grouped here by what they have in common.
Each remediation is stated as the walk proposed it. A second version of the starter,
`awawa-specification-starter-v2.md`, was written from these defects after the walk and is offered with this report;
the first version stays as it was served, since every defect below quotes it.

### A. What a step records, asks and ends on — 9 defects

| # | Defect | Measured | Remediation proposed |
|---|---|---|---|
| 1 | A step's result is written nowhere | S1 answered in the conversation and named no file; S2 could re-read neither the inventory nor the five questions and re-derived both | every step writes its result to a named work file, whose path is among the entry answers of the next prompt |
| 2 | Questions meant for the user are printed, never asked | the five questions of S1 were listed and none was arbitrated | a step that produces a question puts it to the user and waits |
| 3 | The next prompt is proposed with the result, before arbitration | the S3 prompt was written at the end of S2; the owner's refinement then changed 4 of 5 open points and added a type | the next prompt is emitted after the user's last answer |
| 4 | Nothing says when a step is over | S2 was answered three times, no confirmation asked at any of the three | a step ends when every point it opened is settled and the user confirms |
| 5 | An entry answer that creates a standing obligation is carried by no step | « tool defects: recorded » is asked once; in S3 the defects were recorded only because the owner asked mid-step | the obligation is restated as an instruction in every step prompt |
| 6 | Questions are put in prose | the first arbitration of S3 was refused: « fais moi des tableaux pour que ce soit plus facile de piger ce que je dois répondre » — one turn spent before any answer | alternatives are a table, one row each, the columns being what distinguishes them |
| 14 | No step says where the walk stands | 3 of the 24 lines of the S5 prompt are the owner retyping what is closed, as in S3 and S4 | the prompt opens on its rank (« step 5 of 8 ») and the step reads what is closed from the work file |
| 22 | The closing formula asks for results, never for the files touched | the owner at the close of S7: « il ne m'a pas été précisé lors des premières étapes quels fichiers avaient été créés et où, j'ai dû les trouver par moi-même afin de les relire avant confirmation »; S4 created 6 files, S7 changed 11 and deleted 1 | before the confirmation question: the files created, modified and deleted, and which to re-read |
| 23 | A step carries its conclusions and nothing else — no reading ledger, no cost | S5 spent 51 turns and 5.80 M to add 0 schema line, S7 54 turns and 8.02 M to write 38 entities, and the two read alike in the walk's records; inside S7, 13 turns and 1.42 M re-read sources S1 and S2 had read | the work file records what a step read and at which revision; a step ends on its cost beside its result |

### B. The flow assumes an empty workspace and an implemented project — 4 defects

| # | Defect | Measured | Remediation proposed |
|---|---|---|---|
| 7 | S4 prescribes creating a `SCHEMA *` | the workspace already carried one; the premise « each corpus is independent » is false of the tool, where the workspace is the unit. S4 extended the schema by 108 lines and created none | the entry point asks whether the object joins an existing workspace; S4 branches on the answer |
| 11 | S5 prescribes the archive mechanism as a creation | its four declarations all stood before the step opened; S5 added 0 schema line | S5 probes what stands on the new types and completes what the probe shows missing |
| 16 | S6 prescribes the `SOURCE` mechanism as a creation | it stood, with 4 source types and 9 `SHAPE`; of 5 places with no source type, 3 needed nothing new and 1 type was added | every step that declares a mechanism opens by reading what the workspace already declares — the third occurrence makes it structural |
| 10 | No flow covers a project with no implementation yet | the entry point branches on whether a corpus exists; Flow S inventories existing files, probes anchors to existing symbols and measures on real entities. Not hit by this walk: read from the structure of the two flows | a third flow whose schema requires the anchor only at the implemented rung of a `STATUS` ladder |

### C. Probing and the order of typing — 5 defects

| # | Defect | Measured | Remediation proposed |
|---|---|---|---|
| 8 | P10's throwaway corpus holds the new schema lines alone | the check that matters for 18 new names is `L013` against the 41 the workspace reserves; the probe had to copy the whole area, 8 files and 219 entities | P10 copies the corpus the schema will enter; a from-scratch corpus is the special case |
| 9 | P10 writes conforming entities only | 7 conforming entities linted clean whether or not the `WHEN` blocks fired; a second file of violations produced 8 findings and two silent acceptances | two entities per conditional declaration, and three outcomes recorded — imposed, refused, accepted in silence — the third being a finding |
| 18 | The probes S6 names are generic | its three probes behaved as documented and changed no schema line; the rows that changed the schema were the area's own declarations | from the second step on, one probe pair per declaration the step writes or moves |
| 17 | P7 (type everything) is invoked two steps after the declarations are written | S4 declared 4 conditional fields at type level, recorded two silent acceptances and concluded « not worth a second discriminant field »; S6 moved the fields into their blocks and the same lines became `L003` | S4 invokes P7 with P8 and P10: a declaration is typed when it is written |
| 19 | S7 opens on writing entities without asking whether each type's required anchors resolve today | `DATATABLE` requires two anchors on files that do not exist: 0 of 5 could be written, found at the moment of writing | S4 asks of every required anchor whether a tracked file satisfies it; where none does, the answer is a task recorded then |

### D. What archiving does — 2 defects

| # | Defect | Measured | Remediation proposed |
|---|---|---|---|
| 12 | P4 declares `GATE suppressed` without saying it silences every check on the entity | tool defect 3 above | P4 states it, and that the change which archives runs `lint --strict` before writing `STATUS archived` |
| 13 | Neither P3 nor P4 says what archiving costs the entities that still point at the archived one | tool defect 4 above | P4 names the precondition — nothing active still points at the entity — and the cleanup pass reads the incoming count `status TYPE` prints |

### E. The reviews and the measures the flow does not have — 8 defects

| # | Defect | Measured | Remediation proposed |
|---|---|---|---|
| 15 | No step reads the schema back as a whole | the first such reading, asked by the owner between S5 and S6, raised 4 points no single step could see, 3 of them probed as real gaps | a review step between the schema steps and the first entities, then at every step boundary |
| 28 | A type's `DESC` and the values of its own discriminant can contradict each other | `SCHEMA RULE`: « a statement … a real save, or a game source, can contradict »; none of the 14 `DOMAIN merge` rules satisfies it — 14 of 21 instances. Written in S4, it survived four reviews and was found by an audit of the entities | a schema review runs each type's `DESC` as its admission test against every value of its discriminating fields |
| 30 | A value of an enum is declared once and never measured | `DOMAIN game` at 0 of 21 through S7, the audits and four reviews; the zero hid that no game rule can satisfy `ATTESTED_BY anchor` (tool defect 7) | the criterion between the values is recorded as an entity, and the gate of every later step prints one count per declared value |
| 21 | S7's two measures say nothing about coverage | P1 scored 0 and P2 its predicted call counts while 2 statements of a source document had no entity; a coverage table the owner's plan happened to carry found them | S7 requires a coverage table per source document; S8 refuses to delete a document whose rows are not all filled |
| 26 | A step asserts the size of the material it covers | « 30 rules » was written in S7 and carried through three later places; `grep -c '^\*\*Rule GR-'` on the document returns 37 | the command that counts the units is printed beside the count |
| 27 | The coverage table proves nothing about prose | §1 of the deleted document was reported covered by three decisions that state none of its four bullets; 4 statements had no home, one of them false as written | one row per statement, not per section; a row whose home is a document counts as uncovered |
| 31 | S1 sorts documents into replaced and kept, and no step ever reads a kept one | a document kept for its value tables holds 44 statements, 11 to 13 of them rules no step had seen; the task that defers the tables was written as if it deferred the document | the inventory says, per kept document, what is deferred and what is not |
| 20 | A retyping the walk decides is owned by no step | ruled in S2, performed in S7: 8 entities, 6 incoming edges, 1 schema field, 1 schema entry, 1 file, 2 mentions outside the corpus — five kinds of site, none named by the flow | the step that rules a retyping opens a migration ledger, a precondition for closing the walk; `refs` runs per entity before the type is deleted |

### F. What the walk leaves behind — 4 defects

| # | Defect | Measured | Remediation proposed |
|---|---|---|---|
| 24 | Flow S never disposes of the source material | S8 designs a cleanup of entities; at the last step a 219-line document, fully extracted, still opened on « This is the authoritative reference » | S8 asks, per document the walk emptied, whether it can go and what is still owed; a readiness criterion says no replaced source still stands |
| 25 | The deletion of a source is guarded inside the corpus alone | 45 citation sites, 6 seen by the gate (tool defect 10) | the citations outside the corpus are counted by `grep` before the deletion and repointed in the same change, a code comment then citing the entity |
| 29 | The starter's own steps are written into the corpus | 56 entities of 274 cited a step rank — 55 `SOURCE`, 2 `REJECTED`, 1 `UNTIL` — the whole new area, 40 of 40 | S6 says what a `SOURCE` carries — date, source document, identifier inside it, pull request — and that the rank of the step is not part of it |
| 32 | The process that produced an entity has no field | cleaning defect 29 rewrote 58 fields and left 11 `SOURCE` as a bare date and a `REF`: for those the walk was the only source | `SOURCE` declares a nested date field, and the starter says an entity whose only origin is the process carries that date alone |

### The starter's readiness criteria, answered

| Criterion | Verdict |
|---|---|
| `lint --strict` passes with zero findings | yes — 0 error, 0 warning, 12 files, 275 entities |
| `status` shows every type with entities, or its emptiness intended | yes — 3 empty types, each waiting on a named task or on its first citation |
| `context` on the pivot returns the entity, what it rests on and its footer | yes |
| `refs` on a source entity lists what cites it | not exercised: no `URL` nor `GAME_RELEASE` entity exists yet |
| Each session question answered in one `context` or one `status` call | four of five |
| No entity would be refused by its type's threshold | yes, re-read per type at S8: 0 deletion |
| The agent instructions name the corpus path and the reading loop | yes |
| The cleanup pass is designed or consciously skipped | skipped, with two thresholds at which to reconsider: 12 archived entities of 270, 2 of them with no incoming reference |
| Probe directories deleted, nothing of them entered the project | yes |

## 8. How the tool was used

Measured by a script over the transcripts of the twelve sessions of section 2, on 2026-09-18. Nothing here is a
defect; it is where the use of the tool departed from its protocol, and what that asks.

| Call | 12 sessions |
|---|---|
| `lint` | 125 |
| `fmt` | 71 |
| `show` | 70 |
| `status` | 68 |
| `context` | 28 |
| `new` | 24 |
| `refs` | 12 |
| `--version`, `--help` | 6 |
| All `awawa` invocations | 404 |
| Raw reads of a corpus file of the repository (`grep` 23, `sed` 15, `cat` 9, `tail` 5, `awk` 3) | 55 |

| # | Observation | Measure | What it asks of the tool |
|---|---|---|---|
| 1 | The gate is the most-run command | `lint` and `fmt` are 196 of 404 invocations; `--strict` was passed 87 times, `--summary` 35 | nothing: it is the protocol — format and lint in the turn of every write |
| 2 | The corpus is still read as files | 55 raw reads against 28 `context` and 70 `show`; 23 of the 55 target the schema file, 25 a data file, 7 several files at once | the schema reads have a tool path (`show TYPE`, `show FILE`) and are ours; the 5 `tail` reads look for where a new entity goes, which `new` does not say since it prints to standard output |
| 3 | `show` takes one target | 35 `show` invocations in one audit session, chained in a few shell commands, to read 14 rules and their neighbours | several targets in one `show`; `context` from the command that applies the rules was the other path, and was not taken |
| 4 | The corpus is a quarter of what a session reads | 25.8 % of 1.60 M tool-result characters came from `awawa` output or corpus files; from 12 % (S1) to 37 % (S5) per session | listings that answer without an entity dump (remediations 11 and 13) |
| 5 | The skills are paid at every load | `awawa` 9 593 characters × 11 loads, `awawa-schema` 10 491 × 6: 168 k characters | the size of a skill is a cost of the tool, paid by every session that loads it |
| 6 | The findings of this walk were provoked, not met | 114 lint output lines naming a rule: `L006` 35, `L016` 26, `L003` 12, `L007` 9, `L025` 8, `L026` 6, `L009` 5, `L022` 4, `L005` 3, `L024` 3, three others 1 each; a `--summary` line counts once. Unprovoked: 7 `L016` at the deletion of a document, 7 `L025` | `REQUIRED` and its `WHEN`-gated form carry the method; `L025` is the rule that fires on honest writing |
| 7 | No invocation was refused for its syntax | 0 of 404, by the scan's heuristic: an error flag, or an error word in the first 600 characters of the result | nothing: the usage text was read 3 times and sufficed |

## 9. Corrected while writing this report

The walk's own reports are dated and are not rewritten; four of their claims do not survive a check made on
2026-09-18, and are corrected here rather than repeated. One more row corrects the Migration 2 report, dated
too: its defect 15 was probed again when the second version of the starter contradicted it.

| Claim of the walk | Check | Verdict |
|---|---|---|
| « The field cannot be called `SCHEMA` or `SHAPE`: both are keywords of the tool » — the reason `DATATABLE.JSON_SCHEMA` got its name | a throwaway corpus declaring `FIELD SCHEMA string`, `FIELD SHAPE string` and `FIELD PROJECT string` and an entity writing all three: `lint` clean, `show` and `new` print them | wrong; the claim was never probed. The name kept is still the clearer one |
| « `INCOMING` lives in a `WHEN` block, and neither type declares a field to key one on », so an orphan source entity is silent | `WHEN STATUS active` with `INCOMING USED_BY`, `STATUS` carrying `DEFAULT active` on `SCHEMA *`: `L026` on the uncited entity, which writes no `STATUS` | overstated: the obligation can be written today, at the price of a wrapper block (tool defect 2) |
| A code comment that cites an entity identity makes the next rename « an `awawa fmt --rename` and not a second `grep` » | `refs` on a cited rule lists 1 site and neither code comment; the usage text of `--rename`: « every indexed reference site, nothing else » | wrong: a rename leaves the comments stale, in silence (tool defect 10) |
| Migration 2, defect 15: a `WHEN` on a reference field « is accepted by lint and inert » | `WHEN VIA @SECTION.Main` with a required field inside, on a throwaway corpus: `L006` on the entity writing `VIA @SECTION.Main`, `L006` on the entity omitting `VIA` under `DEFAULT @SECTION.Main`, nothing on the entity pointing elsewhere; `new` prints the block | not reproduced on 2.7.0: the block fires. Remediation 7 of Migration 2 asks for what the tool already does |
| The audit S7b was « the cheapest step of the walk by a factor of two and a half », 30 turns and 3.17 M, for having grouped its reads | the figure was taken mid-session, the other steps' at their close; whole sessions: S7b 46 turns and 5.93 M, S7c 43 and 6.01 M, S8 70 and 13.00 M, against S4 43 and 4.45 M | overstated: on whole sessions S7b costs what S5 cost. Weighted tokens per turn do come out lower than its neighbours' — 129 k against 148 k (S7) and 186 k (S8) — which is the size of the effect of grouping reads |

## 10. What was ours, not the tool's

| What | Evidence |
|---|---|
| One read per turn | 49 of the 54 turns of S7 carried a single tool call, 32 read nothing but files; about ten avoidable turns and ~1.0 M of the step's 8.02 M |
| Recording a step costs what performing it costs | in S7, 12 turns and 2.54 M to record against 16 turns and 2.55 M to write the entities and the migration; the same proportion in S7c |
| A figure carried, never computed | « 30 rules » for four steps; 37 by one `grep -c` |
| The walk wrote itself into the corpus | 56 entities dated by a step rank, cleaned in the last session |
| Three false `CONFLICT` lines written in S7 | an aggregation — a sum, a union — was described as a disagreement between two saves; found by the audit, rewritten |
| Two facts about the tool stated without a probe | section 9, rows 1 and 2 |

## Scope of the claim

Every session of the walk ran on `claude-opus-5`, read from the transcripts; the walk's reports give its effort as
`medium`, which no transcript records. What a step cost, what it left unasked and what it concluded from a probe hold
for that model, that effort, awawa 2.7.0 and this one walk: an implemented project joining an existing workspace.
Starter defect 10 was not hit and is read from the starter's structure. This synthesis was written by Claude Fable 5.1
at effort `high`, from the two reports of the walk, a scan of its twelve session transcripts and the probes of
sections 5 and 9.

---

*Written on awawa 2.7.0. The figures come from a script scan of the project's session transcripts, from the probe
tables of the walk and from probes on throwaway corpora.*
