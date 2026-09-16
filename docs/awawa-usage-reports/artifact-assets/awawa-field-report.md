*Feedback for the awawa dev team · awawa 2.7.0 · 2026-09-15*

# Field report: what breaks, what holds

Three days later, the same corpus has been worked daily by AI agents under a review protocol. Eleven independent reports measured each session against the transcripts. This page aggregates what they found about the tool — nothing else.

- **11** — independent reports
- **16** — distinct defects
- **18** — strengths confirmed
- **226** — entities at the end

## How this was gathered

After each reviewed unit of work, a fresh agent with no memory of that work wrote a report against the session transcripts, the corpus and the manual, split in two: what belongs to our method, and what belongs to the tool. Only the second half is reproduced here. Each report also re-counted how many earlier reports had raised the same point, which is where the recurrence figures below come from.

The count is the number of reports in which the defect was observed, out of eleven. It is a measure of how often a working session trips over it, not of severity. Three defects are marked **shared**: the report that raised them concluded the corpus was at least as responsible as the binary, and they are kept because the tool could still close the gap.

## Defects

### 01. The `BLOCKED_BY` footer counts closed referrers with the live ones  
*10 / 11*

The closure footer is the single most used output: it answers "what still blocks this entity" with incoming edges no traversal would find. But it counts every referrer regardless of its `STATUS`, so `BLOCKED_BY (root, 4)` is printed on a task whose four blockers are all superseded. Every launch therefore pays a second command to filter the list by hand, and a protocol rule phrased as "no live open question in the footer" reads false on a clean corpus.

**Proposal** — split the count by gating: `BLOCKED_BY (root, 0 live, 4 superseded)`, or omit `GATE suppressed` referrers from the count and list them apart.

### 02. Referrers are named in a context package, never expanded  
*9 / 11*

One `context` call is systematically followed by five to fifteen `show` calls to read the entities the footer just named. The package is meant to be the one call that opens a subject; in practice it is the first of a dozen, and the tokens spent on the round trip are the main cost of the corpus in an agent session.

**Proposal** — `context --with-referrers`, expanding the incoming entities inside the package, with a depth bound.

### 03. Nothing says where a file ends, so every append starts with `tail`  
*4 / 11*

`new` prints a skeleton and never writes, which is the right default. But the agent then has to locate the insertion point itself: every append is preceded by `tail` and `wc -l` on the target file, and twice an entity landed in the wrong file because nothing bound a type to a location.

**Proposal** — `awawa new TYPE Name --into FILE`, appending after the last entity of that type; better still, a schema-declared placement so the target file is derived rather than guessed.

### 04. No consistency check between two entities  
*4 / 11*

Two entities in force can flatly contradict each other, or a `DESC` can state a fact that two lines of a config file refute, and `lint --strict` exits 0. This is structural — no rule of a reference-integrity linter can express it — but its consequences are the most expensive ones observed: a specification shipped against a standing decision, and a question that blocked a task for a day on a premise that was already false.

**Proposal** — a mechanical proxy rather than semantics: warn when a `SPEC` of a non-implemented entity carries an anchor that intersects the anchor of an implemented decision and no reference ties the two. It would have caught both cases.

### 05. A deleted entity is indistinguishable from one never written  
*3 / 11*

`show` answers « is not defined in the workspace » in both cases. When a review thread names an entity that has since been removed, the only way to retrieve it is `git log -p` on the corpus files — outside the tool, and outside what an agent under a "read the corpus through its tool" discipline will think to do.

**Proposal** — on an unresolved name in a git checkout, name the commit that last removed it, or state « never written ». One call instead of a manual history search.

### 06. A directory anchor always resolves, so it verifies nothing  
*3 / 11 · shared*

An anchor pointing at a directory can never fail the anchor-integrity rule, so marking an entity `implemented` against one asserts nothing. They keep being written — a tenth to a sixth of the anchors across the period — precisely because nothing signals them. Half ours: the corpus could forbid them if the language let it express the difference.

**Proposal** — a gated rule "anchor names a directory", or a slot option `anchor:file`, so a corpus can decide.

### 07. `L014` names a line, not the string it cannot continue  
*2 / 11*

A malformed multi-line string produced 54 diagnostics in one session and 36 in another, all of the form « unterminated string » / « continuation line follows no string it can continue », all pointing inside a field spanning four lines. Neither session repaired the file from the output: one wrote throwaway scripts to find the real break, the other discarded the file and rewrote the entity. The error is correct and unactionable.

