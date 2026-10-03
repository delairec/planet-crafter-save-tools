*Feedback for the awawa dev team · awawa 2.7.0 · 2026-10-03*

# Agent roles: a corpus that says what each agent starts with

One day of work on a corpus of agent instructions, 265 entities at its end. A new type, `AGENT`, makes the corpus the
source of what each agent role holds from its first step: one `context` call prints the whole package of a role. The
tool carried the design unchanged. What it could not do is deliver that package inside the limits of the harness
that injects it, and a script does that in its place. The tool's part is kept whole here; ours is listed in brief.

- **7** — roles declared as AGENT entities, one context call each: 20 to 85 rules, 16,366 to 57,682 characters
- **122 of 316** — context outputs over 10,000 characters in the week before, the most one hook of the harness may add to a context
- **46 of 86** — task agents that had loaded at least one trigger of the instructions with commands of their own
- **6** — defects or gaps of the tool: 3 remediations asked for the first time, 3 that add to remediations already listed

## The report

| Field | Value |
|---|---|
| **Perimeter** | the corpus of agent instructions of the owner, pull request 67 of its repository, merged on 2026-10-03: from 251 to 265 entities and from 524 to 648 reference sites, 0 unresolved at both ends. For the baseline, the 346 transcripts of the planet-crafter-save-tools sessions of 2026-09-26 to 2026-10-03 |
| **Collected** | 2026-10-03, on awawa 2.7.0; `awawa fmt --check .` and `awawa lint --strict .` exit 0 at the merged head |
| **Author of the report** | `Claude Fable 5.1`, effort `max`: the session that did the work it reports, not an independent reporter |
| **Session under review** | that session, up to the merge: 49 shell calls naming awawa — `context` 29, `show` 17, `status` 15, `lint` 10, `fmt` 8, `refs` 1, `diff` 1 |
| **Delivered** | `SCHEMA AGENT`, 9 fields, and one field on `PROCEDURE`; 7 `AGENT` entities, 1 `AREA`, 3 `RULE`, 2 `PROCEDURE`; outside the corpus, 8 agent definitions and 3 hook scripts for one CLI |

A reference reads `AG·n`, the n-th row of the table « What the tool cost » below.

## The design, in one screen

The corpus already told a session what binds it: a `SESSION` entity loads the rules of every session and offers
`TRIGGER` entities, each loading rules once its condition holds. Every agent ran the entry command, then one `context`
per trigger it judged met. A role now declares what its work always meets:

```
AGENT dora
	WORK "an exploration whose conclusion alone matters: where a thing is, what uses it, how a flow"
		+ "crosses the code"
	REASONING light
	CAPABILITY read
	CAPABILITY shell
	BUDGET 25
	LOADS @RULE.role_run_starts_on_its_package
	LOADS @RULE.repository_facts_proven_by_command
	ASSUMES @TRIGGER.corpus_found
	ASSUMES @TRIGGER.writing_report
	RETURNS "the conclusion first, then its evidence: file and line, command and output, address read"
	BOUND_BY "adapters/claude/agents/dora.md::name: dora"
```

`awawa context @AGENT.dora --depth 2 --skip reasoning .` prints the role, the rules it loads, the triggers it assumes
and their rules, each entity once. A hook of the CLI runs that command when an agent of the role starts and puts the
output in its context before its first message. The entity above is shortened: the real one loads 8 rules.

## Verdict in two lines

**Ours**: seven roles and the rules each starts with now have one home, the corpus; no rule is copied into an agent
definition, the model and the effort of a role stay out of the corpus, and a dry run showed a session and an agent
holding their package before their first message, at no step. Before that, loading was left to each agent: 46 of 86
task agents and 22 of 68 review rounds loaded at least one trigger, over 4 steps in median, in a week of 5,402 awawa
calls. Our first count of that baseline was wrong twice and was corrected in the same pull request.

