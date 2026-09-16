# Awawa Corpus Bootstrap — Starter Guide

**Purpose**: A generic methodology to migrate any project from no corpus to a well-shaped awawa corpus, by iterative
session design.

**Audience**: Primarily AI agents (e.g., Claude), secondarily humans. Each iteration proposes a prompt for the next
session.

**Foundation**: Derived from the bootstrap method in
`../awawa-usage-reports/migration/2026_09_16-second-project-methodology-migration/2026-09-16-corpus-bootstrap-method.md`,
tested on a project-methodology corpus. Adapts the ten steps to any specification domain.

---

## Entry Point: Understanding Your Specification Object

Before beginning, clarify what you intend to specify. awawa can model any entity domain:

**Choose your object:**

- A) A project methodology (how we work)
- B) A product specification (what we build)
- C) A game or system design (rules, mechanics, entities)
- D) A tool's configuration or behavior
- E) Other — describe it freely

**Why this matters**: The types, fields, and archive mechanisms you design depend on what you're specifying. A
methodology corpus captures decisions, processes, and tasks. A product spec may capture features, requirements, and data
models. A game spec captures rules, facts, and limits.

Once you answer, the bootstrap method below guides you through building a corpus fit for your domain.

---

## The Ten-Step Bootstrap Method

Each step names **what to do**, **why it matters** (the measure justifying it), and **what the tool then checks** in
place of a rule to remember. The order is order of dependence: a later step assumes earlier ones complete.

### Step 1: Decide the Recording Threshold Before the First Schema Line

**What to do**: Define what deserves to be recorded in each entity type. Record a decision only if a future pull request
could reverse it by mistake; a question only if work is blocked on it; a limitation only if it affects the project (not
external tools). Nothing about the tool itself, nothing that is a general rule living elsewhere.

**Why it matters**: Period A of the bootstrap project created 13 decisions and 11 questions for 10 tasks —
over-recording. The user said "the AI got carried away" and "too many decisions I wouldn't have recorded." Setting
thresholds as required schema fields lets the tool enforce them (L006 on violations).

**What the tool checks**: Once a threshold is a `REQUIRED` field on a type, every entity that violates it is an L006
error. Example: `BLOCKS @TASK REQUIRED` on `OPEN_QUESTION` means "a question is recorded only if a task waits on it."

**Next session prompt** (iterate Step 1):

```
Step 1 iteration: Sketch the entity types and the recording threshold for each.
- For each type you identified (e.g., DECISION, QUESTION, TASK), write one sentence:
  "Record a [TYPE] only if [CONDITION]."
- Propose one REQUIRED field per type that will enforce this threshold via lint.
- Measure: count entities in your existing corpus (if any) that would be dropped or retyped
  if this threshold were enforced. Report the count.
- Question: are these counts acceptable, or should the threshold change?
Respond with the three thresholds, their REQUIRED fields, and the count measure.
```

---

### Step 2: Fix the Reading Loop Before Choosing the Edges

**What to do**: Decide which awawa commands a session runs (`status` to orient, `context` with `--skip` to load a
package, `refs` then `show` for incoming edges), and what each one costs. Then choose the direction of every edge so
that `context` finds what a session needs.

**Why it matters**: Period A used `show` and `cat` 249 times vs. `context` 19 times. The corpus was written to support
entity-by-entity reads, not traversal. This wastes quota and makes the corpus hard to navigate.

**What the tool checks**: Once edges are declared with `CONVERSE` names and `CATEGORY` on outgoing fields, `context`
follows them automatically. `--skip` on optional fields (e.g., `CATEGORY reasoning` on `REJECTED`) lets sessions ask for
lightweight reads.

**Next session prompt** (iterate Step 2):

```
Step 2 iteration: Map the reading workflow.
- Choose the most common session question about your object. Example: "What rules govern
  package X?" or "What tasks are left for feature Y?"
- Trace the awawa commands and entities you'd read to answer it:
  - status to list (e.g., status DECISION --where APPLIES_TO @PACKAGE.X)
  - context on an entity to see its neighborhood
  - refs on an entity to see what points at it
- For each edge (reference field), decide: is it outgoing from the root (expanded by context)
  or incoming (listed in context's footer)? Outgoing edges should form a coherent read.
- Propose: one CONVERSE name per reference field. Should the field be CATEGORY provenance
  (skippable by sessions that don't need it)?
Respond with the session workflow and the edge directions with CONVERSE names.
```

