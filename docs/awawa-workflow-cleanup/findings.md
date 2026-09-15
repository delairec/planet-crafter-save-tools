# Splitting DECISION into several types — findings

Working note for the corpus cleanup started on 2026-09-15. It records what the corpus measures, not
what it should become: every ruling this note leads to is recorded as an entity, and this file cites
entities rather than restating them. It is deleted once the migration is done.

Measured on the corpus of branch `docs/corpus-cleanup` at 137 `DECISION` and 61 `OPEN_QUESTION`,
with `awawa 2.7.0`.

## 0. Already done

Four superseded decisions absorbed by their successor were removed, the criterion recorded as
`@DECISION.UneDecisionSupersedeeEstRetireeQuandSaSuccesseureLaContientToute`. Six superseded
decisions remain: each holds a rejected alternative or a design state its successor does not restate.

`OPEN_QUESTION` carries its own ladder — §7.5's step, done first as it proposed:
`FIELD STATUS open|closed`, `GATE error` on `open`, `GATE suppressed` + `INCOMING CLOSED_BY` on
`closed`, and the 61 entities retyped (21 `open`, 40 `closed`), recorded as
`@DECISION.UneQuestionOuverteDeclareSonEchelleDeStatut`. The per-type shadowing of the wildcard's
enum is now proven on real data, not on a throwaway copy: `lint --strict` exits 0.

The schema is English — declared vocabulary was already so; its prose now follows, and every type,
field and value the split creates is born English. Data prose stays French, recorded as
`@DECISION.LeSchemaEstRedigeEnAnglaisEtLesDonneesEnFrancais`, which narrows
`@DECISION.LaSpecificationResteEnFrancaisMemePubliee` without reopening it.

Not done, and blocked on a recorded ruling: removing the ten `implemented` `TASK` entities.
`@DECISION.UneTacheFusionneeResteDansLeCorpus` rejects it by name, because the 82 incoming
`BEFORE` / `BLOCKED_BY` / `GOVERNED_BY` edges would break.

## 1. What the corpus measures

| measure | value |
|---|---|
| `DECISION` | 137 — 95 `implemented`, 36 `specified`, 6 `superseded`, 0 `draft` |
| `DECISION` with `SPEC` | 105 · without: 32 |
| `DECISION` with `APPLIES_TO_PACKAGE` or `APPLIES_TO_TASK` | 62 |
| `DECISION` with `CLOSES` | 39 |
| median `REJECTED` per decision | 2 |
| `OPEN_QUESTION` | 61 — 21 `specified`, 40 `superseded`, 0 `draft`, 0 `implemented` |
| `OPEN_QUESTION` reduced to `DESC` + `STATUS` (+ `SOURCE`) | 9, of which 8 superseded — all 8 in `limitations.awawa` |
| `OPEN_QUESTION` with `RECOMMENDATION` | 23 · with `BLOCKS`: 42 · with `RATIONALE`: 39 |

`STATUS` by domain file, `DECISION` only:

| file | implemented | specified | superseded |
|---|---|---|---|
| `packages` | 20 | 2 | 4 |
| `tests` | 24 | 5 | 0 |
| `erreurs` | 8 | 0 | 0 |
| `format-save` | 6 | 0 | 0 |
| `documentation` | 4 | 0 | 0 |
| `outillage` | 6 | 1 | 0 |
| `fusion` | 5 | 1 | 2 |
| `taches` | 3 | 0 | 0 |
| `limitations` | 4 | 7 | 0 |
| `processus` | 15 | 20 | 0 |

## 2. Finding — one ladder for four lifecycles

`SCHEMA *` declares `STATUS draft|specified|implemented|superseded` and gates it once for every
type. The table above is what that costs.

- **A decision binding on code climbs the ladder.** `packages`, `tests`, `erreurs`, `format-save`
  and `documentation` are 62 `implemented` against 7 `specified`: the ladder advances because
  `WHEN STATUS implemented` demands a `SPEC` and a resolving `IMPL`, and the code gives one.
- **A decision on how work is led cannot climb it.** `processus` is the only file where `specified`
  wins, 20 against 15, and the fifteen that reached `implemented` did so by anchoring
  `docs/_schema.awawa` or `AGENTS.md` — the corpus anchoring itself. A ruling on branches, worktrees
  or pull requests has nothing in the repository to anchor, so `specified` is its terminal state. A
  ladder that never advances carries no information.
