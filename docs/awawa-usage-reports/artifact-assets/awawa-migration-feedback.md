*Feedback for the awawa dev team · awawa 2.7.0 · 2026-09-12*

# awawa Migration Feedback

What migrating a seven-package monorepo to an awawa corpus taught us over two days, and what would make the next project's start safer for an AI agent and for a human alike.

- **131** — entities, 12 files
- **4** — types, all process
- **148** — IMPL anchors
- **7** — remediation tasks

## 1. Two structural asks

### An onboarding questionnaire, run by the agent before any schema exists

A user who installs awawa does not know the tool yet. Today the agent reads the manual and invents a schema; the user discovers its consequences weeks later, when the ladder does not fit a type or a whole area of the project turns out to have no entity. The agent should ask a handful of plain questions and derive the schema from the answers. A proposed set, with no tool vocabulary in it:

> 1. In one sentence, what does this project do, and for whom?
>
> 2. Who will read the corpus: you, AI agents, a team? In which language?
>
> 3. What do you write down today, and where? Decisions, open questions, tasks, known issues, product rules, none of these?
>
> 4. Which things in your project would you want to list and cross-reference? Features, screens, rules, file formats, components, packages, data sources?
>
> 5. Should the corpus describe **what the software does**, or only **how you work on it**? Both?
>
> 6. When is something "done" for you: written, agreed, merged, deployed, verified?
>
> 7. What must never be deleted, only marked as replaced?
>
> 8. Which links to code or documents should the tool check for you?
>
> 9. Where does the project's existing knowledge live that should be migrated: files, a wiki, an AGENTS.md, issues?

From the answers the agent proposes the types, one ladder per type in the user's own words, the anchor fields and the file layout, then prints `awawa new` skeletons for confirmation before writing anything. This can ship as a command in the skills, or as a mandatory section of `agent-protocol.md`.

### Make the scope of a migration explicit: product versus process

The corpus that came out of this migration has four types, `DECISION`, `OPEN_QUESTION`, `TASK` and `PACKAGE`, all about how the work is done. The product itself — the save file format, the merge rules, the validation rules, the UI flows — has no entity type. It lives inside decisions and in a markdown document that the decisions anchor. Nothing in the tool or its documentation prompts the question of whether the software should be specified too, so a migration can end with only one half of a corpus and nobody noticing.

Question 5 above catches it at onboarding. For the documentation: state plainly that a corpus has two halves, the product (what it does) and the process (how it is worked on), and that a migration that takes only one is half a migration.

## 2. Migration context

The project is a seven-package Bun monorepo. Before awawa, its specification lived in four places of a private repository: a 300-line `AGENTS.md`, a `known-issues/` directory of seven cards, a `tasks/` directory of T*n* cards, and a `plans/plan.md`. The migration happened on 11 and 12 September 2026, first into a single `spec.awawa`, then split into one file per domain under `docs/`.

The corpus declares a `SCHEMA *` with the `draft / specified / implemented / superseded` ladder and two name shapes. A schema audit on 12 September produced seven remediation tasks, delivered together with the typing of tasks by `KIND`.

## 3. What went well

| Point | What we observed |
|---|---|
| The loop fits in `--help` | An agent that has never seen the project learns the protocol from the binary alone. The drop-in block for `AGENTS.md` was used as is and is enough to open a session. |
| Precise diagnostics | Every finding gives file, line, column and the rule name; L026 names the `WHEN` block that demands the edge and its `INCOMING` line. A strict lint over 131 entities and 148 anchors answers in under a second. |
| `new` mirrors the schema | The printed skeleton is the fastest way to see what a declaration actually requires. It revealed in one command that `SPEC` was required under `implemented` on a type where that makes no sense. |
| `status --where`, `refs`, `context` | "What blocks X" and "what replaced Y" are questions nobody maintains by hand any more. The `context` footer with `BLOCKED_BY` is the single most useful output for an agent. |
| `CONVERSE` and `INCOMING` | A relation written on one side, the reverse computed, a required incoming edge on a terminal value: the verifiable half of a discipline is verified. No regression observed. |
| Zero domain vocabulary | Renaming the ladder, adding a `KIND`, declaring a ladder of a type's own: all of it happened in the corpus, without waiting for the tool. That is the promise kept. |
| Idempotent `fmt`, `fmt --rename` | The canonical form keeps review diffs readable, and rebasing three parallel branches on the same files stays trivial. |
| The skills | `awawa` and `awawa-schema` loaded at session start saved re-reading the manual; the "habits" section is what an agent actually reads. |

