*Feedback for the awawa dev team · awawa 2.7.0 · 2026-09-16*

# Migration 2: a starter for the next corpus

Four days after the first migration, the same project rebuilt its corpus from what the first one had cost. The method it followed is written up as a starter that any project can run, whether it starts a corpus or migrates one. The starter is a draft, not yet tested on another project, and it is handed to you as it is.

- **10** — principles in the starter
- **45** — throwaway corpora probed
- **25** — strengths confirmed
- **23** — defects found

## 1. Verdict

**Ours**: the first corpus was written for the writer — every ruling under one type and one four-value `STATUS` ladder, history kept as entities, everything recorded — and read one entity at a time. 32 rulings and 45 throwaway corpora later, the target keeps four ruling shapes, one archive mechanism and a schema line for every recording threshold, so that the tool checks what a review used to ask.

**The tool's**: `awawa 2.7.0` checks what a schema declares — required and nested-required fields, anchors to the symbol, shapes on values, `WHEN`-gated requirements, converses — reliably enough to carry the method. What it lacks is listings (`--where` on a nested field, on a `WHEN`-only field, on a default), an any-of requirement, and a canonical entity order.

## 2. How the migration ran

The objective was to refine the schema and the entities of the first corpus: 137 `DECISION`, 61 `OPEN_QUESTION`, 12 `TASK` and 7 `PACKAGE` on 2026-09-15. Every schema line was probed on a throwaway corpus before it was ratified, and every defect and strength met on the way was recorded, all on 2026-09-16 with awawa 2.7.0.

1. **Scan and analyse** the previous schema and entities.
2. **Draft the types without fields**: which entities does the project need?
3. **Draft the fields and the relations**: what does each type carry, and what points at what?
4. **Review each type with its fields**, iteratively: constraints, requirements, relations, shapes.
5. **Apply the migration.**

### The target schema, as what `awawa new` asks

The write-time cost of the result: the required lines a writer fills per type.

| Type | Required lines | At a later state |
|---|---|---|
| `DECISION` | `REJECTED`, `SPEC`, `SPEC › IMPL` | — |
| `PROCESS` | `REJECTED`, `SPEC` | — |
| `LIMITATION` | `SYMPTOM`, `UNTIL` | — |
| `FACT` | `DESC`, `ATTESTED_BY` (or `UNTIL` on a hypothesis) | — |
| `OPEN_QUESTION` | `DESC`, `BLOCKS @TASK` | — |
| `TASK` | `TITLE`, `STATUS`, `SPEC` | `SPEC › IMPL`, `DELIVERED_BY` once implemented |
| `PACKAGE` | `DESC`, `MANIFEST` | — |
| `PULL_REQUEST` | `PROJECT`, `NUMBER` | — |
| `PROJECT` | `GIT_REPOSITORY` | — |
| `USAGE_REPORT` | `FILE` | — |
| `URL` | `LOCATION` | — |

`STATUS`, `ARCHIVED_ON` and `PURGE` are never written on an active entity (L003 outside the `WHEN` block); a `SOURCE` line costs its `REF`.

## 3. The starter

The starter turns the method into a guide an agent runs with its user, one step per session. It is generic: nothing in it depends on the project it was drawn from. It is also a draft: it has not been run on another project yet, and its principles and steps may change with experience. It answers the two asks of the first migration report — a scope settled before the schema, and a schema derived with the user rather than invented from the manual.

> **Entry point — four questions before anything else**
>
> 1. Does an awawa corpus already exist? It decides the flow, migration or from scratch, and `awawa status --json` proves the answer.
>
> 2. What is the corpus about? A methodology, a product specification, a game or system design, a tool's behaviour, or something else.
>
> 3. What is the project's unit of change? A pull request, a merge request, a reviewed commit, or none: it is the change that archives an entity, and a candidate source type.
>
> 4. Are defects found in awawa during the probes recorded? If so, in a file outside the project, for the awawa maintainers.

Ten principles follow, each stating what to do, why it matters and what the tool then checks in place of a rule to remember. Both flows apply them in a different order: from scratch, a principle is designed and probed; in a migration, it is first measured on the existing entities.

