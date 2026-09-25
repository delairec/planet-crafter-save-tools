> Notes:
> * Version 3. Version 1 was walked once (Flow S, an implemented product joining an existing workspace); version 2
    was walked once (Flow S, a set of 23 instruction documents replaced by a new corpus, no code to anchor). This
    version carries what the second walk found. Flow M has not been walked yet; the compact walk of this version
    has not been walked either.
> * It relies on no document but itself and what ships with awawa: `awawa --help` (the session loop and the rules
    that do not change) and, where installed, the awawa manual, its agent protocol and its schema-authoring guide.
    No project document is assumed, so it applies to any project, existing or empty.
> * Principle P4 goes against the tool's own recommendation (« mark a replaced entity … rather than deleting it »)
    on purpose; the reason is in its section.
> * Identifiers follow reading order since version 3: questions, steps and principles are numbered in the order they
    are met. Version 2 walked S9 before S7; [the table at the end](#identifiers-of-version-2) maps the old
    identifiers, which earlier reports cite, to the new ones.

# Awawa Corpus Starter

**Purpose**: Take any project to a well-shaped awawa corpus, one session per step — whether a corpus already exists
(migration) or not (from scratch), and whether an implementation already exists or not.

**Audience**: Primarily AI agents, secondarily humans. Every example is illustrative and every type name is a
proposal, never a requirement.

**How to use it**: Answer the entry questions once. A session then runs one step, under the
[walk protocol](#walk-protocol): it reads the work file, does the step, records its result in the work file, and ends
only on the user's confirmation. Before the first step, read [the length of the walk](#length-of-the-walk) with the
user and choose the full or the compact walk. Written against `awawa 2.7.0`; the tool behaviours cited are
[listed at the end](#tool-behaviours-worth-knowing-270) and may change in later versions — re-probe them.

---

## Entry Point: Six Questions Before Anything Else

### Question 1 — In which language is the walk held, and the corpus written?

Two answers: the language of the exchange (the prompts, the questions, the work file) and the language of the corpus
(entity names included, P8 — by default the language the technical vocabulary is in). They may differ. Both are
kept for the whole walk and written into every prompt (W8): a prompt in one language answered in another makes the
session alternate between the two.

### Question 2 — Where does the walk start from?

Three facts, each proven rather than assumed.

| Fact                                                        | Proof                                                                                                                       | Entry answer                                |
|-------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------|---------------------------------------------|
| Do `.awawa` files exist under the project root?             | `awawa status --json <project root>` reports `summary.files` above zero                                                     | —                                           |
| If so, does that corpus already hold the object of Question 3? | `awawa status <project root>`: the types listed, read with the user                                                      | `[corpus: none \| joins <root> \| exists <path>]` |
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
resolves one. It concerns only the anchors that name what is not built yet; an anchor to a file that exists before
its entity — a tracked document, a procedure — is unaffected (P3). Flow S then takes its first entities from the
user's statements or from the documents it replaces.

### Question 3 — What is the corpus about?

- A) A project methodology (how we work)
- B) A product specification (what we build)
- C) A game or system design (rules, mechanics, entities)
- D) A tool's configuration or behavior
- E) A set of documents that is itself the object — agent instructions, a rulebook, a handbook
- F) Other — described freely

The types, fields and edges depend on it. Examples: a methodology might capture decisions, processes and tasks; a
product specification might capture features, requirements and data models; a set of instructions might capture
rules, the conditions that load them and the areas that group them. These are to be defined from the user's
insights and knowledge.

Answer E sets `[object: documents]`: the knowledge is already written down, and the documents are both the source and
what the corpus replaces. S1 then inventories documents rather than interviewing the user about where knowledge lives.

### Question 4 — What is the project's unit of change?

A pull request, a merge request, a reviewed commit, or none. The principles below say « the change that ends it »:
read it as this unit. It also bears on whether provenance is worth recording (P6).

### Question 5 — Where does the work file of the walk live?

One file, named now, that every step reads first and writes last (W1). It sits outside the corpus directory — the
corpus never holds the walk (W6) — and in a place the next session can read: inside the project, tracked or not, as
the user prefers.

### Question 6 — Do you accept to record defects found in the tool, and in this starter, during the walk?

Asked last, and the default is **no**: an unanswered question, or an ambiguous answer, is a no, and the session
ignores the defects it meets and continues. If yes, name the file: it lives outside the corpus, and the user may send
it to the awawa maintainers. Every step then appends to it before closing (W7).

Record the answers at the top of the work file. Every step prompt carries the path of the work file and the two
languages of Question 1, not a copy of the other answers.

---

## Walk Protocol

