> Notes:
> * This starter has not yet been tested in a real project.
> * It is a draft, and the principles and steps may change after experience.
> * P4 principle goes against the manual recommendation ("never deleted") on purpose (reason is explained in the
    dedicated section).

# Awawa Corpus Starter

**Purpose**: Take any project to a well-shaped awawa corpus, one session per step, whether a corpus already exists
(migration) or not (from scratch).

**Audience**: Primarily AI agents, secondarily humans. Every example is illustrative and every type name is a proposal,
never a requirement.

**How to use it**: A session runs one step, ends with the step's result, and proposes the prompt of the next step,
adapted to what it found. Written against `awawa 2.7.0`; the defects cited may be fixed in later versions.

---

## Entry Point: Four Questions Before Anything Else

### Question 1 — Does an awawa corpus already exist?

Ask the user, then prove the answer: `awawa status --json <project root>` reports `summary.files` above zero when
`.awawa` files exist anywhere under the root.

| Answer                                                                       | Flow                                          |
|------------------------------------------------------------------------------|-----------------------------------------------|
| Yes — `.awawa` files exist, with or without a schema                         | [Flow M — Migration](#flow-m-migration)       |
| No — nothing, or only prose (README, ADRs, agent instructions, wiki, issues) | [Flow S — From Scratch](#flow-s-from-scratch) |

Prose documentation is not a corpus: it is the source material Flow S imports. `.awawa` files with no schema are a
corpus: Flow M starts from `awawa infer`.

### Question 2 — What is the corpus about?

- A) A project methodology (how we work)
- B) A product specification (what we build)
- C) A game or system design (rules, mechanics, entities)
- D) A tool's configuration or behavior
- E) Other — described freely

The types, fields and edges depend on it. Examples: a methodology might capture decisions, processes and tasks; a
product
specification might capture features, requirements and data models; a game design might capture rules, facts and limits.
These are to be defined based on the user's insights and knowledge.

### Question 3 — What is the project's unit of change?

A pull request, a merge request, a reviewed commit, or none. The principles below say "the change that ends it": read
it as this unit. It also decides whether a change is a source type (Principle 6) worth declaring.

### Question 4 — Do you accept to record defects found in the tool (awawa) during probes?

If yes, the session records them in a separate file outside the project,
and the user may report them to the awawa maintainers. If no, the session ignores them and continues.

Record the four answers at the top of the first session's result; every later prompt carries them.

---

## Principles

Both flows apply the same ten principles, in a different order and with a different measure: from scratch, a principle
is designed and probed; in a migration, it is measured on the existing entities first. Each principle states **what to
do**, **why it matters** and **what the tool then checks** in place of a rule to remember.

### P1: Decide the Recording Threshold Before the First Schema Line

**What to do**: Write, per type, the condition under which an entity is recorded. For instance: a decision only if a
future change could reverse it by mistake; a question only if work is blocked on it; a limitation only if it affects
the project, not an external tool. Nothing about the awawa tool itself, nothing that is a general rule living
elsewhere.

**Why it matters**: Without a threshold, an agent records everything it rules on: entities outnumber the work they
serve, the user ends up asking for removals, and every read pays for entities nobody needed. A threshold kept as a
sentence in the instructions is forgotten.

**What the tool checks**: A threshold written as a `REQUIRED` field makes every entity that misses it an L006.
Example: `FIELD BLOCKS @TASK` with `REQUIRED` on a question type means "a question is recorded only if a task waits on
it".

### P2: Fix the Reading Loop Before Choosing the Edges

**What to do**: Decide which commands a session runs — `status` to orient, `context` with `--skip` to load a package,
`refs` then `show` for incoming edges — and orient every edge so that `context` on the entity a session starts from
reaches what it needs.

**Why it matters**: A corpus whose edges were chosen for the writer is read entity by entity — `show` after `show`, or
the files opened directly — instead of in one `context` package. Every session then pays one call per entity.

**What the tool checks**: `context` follows outgoing references and lists incoming ones in its footer, under the name
declared by `CONVERSE`. A `CATEGORY` on a field (e.g. `reasoning` on a rationale) lets a session leave it out with
`--skip`.

### P3: Build the Planning Pivot First