| Principle | What to do | What the tool then checks |
|---|---|---|
| P1. Recording threshold before the first schema line | Write, per type, the condition under which an entity is recorded, as a required field. | L006 on every entity that misses its threshold: `BLOCKS @TASK` required on a question type makes a question no task waits on an error. |
| P2. Reading loop before the edges | Decide what a session runs — `status`, `context --skip`, `refs` then `show` — and orient every edge so that `context` on the starting entity reaches what the session needs. | `context` follows outgoing references and lists incoming ones in its footer under their `CONVERSE` name; `CATEGORY` lets `--skip` leave a field out. |
| P3. Planning pivot first | Start from the type with a lifecycle and dependencies — a task, a phase, an epic — or, without a lifecycle, from the type most questions start from. | `status TASK` lists the plan; `context @TASK.X` shows what it rests on and, in its footer, what blocks it. |
| P4. One archive mechanism, no history in the corpus | `STATUS active\|archived` on `SCHEMA *`, `ARCHIVED_ON` required once archived; a replaced ruling is rewritten in place; no `superseded`, no `SUPERSEDES`, no `:v2`. | `context` no longer expands an archived entity; L006 on an archive without `ARCHIVED_ON`, L003 on `ARCHIVED_ON` written on an active entity. |
| P5. A type only for a different shape | Split a type only when its set of required fields differs; otherwise one type with a discriminant field. | `awawa new` prints a different skeleton per type; L006 on the distinguishing required field catches a misfiled entity. |
| P6. Sources typed from the first schema | Declare the source types, and `SOURCE` with a required nested `REF`. | L006 on a provenance left in prose, L004 on an unknown source, L007 on a malformed address. |
| P7. Type everything that can be typed | A date, an address, a version, an identifier is a `SHAPE`; a code location is an `anchor`; a field legal in one state lives in that state's `WHEN` block. | L007 on a value off its shape, L016 naming the file and the literal, L003 on a field written outside its `WHEN` block. |
| P8. Schema in one file, one file per type, append at the end, one language | `_schema.awawa`, one data file per type, new entities appended at the end. | Nothing, by design: the tool reads no file name, so every command gives the same result under any layout. |
| P9. A cleanup pass (optional) | A script run by hand archives what stopped binding and deletes what is past its retention delay. | `fmt` and `lint --strict` confirm the result; on 2.7.0 a field declared only inside a `WHEN` block is read with `show --json`, not `--where`. |
| P10. Probe every schema line first | Write the line in a throwaway corpus with one entity and one reference, then lint. Not a step: it runs inside every step that writes a schema line. | Each probe records whether the tool enforced, refused or silently accepted what was expected. |

### Two flows

| Flow | When | Steps | Sessions |
|---|---|---|---|
| S — from scratch | No corpus: only prose, such as a README, decision records, agent instructions, a wiki or issues. | S1 inventory · S2 types and thresholds · S3 reading loop · S4 skeleton · S5 pivot and archive · S6 sources and fields · S7 first entities and measures · S8 cleanup pass | 8–12 |
| M — migration | `.awawa` files exist, with or without a schema. | M1 baseline · M2 threshold · M3 reading loop · M4 pivot · M5 history to archive · M6 types by shape · M7 sources and fields · M8 layout · M9 cleanup pass | 9–14 |

Every step ends with its result and the prompt of the next session. In a migration, each step is one change reviewed on its own, and `awawa diff` against a snapshot shows its entity-level effect. The guide closes on a validation after each step and on readiness criteria for the whole corpus.

## 4. What went well

Observed on 2.7.0 on 2026-09-16, on the probes of the migration. The last column says what the mechanism buys a project that follows the method.

