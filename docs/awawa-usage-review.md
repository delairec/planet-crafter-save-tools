# Review of the awawa usage report

An independent check of `awawa-usage-report.md` (T37 part A launch, 2026-09-12), done by a fresh
session against the transcripts of the piloting session and of the implementing agent, the corpus as
it stood before #62, the diff of #62, and the awawa 2.7.0 manual. **This file is not a second home
for project facts either**: it cites entities by name and measures the instrument.

Authors: `awawa-usage-report.md` was written by Claude Opus 5 (1M context), the model that piloted
the T37 launch and the session it assesses. This review was written by Claude Fable 5.1, in a
session with no memory of that launch.

Two verdicts, kept apart: what belongs to us (our method, our corpus, our conduct) and what belongs
to the tool. Each is split into what went well, what went wrong, and the remediations. The figures
and the claim-by-claim check of the report are in the appendix.

## Verdict in two lines

**Ours**: the method delivered a correct PR in one session, but the corpus is written as a list
of isolated texts rather than a graph, the sessions read files instead of packages, and the
instructions around the corpus have fallen out of date since it moved.

**The tool's**: awawa keeps its promise on integrity (anchors, references, forced alternatives)
and does not yet keep it on retrieval (the footer does not tell live from closed, a package's
context is empty, referrers are named but not expanded).

## Part A — Us: method, corpus, conduct

### What went well

| What | Evidence |
|---|---|
| The five blocking questions were known before a line of code | One `lint --closure` footer, read by the pilot within two minutes |
| Every ruling faced its alternative | The four decisions of #62 carry 2 to 3 `REJECTED` each; the third `REJECTED` of `LArtefactDuFichierFusionneNEstPasUnObjetDuDomaine` is what exposed the weak recommendation |
| A standing decision was superseded rather than silently contradicted | `LesReglesDeFusionRecoiventDesDtoWireTypes:v2` with `SUPERSEDES` and `CLOSES` |
| The agent measured instead of asserting | 6,607 fields scanned, two md5 sums, baseline taken on the untouched branch first |
| The corpus did not weigh the PR down | 139 changed corpus lines out of 1,294 in #62, 11 % |
| Two branches appended to the same corpus file without conflict | `fmt` then `git diff --stat` discipline held |
| The user refused the bulk ratification | That refusal, not the procedure, found the two defects |

### What went wrong

| What | Evidence | Whose fault |
|---|---|---|
| Bulk ratification of five unverified recommendations offered as the first option | First question 2 min after launch, 13 tool calls, no file under `packages/` opened | Conduct |
| The T11 contradiction was in front of the session and not read | The question's `RATIONALE` names T11 in words; the pilot read it through `awawa show` and `sed` before asking anything. The report calls it "invisible to retrieval": it was visible and not read | Conduct, then report |
| The corpus is a list, not a graph | 77 decisions out of 84 have no incoming edge; 7 `REF` in 2,282 lines. No decision points at what it governs, so nothing retrieves "the decisions constraining X" | Corpus modelling |
| Fields hidden in prose | `recommandation :`, `a trancher :`, `constat :`, `destination proposee :` are four undeclared fields inside `DESC` | Schema |
| Unfalsifiable anchors | 19 of 111 `IMPL` anchors are directories; L016 can never fire on them | Schema |
| One task for two pull requests | T37 still `specified`, `PR "62"` only; part B inherits the entity and a false block count | Corpus modelling |
| The pilot read files, not packages | 0 `awawa context` call in the piloting session; 9 corpus files read with `cat` and `sed`. The agent read 6 in full to imitate the style | Conduct and doctrine |
| Arbitration is the bottleneck | 32 user minutes, 8 questions for 4 decisions; every first option labelled "(recommandation)" | Method |
| Instructions stale since the corpus moved | `awawa-pr-merged.md` still says the corpus lives in the private clone; `plan.md` points at a "Branches" section of a private `AGENTS.md` that no longer exists; the corpus names the base in a decision. Three homes, two stale | Method |
| The usage report grades its own author | Written by the failing session in answer to "do you find this efficient?"; eight "what held" against eight findings, not one measurement; two claims overstated (appendix) | Report |

### Remediations, by return

| # | Change | What it fixes |
|---|---|---|
| 1 | On `DECISION`, `FIELD APPLIES_TO reference` with `CONVERSE GOVERNED_BY`, pointing at the `PACKAGE` or `TASK` it governs | `context @TASK.X` would list the constraining decisions in its footer. Retrofit: 84 lines |
| 2 | On `OPEN_QUESTION`, `FIELD RECOMMENDATION string` with a required nested `REJECTED` and a nested `REF`; declare or drop the three other prose prefixes | The report's proposal, widened to every hidden field |
| 3 | Forbid by schema a directory anchor under `SPEC` | Makes the 19 dead anchors falsifiable |
| 4 | Split T37 now: a `:v2` entity for part B | 15 lines; otherwise part B launches on a false `BLOCKED_BY` |
| 5 | Before each arbitration question: open the task's `IMPL` anchors and grep `awawa status DECISION` on the subject | Two minutes per question; it is the rule recorded in #63, made concrete |
| 6 | Decide whether to ratify on the diff: a question whose recommendation carries a `REJECTED` and contradicts no decision starts with a `draft` `DECISION`, ratified in PR review with the code in hand | Removes most of the 32 minutes. Contradicts the current wave-launch rule, so it is a decision to take, not to improvise |
| 7 | Strip every project fact from `~/.claude/commands/awawa-*.md` and from `plan.md`, or add a check confronting them with the corpus | Ends the three-homes problem |
| 8 | A model entity per type, or a `docs/_example.awawa` | Saves the six full-file reads the agent did for style |
| 9 | A usage report carries the transcript figures (active minutes, tool calls, awawa calls, tokens) and is written by a session other than the one it judges | Turns testimony into measurement |