**What to do**: Identify the type that carries a lifecycle and dependencies — usually a task, a phase or an epic, with
an identifier as name. Every other type points at it or declares its dependence on it.

**Why it matters**: A corpus holding only its pivot already answers "what is left to do?". Every later type adds to
a corpus that is useful from its first session.

**What the tool checks**: With `FIELD STATUS todo|implemented|archived` on the pivot and an ordering edge (`AFTER
@TASK`), `status TASK` lists the plan and `context @TASK.X` shows what it rests on and, in its footer, what blocks it.
When the object has no lifecycle (a game design, a configuration), the pivot is the type most questions start from (e.g.
a rule), and P3 reduces to choosing it.

### P4: One Archive Mechanism, No History in the Corpus

**What to do**: Declare `FIELD STATUS active|archived` with `DEFAULT active` on `SCHEMA *`, and a `WHEN STATUS archived`
block carrying `GATE suppressed` and a `REQUIRED` `ARCHIVED_ON` date. A type with its own lifecycle redeclares `STATUS`
with `archived` among its values; the wildcard's `WHEN` block still applies to it. An entity that stops binding is
archived in the change that ends it; a ruling replaced on the same subject is rewritten in place. No `superseded`
status, no `SUPERSEDES`/`CLOSES` fields, no version suffixes (`:v2`).

**Why it matters**: History kept as entities grows with every change, and every `context` that reaches a dead entity
loads it. Version control already keeps the history; archiving costs two lines and keeps the corpus about what binds
today.

**What the tool checks**: `context` does not expand archived entities and names them in its footer; references to them
stay valid. `status TYPE --where STATUS!=archived` lists the live ones. `lint --strict` refuses an archived entity
without `ARCHIVED_ON`, and refuses `ARCHIVED_ON` on an active one (L003).

### P5: A Type Only for a Different Shape

**What to do**: Split a type only when its set of required fields differs. Two candidates with the same required fields
are one type, distinguished by a field (an enum, a reference, a `WHEN` block).

**Why it matters**: Every extra type costs a schema, a classification choice at every write, and a retype of its
entities and of every reference to them when the split proves wrong. Example: a ruling that names the code enforcing it
and one that cannot differ in shape (one requires an anchor, the other has none to require): two types. Two rulings
that differ only by topic are one type with a topic field.

**What the tool checks**: `awawa new TYPE Name` prints a different skeleton per type; `status TYPE` lists a family
without a discriminant; L006 on the distinguishing required field catches a misfiled entity.

### P6: Type the Sources From the First Schema

**What to do**: Declare source types — for instance a project, a change (the unit of Question 3), a document, a URL —
and, on
`SCHEMA *`, a `REPEATABLE` `FIELD SOURCE string` with a nested `FIELD REF reference` marked `REQUIRED`. Every
provenance is then an entity, not prose.

**Why it matters**: Provenance written as prose cannot be listed nor checked, and rots silently when a file moves or an
address changes; typing it later means rewriting every line.

**What the tool checks**: L006 on `SOURCE › REF` lists every source still in prose; L004 an unknown source entity; L007
a malformed address (with a `SHAPE`); `refs @DOCUMENT.X` lists what that source produced.

### P7: Type Everything That Can Be Typed

**What to do**: Free text is limited to what cannot be a reference, an enum, a shape or a number. A date, an address, a
version, an identifier is a `SHAPE`; a code location is an `anchor` field (`"path::literal"`); an entity name carries a
`NAME` shape. A field legal in one state only is declared inside that state's `WHEN` block.

**Why it matters**: The code moves under the corpus. Typed early, a removed file or a renamed symbol is a lint error
instead of a stale sentence; in a living corpus, L016 (an anchor that no longer resolves) is the check that fires most.

**What the tool checks**: L016 resolves an anchor and names the file and the literal separately; L007 refuses a value
missing its shape; L003 a field outside its `WHEN` block. A required string is a prompt, not a proof: on 2.7.0 an empty
string `""` passes `--strict`.

### P8: Schema in One File, One File Per Type, Append at the End, One Language

**What to do**: Every `SCHEMA`, `FIELDSET` and `SHAPE` in `_schema.awawa`; one data file per type, named by the type in
lower-case plural (`decisions.awawa`, `tasks.awawa`); if it makes sense to group types (example: source types), group
them in one same file (example: `sources.awawa`). A new entity is appended
at the end of its file. One language for the whole corpus, entity names included — by default the language the
technical vocabulary is in.

