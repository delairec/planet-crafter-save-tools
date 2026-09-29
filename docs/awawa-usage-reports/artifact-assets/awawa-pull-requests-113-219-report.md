*Feedback for the awawa dev team · awawa 2.7.0 · 2026-09-28*

# Pull requests #113 to #219: the corpus from the Skeo wave to release 0.1.2

One usage report over the 106 pull requests the project merged between 2026-09-22 and 2026-09-28, the week its
waves became entities of the corpus. It measures in two depths: an aggregate over the 106 pull
requests, and the full collection — transcripts, timelines, corpus diffs — on a sample of eleven. The tool's part is
kept whole here; our part, which judges our method, corpus and conduct, is listed without its evidence.

- **106** — pull requests merged in seven days, 15.1 a day against 4.3 in the previous report's range
- **2,891** — awawa calls in the 140 transcripts of the eleven sampled pull requests
- **5** — defects of the tool, each one met in an earlier report
- **375** — corpus entities at the end of the range, from 274; 823 reference sites, 0 unresolved

## The report

| Field | Value |
|---|---|
| **Perimeter** | the 106 pull requests merged from #113 to #219, #190 excluded (closed unmerged); the aggregate reads all of them, the full collection the sample: #134, #141, #173, #176, #188, #189, #199, #201, #205, #211, #219 |
| **Sample** | one task pull request of each of the four waves delivered in the range, the two release pull requests, the five with the most inline review comments, the plan of waves 10 to 12, one test pull request and the owner's integration of wave 9 |
| **Collected** | 2026-09-28, on awawa 2.7.0; checks re-run on the head of #219: `bun test` 1278 pass, `lint:types`, `guards`, `awawa fmt --check .` and `awawa lint --strict .` exit 0 |
| **Author of the report** | `Claude Fable 5.1`, effort `high` |
| **Sessions under review** | driven by `Claude Opus 5.5` alone on 84 of the 106 pull requests, `Claude Opus 5` alone on 11, `Claude Fable 5.1` and `Claude Sonnet 5` on 3 each; 141 transcript files, 140 distinct, across the eleven sampled |
| **Delivered** | 38 `docs`, 25 `feat`, 24 `chore`, 10 `test`, 7 `fix`, 1 `refactor`, 1 `ci`; 52 in four wave milestones; three releases (0.1.0, 0.1.1, 0.1.2); +43,840 −12,919 lines over 1,641 files; the corpus from 274 to 375 entities and from 414 to 823 reference sites, 0 unresolved at both ends |

A reference reads `PR·n`, the n-th row of the report's table of the tool's defects, the order of the section « What
the tool cost » below.

## The owner's word

> My overall impression is that using the awawa corpus together with the improved awawa-ui plugin (post v0.7.0) boosted productivity and efficiency (less quota consumed for at least 3x more PRs delivered in a day). There are still hiccups, but they seem tied to the content of the corpus rather than to the tooling, so it is on me to put in place the remediations we need.

Translated from French; the original stands in the full report. awawa-ui is our IntelliJ tool window, not yours: it
leaves no line in the transcripts, and nothing in the collection measures it.

## Verdict in two lines