| # | Promise | What it buys |
|---|---|---|
| 1 | `REQUIRED` is gated by the wildcard's `WHEN STATUS`: an archived entity missing a required field passes even `--strict` | archiving costs two lines, never a rewrite to keep lint clean |
| 2 | A nested `REQUIRED` (`IMPL` under `SPEC`) is enforced, with the path in the message (`DECISION.SPEC`) | « a decision holds somewhere » is checked by the tool, and the check classifies `PROCESS` |
| 3 | A field declared only inside a `WHEN` block is L003 outside it, on any enum field, not only `STATUS` | conditional legality, the nearest thing to exclusivity |
| 4 | L016 resolves an anchor to the symbol (`path::literal`), in code and in the corpus's own schema file | an obligation is falsifiable at the symbol |
| 5 | `refs` prints the field name of every site (`REJECTED.REF`, `APPLIES_TO_TASK`) under a shared `CONVERSE` | one converse name for two fields, still distinguishable |
| 6 | `INCLUDE @FIELDSET.X` splices a set of fields into a type: nested fields, `REQUIRED`, `CATEGORY` and `CONVERSE` travel with it, `--skip`, `refs` and `new` read the spliced fields as the type's own | `REJECTED` and `UNTIL` declared once for `DECISION` and `PROCESS`: no second copy to keep aligned by hand, and a third ruling type would cost one line |
| 7 | A duplicate `SCHEMA` block is L005, never merged | no silent override |
| 8 | A `SHAPE` types a field, not only a `NAME`: `LOCATION url`, `ARCHIVED_ON date` are checked at the value by L007 | a string with a shape is a typed field: an address, a date, an identifier are refused when malformed, with no code to write |
| 9 | A wildcard prose field redeclared on one type with `REQUIRED` (`DESC` on `FACT`) is enforced there only (L006), and `new` prints it first | `DESC` optional everywhere, mandatory where it is the entity's substance |
| 10 | A `WHEN` on any enum field reads that field's `DEFAULT`, and a field declared only inside the block is L003 outside it (`BASIS attested\|hypothesis` on `FACT`) | an any-of requirement (`ATTESTED_BY` / `UNTIL`) costs one enum field, and the common case writes nothing |
| 11 | A declared type with zero entities lints clean and `status` prints it at 0 | a type can be declared ahead of its first entity |
| 12 | An anchor's `::literal` is a raw text search in the file (`package.json::core-mapping`), reported by L016 with the literal and the file | a package entity is tied to its manifest by name: a removed package and a renamed one are both lint errors, one line per package |
| 13 | A required reference field (`BLOCKS @TASK` on `OPEN_QUESTION`) turns a recording threshold into L006, and `context` on the target prints untyped incoming edges (`DESC.REF`) under `referenced by` | « a question is recorded only if a task waits on it » is checked by lint; a challenged decision sees its question without a typed field |
| 14 | A `WHEN` block can require a **nested** field (`IMPL` under `SPEC` once `STATUS implemented`) and a reference field (`DELIVERED_BY`) | « an acceptance criterion is proven at delivery » and « a delivered task names its pull request » are L006, not rules to remember |
| 15 | A nested `REQUIRED` under an optional wildcard prose field (`REF` under `SOURCE`) fires only when the parent is written, on every occurrence of it, and stays gated by `STATUS` | « a source is an entity » is L006 the day a provenance is written in prose alone, with no placeholder type to carry the case |
| 16 | `--where` on a repeatable reference field with a `STATUS` filter (`--where STATUS==todo --where AFTER==@TASK.X`), and `refs --json` carrying the source's `status` | the archive test of the cleanup pass is one command; stale edges onto an implemented task are listed by the same call |
| 17 | A non-repeatable reference field (`DELIVERED_BY`) is L010 on a second line | « one task is one pull request » is checked, the decision that said it is not carried over |
| 18 | A required reference field is L004 on an unknown target (`PROJECT @PROJECT.FOO`), so a name shape needs no list of projects | one list (the `PROJECT` entities), never two |
| 19 | `CATEGORY` on a prose field with nested `REF` (`SOURCE`) is followed by `--skip`: the sources and the entities they reach leave the package (16 → 4 lines) | provenance costs nothing on a `context` that does not ask for it |
| 20 | `DEFAULT` accepts a reference (`DEFAULT @PROJECT.X`), `new` prints it commented | available, not retained (see the defects) |
| 21 | `GATE suppressed` silences every diagnostic of the entity, L016 included: an archived task whose anchors are gone lints clean | an archived entity kept indefinitely costs no lint noise |
| 22 | `show --json` exposes the schema's `DEFAULT` atom, at type level and inside a `WHEN`; `refs --json` carries file, line, field path and the source's status per site; `status --json` carries `incoming` per entity | the whole cleanup pass is 80 lines over four JSON reads and `lint --strict`, no parser of its own |
| 23 | Every command but `show FILE` and the `file:line` of `status TYPE`, `refs` and `lint` is layout-blind: `status`, `context --with-schema`, `lint --closure` byte-identical across four layouts, `diff` reports nothing on an entity moved between files, the schema file's name is a convention | the file layout is a git and review choice, never a retrieval one: moving an entity costs the tool nothing, and a per-type split needs no domain judgement |
| 24 | Two `--where FIELD!=value` cumulate (`STATUS!=implemented --where STATUS!=archived`) | « draft or todo » is written without an OR |
| 25 | The manual settles `PROJECT`: an ordinary type, « one entity per corpus » being the starter's convention; three entities lint clean | the keyword question is closed |