## Part B — The tool: awawa 2.7.0

### What went well

| Promise | Kept | Evidence |
|---|---|---|
| Anchor integrity | Yes | L016 fired on the two moves of #62 (`validateFloatSerialization.ts`, `MergedSaveValueObject.ts`) |
| Closure integrity | Yes | L026 required a `CLOSED_BY` on each of the four questions closed |
| No prose references | Yes | L025 at zero on the whole corpus |
| Forcing the alternative | Yes | Required `REJECTED` on `SCHEMA DECISION` is the single mechanism that caught the defect |
| Finding incoming blockers | Yes | The footer named the five questions in one call |
| Cheap inventory | Yes | `status DECISION`: 84 rulings in 11 KB, about 3k tokens |
| Cheap edits | Yes | `--overlay` let the pilot test a `STATUS` change and a renamed anchor without writing |

### What went wrong

| Defect | Observation | Checked against |
|---|---|---|
| The `BLOCKED_BY` footer ignores the referrers' `STATUS` | After #62, `BLOCKED_BY (root, 5)` while one question is live. The wave-launch rule "no live open question in the footer" reads false | Manual: reached suppressed entities are "listed but not expanded"; nothing marks them in the footer |
| `context` returns nothing useful for a `PACKAGE` | `context @PACKAGE.core_mapping --skip reasoning` is 12 lines, 900 bytes | Run on the current corpus |
| Referrers are named, not expanded | The agent chained five `show` after its one `context` to read the blocking questions | Agent transcript |
| No semantic consistency check | True by construction, as the report says | Manual |
| `awawa lint --help` is a usage error | Both sessions tried it | Transcripts |

### Remediations

| Proposal | What it would have changed on T37 |
|---|---|
| Footer: `BLOCKED_BY (root, 1 live, 4 superseded)`, or exclude `GATE suppressed` referrers | Part B would read its real block count |
| A mechanical proxy for consistency: warn when a `SPEC` of a non-`implemented` entity has an anchor intersecting the anchor of an `implemented` `DECISION` with no `REF` between them | Would have flagged the T37 `SPEC` on `domain/rules/merge` against T11's decision anchored there |
| `context --with-referrers` to expand incoming entities | One call instead of six for the agent |
| Per-subcommand help | Two wasted calls |

Note that defect 2 (empty package context) is mostly ours: the tool can only traverse edges the
corpus writes, and remediation A1 supplies them. The tool's share is that `context` gives no hint
that a 12-line package is suspicious.

## Appendix — measurements and claim check

Measured cost of the T37 part A launch:

| Item | Measure |
|---|---|
| Piloting session, active time | 61 min, of which 32 min of arbitration over 8 questions and 25 min writing the report |
| Piloting session, calls | 65 Bash, 26 awawa, 0 `awawa context` |
| Agent, duration | 28 min, 115 Bash, 22 awawa, 1 `context` |
| Tokens read from cache | 21.2 M pilot, 50.8 M agent |
| Tokens produced | 230k pilot, 60k agent |
| Corpus in #62 | 139 changed lines out of 1,294 |
| Corpus total | 129 entities, 2,282 lines, 141 KB for 17.6k lines of code; 84 decisions, 20 of them on process |

The report's claims, one by one:

| Claim in the report | Check | Verdict |
|---|---|---|
| Ratifying the five recommendations was offered without opening the code | First question 2 min after launch, after 13 tool calls, no file under `packages/` read | Confirmed |
| The `SortDeMergedSaveValueObject` recommendation was "not implementable as written" | Implementable with a second serialization port. The decision records exactly that as its third `REJECTED` | Overstated: suboptimal, not impossible |
| The contradiction with T11 was "invisible to retrieval" | The question's `RATIONALE` names T11 in words, and the session read it | Wrong: visible, not read. The missing `REF` is still the right fix |
| `BLOCKED_BY (root, 5)` overstated the block on part A | Exact, and still true after the merge | Confirmed, and the defect is the tool's |
| Two `IMPL` anchors retargeted thanks to L016 | Diff of #62: two moves, plus 9 anchors added of which 3 are directories | Confirmed |
| "80 recorded arbitrations readable in one call" | 80 decisions before #62, 11 KB of output | Confirmed, and cheap |
| Permission classifier refusal "External System Writes" | Present in the transcript at 11:36 local | Confirmed |
| Worktree base trap | The agent recreated its branch with `checkout -b` on the base | Confirmed |
| "lint has 22 rules" | The manual declares 25 `L0xx` identifiers | Unverifiable as stated, no consequence |
| "Four rulings before a line of code, proportionate but does not scale down" | The corpus is 11 % of the PR's lines | Mistargeted: the human arbitration is what does not scale |