**Ours**: 106 pull requests merged in seven days (31 on 2026-09-24; 15 a day against 4 a day for #95 to #112), a
median of 22 min from creation to merge, all eleven sampled heads green on 8 to 16 CI jobs and the head of #219 green
locally (1278 tests), the six sampled task pull requests each promoting their task with anchors that resolve, the
corpus grown by 146 entities (46 tasks, 52 decisions, 9 waves, 8 rules) and purged of 45 with 0 dangling references,
two owner rulings written into the corpus and cited from the review reply, two blocking questions opened by an agent
and deleted in the same pull request once the owner ruled, a general rule sent to the instructions corpus and merged
in 1 h 30, five hand-overs at fifty steps each finished by a continuation agent, and `awawa diff` in the hands of the
four rebase agents of wave 10; but the worktree-isolation check refused 2 to 89 commands per sampled journey (262
refusals in the 140 transcripts, sixth report), 214 reads of a `.awawa` file went through `sed -n`, `grep`, `head`,
`tail` or the `Read` tool in 82 of the 140 transcripts while the rule replacing them loads at every session start
(third report, flagged), 20 agents and 11 interactive sessions passed fifty answers without handing over, the four
corpus findings the hosted review posted on the wave plan #201 got no reply and three still stand at head, #189
ratified a data-table design at refinement that the owner struck at review 2 h 53 later, which cost five review
rounds and a `DATATABLE` written then deleted, #205 built `isLegacySave` on a premise of the plan the fixtures
contradict, the body of the owner's integration pull request #176 describes its first commit while its head carries
12, 19 of the 60 review threads of the range were left unresolved, the auto-mode classifier denied 9 commands across
four sampled journeys, `echo =====` lost three answers, and the collection script chose the wrong previous report in
11 of 11 folders.

**The tool's**: awawa 2.7.0 answered 2,891 calls in the 140 transcripts of the sample (`show` 807, `lint` 607,
`context` 498, `fmt` 447, `status` 378, `refs` 92, `new` 56, `diff` 6), every one of the 176 commands of the eleven
collections in 0.0 s, the gates refused in-session what the schema forbids (L016 in four timelines, L025, L026, L010),
`status --where DELIVERED_BY==<N>` found the task of each of the six task pull requests, `diff base head` rendered
every sampled delivery at field level (33 entities on #176, 22 on #201) and was picked up by three of the four rebase
agents of #211 as their conflict check — and it still costs the same four things: `status` counts 299 of 375
entities at their `DEFAULT` `STATUS` as `(none)` (sixth report), `fmt` wrapped 24 to 322 of the lines each sampled
pull request added, 44 % on #201 and 39 % on #176 (sixth report), `lint --closure` has no `--skip`, so the footers of
four task closures list 111, 106, 121 and 132 names (fifth report), and no command reads a field across branches or
searches field text, so the wave 9 pilot ran `git grep` over every ref of the repository to find the next free task
number and the owner reserved numbers 155 to 169 by hand for the three agents writing this week's entities in
parallel.

## What the tool kept

| Promise | Kept | Evidence |
|---|---|---|
| The corpus is read through the tool | mostly | 2,891 `awawa` calls in the 140 transcripts (`show` 807, `lint` 607, `context` 498, `fmt` 447, `status` 378, `refs` 92, `new` 56, `diff` 6) against 214 reads of a `.awawa` file outside the tool; the `cat >>` appends and `sed -i` edits are the textual editing the rules allow |
| `lint --strict` refuses in-session what the schema forbids | yes | L016 in four timelines (#176 twice, #188, #189: an `IMPL` fragment that left its file), L025 (#176: a prose mention with no `REF`), L026 (#176: a section no rule cites), L010 (#173), all before the commit; `lint --strict` exit 0 at every sampled head |
| `status --where FIELD==VALUE` answers a scope question without a file read | yes | the task of each of the six task pull requests found by `DELIVERED_BY`; `awawa status TASK --where WAVE==@WAVE.10` on the head of #201: 6 of 60; `--where STATUS==todo`: 18 of 60 at head, 2 of 44 at base |
| `diff base head` renders a delivery at field level | yes | 11 of 11 folders in 0.0 s; #176 33 entity lines (25 added), #201 22 added, #211 5 added and 12 changed with the `IMPL` lines and the `STATUS todo -> implemented` of its task; #188: the `- SPEC` and `+ SOURCE` of its task |
| `diff` is usable as a rebase check | yes | 6 calls by the rebase and port agents of wave 10 (#211 4, #176 2) |
| `new TYPE Name` skeletons | yes | 56 calls in the 140 transcripts; the 46 tasks, 52 decisions and 9 waves added in the range lint clean at head |
| `refs` says what points at an entity before it is deleted or renamed | yes | 92 calls; #134 purged an open question « cited by nothing » (7 `refs` in its journey); #141 renamed a rule and re-anchored the 12 `SECTION` entities its diff lists (7 `refs`) |
| Every command runs in 0.0 s on a 375-entity corpus | yes | 176 `awawa` commands across the eleven collections, every one at 0.0 s |

## What the tool cost

| # | Defect | Observation | Checked against | Overview |
|---|---|---|---|---|
| PR·1 | `status` counts an entity at the `DEFAULT` value of `STATUS` as `(none)` | `awawa status .` at the head of #219: `(none)` 299 of 375 — `DECISION (none) 137`, `RULE (none) 28`, `URL (none) 25`; at the base of #113: 238 of 274 | run | R6, R7 |
| PR·2 | `fmt` wraps strings at about 95 columns with no option | Continuation lines `+ "` among the corpus lines each pull request added: #201 322 of 727 (44 %), #176 283 of 727 (39 %), #189 56 of 133, #211 66 of 182, #173 36 of 101, #188 39 of 97, #141 25 of 73, #134 24 of 88, #205 19 of 59 | run | R55 |
| PR·3 | `lint --closure` has no `--skip`, so a task's closure carries the provenance hub | Footer names of four task closures: 132 (closure 107 entities), 121 (100), 111 (84), 106 (23); two smaller tasks, 29 (7) and 4 (1), show the footer scales with the hub, not the task | run | R56 |
| PR·4 | No command reads one field of every entity of a type, nor across branches, nor searches field text | The wave 9 pilot's `git grep` over every ref for `^TASK [A-Z]+[0-9]+`; the walk report of 2026-09-25 and the plugin report of 2026-09-22 raise the per-type read; the report read the `AFTER` of three tasks with one `show --json \| jq` each | run, transcript | R8, R10 |
| PR·5 | `--where` selects within one type | `awawa status --where STATUS==archived .` exits 2 (plugin report of 2026-09-22, gap 03, met again on this corpus) | run | R57 |

The report sends three findings back to our side: the closure footers come through our own `SOURCE.REF` hub (one
project entity, the game release and URL entities); the cross-branch numbering is a sequence our own instructions
declare global; the binary did what the schema says.

## Proposed remediations

| Proposal | What it would have changed on these pull requests | Overview |
|---|---|---|
| `status` reports the `DEFAULT` value as the entity's `STATUS`, and `--where STATUS==<default>` matches it | the status count reads `DECISION active 137`; the plugin's board and the reports stop translating `(none)` | R6, R7 |
| `--width N` or `--no-wrap` on `fmt` | 322 continuation lines on #201 read as 322 fewer diff lines | R55 |
| `--skip CATEGORY` on `lint --closure`, as on `context` | the largest task's footer lists its tasks, rules and decisions, a dozen names instead of 132 | R56 |
| `awawa status TYPE --field FIELD [--json]` printing one field per entity, and `awawa search '<text>' [--field FIELD]` | the next task number read in one call per branch instead of a `git grep`; the four `AFTER` checks of #201 in one call | R8, R10 |
| `--where` across types (`status --where STATUS==archived`) | the cleanup pass of #167 and #168 in one listing instead of one per type | R57 |

## Recurring across the reports

A count is the previous reports' count plus one per sampled pull request of this report whose evidence shows the
point, over the project's pull-request usage reports since 2026-09-17. From a count of 3, a pain point is « flagged »:
its remediation was not done or did not work; a strength is « established ». Only the points about the tool are
listed here.

### Pain points of the tool

| Point | Times seen | First raised in | Seen here |
|---|---|---|---|
| `status` counts the `DEFAULT` `STATUS` as `(none)` — **flagged** | 16 | `2026-09-17-pr-95.md` | 299 of 375 at head; not done, raised again by the walk report of 2026-09-25 |
| `fmt` wraps long strings with no option — **flagged** | 14 | `2026-09-17-pr-95.md` | 24 to 322 continuation lines per pull request |
| `lint --closure` has no `--skip` — **flagged** | 8 | `2026-09-18-pr-100.md` | footers of 111, 106, 121 and 132 names |

### Strengths of the tool

| Mechanism | Times seen | First noted in | Held here |
|---|---|---|---|
| `diff base head` gives an entity-level review — **established** | 16 | `2026-09-17-pr-95.md` | 11 folders at field level in 0.0 s; used by the rebase agents (6 calls) |
| `new TYPE Name` skeletons — **established** | 14 | `2026-09-17-pr-95.md` | 56 calls; the 146 entities added in the range lint clean |
| `status --where FIELD==VALUE` finds an entity without a file read — **established** | 11 | `2026-09-17-pr-95.md` | `DELIVERED_BY==<N>` found the task of each task pull request |
| `WHEN <field> <value>` and `REQUIRED` gate a field — **established** | 9 | `2026-09-17-pr-95.md` | L010, L016 ×4, L025, L026 refused in-session |
| `refs` says what points at an entity — **established** | 7 | `2026-09-17-pr-95.md` | 7 calls in each of two journeys, before a purge and a rename |
| `lint --strict` validating an anchor — **established** | 5 | `2026-09-21-pr-101-102-103.md` | L016 ×4 |

## Our side, in brief

Part A of the report judges our method, our corpus and our conduct. Its rows are listed here without their evidence,
which the full report carries. Two of them meet the tool: the reads of `.awawa` files outside the tool, 62 of which
were a field-text search no command offers (PR·4), and the next free task number searched across every ref (PR·4).

| What went wrong | Whose fault |
|---|---|
| The four corpus findings the hosted review posted on the wave plan got no reply, and three stand at head | conduct |
| A design ratified at refinement was struck by the owner at review, three hours later | method |
| A premise of the plan, false on the fixtures, went into code before anyone checked it | corpus modelling |
| The body of the owner's integration pull request describes its first commit | conduct |
| Review threads are answered but left unresolved | conduct |
| The auto-mode classifier denied nine commands across four journeys, `git status` among them | method |
| Twenty agents and eleven interactive sessions passed fifty answers without handing over | conduct |
| 262 commands refused by the worktree-isolation check, in every sampled journey | conduct |
| Three answers lost to the zsh separator `echo =====` | conduct |
| Corpus files read with the shell and the file tool, in 82 of the 140 transcripts | conduct |
| The wave 9 pilot searched the next free task number with `git grep` over every ref | corpus modelling, and the tool (PR·4) |
| The hosted review says « No issues found » on pull requests whose owner review opened five to nine threads | not ours: the hosted review |
| The instrument's previous-report selection is wrong in every folder, and its merged-PR steps report nothing useful | the report's instrument |

What went well, on our side:

- The throughput of the range is 3.7 times that of the previous one, on the same reviewer
- Every sampled task pull request promoted its own task, and every anchor resolves at every sampled head
- A wave is now an entity, and the plan of a wave is a docs pull request the owner ratifies before the first agent starts
- A blocking question is opened by the delivering agent, answered by the owner on the thread, and deleted in the same pull request
- An owner ruling given in review is recorded in the corpus before the reply, with its provenance
- A general rule found in review went to the instructions corpus by pull request and was merged 1 h 30 after the reply
- The hand-over at fifty steps worked five times, each followed by a continuation agent that finished the task
- The rebase agents of wave 10 read the corpus diff before and after each rebase
- The model named in the commit trailers is the model that ran the session
- The pilot session was cleared by the owner between rounds
- Questions to the owner batched in one call: 44 in the 140 transcripts
- The per-worktree setup was run and named in the hand-backs
- Release pull requests are short, and their review produced the next task within the day
- Checks green at every sampled head, and at the head of the range

---

*Written on awawa 2.7.0 from the usage report of 2026-09-28 on pull requests #113 to #219 of the
planet-crafter-save-tools repository. Every figure keeps the perimeter the report gives it: the aggregate over the
106 pull requests, or the sample of eleven. The full report — our own conduct, its evidence, the measurements and
the follow-up of earlier remediations included — is `docs/awawa-usage-reports/pull-requests/2026-09-28-pr-113-219.md`
in that project's repository.*