---

### Step 3: Write the Planning Pivot First

**What to do**: Identify the type that carries a lifecycle (e.g., `TASK` with `todo|implemented|archived`). Its name is
its identifier (often Conventional Commits type + number: `FIX45`). Every other type points at it or declares its
dependence on it. Start there: a corpus with tasks and nothing else already plans.

**Why it matters**: Tasks are the only entity type with a lifecycle and dependencies. Building them first gives the
corpus immediate utility: it can answer "what is left to do?"

**What the tool checks**: Once `TASK` has `STATUS todo|implemented|archived` and edges like `BLOCKED_BY @OPEN_QUESTION`
(incoming) and `AFTER @TASK` (task ordering), `status TASK` lists the plan and `context @TASK.X` shows what blocks it.

**Next session prompt** (iterate Step 3):

```
Step 3 iteration: Build the planning pivot.
- If you identified a type with a lifecycle (e.g., TASK, PROJECT_PHASE, EPIC), write its schema:
  - REQUIRED fields: name identifier, title, status (enum: todo|implemented|archived).
  - For status: inside WHEN STATUS archived GATE suppressed, require ARCHIVED_ON date.
  - Incoming edges (from other types): BLOCKS, GOVERNED_BY, RESTS_ON (reverse references).
  - Outgoing edges: AFTER (order between pivots), APPLIES_TO (what rules bind this pivot).
- If no lifecycle exists, skip this step; the pivot is still the root (e.g., for a game spec,
  it might be an entity type like RULE).
- Probe: in a throwaway corpus in scratchpad, write one pivot entity and one entity that
  references it. Run: awawa status, context, refs. Report any lint errors.
Respond with the pivot schema, one test entity, and any lint findings.
```

---

### Step 4: One Archive Mechanism, No History in the Corpus

**What to do**: Declare `STATUS active|archived` once on the wildcard (`SCHEMA *`), with `DEFAULT active`. Gate the
`WHEN STATUS archived` block to require `ARCHIVED_ON`. An entity that stops binding is archived in the pull request that
ends it; a ruling replaced on the same subject is rewritten in place. No `superseded`, no `SUPERSEDES`/`CLOSES` fields,
no version suffixes (`:v2`).

**Why it matters**: Period A wrote 47 `superseded`, 26 `SUPERSEDES`, 34 `CLOSES`, and 44 `:v2` version suffixes. Dead
entities (40 closed, 6 superseded) were loaded by every `context`. Archiving costs two lines; history keeps the corpus
noisy and hard to read.

**What the tool checks**: `context` does not expand archived entities, names them in its footer, and all references stay
valid. `status --where STATUS!=archived` lists the active ones. `lint --strict` refuses an archived entity without
`ARCHIVED_ON`.

**Next session prompt** (iterate Step 4):

```
Step 4 iteration: Implement the archive mechanism.
- Add to SCHEMA * (wildcard):
  - FIELD STATUS active|archived, DEFAULT active
  - Inside WHEN STATUS archived GATE suppressed: require ARCHIVED_ON (date shape)
  - Inside WHEN STATUS archived GATE suppressed: PURGE true|false DEFAULT true
  - Interpretation (in DESC): « An entity that stops binding is archived, not deleted.
    Archived entities pass lint even if REQUIRED fields are missing (L003 outside the
    WHEN block). Delete only: (a) an entity that should never have been recorded,
    (b) an archived entity past the retention delay. »
- Probe: create a throwaway entity, archive it (write STATUS archived, ARCHIVED_ON),
  run lint --strict. Confirm no L006 on REQUIRED fields.
- Then: rewrite one entity from your existing corpus in place (change the ruling, keep
  the name), add REJECTED if the lesson matters, run lint.
Respond with the archive mechanism added to SCHEMA *, one probe result, and one in-place
rewrite example.
```

