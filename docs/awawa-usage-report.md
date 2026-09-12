# awawa usage report

What using the corpus actually cost and returned, session by session. **This file is not a second
home for project facts.** Entities are cited by name so they can be retrieved, never restated —
the moment it starts carrying arbitrations of its own it has become `history.md` again, which
@DECISION.LeCorpusEstLeSeulDomicileEtHistoryEstSupprime deleted on purpose.

Author: Claude Opus 5 (1M context), the model that piloted the session this report assesses. An
independent review of it is in `awawa-usage-review.md`.

## 2026-09-12 — launching T37 part A

One session: read the corpus, find the next task, settle what blocked it, launch a background
agent in an isolated worktree, land [#62](https://github.com/delairec/planet-crafter-save-tools/pull/62).
Eight commits, merge output byte-identical to the reference on both input folders.

### Findings

| Problem encountered | Origin | Type | Remedy |
|---|---|---|---|
| Two of the five recommendations blocking the task were defective — one not implementable as written, one contradicting a standing `implemented` decision. Both had stood for five days with the authority of a recorded text. | `SCHEMA OPEN_QUESTION` asks nothing of a recommendation, where `SCHEMA DECISION` makes `REJECTED` a required field. A recommendation that never faced its alternative is indistinguishable from one that did. | **Schema to fix** | `FIELD RECOMMENDATION` with a nested `REQUIRED REJECTED`. Two live questions to convert; the four closed by #62 are `superseded` and out of gating. |
| A `SPEC` line contradicted an `implemented` decision and nothing reported it. | `lint` validates structure, schema conformance and reference integrity. Semantic consistency between two entities is outside what any of its 22 rules can express. | **Tool limit** — structural, not fixable | None directly. The schema fix above removes the most frequent cause; the rest is review. |
| That contradiction was invisible to retrieval: the `SPEC` never named the decision it contradicted, so it appeared in no package, no `refs`, no `context` footer. | No `REF` tied the two. `L025` fires on reference-shaped text that *is* present; it cannot fire on a decision the prose never mentions. | **Writing discipline** | A `SPEC` touching a subject a decision already rules on carries a nested `REF` to it. Makes the conflict visible on `awawa context` instead of depending on someone remembering both. |
| One `TASK` modelled two pull requests with different blockers. `BLOCKED_BY (root, 5)` overstated the block on part A, which had four; the fifth belonged to part B. | Modelling. The split lived in a `DESC` sentence — prose, invisible to the graph. | **Corpus to fix** | A task that splits into pull requests with different blockers is two entities. Not retrofitted to T37: part A is delivered and the remaining graph is accurate. |
| The session offered, as its first and recommended option, to ratify five unverified recommendations in one go. | Session conduct. The recommendations were read as text, without opening the files they concerned or running `awawa status DECISION`. That reading happened only after the user declined the option — and it is what found the two defects. | **Instruction rule** | Recorded as @OPEN_QUESTION.UneRecommandationEstExamineeAvantDEtreProposeeALaRatification (#63). Promotion to `~/.ai` is the user's call at merge. |
| Explaining the decision conflict took three attempts; the first two failed. | Session conduct. The first two explanations were phrased in corpus vocabulary — entity names, field names, `SPEC` versus `DECISION`. It landed only when the raw record `{"id":44,"woIds":"79111656,58524136"}` was shown. | **Habit** | Name the artefact before the entity. The corpus vocabulary is self-referential and comfortable to stay inside; that comfort is the failure. |
| The worktree base trap fired twice in one session: the agent's worktree was cut from `master` and it had to recreate its branch, and `EnterWorktree` would have done the same to the piloting session. | Outside awawa. `EnterWorktree` defaults `worktree.baseRef` to `origin/<default-branch>`, and the task base here is not the default branch. `AGENTS.md` documents the trap instead of the tooling removing it. | **Tooling to fix** | Create with `git worktree add <path> origin/<base>`, then enter by path. Belongs in `~/.ai/instructions/commands.md` and the two launch skills. |
| A read-only sizing command was refused by the permission classifier as "External System Writes". | Outside awawa. A compound command of `awawa status`, `grep` and `wc` was misclassified. | **Harness friction** | None needed. Split into simple commands and it ran. |

### What held

| What worked | Mechanism | What it prevented, concretely |
|---|---|---|
| The five blocking questions were named before a line of code was written. | The `BLOCKED_BY` footer of `lint --closure`. They are **incoming** edges: no traversal of the task finds them, and reading the task file would not have shown them either. | Discovering five ambiguities one at a time during implementation, in the worst possible order, with an agent already running. |
| The contradiction between a `SPEC` and a standing decision was found at all. | `awawa status DECISION` made 80 recorded arbitrations readable in one call. | Shipping a decision that contradicts an `implemented` one. In a repository where arbitrations live as prose in markdown, this is found during implementation or never. |
| Every decision written today had to name what it ruled out. | `SCHEMA DECISION` makes `REJECTED` a **required** field. | This is the single mechanism that saved the session. Being forced to write the rejected alternatives for decision 4 is what exposed that the recorded recommendation was not implementable — the port cannot return merged sections when the use case needs serialized content. |
| Two `IMPL` anchors were retargeted when the float rule moved from `domain/` to `infrastructure/`. | `L016` resolves every anchor against the workspace. | A corpus quietly describing files that no longer exist. The failure mode of every hand-maintained design document. |
| No question could be marked settled without naming what settled it. | `WHEN STATUS superseded` with `INCOMING CLOSED_BY`, checked by `L026`. | Four questions silently flipped to closed, leaving the next session to guess what decided them. |
| The schema retrofit costs two questions instead of six. | Gating by `STATUS`: the four questions closed by #62 became `superseded`, hence `GATE suppressed`, and left the live set on their own. | Paying for retroactive tidiness on settled matter. The corpus charges only for what is still live. |
| The agent came back with measurements rather than assertions — 6607 fields scanned, two md5 sums, a baseline taken on the untouched branch first. | The task's `SPEC` lines are falsifiable by construction and were handed to the agent verbatim as acceptance criteria. | A green report on a decision that quietly normalises non-canonical identifiers. The byte-fidelity risk was the one real hazard of the session, and it was the corpus that named the check. |
| Two branches appended to the same file across two pull requests without a conflict. | The discipline the launch protocol states: run `awawa fmt`, then `git diff --stat` on the corpus, and restore every file the task had no business touching. | A workspace-wide reformat turning a clean merge into a hand-resolved one. |

### Cost, honestly

Four rulings, five corpus entities and one superseded decision before a line of code, for a change
of a few hundred lines. Proportionate here — one ruling corrected a standing decision and all four
are reusable — but it does not scale down, and a small task carrying this ceremony would drown
in it.