- **`OPEN_QUESTION` uses two of the four values and neither word means what it says.** `specified`
  means open, `superseded` means closed. `draft` and `implemented` are unused and `implemented` is
  unreachable: a question has no `SPEC`. The wildcard's `WHEN STATUS implemented` block is dead
  weight on this type, and `specified` on a question is the defect that opened this work.
- **An accepted limitation has a third lifecycle again**: accepted, then reopened when the world
  changes. Today that is spelled by hand — `@DECISION.LePiedDePageBlockedBySeCroiseAvecStatus`
  carries `RATIONALE "rouvrir quand l'outil separe les referents vivants des supprimes : la decision
  passe superseded, une :v2 la remplace"`. One occurrence, in prose, read by nothing.

### What the tool allows here — verified, not assumed

Probed on `awawa 2.7.0` against a throwaway copy of this corpus: a type may declare
`FIELD STATUS open|closed`, with values the wildcard's enum does not list, and `lint --strict`
accepts both the declaration and an entity written `STATUS open`. The per-type declaration shadows
the wildcard's.

Two consequences for the migration:

- **No corpus-wide `STATUS` rename is needed.** Each new type declares the ladder its lifecycle
  has, and `SCHEMA *` keeps `draft|specified|implemented|superseded` for the types that use it.
- **A ladder without `implemented` drops the `SPEC`/`IMPL` obligation for free**, because the
  wildcard's `WHEN STATUS implemented` block keys on a value the type can no longer hold. Same for
  `WHEN STATUS superseded → INCOMING CLOSED_BY|SUPERSEDED_BY`. That is the mechanism to use —
  `WHEN` is monotonic (L021), so a per-type block can never un-require what the wildcard requires.
- **Every value of a new ladder needs its own `GATE` line**, or it only warns, and `--strict`
  promotes the lot.

## 3. Finding — candidate types

The nine families below come from reading all 137 decisions. Volumes are the assignment's order of
magnitude, exact only once the migration runs. The middle column is the single question that decides
membership; a family whose test needs two clauses is two families or none.

| candidate type | membership test | ~ | ladder it needs | fields beyond `SCHEMA *` |
|---|---|---|---|---|
| `DECISION` (narrowed) | its reversal changes production code | 44 | unchanged | `REJECTED`, `CLOSES`, `APPLIES_TO_PACKAGE`, `APPLIES_TO_TASK` |
| `CONVENTION` | its reversal changes a spec or a guard | 28 | unchanged | `ENFORCED_BY` — the guard script that makes it falsifiable, where one exists |
| `CORPUS_RULE` | it changes how the corpus is written, never the product | 17 | `draft → ruled → superseded` | anchor is `_schema.awawa`; no `APPLIES_TO_*` |
| `PRACTICE` | it changes how the work is led — branch, PR, worktree, repository | 15 | `draft → ruled → retired` | no `SPEC`/`IMPL`; `REJECTED` still required |
| `LIMITATION` | it leaves a known defect in place | 12 | `accepted → reopened → closed` | `SYMPTOM`, `WORKAROUND`, `REOPEN_WHEN`, `SUBJECT` (see §5) |
| `OUTILLAGE` | it changes a manifest, a config or a CI workflow | 8 | unchanged | anchor is a config file |
| `FACT` | it states what the save file or the game is, and arbitrates nothing of ours | 6 | `attested → refuted` | `ATTESTED_BY`; `REJECTED` **not** required — nothing was rejected |
| `CONFIDENTIALITY` | it says what may become public | 4 | unchanged | — |
| `EXTERNAL_RULE` | its subject is no longer the project: the rule left for `~/.ai` | 4 | none | `HOME` (file + section), `EXTERNAL`? — see §5 |

The two families with the weakest case are `CONFIDENTIALITY` (4 entities, no field and no ladder of
its own — folds into `PRACTICE`) and `OUTILLAGE` (8, distinguishable from `DECISION` only by the
kind of file it anchors). Both are listed so the split is decided against a full inventory, not so
they are created.

`FACT` is the one that changes the schema most, and for a reason worth stating: `SCHEMA DECISION`
makes `REJECTED` `REQUIRED`, and a statement about the save format has nothing to reject. Six
entities currently pay a fictional `REJECTED` to be storable.

## 4. Finding — fields hiding in prose

