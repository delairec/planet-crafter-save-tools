> Notes:
> * Version 2. Version 1 was walked once, end to end: Flow S, on a project with an existing implementation, the new
    corpus joining a workspace that already held one, by one agent at one effort level. This version carries what
    that walk found. Flow M, and every branch marked `[implementation: none]`, have not been walked yet.
> * It relies on no document but itself and what ships with awawa: `awawa --help` (the session loop and the rules
    that do not change) and, where installed, the awawa manual, its agent protocol and its schema-authoring guide.
    No project document is assumed, so it applies to any project, existing or empty.
> * Principle P4 goes against the tool's own recommendation (« mark a replaced entity … rather than deleting it »)
    on purpose; the reason is in its section.
> * Step and principle identifiers are stable across versions: a new step takes the next free number, so the walk
    order is the order of the flow tables, not the order of the numbers.

# Awawa Corpus Starter

**Purpose**: Take any project to a well-shaped awawa corpus, one session per step — whether a corpus already exists
(migration) or not (from scratch), and whether an implementation already exists or not.

**Audience**: Primarily AI agents, secondarily humans. Every example is illustrative and every type name is a
proposal, never a requirement.

**How to use it**: Answer the entry questions once. A session then runs one step, under the
[walk protocol](#walk-protocol): it reads the work file, does the step, records its result in the work file, and ends
only on the user's confirmation. Written against `awawa 2.7.0`; the tool behaviours cited are
[listed at the end](#tool-behaviours-worth-knowing-270) and may change in later versions — re-probe them.

---

## Entry Point: Five Questions Before Anything Else

### Question 1 — Where does the walk start from?

Three facts, each proven rather than assumed.

| Fact                                                        | Proof                                                                                                                       | Entry answer                                |
|-------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------|---------------------------------------------|
| Do `.awawa` files exist under the project root?             | `awawa status --json <project root>` reports `summary.files` above zero                                                     | —                                           |
| If so, does that corpus already hold the object of Question 2? | `awawa status <project root>`: the types listed, read with the user                                                      | `[corpus: none \| joins <root> \| exists <path>]` |
| Does an implementation exist — files an anchor can name?    | Ask the user; list the source directories                                                                                   | `[implementation: exists \| none]`          |

| Corpus                                                                           | Flow                                          |
|----------------------------------------------------------------------------------|-----------------------------------------------|
| `none` — nothing, or only prose (README, ADRs, agent instructions, wiki, issues) | [Flow S — From Scratch](#flow-s-from-scratch) |
| `joins` — a corpus exists and this object is new to it                           | Flow S, every step taking its `[joins]` branch |
| `exists` — the corpus already holds this object, with or without a schema        | [Flow M — Migration](#flow-m-migration)       |

Prose documentation is not a corpus: it is the source material Flow S imports. `.awawa` files with no schema are a
corpus: Flow M starts from `awawa infer`.

**The workspace is the unit of resolution, not the directory.** Every `.awawa` file under the root the tool is given
forms one workspace: one `SCHEMA *`, one namespace of field and `CONVERSE` names, and references valid across
directories. A second object in the same project is therefore a second *area* of the same workspace — a directory of
data files under a shared schema — never a second independent corpus with its own `SCHEMA *`. Two corpora are
independent only when no command is ever given a root that contains both.

`[implementation: none]` changes what can be anchored, not the flow: an anchor names a file, so nothing unbuilt
resolves one. Flow S then makes every anchor `REQUIRED` only at the rung of the `STATUS` ladder where the code
exists (P3), and takes its first entities from the user's statements instead of from documents.

### Question 2 — What is the corpus about?

- A) A project methodology (how we work)
- B) A product specification (what we build)
- C) A game or system design (rules, mechanics, entities)
- D) A tool's configuration or behavior
- E) Other — described freely

The types, fields and edges depend on it. Examples: a methodology might capture decisions, processes and tasks; a
product specification might capture features, requirements and data models; a game design might capture rules, facts
and limits. These are to be defined from the user's insights and knowledge.

### Question 3 — What is the project's unit of change?

A pull request, a merge request, a reviewed commit, or none. The principles below say « the change that ends it »:
read it as this unit. It also decides whether a change is a source type (P6) worth declaring.

### Question 4 — Where does the work file of the walk live?

One file, named now, that every step reads first and writes last (W1). It sits outside the corpus directory — the
corpus never holds the walk (W6) — and in a place the next session can read: inside the project, tracked or not, as
the user prefers.

### Question 5 — Do you accept to record defects found in the tool, and in this starter, during the walk?

Asked last, and the default is **no**: an unanswered question, or an ambiguous answer, is a no, and the session
ignores the defects it meets and continues. If yes, name the file: it lives outside the corpus, and the user may send
it to the awawa maintainers. Every step then appends to it before closing (W7).

Record the answers at the top of the work file. Every step prompt carries the path of the work file, not a copy of
the answers.

---

## Walk Protocol