**Why it matters**: A layout by domain is a classification choice at every write, and entities end up misfiled. One
schema file gives a reviewer one place to read every declaration. Appending at the end keeps two parallel changes to the
same file to one hunk at rebase.

**What the tool checks**: Nothing — and that is the point: the tool reads no file name, so `status`, `context` and
`lint` give the same result under any layout, and `diff` is blind to an entity moved between files. The layout is a
convention for writers only.

### P9: A Cleanup Pass (Optional)

**What to do**: A script, run by hand, that archives implemented pivots nothing still waits on, archives entities whose
end condition is met, and deletes archived entities past a retention delay the project chooses. Its report is the body
of the change it opens.

**Why it matters**: Without it, P4's archive becomes a growing history. Optional for a small or rarely touched
corpus.

**What the tool checks**: The script reads `status --json` and `show --json`, then `fmt` and `lint --strict` confirm the
result. On 2.7.0 `--where` cannot select a field declared only inside a `WHEN` block: read `show --json` per entity.

### P10: Probe Every Schema Line Before Writing It in the Project

**What to do**: Before a schema line enters the project, write it in a throwaway corpus outside the project (a
temporary directory): the declaration, one entity, one reference. Run `awawa new`, `awawa lint --strict`, `awawa
status`. Note whether the tool enforced, refused or silently accepted what was expected.

**Why it matters**: A schema line that reads right can behave otherwise, and once entities depend on it, changing it
costs a migration. Examples on 2.7.0: an empty required string passing `--strict`, a `WHEN` block keyed on a reference
field doing nothing, a `DEFAULT` on a reference creating edges nobody wrote.

**What the tool checks**: Each probe documents it. A tool defect found can be reported to the awawa maintainers
(optional), never
recorded in the project's corpus.

P10 is not a step: it runs inside every step that writes a schema line.

---

## Flow S: From Scratch

No corpus exists. Each principle is designed, probed (P10), then written. Nothing can be measured until entities exist,
so the measures of P1 and P2 are taken on the first entities, in S7.

| Step | Principles | Result                                                   |
|------|------------|----------------------------------------------------------|
| S1   | —          | Inventory of the knowledge to capture and of its sources |
| S2   | P1, P5     | Types sketched, each with its threshold field            |
| S3   | P2         | Session questions, commands and edge directions          |
| S4   | P8         | Corpus directory and schema skeleton                     |
| S5   | P3, P4     | Pivot type and archive mechanism                         |
| S6   | P6, P7     | Source types, shapes, conditional fields                 |
| S7   | —          | First entities, measures of P1 and P2                    |
| S8   | P9         | Cleanup pass designed or skipped                         |

### S1: Inventory the Knowledge

```
S1 — Inventory. Answers to the entry questions: [corpus: none] [object: …] [unit of change: …]
[tool defects: recorded|ignored].
- List where the project's knowledge lives today: README, architecture decision records,
  agent instructions (AGENTS.md or equivalent), issue tracker, wiki, code comments, the user.
- For each place, list the kinds of fact it holds (a ruling, a task, an open question,
  a constraint, a glossary term…) with one real example quoted and its location.
- List the five questions a working session most often asks about the object
  (e.g. "what is left to do for X?", "why was Y chosen?", "what constrains Z?").
- Do not design any type yet.
Respond with the inventory table (place, kinds of fact, example) and the five questions,
then propose the S2 prompt.
```

### S2: Sketch the Types and Their Thresholds (P1, P5)

```
S2 — Types. Carry the entry answers and the S1 inventory.
- Group the kinds of fact from S1 into candidate types.
- For each type, write one sentence: "Record a [TYPE] only if [CONDITION]", and the
  REQUIRED field that enforces the condition (P1).
- List each type's REQUIRED fields; merge any two types whose REQUIRED sets are identical,
  with a discriminant field instead (P5).
- For each S1 example, name the type it would become, or "not recorded" and why.
Respond with the types, their thresholds and REQUIRED fields, the merges, and the S1
examples classified; then propose the S3 prompt.
```

### S3: Design the Reading Loop (P2)