## 4. What went wrong

Every row is a fact measured in the corpus or in a session, not an impression.

| Friction | What it cost | Cause |
|---|---|---|
| Migration scope never asked | A process-only corpus; the product is unspecified. | No onboarding step, no prompt in the docs. |
| Root narrower than the anchors | `awawa status docs` reports 148 L016 errors on a clean corpus. The help text warns about it; the wall of errors does not. | No heuristic: when every anchor fails on the same missing prefix, the message does not suggest the root. |
| Per-type ladder undocumented | Two days on a single ladder on `SCHEMA *`: `implemented` on a question, `superseded` meaning "closed", a finished task impossible to retire without a successor. It took a throwaway corpus to discover that `STATUS` can be declared per type. | The manual says "`STATUS` goes to `SCHEMA *`, because that is where severity gating reads"; the starter and the skills do the same. |
| `FIELDSET` refuses `WHEN` | A ladder shared by three types cannot be declared once with its `GATE` blocks: L023. | Language limit, undocumented. |
| No `NAME` under `WHEN` | A name prefix cannot depend on a field; the `KIND` ↔ prefix correspondence stays a discipline. | Language limit. |
| Directory anchors always resolve | 35 of 148 `IMPL` anchors point at a directory: `implemented` there means "anchored", so nothing. The corpus found out at audit time, not at lint time. | No rule tells a directory from a file. |
| `DESC` drift | 188 `DESC` for 80 decisions, up to four per entity, in full sentences: `DESC` became the body of the decision, against its own doctrine. | Nothing bounds a `REPEATABLE` or a value's length; the doctrine lives in the skills, not in the schema. |
| Free-text `SOURCE` | Four competing grammars in two days; no `--where` can extract a date or a change number from it. | The starter offers neither a date shape nor a dedicated field. |
| A `.awawa` directory is invisible | The walk skips dot-prefixed directories with no diagnostic. Found while choosing where the corpus would live. | No warning when a skipped directory contains `.awawa` files. |
| A reopened question passes lint | Setting a question back to open while leaving the decision that `CLOSES` it passes `lint --strict` without a word. | `INCOMING` requires an edge; nothing constrains the `STATUS` of a reference's target. |
| One file concentrates the conflicts | `spec.awawa` was touched by nearly every branch; the split by domain was a second migration. | The manual describes the multi-file shape late, as a note, and the starter is a single file. |
| Nothing for CI | The corpus has no gate in continuous integration: the binary comes from a local archive, with no release URL and no action. | No distribution story for a runner. |
| `fmt` rewraps strings | An edit script that matches text as written fails after `fmt`; one assertion broke in session. | Correct behaviour, but it needs saying: edit after `fmt`, never before. |
| `AGENTS.md` restates the corpus | One rule with three homes; the worktree section copies two decisions word for word. | Nothing says which facts stay in `AGENTS.md` and which go to the corpus. |

## 5. Proposed remediations

Ordered by what they unblock for a new project. The "where" column says whether the binary, the documentation, the starter or the skills change.