---

### Step 5: A Type Only for a Different Shape

**What to do**: Split a type only when the set of required fields differs. If two potential types have identical
required fields, they are the same type, distinguished by a field (an enum, a reference, or a nested discriminant).

**Why it matters**: The first corpus skeleton proposed six ruling types. Five cost five schemas, five classification
choices at write time, and retyping 137 entities everywhere they are cited. The criterion that held: only shape
differences justify splitting. Test: a `DECISION` whose `SPEC › IMPL` has no anchor is a different shape (no `IMPL` to
require) → it is a `PROCESS`, not a `DECISION` with `KIND==process`.

**What the tool checks**: `awawa new DECISION` and `awawa new PROCESS` have different required-field prompts.
`status PROCESS` lists the family without a `KIND` field. L006 on `DECISION.SPEC.IMPL` classifies misfiled entities.

**Next session prompt** (iterate Step 5):

```
Step 5 iteration: Refine the types by shape.
- For each type you sketched, list the REQUIRED fields (from Steps 1–4).
- Compare: which types have identical REQUIRED fields? Merge them with a discriminant field
  (an enum or a nested `WHEN` block).
- Which types differ only in optional fields? Same: merge, use an optional field or a WHEN.
- Remaining splits: each type must have a different set of REQUIRED fields.
- Reclassify any entities: if a [TYPE-A] entity has no field that [TYPE-B] requires,
  retype it or drop it.
Respond with the merged and split types, the shape differences, and retyping impact.
```

---

### Step 6: Type the Sources From the First Schema

**What to do**: Declare source types (`PROJECT`, `PULL_REQUEST`, `USAGE_REPORT`, `URL`) on day one. Declare
`SOURCE string` with a nested `REF reference` that is `REQUIRED`. This enforces that every source is an entity, not
prose.

**Why it matters**: Period A had 227 `SOURCE` lines, 0 typed references, and 19 dead paths (rotted because a file was
moved). A required nested `REF` means: if a SOURCE mentions a pull request by number, there must be a `@PULL_REQUEST.X`
entity for it. L006 fires on missing entities, forcing them to be declared in the same pull request.

**What the tool checks**: L006 on `SOURCE › REF` lists every source still in prose with no entity. L004 on an unknown
project. L007 on a malformed URL shape. `refs @PULL_REQUEST.PCST62` lists what each pull request produced.

**Next session prompt** (iterate Step 6):

```
Step 6 iteration: Type the sources.
- Scan your corpus (or requirements) for external references: other repositories, pull
  requests, documents, URLs, decisions from elsewhere.
- For each kind, propose a source type (PROJECT, PULL_REQUEST, DOCUMENT, WIKI, EMAIL, etc.)
  with one REQUIRED field: the identifier (name, URL, email address).
- Add SOURCE as a wildcard field (can repeat): SOURCE string (the prose), nested under it
  REF reference (REQUIRED) pointing to one of the source types.
- Probe: write one entity with a SOURCE line mentioning a pull request; create a @PULL_REQUEST
  entity it cites; run awawa lint --strict. Confirm no L006 on REF.
- Measure: count external references in your corpus today. How many source entities will
  you need to create?
Respond with the source types, SOURCE schema line, one probe, and the entity count.
```

---

### Step 7: Type Everything That Can Be Typed

**What to do**: Free text is limited to what cannot be a reference, an enum, a shape, or a number. A date, an address, a
repository, an identifier, a code location (file path with symbol) is a `SHAPE`. An entity name is `REQUIRED` with its
shape. A field legal in one state only is declared inside that state's `WHEN` block.

**Why it matters**: Period A had 52 L016 lint errors (52 of 93 total findings) — most were untyped anchors. Typing
fields early catches misconfigurations: a removed package, a wrong file path, a renamed symbol.

**What the tool checks**: L016 resolves an anchor to the symbol and reports the literal separately. A required string is
a prompt, not proof (L006 refuses an empty string in newer versions, but `REQUIRED` does not yet). A field declared only
in a `WHEN` block is L003 outside it.

**Next session prompt** (iterate Step 7):