```
S3 — Reading loop. Carry the S1 questions and the S2 types.
- For each S1 question, write the commands that answer it: status TYPE [--where FIELD==VALUE],
  context @TYPE.X [--skip CATEGORY], refs @TYPE.X.
- For each reference field, decide which entity carries it so that context on the entity
  the question starts from reaches the answer; the reverse direction is never written,
  it gets a CONVERSE name.
- Mark the fields a typical session does not need (reasoning, provenance) with a CATEGORY.
- Target: one context call per question, not one show per entity.
Respond with the question → commands table, the reference fields with direction and
CONVERSE name, and the categories; then propose the S4 prompt.
```

### S4: Create the Corpus Skeleton (P8, P10)

```
S4 — Skeleton. Carry the S2 types and the S3 edges.
- Choose the corpus directory with the user (e.g. docs/spec/ or spec/).
- Create _schema.awawa: SCHEMA * (DESC field, RATIONALE with CATEGORY reasoning), then one
  SCHEMA entry per S2 type with its DESC and REQUIRED fields, then the S3 reference fields
  with their CONVERSE names. Every DESC a short lower-case fragment.
- Create one empty data file per type, lower-case plural, and sources.awawa.
- Probe first (P10): copy the schema into a temporary directory outside the project, write
  one entity per type with one reference, run awawa new TYPE X, awawa lint --strict,
  awawa status. Fix the schema until the probe behaves as intended.
- Run awawa fmt and awawa lint --strict on the project corpus: zero findings.
Respond with the file list, the schema, and the probe findings; then propose the S5 prompt.
```

### S5: Add the Pivot and the Archive Mechanism (P3, P4, P10)

```
S5 — Pivot and archive. Carry the S4 schema.
- Name the pivot (the type with a lifecycle, or the type most questions start from).
  If it has a lifecycle: FIELD STATUS todo|implemented|archived with a DEFAULT, and an
  ordering reference field (e.g. AFTER @TASK) with its CONVERSE name.
- On SCHEMA *: FIELD STATUS active|archived, DEFAULT active; WHEN STATUS archived with
  GATE suppressed and FIELD ARCHIVED_ON date REQUIRED; a SHAPE date.
- If the pivot has an "implemented" state, decide what implemented requires (e.g. an
  anchor under a WHEN STATUS implemented block).
- Probe (P10): archive an entity without ARCHIVED_ON (expect an error), with it (expect
  clean), write ARCHIVED_ON on an active entity (expect L003).
Respond with the schema additions and the three probe results; then propose the S6 prompt.
```

### S6: Type the Sources and the Fields (P6, P7, P10)

```
S6 — Sources and shapes. Carry the S1 inventory of places.
- For each place of S1 that a fact can come from, propose a source type with its
  identifier shape (a document path, a URL, a change number…).
- On SCHEMA *: FIELD SOURCE string REPEATABLE, nested FIELD REF reference REQUIRED.
- For each remaining string field, ask whether it is a date, an address, a version, an
  identifier (SHAPE), a code location (anchor), or an enum (the type expression a|b).
- For each field legal in one state only, move it inside that state's WHEN block.
- Probe (P10): a SOURCE with no REF (expect L006), an anchor to a missing symbol (expect
  L016 naming file and literal), a value missing its shape (expect L007).
Respond with the source types, the shapes, the moved fields and the probe results; then
propose the S7 prompt.
```

### S7: Write the First Entities and Measure

```
S7 — First entities. Carry the S1 examples and the full schema.
- Write the S1 examples classified in S2 as entities, using awawa new TYPE Name for each
  skeleton; every provenance as a SOURCE with its REF to a source entity.
- Run awawa fmt, then awawa lint --strict: zero findings.
- Measure P1: count the entities written that the threshold should have refused. Target 0;
  otherwise tighten the REQUIRED field or drop the entity.
- Measure P2: answer each S1 question with the S3 commands; count the calls per question.
  More than one context call: revisit the edge direction.
- Add to the project's agent instructions the corpus path and the S3 reading loop, so the
  next session reads the corpus with the tool rather than as files.
Respond with the entity counts per type, the two measures, and the instruction lines added;
then propose the S8 prompt.
```

### S8: Decide the Cleanup Pass (P9)

