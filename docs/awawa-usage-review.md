# Review of the awawa usage report

An independent check of `awawa-usage-report.md` (T37 part A launch, 2026-09-12), done by a fresh
session against the transcripts of the piloting session and of the implementing agent, the corpus as
it stood before #62, the diff of #62, and the awawa 2.7.0 manual. **This file is not a second home
for project facts either**: it cites entities by name and measures the instrument.

Authors: `awawa-usage-report.md` was written by Claude Opus 5 (1M context), the model that piloted
the T37 launch and the session it assesses. This review was written by Claude Fable 5.1, in a
session with no memory of that launch.

## Verdict

The report is accurate on the facts but it is a self-assessment written by the session that
failed, thirty minutes after the fact. It overstates two of its findings and misses the three
structural problems: decisions isolated in the graph, an empty context package for packages, and
stale instructions living outside the corpus. awawa keeps its promise on integrity, not yet on
retrieval.

## 1. The report against the measurements

| Claim in the report | Check | Verdict |
|---|---|---|
| Ratifying the five recommendations was offered without opening the code | First question 2 min after launch, after 13 tool calls, no file under `packages/` read | Confirmed |
| The `SortDeMergedSaveValueObject` recommendation was "not implementable as written" | Implementable with a second serialization port. The decision records exactly that as its third `REJECTED` | Overstated: suboptimal, not impossible |
| The contradiction with T11 was "invisible to retrieval" | The question's `RATIONALE` names T11 in words. The session read it through `awawa show` and `sed` before its first question | Wrong: visible, not read. The missing `REF` is still the right fix |
| `BLOCKED_BY (root, 5)` overstated the block on part A | Exact, and still true after the merge: the footer still lists 5 questions, 4 of them `superseded` | Confirmed, and the defect is the tool's (section 3) |
| Two `IMPL` anchors retargeted thanks to L016 | Diff of #62: two moves, plus 9 anchors added of which 3 are directories | Confirmed |
| "80 recorded arbitrations readable in one call" | 80 decisions before #62, 11 KB of output, about 3k tokens | Confirmed, and cheap |
| Permission classifier refusal "External System Writes" | Present in the transcript at 11:36 local | Confirmed |
| Worktree base trap | The agent recreated its branch with `checkout -b` on the base | Confirmed |
| "lint has 22 rules" | The manual declares 25 `L0xx` identifiers | Unverifiable as stated, no consequence |
| "Four rulings before a line of code, proportionate but does not scale down" | See the cost table | Mistargeted: the corpus is 11 % of the PR's lines, the human arbitration is what does not scale |

Measured cost of the T37 part A launch:

| Item | Measure |
|---|---|
| Piloting session, active time | 61 min, of which 32 min of arbitration over 8 questions and 25 min writing the report |
| Piloting session, calls | 65 Bash, 26 awawa, 0 `awawa context` |
| Agent, duration | 28 min, 115 Bash, 22 awawa, 1 `context` |
| Tokens read from cache | 21.2 M pilot, 50.8 M agent |
| Tokens produced | 230k pilot, 60k agent |
| Corpus in #62 | 139 changed lines out of 1,294 |
| Corpus total | 129 entities, 2,282 lines, 141 KB for 17.6k lines of code |

The report was written in answer to "do you find this efficient?" by the session being judged. It
is honest about its conduct but grades itself favourably: eight "what held" rows against eight
findings, and not one measurement. A usage report must carry the figures above; they come out of the
transcript in one command.

## 2. Does awawa keep its promise, and how to use it better

| Promise | Kept? | Evidence on T37 |
|---|---|---|
| Reference and anchor integrity | Yes | L016 on two moves, L026 on the four closures, L025 at zero |
| Forcing the alternative | Yes | Required `REJECTED` made the second port get written, which exposed the recommendation |
| Finding what blocks | Yes, with a defect | The five questions in one footer, but no live / closed distinction |
| Read the package instead of the files | No | `context @PACKAGE.core_mapping` is 12 lines; the pilot read 9 corpus files, the agent 6 in full |
| Semantic consistency | No, by construction | The report says so; a mechanical substitute exists (section 3) |