```
Step 7 iteration: Introduce shapes and conditional fields.
- For each free-text field, ask: could this be typed?
  - A date → SHAPE date
  - A URL → SHAPE url
  - A file path with a symbol → anchor (SHAPE with path::literal syntax, e.g.,
    src/merge.ts::mergeSaves)
  - A code identifier → SHAPE pascal or camelCase or snake_case
  - An enum of alternatives → SHAPE enum1|enum2
- For each conditional requirement (« this field is required only if STATUS==implemented »),
  declare it inside WHEN STATUS implemented GATE error.
- Probe: write one entity with an anchor field to non-existent code, run awawa lint.
  Confirm L016 names the file and the symbol separately.
Respond with the typed fields, the SHAPE declarations, and one L016 probe.
```

---

### Step 8: One File Per Type, Schema in One File, Append at the End, English

**What to do**: Keep every schema declaration in `_schema.awawa`. One file per type (named by type, lower case plural:
`decisions.awawa`, `tasks.awawa`). Source types grouped in `sources.awawa`. A new entity appended at the end of its
file. Write the corpus in the language technical vocabulary is in (default: English).

**Why it matters**: A per-domain layout was a classification choice at write time. The awawa tool reads no file name;
`status`, `context`, `lint`, and `diff` are byte-identical across layouts. Putting schema in one file lets
`context --with-schema` show the types. Appending at the end means two parallel pull requests appending to the same file
conflict minimally (one hunk at rebase, clean at different positions).

**What the tool checks**: `fmt` keeps the order as written (there is no canonical order yet). `diff` is blind to an
entity moved between files. `lint --closure` is layout-blind.

**Next session prompt** (iterate Step 8):

```
Step 8 iteration: Set up the corpus files.
- Create the directory: awawa-[domain-name]/ (alongside awawa-project-methodology/, for example).
- Create _schema.awawa: all SCHEMA entries in order (wildcard first, then types in
  inheritance order if any).
- Create one .awawa file per type: [type_name]_plural.awawa (e.g., decisions.awawa,
  open_questions.awawa).
- Create sources.awawa for source types.
- Rule: every new entity is appended at the end of its file.
- Language: decide English or another language. Stick to it everywhere (entity names too).
Respond with the file structure created (listing the files and their initial content —
schema only, no entities yet).
```

---

### Step 9: Ship the Cleanup Script With the First Pull Request (Optional)

**What to do**: Write a cleanup script that archives implemented tasks with no todo task depending on them, archives
entities whose `UNTIL` condition is met, and purges archived entities past the retention delay. Run by hand, no
schedule. Open a pull request with the report as its body.

**Why it matters**: Without it, the archive mechanism of Step 4 becomes the history it replaces: dead entities
accumulate. The script is optional if your corpus is small or rarely touched, but it is the only way to keep a growing
corpus clean and queryable.

**What the tool checks**: The script reads `status --json` and `show --json` to list candidates, runs `fmt` and
`lint --strict` to confirm each change is valid, and reports what was archived or purged.

**Next session prompt** (iterate Step 9):

```
Step 9 iteration: Optionally, design a cleanup pass.
- If your corpus is expected to grow or change frequently, sketch the cleanup script:
  1. List archived entities past 30 days (or your chosen delay) where PURGE!=false.
  2. List active entities whose UNTIL condition is met (e.g., @TASK.X is implemented).
  3. For each candidate, run awawa fmt --rename to archive it (add STATUS archived,
     ARCHIVED_ON today, or delete it).
  4. Run awawa lint --strict to confirm no errors.
  5. Open a pull request with the report (archived count, purged count, any errors).
- If your corpus is stable, skip this step.
Respond with the cleanup script design (pseudocode, not code yet), or confirm you are
skipping it.
```

---

### Step 10: Probe Every Schema Line on a Throwaway Corpus Before Writing It in the Project

**What to do**: Before committing a schema line, test it in a scratchpad directory (e.g., `scratchpad/p42/`) with a
minimal throwaway corpus. Write one entity, one reference, run `awawa lint --strict`, and confirm the result. If lint
refuses it, note the defect; if it accepts it silently when you expected an error, note the strength.