```
S8 — Cleanup. Carry the corpus status.
- If the corpus will grow or change often: design the cleanup script in pseudocode —
  candidates to archive (implemented pivots nothing waits on, entities whose end condition
  is met), candidates to delete (archived past the retention delay chosen with the user),
  edits, awawa fmt, awawa lint --strict, a report as the body of the change.
- Otherwise: record that it is skipped and the corpus size at which to reconsider.
Respond with the design or the skip decision; the corpus is then checked against the
readiness criteria.
```

---

## Flow M: Migration

A corpus exists. Every principle is first **measured** on the existing entities, and the corpus is changed only where
the measure shows a gap. Each step is one change, reviewed on its own, and its entity-level effect is shown by
`awawa diff <snapshot before> <corpus after>`.

| Step | Principles | Result                                             |
|------|------------|----------------------------------------------------|
| M1   | —          | Baseline: snapshot, counts, findings, schema state |
| M2   | P1         | Entities to drop or retype; threshold fields       |
| M3   | P2         | Reading cost measured; edges reoriented            |
| M4   | P3         | Pivot identified or built                          |
| M5   | P4         | History converted to archive                       |
| M6   | P5         | Types merged or split by shape                     |
| M7   | P6, P7     | Sources and fields typed                           |
| M8   | P8         | Layout reorganized, tool output unchanged          |
| M9   | P9         | Cleanup pass designed or skipped                   |

### M1: Take the Baseline

```
M1 — Baseline. Answers to the entry questions: [corpus: path] [object: …] [unit of change: …]
[tool defects: recorded|ignored].
- Copy the corpus to a snapshot directory outside the project; every later step diffs
  against a snapshot.
- Run awawa status: entity counts by type and STATUS, reference health.
- Run awawa lint --strict --summary: findings by rule.
- If the corpus has no SCHEMA entry: run awawa infer, keep its output as the draft schema
  in _schema.awawa, and re-run lint.
- List the types, their REQUIRED fields (awawa show TYPE), the files and which types each
  file holds, and any history mechanism in use (a superseded status, supersession fields,
  version suffixes).
Respond with the baseline tables; then propose the M2 prompt.
```

### M2: Measure the Recording Threshold (P1)

```
M2 — Threshold. Carry the M1 baseline.
- For each type, write "Record a [TYPE] only if [CONDITION]" and the REQUIRED field that
  would enforce it.
- Read every entity of the type with the tool (status TYPE, then show) and classify it:
  meets the threshold / should be another type / should not have been recorded
  (about the awawa tool, a general rule living elsewhere, a narrative).
- Measure: the count per class. Ask the user to confirm the drop list before deleting.
- Probe (P10) the threshold fields, then add them; entities missing them are fixed or
  dropped in the same change.
Respond with the thresholds, the counts, the confirmed drop and retype lists, and the
lint result; then propose the M3 prompt.
```

### M3: Measure the Reading Loop (P2)

```
M3 — Reading loop. Carry the M1 types.
- Collect the five questions sessions most often ask about the object (from the agent
  instructions, recent change descriptions, or the user).
- Answer each with the tool, and count the calls: status, context, refs, show.
- For each question needing more than one context call: find the reference field whose
  direction forces the extra calls; propose its reversal and a CONVERSE name.
- List reference fields written on both ends (e.g. BLOCKS and BLOCKED_BY): the reverse one
  is removed, the tool derives it.
- Probe (P10) the reversed fields, then migrate the references in one change; re-count.
Respond with the calls per question before and after, and the fields reoriented; then
propose the M4 prompt.
```

### M4: Identify the Pivot (P3)

```
M4 — Pivot. Carry the M1 and M3 results.
- Name the type with a lifecycle and dependencies, or the type most M3 questions start
  from. If none exists and the object has work to plan, sketch one.
- Check: can status PIVOT answer "what is left to do?" and context @PIVOT.X show what
  blocks it? If not, name the missing field or edge.
- Probe (P10), then add the missing fields; migrate existing entities in the same change.
Respond with the pivot, the gaps found and the fields added; then propose the M5 prompt.
```

### M5: Convert History to Archive (P4)