**The tool's**: awawa 2.7.0 took a new type with nothing but a schema entry, gathered a role's package through two
hops with each entity printed once (83 rules for 87 `LOADS` lines), verified by anchor that every role has its file
in the adapter and that the hook enforcing a rule still carries its sentence, reviewed the change at field level with
`diff`, and answered in 0.003 s, which is what lets a hook call it fourteen times at each start. It cost one thing
that shaped the design: `context` cannot bound or cut its output, so an 87-line script stands between the tool and
the harness. Four smaller gaps follow: a footer that takes 30 % of the entry package, one depth for every edge, no
command that writes a field, and a file argument resolved against the working directory.

## What the tool kept

| Promise | Kept | Evidence |
|---|---|---|
| A new type costs a schema entry and nothing else | yes | `SCHEMA AGENT`, 9 fields, and `LAUNCHES` on `PROCEDURE`; `fmt` then `lint --strict` exit 0 on the first run; `status AGENT`, `show AGENT` and `context @AGENT.x` answered at once |
| `context --depth 2` gathers a package through two hops, each entity once | yes | `@AGENT.bastien`: 83 rules printed once for 87 `LOADS` lines over 7 triggers; `@AGENT.remi`: 85 for 88; seven packages of 20 to 85 rules |
| `--skip CATEGORY` leaves out what a reader does not need | yes | `--skip reasoning` on every package; the session entry is read with `--skip loading`, which keeps the 27 trigger conditions and leaves their rules out |
| `--json` returns each entity as text | yes | the script that cuts a package reads `entities[].text` and never parses the format: 87 lines; `show --json` gives the one field, `REASONING`, a second hook decides on |
| Anchors tie the corpus to files outside it | yes | 7 `BOUND_BY` anchors, each resolving an agent definition and the literal `name: <role>`, and 1 `ENFORCED_BY` on a sentence of a hook; renaming a definition, or the name inside it, is `L016` — both tried |
| `INCOMING` keeps a rule loaded by something | yes | `RULE` requires `LOADED_AT_START\|LOADED_BY`; a rule only roles load satisfies it through `AGENT.LOADS`, declared under the same `CONVERSE LOADED_BY` as `TRIGGER.LOADS` |
| `diff OLD NEW` reviews a change at entity level | yes | main against the branch: 14 entities added, 8 changed, each changed field printed; it showed that `fmt` had reflowed no entity the change did not touch |
| `fmt` re-wraps a field written as one line | yes | every field of the change was written unwrapped, then wrapped by `fmt`; `lint --strict` exit 0 at each of the three commits |
| Every command answers at once | yes | `context` on the 265-entity corpus in 0.003 s; the hooks call it up to 14 times at each start, 4 for the entry and 10 for a role |

## What the tool cost

| # | Defect | Observation | Checked against | Overview |
|---|---|---|---|---|
| AG·1 | `context` cannot bound or cut its output | The harness lets one hook add 10,000 characters to a context; a longer text is replaced by a file path and a 2,000-character preview. The entry package is 23,445 characters, the seven role packages 16,366 to 57,682. A script cuts the package at entity boundaries into parts of 9,000 characters, and the hooks run it once per part. In the week before, 122 of 316 `context` outputs passed 10,000 characters: median 8,476, 90th percentile 20,074, the size of the entry itself | run, transcripts | R58 |
| AG·2 | The footer names again what the body printed or `--skip` left out | 7,128 of the 23,445 characters of the entry package, 30 %; 7 to 14 % of a role package. The script reads the JSON to leave the footer out | run | R5 |
| AG·3 | `--depth` is one number for every edge | A role assumes some triggers, whose rules it holds from its first step, and should only be offered the others, as a session is. `--depth 2` expands the rules of both; `--skip loading` those of neither. The `OFFERS` edge was left out of the type, and an agent finds the remaining triggers with `status TRIGGER --where KIND==path` | run | R59 |
| AG·4 | No command writes a field | The instructions forbid an agent to read a corpus file. Ten fields were replaced in place over three commits, each by a script that found the entity by its header line and rebuilt the `+` continuation lines to match the old text exactly once | transcript | R60, R55 |
| AG·5 | `show FILE` resolves the file against the working directory, not the root it is given | From another directory, `awawa show spec/rules.awawa <root>` answers « spec/rules.awawa is not in the workspace »; the same call with an absolute path prints the file | run | R38 |
| AG·6 | An entity that does not exist exits 1, a name the grammar refuses exits 2 | A hook maps an identifier of the harness to an entity; `general-purpose`, which no `AGENT` can be named, and a role the corpus lacks are both « no such role » to it | run | nothing asked |