Recurring openings, each read by no command:

| prose form | occurrences | the field it is |
|---|---|---|
| `DESC "limitation acceptee, awawa 2.7.0 : …"` | 8 | `SUBJECT` + a version shape |
| `DESC "garde : …"` | 5 | `WORKAROUND` — what to do while the defect stands |
| `DESC "la regle est generale et vit dans ~/.ai/… , section N : « … »"` | 4 | `HOME`, an anchor into another repository |
| `DESC "non : …"` | 3 | the answer to the closed question, not a decision's content |
| `RATIONALE "rouvrir quand …"` | 1 | `REOPEN_WHEN` |

The `DESC` of an accepted limitation is the clearest case of what the manual warns about: a `DESC`
that keeps growing is a field waiting to be declared.

## 5. Finding — two things in this corpus whose subject is not this project

- **Three accepted limitations are limitations of `awawa` itself**, not of the project:
  `@DECISION.LePiedDePageBlockedBySeCroiseAvecStatus`, `@DECISION.AwawaDiffSeLanceContreUneCopie`,
  `@DECISION.LesReferentsDUnContexteSeLisentParShow`. A finding about a tool that is not ours belongs
  in the usage report addressed to its authors, never in the specification of the project that hit
  it. What the project legitimately owns is the workaround it applies — which argues for a `SUBJECT`
  field on `LIMITATION` (`project` | a named external tool) rather than for deleting them outright.
- **Four decisions say only that a rule left for `~/.ai`.** `@DECISION.LaRevueSansRetourNeLanceAucunAgent`
  and its three siblings restate a general rule and attest conformity to it, which
  `@DECISION.UneVueQueLeCorpusRendDejaNEstPasRecopieeDedans` already forbids in general terms. Either
  they become an `EXTERNAL_RULE` pointing at its home and nothing else, or they go. To examine one by
  one before the migration, not in bulk.

## 6. Finding — the accepted-limitation idiom is a two-entity workaround

All 8 husk `OPEN_QUESTION` entities — `DESC` and `STATUS superseded`, nothing else — are in
`limitations.awawa`, each paired with the `DECISION` that closes it. The pattern is forced, not
chosen: `SCHEMA *` requires a `CLOSED_BY` or `SUPERSEDED_BY` edge on anything superseded
(`@DECISION.UneDecisionRetireeNommeSaSuccesseure`), so recording an accepted limitation costs a
question that exists only to be closed. The file's own header comment says as much.

A `LIMITATION` type with its own ladder removes the husk: the limitation *is* the entity, and its
`STATUS` says whether it is accepted, reopened or closed. That is 8 entities and 8 references saved,
and one idiom fewer to teach.

## 7. To settle before migrating

1. **Type names.** The corpus is French, these are English. `SCHEMA` names are the corpus's own
   vocabulary and every existing one is English (`DECISION`, `OPEN_QUESTION`, `TASK`, `PACKAGE`), so
   English holds — but `CORPUS_RULE` vs `PRACTICE` vs `CONVENTION` is three words for three things
   that a reader must tell apart at a glance. Worth naming against real entities, not in the
   abstract.
2. **Where each type's `SCHEMA` lives.** `@DECISION.LeCorpusEstDecoupeParDomaine` puts a domain's
   schema beside its data, and `_schema.awawa` holds what is cross-cutting. `CONVENTION` belongs in
   `tests.awawa`, `LIMITATION` in `limitations.awawa`, `PRACTICE` and `CORPUS_RULE` in
   `processus.awawa` — which also means the family split needs no file move, and does not touch
   the by-domain split.
3. **Migration cost.** 137 entities to retype, and every `@DECISION.X` reference site to rewrite
   with it. `fmt --rename` renames an entity, not its type — to check whether a type change has
   tool support, or whether this is a scripted text pass validated by `lint --strict` and
   `diff`.
4. **What happens to `refs` history.** Retyping changes every reference's text. Merged pull request
   bodies, commit messages and the ten dated usage reports keep citing `@DECISION.X`. Same ruling as
   for the removals: a dated report says what was true at its date and is not rewritten.
5. **`OPEN_QUESTION` first or last.** Its ladder is the one whose words are plainly wrong and it is
   the smallest change — 61 entities, two values, no field to invent. Doing it first proves the
   per-type ladder mechanism on real data before 137 decisions ride on it.