The figure that explains the retrieval failure: **77 decisions out of 84 have no incoming edge**,
and the whole corpus carries 7 `REF`. A decision points at nothing it governs, so `context` on a
package or a task never brings back the applicable decisions. The only path is the list of 84 names,
which worked once by luck of naming.

Improvements to our usage, by return:

| # | Change | What it fixes |
|---|---|---|
| 1 | On `DECISION`, `FIELD APPLIES_TO reference` with `CONVERSE GOVERNED_BY`, pointing at the `PACKAGE` or `TASK` | The footer of `context @TASK.X` would list the decisions constraining it. Retrofit: 84 lines |
| 2 | On `OPEN_QUESTION`, `FIELD RECOMMENDATION string` with a required `REJECTED` and a nested `REF` | The report proposes it; `a trancher :`, `constat :` and `destination proposee :` are three more fields hidden in `DESC`, to declare or drop |
| 3 | Forbid by schema a directory `IMPL` anchor under `SPEC` | 19 anchors out of 111 are directories, never falsifiable by L016 |
| 4 | One task per pull request: split T37 now into a `:v2` for part B | The report declines the retrofit; it costs 15 lines, and part B otherwise inherits a false `BLOCKED_BY` |
| 5 | The pilot reads `context`, not `cat` | No `context` call in the piloting session; the doctrine is not followed because the package is empty (item 1) |

## 3. The tool, and the method around it

awawa improvements, checked against the manual:

| Defect | Observation | Proposal |
|---|---|---|
| The `BLOCKED_BY` footer ignores the referrers' `STATUS` | After #62, `BLOCKED_BY (root, 5)` while one question is live. The wave-launch rule "no live open question" therefore reads false | `BLOCKED_BY (root, 1 live, 4 superseded)`, or exclude `GATE suppressed` referrers |
| No semantic consistency | True, but a mechanical substitute exists | Rule: a `SPEC` of a non-`implemented` entity whose anchor intersects the anchor of an `implemented` `DECISION` with no `REF` between them warns. It would have flagged T37 against T11 |
| `context` does not expand referrers | The agent chained 5 `show` after its `context` | A `--with-referrers` option |
| `awawa lint --help` is an error | Both sessions tried it | Per-subcommand help |

Working method outside the tool, where the costliest frictions are:

- **Three homes for the base branch, two stale.** The corpus names it in a decision. The private
  `plan.md` points at a "Branches" section of a private `AGENTS.md` that no longer exists. The
  `awawa-pr-merged` command still asks to refresh the private clone "where the corpus lives", false
  since #61. Instructions under `~/.claude/commands` are read by no lint. Either strip every project
  fact from them, or add a check that confronts them with the corpus.
- **Arbitration is the bottleneck, not the corpus.** 32 user minutes and 8 questions for 4
  decisions, each labelled "(recommandation)" on its first option. The rule recorded in #63 is
  right. Its concrete cost is opening the task's `IMPL` anchors and grepping `awawa status DECISION`
  on the subject before each question, two minutes per question.
- **Ratify on the diff rather than on the text.** A stronger lever: a question whose recommendation
  carries a `REJECTED` and contradicts no decision could be launched with a `draft` `DECISION`,
  ratified in PR review with the code in hand. This contradicts the current wave-launch rule "the
  ruling is the user's, never improvised by an agent". It is a decision to take, not to improvise.
- **Style is read from the files.** The agent read six corpus files in full to imitate the writing,
  `awawa new` giving only the structure. A `docs/_example.awawa` or one model entity per type would
  save those reads.

If only three things get done: the `APPLIES_TO` field on decisions, the footer that tells live from
closed, and the purge of stale project facts from `awawa-pr-merged.md` and `plan.md`.