| Remediation | Where | Friction addressed | Effort |
|---|---|---|---|
| Onboarding questionnaire → draft schema → user confirms | skills + protocol | The schema is derived from the user's answers, not invented from the manual. Section 1. | medium |
| "Product and process" named as the two halves of a corpus | doc + starter | A migration cannot silently take only one half. Section 1. | low |
| A multi-file "software project" starter | starter | `_schema.awawa` holding `SCHEMA *`, one file per domain, product types beside process types, per-type ladder from day one, a `SHAPE date`, `RULED` and change-reference fields, `REF` nested under every prose field. A project starts from the shape that holds, not the one it will have to redo. | low |
| Document the per-type ladder, with an example | doc + skills | "`STATUS` goes to `SCHEMA *`" becomes "`STATUS` is declared where the ladder makes sense: per type, or in a `FIELDSET`; the `WHEN STATUS` blocks of `SCHEMA *` fire on any entity that writes the value". The `awawa-schema` skill shows a question on `draft / open / closed`. | low |
| A hint on a wall of L016 | binary | When most anchors fail and the root passed is not a repository root, one line: "*148 anchors miss under docs/; the workspace root is probably a parent — try `awawa lint .`*". | low |
| Tell a directory anchor apart | binary | A gated rule "anchor names a directory", or a slot option `anchor:file`. The corpus chooses; today it cannot even express it. | medium |
| A constraint on the target's `STATUS` | binary | Under a `FIELD CLOSES @OPEN_QUESTION`, one line `TARGET STATUS closed`: a decision that closes an open question is a finding. This is the half `INCOMING` cannot check. | medium |
| `WHEN` inside a `FIELDSET` | binary | A ladder and its `GATE` blocks are declared once and included. Otherwise, document the limit next to L023. | medium |
| `NAME` under `WHEN` | binary | The name shape depends on a field's value: one prefix per family becomes checkable. Failing that, say in the manual that the correspondence stays a discipline. | medium |
| Bound a `REPEATABLE` and a length | binary | `REPEATABLE 1..2` and `MAXLEN 120` on `DESC`: the fragment doctrine becomes a schema rule instead of a skill reminder. A drift from 80 to 188 shows at the first lint. | medium |
| Warn on a skipped directory | binary | The walk reports a dot-prefixed directory that contains `.awawa` files, on stderr, once. | low |
| A CI story | distribution | A release archive at a stable URL with a checksum, and a workflow recipe that pins `awawa --version` then runs `lint --strict` and `fmt --check`. Without it, the corpus's cleanliness depends on the session. | medium |
| A page on "what stays in AGENTS.md" | doc | The criterion: what must be known before the first command, and what is irreversible if forgotten. Everything else is an entity to cite, never to copy. | low |
| `--where` on the identity | binary | A filter on a name fragment, `--where NAME~=AWA`, avoids a redundant field in the simple cases. | low |
| Say that `fmt` rewraps | doc + skills | One line in the "Update" step: format first, match text afterwards; an external tool works on the canonical form. | trivial |

## 6. Starting clean: the first half hour

What an agent or a human discovering an awawa project should do, in order, and what neither `--help` nor the `AGENTS.md` block says in full today. Proposed for `agent-protocol.md` and for the starter.

1. **No schema yet?** Run the questionnaire of section 1 and confirm the draft schema with the user before writing a single entity.
2. **Find the root.** `git rev-parse --show-toplevel` must be the root the commands take; anchors resolve from there. A corpus under `docs/` is still run with `.`.
3. **Check the version.** `awawa --version`, against the one the project pins. A binary of another version has other rules.
4. **`awawa status .`** before anything else. The unresolved-reference count and the diagnostics line say whether the state is healthy; a wall of L016 says the root is wrong.
5. **Read the schema, not the data.** `awawa show SCHEMA .`, then one `show` per type: that is what an agent must know, and it is short.
6. **Read what is not settled.** `awawa status OPEN_QUESTION --where STATUS!=<terminal value> .`, with the value the type's schema declares, not an assumed one.
7. **Before touching X**: `context @TYPE.X --with-schema` and `lint --closure @TYPE.X`, and read the footer.
8. **Write with `new`, then `fmt`, then `lint --strict`.** Any text matching happens after `fmt`.
9. **Record before answering.** A ruling made in the conversation that is not an entity will not exist in the next session; that is the agent-protocol's test, and it is right.

> **For a human discovering the tool:** the manual is long and normative. What is missing is a one-screen page, "the corpus in ten minutes", with a fifteen-entity corpus and the five commands of the loop, placed before §3 of the manual.

## 7. Recurring points and design calls for the tool

Four questions came back at every schema decision taken here. They deserve an answer in the design, not only in one corpus.

- **Who decides the schema, and when?** Left to the agent, the schema mirrors the manual's example and the migration mirrors whatever files existed. Left to a questionnaire, it mirrors the project. The second is the one that survives its first month.
- **Where does discipline end and the schema begin?** The `DESC` fragment, the prefix ↔ field correspondence, the reopened question: three rules the corpus cannot express. Either the language gains `MAXLEN`, `NAME` under `WHEN` and `TARGET STATUS`, or the manual lists explicitly what will remain a discipline, so people stop looking for it.
- **Is a ladder per type the norm or the exception?** Everything in the documentation pushes toward `SCHEMA *`, and experience says the opposite as soon as a type is not a thing one implements. The starter should settle it in favour of the per-type ladder.
- **What is the anchor's contract?** "Resolves" is not "verifies". A project that reads `implemented` as proof is mistaken, and nothing in the tool warns it. A rule on directories and one sentence in the manual, "`implemented` means anchored, not verified", shrink the misunderstanding.

---

*Written on awawa 2.7.0. The figures come from `awawa status .`, `awawa lint --strict .` and three throwaway corpora built to test the per-type ladder.*