A step is more than its body. These nine rules apply to every step of both flows; the
[prompt frame](#w8-the-prompt-frame) restates them in each prompt, because an obligation stated once at the entry
point is forgotten by the third session.

### W1: One Work File Carries the Walk

Every step writes its result to the work file, under a heading of its own: the result, the rulings taken with the
user, the probe table, the files touched, the sources read, the cost. The next session reads that file instead of
re-deriving the previous step from the project. A result that exists only in a conversation is lost with it.

The work file is also what makes a step resumable: a step may stop at any sub-result written to it, and the next
session resumes there. A step that runs long offers the user a stopping point at each sub-result (W8).

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

A question states what each answer commits to: the schema lines it writes or removes, the steps it reopens, the
entities it changes. A question whose answers commit to nothing different is a confirmation, and is put as one.

### W4: A Figure Carries the Command That Produced It

Every count a step reports — statements in a document, entities per type, citations of a file — is printed beside
the command that computed it, as the gate prints its lint line. A number no command produced is not a figure, and it
will be copied unchanged by every later step.

### W5: Three Ledgers Live in the Work File

| Ledger             | Opened by                                   | One row per                                                                                                        | Closed when                                                                  |
|--------------------|---------------------------------------------|--------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------|
| Sources read       | S1 / M1                                     | source read: path or address, the revision or date it was read at, the step that read it                           | never — later steps update it                                                |
| Migration          | the step that rules a retyping or a removal | site to change: entities, incoming edges (`awawa refs` per entity), schema fields targeting the type, files, mentions outside the corpus | every row is done, and the old type's `SCHEMA` entry is deleted |
| Coverage           | S8                                          | **statement** of each document the corpus replaces — never one row per section                                      | every row is **stated** by an entity, dropped by a ruling, or carried by a task |

**A statement** is a list item, a paragraph outside a list, or a table row, once each; a heading, a blank line and a
code fence are not statements, and a code block counts as one. S1 counts with this definition and every later count
uses it, so two walks — and two steps of one walk — give comparable figures. A project that needs another unit states
it at S1, with the command that counts it.

**Stated** is the closing test of a coverage row, not « names an entity »: the entity's text says what the statement
says. The loss is systematic when a sentence becomes fields — a reason condensed into a `RATIONALE`, list elements or
examples dropped, a clause lost — so each row is checked against the entity text **when the entity is written**, and
a row the entity states only in part is marked `partial` with what is missing. A `partial` row is open.

A row whose home is another document rather than an entity is uncovered. The walk cannot close on an open migration
ledger or an open coverage row: `lint --strict` sees neither a temporary type left behind nor a statement lost.

### W6: The Walk Is Scaffolding — the Corpus Never Names It

No entity cites a step, a flow, this starter or the work file: not in a `SOURCE`, not in a rationale, not in an end
condition. The corpus outlives the walk, and a reader who meets « step S8 » in it has nothing to look up. What a
`SOURCE` carries is listed in P6. The work file itself is disposed of at the last step.

### W7: A Step Closes in a Fixed Order, and Only on Confirmation

1. **Gate** — `awawa fmt <root>` then `awawa lint --strict <root>`: zero findings. One line per declared value of
   every discriminating enum — `awawa status TYPE --where FIELD==VALUE` — a value at zero being reported, not
   hidden; for `STATUS` with a `DEFAULT`, count with `--where STATUS!=<other value>`, since an unwritten default
   matches no `==` (see the tool behaviours). A search of the corpus for step identifiers and the words « step »,
   « walk », « starter », each hit read: none names the walk (W6).
   Every schema line the step added has its probe row (P10). No entity written would be refused by its type's
   threshold (P1). No entity is about awawa itself. A step that wrote a schema line reads back the whole entry of
   every type it touched (W9).
2. **Files** — the list of files created, modified and deleted, each with its path, and which of them the user
   should re-read to confirm. The confirmation stands on this list.
3. **Defects** — if Question 6 was accepted, what the step found is appended to the defects file now.
4. **Cost** — the step's cost beside its result: turns and tokens where the agent's harness exposes them, tool calls
   otherwise. It is the only measure by which a step that produced nothing shows up as such.
5. **Confirmation** — the step asks the user whether every point it opened is settled and whether to move on, and
   offers a schema review before the next step (W9). The answer alone never ends a step; a step may be answered
   several times before it is confirmed.
6. **Next prompt** — emitted only after the confirmation, from the frame below, so that it carries what the
   arbitration changed.

Items 1 to 4 are written into the work file, not recited in the conversation: the conversation carries the gate's
lint line, the list of files to re-read, and the confirmation question. A step that wrote no schema line and no
entity has a gate of one line.

A schema line changed outside the step that owns it is a new step, not a silent edit. In a migration, `awawa diff
<snapshot> <corpus>` accounts for every entity change of the step.

### W8: The Prompt Frame

Every step prompt is this frame around the body of the step:

```
<ID> — <title>, step <k> of <N> of Flow <S|M>, <full | compact> walk.
Starter: <where this document is>. Work file: <path>. Defects file: <path | none>.
Languages: exchange <language>, corpus <language>.
Open (W2): read the starter's walk protocol and the section of this step; read the work file — entry
answers, closed steps, ledgers; read what the workspace already declares for this step's subject and
write only the difference. Reopen nothing closed without saying so.
<body of the step>
Ask (W3): put every question to me as a table of alternatives, each with what it commits to, and wait
for my answer.
Count (W4): print the command beside every figure.
Pace (W1): write each sub-result to the work file as it is reached, and offer me a stopping point there
when the step runs long.
Close (W7), in this order: gate; files created, modified, deleted, and which I should re-read; defects
appended to the defects file; cost — all four in the work file; then ask me to confirm that every point
is settled, and offer me a schema review before the next step (W9). Emit the next prompt only after my
confirmation. Name no step, flow or starter in the corpus (W6).
```

### W9: The Schema Is Reviewed at Fixed Moments, Not When Someone Thinks of It

Each step adds to the schema and sees only its own lines. What a per-step reading cannot see — a falsifiable value
nothing attests, a settled ruling no field carries, a `DESC` none of its type's enum values satisfies, a declared
value no entity uses — is found only by reading the schema as a whole, and the later it is found the more entities
it costs. The review is therefore built into the walk at four moments:

| Moment                                  | Where                  | What is read                                                                                                  |
|-----------------------------------------|------------------------|---------------------------------------------------------------------------------------------------------------|
| End of every step that wrote a schema line | the gate (W7)       | `awawa show TYPE` on every type the step touched: the whole entry, not the lines added, against the rulings of the work file |
| Before the first entity                 | S7 / M8                | every declaration together, against the entry answers and every ruling                                        |
| After the first entities                | S9 / M8                | the schema against the entities it produced: what is used, what is not, what the prose keeps repeating        |
| Any step boundary                       | the confirmation (W7)  | offered by the step, decided by the user; run as the body of S7, and recorded in the work file as a review    |

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
on it ». A `REQUIRED` reference is met by any target, an archived one included: P4's third condition keeps the
threshold honest.

### P2: Fix the Reading Loop Before Choosing the Edges

**What to do**: Decide which commands a session runs — `status` to orient, `context` with `--depth` and `--skip` to
load a package, `refs` then `show` for incoming edges — and orient every edge so that `context` on the entity a
session starts from reaches what it needs. The entity a question starts from is what fixes the direction of the
fields. Every `context` in the loop names its depth: at the default depth 3 a package from a well-connected entity
spans the corpus, and `--depth 1` returns the entity and its direct targets.

**Why it matters**: A corpus whose edges were chosen for the writer is read entity by entity — `show` after `show`,
or the files opened directly — instead of in one `context` package. Every session then pays one call per entity. A
package that grows with the corpus costs every session that reads it, even when its call count stays the same.

**What the tool checks**: `context` expands outgoing references only; incoming ones are named in its footer, by
identity, under the name declared by `CONVERSE` — their content costs a second call. A question starting from the
*target* of an edge is therefore answered in two calls, and one starting from its *carrier* in one. A `CATEGORY` on
a field (e.g. `reasoning` on a rationale) lets a session leave it out with `--skip`, which removes the field itself,
not only its traversal. The footers still name what they leave out — every skipped target, every reference not
expanded — so a package's size is measured in lines or bytes, never inferred from the calls (S8).

### P3: Build the Planning Pivot First

**What to do**: Identify the type that carries a lifecycle and dependencies — usually a task, a phase or an epic,
with an identifier as name. Every other type points at it or declares its dependence on it. A workspace with several
areas may have one pivot per area.

**Why it matters**: A corpus holding only its pivot already answers « what is left to do? ». Every later type adds
to a corpus that is useful from its first session.

**What the tool checks**: With a `STATUS` ladder on the pivot and an ordering edge (`AFTER @TASK`), `status TASK`
lists the plan and `context @TASK.X` shows what it rests on and, in its footer, what blocks it. Each rung declares
its severity with `GATE warning|error|suppressed` in its `WHEN STATUS` block; a rung with no `GATE` only warns.

**What the choice commits to**: the type that carries a ladder, if any; the direction of the edges written from now
on (they point at the pivot or are declared from it); the type of the first entities written (S8). When the object
has no lifecycle (a game design, a configuration, a set of instructions), the pivot is the type most questions start
from (e.g. a rule): no ladder is written and the edges are those S3 already ruled, so the choice changes no schema
line — it is put to the user as a confirmation of S3, not as a decision (W3).

**Anchors and the ladder**: an anchor that names what is not built yet is `REQUIRED` only inside
`WHEN STATUS implemented` — the obligation `REQUIRED` there, its anchor `REQUIRED` under it — so an entity is written
at `draft` or `specified` with no anchor, and promoting it is the act that demands one (L006). An anchor that names a
file existing before its entity — a tracked document, a procedure, a configuration file — has no implemented rung to
wait for: it is `REQUIRED` at type level, on a type that needs no ladder. `[implementation: none]` applies to the
first kind only. The [reference skeleton](#reference-skeleton) shows both.

### P4: One Archive Mechanism, No History in the Corpus

**What to do**: Declare `FIELD STATUS active|archived` with `DEFAULT active` on `SCHEMA *`, a `WHEN STATUS active`
block carrying `GATE error`, and a `WHEN STATUS archived` block carrying `GATE suppressed` and a `REQUIRED`
`ARCHIVED_ON` date. A type with its own lifecycle redeclares `STATUS` with `archived` among its values; the
wildcard's `WHEN` block still applies to it. A type that must never be archived cannot say so by leaving `archived`
out of its enum: the wildcard's block still accepts `archived` on it in silence, so that rule is written in its `DESC`
and checked at the gate. An entity that stops binding is archived in the change that ends it; a ruling replaced on
the same subject is rewritten in place. No `superseded` status, no `SUPERSEDES`/`CLOSES` fields, no version suffixes
(`:v2`).

Three conditions guard the act of archiving, because the tool guards none of them:

- **The entity is clean before it is archived.** `GATE suppressed` silences every check on the entity — missing
  required fields, unknown references, dead anchors, malformed values — except the fields of the archive block
  itself. The change that archives runs `lint --strict` *before* writing `STATUS archived`; afterwards no command
  reports what was broken.
- **Nothing active still points at it for its content.** `context` on an active entity that cites an archived one
  prints a single `// suppressed:` line and none of the archived entity's fields: the reader loses the body in
  silence. The incoming count that `status TYPE` prints is the only side the tool reports; read it before archiving.
- **No active entity is left with only archived targets in a `REQUIRED` reference field.** A `REQUIRED` reference
  whose every target is archived still satisfies the requirement, so a threshold field (P1) is met by a suppressed
  entity and `lint --strict` stays clean. Before archiving X, `awawa refs @TYPE.X` lists its referrers; for each live
  one that reaches X through a `REQUIRED` field, another live target remains, or the referrer is repointed or archived
  in the same change.

**Why it matters**: History kept as entities grows with every change, and every `context` that reaches a dead entity
loads it. Version control already keeps the history; archiving costs two lines and keeps the corpus about what binds
today. Archiving is not an era marker: something old that the project still supports stays active.

**What the tool checks**: `context` does not expand archived entities and names them in its footer; references to
them stay valid. `status TYPE --where STATUS!=archived` lists the live ones, entities with `STATUS` unwritten
included; `--where STATUS==active` matches none of those. `lint --strict` refuses an archived entity without
`ARCHIVED_ON`, and refuses `ARCHIVED_ON` on an active one (L003).

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

### P6: Decide Whether Provenance Is Worth Recording, Then Type It From the First Schema

**What to do**: First rule, with the user, whether provenance serves this corpus — at S2, with the types, not later.
It serves when a reader will need to know where an entity came from and the corpus is the only place that says it: a
unit of change to cite, documents kept beside the corpus, external references. It does not when the project has no
unit of change, the documents the corpus replaces are deleted, and version control holds the history: record then
`[provenance: none]`, declare no `SOURCE` and no source type, and later steps take their `[provenance: none]` branch.
The cost to weigh is per entity: one `SOURCE` with its `REF` and its `DATE` is three lines on every entity, read by
every `context` that does not skip it.

If provenance is recorded: declare source types — for instance a project, a change (the unit of Question 4), a
document, a URL — and, on `SCHEMA *`, a `REPEATABLE` `FIELD SOURCE string` with a nested `FIELD REF reference`
marked `REQUIRED` and a nested `FIELD DATE date`. Every provenance is then an entity, and its date is data.

A `SOURCE` carries: the source document, the identifier inside it (a section, a rule number), the change, the date.
It never carries the process that wrote the entity (W6). An entity whose only origin is a session with the user
carries the date and a `REF` to the project, and no invented sentence.

**A document the corpus replaces cannot be an anchored source.** S10 deletes it, and every `SOURCE` citing it through
an `anchor` then fails L016, or has to be rewritten at disposal. Such a document is cited by its path as text and the
revision it was read at — a commit, a tag — which version control keeps resolvable after the deletion; only a
document the project keeps takes an `anchor`.

**Why it matters**: Provenance written as prose cannot be listed nor checked, and rots silently when a file moves or
an address changes; typing it later means rewriting every line. Where the schema offers no field for a fact — the
date — the fact goes into the sentence, and so does whatever else the writer had at hand.

**What the tool checks**: L006 on `SOURCE › REF` lists every source still in prose; L004 an unknown source entity;
L007 a malformed address, revision or date (with a `SHAPE`); `refs @DOCUMENT.X` lists what that source produced.

### P7: Type Everything That Can Be Typed, When It Is Written

**What to do**: Free text is limited to what cannot be a reference, an enum, a shape or a number. A date, an address,
a version, an identifier is a `SHAPE`; a code location is an `anchor` field (`"path::literal"`); an entity name
carries a `NAME` shape; a string a command consumes (a key passed to a query tool) is a `SHAPE`, because a prose
value breaks the reading loop in silence. A field legal in one state only is declared inside that state's `WHEN`
block **and nowhere else** — repeated in each block that admits it, which the tool accepts.

A `REQUIRED` text field takes a `SHAPE` that refuses the empty string — `MATCH "[^\s].*"`, the `text` shape of the
[reference skeleton](#reference-skeleton). `REQUIRED` alone accepts `""`; the shape refuses `""` and a value opening on
a blank (L007) and still accepts `+` continuations.

A reference slot takes one target type (L020). A field sketched as « an area or a rule » is two fields, or a type
both targets become; S2 settles it before S3 draws the edges.

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
never forbids — a field declared at type level stays legal in every state, whatever a block requires. A type-level
`FIELD` that redeclares a field of `SCHEMA *` (to make `DESC` `REQUIRED` on one type, say) is accepted without L013
and replaces the wildcard's declaration for that type: probe it (P10), since the schema-authoring guide documents
shadowing for `GATE` and `NAME` only.

### P8: Schema in One File, One File Per Type, Append at the End, One Language

**What to do**: Every `SCHEMA`, `FIELDSET` and `SHAPE` in `_schema.awawa`; one data file per type, named by the type
in lower-case plural (`decisions.awawa`, `tasks.awawa`); if it makes sense to group types (example: source types),
group them in one file (example: `sources.awawa`). A new entity is appended at the end of its file. One language for
the whole corpus, entity names included — the corpus language of Question 1.

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
P4's three conditions: it lints before it archives, it archives or deletes only what the incoming count of
`status TYPE` shows nothing active points at, and it leaves no live entity with only archived targets in a `REQUIRED`
field. Its report is the body of the change it opens.

**Why it matters**: Without it, P4's archive becomes a growing history. Optional for a small or rarely touched
corpus. It disposes of entities only: the documents the corpus replaced are the business of S10.

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
  `SHAPE` is tried on its boundary values — for a date, a month 13 and a day 32. Conforming entities alone prove
  nothing: a condition that never fires lints as clean as one that holds.
- **Record one of three outcomes per schema line**: *imposed* (the tool required it), *refused* (the tool rejected
  the violation), *accepted in silence* (the violation passed). The third is a finding, never a pass: it becomes a
  schema change, a written rule, or a knowingly taken risk.
- **Probe the step's own declarations**, not the tool's documented behaviour again. The generic probes — a `SOURCE`
  with no `REF`, an anchor to a missing literal, a value missing its shape — are for the first step that meets each
  mechanism.
- Run `awawa new`, `awawa lint --strict`, `awawa status`, and `awawa context --depth 1` where an edge is at stake. A
  probe directory that lacks the project's files reports every anchor as L016: count findings net of that baseline.

**Why it matters**: A schema line that reads right can behave otherwise, and once entities depend on it, changing it
costs a migration. Examples on 2.7.0: an empty required string passing `--strict`, a date shape accepting month 13, a
reference written as a `DEFAULT` counting among the incoming edges of its target, a field meant for one state staying
legal in all of them because it was declared at type level. The same holds for what a document asserts about the
tool, this one included: version 1 stated three behaviours that a probe refuted or narrowed, and version 2 shipped a
date shape its own P10 would have refused.

**What the tool checks**: Each probe documents it. A tool defect found goes to the defects file if Question 6 was
accepted, never into the project's corpus.

P10 is not a step: it runs inside every step that writes a schema line. Probe directories are deleted at the end of
the step.

---

## Length of the Walk

The walk is long, and its length is not set by the size of the schema: each step opens by reading the protocol, the
work file and the ledgers, and closes on the gate and the confirmation, whatever it wrote.

| Walk measured                                               | Object                                            | Size                                            | Duration and cost                                                                                         |
|-------------------------------------------------------------|---------------------------------------------------|-------------------------------------------------|-----------------------------------------------------------------------------------------------------------|
| Version 1, Flow S                                            | a product specification joining a workspace       | 3 documents, 917 lines; 40 entities written     | 2 days, 12 sessions, 495 turns                                                                            |
| Version 2, Flow S                                            | a set of agent instructions, `[object: documents]` | 23 documents, 478 statements; 237 entities      | 2 days; the first-entities step over three sessions; the audit about 45 tool calls and 11 sub-agents; the disposal about 45 tool calls |

Put this table to the user before the first step, with the size of their object (S1 counts it), and let them choose:

- **Full walk** — ten steps, one or two sessions each, as below. For an object with a lifecycle, several areas, or
  anchors into code.
- **Compact walk** — six sessions: S1; S2 and S3 together; S4, S5 and S6 together; S7 and S8 together; S9; S10.
  Proposed for an object with no lifecycle, one area and a schema of five types or fewer. Merged steps keep every
  sub-result of their bodies and write one section each in the work file, but share one gate and one confirmation.
  Not walked yet: its first walk records what it cost.

In both, a sample may replace a full audit only where the step says so, and only while the sample's partial rate
stays under one row in ten (S9); above that, the audit is complete.

---

## Flow S: From Scratch

No corpus holds the object yet. Each principle is designed, probed (P10), then written. Nothing can be measured until
entities exist, so the measures of P1 and P2 are taken on the first entities, in S8.

| Step | Principles  | Result                                                                  |
|------|-------------|-------------------------------------------------------------------------|
| S1   | —           | Inventory of the knowledge, its sources sorted and counted, the session questions |
| S2   | P1, P5, P6  | Types sketched, each with its threshold field; provenance ruled; retypings ledgered |
| S3   | P2          | Commands per question, edge directions, categories                      |
| S4   | P7, P8      | Corpus directory and typed schema skeleton                              |
| S5   | P3, P4      | Pivot type and archive mechanism                                        |
| S6   | P6, P7      | Source types, shapes, conditional fields completed                      |
| S7   | P5          | The schema read back as a whole, before any entity depends on it        |
| S8   | P1, P2      | First entities, the two measures, the coverage table                    |
| S9   | P1, P5, P6  | The schema and the coverage audited against the entities written        |
| S10  | P9          | Replaced sources disposed of; cleanup pass designed or skipped          |

Each body below goes inside the [prompt frame](#w8-the-prompt-frame).

### S1: Inventory the Knowledge

```
- List where the project's knowledge lives today: README, architecture decision records, agent
  instructions, issue tracker, wiki, code comments, the user.
  [object: documents] The documents are the object: list them all, with their line and statement
  counts, and ask me what the corpus should change about them — what is read too often, what is
  obsolete, what is said twice, what no one follows — rather than where the knowledge lives.
  [implementation: none] and not [object: documents]: the places are the user, a brief,
  sketches, issues: interview the user, and take the statements they give as the examples.
- For each place, list the kinds of fact it holds (a ruling, a task, an open question, a
  constraint, a glossary term…) with one real example quoted and its location.
- Sort every document: replaced (the corpus will empty it), kept, or partly kept. For a kept or
  partly kept document, say what of it is deferred, to what, and what is not: its prose is
  classified now — deferring the tables of a document is not deferring the document.
- For each document to be replaced, count its statements (W5 definition) with a command, and
  list the identifiers it defines (rule numbers, codes) and its section titles: S10 searches for
  all three.
- Open the sources-read ledger (W5) with everything read, at its revision.
- Propose the five questions a working session most often asks about the object (e.g. "what is
  left to do for X?", "why was Y chosen?", "what constrains Z?"), each with the entity it would
  start from. Put them to me as a table; they are arbitrated, not printed.
- [joins] List what the workspace already declares: types, field and CONVERSE names, shapes,
  source types, the archive mechanism, the pivot.
- Put the length table of the starter to me with the counts above, and have me choose the full
  or the compact walk.
- Do not design any type yet.
Record: the inventory table (place, kinds of fact, example), the document sorting table with its
counts, identifiers and section titles, the five arbitrated questions, the walk chosen.
```

### S2: Sketch the Types, Their Thresholds and the Provenance (P1, P5, P6)

```
- Group the kinds of fact from S1 into candidate types. [joins] Reuse a declared type where the
  shape fits; a new type must not reuse a reserved name.
- For each type, write one sentence: "Record a [TYPE] only if [CONDITION]", and the REQUIRED
  field that enforces the condition (P1).
- List each type's REQUIRED fields; merge any two types whose REQUIRED sets are identical, with a
  discriminant field instead (P5). For each discriminant: the criterion that decides between its
  values, and the type's DESC run against each value, one row per value.
- For each reference field sketched: one target type. A field with two candidate target types is
  split, or the targets share a type (P7, L020).
- Rule provenance with me (P6): does it serve this corpus? State the cost per entity. The answer
  is [provenance: recorded] or [provenance: none], and S6 reads it.
- For each S1 example, name the type it would become, or "not recorded" and why.
- If a ruling retypes or removes existing entities: open the migration ledger (W5) now, with the
  entities, their incoming edges (awawa refs per entity), the schema fields targeting the type,
  the files, and the mentions outside the corpus (agent instructions, code comments). Name the
  step that will perform it.
Record: the types, thresholds, REQUIRED fields, merges, discriminant criteria, the reference
fields with their one target, the provenance ruling, the S1 examples classified, the ledger if
opened.
```

### S3: Design the Reading Loop (P2)

```
- For each S1 question, write the commands that answer it: status TYPE [--where FIELD==VALUE],
  context @TYPE.X --depth N [--skip CATEGORY], refs @TYPE.X. Every context names its depth. A
  question the corpus should not answer (a value held in a data file) gets its own command and
  no entity.
- For each reference field, decide which entity carries it so that context on the entity the
  question starts from reaches the answer; the reverse direction is never written, it gets a
  CONVERSE name. Remember that context expands outgoing edges and only names incoming ones.
- Mark the fields a typical session does not need (reasoning, provenance, attestation) with a
  CATEGORY.
- [joins] List every new field and CONVERSE name beside the names the workspace reserves; the
  collision check (L013) is run in S4, not asserted here.
- Target: one context call per question, not one show per entity; and a package whose size in
  lines is written down, so S8 can compare.
Record: the question → commands → calls table, the reference fields with carrier, target,
CONVERSE name and the reason for the direction, the categories.
```

### S4: Create the Typed Corpus Skeleton (P7, P8, P10)

```
- Choose the corpus directory with me (e.g. docs/spec/ or spec/).
- [corpus: none] Create _schema.awawa: the shapes date and text, SCHEMA * (DESC, RATIONALE with
  CATEGORY reasoning), then one SCHEMA entry per S2 type with its DESC and REQUIRED fields, then
  the S3 reference fields with their CONVERSE names.
  [joins] Extend the workspace's schema file; never create a second SCHEMA *. If the schema file
  sits inside the first area, propose moving it above both areas, and count first what cites its
  path (anchors, instructions, scripts). The new area holds data files only.
- Type every field as it is written (P7): shape, enum, anchor, reference; a REQUIRED text field
  takes the text shape; a field legal in one state only goes inside that state's WHEN block and
  nowhere else. Every DESC a short lower-case fragment, written as the type's admission test.
- For every REQUIRED anchor, say which kind it is (P3): a file that exists before its entity
  (a tracked document, a procedure) — REQUIRED at type level, and a file tracked by version
  control satisfies it today; or what is not built yet — REQUIRED only at the rung where it can
  hold, or a task is recorded now for what is missing. S8 reads this answer instead of
  discovering it.
- A type-level FIELD redeclaring a field of SCHEMA * is probed before it is kept (P7).
- Create one empty data file per type, lower-case plural; sources.awawa if provenance is
  recorded and no source file exists.
- Probe first (P10): in a copy of the corpus the schema enters, two entities per declaration,
  the three outcomes per schema line, the boundary values of every SHAPE; awawa new TYPE X for
  each type. Fix the schema until the probe behaves as intended.
Record: the file list, the schema added, the probe table, the anchor answers.
```

### S5: Add the Pivot and the Archive Mechanism (P3, P4, P10)

```
- Put the pivot to me with what the choice commits to (P3): the type carrying a ladder, the
  direction of later edges, the first entities written. Price it on what context --depth 1
  returns from each candidate. When no candidate has a lifecycle, say that the choice changes
  no schema line and ask it as a confirmation of S3. [joins] One pivot per area is legitimate.
  If it has a lifecycle: a STATUS ladder with a GATE per rung, REQUIRED or with a DEFAULT, and
  an ordering reference field (e.g. AFTER @TASK) with its CONVERSE name. Decide what
  "implemented" requires (an anchor under each obligation, inside WHEN STATUS implemented).
  [implementation: none] The ladder is mandatory wherever an anchor names what is not built:
  draft and specified carry no such anchor.
- [corpus: none] On SCHEMA *: FIELD STATUS active|archived, DEFAULT active; WHEN STATUS active
  with GATE error; WHEN STATUS archived with GATE suppressed and FIELD ARCHIVED_ON date REQUIRED.
  [joins] The mechanism probably stands: probe it on the new types and add only what the probe
  shows missing — possibly nothing.
- Rule with me how the archive is used, not only how it is declared: what "stops binding" means
  for each type, as distinct from "is old"; and which types are never archived (P4: written in
  their DESC, since a narrowed enum does not refuse archived).
- Probe (P10): archive without ARCHIVED_ON (expect an error), with it (expect clean),
  ARCHIVED_ON on an active entity (expect L003); an archived entity violating a REQUIRED beside
  its active twin (expect silence on the archived one: P4's first condition); context on an
  active entity citing an archived one (expect a suppressed line: P4's second condition); a
  live entity whose REQUIRED reference names only an archived target (expect silence: P4's
  third condition).
Record: the pivot and why, the schema additions, the archive rulings, the probe table.
```

### S6: Type the Sources and Complete the Fields (P6, P7, P10)

```
- [provenance: none] Skip the source types: record the S2 ruling in one line and go to the
  string-field table.
- For each place of S1 a fact can come from, name its source type and the shape of its
  identifier (a document path, a URL, a change number, a release version). A document the corpus
  replaces is cited by its path as text and a revision, never by an anchor (P6). [joins] Reuse
  the declared source types; add a type only for a place none of them fits.
- [corpus: none] On SCHEMA *: FIELD SOURCE string REPEATABLE with CATEGORY provenance, nested
  FIELD REF reference REQUIRED, nested FIELD DATE date.
- State what a SOURCE carries in this project — document, identifier inside it, change, date —
  and that it never names the walk (W6).
- Second pass of P7 on what S4 wrote: for each remaining string field, a table — field, verdict
  (string | text | SHAPE | anchor | enum | moved into a WHEN block), reason. A string a command
  consumes gets a SHAPE.
- Check that every anchor planned names a file version control tracks.
- Probe (P10): one probe per declaration this step writes or moves, conforming and violating,
  boundary values for each new SHAPE. The generic probes (a SOURCE with no REF, an anchor to a
  missing literal, a value missing its shape) only if no earlier step ran them.
Record: the source types or the provenance ruling, the string-field table, the moved fields, the
probe table.
```

### S7: Read the Schema Back as a Whole (P5, P10)

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
- For each type redeclaring a wildcard field or narrowing the wildcard's STATUS: is the effect
  the one probed (P4, P7)?
- Probe whatever the review would change (P10), put each point to me as a table row (point,
  proposed ruling, what it commits to, probe), and write only what I rule. List also what was
  read and left as is, with the reason.
Record: the verdict, the rulings with their probes, the points left as is.
```

### S8: Write the First Entities, Measure, Prove the Coverage

```
- Read the S4 anchor answers: write no entity whose REQUIRED anchor cannot resolve today.
- Perform the migration ledger (W5) if one is open: retype, repoint every incoming edge,
  retarget the schema fields, delete the old SCHEMA entry and file, fix the mentions outside the
  corpus; run awawa refs per entity before its type disappears.
- Write the S1 examples classified in S2 as entities, using awawa new TYPE Name for each
  skeleton; every provenance as a SOURCE per P6, unless [provenance: none].
  [implementation: none] The entities come from the user's statements or from the replaced
  documents, at the first rungs of the ladder, with no anchor to what is not built.
- Measure P1: count the entities written that the threshold should have refused. Target 0;
  otherwise tighten the REQUIRED field or drop the entity.
- Measure P2: answer each S1 question with the S3 commands; count the calls per question, and
  the lines and bytes of each package (| wc -l, | wc -c). More calls than planned: revisit the
  edge direction. A package that grew as types were filled: revisit the depth, the CATEGORY
  marks, the edges into hub entities. Re-take this measure at each later step that adds types
  or entities.
- Open the coverage table (W5): one row per statement of each document S1 sorted as replaced —
  the statement, then the entity that states it, the ruling that drops it, or the task that will
  carry it. Check each row against the entity text as the entity is written: a reason, a list
  element, an example or a clause the entity lacks makes the row partial. Print the command that
  counts the statements beside the count. For each kept or partly kept document, classify its
  prose statement by statement as well: candidates found there are entities to write or tasks to
  record, not a later step's surprise.
- Add to the project's agent instructions the corpus path and the S3 reading loop, so the next
  session reads the corpus with the tool rather than as files.
Record: the entity counts per type and per enum value, the two measures in calls and in lines,
the coverage table with its partial rows, the ledger state, the instruction lines added.
```

### S9: Audit the Schema and the Coverage Against the Entities (P1, P5, P6)

```
- No command prints the field values of every entity of a type. Build the dump once, by a
  script: awawa status TYPE --json for the names, then awawa show @TYPE.X --json per entity —
  one call per entity (220 entities, 220 calls). State its cost in the work file; every audit
  below reads the dump, not the corpus again.
- Per type and per value of every discriminating enum: the count of entities (awawa status TYPE
  --where FIELD==VALUE; for a defaulted STATUS, --where STATUS!=<other value>). A value at zero
  is ruled on: removed, or kept knowingly with the reason.
- Per type: run its DESC, as the admission test, against the entities written — all of them, or
  a sample whose size is stated, at least one per enum value. An entity its type's DESC does
  not admit is a retyping (migration ledger) or a DESC to correct; say which.
- Per REQUIRED field: read the values actually written. The same sentence everywhere, or a
  placeholder, is a threshold that does not bite (P1).
- Per optional field never written, and per sentence pattern the prose fields keep repeating:
  a field to remove, or a field waiting to be declared.
- [provenance: recorded] Per SOURCE written: it carries what P6 lists, its date is in DATE, and
  it names no process.
- Coverage audit: re-count the statements of each replaced document with the command, and check
  covered rows against the text of the entity they name — does the entity state the statement,
  or only share its section? Start with a stated sample of at least 20 rows or a tenth of them;
  if more than one sampled row in ten is partial, the loss is systematic and the audit covers
  every row.
- Put each finding to me as a table row (finding, proposed ruling, what it commits to, probe);
  probe what would change the schema (P10); write only what I rule.
Record: the dump script and its cost, the counts per value, the findings and rulings, the sample
and its partial rate, the coverage corrections, what was read and left as is.
```

### S10: Dispose of the Replaced Sources, Decide the Cleanup Pass (P9)

```
- One row per document S1 sorted as replaced or partly kept: can it be deleted now, and what is
  still owed before it can? The answer is per document. A document is deleted only when every
  one of its coverage rows is stated.
- Before deleting a document, count what cites it outside the corpus — a search of the whole
  project for its name, for every identifier it defines (S1), and, for a partly kept document,
  for the titles of its sections that go: code comments, README, other documents, scripts, CI.
  lint --strict sees only the anchors the corpus carries. Repoint every citation in the same
  change; a code comment then cites the entity (@TYPE.Name): the type prefix makes a text search
  for it exact. awawa fmt --rename rewrites the corpus only and never a code comment, so a
  rename is followed by that search over the project, in the same change.
- If the corpus will grow or change often: design the cleanup script in pseudocode — candidates
  to archive (implemented pivots nothing waits on, entities whose end condition is met), each
  linted before it is archived, only if nothing active points at it, and leaving no live entity
  with only archived targets in a REQUIRED field; candidates to delete (archived past the
  retention delay chosen with me); awawa fmt, awawa lint --strict; a report as the body of the
  change. Otherwise: record that it is skipped and the corpus size at which to reconsider.
- Dispose of the work file with me: deleted, or kept outside the corpus. Delete the probe
  directories.
Record: the per-document table with its citation counts by name, identifier and section title,
the design or the skip decision; the corpus is then checked against the readiness criteria.
```

---

## Flow M: Migration

The corpus already holds the object. Every principle is first **measured** on the existing entities, and the corpus
is changed only where the measure shows a gap. Each step is one change, reviewed on its own, and its entity-level
effect is shown by `awawa diff <snapshot before> <corpus after>`. The walk protocol applies unchanged.

| Step | Principles | Result                                             |
|------|------------|----------------------------------------------------|
| M1   | —          | Baseline: snapshot, counts, findings, schema state |
| M2   | P1, P6     | Entities to drop or retype; threshold fields; provenance ruled |
| M3   | P2         | Reading cost measured; edges reoriented            |
| M4   | P3         | Pivot identified or built                          |
| M5   | P4         | History converted to archive                       |
| M6   | P5         | Types merged or split by shape                     |
| M7   | P6, P7     | Sources and fields typed                           |
| M8   | P5         | The schema read back, and audited on its entities  |
| M9   | P8         | Layout reorganized, tool output unchanged          |
| M10  | P9         | Cleanup pass designed or skipped                   |

### M1: Take the Baseline

```
- Copy the corpus to a snapshot directory outside the project; every later step diffs against a
  snapshot.
- Run awawa status: entity counts by type and STATUS, reference health. An entity whose STATUS
  comes from a DEFAULT is counted under (none).
- Run awawa lint --strict --summary: findings by rule.
- If the corpus has no SCHEMA entry: run awawa infer, keep its output as the draft schema in
  _schema.awawa, and re-run lint.
- List the types, their REQUIRED fields (awawa show TYPE), the files and which types each file
  holds, and any history mechanism in use (a superseded status, supersession fields, version
  suffixes).
- Open the sources-read ledger (W5). Put the length table of the starter to me.
Record: the baseline tables, each figure with its command.
```

### M2: Measure the Recording Threshold (P1)

```
- For each type, write "Record a [TYPE] only if [CONDITION]" and the REQUIRED field that would
  enforce it.
- Read every entity of the type with the tool (status TYPE, then show, or the S9 dump script)
  and classify it: meets the threshold / should be another type / should not have been recorded
  (about the awawa tool, a general rule living elsewhere, a narrative).
- Measure: the count per class. Put the drop list to me as a table and wait for my answer
  before deleting. Open the migration ledger (W5) with the retype list.
- Rule provenance with me (P6), with the count of SOURCE lines the corpus carries today.
- Probe (P10) the threshold fields, then add them; entities missing them are fixed or dropped in
  the same change.
Record: the thresholds, the counts, the confirmed drop and retype lists, the provenance ruling,
the lint result.
```

### M3: Measure the Reading Loop (P2)

```
- Collect the five questions sessions most often ask about the object (from the agent
  instructions, recent change descriptions, or me); put them to me as a table.
- Answer each with the tool, and count the calls — status, context --depth N, refs, show — and
  the lines of each package.
- For each question needing more than one context call: find the reference field whose direction
  forces the extra calls; propose its reversal and a CONVERSE name.
- List reference fields written on both ends (e.g. BLOCKS and BLOCKED_BY): the reverse one is
  removed, the tool derives it.
- Probe (P10) the reversed fields, then migrate the references in one change; re-count.
Record: the calls and lines per question before and after, the fields reoriented.
```

### M4: Identify the Pivot (P3)

```
- Name the type with a lifecycle and dependencies, or the type most M3 questions start from. If
  none exists and the object has work to plan, sketch one. Say what the choice commits to; with
  no lifecycle, ask it as a confirmation.
- Check: can status PIVOT answer "what is left to do?" and context @PIVOT.X show what blocks it?
  If not, name the missing field or edge. Check that every rung of the ladder declares its GATE.
- Probe (P10), then add the missing fields; migrate existing entities in the same change.
Record: the pivot, the gaps found, the fields added.
```

### M5: Convert History to Archive (P4)

```
- Probe (P10) the P4 mechanism on a copy of the corpus, its three conditions included.
- Add it to SCHEMA *; lifecycle types redeclare STATUS with archived among their values.
- Convert: a superseded entity with a successor on the same subject is deleted (version control
  keeps it) and the successor takes its name with awawa fmt --rename, so references land on the
  ruling in force; a superseded entity with no successor becomes archived with ARCHIVED_ON (the
  date of the change that ended it, from version control) — linted before it is archived, only
  once nothing active points at it, and leaving no live entity with only archived targets in a
  REQUIRED field; supersession fields are removed.
- Measure: entities with a history status or field before and after (target 0 after), and the
  context package size of the pivot before and after, in lines.
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
- [provenance: none] Remove the SOURCE lines and source types the M2 ruling drops, in one
  change, then go to the string fields.
- Find provenance written in prose (paths, links, change numbers, "decided in …") with status,
  show and a text search of the corpus: count it per kind.
- Declare the source types and the SOURCE › REF and SOURCE › DATE fields; create the source
  entities; attach a REF to every SOURCE; move every date out of the prose. Remove any mention
  of a process that wrote the entity (W6).
- For each string field holding dates, addresses, identifiers or code locations: declare the
  SHAPE or anchor and fix the values the lint then refuses (L007, L016). Give every REQUIRED
  text field the text shape. Move each field legal in one state only inside its WHEN block.
- Probe (P10) each declaration first.
Record: the counts of prose provenance before and after, the shapes added, the L007/L016 fixed.
```

### M8: Read the Schema Back as a Whole (P5, P10)

The entities already exist, so the two reviews of Flow S are one step here: the body of
[S7](#s7-read-the-schema-back-as-a-whole-p5-p10) on the migrated schema, then the body of
[S9](#s9-audit-the-schema-and-the-coverage-against-the-entities-p1-p5-p6) on the migrated entities, its coverage
audit left out when the migration replaced no document.

### M9: Reorganize the Layout (P8)

```
- Move the schema to _schema.awawa and each type's entities to its own file; order inside a file
  is kept.
- Proof of no semantic change: awawa diff <snapshot taken just before> <corpus> reports no
  entity change, and awawa status is identical before and after.
- Update every place that cited a corpus file path (agent instructions, scripts, CI), found by a
  search of the whole project, counted.
Record: the new layout, the diff and status evidence, the paths updated.
```

### M10: Decide the Cleanup Pass (P9)

Same body as [S10](#s10-dispose-of-the-replaced-sources-decide-the-cleanup-pass-p9). A migration usually replaces no
document: the step then says so in one line and goes to the cleanup pass.

---

## Readiness Criteria

- [ ] `awawa lint --strict` passes with zero findings, from the root the anchors resolve from.
- [ ] `awawa status` shows every type with entities, or its emptiness is intended; every declared enum value has
  entities, or its zero is ruled on.
- [ ] `awawa context @PIVOT.X --depth 1` on a live pivot returns the entity, what it rests on, and in its footer what
  points at it.
- [ ] `[provenance: recorded]` only: `awawa refs @SOURCE_TYPE.X` on a source entity lists what cites it.
  `[provenance: none]`: no `SOURCE` field and no source type is declared.
- [ ] Each of the session questions (S1 or M3) is answered in the number of calls its step planned, and the size of
  each package in lines is recorded.
- [ ] No entity would be refused by its type's threshold, and no live entity meets a `REQUIRED` reference with
  archived targets only.
- [ ] Every coverage row is stated, dropped or carried — none partial — and the migration ledger is closed.
- [ ] The schema was reviewed as a whole before the first entity and audited against the entities after them (W9),
  and every finding is ruled on.
- [ ] No document the corpus replaced still stands, or a recorded task names what is owed before it goes; nothing
  outside the corpus still cites a deleted document by its name, an identifier it defined or a section title.
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
source type for a kept document, a type anchored at type level, and a pivot whose ladder makes the anchor `REQUIRED`
at the implemented rung only. Every name is a proposal; under `[provenance: none]`, drop `SOURCE` and `DOCUMENT`.

```
SHAPE date
	DESC "a calendar day, YYYY-MM-DD"
	MATCH "\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])"

SHAPE text
	DESC "a statement that is not empty and does not open on a blank"
	MATCH "[^\s].*"

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
	DESC "a document the project keeps, a fact was read in"
	FIELD PATH anchor
		REQUIRED
		DESC "where the document is"

SCHEMA PROCEDURE
	DESC "a procedure an agent carries out, whose file exists before its entity"
	FIELD PATH anchor
		REQUIRED
		DESC "the tracked file of the procedure"

SCHEMA FEATURE
	DESC "a behaviour the product owes its user"
	FIELD STATUS draft|specified|implemented|archived
		REQUIRED
		DESC "draft: not ratified; specified: ratified; implemented: anchored in the code"
	FIELD SPEC text
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

Observed: a `DATE "18/09/2026"` and a `DATE 2026-13-45` are refused (L007); a `SPEC ""` is refused (L007); an
implemented `FEATURE` whose `SPEC` has no `IMPL` is refused (L006 on `FEATURE.SPEC`); a `SOURCE` with no `REF` is
refused (L006); an archived `FEATURE` whose `AFTER` names an entity that does not exist is **accepted in silence** —
P4's first condition.

---

## Tool Behaviours Worth Knowing (2.7.0)

Every row was probed on 2.7.0 with a conforming and a violating entity, and governs a choice above. Rows new in this
version were found by the second walk and re-probed on 2026-09-25, except « No command prints the field values », taken
from the walk. Re-probe on your version before relying on it.

| Behaviour                                                                                                         | Governs      |
|-------------------------------------------------------------------------------------------------------------------|--------------|
| An empty required string `""` passes `--strict`; a `SHAPE` `MATCH "[^\s].*"` on the field refuses it (L007)       | P7           |
| A `SHAPE` `\d{4}-\d{2}-\d{2}` accepts `2026-13-45`; ranges on month and day refuse it                             | P10, skeleton |
| A reference slot names one target type: `@A\|@B` is L020                                                          | P7, S2       |
| A type-level `FIELD` redeclaring a field of `SCHEMA *` is accepted without L013 and replaces the wildcard's declaration for that type | P7, S7 |
| A type narrowing `STATUS` to exclude `archived` still accepts `STATUS archived` in silence: the wildcard's `WHEN STATUS archived` block fires and its `GATE suppressed` silences the L007 | P4 |
| A `REQUIRED` reference whose only target is archived satisfies the requirement; `context` prints `// suppressed:` | P4, P1       |
| An entity whose `STATUS` comes from the `DEFAULT` is counted under `(none)` by `status` and matched by no `--where STATUS==<default>`, though its `WHEN STATUS <default>` block fires | P4, W7, M1 |
| `--where STATUS!=archived` keeps the entities whose `STATUS` is unwritten                                         | P4           |
| A `WHEN` block keyed on a reference (`WHEN VIA @TYPE.X`) fires on entities writing that reference, and on those omitting the field when its `DEFAULT` is that reference | P7           |
| A reference written as a `DEFAULT` or as a `WHEN` value is a reference site of the `SCHEMA` entry: it counts in the target's incoming edges (`referenced by @SCHEMA.X`); the entity omitting the field gets no edge | P4, P10 |
| `--where` selects on a field declared only inside a `WHEN` block, the wildcard's included, once one entity of the type writes it; before that it exits 2, « not a field of TYPE in this workspace » | P9           |
| A rung with no `GATE` warns; `--strict` promotes the warning to an error                                          | P3           |
| `GATE suppressed` silences every check on the entity except the fields of the archive block itself                | P4           |
| `context` on an active entity citing an archived one prints `// suppressed:` and none of its fields               | P4, P9       |
| `context` expands outgoing edges to depth 3 by default; `--depth 1` stops at the direct targets                   | P2, S3       |
| `context` names incoming edges in the footer by identity, `(root, N)` or `(rest, N)`                              | P2           |
| At `--depth 1`, the `// not expanded (depth):` footer names again every reference the body printed               | P2, S8       |
| `--skip CATEGORY` removes the fields themselves, nested ones included; the `// skipped:` footer names every skipped target | P2, S8 |
| No command prints the field values of every entity of a type: `status --json` gives identity, location and incoming counts | S9 |
| L025 refuses an entity mention inside any string field, an example included; `@TYPE.<name>` passes               | P7           |
| `WHEN` is monotonic: a field declared at type level stays legal in every state                                    | P7           |
| A field may be declared in several mutually exclusive `WHEN` blocks without L013                                  | P7           |
| A `WHEN` block keyed on a `REPEATABLE` field fires when its value is one among several                            | P5           |
| L016 tests that the file exists on disk; version control is never consulted                                       | P7           |
| `awawa new` prints the `REQUIRED` fields of a `WHEN` block and omits its `INCOMING` obligation                    | S7           |
| `fmt --rename` rewrites the declaration and the indexed reference sites of the corpus; a code comment is untouched | S10          |
| A probe directory without the project's files reports every anchor as L016                                        | P10          |
| Empty and comment-only data files are tolerated by `fmt` and `lint`                                               | P8           |
| `diff` reports nothing when an entity moves between files or directories of the workspace                         | P8, M9       |

---

## What Changed Since Version 2

Each change answers a defect found by walking version 2 (Flow S, `[object: documents]`, 2026-09-24 to 2026-09-25).

- **Identifiers follow reading order**: questions, steps and principles are numbered as they are met; the
  [table below](#identifiers-of-version-2) maps version 2.
- **The language is an entry question** (Question 1), carried by every prompt.
- **A set of documents can be the object** (Question 3, E): S1 inventories the documents and asks what the corpus
  should change about them.
- **A statement is defined** (W5) — list item, paragraph, table row — so counts compare across steps and walks.
- **A coverage row closes when the entity states the statement**, checked as the entity is written; a partial row is
  open, and a sample stops replacing the audit once one sampled row in ten is partial (S8, S9).
- **Provenance is ruled before it is typed** (P6, S2): `[provenance: none]` is a branch, with its cost per entity;
  a document the corpus replaces is cited by path and revision, never by an anchor.
- **Two kinds of anchor** (P3, S4): one to a file existing before its entity is required at type level; only one to
  what is not built waits for the implemented rung.
- **A question states what each answer commits to** (W3); the pivot with no lifecycle is a confirmation (P3, S5).
- **P4 has a third condition**: no live entity keeps a `REQUIRED` reference whose targets are all archived; a type
  that is never archived says so in its `DESC`, since narrowing its enum does not refuse `archived`.
- **The reading loop names its depth**, and P2 is measured in lines and bytes as well as calls (S3, S8).
- **The skeleton's date shape refuses month 13**, and a `text` shape refuses the empty required string.
- **S9 names the cost of its audit** and the dump script the tool makes necessary.
- **S10 searches for identifiers and section titles**, not only for the document's name.
- **The readiness criteria** read provenance conditionally and count packages in lines.
- **The walk's length is stated** with the two walks measured, and a compact walk of six sessions is offered; the
  close of a step writes its gate, files, defects and cost to the work file instead of reciting them, and a long step
  offers stopping points.
- **Ten tool behaviours added** to the table, nine of them re-probed on 2.7.0.

### Identifiers of Version 2

| Version 2   | Version 3   |
|-------------|-------------|
| Question 1–5 | Question 2–6 |
| S1–S6       | S1–S6       |
| S9          | S7          |
| S7          | S8          |
| S10         | S9          |
| S8          | S10         |
| M1–M7       | M1–M7       |
| M10         | M8          |
| M8          | M9          |
| M9          | M10         |
| P1–P10, W1–W9 | unchanged |

---

## Out of Scope

- **Tool defects and proposals**: recorded during the walk if the user accepted it (Question 6), kept outside the
  corpus for the awawa maintainers, never recorded as entities.
- **Out-of-corpus levers**: session instructions beyond the reading loop, response length, prompt design — the
  project's agent instructions and skills govern them.