`AG·6` is recorded with nothing asked: it cost one line of the hook.

## Proposed remediations

| Proposal | What it would have changed here | Overview |
|---|---|---|
| `context` cuts its output on request: `--max-chars N --part K`, entities never split, « part k of n » on the first line | the 87-line script and its spec disappear; a hook is one awawa command per part | R58 |
| The footers print counts, the names move to `--json` | the entry package loses 7,128 of its 23,445 characters | R5 |
| A depth per field, `--depth ASSUMES=2,OFFERS=1`, or a `--skip` limited to what a named field reaches | one call prints a role with the rules of the triggers it assumes and the conditions of those it is offered; the `OFFERS` edge returns to the type | R59 |
| A command that writes one field, `awawa set @TYPE.Name FIELD "text"`, formatting the entity it touches | ten in-place edits without a script that rebuilds continuation lines | R60 |
| `show FILE` resolves the file against the root it is given | the read works from any directory, like every other command given a root | R38 |

## Loading rules through commands, a week measured

The roles replace a habit this table measures. It reads the 346 transcripts of the sessions of 2026-09-26 to
2026-10-03 on the project, main sessions and agents, before any role existed.

| Measure | Value |
|---|---|
| Shell calls naming awawa | 5,402 — `show` 2,809, `context` 1,643, `lint` 1,279, `fmt` 920, `status` 900, `refs` 223, `new` 93, `diff` 38 |
| Calls on the corpus of agent instructions | 1,317, of which 350 entry calls and 869 trigger loads |
| Task agents that loaded at least one trigger | 46 of 86 |
| Task agents that loaded the trigger of the test-first cycle | 23 of 86 |
| Review rounds that loaded at least one trigger | 22 of 68 |
| Steps an agent spent loading rules | 4 in median |
| Entry calls piped through `head`, `sed`, `tail` or `grep` to shorten them | 14 of 350 |

Reading the instructions through the tool held: 1,317 calls in a week. Which rules an agent held still depended on
the agent. The package of a role removes that dependence, and the tool had everything needed to print it.

## Our side, in brief

| What went wrong | Whose fault |
|---|---|
| The first count of the baseline reported loading commands as agents and took the sessions by UTC modification time | the report's instrument |
| For three weeks, which rules an agent held was left to the agent | method |
| A limit of the harness, 10,000 characters per hook, decided more of the design than the corpus did | not ours: the harness |

What went well, on our side:

- The corpus stayed the one home of every rule: nothing was copied into an agent definition
- The model and the effort of a role stay in the adapter of the CLI; the corpus names a depth of reasoning only
- The three hook scripts were written test first: 16 tests
- A dry run on the CLI showed the entry and a role's package in context before the first message, and the launch of the
  role of the deepest reasoning stopped for the owner's permission

---

*Written on awawa 2.7.0 on 2026-10-03, from the work of that day on the owner's corpus of agent instructions and from
the transcripts of the planet-crafter-save-tools sessions of 2026-09-26 to 2026-10-03. Every figure keeps its
perimeter: the corpus at the merged head of pull request 67, the session that did the work, or the 346 transcripts of
the week.*
