# <YYYY-MM-DD> — PR #<N> <pull request title>

<!--
Template for a usage report, one file per merged pull request, named `<merge date>-pr-<N>.md`.
Written by /awawa-usage-report through the awawa-usage-reporter agent, never by a session that took
part in the work (@DECISION.UnRapportDUsageEstEcritApresChaqueFusionParUneSessionIndependante).
Reports dated before this template do not follow it: they are sources for the recurring points, not
examples of the shape. Keep every heading, in this order. Delete the comments. Entities are cited by name and never
restated: this file is about the method and the instrument, not a second home for project facts.
Every judgment carries a number or a name. A claim that could not be checked is reported as unchecked.
-->

Author of this report: <model name and version>.
Model that drove the sessions under review: <model name and version, from the `Co-Authored-By` trailers of the PR's commits; one line per model when several took part>.
Sessions measured: `session_<id>` (piloting), `session_<id>` (agent).
Delivered: <one line on what the PR changed>.

## Verdict in two lines

**Ours**: <method, corpus, conduct — one sentence>.

**The tool's**: <awawa — one sentence>.

## Part A — Us: method, corpus, conduct

### What went well

| What | Evidence |
|---|---|
| | |

### What went wrong

| What | Evidence | Whose fault |
|---|---|---|
| | | conduct / method / corpus modelling / schema / report |

### Remediations, by return

| # | Change | What it fixes |
|---|---|---|
| 1 | | |

<!-- A remediation that is a ruling is a proposal to the user; the report never writes a DECISION. -->

## Part B — The tool

### What went well

| Promise | Kept | Evidence |
|---|---|---|
| | | |

### What went wrong

| Defect | Observation | Checked against |
|---|---|---|
| | | manual / run / transcript |

<!-- A defect caused by our corpus rather than by the binary is ours: say so and send it back to part A. -->

### Remediations

| Proposal | What it would have changed on this PR |
|---|---|
| | |

## Recurring points

<!--
Read all previous reports of this folder, not the last one only. "Times seen" counts the reports in
which the point appears, this one included: the count of the previous report plus one.
-->

### Recurring pain points

<!--
Every point a previous report raised in its "What went wrong" tables or in this subsection, that
this PR's evidence shows again. A count of 3 or more is flagged: the remediation was not done or
does not work, and the report says which.
-->

| Point | Times seen | First raised in | Seen again here | Remediation proposed then | Done? |
|---|---|---|---|---|---|
| | <n> | `<file>.md`, part <A/B> | <evidence> | | yes / no / partly |

Raised before and not seen again, closed by observation: <one line per point, or "none">.

### Recurring strengths

<!--
Every mechanism a previous report listed in its "What went well" tables or in this subsection, that
this PR's evidence shows holding again. A count of 3 or more says the mechanism is established: it
can leave the "What went well" tables of the next reports and stay here.
-->

| Mechanism | Times seen | First noted in | Held again here |
|---|---|---|---|
| | <n> | `<file>.md`, part <A/B> | <evidence> |

Noted before and not seen holding here: <one line per mechanism, or "none">.

## Follow-up on the previous report's remediations

| Remediation | Done? | Evidence |
|---|---|---|
| | yes / no / partly | |

## Appendix

### Measurements

<!-- Active time counts gaps under ten minutes only. Figures come from the transcript script of the command. -->

| Session | Active time | User turns | Tool calls | awawa calls by subcommand | Tokens read from cache | Tokens written |
|---|---|---|---|---|---|---|
| piloting `session_<id>` | | | | | | |
| agent `<name>` | | | | | | |

| Corpus lines changed | PR lines changed | Share |
|---|---|---|
| | | |

### Claims checked

<!-- Every claim the PR body, the review threads or a previous report make about the corpus. -->

| Claim | Check | Verdict |
|---|---|---|
| | | confirmed / overstated / wrong / unchecked |