## 5. What went wrong

Every defect was checked against a run on a throwaway corpus, 5 and 10 against the manual as well. The last column says what it costs a project that follows the method.

| # | Defect | What it costs |
|---|---|---|
| 1 | A slot cannot name several reference types (`@PULL_REQUEST\|@USAGE_REPORT` is L020); `reference` checks existence only | a provenance field is either untyped or split into one field per source type |
| 2 | `status` prints `(none)` for an entity that omits a `STATUS` with a `DEFAULT`, and `--where` cannot select on the default | « the active ones » is `STATUS!=archived`; a `DEFAULT` is read by gating but by no listing |
| 3 | A schema entry accepts no prose field beyond `DESC`, `RATIONALE`, `SPEC` (L023), and `DESC` is required on it (L022) | the wildcard cannot make `DESC` a schema-only field; entity `DESC` and schema `DESC` share one name |
| 4 | An entity name is an identifier: the hyphen is refused (`core-mapping` is L017), so a package cannot carry its manifest name | `package_name` writes `core_mapping` for `core-mapping`; the `::literal` of `MANIFEST` carries the mapping |
| 5 | `PROJECT` is listed as a schema keyword yet accepted as a type and field name | none, once the manual is read: « ordinary project-level configuration » |
| 6 | A `REQUIRED` string is satisfied by `""` (`REJECTED ""` passes `--strict`) | the requirement is a prompt in `new`, not a proof; a fictional line costs nothing to write |
| 7 | No mutual exclusion between fields: `WHEN` is monotonic (L021) and keys on a value, never on a field's presence | exclusivity is written as one slot with alternatives, a `WHEN`-only field under a discriminant, or two types |
| 8 | No « at least one of these fields » requirement: `REQUIRED` is per field, and nothing keys on a field's presence | « `ATTESTED_BY` or `UNTIL`, at least one » costs a discriminant `BASIS attested\|hypothesis` whose value the presence of `UNTIL` already says, one word per hypothesis |
| 9 | `--where` sees no nested field (`IMPL`, `ENFORCED_BY` under `SPEC`: exit 2 « not a field of DECISION ») | « the decisions enforced by a workflow » is `grep -n ENFORCED_BY`, not a listing |
| 10 | `context` expands outgoing edges only; what points at the root is a footer of names | a planning pivot whose edges are all incoming (`TASK`: blocked by, governed by, retired) reads as `refs` plus one `show` per entity, never as one package |
| 11 | `--where` compares text: `WAVE "4"` is refused by L007 on a `uint` field yet selected by `--where WAVE==4` | none once the corpus lints; a listing on a dirty corpus can include what lint refuses |
| 12 | `new` summarises a `WHEN` block by its top-level fields (« SPEC (required) ») and omits a nested requirement (`IMPL`) | the writer learns the nested requirement from L006, not from the skeleton |
| 13 | `NAME` is not a `--where` field | no listing by name prefix: `status TASK` + grep |
| 14 | A name cannot be built from a field, and no field from another: the tool addresses an entity by its name only | a pull request's name must repeat its project and number (`PCST62` beside `PROJECT`, `NUMBER`), and nothing checks that the three agree |
| 15 | `WHEN` on a reference field (`WHEN PROJECT @PROJECT.Ai`) is accepted by lint and inert: no requirement fires, `new` prints nothing | a per-project requirement cannot be written; the silence hides the error |
| 16 | A type declared `EXTERNAL` loses more than L004: `refs` on one of its names prints the sites then exits 1 « not defined », `show` refuses, no converse is computed, and its `NAME` shape is not checked on the references (`@PULL_REQUEST.Foo` passes) | a source type cannot be external without losing its hub role |
| 17 | `DEFAULT @PROJECT.X` on a reference field: the schema line itself counts as a reference site (`refs`: `@SCHEMA.PULL_REQUEST FIELD.DEFAULT`), and the defaulted edge is invisible to `refs`, `status` and `--where` | a default on a reference saves a line and loses the listing |
| 18 | `status` sorts names as text (`100` before `62`) | none with a project prefix; a numeric name would list out of order |
| 19 | `--where` does not know a field declared only inside a `WHEN` block until one entity of the type writes it: « `PURGE` is not a field of LIMITATION in this workspace », exit 2; a type-level field with no writer lists 0 | the cleanup pass cannot list « archived and `PURGE` not false » with `--where`; it reads `show --json` per archived entity |
| 20 | `new` prints one `WHEN STATUS archived` line per declaration when a type shadows a block of the wildcard | two lines for one condition; avoided by not shadowing |
| 21 | The `referenced by` footer of `context` (`BLOCKED_BY (root, 1): @OPEN_QUESTION.Ruled`) does not say the source is archived | a todo task reads as blocked by a question already ruled; `refs --json` (`from.status`) tells |
| 22 | `fmt` keeps the entity order as written: there is no canonical order, so a new entity has no deterministic position; two pull requests appending at the end of the same file conflict at rebase (`git merge-file`, one hunk), at different positions they merge clean | one conflict per pair of parallel pull requests adding to the same type, resolved by keeping both blocks; a sorted canonical order would spread the insertions for free |
| 23 | L006 names the missing field and its path, `suggestion` is `null` in `--json`; a reference to a type the schema does not declare is L004, the message of a typo | what to do when a `SOURCE` names no entity is read from the schema `DESC` (`show @SCHEMA.*`, `--with-schema`), not from the finding; « unknown source type » is not a diagnosis the tool makes |