A step is more than its body. These nine rules apply to every step of both flows; the
[prompt frame](#w8-the-prompt-frame) restates them in each prompt, because an obligation stated once at the entry
point is forgotten by the third session.

### W1: One Work File Carries the Walk

Every step writes its result to the work file, under a heading of its own: the result, the rulings taken with the
user, the probe table, the files touched, the sources read, the cost. The next session reads that file instead of
re-deriving the previous step from the project. A result that exists only in a conversation is lost with it.

### W2: A Step Opens by Reading, Never by Declaring

- The prompt opens with the step's rank — « S5, step 5 of 10 » — and the step reads the closed steps from the work
  file. The user states only what diverges; nothing closed is reopened without saying so.
- Before declaring a mechanism, the step reads what the workspace already declares for it — `awawa status`,
  `awawa show TYPE`, `awawa show '@SCHEMA.*'` — and writes only the difference. Under `[joins]` the difference is
  often nothing: the step is then a probe of the existing mechanism on the new types, and says so.
- The step reads the sources-read ledger (W5) and re-reads only what changed since the recorded revision.

### W3: A Question Is Put to the User, as a Table, and Waited For

A step that produces a question — a candidate type, a direction, a drop list, the five session questions — asks it
and waits. What is only printed is not arbitrated. Alternatives are presented as a table, one row per alternative,
the columns being what distinguishes them; prose makes the user reconstruct the alternatives before answering.

### W4: A Figure Carries the Command That Produced It

Every count a step reports — statements in a document, entities per type, citations of a file — is printed beside
the command that computed it, as the gate prints its lint line. A number no command produced is not a figure, and it
will be copied unchanged by every later step.

### W5: Three Ledgers Live in the Work File

| Ledger             | Opened by                                   | One row per                                                                                                        | Closed when                                                                  |
|--------------------|---------------------------------------------|--------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------|
| Sources read       | S1 / M1                                     | source read: path or address, the revision or date it was read at, the step that read it                           | never — later steps update it                                                |
| Migration          | the step that rules a retyping or a removal | site to change: entities, incoming edges (`awawa refs` per entity), schema fields targeting the type, files, mentions outside the corpus | every row is done, and the old type's `SCHEMA` entry is deleted |
| Coverage           | S7                                          | **statement** of each document the corpus replaces — never one row per section                                      | every row names an entity, the ruling that drops it, or the task that will carry it |

A row whose home is another document rather than an entity is uncovered. The walk cannot close on an open migration
ledger or an open coverage row: `lint --strict` sees neither a temporary type left behind nor a statement lost.

### W6: The Walk Is Scaffolding — the Corpus Never Names It

No entity cites a step, a flow, this starter or the work file: not in a `SOURCE`, not in a rationale, not in an end
condition. The corpus outlives the walk, and a reader who meets « step S7 » in it has nothing to look up. What a
`SOURCE` carries is listed in P6. The work file itself is disposed of at the last step.

### W7: A Step Closes in a Fixed Order, and Only on Confirmation

1. **Gate** — `awawa fmt <root>` then `awawa lint --strict <root>`: zero findings. One line per declared value of
   every discriminating enum — `awawa status TYPE --where FIELD==VALUE` — a value at zero being reported, not
   hidden. A search of the corpus for step identifiers and the words « step », « walk », « starter », each hit
   read: none names the walk (W6).
   Every schema line the step added has its probe row (P10). No entity written would be refused by its type's
   threshold (P1). No entity is about awawa itself. A step that wrote a schema line reads back the whole entry of
   every type it touched (W9).
2. **Files** — the list of files created, modified and deleted, each with its path, and which of them the user
   should re-read to confirm. The confirmation stands on this list.
3. **Defects** — if Question 5 was accepted, what the step found is appended to the defects file now.
4. **Cost** — the step's cost beside its result: turns and tokens where the agent's harness exposes them, tool calls
   otherwise. It is the only measure by which a step that produced nothing shows up as such.
5. **Confirmation** — the step asks the user whether every point it opened is settled and whether to move on, and
   offers a schema review before the next step (W9). The answer alone never ends a step; a step may be answered
   several times before it is confirmed.
6. **Next prompt** — emitted only after the confirmation, from the frame below, so that it carries what the
   arbitration changed.

A schema line changed outside the step that owns it is a new step, not a silent edit. In a migration, `awawa diff
<snapshot> <corpus>` accounts for every entity change of the step.

### W8: The Prompt Frame

Every step prompt is this frame around the body of the step:

```
<ID> — <title>, step <k> of <N> of Flow <S|M>.
Starter: <where this document is>. Work file: <path>. Defects file: <path | none>.
Open (W2): read the starter's walk protocol and the section of this step; read the work file — entry
answers, closed steps, ledgers; read what the workspace already declares for this step's subject and
write only the difference. Reopen nothing closed without saying so.
<body of the step>
Ask (W3): put every question to me as a table of alternatives and wait for my answer.
Count (W4): print the command beside every figure.
Close (W7), in this order: gate; files created, modified, deleted, and which I should re-read; defects
appended to the defects file; cost; then ask me to confirm that every point is settled, and offer me a
schema review before the next step (W9). Write the step's section in the work file. Emit the next prompt
only after my confirmation. Name no step, flow or starter in the corpus (W6).
```

### W9: The Schema Is Reviewed at Fixed Moments, Not When Someone Thinks of It

Each step adds to the schema and sees only its own lines. What a per-step reading cannot see — a falsifiable value
nothing attests, a settled ruling no field carries, a `DESC` none of its type's enum values satisfies, a declared
value no entity uses — is found only by reading the schema as a whole, and the later it is found the more entities
it costs. The review is therefore built into the walk at four moments:

| Moment                                  | Where                  | What is read                                                                                                  |
|-----------------------------------------|------------------------|---------------------------------------------------------------------------------------------------------------|
| End of every step that wrote a schema line | the gate (W7)       | `awawa show TYPE` on every type the step touched: the whole entry, not the lines added, against the rulings of the work file |
| Before the first entity                 | S9 / M10               | every declaration together, against the entry answers and every ruling                                        |
| After the first entities                | S10 / M10              | the schema against the entities it produced: what is used, what is not, what the prose keeps repeating        |
| Any step boundary                       | the confirmation (W7)  | offered by the step, decided by the user; run as the body of S9, and recorded in the work file as a review    |

A review proposes and probes; it writes only what the user rules (W3). What it read and left as is, is recorded
with the reason, so the next review does not reopen it.

---

## Principles

Both flows apply the same ten principles, in a different order and with a different measure: from scratch, a
principle is designed and probed; in a migration, it is measured on the existing entities first. Each principle
states **what to do**, **why it matters** and **what the tool then checks** in place of a rule to remember.

### P1: Decide the Recording Threshold Before the First Schema Line

**What to do**: Write, per type, the condition under which an entity is recorded. For instance: a decision only if a
future change could reverse it by mistake; a question only if work is blocked on it; a limitation only if it affects
the project, not an external tool. Nothing about the awawa tool itself, nothing that is a general rule living
elsewhere. A table of values (a price list, a catalogue, a set of constants) is not a set of entities: the corpus
names the file that has authority over the values and the key that indexes it, and a query tool reads the row.

**Why it matters**: Without a threshold, an agent records everything it rules on: entities outnumber the work they
serve, the user ends up asking for removals, and every read pays for entities nobody needed. A threshold kept as a
sentence in the instructions is forgotten.

**What the tool checks**: A threshold written as a `REQUIRED` field makes every entity that misses it an L006.
Example: `FIELD BLOCKS @TASK` with `REQUIRED` on a question type means « a question is recorded only if a task waits
on it ».

### P2: Fix the Reading Loop Before Choosing the Edges

**What to do**: Decide which commands a session runs — `status` to orient, `context` with `--skip` to load a package,
`refs` then `show` for incoming edges — and orient every edge so that `context` on the entity a session starts from
reaches what it needs. The entity a question starts from is what fixes the direction of the fields.

**Why it matters**: A corpus whose edges were chosen for the writer is read entity by entity — `show` after `show`,
or the files opened directly — instead of in one `context` package. Every session then pays one call per entity.

**What the tool checks**: `context` expands outgoing references only; incoming ones are named in its footer, by
identity, under the name declared by `CONVERSE` — their content costs a second call. A question starting from the
*target* of an edge is therefore answered in two calls, and one starting from its *carrier* in one. A `CATEGORY` on
a field (e.g. `reasoning` on a rationale) lets a session leave it out with `--skip`, which removes the field itself,
not only its traversal, and accounts for it in the footer.

### P3: Build the Planning Pivot First

**What to do**: Identify the type that carries a lifecycle and dependencies — usually a task, a phase or an epic,
with an identifier as name. Every other type points at it or declares its dependence on it. A workspace with several
areas may have one pivot per area.

**Why it matters**: A corpus holding only its pivot already answers « what is left to do? ». Every later type adds
to a corpus that is useful from its first session.

**What the tool checks**: With a `STATUS` ladder on the pivot and an ordering edge (`AFTER @TASK`), `status TASK`
lists the plan and `context @TASK.X` shows what it rests on and, in its footer, what blocks it. Each rung declares
its severity with `GATE warning|error|suppressed` in its `WHEN STATUS` block; a rung with no `GATE` only warns.
When the object has no lifecycle (a game design, a configuration), the pivot is the type most questions start from
(e.g. a rule), and P3 reduces to choosing it.

**`[implementation: none]`**: the ladder is what lets the corpus exist before the code. Anchors are `REQUIRED` only
inside `WHEN STATUS implemented` — the obligation `REQUIRED` there, its anchor `REQUIRED` under it — so an entity is
written at `draft` or `specified` with no anchor, and promoting it is the act that demands one (L006). The
[reference skeleton](#reference-skeleton) shows the shape.

### P4: One Archive Mechanism, No History in the Corpus

**What to do**: Declare `FIELD STATUS active|archived` with `DEFAULT active` on `SCHEMA *`, a `WHEN STATUS active`
block carrying `GATE error`, and a `WHEN STATUS archived` block carrying `GATE suppressed` and a `REQUIRED`
`ARCHIVED_ON` date. A type with its own lifecycle redeclares `STATUS` with `archived` among its values; the
wildcard's `WHEN` block still applies to it. An entity that stops binding is archived in the change that ends it; a
ruling replaced on the same subject is rewritten in place. No `superseded` status, no `SUPERSEDES`/`CLOSES` fields,
no version suffixes (`:v2`).

Two conditions guard the act of archiving, because the tool guards neither:

- **The entity is clean before it is archived.** `GATE suppressed` silences every check on the entity — missing
  required fields, unknown references, dead anchors, malformed values — except the fields of the archive block
  itself. The change that archives runs `lint --strict` *before* writing `STATUS archived`; afterwards no command
  reports what was broken.
- **Nothing active still points at it.** `context` on an active entity that cites an archived one prints a single
  `// suppressed:` line and none of the archived entity's fields: the reader loses the body in silence. The incoming
  count that `status TYPE` prints is the only side the tool reports; read it before archiving.

**Why it matters**: History kept as entities grows with every change, and every `context` that reaches a dead entity
loads it. Version control already keeps the history; archiving costs two lines and keeps the corpus about what binds
today. Archiving is not an era marker: something old that the project still supports stays active.

**What the tool checks**: `context` does not expand archived entities and names them in its footer; references to
them stay valid. `status TYPE --where STATUS!=archived` lists the live ones, entities with `STATUS` unwritten
included. `lint --strict` refuses an archived entity without `ARCHIVED_ON`, and refuses `ARCHIVED_ON` on an active
one (L003).

### P5: A Type Only for a Different Shape

**What to do**: Split a type only when its set of required fields differs. Two candidates with the same required
fields are one type, distinguished by a field (an enum, a reference, a `WHEN` block). Then hold the type to its own
words:

- A type's `DESC` is its admission test. Run it against every value of the type's discriminating field, one row per
  value: a value no `DESC` admits is either a second type or a `DESC` that is wrong.
- The criterion that decides between the values of a discriminating enum is recorded in the corpus, as a ruling, not
  left in the prose of a `DESC`.
- A declared value no entity carries reads exactly like a value in use. The gate prints the count per value (W7).

**Why it matters**: Every extra type costs a schema, a classification choice at every write, and a retype of its
entities and of every reference to them when the split proves wrong. Example: a ruling that names the code enforcing
it and one that cannot differ in shape (one requires an anchor, the other has none to require): two types. Two
rulings that differ only by topic are one type with a topic field.

**What the tool checks**: `awawa new TYPE Name` prints a different skeleton per type; `status TYPE` lists a family
without a discriminant; L006 on the distinguishing required field catches a misfiled entity. The tool never reads a
`DESC` against an enum: that reading belongs to the schema reviews (W9).

### P6: Type the Sources From the First Schema

**What to do**: Declare source types — for instance a project, a change (the unit of Question 3), a document, a
URL — and, on `SCHEMA *`, a `REPEATABLE` `FIELD SOURCE string` with a nested `FIELD REF reference` marked
`REQUIRED` and a nested `FIELD DATE date`. Every provenance is then an entity, and its date is data.

A `SOURCE` carries: the source document, the identifier inside it (a section, a rule number), the change, the date.
It never carries the process that wrote the entity (W6). An entity whose only origin is a session with the user
carries the date and a `REF` to the project, and no invented sentence.

**Why it matters**: Provenance written as prose cannot be listed nor checked, and rots silently when a file moves or
an address changes; typing it later means rewriting every line. Where the schema offers no field for a fact — the
date — the fact goes into the sentence, and so does whatever else the writer had at hand.

**What the tool checks**: L006 on `SOURCE › REF` lists every source still in prose; L004 an unknown source entity;
L007 a malformed address or date (with a `SHAPE`); `refs @DOCUMENT.X` lists what that source produced.

### P7: Type Everything That Can Be Typed, When It Is Written

**What to do**: Free text is limited to what cannot be a reference, an enum, a shape or a number. A date, an address,
a version, an identifier is a `SHAPE`; a code location is an `anchor` field (`"path::literal"`); an entity name
carries a `NAME` shape; a string a command consumes (a key passed to a query tool) is a `SHAPE`, because a prose
value breaks the reading loop in silence. A field legal in one state only is declared inside that state's `WHEN`
block **and nowhere else** — repeated in each block that admits it, which the tool accepts.

This applies from the first declaration (S4), not in a later typing pass: a schema written untyped is probed
untyped, and the conclusions drawn from those probes are wrong.

An anchor names a file the project's version control tracks. The tool resolves an anchor against the disk and never
consults version control, so an anchor to an ignored or local file lints clean for its author and fails in every
other checkout.

**Why it matters**: The code moves under the corpus. Typed early, a removed file or a renamed symbol is a lint error
instead of a stale sentence; in a living corpus, L016 (an anchor that no longer resolves) is the check that fires
most.

**What the tool checks**: L016 resolves an anchor and names the file and the literal separately; L007 refuses a value
missing its shape; L003 a field outside its `WHEN` block. `WHEN` is monotonic: it adds fields and obligations and
never forbids — a field declared at type level stays legal in every state, whatever a block requires. A required
string is a prompt, not a proof: on 2.7.0 an empty string `""` passes `--strict`.

### P8: Schema in One File, One File Per Type, Append at the End, One Language

**What to do**: Every `SCHEMA`, `FIELDSET` and `SHAPE` in `_schema.awawa`; one data file per type, named by the type
in lower-case plural (`decisions.awawa`, `tasks.awawa`); if it makes sense to group types (example: source types),
group them in one file (example: `sources.awawa`). A new entity is appended at the end of its file. One language for
the whole corpus, entity names included — by default the language the technical vocabulary is in.

In a workspace with several areas, the schema file sits above the area directories and each area holds only data
files. Every command is given the root the anchors resolve from — never a single file, never a directory narrower
than the anchors, which turns a clean corpus into a wall of L016.

**Why it matters**: A layout by domain is a classification choice at every write, and entities end up misfiled. One
schema file gives a reviewer one place to read every declaration. Appending at the end keeps two parallel changes to
the same file to one hunk at rebase.

**What the tool checks**: Nothing — and that is the point: the tool reads no file name, so `status`, `context` and
`lint` give the same result under any layout, and `diff` is blind to an entity moved between files. The layout is a
convention for writers only. Data files start empty: no command reads a comment, so a header comment serves no one.

### P9: A Cleanup Pass (Optional)

**What to do**: A script, run by hand, that archives implemented pivots nothing still waits on, archives entities
whose end condition is met, and deletes archived entities past a retention delay the project chooses. It applies
P4's two conditions: it lints before it archives, and it archives or deletes only what the incoming count of
`status TYPE` shows nothing active points at. Its report is the body of the change it opens.

**Why it matters**: Without it, P4's archive becomes a growing history. Optional for a small or rarely touched
corpus. It disposes of entities only: the documents the corpus replaced are the business of S8.

**What the tool checks**: The script reads `status --json` and `show --json`, then `fmt` and `lint --strict` confirm
the result. `status TYPE --where ARCHIVED_ON==<date>` selects on a field declared inside a `WHEN` block once one
entity of the type writes it; on a type where none does — no archived entity yet — the command exits 2, « not a field
of TYPE in this workspace », so a script looping over the types reads that exit as « nothing to select ». `--where`
knows equality and inequality only, so a retention delay is computed by the script from `show --json`.

### P10: Probe Every Schema Line Before Writing It in the Project

**What to do**: Before a schema line enters the project, prove it in a throwaway directory outside the project.

- **Copy the corpus the line will enter**, not the line alone, whenever a corpus exists: a collision with a field or
  `CONVERSE` name the workspace already reserves (L013) fires only against the existing declarations. A probe of the
  bare line is the special case of an empty project.
- **Write two entities per declaration the step writes or moves**: one that satisfies it and one that violates it; a
  `SHAPE` is tried on its boundary values. Conforming entities alone prove nothing: a condition that never fires
  lints as clean as one that holds.
- **Record one of three outcomes per schema line**: *imposed* (the tool required it), *refused* (the tool rejected
  the violation), *accepted in silence* (the violation passed). The third is a finding, never a pass: it becomes a
  schema change, a written rule, or a knowingly taken risk.
- **Probe the step's own declarations**, not the tool's documented behaviour again. The generic probes — a `SOURCE`
  with no `REF`, an anchor to a missing literal, a value missing its shape — are for the first step that meets each
  mechanism.
- Run `awawa new`, `awawa lint --strict`, `awawa status`, and `awawa context` where an edge is at stake. A probe
  directory that lacks the project's files reports every anchor as L016: count findings net of that baseline.

**Why it matters**: A schema line that reads right can behave otherwise, and once entities depend on it, changing it
costs a migration. Examples on 2.7.0: an empty required string passing `--strict`, a reference written as a
`DEFAULT` counting among the incoming edges of its target, a field meant for one state staying legal in all of them
because it was declared at type level. The same holds for what a document asserts about the tool, this one
included: version 1 stated three behaviours that a probe refuted or narrowed.

**What the tool checks**: Each probe documents it. A tool defect found goes to the defects file if Question 5 was
accepted, never into the project's corpus.

P10 is not a step: it runs inside every step that writes a schema line. Probe directories are deleted at the end of
the step.

---

## Flow S: From Scratch

No corpus holds the object yet. Each principle is designed, probed (P10), then written. Nothing can be measured until
entities exist, so the measures of P1 and P2 are taken on the first entities, in S7. Walk order is the order of this
table.

| Rank | Step | Principles  | Result                                                                  |
|------|------|-------------|-------------------------------------------------------------------------|
| 1    | S1   | —           | Inventory of the knowledge, its sources sorted, the session questions   |
| 2    | S2   | P1, P5      | Types sketched, each with its threshold field; retypings ledgered       |
| 3    | S3   | P2          | Commands per question, edge directions, categories                      |
| 4    | S4   | P7, P8      | Corpus directory and typed schema skeleton                              |
| 5    | S5   | P3, P4      | Pivot type and archive mechanism                                        |
| 6    | S6   | P6, P7      | Source types, shapes, conditional fields completed                      |
| 7    | S9   | P5          | The schema read back as a whole, before any entity depends on it        |
| 8    | S7   | P1, P2      | First entities, the two measures, the coverage table                    |
| 9    | S10  | P1, P5, P6  | The schema and the coverage audited against the entities written        |
| 10   | S8   | P9          | Replaced sources disposed of; cleanup pass designed or skipped          |

Each body below goes inside the [prompt frame](#w8-the-prompt-frame).

### S1: Inventory the Knowledge

```
- List where the project's knowledge lives today: README, architecture decision records, agent
  instructions, issue tracker, wiki, code comments, the user.
  [implementation: none] The places are the user, a brief, sketches, issues: interview the user,
  and take the statements they give as the examples.
- For each place, list the kinds of fact it holds (a ruling, a task, an open question, a
  constraint, a glossary term…) with one real example quoted and its location.
- Sort every document: replaced (the corpus will empty it), kept, or partly kept. For a kept or
  partly kept document, say what of it is deferred, to what, and what is not: its prose is
  classified now — deferring the tables of a document is not deferring the document.
- For each document to be replaced, count its units (statements, numbered rules) with a command.
- Open the sources-read ledger (W5) with everything read, at its revision.
- Propose the five questions a working session most often asks about the object (e.g. "what is
  left to do for X?", "why was Y chosen?", "what constrains Z?"), each with the entity it would
  start from. Put them to me as a table; they are arbitrated, not printed.
- [joins] List what the workspace already declares: types, field and CONVERSE names, shapes,
  source types, the archive mechanism, the pivot.
- Do not design any type yet.
Record: the inventory table (place, kinds of fact, example), the document sorting table with its
counts, the five arbitrated questions.
```

### S2: Sketch the Types and Their Thresholds (P1, P5)

```
- Group the kinds of fact from S1 into candidate types. [joins] Reuse a declared type where the
  shape fits; a new type must not reuse a reserved name.
- For each type, write one sentence: "Record a [TYPE] only if [CONDITION]", and the REQUIRED
  field that enforces the condition (P1).
- List each type's REQUIRED fields; merge any two types whose REQUIRED sets are identical, with a
  discriminant field instead (P5). For each discriminant: the criterion that decides between its
  values, and the type's DESC run against each value, one row per value.
- For each S1 example, name the type it would become, or "not recorded" and why.
- If a ruling retypes or removes existing entities: open the migration ledger (W5) now, with the
  entities, their incoming edges (awawa refs per entity), the schema fields targeting the type,
  the files, and the mentions outside the corpus (agent instructions, code comments). Name the
  step that will perform it.
Record: the types, thresholds, REQUIRED fields, merges, discriminant criteria, the S1 examples
classified, the ledger if opened.
```

### S3: Design the Reading Loop (P2)

```
- For each S1 question, write the commands that answer it: status TYPE [--where FIELD==VALUE],
  context @TYPE.X [--skip CATEGORY], refs @TYPE.X. A question the corpus should not answer (a
  value held in a data file) gets its own command and no entity.
- For each reference field, decide which entity carries it so that context on the entity the
  question starts from reaches the answer; the reverse direction is never written, it gets a
  CONVERSE name. Remember that context expands outgoing edges and only names incoming ones.
- Mark the fields a typical session does not need (reasoning, provenance, attestation) with a
  CATEGORY.
- [joins] List every new field and CONVERSE name beside the names the workspace reserves; the
  collision check (L013) is run in S4, not asserted here.
- Target: one context call per question, not one show per entity.
Record: the question → commands → calls table, the reference fields with carrier, target,
CONVERSE name and the reason for the direction, the categories.
```

### S4: Create the Typed Corpus Skeleton (P7, P8, P10)

```
- Choose the corpus directory with me (e.g. docs/spec/ or spec/).
- [corpus: none] Create _schema.awawa: SCHEMA * (DESC, RATIONALE with CATEGORY reasoning), then
  one SCHEMA entry per S2 type with its DESC and REQUIRED fields, then the S3 reference fields
  with their CONVERSE names.
  [joins] Extend the workspace's schema file; never create a second SCHEMA *. If the schema file
  sits inside the first area, propose moving it above both areas, and count first what cites its
  path (anchors, instructions, scripts). The new area holds data files only.
- Type every field as it is written (P7): shape, enum, anchor, reference; a field legal in one
  state only goes inside that state's WHEN block and nowhere else. Every DESC a short
  lower-case fragment, written as the type's admission test.
- For every REQUIRED anchor: does a file tracked by version control satisfy it today? Where none
  does, either the anchor becomes REQUIRED only at the rung where it can hold, or a task is
  recorded now for what is missing. S7 reads this answer instead of discovering it.
  [implementation: none] No anchor is REQUIRED outside WHEN STATUS implemented.
- Create one empty data file per type, lower-case plural; sources.awawa if no source file exists.
- Probe first (P10): in a copy of the corpus the schema enters, two entities per declaration,
  the three outcomes per schema line; awawa new TYPE X for each type. Fix the schema until the
  probe behaves as intended.
Record: the file list, the schema added, the probe table, the anchor answers.
```

### S5: Add the Pivot and the Archive Mechanism (P3, P4, P10)

```
- Name the pivot (the type with a lifecycle, or the type most questions start from), priced on
  what context returns from each candidate. [joins] One pivot per area is legitimate.
  If it has a lifecycle: a STATUS ladder with a GATE per rung, REQUIRED or with a DEFAULT, and
  an ordering reference field (e.g. AFTER @TASK) with its CONVERSE name. Decide what
  "implemented" requires (an anchor under each obligation, inside WHEN STATUS implemented).
  [implementation: none] The ladder is mandatory: draft and specified carry no anchor.
- [corpus: none] On SCHEMA *: FIELD STATUS active|archived, DEFAULT active; WHEN STATUS active
  with GATE error; WHEN STATUS archived with GATE suppressed and FIELD ARCHIVED_ON date REQUIRED;
  a SHAPE date.
  [joins] The mechanism probably stands: probe it on the new types and add only what the probe
  shows missing — possibly nothing.
- Rule with me how the archive is used, not only how it is declared: what "stops binding" means
  for each type, as distinct from "is old".
- Probe (P10): archive without ARCHIVED_ON (expect an error), with it (expect clean),
  ARCHIVED_ON on an active entity (expect L003); an archived entity violating a REQUIRED beside
  its active twin (expect silence on the archived one: P4's first condition); context on an
  active entity citing an archived one (expect a suppressed line: P4's second condition).
Record: the pivot and why, the schema additions, the archive rulings, the probe table.
```

### S6: Type the Sources and Complete the Fields (P6, P7, P10)

```
- For each place of S1 a fact can come from, name its source type and the shape of its
  identifier (a document path, a URL, a change number, a release version). [joins] Reuse the
  declared source types; add a type only for a place none of them fits.
- [corpus: none] On SCHEMA *: FIELD SOURCE string REPEATABLE with CATEGORY provenance, nested
  FIELD REF reference REQUIRED, nested FIELD DATE date.
- State what a SOURCE carries in this project — document, identifier inside it, change, date —
  and that it never names the walk (W6).
- Second pass of P7 on what S4 wrote: for each remaining string field, a table — field, verdict
  (string | SHAPE | anchor | enum | moved into a WHEN block), reason. A string a command
  consumes gets a SHAPE.
- Check that every anchor planned names a file version control tracks.
- Probe (P10): one probe per declaration this step writes or moves, conforming and violating,
  boundary values for each new SHAPE. The generic probes (a SOURCE with no REF, an anchor to a
  missing literal, a value missing its shape) only if no earlier step ran them.
Record: the source types, the string-field table, the moved fields, the probe table.
```

### S9: Read the Schema Back as a Whole (P5, P10)

```
- Read every declaration with the tool: awawa show '@SCHEMA.*', then awawa show TYPE for each
  type, FIELDSET and SHAPE. No step so far has read them together.
- Against the entry answers and every ruling in the work file: is each ruling that implies a
  field declared? Is each settled answer visible in the schema?
- For each type: run its DESC against every value of its discriminating fields, one row per
  value (P5).
- For each falsifiable value (a number, an index, a limit): is it attested or anchored where it
  lives, as the obligations are?
- For each type: must an entity of it never be orphan? Then an INCOMING obligation in the right
  WHEN block — and note that awawa new does not print it.
- Probe whatever the review would change (P10), put each point to me as a table row (point,
  proposed ruling, probe), and write only what I rule. List also what was read and left as is,
  with the reason.
Record: the verdict, the rulings with their probes, the points left as is.
```

### S7: Write the First Entities, Measure, Prove the Coverage

```
- Read the S4 anchor answers: write no entity whose REQUIRED anchor cannot resolve today.
- Perform the migration ledger (W5) if one is open: retype, repoint every incoming edge,
  retarget the schema fields, delete the old SCHEMA entry and file, fix the mentions outside the
  corpus; run awawa refs per entity before its type disappears.
- Write the S1 examples classified in S2 as entities, using awawa new TYPE Name for each
  skeleton; every provenance as a SOURCE per P6.
  [implementation: none] The entities come from the user's statements, at the first rungs of
  the ladder, with no anchor.
- Measure P1: count the entities written that the threshold should have refused. Target 0;
  otherwise tighten the REQUIRED field or drop the entity.
- Measure P2: answer each S1 question with the S3 commands; count the calls per question. More
  than planned: revisit the edge direction.
- Open the coverage table (W5): one row per statement of each document S1 sorted as replaced —
  the statement, then the entity that holds it, the ruling that drops it, or the task that will
  carry it. Print the command that counts the statements beside the count. For each kept or
  partly kept document, classify its prose statement by statement as well: candidates found
  there are entities to write or tasks to record, not a later step's surprise.
- Add to the project's agent instructions the corpus path and the S3 reading loop, so the next
  session reads the corpus with the tool rather than as files.
Record: the entity counts per type and per enum value, the two measures, the coverage table,
the ledger state, the instruction lines added.
```

### S10: Audit the Schema and the Coverage Against the Entities (P1, P5, P6)

```
- Per type and per value of every discriminating enum: the count of entities (awawa status TYPE
  --where FIELD==VALUE). A value at zero is ruled on: removed, or kept knowingly with the reason.
- Per type: run its DESC, as the admission test, against the entities written — all of them, or
  a sample whose size is stated, at least one per enum value. An entity its type's DESC does
  not admit is a retyping (migration ledger) or a DESC to correct; say which.
- Per REQUIRED field: read the values actually written. The same sentence everywhere, or a
  placeholder, is a threshold that does not bite (P1).
- Per optional field never written, and per sentence pattern the prose fields keep repeating:
  a field to remove, or a field waiting to be declared.
- Per SOURCE written: it carries what P6 lists, its date is in DATE, and it names no process.
- Coverage audit: re-count the statements of each replaced document with the command, and check
  covered rows against the text of the entity they name — all of them, or a stated sample:
  does the entity state the statement, or only share its section? A statement dropped when a
  sentence became a field is an uncovered row.
- Put each finding to me as a table row (finding, proposed ruling, probe); probe what would
  change the schema (P10); write only what I rule.
Record: the counts per value, the findings and rulings, the coverage corrections, what was read
and left as is.
```

### S8: Dispose of the Replaced Sources, Decide the Cleanup Pass (P9)

```
- One row per document S1 sorted as replaced or partly kept: can it be deleted now, and what is
  still owed before it can? The answer is per document. A document is deleted only when every
  one of its coverage rows is filled.
- Before deleting a document, count what cites it outside the corpus — a search of the whole
  project for its name: code comments, README, other documents, scripts, CI. lint --strict sees
  only the anchors the corpus carries. Repoint every citation in the same change; a code comment
  then cites the entity (@TYPE.Name): the type prefix makes a text search for it exact. awawa
  fmt --rename rewrites the corpus only and never a code comment, so a rename is followed by
  that search over the project, in the same change.
- If the corpus will grow or change often: design the cleanup script in pseudocode — candidates
  to archive (implemented pivots nothing waits on, entities whose end condition is met), each
  linted before it is archived and only if nothing active points at it; candidates to delete
  (archived past the retention delay chosen with me); awawa fmt, awawa lint --strict; a report
  as the body of the change. Otherwise: record that it is skipped and the corpus size at which
  to reconsider.
- Dispose of the work file with me: deleted, or kept outside the corpus. Delete the probe
  directories.
Record: the per-document table with its citation counts, the design or the skip decision; the
corpus is then checked against the readiness criteria.
```

---

## Flow M: Migration

The corpus already holds the object. Every principle is first **measured** on the existing entities, and the corpus
is changed only where the measure shows a gap. Each step is one change, reviewed on its own, and its entity-level
effect is shown by `awawa diff <snapshot before> <corpus after>`. The walk protocol applies unchanged. Walk order is
the order of this table.

| Rank | Step | Principles | Result                                             |
|------|------|------------|----------------------------------------------------|
| 1    | M1   | —          | Baseline: snapshot, counts, findings, schema state |
| 2    | M2   | P1         | Entities to drop or retype; threshold fields       |
| 3    | M3   | P2         | Reading cost measured; edges reoriented            |
| 4    | M4   | P3         | Pivot identified or built                          |
| 5    | M5   | P4         | History converted to archive                       |
| 6    | M6   | P5         | Types merged or split by shape                     |
| 7    | M7   | P6, P7     | Sources and fields typed                           |
| 8    | M10  | P5         | The schema read back, and audited on its entities  |
| 9    | M8   | P8         | Layout reorganized, tool output unchanged          |
| 10   | M9   | P9         | Cleanup pass designed or skipped                   |

### M1: Take the Baseline

```
- Copy the corpus to a snapshot directory outside the project; every later step diffs against a
  snapshot.
- Run awawa status: entity counts by type and STATUS, reference health.
- Run awawa lint --strict --summary: findings by rule.
- If the corpus has no SCHEMA entry: run awawa infer, keep its output as the draft schema in
  _schema.awawa, and re-run lint.
- List the types, their REQUIRED fields (awawa show TYPE), the files and which types each file
  holds, and any history mechanism in use (a superseded status, supersession fields, version
  suffixes).
- Open the sources-read ledger (W5).
Record: the baseline tables, each figure with its command.
```

### M2: Measure the Recording Threshold (P1)

```
- For each type, write "Record a [TYPE] only if [CONDITION]" and the REQUIRED field that would
  enforce it.
- Read every entity of the type with the tool (status TYPE, then show) and classify it: meets
  the threshold / should be another type / should not have been recorded (about the awawa tool,
  a general rule living elsewhere, a narrative).
- Measure: the count per class. Put the drop list to me as a table and wait for my answer
  before deleting. Open the migration ledger (W5) with the retype list.
- Probe (P10) the threshold fields, then add them; entities missing them are fixed or dropped in
  the same change.
Record: the thresholds, the counts, the confirmed drop and retype lists, the lint result.
```

### M3: Measure the Reading Loop (P2)

```
- Collect the five questions sessions most often ask about the object (from the agent
  instructions, recent change descriptions, or me); put them to me as a table.
- Answer each with the tool, and count the calls: status, context, refs, show.
- For each question needing more than one context call: find the reference field whose direction
  forces the extra calls; propose its reversal and a CONVERSE name.
- List reference fields written on both ends (e.g. BLOCKS and BLOCKED_BY): the reverse one is
  removed, the tool derives it.
- Probe (P10) the reversed fields, then migrate the references in one change; re-count.
Record: the calls per question before and after, the fields reoriented.
```

### M4: Identify the Pivot (P3)

```
- Name the type with a lifecycle and dependencies, or the type most M3 questions start from. If
  none exists and the object has work to plan, sketch one.
- Check: can status PIVOT answer "what is left to do?" and context @PIVOT.X show what blocks it?
  If not, name the missing field or edge. Check that every rung of the ladder declares its GATE.
- Probe (P10), then add the missing fields; migrate existing entities in the same change.
Record: the pivot, the gaps found, the fields added.
```

### M5: Convert History to Archive (P4)

```
- Probe (P10) the P4 mechanism on a copy of the corpus, its two conditions included.
- Add it to SCHEMA *; lifecycle types redeclare STATUS with archived among their values.
- Convert: a superseded entity with a successor on the same subject is deleted (version control
  keeps it) and the successor takes its name with awawa fmt --rename, so references land on the
  ruling in force; a superseded entity with no successor becomes archived with ARCHIVED_ON (the
  date of the change that ended it, from version control) — linted before it is archived, and
  only once nothing active points at it; supersession fields are removed.
- Measure: entities with a history status or field before and after (target 0 after), and the
  context package size of the pivot before and after.
Record: the conversion counts, the size measure, the lint result.
```

### M6: Merge and Split Types by Shape (P5)

```
- List each type's REQUIRED fields. Types with identical sets: merge, with a discriminant. One
  type holding entities with different REQUIRED needs: split.
- Retyping changes every reference to the entity: fill the migration ledger (W5) — entities,
  incoming edges from awawa refs, schema fields, files, mentions outside the corpus — before
  editing.
- Probe (P10) the merged or split schema, then migrate entities and references in one change.
Record: the merges and splits, the ledger, the entities and references rewritten, the diff
summary.
```

### M7: Type the Sources and the Fields (P6, P7)

```
- Find provenance written in prose (paths, links, change numbers, "decided in …") with status,
  show and a text search of the corpus: count it per kind.
- Declare the source types and the SOURCE › REF and SOURCE › DATE fields; create the source
  entities; attach a REF to every SOURCE; move every date out of the prose. Remove any mention
  of a process that wrote the entity (W6).
- For each string field holding dates, addresses, identifiers or code locations: declare the
  SHAPE or anchor and fix the values the lint then refuses (L007, L016). Move each field legal
  in one state only inside its WHEN block.
- Probe (P10) each declaration first.
Record: the counts of prose provenance before and after, the shapes added, the L007/L016 fixed.
```

### M10: Read the Schema Back as a Whole (P5, P10)

The entities already exist, so the two reviews of Flow S are one step here: the body of
[S9](#s9-read-the-schema-back-as-a-whole-p5-p10) on the migrated schema, then the body of
[S10](#s10-audit-the-schema-and-the-coverage-against-the-entities-p1-p5-p6) on the migrated entities, its coverage
audit left out when the migration replaced no document.

### M8: Reorganize the Layout (P8)

```
- Move the schema to _schema.awawa and each type's entities to its own file; order inside a file
  is kept.
- Proof of no semantic change: awawa diff <snapshot taken just before> <corpus> reports no
  entity change, and awawa status is identical before and after.
- Update every place that cited a corpus file path (agent instructions, scripts, CI), found by a
  search of the whole project, counted.
Record: the new layout, the diff and status evidence, the paths updated.
```

### M9: Decide the Cleanup Pass (P9)

Same body as [S8](#s8-dispose-of-the-replaced-sources-decide-the-cleanup-pass-p9). A migration usually replaces no
document: the step then says so in one line and goes to the cleanup pass.

---

## Readiness Criteria

- [ ] `awawa lint --strict` passes with zero findings, from the root the anchors resolve from.
- [ ] `awawa status` shows every type with entities, or its emptiness is intended; every declared enum value has
  entities, or its zero is ruled on.
- [ ] `awawa context @PIVOT.X` on a live pivot returns the entity, what it rests on, and in its footer what points at
  it.
- [ ] `awawa refs @SOURCE_TYPE.X` on a source entity lists what cites it.
- [ ] Each of the session questions (S1 or M3) is answered in the number of calls its step planned.
- [ ] No entity would be refused by its type's threshold.
- [ ] Every coverage row is filled, and the migration ledger is closed.
- [ ] The schema was reviewed as a whole before the first entity and audited against the entities after them (W9),
  and every finding is ruled on.
- [ ] No document the corpus replaced still stands, or a recorded task names what is owed before it goes; nothing
  outside the corpus still cites a deleted document.
- [ ] No entity names a step, a flow, this starter or the work file.
- [ ] Migration only: no history status, supersession field or version suffix remains.
- [ ] `[implementation: none]` only: no entity sits at the implemented rung without an anchor, and promotion to it
  demands one (probed).
- [ ] The project's agent instructions name the corpus path and the reading loop.
- [ ] The cleanup pass is designed or consciously skipped.
- [ ] Probe directories are deleted and the work file is disposed of; nothing of them entered the corpus.

---

## Reference Skeleton

Illustrative, probed on 2.7.0 with a conforming and a violating entity per declaration: a wildcard with P4 and P6, a
source type, and a pivot whose ladder makes the anchor `REQUIRED` at the implemented rung only. Every name is a
proposal.

```
SHAPE date
	DESC "a calendar day, YYYY-MM-DD"
	MATCH "\d{4}-\d{2}-\d{2}"

SCHEMA *
	DESC "fields legal on every entity of this corpus"
	FIELD DESC string
		DESC "what no other field of the entity holds"
	FIELD RATIONALE string
		CATEGORY reasoning
		DESC "why the entity is as it is"
	FIELD SOURCE string
		REPEATABLE
		CATEGORY provenance
		DESC "where the entity came from; never the process that wrote it"
		FIELD REF reference
			REQUIRED
			DESC "the source entity the prose names"
		FIELD DATE date
			DESC "the day the source was read or the ruling taken"
	FIELD STATUS active|archived
		DEFAULT active
		DESC "written only to archive an entity that stopped binding"
	WHEN STATUS active
		GATE error
	WHEN STATUS archived
		GATE suppressed
		FIELD ARCHIVED_ON date
			REQUIRED
			DESC "the day the entity was archived"

SCHEMA DOCUMENT
	DESC "a document a fact was read in"
	FIELD PATH anchor
		REQUIRED
		DESC "where the document is"

SCHEMA FEATURE
	DESC "a behaviour the product owes its user"
	FIELD STATUS draft|specified|implemented|archived
		REQUIRED
		DESC "draft: not ratified; specified: ratified; implemented: anchored in the code"
	FIELD SPEC string
		REQUIRED
		REPEATABLE
		DESC "one falsifiable obligation"
		FIELD IMPL anchor
			REPEATABLE
			DESC "where the obligation is proven"
	FIELD AFTER @FEATURE
		REPEATABLE
		CONVERSE BEFORE
		DESC "the feature this one waits on"
	WHEN STATUS draft
		GATE warning
	WHEN STATUS specified
		GATE error
	WHEN STATUS implemented
		GATE error
		FIELD SPEC
			REQUIRED
			REPEATABLE
			FIELD IMPL
				REQUIRED
				REPEATABLE
```

Observed: a `DATE "18/09/2026"` is refused (L007); an implemented `FEATURE` whose `SPEC` has no `IMPL` is refused
(L006 on `FEATURE.SPEC`); a `SOURCE` with no `REF` is refused (L006); an archived `FEATURE` whose `AFTER` names an
entity that does not exist is **accepted in silence** — P4's first condition.

---

## Tool Behaviours Worth Knowing (2.7.0)

Every row was probed on 2.7.0 for this version, with a conforming and a violating entity, and governs a choice
above. Re-probe on your version before relying on it.

| Behaviour                                                                                                         | Governs      |
|-------------------------------------------------------------------------------------------------------------------|--------------|
| An empty required string `""` passes `--strict`                                                                   | P7           |
| A `WHEN` block keyed on a reference (`WHEN VIA @TYPE.X`) fires on entities writing that reference, and on those omitting the field when its `DEFAULT` is that reference | P7           |
| A reference written as a `DEFAULT` or as a `WHEN` value is a reference site of the `SCHEMA` entry: it counts in the target's incoming edges (`referenced by @SCHEMA.X`); the entity omitting the field gets no edge | P4, P10 |
| `--where` selects on a field declared only inside a `WHEN` block, the wildcard's included, once one entity of the type writes it; before that it exits 2, « not a field of TYPE in this workspace » | P9           |
| `--where STATUS!=archived` keeps the entities whose `STATUS` is unwritten                                         | P4           |
| A rung with no `GATE` warns; `--strict` promotes the warning to an error                                          | P3           |
| `GATE suppressed` silences every check on the entity except the fields of the archive block itself                | P4           |
| `context` on an active entity citing an archived one prints `// suppressed:` and none of its fields               | P4, P9       |
| `context` expands outgoing edges; incoming ones are named in the footer by identity, `(root, N)` or `(rest, N)`   | P2           |
| `--skip CATEGORY` removes the fields themselves, nested ones included, and counts them in the footer              | P2           |
| `WHEN` is monotonic: a field declared at type level stays legal in every state                                    | P7           |
| A field may be declared in several mutually exclusive `WHEN` blocks without L013                                  | P7           |
| A `WHEN` block keyed on a `REPEATABLE` field fires when its value is one among several                            | P5           |
| L016 tests that the file exists on disk; version control is never consulted                                       | P7           |
| `awawa new` prints the `REQUIRED` fields of a `WHEN` block and omits its `INCOMING` obligation                    | S9           |
| `fmt --rename` rewrites the declaration and the indexed reference sites of the corpus; a code comment is untouched | S8           |
| A probe directory without the project's files reports every anchor as L016                                        | P10          |
| Empty and comment-only data files are tolerated by `fmt` and `lint`                                               | P8           |
| `diff` reports nothing when an entity moves between files or directories of the workspace                         | P8, M8       |

---

## What Changed Since Version 1

- **A walk protocol** (W1–W9): a work file carries the walk, a step opens by reading what exists, questions are
  asked as tables, figures carry their command, three ledgers guard retypings, coverage and re-reading, a step closes
  on files, cost and the user's confirmation, the next prompt comes after it, and the schema is reviewed at fixed
  moments.
- **The entry point has three facts, not one**: corpus, workspace joined, implementation. Every step of Flow S
  branches on them; the claim that two corpora of one project are independent is withdrawn.
- **A project with no implementation is covered**: anchors are required at the implemented rung only.
- **P4 states its two conditions** — clean before archiving, nothing active pointing at it.
- **P5 holds a type to its `DESC`** and counts entities per enum value.
- **P6 gives the date a field** and says what a `SOURCE` never carries.
- **P7 applies from the first declaration**, and an anchor names a tracked file.
- **P10 probes a copy of the corpus, with a violating entity per declaration, and records three outcomes.**
- **Three tool behaviours stated by version 1 are withdrawn**, two refuted and one narrowed by a probe on 2.7.0: a
  `WHEN` block keyed on a reference field does fire; `--where` does select a field declared only inside a `WHEN`
  block, but only once one entity of the type writes it, and exits 2 before that; a `DEFAULT` on a reference creates
  no edge from the entity that omits the field — it makes the `SCHEMA` entry a referrer of the target. The table of tool behaviours holds only what was re-probed for this version.
- **Schema reviews at fixed moments** (W9): a read-back in the gate of every step that touches the schema, a review
  before the first entity (S9, M10), an audit against the entities written (S10, M10), and a review offered to the
  user at every confirmation — no longer left to the user's initiative.
- **S7 proves coverage per statement; S8 disposes of the replaced documents** and counts their citations outside
  the corpus before deleting them.

---

## Out of Scope

- **Tool defects and proposals**: recorded during the walk if the user accepted it (Question 5), kept outside the
  corpus for the awawa maintainers, never recorded as entities.
- **Out-of-corpus levers**: session instructions beyond the reading loop, response length, prompt design — the
  project's agent instructions and skills govern them.

**Expected length**: Flow S, 10–14 sessions; Flow M, 10–15 sessions — one or two per step, depending on the size
of the object and the depth of the probes. On the one walk measured, a step cost the same order of turns whether it
added a hundred schema lines or none, which is why every step reports its cost (W7).