**Why it matters**: The bootstrap project probed 45 throwaway corpora and found 23 tool defects and 25 strengths.
Testing surfaces edge cases: a required string passing `--strict` despite being empty, a WHEN block on a reference field
doing nothing, a `DEFAULT` on a reference creating invisible edges.

**What the tool checks**: L006 on missing REQUIRED fields, L003 on fields outside their WHEN block, L016 on malformed
anchors, L007 on shape mismatches, L004 on unknown references. Each probe documents what the tool does.

**Next session prompt** (iterate Step 10):

```
Step 10 iteration: Probe the schema.
- For each schema line you declared in steps 1–8, write one probe in scratchpad/p[N]/:
  - Create a minimal corpus: _schema.awawa with just that type, a sample entity, and
    any referenced types.
  - Run: awawa new, awawa lint --strict, awawa status.
  - Document: what the tool accepted, what it refused, any surprises.
  - If it refused something you wanted, note it as a defect (for the usage report).
  - If it accepted something suspicious, probe deeper (e.g., empty REJECTED string).
- Collect: one probe result per major schema decision.
Respond with the probe directory (scratchpad/p[N]) and a summary of findings.
```

---

## Validation After Each Iteration

After each iteration (each time a session completes a step), validate:

1. **Lint clean**: Run `awawa lint --strict` on your corpus. No L0xx errors.
2. **Recording threshold enforced**: Any entity that violates Step 1's threshold is an L006.
3. **No system artifacts**: No entity about the awawa tool, no general rules that belong elsewhere.
4. **Sources typed**: Every `SOURCE › REF` field is populated or is L006.
5. **Schema stable**: No schema line was changed since the last iteration. Changes trigger a new iteration, not a silent
   update.

---

## Final Validation: Readiness Criteria

Once all ten steps are complete, validate the corpus as ready:

- [ ] `awawa lint --strict` passes with zero findings.
- [ ] `awawa status` on each type shows a non-zero count (or zero is intentional for placeholder types).
- [ ] `awawa context @[PIVOT-NAME].[ID]` (on your root entity type) returns a coherent read: the entity and its
  dependents or upstream constraints.
- [ ] `awawa refs @[SOURCE-TYPE].[ID]` on each source entity lists its incoming edges (the entities that cite it).
- [ ] Recording threshold of Step 1 is measured: count of entities that would violate it today = 0.
- [ ] Optional: cleanup script designed (Step 9) or consciously skipped.
- [ ] Optional: all probe directories (Step 10) archived or deleted, leaving the corpus clean.

---

## Optional: Probes (Throwaway Corpora)

Probes are optional. They cost 20–30 minutes per major schema decision and catch tool edge cases early. Use them if:

- Your schema has unusual requirements (nested REQUIRED fields, conditional WHEN blocks, multiple CONVERSE names on
  shared fields).
- You want confidence that the tool behaves as expected before the first production entity is written.

If you skip probes, rely on `lint --strict` during Step 8 and document any surprises in the usage report (Step 10).

---

## Scope: This Guide Does Not Cover

- **Tool defects and proposals**: Note them during Step 10; report them to the awawa team after the corpus launches (in
  a usage report, not in the corpus itself).
- **Out-of-corpus levers**: Session instructions, file reading patterns, response length, prompt design. These are
  handled by your project's `.claude/CLAUDE.md` and skills, not by the corpus schema.
- **Second migration**: Once this corpus is stable, you may migrate to a second corpus (a product spec, for example)
  using the same ten steps. Each corpus is independent.

---

## Next: Apply the Bootstrap

To begin:

1. **Choose your object** (entry point, above).
2. **Start with Step 1**: Frame the recording threshold for each entity type.
3. **Each session completes one step** and proposes a prompt for the next session.
4. **After Step 8**, your schema is ready. Steps 9–10 are refinement.
5. **After Step 10**, your corpus is production-ready.

**Expected timeline**: 8–14 sessions (1–2 per step, depending on domain complexity and probe depth).

**Tool**: awawa 2.7.0 or later.