```
M5 — Archive. Carry the M1 list of history mechanisms.
- Probe (P10) the P4 mechanism on a throwaway corpus.
- Add it to SCHEMA *; lifecycle types redeclare STATUS with archived among their values.
- Convert: a superseded entity with a successor on the same subject is deleted (version
  control keeps it) and the successor takes its name with awawa fmt --rename, so references
  land on the ruling in force; a superseded entity with no successor becomes archived with
  ARCHIVED_ON (the date of the change that ended it, from version control); supersession
  fields are removed.
- Measure: entities with a history status or field before and after (target 0 after),
  and the context package size of the pivot before and after.
Respond with the conversion counts, the size measure and the lint result; then propose
the M6 prompt.
```

### M6: Merge and Split Types by Shape (P5)

```
M6 — Types by shape. Carry the M2 retype list.
- List each type's REQUIRED fields. Types with identical sets: merge, with a discriminant.
  One type holding entities with different REQUIRED needs: split.
- Retyping changes every reference to the entity: list them with awawa refs before editing.
- Probe (P10) the merged or split schema, then migrate entities and references in one change.
Respond with the merges and splits, the entities and references rewritten, and the diff
summary; then propose the M7 prompt.
```

### M7: Type the Sources and the Fields (P6, P7)

```
M7 — Sources and fields. Carry the corpus as it stands.
- Find provenance written in prose (paths, links, change numbers, "decided in …") with
  status, show and grep on the corpus: count it per kind.
- Declare the source types and the SOURCE › REF field; create the source entities; attach
  a REF to every SOURCE.
- For each string field holding dates, addresses, identifiers or code locations: declare
  the SHAPE or anchor and fix the values the lint then refuses (L007, L016).
- Probe (P10) each declaration first.
Respond with the counts of prose provenance before and after, the shapes added, and the
L007/L016 fixed; then propose the M8 prompt.
```

### M8: Reorganize the Layout (P8)

```
M8 — Layout. Carry the M1 file list.
- Move the schema to _schema.awawa and each type's entities to its own file; order inside
  a file is kept.
- Proof of no semantic change: awawa diff <snapshot taken just before> <corpus> reports no
  entity change, and awawa status is identical before and after.
- Update every place that cited a corpus file path (agent instructions, scripts, CI).
Respond with the new layout, the diff and status evidence, and the paths updated; then
propose the M9 prompt.
```

### M9: Decide the Cleanup Pass (P9)

Same prompt as [S8](#s8-decide-the-cleanup-pass-p9), on the migrated corpus.

---

## Validation After Each Step

1. **Lint clean**: `awawa fmt --check` and `awawa lint --strict` on the corpus, zero findings.
2. **Probed**: every schema line added in the step has its probe result in the step's response.
3. **Threshold held**: no entity written in the step would be refused by its type's threshold.
4. **Nothing about the tool**: no entity about awawa itself; tool defects stay outside the project (Question 4).
5. **Schema changes are traced**: a schema line changed outside the step that owns it is a new step, not a silent edit.
6. **Migration only**: `awawa diff` against the step's snapshot accounts for every entity change.

---

## Readiness Criteria

- [ ] `awawa lint --strict` passes with zero findings.
- [ ] `awawa status` shows every type with entities, or its emptiness is intended.
- [ ] `awawa context @PIVOT.X` on a live pivot returns the entity, what it rests on, and in its footer what points at
  it.
- [ ] `awawa refs @SOURCE_TYPE.X` on a source entity lists what cites it.
- [ ] Each of the session questions (S1 or M3) is answered in one `context` call or one `status` call.
- [ ] No entity would be refused by its type's threshold.
- [ ] Migration only: no history status, supersession field or version suffix remains.
- [ ] The project's agent instructions name the corpus path and the reading loop.
- [ ] The cleanup pass is designed or consciously skipped.
- [ ] Probe directories are deleted; nothing of them entered the project.

---

## Out of Scope

- **Tool defects and proposals**: noted during probes if the user accepted it (Question 4), kept outside the project for
  the awawa maintainers, never recorded in the corpus.
- **Out-of-corpus levers**: session instructions beyond the reading loop, response length, prompt design — the
  project's agent instructions and skills govern them.
- **Several corpora**: a second corpus (e.g. a product specification beside a methodology) runs its own flow; each
  corpus is independent.

**Expected length**: Flow S, 8–12 sessions; Flow M, 9–14 sessions — one or two per step, depending on the size of the
object and the depth of the probes.