**Proposal** — quote the opening of the string the continuation cannot attach to, and name the field it belongs to. One repair instead of a rewrite.

### 08. No per-subcommand help  
*2 / 11*

`awawa lint --help` and `awawa fmt --help` answer « unknown flag », then print the global usage. Every session that reaches for a subcommand's options wastes the call, and the global usage is long enough that the answer is not in it.

**Proposal** — `--help` on each subcommand, printing that subcommand's usage line and flags only.

### 09. `diff` compares two directories, never two revisions  
*2 / 11*

Entity-level diffing is one of the tool's best outputs at review time — « 2 changed, 0 added, 0 removed » says in one line what a hundred-line text diff hides. But it takes two paths, so using it on a working change means copying the corpus aside *before* editing. A session that forgets loses the option entirely.

**Proposal** — `awawa diff --git <rev> [PATH]`, reading the old side from the repository.

### 10. Indentation is tab-only, with no option and no configuration file  
*1 / 11*

On a space-indented corpus, `L001` fires at severity **error** and `lint` exits 1 without `--strict`, although the parser reads the entities correctly; `fmt` rewrites to one tab per level unconditionally, and `--help` offers no indentation flag. This is raised as a question rather than a defect: is the indent region meaningful enough that tab is inherent, or can the canonical form be configured?

**Proposal** — either answer documented next to `L001` would close it; the current silence leaves users assuming it is a bug.

### 11. `--where` matches an exact value only  
*1 / 11 · shared*

Selection by field is one of the most used reading commands, but with equality alone a free-text field cannot be queried: listing every entity produced by one unit of work takes as many queries as there are spellings of its source string. Shared, in that a stricter shape on the field would answer it too.

**Proposal** — `--where FIELD~=substring`.

### 12. The schema wildcard entry is listed but reachable by no target  
*1 / 11*

`status SCHEMA` lists `@SCHEMA.*` with its file and line, but no target reaches it: `show SCHEMA` resolves to `@SCHEMA.SCHEMA`, `show '*'` is refused by the target parser, and no escaping is documented. The entry declaring the common fields and the status gating of every type is therefore readable only by opening the schema file — the one move a corpus discipline forbids, and the failure mode these reports flagged most often. The partial workaround, `context <target> --with-schema`, renders the wildcard fields inside another entity's package and never shows the entry's own gating blocks side by side.

**Proposal** — a reachable target for the wildcard entry, or make a bare `show SCHEMA` print it.

### 13. `new` accepts a name already taken, in silence  
*1 / 11*

The skeleton is printed with no warning although the entity exists. Nothing is lost by the call itself, since `new` never writes; what is lost is the check. The agent fills the skeleton, appends it, and the duplicate surfaces as a lint finding one or several steps later. The workspace is already parsed when `new` runs, so the collision is free to report.

**Proposal** — one line on stderr naming the existing entity's file and line.

### 14. A thin context package looks the same as a rich one  
*1 / 11*

A package for an entity with almost no edges came back as twelve lines and 900 bytes, with nothing to say that this is unusual. The tool can only traverse what the corpus wrote, so the emptiness was ours — but the output gave no hint that a whole area of the corpus was disconnected, and that went unnoticed for days.

**Proposal** — a one-line summary on `context` (edges in, edges out, anchors), so a zero reads as a zero.

### 15. A schema cannot constrain free text  
*1 / 11 · shared*

A project's writing conventions — a spelling rule, a maximum length, a forbidden character class in prose fields — cannot be declared: no shape applies to the content of a description field, so `lint --strict` exits 0 on entries that break the convention and the rule stays a habit enforced by review. Shared, since the convention was not recorded in the corpus either.

**Proposal** — a shape or a pattern constraint applicable to free-text fields; the length bound proposed in the migration report is the same request.

### 16. Nothing holds an entity's placement by file  
*1 / 11*

An entity written into the wrong file of a multi-file corpus lints clean under `--strict`. The placement rule can be recorded as a decision, but no command enforces it, so a corpus split by domain drifts back toward a pile as soon as an agent guesses wrong.

**Proposal** — a schema-declared file, or file pattern, per type; it also gives defect 03 its target.

## What holds