## 6. Proposed remediations

Each proposal with what it would have changed on this work, and the defects of section 5 it closes.

| # | Proposal | What it would have changed | Defects |
|---|---|---|---|
| 1 | `fmt` writes entities in a canonical order (by name, or by a declared sort key) | the accepted rebase conflict of the per-type layout disappears: two pull requests adding to `decisions.awawa` merge clean | 22 |
| 2 | `--where` reads nested fields (`SPEC.IMPL`), fields declared only inside a `WHEN` block, and a `DEFAULT` value; `status` prints the default instead of `(none)` | « the active ones » becomes `STATUS==active`; the cleanup pass lists its candidates in one call instead of one `show --json` per archived entity; « enforced by a workflow » is a listing, not a `grep` | 2, 9, 19 |
| 3 | An any-of requirement (`REQUIRED ONE OF A, B`) or a `WHEN` keyed on a field's presence | `FACT` loses its `BASIS` discriminant; a limitation's `UNTIL` could require « a task or a condition » without a union slot | 7, 8 |
| 4 | `REQUIRED` refuses an empty string | `REJECTED ""` stops passing `--strict`; a fictional line costs at least a word | 6 |
| 5 | `new` prints nested requirements under their parent and inside `WHEN` summaries | the writer learns `IMPL` is required from the skeleton, not from L006 | 12 |
| 6 | The `referenced by` footer of `context` marks an archived source | a todo task blocked by a ruled question reads as such without `refs --json` | 21 |
| 7 | A `WHEN` on a reference field is either honoured or refused by lint | a per-project requirement can be written, or its impossibility is an error instead of silence | 15 |
| 8 | An `EXTERNAL` type keeps `refs`, `show` and its `NAME` shape on references | a source type could be external without losing its hub role | 16 |
| 9 | L006 on a nested `REF` carries the schema `DESC` of the parent as its suggestion | « no type fits: declare it in the same pull request » reaches the writer from the finding | 23 |
| 10 | A name shape may reference fields (`NAME {PROJECT}{NUMBER}`), or lint checks a declared consistency | `PCST62` beside `PROJECT PCST` and `NUMBER 62` is checked instead of accepted | 14 |

---

*Written on awawa 2.7.0. The figures come from the bootstrap method report of 2026-09-16 and from probes on throwaway corpora; the starter is offered in section 3.*