Recorded on the same footing, and worth as much to a maintainer: these are the mechanisms the reports saw working, with the count of reports confirming each. The first three held in every single report of the period.

| Mechanism | Seen | What it prevented |
|---|---|---|
| Anchor and reference integrity | 11 | A corpus describing files that no longer exist. It fired on every move, rename and deletion of the period, including an anchor written seven minutes before its file existed, and on a specification still pointing at a removed entity. 297 anchor sites, 0 unresolved, at the end. |
| A required `REJECTED` on a decision | 11 | Called by two separate reports « the single mechanism that saved the session ». Being forced to name the alternative is what exposed a standing recommendation as not implementable, before any code was written. Two to five rejected alternatives per decision, consistently, without anyone enforcing it. |
| Closure integrity: no question closed without its closer | 11 | Questions silently flipped to closed, leaving the next session to guess what settled them. |
| Incoming blockers known before the code, from the closure footer | 9 | Discovering ambiguities one at a time during implementation. These are incoming edges: neither a traversal of the entity nor a reading of its file finds them. Defect 01 is the tax on the most valuable output there is. |
| Cheap inventory: `status` | 9 | Eighty recorded rulings in 11 KB, about 3k tokens; 226 entities in one screen. It is what let a session notice a specification contradicting a standing decision. Called nine to sixteen times per unit of work. |
| Format as a gate | 8 | A workspace-wide reformat turning a clean merge into a hand-resolved one, across branches editing the same files in parallel. Once the append idiom was right, zero string diagnostics. |
| Schema-correct skeleton: `new` | 8 | Hand-written entities missing required fields, and the full-file reads an agent otherwise does to imitate the style. |
| Selection by field: `status --where` | 4 | "Which decisions govern this task" answered in one call, on a field, instead of a grep over the corpus. |
| Constraining decisions listed in the footer | 3 | The corpus's original weakness — decisions with no incoming edge, so nothing retrieved "what constrains X". Once the corpus declared the relation, the footer answered it and the agents read it. |
| Rename with its references | 2 | A dangling reference after a rename: the referring sites follow, strict lint stays at zero. |
| Incoming edges checked before a deletion | 2 | Removing an entity something still points at — checked seven times before removals in a single review, zero incoming each time. |
| A wrong name or a wrong workspace fails fast | 2 | A guessed entity name recovered in eight seconds; a worktree at the wrong revision named in one second, a full second before the git check said the same. |
| A line resolves to its entity | 1 | Review comments left on file lines mapped back to the entities enclosing them, without a manual search. |
| Supersession rather than deletion | 1 | History leaving the graph. Two whole-entity supersessions in one change, both retrievable afterwards. |
| Entity-level `diff` | 1 | Reviewing a corpus change as a text diff. See defect 09 for what makes it hard to reach. |
| Dry-run edits with `--overlay` | 1 | A status change and a retargeted anchor tested without writing anything. |
| No prose references | 1 | Reference-shaped text pointing at nothing: zero across the whole corpus, continuously. |
| Status gating bounds a schema retrofit | 1 | Paying for retroactive tidiness on settled matter: a schema change cost two entities to convert instead of six, because closed ones fall out of gating. |

## If you fix four things

Ranked by how much working time they return, using the recurrence counts above rather than our preferences.

1. **Split the closure footer by gating** (defect 01). It is the most read output of the tool and the most frequently wrong-looking one; every session pays a manual cross-check, and every protocol phrased on it is unreliable.
2. **Expand referrers in a context package** (defect 02). The single largest token cost of running a corpus with agents: one call instead of six to sixteen.
3. **Give `new` a destination, and the schema a placement** (defects 03 and 16). Closes the last routine reason an agent opens a corpus file with a text tool — which is the discipline failure these reports flagged more than any other.
4. **Make `L014` actionable and add per-subcommand help** (defects 07 and 08). Small, and they turn two dead ends into ordinary errors.

Defect 12 is worth adding as a fifth: it is likely a one-line fix in target parsing, and it removes the only remaining case where reading the corpus through the tool is impossible by construction.

---

*Aggregated from eleven independent reports written between 12 and 15 September 2026 against session transcripts, all on awawa 2.7.0. Counts are occurrences across reports, not severities. Nothing on this page was re-measured for it: each line restates a finding already recorded, and a claim wrong at the source is wrong here.*
