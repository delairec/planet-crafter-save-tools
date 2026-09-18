<!-- awawa-usage-report -->

# 2026-09-17 to 2026-09-18 — Flow S walked on the product specification area

The work file of the walk, committed at the close of S8 (ruling 22) and dated by that merge. One section per step of
the starter's Flow S, in the order the steps ran; the bilan of the whole walk is at the end, and the resume prompts
of S7b and S8 are kept where they were written.

It is the evidence base of `2026-09-17-starter-defects.md`, which cites it step by step. The second methodology
migration lost its own work file — `2026-09-16-corpus-bootstrap-method.md` still cites
`../../../awawa-project-methodology/work_in_progress.md`, a path that no longer exists, and the figures it draws
from it can no longer be checked. That is the precedent this ruling departs from, knowingly.

Entry answers, carried by every step:

- corpus: second area of the same workspace, `docs/awawa-project-specification/`; workspace root = repository root;
  one `SCHEMA *`, at `docs/_schema.awawa:1` since ruling 10 of S4; no reusable name among the declared types
- object: product specification — save format, merge rules, command contract, game values
- unit of change: pull request, not re-typed in this area
- tool defects: recorded, in `docs/awawa-usage-reports/`

Checked 2026-09-17: `awawa lint --summary .` at the repository root → 0 error, 0 warning, 8 files, 219 entities.
The same lint on `docs/awawa-project-methodology` alone → 383 L016, all factitious.

## S1 — Inventory (reconstructed)

The S1 session wrote nothing to disk (starter defect 1). The inventory below was re-derived from the repository on
2026-09-17 and is not the S1 one; the five questions of S1 are lost.

| Place                                            | Evidence                                                                                                                                              |
|--------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------|
| `docs/save-format.md`                            | 375 lines; general structure, 11 section headings `#0`–`#10`, ERD, legacy appendix at line 358                                                        |
| `docs/game-rules.md`                             | 219 lines; §2–§13, one heading per section plus id conflict resolution                                                                                |
| `docs/energy-levels.md`                          | 323 lines; §1 provenance of the energy values, §3 optimizers and fuse, §4 algorithm, §5 UI                                                            |
| `packages/shared-save-processing/schemas/*.json` | 11 files; the validator's base — not touched                                                                                                          |
| Domain tables in code                            | `energyLevelsByWorldObjectName.ts` (105 rows), `worldObjectNames.ts`, `planetNamesByNumericId.ts`, `energyOptimizerConfig.ts`, `saveSectionLabels.js` |
| Fixtures and reference saves                     | out of scope by the owner's ruling                                                                                                                    |
| Specs                                            | `serializeSave.spec.js`, merge rule specs — attestation material                                                                                      |
| `FACT` ×8                                        | `docs/awawa-project-methodology/facts.awawa`                                                                                                          |
| Product `LIMITATION` ×2                          | `ElevenPlacedMachinesHaveNoKnownEnergyLevel`, `SectionLabelsDivergeFromTheGameRulesDocument`                                                          |
| CLI                                              | `packages/cli-merge/cli/`, `packages/cli-validate/cli/`                                                                                               |
| Code comment carrying a product question         | `worldObjectLabels`, per `@DECISION.ACodeCommentQuestionNamesItsCorpusEntity`                                                                         |
| Wiki and private context                         | `@PROJECT.DNC`; cited by `SOURCE`, never copied                                                                                                       |

## S2 — Types and thresholds (arbitrated 2026-09-17)

| TYPE         | Threshold                                                                             | REQUIRED enforcing it                                                                  |
|--------------|---------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------|
| `SECTION`    | only if the game writes this part of the save at a fixed index                        | `LABEL string`; `HOLDS_FOR`; one index per era via `WHEN`                              |
| `RULE`       | only if a real save, or a game source, can contradict it observably                   | `SPEC` REPEATABLE with `ATTESTED_BY anchor` REQUIRED nested under each; `DOMAIN format |game|merge` with no DEFAULT; `HOLDS_FOR` |
| `COMMAND`    | only if a user can invoke it and its output is observable                             | `INVOCATION string`, `IMPL anchor`                                                     |
| `HYPOTHESIS` | only if what would refute it can be named                                             | `UNTIL @TASK                                                                           |string`, `CONVERSE RETIRES` |
| `DATATABLE`  | only if product values are carried by a table in a file and no `RULE` summarises them | `TABLE anchor`, `KEY string`                                                           |

`FIELDSET` for the era, included by `SECTION` and `RULE`: `FIELD HOLDS_FOR current|legacy|both REQUIRED`, no DEFAULT.

`SECTION` index, conditional because `WHEN` only adds obligations:
`WHEN HOLDS_FOR current` → `INDEX` REQUIRED; `WHEN HOLDS_FOR both` → `INDEX` and `LEGACY_INDEX` REQUIRED;
`WHEN HOLDS_FOR legacy` → `LEGACY_INDEX` REQUIRED. Twelve sections: 0–8 `both` at equal index, World Events `both`
(9 / 10), Reserved `both` (10 / 11), `TerrainLayers` `legacy`.

Merges (P5): `FORMAT_RULE` + `GAME_RULE` → `RULE`, identical REQUIRED, discriminant `DOMAIN`. `MERGE_RULE` folded
into the same type under `WHEN DOMAIN merge` (REQUIRED `CONFLICT`, `RESOLUTION`, `APPLIES_TO_SECTION`), although its
REQUIRED set differs and P5 did not force it.

Boundary with `DECISION`: a `RULE` is false while our code is right, and anchors in a save or a game source; a
`DECISION` is a choice we could have made otherwise, and anchors in the repository (`IMPL`).

`FACT` is retyped and deleted: the four `BASIS attested` become `RULE DOMAIN format`, the four `BASIS hypothesis`
become `HYPOTHESIS`. Migration cost: `FIELD RESTS_ON @FACT` (`_schema.awawa:113`) carries 5 `GROUNDS` edges, four to
attested and one to `APlayerIdentifierIsASteamAccountReusedAcrossGames`; it splits into `RESTS_ON @RULE` and
`ASSUMES @HYPOTHESIS`, sharing `CONVERSE GROUNDS` as `DECISION` already shares `GOVERNED_BY` across two fields.
`AnAnimalHungerLevelLiesBetweenMinus100And100` carries `ATTESTED_BY` under `BASIS hypothesis`; on `HYPOTHESIS` that
field becomes `OBSERVED_IN anchor`, not REQUIRED.

Both product `LIMITATION` entities stay where they are: their REQUIRED describe a defect of this repository.
`SectionLabelsDivergeFromTheGameRulesDocument` gains a target for its `UNTIL`: `SECTION.LABEL`.

Not recorded, with the reason: per-field lists of `save-format.md` (the JSON Schemas are the contract), the energy
values themselves (a `DATATABLE` names the table, never its rows), fixtures and reference saves (out of scope), specs
(attestation material), the UI contract of `energy-levels.md` §5 (our own UI decision), the code comment already
pointing at its entity, the wiki and the private context (`SOURCE` and `@URL`).

## Where each markdown document empties (owner's plan, 2026-09-17)

Counted 2026-09-17, `grep -c '^|'`: `energy-levels.md` 39 table lines, `save-format.md` 129, `game-rules.md` 0.

| Document                                                                                                                        | Empties into                                                                                                                                                                                                                                         |
|---------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `game-rules.md`                                                                                                                 | `RULE DOMAIN merge` only; no table to move                                                                                                                                                                                                           |
| `save-format.md` §« Sections details »                                                                                          | `SECTION` ×12 and `RULE DOMAIN format`; the per-section field tables are dropped, the JSON Schemas being the contract                                                                                                                                |
| `save-format.md` appendix (6 legacy properties, line 364)                                                                       | a `DATATABLE`: no JSON Schema covers the legacy format                                                                                                                                                                                               |
| `energy-levels.md` §1 (21 rows: `gId`, machine, kW, wiki page, lines 87–109)                                                    | a `DATATABLE`; the rows are data, the wiki page per row is their provenance                                                                                                                                                                          |
| `energy-levels.md` §2 (label table) and §3.1 (optimizer table)                                                                  | two `DATATABLE`                                                                                                                                                                                                                                      |
| `energy-levels.md` §3.2, §4                                                                                                     | `RULE DOMAIN game`                                                                                                                                                                                                                                   |
| `energy-levels.md` §5, the two rulings (one card per planet and per qualifying optimizer; a contribution computed in isolation) | `DECISION` in the methodology area, `IMPL` on `EnergyLevelsViewModel` and `PlanetEnergyLevelsValueObject`                                                                                                                                            |
| `energy-levels.md` §5, the rest                                                                                                 | deleted — the types already carry it                                                                                                                                                                                                                 |
| `energy-levels.md` §6, attestation rule, label policy, energy partition                                                         | already `DECISION` entities: `WorldObjectNamesAreAttestedBySourceOrSave`, `ACaseDuplicatedKeyIsSettledByAttestation`, `AnUnprintedEnergyValueIsNeitherInferredNorZero`. Correction: the first table of this section said `RULE DOMAIN game`, wrongly |
| `energy-levels.md` §6, the mod label file (639 keys, game 2.102)                                                                | an `@URL` in the methodology area, cited by `SOURCE`                                                                                                                                                                                                 |
| `energy-levels.md` §6, adopted identities (`GeneticManipulator1`, `DebrisContainer1`)                                           | rows of the labels `DATATABLE`                                                                                                                                                                                                                       |
| `energy-levels.md` §6, the history (104 names dropped, 56 added, 178 diverging labels)                                          | nothing — already in dated pull requests and usage reports, which REP-6 forbids rewriting                                                                                                                                                            |

A markdown document of `docs/` is kept only while it carries a fact no other home holds. The three empty out and are
deleted, not replaced by a cleaner markdown. Five of the 93 existing `DECISION` entities already cover the energy and
presentation material of `energy-levels.md`, so part of that document is a duplicate today, before the new area
exists.

Correction to the first S2 answer: it claimed the energy values were not duplicated in markdown. They are —
`energy-levels.md:87-109` carries 21 rows with their kW values, also present in
`packages/core-mapping/src/domain/energyLevelsByWorldObjectName.ts`.

Table storage chosen: **JSON, one file per table, a JSON Schema beside it**. Bun imports JSON natively
(`with { type: 'json' }`), so the TypeScript module reads the table instead of restating it and the duplication ends;
the project already runs a JSON-Schema validator, so « every row carries a source » becomes a gate rather than a
convention; `jq` and `grep` query it, and a compact row per line keeps the diff readable. Rejected: CSV (no native
import, a parser or a generation step), JSONL (not importable), YAML (a dependency), SQLite (no reviewable diff),
awawa entities (P1, 105 rows), the markdown table (no validation, alignment rots).

## Owner's rulings of 2026-09-17

1. One type for the three domains: accepted.
2. Two areas may reference each other: accepted. The workspace is the unit of resolution, not the directory; one
   workspace, one `SCHEMA *`, cross-area references valid. Strict separation is not pursued.
3. `FACT` removed in the same pull request, committed on `docs/awawa-project-specification`, in the main worktree by
   an explicit derogation to `commands.md` granted by the owner.
4. `SECTION` carries a `LABEL`, single reference for section names.
5. Legacy format recorded, for backward compatibility.
6. JSON Schemas untouched; fixtures and save JSON out of scope.
7. `DATATABLE` created, and the markdown tables move to JSON with a JSON Schema each, not to CSV.
8. A step of the walk ends only on the owner's confirmation that every point is settled — recorded as defect 4 of the
   starter, and as nothing else: neither a project rule nor a general one.

Starter defects recorded in `docs/awawa-usage-reports/specification-walk/2026-09-17-starter-defects.md`.

## S3 — Reading loop (arbitrated 2026-09-17)

The five S1 questions were lost (starter defect 1). They were re-posed on 2026-09-17, one créneau per S2 type, each
candidate framed by its entry point — the entity the question starts from — because the entry point is what fixes the
direction of the reference fields written in S4. The owner arbitrated 1a, 2a, 3b, 4c, 5a.

### What was measured before designing, not assumed

| Probe                                 | Command                                                                                              | Result                                                                                                                                                                        |
|---------------------------------------|------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Does `context` expand incoming edges? | `awawa context @PACKAGE.shared_platforms --depth 3 .`                                                | No. It names them in the footer with their identity — `// GOVERNED_BY (root, 1): @DECISION.BothPlatformAdaptersHonourOneSharedContract` — and prints nothing of their content |
| Does the footer cover non-root nodes? | `awawa context @DECISION.BothPlatformAdaptersHonourOneSharedContract --depth 3 .`                    | Yes, labelled `(rest, N)`, every identity listed; mixed incoming types print under `referenced by` rather than one `CONVERSE` name                                            |
| What does `--skip CATEGORY` remove?   | `awawa context @DECISION.MergeRulesHaveOnePublicHome --depth 1 --skip reasoning --skip provenance .` | The fields themselves, scalars included, not only the traversal; accounted in the footer as `skipped (reasoning): 2 fields`. 21 lines → 12, 43 % fewer                        |

The first probe is what decides D1 below: a question starting from a section gets the identities of the rules in one
call and their content in a second.

### The five questions and their commands

| #  | Question                                                                                          | Starts from                  | Commands                                                                                                                  | Calls                                                                                                                                                                                                                                                       |
|----|---------------------------------------------------------------------------------------------------|------------------------------|---------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Q1 | What does the save carry in section X: index per era, label, and which format rules constrain it? | `@SECTION.X`                 | `awawa context @SECTION.X --skip reasoning --skip provenance --skip attestation docs/awawa-project-methodology`           | 1 context; the constraining rules arrive as identities under `CONSTRAINED_BY`, their `SPEC` costs a second context                                                                                                                                          |
| Q2 | How does the merge settle a conflict on section X?                                                | `@SECTION.X`                 | the same call as Q1                                                                                                       | 1 context, shared with Q1. The merge rules are told from the format ones by their identity; where the identity does not suffice, `awawa status RULE --where DOMAIN==merge docs/awawa-project-methodology` intersects the footer list — 2 calls in that case |
| Q3 | What is the value for object X?                                                                   | the key, which has no entity | `jq '.[] \| select(.worldObjectName=="X")' <the file named by the DATATABLE>`                                             | 0 awawa. Ruled: the corpus is not consulted for a value                                                                                                                                                                                                     |
| Q4 | What would retire this hypothesis, and what has already been observed?                            | `@HYPOTHESIS.Z`              | `awawa context @HYPOTHESIS.Z --skip reasoning --skip provenance docs/awawa-project-methodology`                           | 1 context: `UNTIL`, `OBSERVED_IN`, and under `GROUNDS` the rules and decisions that rest on it                                                                                                                                                              |
| Q5 | What does command X promise, and which rules does it apply?                                       | `@COMMAND.X`                 | `awawa context @COMMAND.X --depth 2 --skip reasoning --skip provenance --skip attestation docs/awawa-project-methodology` | 1 context, fully expanded: `APPLIES` is outgoing, so the rules' `SPEC` and the sections they constrain come in the same call                                                                                                                                |

Four of the five questions are one `context` each; Q3 is one `jq` and no awawa call. Q1 and Q2 share their call.
Q5 is the only one whose answer is complete in a single call, because it is the only one whose edges run outwards.

### Reference fields: direction, `CONVERSE`, and why that direction

Direction ruling **D1**, 2026-09-17: a rule points at what it is about; the section never indexes its rules. The
alternative — `CONSTRAINED_BY` written by hand on `SECTION` — would answer Q1 and Q2 in one complete call, and was
refused: it is derived information, a new rule would have to edit the section, and nothing reports a rule left out.

| Field                | Carried by   | Target          | `CONVERSE`       | Why this direction                                                                                                                                                                                           |
|----------------------|--------------|-----------------|------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `APPLIES_TO_SECTION` | `RULE`       | `@SECTION`      | `CONSTRAINED_BY` | D1. REQUIRED under `WHEN DOMAIN merge` (S2), optional otherwise                                                                                                                                              |
| `VALUES_FROM`        | `RULE`       | `@DATATABLE`    | `SUPPLIES`       | voie A: a rule names the table that holds the authoritative values, and that is the only way `@DATATABLE` is reached — it appears at the frontier of Q1's and Q5's context, never as the start of a question |
| `ASSUMES`            | `RULE`       | `@HYPOTHESIS`   | `GROUNDS`        | the hypothesis is the ground, the rule the dependant; reaching Q4 from the rule side, and filling Q4's footer from the hypothesis side                                                                       |
| `APPLIES`            | `COMMAND`    | `@RULE`         | `APPLIED_BY`     | Q5 starts from the command, so the edge runs outwards and the rules are expanded, not merely named                                                                                                           |
| `UNTIL`              | `HYPOTHESIS` | `@TASK\|string` | `RETIRES`        | Q4's own question; reuses the `CONVERSE` already declared on `Ruling`, `LIMITATION` and `FACT`                                                                                                               |
| `RESTS_ON`           | `DECISION`   | `@RULE`         | `GROUNDS`        | S2 migration: the existing `RESTS_ON @FACT` splits, keeping its name and its `CONVERSE` for the attested half                                                                                                |
| `ASSUMES`            | `DECISION`   | `@HYPOTHESIS`   | `GROUNDS`        | the other half of the same split; two fields sharing one `CONVERSE`, as `DECISION` already shares `GOVERNED_BY`                                                                                              |

`GROUNDS` and `RETIRES` are reused, not redeclared: sharing one `CONVERSE` across several fields is the pattern the
corpus already follows with `GOVERNED_BY`. `CONSTRAINED_BY`, `SUPPLIES` and `APPLIED_BY` are new.

**Collision check (L013), run not asserted**, 2026-09-17: the reserved namespace is 32 distinct `FIELD` names plus 9
distinct `CONVERSE` names = **41 names** — the earlier note « 41 champs et 9 CONVERSE » counted the converse names
twice. The 18 names S3 introduces — `LABEL`, `INDEX`, `LEGACY_INDEX`, `HOLDS_FOR`, `DOMAIN`, `CONFLICT`,
`RESOLUTION`, `APPLIES_TO_SECTION`, `VALUES_FROM`, `ASSUMES`, `INVOCATION`, `APPLIES`, `OBSERVED_IN`, `TABLE`, `KEY`,
`CONSTRAINED_BY`, `SUPPLIES`, `APPLIED_BY` — intersect those 41 in nothing.

### Categories

| `CATEGORY`    | Fields                                                                         | Who skips it                                                                                                                                                   |
|---------------|--------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `reasoning`   | `RATIONALE`, `REJECTED` — already declared on `SCHEMA *` and `FIELDSET Ruling` | every one of the five questions; only a session reopening a ruling reads them                                                                                  |
| `provenance`  | `SOURCE` — already declared on `SCHEMA *`                                      | every one of the five questions; a session auditing where a statement came from does not skip it                                                               |
| `attestation` | **new**: `ATTESTED_BY`, REQUIRED under each `SPEC` of `RULE` (S2)              | Q1, Q2 and Q5, which read what the rule says; a session verifying a rule, or changing one, does not skip it. Measured on a comparable entity: 43 % fewer lines |

Rejected: a `CATEGORY legacy` on `LEGACY_INDEX`. It would save one line, and it would name an era that `HOLDS_FOR`
already names — a second way to say the same thing.

### How a question reaches a row of a table

Never by an entity per row (P1: 105 rows in the energy table alone). `@DATATABLE.T` carries `TABLE anchor` — the JSON
file — and `KEY string` — the name of the field that identifies a row. The path is: the corpus names the authoritative
file, `jq` reads the row.

```
awawa show @DATATABLE.EnergyLevelsByWorldObjectName docs/awawa-project-methodology
jq '.[] | select(.worldObjectName=="Solar1")' <the anchor printed by TABLE>
```

Q3 skips the first line entirely — a session that already knows the file goes straight to `jq`. That is why no
question starts from `@DATATABLE`: the type exists to name the file that has authority and the key that indexes it,
and it is read at the frontier of Q1's and Q5's context, through `VALUES_FROM`.

## S4 — Skeleton (written 2026-09-17)

### Divergence from the starter, declared before writing

S4 says « create `_schema.awawa` ». There is no second one here: one workspace, one `SCHEMA *` (ruling 2 of
2026-09-17). S4 **extended** the existing schema — 108 lines — and created only data files. Recorded as starter
defect 7.

### Rulings of 2026-09-17, S4

9. The second area is `docs/awawa-project-specification/`.
10. `_schema.awawa` moves to `docs/_schema.awawa`, above both areas: the schema governs the whole workspace, and
    each area holds only its entity files. Cost measured before the move, not after: one `IMPL` anchor
    (`@DECISION.TheCorpusLivesInThePublicRepository`, first `SPEC`) and three path mentions in `AGENTS.md`;
    references are by identity, so none broke. `git mv` detected as a rename, 0 content change.
11. `RULE` holds in one file, and `DOMAIN` is `REQUIRED REPEATABLE`. Owner's hypothesis — a rule may be common to
    several domains — verified twice before adoption: `GR-ID-1` (the game itself writes ids duplicated across the
    shared numbering space, and the merge introduces no new duplicate) and `GR-ID-7` (a player identifier is a
    Steam64 carried as exact decimal text, which is what makes players neither seed nor draw from the sequence) are
    each `format` and `merge`. And the tool behaves: `WHEN DOMAIN merge` fires when `merge` is one value among
    several of a repeatable field, and does not fire on a `game`-only rule.
12. Data files: one per type, lower-case plural, as the methodology area already does.

### Files

| File                                                                        | State                                                                                                                                                                                                                    |
|-----------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `docs/_schema.awawa`                                                        | moved from `docs/awawa-project-methodology/`, then +108 lines: `FIELDSET Era`, `SCHEMA SECTION`, `SCHEMA RULE`, `SCHEMA COMMAND`, `SCHEMA HYPOTHESIS`, `SCHEMA DATATABLE`, and `FIELD ASSUMES @HYPOTHESIS` on `DECISION` |
| `docs/awawa-project-specification/sections.awawa`                           | created, empty                                                                                                                                                                                                           |
| `docs/awawa-project-specification/rules.awawa`                              | created, empty                                                                                                                                                                                                           |
| `docs/awawa-project-specification/commands.awawa`                           | created, empty                                                                                                                                                                                                           |
| `docs/awawa-project-specification/hypotheses.awawa`                         | created, empty                                                                                                                                                                                                           |
| `docs/awawa-project-specification/datatables.awawa`                         | created, empty                                                                                                                                                                                                           |
| `docs/awawa-project-methodology/decisions.awawa`                            | one `IMPL` anchor repointed at `docs/_schema.awawa`; `@DECISION.TheSchemaGovernsEveryAreaFromTheDocsRoot` added, which records rulings 9, 10 and 12 where a future session reads them                                    |
| `AGENTS.md`                                                                 | three path mentions rewritten; the second area and its five files declared                                                                                                                                               |
| `docs/awawa-usage-reports/specification-walk/2026-09-17-starter-defects.md` | defects 7, 8 and 9                                                                                                                                                                                                       |

The five data files are empty, not seeded with a `//` header: no command reads a comment, and the one reader a
comment would serve is a session opening the file, which the corpus discipline forbids.

### `FACT` migration: S7, not S4

Not done here, and it does not fit here. The split of `FIELD RESTS_ON @FACT` into `RESTS_ON @RULE` and
`ASSUMES @HYPOTHESIS` cannot be written before the eight `FACT` entities exist as `RULE` and `HYPOTHESIS`, and those
are S7's first entities. What S4 did take is the additive half: `FIELD ASSUMES @HYPOTHESIS` with `CONVERSE GROUNDS`
is declared on `DECISION` now — it breaks no edge, and it is what proves the shared-`CONVERSE` probe on the real
corpus. `RESTS_ON` keeps its `@FACT` target until S7 retypes the entities; six of the seven S3 reference fields are
in place, the seventh is that retyping.

### P10 probes

Run in `<scratchpad>/probe`, a copy of the **whole** methodology area — 8 files, 219 entities — plus the additions,
so `L013` runs against the 41 names the workspace already reserves. `L016` is factitious there (the probe workspace
root holds none of the repository's files) and is filtered out of every count below.

| Schema line                                                                                         | Expected                                                    | Observed                                                                                                                                                                              |
|-----------------------------------------------------------------------------------------------------|-------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| 18 new `FIELD` and `CONVERSE` names                                                                 | no `L013` against the 41 reserved names                     | imposed nothing, accepted: 0 finding                                                                                                                                                  |
| `CONVERSE GROUNDS` on `DECISION.RESTS_ON` and `DECISION.ASSUMES` (same type), and on `RULE.ASSUMES` | a `CONVERSE` may be shared by several fields                | accepted, 0 finding; the pattern `DECISION` already uses for `GOVERNED_BY` holds across types too                                                                                     |
| `WHEN HOLDS_FOR current` → `INDEX` REQUIRED                                                         | refusal when absent                                         | refused: `L006 required field INDEX is absent from SECTION`                                                                                                                           |
| `WHEN HOLDS_FOR both` → `INDEX` + `LEGACY_INDEX` REQUIRED                                           | refusal when either absent                                  | refused: `L006 … LEGACY_INDEX is absent`                                                                                                                                              |
| `WHEN HOLDS_FOR legacy` → `LEGACY_INDEX` REQUIRED, `INDEX` still legal                              | the monotonic `WHEN` cannot forbid `INDEX`                  | **accepted in silence**: a `legacy` section carrying `INDEX 9` lints clean. Consequence taken, not fixed: the era fields are a convention on `legacy`, a gate on `current` and `both` |
| `WHEN DOMAIN merge` → `CONFLICT`, `RESOLUTION`, `APPLIES_TO_SECTION` REQUIRED                       | refusal when absent                                         | refused: three `L006` on one entity                                                                                                                                                   |
| `WHEN DOMAIN merge` on a REPEATABLE `DOMAIN`                                                        | fires when `merge` is one value among several               | imposed: the three `L006` fire on `DOMAIN format` + `DOMAIN merge`, and not on `DOMAIN game` alone. This is what makes ruling 11 safe                                                 |
| `CONFLICT` / `RESOLUTION` outside `DOMAIN merge`                                                    | no way to forbid them                                       | **accepted in silence**: a `DOMAIN format` rule carrying both lints clean                                                                                                             |
| `ATTESTED_BY` REQUIRED nested under each `SPEC` of `RULE`                                           | refusal when a `SPEC` carries none                          | refused: `L006 required field ATTESTED_BY is absent from RULE.SPEC`, located on the `SPEC` line, not the entity                                                                       |
| `CATEGORY attestation` on a **nested** field                                                        | `--skip attestation` removes `ATTESTED_BY` and keeps `SPEC` | imposed: 23 lines → 22, footer `// skipped (attestation): 1 field on @RULE.…`. A `CATEGORY` works one level down                                                                      |
| `INDEX` written on a `RULE`                                                                         | refusal, the field being `SECTION`'s                        | refused: `L003 field INDEX is not declared on RULE`                                                                                                                                   |
| `HYPOTHESIS.UNTIL` REQUIRED                                                                         | refusal when absent                                         | refused: `L006 required field UNTIL is absent from HYPOTHESIS`                                                                                                                        |
| `awawa new TYPE X` for the five types                                                               | the skeleton names the `WHEN` blocks                        | imposed: each skeleton ends on its `WHEN` lines, e.g. `// WHEN DOMAIN merge: CONFLICT (required), RESOLUTION (required), APPLIES_TO_SECTION (required)`                               |
| An empty data file, and a comment-only one                                                          | tolerated by `fmt` and `lint`                               | accepted: `fmt` leaves both untouched, `lint` says nothing                                                                                                                            |

Two of the fourteen lines are « accepted in silence », both for the same reason: `WHEN` is monotonic (`L021`), so it
adds obligations and can never forbid a field outside the case it keys on. Not a defect of the tool — the documented
design — and not worth a second discriminant field.

### Gate

`awawa fmt . && awawa lint --strict .` at the repository root, same turn as the writes: **0 error, 0 warning**,
413 reference sites, 0 unresolved, 225 entities (219 + the 6 schema entities added). `fmt` reordered nothing: the
diff on `docs/_schema.awawa` is 108 insertions and 0 deletions.

## S5 — Pivot and archive (2026-09-18)

### What the archive mechanism was missing: nothing

S5's four prescriptions all stood before the step opened — `STATUS active|archived DEFAULT active`
(`docs/_schema.awawa:24`), `WHEN STATUS archived` with `GATE suppressed` (29–30), `ARCHIVED_ON date` REQUIRED (31–32),
`SHAPE date` (52–54) — and the probe showed every one of them behaving on the five new types. **0 schema
line was added by S5.** What the probe did produce is two rulings about how the mechanism is used, not about how it
is declared, and both are in the corpus (`@DECISION.TheEraIsNotTheArchive`), not here.

The one thing the probe found and the starter does not say: `GATE suppressed` silences **every** check on an
archived entity except the fields of the `WHEN STATUS archived` block itself. Archiving is therefore an act on an
entity already clean, never a way to quiet one — recorded as a `SPEC`, and reported to the awawa team as defect 12.

### Pivot

| Question                                          | Ruling                                                                 |
|---------------------------------------------------|------------------------------------------------------------------------|
| Pivot of the specification area                   | `RULE`                                                                 |
| One pivot per area, or one per workspace          | One per area: `TASK` for the methodology, `RULE` for the specification |
| An « implemented » state on one of the five types | No — P3 reduces to the choice of the pivot                             |

Priced on what `context` returns from each candidate, on the probe area:

| Candidate | `context`            | Outgoing edges                                 | Incoming edges                                |
|-----------|----------------------|------------------------------------------------|-----------------------------------------------|
| `RULE`    | 4 entities, 26 lines | `APPLIES_TO_SECTION`, `VALUES_FROM`, `ASSUMES` | `APPLIED_BY` (COMMAND), printed in the footer |
| `SECTION` | 1 entity, 6 lines    | none                                           | `CONSTRAINED_BY` (RULE)                       |
| `COMMAND` | 5 entities, 31 lines | `APPLIES`, `IMPL`                              | none                                          |

`SECTION` declares no reference field, so the type two of the five S3 questions start from is the one whose package
is empty; those two questions are served by the `CONSTRAINED_BY` footer `context @SECTION.X` already prints, so
choosing `RULE` loses them nothing. `COMMAND` returns the larger package but reaches only what a command applies.

No « implemented » state: a rule is true or false, not delivered. `COMMAND.IMPL` and `RULE.SPEC.ATTESTED_BY` are
REQUIRED anchors, so nothing unbuilt resolves one — which is the ruling S4 closed on, restated here as a `REJECTED`
rather than as a new scale.

### The era is not the archive

`HOLDS_FOR legacy` and `STATUS archived` answer two different questions. A section the game removed still binds: the
saves written before the removal are still read, so its rules are still true and the entity stays active. The
archive is for the day the project stops supporting what the entity describes. The measured argument is the one
above: archiving removes the entity's body from every `context` package that cites it — an active rule pointing at
an archived section reads `// suppressed: @SECTION.X` and never sees its `LABEL` or its indices.

`PURGE` on a specification entity keeps its default, `true`. What guards the deletion is not a field but the
incoming count `status TYPE` prints: the cleanup pass deletes an archived entity once the delay has run and nothing
points at it. `PURGE false` by default on the five types would turn the archive into the history the corpus refuses
to hold.

### P10 probes

Run in `<scratchpad>/probe`, a copy of the **whole** workspace — `docs/_schema.awawa`, both areas, 226 entities —
plus three probe files: 7 conforming entities (one per type), 12 archive entities, 2 control entities. Every
conditional line is written twice, once satisfied and once violated, and an archived violation is written beside its
active twin. Baseline before the probe entities: 377 `L016`, factitious (the probe root holds only the copied
files), 0 other finding; every count below is of non-`L016` findings, and the `L016` total is quoted where the
probe was about an anchor.

| Schema line                                                             | Expected                                                     | Observed                                                                                                                                                        |
|-------------------------------------------------------------------------|--------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------|
| 7 conforming entities, one per type, one reference each                 | clean                                                        | accepted: 0 finding                                                                                                                                             |
| `STATUS archived` without `ARCHIVED_ON`                                 | error                                                        | **imposed**: `L006 required field ARCHIVED_ON is absent from SECTION` — the block keyed on the suppressing value fires ungated                                  |
| `STATUS archived` with `ARCHIVED_ON 2026-09-18`                         | clean                                                        | accepted: 0 finding                                                                                                                                             |
| `ARCHIVED_ON` on an active entity                                       | `L003`                                                       | **imposed**: `L003 field ARCHIVED_ON is not declared on SECTION`                                                                                                |
| `PURGE false` on an active entity                                       | undeclared outside the block                                 | **imposed**: `L003 field PURGE is not declared on SECTION`                                                                                                      |
| `ARCHIVED_ON "18/09/2026"` on an archived entity                        | `L007`, `SHAPE date`                                         | **imposed**: `L007 field ARCHIVED_ON expects date` — a field of the archive block is checked despite `GATE suppressed`                                          |
| `WHEN HOLDS_FOR current` → `INDEX` REQUIRED, on an **archived** section | ?                                                            | **accepted in silence**: 0 finding; the active twin raises `L006 required field INDEX is absent`. `GATE suppressed` does extinguish the era gate                |
| `WHEN DOMAIN merge` → three REQUIRED fields, on an **archived** rule    | ?                                                            | **accepted in silence**: 0 finding for the three, and none for the `SPEC` carrying no `ATTESTED_BY` — four `L006` extinguished on one entity                    |
| `INDEX "not-a-number"` on an **archived** section                       | control: is `L007` ungated, or is the archive block special? | **accepted in silence**: 0 finding; the active twin raises `L007 field INDEX expects uint`. The special case is the block, not the rule                         |
| `@SECTION.ProbeDoesNotExist` from an archived rule                      | `L004`/`L009`                                                | **accepted in silence**: 0 finding                                                                                                                              |
| `ATTESTED_BY "docs/nowhere-at-all.md"` on an archived rule              | `L016`                                                       | **accepted in silence**: `L016` total unchanged, 377 before and after                                                                                           |
| `context` on an active `RULE` pointing at an archived `SECTION`         | ?                                                            | **accepted in silence**: 1 entity, 7 lines, `// suppressed: @SECTION.ProbeArchivedTarget`; the section's `LABEL` and indices are absent from the package        |
| `context` and `refs` on the archived `SECTION` still cited              | ?                                                            | **imposed**: `CONSTRAINED_BY (root, 1): @RULE.ProbePointsAtArchived`, and `refs` gives the citing line. The incoming side is reported, the outgoing side is not |
| `status SECTION --where STATUS!=archived`                               | the live sections, including those with `STATUS` unwritten   | **imposed**: 6 of 12, every unwritten-`STATUS` entity kept; `--where STATUS==archived` returns the other 6                                                      |

Six of the fourteen lines are « accepted in silence », and five of the six are one fact: `GATE suppressed` silences
every check on the entity but the fields of the archive block. That is the tool's documented design; what is not
documented is its two consequences — an entity can be archived unclean, and an active reader silently loses the body
of what it cites. Both are recorded as `SPEC` obligations and reported as defects 12 and 13.

### Gate

`awawa fmt . && awawa lint --strict .` at the repository root, same turn as the writes: **exit 0, 0 error, 0
warning**, 417 reference sites, 0 unresolved.

### Files

| File                                                                        | State                                                                                                         |
|-----------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------|
| `docs/_schema.awawa`                                                        | unchanged — S5 added no schema line                                                                           |
| `docs/awawa-project-methodology/decisions.awawa`                            | `@DECISION.TheSpecificationAreaPivotsOnTheRule` and `@DECISION.TheEraIsNotTheArchive` added                   |
| `AGENTS.md`                                                                 | two paragraphs: « Chaque aire a son pivot » and « L'ère n'est pas l'archive », both anchored by the decisions |
| `docs/awawa-usage-reports/specification-walk/2026-09-17-starter-defects.md` | defects 11, 12 and 13; header, count and scope paragraph updated                                              |

## Review of the target schema (S5 to S6 boundary, 2026-09-18)

Asked for by the owner, covered by no step of the flow — recorded as defect 15. Every point below was probed in
`<scratchpad>/probe` before being proposed; none is written into the corpus yet.

### Verdict

The road holds. The five types, the direction of the seven reference fields, the three `CATEGORY`, `DOMAIN` REQUIRED
REPEATABLE and the `RULE` pivot all survive the reading, and nothing of S2 to S5 is reopened. Four points are raised,
three of them gaps the per-step reading could not see.

### Ruled, and written in the same turn

R1, R2 and R3 are in `docs/_schema.awawa`; R4 is `@DECISION.AnAnchorNamesAFileTrackedByGit` plus `@TASK.CHORE51`
for its guard. `awawa fmt . && awawa lint --strict .`: exit 0, 0 finding, and `awawa new` prints the three new
fields.

| #  | Point                                                                                                                                                                                                                                                                  | Ruling                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | Probe                                                                                                                                                                |
|----|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| R1 | `SECTION.INDEX` and `LEGACY_INDEX` are the most falsifiable numbers of the corpus and nothing proves them, while `RULE.SPEC.ATTESTED_BY` is REQUIRED under every obligation                                                                                            | `FIELD ATTESTED_BY anchor REQUIRED REPEATABLE CATEGORY attestation` on `SECTION` — the fact is attested where it lives, not restated in a rule's prose                                                                                                                                                                                                                                                                                                                                                                                                                                        | imposed: `L006 required field ATTESTED_BY is absent from SECTION` on both probe sections; the `attestation` category keeps `--skip` working as it does on `RULE`     |
| R2 | `DATATABLE` carries `TABLE` and `KEY` and names no JSON Schema, although « JSON, one file per table, a JSON Schema beside it » is a settled ruling of S3                                                                                                               | `FIELD JSON_SCHEMA anchor REQUIRED` on `DATATABLE`. The field cannot be called `SCHEMA` or `SHAPE`: both are keywords of the tool                                                                                                                                                                                                                                                                                                                                                                                                                                                             | imposed: `L006 required field JSON_SCHEMA is absent from DATATABLE`                                                                                                  |
| R3 | No `INCOMING` is declared anywhere in the workspace, so a section the game writes today that no rule constrains is silent — the specification has a hole and nothing reports it                                                                                        | `INCOMING CONSTRAINED_BY` in `WHEN HOLDS_FOR current` and `WHEN HOLDS_FOR both` on `SECTION`. Cost: it bites from the first entity of S7 — a section must arrive with at least one rule                                                                                                                                                                                                                                                                                                                                                                                                       | imposed: `L026 nothing refers to SECTION ProbeOrphanCurrent under CONSTRAINED_BY, which WHEN HOLDS_FOR current on SCHEMA SECTION requires`; silent on the cited twin |
| R4 | `ATTESTED_BY` resolves against files on disk, git being never consulted, and the real saves live in `input/`, `output/` and `.do-not-commit/`, all three gitignored: an attestation anchored there lints clean for its author and is `L016` in CI and in a fresh clone | Adopted as a written rule now — `@DECISION.AnAnchorNamesAFileTrackedByGit`, naming the committed witnesses: 4 fixtures, 11 JSON Schemas, the tests, the documents of `docs/` — and as `@TASK.CHORE51` for the guard that enforces it, the eighth of `check:guards`. Measured: 487 anchors today, 0 of them ignored; the risk is created by R1, REQUIRED on the twelve sections still to write, whose natural witness is one of the 8 uncommitted saves. It contradicts nothing: `@DECISION.NoSaveIsCommittedToThePublicRepository` already forbids the save that would be the tempting anchor | evidenced: the probe workspace is not a git repository at all and resolves its anchors normally, so `L016` tests existence and nothing else                          |

### A defect of the binary, not of the starter

`awawa new SECTION Probe .` prints `// WHEN HOLDS_FOR current: INDEX (required)` and says nothing of the
`INCOMING CONSTRAINED_BY` the same block carries, although `L026` fires as soon as the entity is written alone. Kept
in its own section of the defects file, for the report on the third migration.

### Read and left as is

| Point                                                                                                   | Why no change                                                                                                                                                                                                                                                                                                                                                                                                    |
|---------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `HOLDS_FOR` REQUIRED on a `DOMAIN game` rule, where the era of the save format says nothing             | Relaxing it per domain is not available: `Era` is a `FIELDSET` shared with `SECTION`, and redeclaring `HOLDS_FOR` on the type to key it on `DOMAIN` is `L013 field HOLDS_FOR is declared twice for this type: by @FIELDSET.Era and locally` (probed). A game rule writes `both`, which is true. The asymmetry favours keeping it: dropping a REQUIRED later breaks no entity, adding one later costs a migration |
| `current                                                                                                | legacy                                                                                                                                                                                                                                                                                                                                                                                                           |both` pins the era to one boundary, the removal of the Terrain Layers section, written into the `FIELDSET` `DESC` | A second removal would make `legacy` ambiguous and cost a migration over every `SECTION` and `RULE`. The game is released and the removal is historic, so the risk is taken knowingly rather than paid for now with an entity per era; what is owed is that the boundary be written as a ruling, not left in a `DESC` |
| `CONFLICT` and `RESOLUTION` legal outside `DOMAIN merge`; `INDEX` legal on a `HOLDS_FOR legacy` section | Both are `WHEN`'s monotonicity (`L021`), taken in S4 and unchanged                                                                                                                                                                                                                                                                                                                                               |
| `COMMAND.IMPL` single rather than REPEATABLE                                                            | No command of the project has two entry points today; the field can be made REPEATABLE without breaking an entity                                                                                                                                                                                                                                                                                                |

## S6 — Sources and shapes (2026-09-18)

### Divergence from the starter, declared before writing

S6 line 307 prescribes `FIELD SOURCE string REPEATABLE` with a nested `FIELD REF reference REQUIRED` on `SCHEMA *`.
It stood at `docs/_schema.awawa:15-23` before the step opened, with four source types and nine `SHAPE`. The step was
therefore run as S5 was: probe the mechanism on the five new types, and complete only what the probe and the S1
inventory show missing. Recorded as starter defect 16, the third occurrence of the shape of defects 7 and 11.

### The places of S1 with no source type

| Place                                                                     | Ruling                                                                                                             | Identifier                      |
|---------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------|---------------------------------|
| The community wiki, some thirty pages cited                               | `@URL`, one entity per page a corpus entity cites                                                                  | `SHAPE url`, already declared   |
| The English label file of the (UI) English Plus Translation mod, 639 keys | `@URL`, the permalink pinning commit `3f10f45`, so the keys are cited as they were read                            | `SHAPE url`                     |
| The game itself, and the version an observation was made in               | **new type `GAME_RELEASE`**, named by the version the game prints                                                  | **new `SHAPE version_segment`** |
| The private context and its six reference saves                           | nothing new: `@PROJECT.DNC`, 12 incoming edges today; never an anchor (`@DECISION.AnAnchorNamesAFileTrackedByGit`) | `SHAPE project_name`            |
| The per-row provenance of the energy table (a wiki page per row)          | nothing: a column of the JSON table, which is what keeps the 105 rows out of the corpus                            | —                               |

One type added, one `SHAPE` added for its name, three places served by what already stood.

Rejected, with the reason:

| Rejected                                                   | Why                                                                                                                                                                                                          |
|------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| A `PROJECT` entity for `akarnokd/ThePlanetCrafterMods`     | `PROJECT` records a repository and no commit; the corpus cites no pull request of that repository; the 639 keys must be pinned at the commit read                                                            |
| A `READ_ON date` on `URL`                                  | the wiki pages of the energy values were read on several days, so the date belongs to the citation, not to the page; it stays in the `SOURCE` prose, as every dated `SOURCE` of the corpus already writes it |
| One `URL` for the wiki as a whole, the page named in prose | the address is what the type exists to carry                                                                                                                                                                 |
| A `GAME_VERSION` field on `RULE`                           | the version qualifies the observation, not the obligation; it would be written on every rule and mean the version of the last reading — which is what a `SOURCE` says                                        |
| A PascalCase name such as `V2102`                          | the dot is the name segment separator, so `NAME version_segment` admits `2.102` as written; measured below                                                                                                   |

Is a game version a `SHAPE`? Yes, and it is the type's `NAME`, not a field: `GAME_RELEASE` carries no field of its
own — its identity is the version, and `NAME version_segment` checks every segment of it. What carries it is the
`SOURCE` line of whatever was observed in that build, through `REF`.

### P7 — every remaining string field of the five new types

| Field                | Verdict                                         | Reason                                                                                                                                                                                                                            |
|----------------------|-------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `SECTION.LABEL`      | `string`                                        | the labels are human sentences — `Global metadata`, `World objects`, `Mailbox messages` (`saveSectionLabels.js`); any shape admitting them degenerates to `.*`                                                                    |
| `RULE.SPEC`          | `string`                                        | one falsifiable obligation in prose; the checkable half is `ATTESTED_BY`, already an anchor and REQUIRED under each `SPEC`                                                                                                        |
| `RULE.CONFLICT`      | `string`, **moved** into `WHEN DOMAIN merge`    | prose; what was typable is its state, not its value                                                                                                                                                                               |
| `RULE.RESOLUTION`    | `string`, **moved** into `WHEN DOMAIN merge`    | the same                                                                                                                                                                                                                          |
| `COMMAND.INVOCATION` | `string`                                        | the published forms are `bun run merge` and `bun run node:merge`, but the field is the command as a user types it, arguments and paths included; a shape admitting them degenerates, and `IMPL` already pins the falsifiable half |
| `DATATABLE.KEY`      | **`json_key`**, new `SHAPE` `[a-z][A-Za-z0-9]*` | the one string a command consumes: Q3 is `jq '.[] \| select(.<KEY>=="X")'`, so a prose value breaks the reading loop silently. The four planned tables key on `worldObjectName`, `gId` and `numericId`                            |
| `HYPOTHESIS.UNTIL`   | `@TASK\|string`                                 | already half typed; the string half is an observable condition, which no shape describes                                                                                                                                          |

Nothing else remains: `INDEX` and `LEGACY_INDEX` are `uint`, `HOLDS_FOR` and `DOMAIN` are enums, `ATTESTED_BY`,
`OBSERVED_IN`, `IMPL`, `TABLE` and `JSON_SCHEMA` are anchors, and every reference field is `@TYPE`.

### « A field legal in one state alone »

Four fields survived outside the block that conditions them, all four declared by S4 at type level with `REQUIRED`
added in the block. They are now declared **inside their blocks and nowhere else**:

| Field                  | Was                                             | Is                                                                |
|------------------------|-------------------------------------------------|-------------------------------------------------------------------|
| `SECTION.INDEX`        | type level, REQUIRED under `current` and `both` | declared in `WHEN HOLDS_FOR current` and in `WHEN HOLDS_FOR both` |
| `SECTION.LEGACY_INDEX` | type level, REQUIRED under `legacy` and `both`  | declared in `WHEN HOLDS_FOR legacy` and in `WHEN HOLDS_FOR both`  |
| `RULE.CONFLICT`        | type level, REQUIRED under `merge`              | declared in `WHEN DOMAIN merge`                                   |
| `RULE.RESOLUTION`      | type level, REQUIRED under `merge`              | declared in `WHEN DOMAIN merge`                                   |

This closes the two « accepted in silence » lines of S4 and refutes the conclusion S4 drew from them — « the era
fields are a convention on `legacy` » — recorded as starter defect 17. `RULE.APPLIES_TO_SECTION` stays at type
level deliberately: a `format` rule constrains a section too, and only its `REQUIRED` belongs to the merge case.

What the monotonicity of `WHEN` still prevents: a field legal everywhere **except** one state has no declaration —
the only way to forbid is to declare in each state that admits it, so `INDEX` is written twice and `LEGACY_INDEX`
twice. The keying fields themselves, `HOLDS_FOR` and `DOMAIN`, can never be conditioned. And `GATE suppressed`
still extinguishes these blocks on an archived entity (S5, defect 12): the refusals below hold on active entities.

### P10 probes

Run in `<scratchpad>/probe`, a copy of the **whole** workspace — `docs/_schema.awawa`, both areas, 230 entities —
plus one probe file of 22 entities, each conditional declaration written once satisfied and once violated. Baseline
before the probe entities: 361 `L016`, factitious (the probe root holds `docs/` alone), 0 other finding; every count
below is of non-`L016` findings.

| Schema line                                                                                                                         | Expected                                                        | Observed                                                                                                                                                                                                                                                                                    |
|-------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `SOURCE` with no `REF`, on a `RULE`                                                                                                 | `L006`                                                          | **refused**: `L006 required field REF is absent from RULE.SOURCE` — `SCHEMA *` fields behave on the five new types as on `DECISION`                                                                                                                                                         |
| `ATTESTED_BY "docs/energy-levels.md::NoSuchLiteralAnywhere"`                                                                        | `L016` naming file and literal                                  | **refused**: ``L016 field ATTESTED_BY: `NoSuchLiteralAnywhere` does not occur in ./docs/energy-levels.md``; a missing path reads differently — `anchor path … does not exist under the workspace root`                                                                                      |
| `KEY "the name of the world object"`                                                                                                | `L007`                                                          | **refused**: `L007 field KEY expects json_key, given "the name of the world object"`                                                                                                                                                                                                        |
| `SHAPE json_key` on boundary values                                                                                                 | accept a JSON property name, refuse anything else               | **imposed**: `"g"` and `"gId2"` accepted, bare `worldObjectName` accepted (a shape matches quoted or bare), `"WorldObjectName"` and `"world_object_name"` refused                                                                                                                           |
| `NAME version_segment` on `2.102`, `2.102b`, `2`                                                                                    | the dot is a segment separator, so each segment is checked      | **imposed**: `2.102` and `2` clean, `2.102b` raises `L024 name 2.102b misses shape version_segment: segment 102b`; `@GAME_RELEASE.2.102` resolves as a reference target                                                                                                                     |
| `INDEX 9` on a `HOLDS_FOR legacy` section                                                                                           | refusal, the field belonging to the two other eras              | **refused**: `L003 field INDEX is not declared on SECTION` — the S4 silent acceptance, closed                                                                                                                                                                                               |
| `CONFLICT` and `RESOLUTION` on a `DOMAIN format` rule                                                                               | refusal                                                         | **refused**: two `L003` — the other S4 silent acceptance, closed                                                                                                                                                                                                                            |
| `INDEX` declared in `WHEN HOLDS_FOR current` **and** in `WHEN HOLDS_FOR both`                                                       | a field may be declared in several mutually exclusive blocks    | **accepted**: 0 `L013`, and the same for `LEGACY_INDEX` in `legacy` and `both`                                                                                                                                                                                                              |
| `HOLDS_FOR current` with no `INDEX`                                                                                                 | refusal                                                         | **refused**: `L006 required field INDEX is absent from SECTION`, plus `L026` on the uncited twin                                                                                                                                                                                            |
| Conforming entities: one `SECTION` per era, a merge `RULE`, a `DATATABLE`, a `COMMAND`, a `HYPOTHESIS`, a `GAME_RELEASE`, two `URL` | clean                                                           | **accepted**: 0 finding                                                                                                                                                                                                                                                                     |
| `--skip provenance` on a new type                                                                                                   | removes `SOURCE` as it does on `DECISION`                       | **imposed**: `context @RULE.ProbeMergeOk --depth 1` 27 lines → 13, and the footer names the pruned sources — `// skipped (provenance): @GAME_RELEASE.2.102 @URL.WikiMachineOptimizers, 1 field on @RULE.ProbeMergeOk, 1 field on @SECTION.ProbeCurrentOk`. `DECISION` prints the same shape |
| `awawa new` after the moves                                                                                                         | the skeleton stops offering a conditional field unconditionally | **imposed**: `SECTION` and `RULE` skeletons no longer list `INDEX`, `LEGACY_INDEX`, `CONFLICT` or `RESOLUTION` among the optional fields; the `WHEN` footer lines still name them. `INCOMING CONSTRAINED_BY` is still unprinted (binary defect B1)                                          |

No line is « accepted in silence » this time: the two that were, in S4, are the two now refused.

### Gate

`awawa fmt . && awawa lint --strict .` at the repository root, same turn as the writes: **exit 0, 0 error, 0
warning**, 13 files, 236 entities.

### Files

| File                                                                        | State                                                                                                                                                                                                                    |
|-----------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `docs/_schema.awawa`                                                        | `SHAPE version_segment`, `SHAPE json_key`, `SCHEMA GAME_RELEASE`; `SECTION` and `RULE` conditional fields moved into their `WHEN` blocks; `DATATABLE.KEY` takes `json_key`; the `SOURCE.REF` `DESC` names `GAME_RELEASE` |
| `docs/awawa-project-methodology/decisions.awawa`                            | `@DECISION.AGameReleaseIsCitedAsASource`, `@DECISION.AnExternalPageIsCitedAtTheAddressRead`, `@DECISION.AFieldLegalInOneStateIsDeclaredInThatStateAlone`                                                                 |
| `AGENTS.md`                                                                 | two paragraphs — « Un champ légal dans un seul état n'est déclaré que là » and « Une observation dans le jeu cite sa version » — and `@GAME_RELEASE` added to the `SOURCE` bullet                                        |
| `docs/awawa-usage-reports/specification-walk/2026-09-17-starter-defects.md` | defects 16, 17 and 18; header, count and scope paragraph updated                                                                                                                                                         |

No `URL` nor `GAME_RELEASE` entity is written yet: a source entity is written by the first entity that cites it,
which is S7. `@PROJECT.PCST` remains the `REF` of the walk's own `SOURCE` lines.

## Review of the schema (S6 to S7 boundary, 2026-09-18)

The permanent review step, now that defect 15 has made it one.

### Verdict

The road holds. Nothing of S2 to S6 is reopened. One point was ruled and written in the same turn; four are read and
left as they are, each with the reason.

| #  | Point                                                                                                                                                                                                                 | Ruling                                                                                                                                                                                                                                        |
|----|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| R5 | The `DESC` of `SOURCE.REF` listed the four source types by name and no longer covered `GAME_RELEASE`, so the instruction the author reads on every `--with-schema` package was false the moment the type was declared | Rewritten in the same turn. The lesson is general: a `DESC` enumerating the types of a slot is a second declaration, maintained by hand — it is kept only while the enumeration is short, and a fifth type would make the list the wrong home |

| Point                                                                                               | Why no change                                                                                                                                                                                                                                                                                                                                                                 |
|-----------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `HYPOTHESIS.OBSERVED_IN` carries no `CATEGORY`, while both `ATTESTED_BY` fields carry `attestation` | It is not an attestation but its opposite — where a statement was seen without being proven — and Q4 exists to read it; putting it under `attestation` would let a reader skip the answer to their own question                                                                                                                                                               |
| Nothing requires a `URL` or a `GAME_RELEASE` to be cited, so an orphan source entity is silent      | `INCOMING` lives in a `WHEN` block, and neither type declares a field to key one on; `SCHEMA *` cannot carry it either, since the pivot `RULE` legitimately has no incoming edge. The guard is the cleanup pass reading the incoming count `status TYPE` prints, as for `PULL_REQUEST` and `USAGE_REPORT`, whose `DESC` already says they are deleted once nothing cites them |
| `json_key` refuses a nested path such as `a.b`                                                      | No planned table keys on a nested field; the day one does, the shape widens without breaking an entity                                                                                                                                                                                                                                                                        |
| `GAME_RELEASE` declares no field of its own                                                         | Its identity is the version and `NAME version_segment` checks it; a `RELEASED_ON date` would be a fact the project cannot attest                                                                                                                                                                                                                                              |

## S7 — First entities (2026-09-18)

### Ordering ruled before the first entity was written

| Type         | REQUIRED anchors                | Do they resolve today                                                                                                                                                  | Ruling                                                                                                                                                                                                                                                                                                                                 |
|--------------|---------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `DATATABLE`  | `TABLE`, `JSON_SCHEMA`          | **No.** The five tables are TypeScript modules; no JSON file and no JSON Schema exists, and `@DECISION.AnAnchorNamesAFileTrackedByGit` forbids anchoring anything else | **The five `DATATABLE` wait for a task.** `@TASK.CHORE52` (draft) carries the whole move: five JSON files, five JSON Schemas, a `validate:tables` gate, the modules rewired to import the JSON, the five entities with `TABLE`/`KEY`/`JSON_SCHEMA`, `VALUES_FROM` written on the rules with authority, and the markdown tables deleted |
| `COMMAND`    | `IMPL`                          | **Yes**, `merge-cli.js` and `validate-cli.js`                                                                                                                          | Written in this step, unblocked                                                                                                                                                                                                                                                                                                        |
| `SECTION`    | `ATTESTED_BY`                   | **Yes**, the index module, the root JSON Schema and a committed fixture                                                                                                | Written in this step                                                                                                                                                                                                                                                                                                                   |
| `RULE`       | `ATTESTED_BY` under each `SPEC` | **Yes**, the merge rule specs and the serialization specs                                                                                                              | Written in this step                                                                                                                                                                                                                                                                                                                   |
| `HYPOTHESIS` | `UNTIL`                         | not an anchor                                                                                                                                                          | Written in this step                                                                                                                                                                                                                                                                                                                   |

Rejected, with the reason: **creating the JSON files in S7 and rewiring the modules later** — every value would then
have two homes until the rewiring landed, which is the duplication the move exists to end; **writing the five
`DATATABLE` against the TypeScript modules** — `TABLE` names the file holding the rows, and a module that restates
them is not that file. Both are `REJECTED` lines of `@DECISION.AValueTableIsRecordedOnceItsFileExists`.

### Order of arrival: a section never alone

`INCOMING CONSTRAINED_BY` on `WHEN HOLDS_FOR current` and `WHEN HOLDS_FOR both` makes a `SECTION` with no rule an
`L026`. The twelve sections therefore arrived paired, in save index order, each with the rule that cites it:

| #  | `SECTION`              | Era    | `INDEX` / `LEGACY_INDEX` | The rule written with it                                                            | Committed witness (`ATTESTED_BY`)                                                                                                                                                                  |
|----|------------------------|--------|--------------------------|-------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| 1  | `GlobalMetadata`       | both   | 0 / 0                    | `GlobalMetadataIsSummedAndUnioned`                                                  | `sectionIndexes.js::GLOBAL_METADATA_SECTION_INDEX = 0`, `save-file.schema.json::Section 0 — Player progression`, `normalizeRawSections.js::rawParts.slice(0, LEGACY_TERRAIN_LAYERS_SECTION_INDEX)` |
| 2  | `TerraformationLevels` | both   | 1 / 1                    | `TerraformationLevelsTakeTheHigherValue`                                            | the same three, `TERRAFORMATION_LEVELS_SECTION_INDEX = 1`                                                                                                                                          |
| 3  | `Players`              | both   | 2 / 2                    | `PlayersAreDeduplicatedByName`                                                      | the same three, `PLAYERS_SECTION_INDEX = 2`                                                                                                                                                        |
| 4  | `WorldObjects`         | both   | 3 / 3                    | `WorldObjectsAreDeduplicatedByPlanetAndPosition`                                    | the same three, `WORLD_OBJECTS_SECTION_INDEX = 3`                                                                                                                                                  |
| 5  | `Inventories`          | both   | 4 / 4                    | `InventoriesAreKeptUnlessTheirOwnerIsEjected`                                       | the same three, `INVENTORIES_SECTION_INDEX = 4`                                                                                                                                                    |
| 6  | `Statistics`           | both   | 5 / 5                    | `StatisticsAreSummed`                                                               | the same three, `STATISTICS_SECTION_INDEX = 5`                                                                                                                                                     |
| 7  | `MailboxMessages`      | both   | 6 / 6                    | `MailboxMessagesAreDeduplicatedByStringId`                                          | the same three, `MAILBOX_MESSAGES_SECTION_INDEX = 6`                                                                                                                                               |
| 8  | `StoryEvents`          | both   | 7 / 7                    | `StoryEventsAreUnioned`                                                             | the same three, `STORY_EVENTS_SECTION_INDEX = 7`                                                                                                                                                   |
| 9  | `SaveConfiguration`    | both   | 8 / 8                    | `SaveConfigurationComesFromSaveA`, `TheSaveOnPrimeBecomesSaveA`                     | the same three, `SAVE_CONFIGURATION_SECTION_INDEX = 8`                                                                                                                                             |
| 10 | `WorldEvents`          | both   | 9 / 10                   | `WorldEventsAreDeduplicatedByPlanetSeedAndPosition`                                 | `WORLD_EVENTS_SECTION_INDEX = 9`, `LEGACY_WORLD_EVENTS_SECTION_INDEX = 10`, `save-file.schema.json::Section 9 — World events`                                                                      |
| 11 | `Reserved`             | both   | 10 / 11                  | `ASaveHasElevenSectionsTheLastReservedAndEmpty`                                     | `RESERVED_TRAILING_SECTION_INDEX = SAVE_SECTIONS_COUNT`, `const LEGACY_SAVE_SECTIONS_COUNT = 11`, `save-file.schema.json::Section 10 — Reserved`                                                   |
| 12 | `TerrainLayers`        | legacy | — / 9                    | none — `legacy` carries no `INCOMING`, so it is the only section that arrives alone | `LEGACY_TERRAIN_LAYERS_SECTION_INDEX = 9`, `legacy-format_valid.json::PC-Toxicity-Layer2`                                                                                                          |

Not one witness is a reference save: `@DECISION.AnAnchorNamesAFileTrackedByGit` forbids it, and the three families
used — the index module, the root JSON Schema, one e2e fixture — are all tracked. `LABEL` is taken from
`saveSectionLabels.js`, the table ruling 4 made the single reference, which is why section 0 is `Global metadata`
and not the `Player Progression` of `save-format.md`; `@LIMITATION.SectionLabelsDivergeFromTheGameRulesDocument`
had its `UNTIL` retargeted onto `SECTION.LABEL` accordingly.

Then, after the twelve pairs: the three cross-section rules (`IdentifiersAreSharedByInventoriesAndWorldObjects`,
`APlayerIdentifierIsCarriedAsExactDecimalText`, `DuplicateIdentifiersAreRemappedOnTheSaveBSide`), the three
remaining format rules, the five hypotheses, then the two commands, whose `APPLIES` needs every rule to exist.

### `FACT` migration, performed

| Site                        | Count | What was done                                                                                                                                                                                                                                                                                                                      |
|-----------------------------|-------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Entities                    | 8     | 4 `BASIS attested` → `RULE DOMAIN format`; 4 `BASIS hypothesis` → `HYPOTHESIS`. Names kept, so every reference by identity survives. `AnAnimalHungerLevelLiesBetweenMinus100And100` had its `ATTESTED_BY` become `OBSERVED_IN`                                                                                                     |
| Incoming edges              | 6     | 4 `RESTS_ON @FACT` → `RESTS_ON @RULE`; 1 `RESTS_ON @FACT.APlayerIdentifier…` → `ASSUMES @HYPOTHESIS.APlayerIdentifier…`; 1 `RATIONALE.REF @FACT.ProceduralWrecks…` → `REF @HYPOTHESIS.ProceduralWrecks…`. The five `RESTS_ON` are the five `GROUNDS` edges S2 counted; the sixth site was found by `awawa refs`, not by that count |
| Schema field                | 1     | `FIELD RESTS_ON @FACT` → `FIELD RESTS_ON @RULE`, `DESC` rewritten                                                                                                                                                                                                                                                                  |
| Schema entry                | 1     | `SCHEMA FACT` deleted, verified after `grep -rn '@FACT'` over `docs/`, `packages/` and `AGENTS.md` returned nothing                                                                                                                                                                                                                |
| Files                       | 1     | `docs/awawa-project-methodology/facts.awawa` deleted                                                                                                                                                                                                                                                                               |
| Mentions outside the corpus | 2     | `AGENTS.md:75` (the model entity of the type) and `packages/core-mapping/src/presentation/worldObjectLabels.ts:662` (the code comment `@DECISION.ACodeCommentQuestionNamesItsCorpusEntity` requires)                                                                                                                               |

Verification order: `awawa refs @FACT.<name>` per entity **before** any deletion, then the repointing, then the
deletion of the type, then `grep -rn '@FACT'` over the repository, then the gate. The code comment edit is the only
change of this step outside `docs/` and `AGENTS.md`.

### Coverage of the documents the entities replace

| Source                                                     | Where it went                                                                                                                                                                                                                                                         |
|------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `game-rules.md` §1, general principles                     | already `@DECISION.AMergeProducesAnOrdinarySave`, `@DECISION.AMergeThatWritesAFileIsASuccess`, `@DECISION.ValidationIsTheSingleSourceOfWarnings` — ours to choose, so `DECISION` and not `RULE`                                                                       |
| `game-rules.md` §2 to §13, GR-ORDER-1 to GR-ID-7, 30 rules | 14 `RULE DOMAIN merge`, one per section of the document, each `GR-*` becoming one `SPEC`; §13 split in three so that ruling 11 (`DOMAIN` REPEATABLE) is exercised on the two rules it was verified against, GR-ID-1 and GR-ID-7                                       |
| `game-rules.md` « Implementation: » lines                  | nothing — see R7 below                                                                                                                                                                                                                                                |
| `save-format.md` general structure                         | `ASaveHasElevenSectionsTheLastReservedAndEmpty`, `ASectionLineIsOneJsonEntry`                                                                                                                                                                                         |
| `save-format.md` §#0 to §#10 headings                      | the twelve `SECTION`                                                                                                                                                                                                                                                  |
| `save-format.md` per-field tables, ERD, cross-section map  | dropped, S2 ruling: the JSON Schemas are the contract and the map is derived                                                                                                                                                                                          |
| `save-format.md` §#2 int64 note                            | `ThePlayerIdentifierIsTheOnlyInt64FieldBeyondDoubleRange`, `APlayerIdentifierIsCarriedAsExactDecimalText`                                                                                                                                                             |
| `save-format.md` §#3, the rarest three                     | `hunger` → `@HYPOTHESIS.AnAnimalHungerLevelLiesBetweenMinus100And100`; `woIds` → `@HYPOTHESIS.AWorldObjectMayCarryALinkedObjectList`; `liPlanet` → **`@HYPOTHESIS.ALinkedInventoryPlanetIsCarriedOnlyByAnExchangePlatform`, found by this table and by nothing else** |
| `save-format.md` « Planet numeric IDs »                    | **`@RULE.APlanetNumericIdIsStableAcrossSaves`, found by this table and by nothing else**; the lookup itself is a `DATATABLE` of `@TASK.CHORE52`                                                                                                                       |
| `save-format.md` backward-compatibility paragraph          | `SECTION.TerrainLayers` for the fact, `@DECISION.ValidationIsTheSingleSourceOfWarnings` for the behaviour                                                                                                                                                             |
| `save-format.md` appendix, 6 legacy properties             | `@TASK.CHORE52`                                                                                                                                                                                                                                                       |
| `energy-levels.md`                                         | untouched by S7: §1, §2 and §3.1 are `DATATABLE` (CHORE52), §3.2 and §4 are `RULE DOMAIN game` whose `VALUES_FROM` needs those tables, §5 and §6 are already `DECISION` entities (S2 plan). The document is the one of the three S8 cannot delete yet                 |

The two entities in bold are the measure of defect 21: P1 scored 0 and P2 scored its predicted call counts with both
statements still missing. Neither measure looks at coverage.

### Counts

| Type                  | Written in S7                                                   | Corpus total |
|-----------------------|-----------------------------------------------------------------|--------------|
| `SECTION`             | 12                                                              | 12           |
| `RULE`                | 19 (4 retyped from `FACT`, 14 merge, 1 new format)              | 19           |
| `HYPOTHESIS`          | 5 (4 retyped from `FACT`, 1 new)                                | 5            |
| `COMMAND`             | 2                                                               | 2            |
| `DATATABLE`           | 0 — `@TASK.CHORE52`                                             | 0            |
| `GAME_RELEASE`, `URL` | 0 — no entity of S7 cites a wiki page or an in-game observation | 0            |
| `DECISION`            | 2                                                               | 102          |
| `TASK`                | 1 (`CHORE52`, draft)                                            | 19           |
| `FACT`                | −8, type deleted                                                | 0            |

Workspace after the step: **12 files, 268 entities, 514 reference sites, 0 unresolved.**

### P1 — entities the S2 threshold should have refused: **0**

Each of the five thresholds was applied to each entity written. The one borderline, named rather than hidden:
`SECTION Reserved` — « only if the game writes this part of the save at a fixed index ». The game writes no entry
there; what it writes is the terminating separator that produces the part. Kept, because the index is fixed, the
root JSON Schema declares it as `Section 10 — Reserved` with `maxItems: 0`, and a save with an entry there is
observably wrong. No entity was deleted and no `REQUIRED` was tightened.

### P2 — the five questions of S3 on the real entities

| #  | Question                                                    | Command                                                                                                | Calls predicted                                                  | Calls measured                                                                                                                                            | Verdict                |
|----|-------------------------------------------------------------|--------------------------------------------------------------------------------------------------------|------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------|
| Q1 | What does the save carry in section X?                      | `awawa context @SECTION.Players --skip reasoning --skip provenance --skip attestation .`               | 1 + 1 for the rules' `SPEC`                                      | **1** for the section — 1 entity, 5 lines — the five constraining rules arriving as identities under `CONSTRAINED_BY`; **+1** when their `SPEC` is wanted | as predicted           |
| Q2 | How does the merge settle a conflict on section X?          | the same call                                                                                          | 1 shared with Q1, +1 where the identity does not tell the domain | **1** shared; `awawa status RULE --where DOMAIN==merge .` is the second call and returns 14 of 18, which intersects the footer exactly                    | as predicted           |
| Q3 | What is the value for object X?                             | `jq` on the file named by `DATATABLE.TABLE`                                                            | 0 awawa                                                          | **not measurable**: no `DATATABLE` exists until `@TASK.CHORE52`. The reading loop's third question is the one the ordering ruling postpones               | postponed, not refuted |
| Q4 | What would retire this hypothesis, and what rests on it?    | `awawa context @HYPOTHESIS.AWorldObjectMayCarryALinkedObjectList --skip reasoning --skip provenance .` | 1                                                                | **1** — 1 entity, 4 lines, `UNTIL` in the body and `// GROUNDS (root, 1): @RULE.DuplicateIdentifiersAreRemappedOnTheSaveBSide` in the footer              | as predicted           |
| Q5 | What does command X promise, and which rules does it apply? | `awawa context @COMMAND.MergeSaves --depth 2 --skip reasoning --skip provenance --skip attestation .`  | 1, fully expanded                                                | **1** — 31 entities, 304 lines: the 17 rules expanded, the 11 sections they constrain, the 2 hypotheses they assume                                       | as predicted           |

No edge direction is revised. One observation the measure adds: Q5's single call returns 304 lines, of which the
three `skipped` footer lines are a large share, each enumerating every pruned field by entity. The package is
complete in one call, which is what D1 was chosen for, and it is the largest package the corpus produces.

### P10 probes

Run in `<scratchpad>/probe`, built from `git ls-files` so the copy holds **every file git tracks** — `docs/`,
`packages/`, the manifests — and the anchors resolve for real. Baseline before the probe file: **0 error, 0 warning,
12 files, 266 entities, and 0 `L016`**, the first step of the walk whose probe workspace has no factitious finding.
That is the remediation of defect 18 carried out. One conforming and one non-conforming entity per declaration the
step touches; 19 probe entities, 14 findings, all on the non-conforming half.

| Declaration the step touches                                                                         | Expected                             | Observed                                                                                                                                                                                                                                                                                                                                                       |
|------------------------------------------------------------------------------------------------------|--------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `SECTION` `WHEN HOLDS_FOR current` → `INCOMING CONSTRAINED_BY`, on a section no rule cites           | refusal                              | **imposed**: `L026 nothing refers to SECTION ProbeOrphanSection under CONSTRAINED_BY, which WHEN HOLDS_FOR current on SCHEMA SECTION requires`, and it names `docs/_schema.awawa:298` as the second site. Silent on the cited twin                                                                                                                             |
| `SECTION.ATTESTED_BY` REQUIRED                                                                       | refusal when absent                  | **refused**: `L006 required field ATTESTED_BY is absent from SECTION`                                                                                                                                                                                                                                                                                          |
| `RULE.SPEC.ATTESTED_BY` REQUIRED, nested                                                             | refusal when a `SPEC` carries none   | **refused**: `L006 required field ATTESTED_BY is absent from RULE.SPEC`, located on the `SPEC` line                                                                                                                                                                                                                                                            |
| `RULE` `WHEN DOMAIN merge` → `CONFLICT`, `RESOLUTION`, `APPLIES_TO_SECTION`                          | three refusals on one entity         | **refused**: three `L006` on `ProbeMergeWithoutConflict`; silent on `ProbeMergeComplete`                                                                                                                                                                                                                                                                       |
| `HYPOTHESIS.UNTIL` REQUIRED                                                                          | refusal when absent                  | **refused**: `L006 required field UNTIL is absent from HYPOTHESIS`                                                                                                                                                                                                                                                                                             |
| `COMMAND.IMPL` anchor                                                                                | refusal when the path does not exist | **refused**: `L016 field IMPL: anchor path packages/cli-merge/cli/there-is-no-such-file.js does not exist under the workspace root`                                                                                                                                                                                                                            |
| `COMMAND.APPLIES @RULE`                                                                              | refusal of a `@SECTION`              | **refused**: `L009 field APPLIES expects @RULE, given @SECTION.ProbeCitedSection`                                                                                                                                                                                                                                                                              |
| `DATATABLE.JSON_SCHEMA` REQUIRED (R2 of the S5–S6 review, first exercised here)                      | refusal when absent                  | **refused**: `L006 required field JSON_SCHEMA is absent from DATATABLE`                                                                                                                                                                                                                                                                                        |
| **`DECISION.RESTS_ON` retargeted `@FACT` → `@RULE`**                                                 | a `@HYPOTHESIS` there is refused     | **refused**: `L009 field RESTS_ON expects @RULE, given @HYPOTHESIS.ProbeHypothesisComplete`; the `@RULE` twin is silent                                                                                                                                                                                                                                        |
| **`DECISION.ASSUMES @HYPOTHESIS`**, the other half of the split                                      | a `@RULE` there is refused           | **refused**: `L009 field ASSUMES expects @HYPOTHESIS, given @RULE.ProbeCitingRule`                                                                                                                                                                                                                                                                             |
| **`SCHEMA FACT` deleted** — an entity of the deleted type                                            | refusal                              | **refused**: `L002 no SCHEMA entry for entity type FACT`                                                                                                                                                                                                                                                                                                       |
| **`SCHEMA FACT` deleted** — a surviving `@FACT.X` reference                                          | refusal                              | **refused**, and by the type check rather than by resolution: `L009 field RESTS_ON expects @RULE, given @FACT.ProbeFactOfADeletedType`. Worth knowing: had `RESTS_ON` kept a generic `reference` type, the reference would have resolved to an entity of a type with no schema, and only `L002` on the target would have reported the migration was unfinished |
| One conforming entity per type — `SECTION`, `RULE`, `HYPOTHESIS`, `COMMAND`, `DATATABLE`, `DECISION` | clean                                | **accepted**: 0 finding on the six                                                                                                                                                                                                                                                                                                                             |

No line is « accepted in silence ». Every declaration this step touches either imposed or refused.

### Gate

`awawa fmt . && awawa lint --strict .` at the repository root, same turn as the writes: **exit 0, 0 error, 0
warning**, 12 files, 268 entities, 514 reference sites, 0 unresolved. `awawa fmt --check .` exits 0.

### Files

| File                                                                        | State                                                                                                                                                                                                                                                                                                                 |
|-----------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `docs/_schema.awawa`                                                        | `FIELD RESTS_ON @FACT` → `@RULE`; `SCHEMA FACT` deleted. No other change: S7 added no declaration                                                                                                                                                                                                                     |
| `docs/awawa-project-specification/sections.awawa`                           | 12 `SECTION`                                                                                                                                                                                                                                                                                                          |
| `docs/awawa-project-specification/rules.awawa`                              | 19 `RULE`                                                                                                                                                                                                                                                                                                             |
| `docs/awawa-project-specification/hypotheses.awawa`                         | 5 `HYPOTHESIS`                                                                                                                                                                                                                                                                                                        |
| `docs/awawa-project-specification/commands.awawa`                           | 2 `COMMAND`                                                                                                                                                                                                                                                                                                           |
| `docs/awawa-project-specification/datatables.awawa`                         | still empty, by ruling                                                                                                                                                                                                                                                                                                |
| `docs/awawa-project-methodology/facts.awawa`                                | deleted                                                                                                                                                                                                                                                                                                               |
| `docs/awawa-project-methodology/decisions.awawa`                            | 6 edges repointed; `@DECISION.ASectionIsWrittenWithTheRuleThatCitesIt` and `@DECISION.AValueTableIsRecordedOnceItsFileExists` added                                                                                                                                                                                   |
| `docs/awawa-project-methodology/limitations.awawa`                          | `SectionLabelsDivergeFromTheGameRulesDocument.UNTIL` retargeted onto `SECTION.LABEL`                                                                                                                                                                                                                                  |
| `docs/awawa-project-methodology/tasks.awawa`                                | `@TASK.CHORE52`, draft                                                                                                                                                                                                                                                                                                |
| `AGENTS.md`                                                                 | `facts.awawa` removed from the file list; the model entity list re-pointed at the five specification types; the « quel type » paragraph rewritten without `FACT`; two paragraphs added — « Une section arrive avec la règle qui la cite » and « Une table de valeurs n'est enregistrée qu'une fois son fichier créé » |
| `packages/core-mapping/src/presentation/worldObjectLabels.ts`               | the code comment repointed at `@HYPOTHESIS.ProceduralWrecksAreSpawnedByThePortalGenerator`                                                                                                                                                                                                                            |
| `docs/awawa-usage-reports/specification-walk/2026-09-17-starter-defects.md` | defects 19, 20 and 21; header, count and scope paragraph updated                                                                                                                                                                                                                                                      |

### Rulings of 2026-09-18, S7

13. The five `DATATABLE` wait for `@TASK.CHORE52`; no JSON file is created in this step.
14. A `SECTION` and the `RULE` that cites it are written in the same pull request, by pairs, in save index order.
15. `game-rules.md` §1 stays `DECISION`: it is what the tool chose to do, not what a save can contradict.
16. The « Implementation: » lines of `game-rules.md` get no field — see R7.
17. Two `COMMAND`, not four: `bun run node:merge` reaches the same entry point on the other runtime, and the parity
    of the two runtimes is `@DECISION.NodeCommandsRunSourcesThroughModuleHooks`, not a second command.

## Review of the schema (S7 to S8 boundary, 2026-09-18)

The permanent review step. Nothing of S2 to S6 is reopened.

### Verdict

The road holds, and this is the first review run against real entities rather than probes. **No schema line is
changed by it.** Two points are raised and ruled; three are read and left as they are.

| #  | Point                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | Ruling                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
|----|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| R6 | Nine anchors of the methodology area name the documents S8 deletes: eight `IMPL` — `@DECISION.MergeRulesHaveOnePublicHome` on `game-rules.md`, `@DECISION.WorldObjectNamesAreAttestedBySourceOrSave` ×2 on `energy-levels.md`, `@DECISION.AnInt64IdentifierIsCarriedByItsDecimalText::GR-ID-7`, `@DECISION.APlayerIdentityIsCarriedByItsEntry::GR-PLAYER-2` and `::GR-ID-6`, `@DECISION.AnUnprintedEnergyValueIsNeitherInferredNorZero`, `@DECISION.AMergeIntroducesNoIdOverlapAbsentFromItsInputs::GR-ID-1` — and one `SEEN_IN` on `@LIMITATION.SectionLabelsDivergeFromTheGameRulesDocument` | **Nothing is rewritten now**: the nine are true today, and rewriting them before the documents go would make the corpus false for the duration. The check that they are not forgotten is the gate itself — deleting a document raises `L016` on every anchor into it, in the same turn — so S8 cannot delete a document silently. `@DECISION.MergeRulesHaveOnePublicHome` is the one that needs a rewriting and not a repointing: its first `SPEC` says the document *is* the single public source of the merge rules, which stops being true, and the successor statement is that the corpus is. Listed in the S8 prompt                                                                                                                                                                                            |
| R7 | `game-rules.md` carries an « Implementation: » line per section, some 25 module paths, and no field of `RULE` holds them; deleting the document loses the rule-to-module mapping                                                                                                                                                                                                                                                                                                                                                                                                               | **No field added.** `RULE.SPEC.ATTESTED_BY` is REQUIRED under every obligation and names the spec that proves it; `@DECISION.TheFirstDescribeNamesTheRuleTheSpecCovers` makes that spec's first `describe` name the rule in business language, and the spec sits in the same directory as the module it covers. The mapping is therefore one hop from an anchor the schema already requires, and an `IMPLEMENTED_BY anchor` on `RULE` would be a second anchor per obligation, maintained by hand, reaching what the first already reaches — the same objection D1 raised against a hand-written `CONSTRAINED_BY`. The one case it does not serve, a rule whose attesting spec is not named after it (GR-WO-3, attested by `collectEjectedPlayerInventoryIds.spec.ts`), is served by the spec's own first `describe` |

| Point                                                                                                                                                             | Why no change                                                                                                                                                                                                                                                                                                                                   |
|-------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `RULE` has no field for the merge key, which `game-rules.md` states per section (`planetId`, `name`, `planet:pos`, `stringId`, the triplet)                       | The key is the first half of `CONFLICT`, which is REQUIRED under `WHEN DOMAIN merge` and says what the two saves disagree on; every one of the 14 merge rules names its key there. A `MERGE_KEY` field would be a second home for it, and no question of S3 asks for the key alone                                                              |
| Nothing requires a `RULE` to be applied by a `COMMAND`, so a merge rule no command applies is silent                                                              | Same shape as the `URL` and `GAME_RELEASE` point ruled on the S6 to S7 boundary, and the same answer: `INCOMING` lives in a `WHEN` block, and the pivot `RULE` legitimately has rules no command applies — the four format rules of the save are true whether or not a command reads them. The guard is the incoming count `status RULE` prints |
| `COMMAND.INVOCATION` is single, so one command with two published forms (`bun run merge`, `bun run node:merge`) is either two entities or one that names one form | Ruling 17 keeps one entity per command; the field can be made `REPEATABLE` later without breaking an entity, which the reverse is not                                                                                                                                                                                                           |

## S7 closed by the owner, 2026-09-18

Two points raised at the confirmation, both about the walk and neither about the corpus:

- **Recorded as starter defect 22**: a step's closing formula asks for results and never for the files the step
  touched, so the owner had to find them to re-read them before confirming. Applied from this step on: the answer
  lists the files created, modified and deleted before the confirmation question.
- **Analysed 2026-09-18, section « The cost of a step » below; the fifty turns are dropped as a defect, a narrower
  candidate is proposed in their place**: S7 cost roughly fifty turns on its own. Either
  that is what the step is worth — thirty-eight entities, a type migration, two measures and thirteen probe lines —
  or something in the step's shape is paying for itself twice. The analysis is owed at the end of the session, and
  it is not a defect until it is measured: what to measure is the split between reading the sources, generating the
  entities, and the gate-and-probe loop, against what each produced.

## The cost of a step — the analysis owed at S7's close, 2026-09-18

Measured on the session transcripts, one session per step
(`~/.claude/projects/-home-chillie-Web-planet-crafter-save-tools/*.jsonl`),
counting API turns rather than messages. « Weighted » is cache read plus cache creation, the figure the session cost
rule of `commands.md` uses.

| Step | Turns | Wall     | Weighted | Output | Context at the last turn | What the step produced                                                |
|------|-------|----------|----------|--------|--------------------------|-----------------------------------------------------------------------|
| S4   | 43    | 39.9 min | 4.45 M   | 52.3 k | 145 k                    | 108 schema lines, 6 files created, 14 probe lines                     |
| S5   | 51    | 42.5 min | 5.80 M   | 64.1 k | 165 k                    | **0 schema line**; the pivot section and 22 probe entities            |
| S6   | 58    | 20.7 min | 7.23 M   | 55.2 k | 177 k                    | 1 source type, the P7 retyping, 3 files changed                       |
| S7   | 54    | 27.5 min | 8.02 M   | 85.1 k | 231 k                    | 38 entities, 8 retyped, the type deleted, 19 probe entities, 11 files |

**The fifty turns are the shape of a step, not the price of S7.** The four steps cost 43, 51, 58 and 54 turns, and
the turn count moves with nothing the step produces: S5 spent 51 turns to add no schema line, S7 spent 54 to write
the whole corpus. On the one metric that does grow — weighted tokens, 4.45 M to 8.02 M — S7 is the step with the
most product per token of the four, and the growth is carried by the context per turn (104 k on average in S4,
148 k in S7), not by the number of turns.

### Where S7's 54 turns went

| Phase                                                         | Turns | Weighted | Output | What it produced                                                                                                |
|---------------------------------------------------------------|-------|----------|--------|-----------------------------------------------------------------------------------------------------------------|
| A — entry, work file and corpus state re-read                 | 7     | 0.42 M   | 1.4 k  | the position; the work file read in three chunks                                                                |
| B — reading the sources                                       | 13    | 1.42 M   | 16.4 k | the material of the 38 entities: both documents, the specs, the index module, the root JSON Schema, the anchors |
| C — writing the entities and the `FACT` migration             | 16    | 2.55 M   | 27.9 k | 38 entities, 6 edges repointed, 2 decisions, `@TASK.CHORE52`, `AGENTS.md`, the code comment                     |
| D — probes and the two measures                               | 6     | 1.09 M   | 9.0 k  | 19 probe entities, 14 findings, P1 and P2; and the coverage reading that found the two missing entities         |
| E — recording (work file, defects 19 to 21, the S7→S8 review) | 8     | 1.64 M   | 19.5 k | 178 lines of work file, 3 defect rows, the S8 prompt                                                            |
| F — the answer                                                | 1     | 0.22 M   | 3.4 k  | —                                                                                                               |
| G — the owner's close (defect 22, the S7b prompt)             | 3     | 0.68 M   | 7.5 k  | 1 defect row, 46 lines of prompt                                                                                |

Three readings of that split:

1. **Writing the corpus is a third of the step**: 16 turns and 2.55 M of 8.02 M. Recording what the step did costs
   as much as doing it — E, F and G together are 12 turns, 2.54 M and 30.4 k of output against C's 27.9 k.
2. **Half the weighted cost is read-only turns**: 32 of the 54 turns ran nothing but reads, for 3.95 M of the
   8.02 M, and 49 of the 54 carried a single tool call. The same shape in every step, worsening: 21 read-only turns
   in S4, 29 in S6, 32 in S7. One file per turn is the agent's habit, not something the starter asks for, and it is
   what makes the context grow inside the step — the last quartile of the turns carries a third of the weighted
   cost, in all four steps.
3. **The sources are re-read from scratch at every step.** The work file — the remediation of defect 1 — carries
   the conclusions of a step and not its readings, so S7 re-read `save-format.md`, `game-rules.md`, the specs and
   the index module that S1 and S2 had already read. 13 turns and 1.42 M before the first write.

### Verdict

Not a defect: the fifty turns as such. The step is worth its turns, and no step of the four is priced by what it
produces.

**Recorded as starter defect 23**, on the owner's ruling of 2026-09-18: a step declares its result and never its
reading list nor its cost, so no step can be seen to be worth its price — S5's 51 turns for no schema line are invisible
in the report,
and S7's 54 turns for the whole corpus read the same. The remediation has two halves: a step names, in the work
file, the sources it read and at which revision, so a later step re-reads only what changed; and a step ends on its
cost — turns and weighted tokens — beside its result, which is the only way a step that pays for itself twice ever
shows up.

**Not the starter's, ours**: one read per turn — 49 of the 54 turns of S7 carried a single tool call, the work file
was read in three separate turns and the twelve independent source readings of the phase took twelve. Own cost of
the ten avoidable turns: **~1.0 M of the 8.02 M**, a floor, the trail left in the context of the following turns not
counted. That is a general rule about how commands are issued, and its road is a pull request on the instructions,
not this report and not the corpus.

## Still to do

Nothing of the flow: S8 ran on 2026-09-18 and closed it, and **S7b ran the same day, after S8** — its section is at
the end of this file. It audited thirty-seven `GR-*`, not the thirty every step had carried, reclassified five and
found three defects.

One question is open, and it is S7b's own: **`SCHEMA RULE`'s `DESC` admits no `DOMAIN merge` statement.** Read
literally, the fourteen merge rules are `DECISION`. S7b did not act on it — S2 and S4 are closed and the
declaration is ruled — and the ruling is the owner's. Two statements of `game-rules.md` also remain with no home,
found by S7b's reading of the document as a control: « the two input files are never modified, the result is written
to a separate output file », which lives in `README.md` alone, and « a save whose player section is not empty and
flags no host is rejected as invalid before the merge », which lives nowhere.

## Resume prompt — S7b

S7 was closed by the owner on 2026-09-18. Before the cleanup, the owner asks for one verification the walk never
planned: the fourteen `RULE DOMAIN merge` were extracted from `docs/game-rules.md` on the document's own word, and
the document is titled « Business Rules ». Nothing checked that every statement in it is really about the merge.

> **S7b, pas inséré avant S8 — Le domaine des règles extraites de `game-rules.md`.** Réponses d'entrée : [fichier de
> travail : `docs/awawa-project-specification/work_in_progress.md`] [corpus : seconde aire du même workspace,
> racine de workspace = racine du dépôt, un seul `SCHEMA *`, à `docs/_schema.awawa:1`] [objet : spécification
> produit] [unité de changement : pull request] [défauts d'outil : `docs/awawa-usage-reports/`] [tables en JSON, un
> JSON Schema par table]. On reste dans le worktree principal, assumé.
> **Obligation permanente, réénoncée à chaque pas** : à la fin du pas, consigner les défauts du starter rencontrés
> pendant le pas dans `docs/awawa-usage-reports/specification-walk/2026-09-17-starter-defects.md`, avec leur
> évidence mesurée et la remédiation proposée. Vingt-deux y sont déjà, plus une section distincte pour les défauts
> du binaire — celle-là alimentera le rapport sur la migration 3, pas le rapport starter.
> **Obligation permanente, nouvelle (défaut 22)** : terminer par la liste des fichiers créés, modifiés et supprimés,
> avec leur chemin, et dire lesquels relire pour confirmer — avant la question de confirmation.
> **Ce qui est clos** — ne rien y rouvrir sans le dire : S2, S3, S4, S5, S6 et S7, et les trois revues de schéma
> (R1 à R7). L'état complet est dans le fichier de travail, pas dans ce prompt.
> - **La question du pas** : les trente règles `GR-*` de `docs/game-rules.md` ont toutes été typées
>   `RULE DOMAIN merge` en S7, sur le mot du document. Vérifier, règle par règle, que c'en est bien une. Une
>   ligne par `GR-*`, avec son verdict : **merge** (deux sauvegardes en désaccord, la fusion tranche), **format**
>   (un fait sur les octets de la save, vrai hors de toute fusion), **game** (un fait sur le jeu), ou **pas une
    > `RULE` du tout** — une décision de validation, de présentation ou d'implémentation qui aurait dû rester une
>   `DECISION`, le critère étant celui de S2 : une `RULE` est fausse pendant que notre code a raison.
> - **Vérifier dans les deux sens.** Le risque symétrique est qu'une règle vraiment de fusion ait été fondue dans
>   une autre : dire, pour chacune des 14 `RULE`, si son `CONFLICT` décrit un vrai désaccord entre deux
>   sauvegardes. `StatisticsAreSummed` et `GlobalMetadataIsSummedAndUnioned` sont les deux à examiner en premier —
>   une somme n'est pas un arbitrage.
> - **Contrôler aussi le document lui-même** : y a-t-il, dans `game-rules.md`, des phrases de validation ou
>   d'affichage qui ne sont ni des règles de fusion ni des faits de format, et qui ont été silencieusement laissées
>   de côté en S7 ? Le tableau de couverture de S7 dit qu'il ne reste que les lignes « Implementation: » et le §1.
> - **Toute reclassification touche une entité déjà écrite** : la corriger en place, sous son nom, la forme
>   précédente devenant un `REJECTED` si elle enseigne quelque chose ; une entité qui n'aurait jamais dû être
>   écrite est supprimée, pas archivée.
> - **Sondes P10** si le pas touche une déclaration du schéma ; copier le workspace entier par `git ls-files`, une
>   entité conforme et une non conforme par déclaration, et noter : imposé, refusé, ou accepté en silence. Si le pas
>   ne touche aucune déclaration, le dire, et ne pas sonder pour la forme.
> - `awawa fmt && awawa lint --strict` à la racine du dépôt après toute écriture, dans le même tour : zéro finding.
> - **Écrire le résultat dans le fichier de travail, section « S7b », avant de répondre.**
>   Répondre par le tableau règle par règle, le compte de reclassifications, les entités corrigées ou supprimées, et
>   la liste des fichiers touchés. Puis **passer le schéma en revue**, la revue étant un pas permanent avant de
>   changer d'étape, puis demander confirmation ; n'émettre le prompt S8 — déjà rédigé dans le fichier de travail —
>   qu'après cette confirmation, corrigé de ce que l'audit a changé.

## Prompt S8, drafted at S7 and not yet issued

Issued by S7b once its audit is confirmed, updated with whatever the audit changes.

S7 was closed by the owner on 2026-09-18, and with it the review of the schema on the S7 to S8 boundary — R6, the
nine anchors into the documents S8 deletes, and R7, the « Implementation: » lines that get no field. S7 added no
schema line: 38 entities were written (12 `SECTION`, 19 `RULE`, 5 `HYPOTHESIS`, 2 `COMMAND`), the eight `FACT` were
retyped and the type deleted, and `@TASK.CHORE52` carries the five `DATATABLE`.

> **S8, pas 8 sur 8 — Nettoyage.** Réponses d'entrée : [fichier de travail :
> `docs/awawa-project-specification/work_in_progress.md`] [corpus : seconde aire du même workspace, racine de
> workspace = racine du dépôt, un seul `SCHEMA *`, à `docs/_schema.awawa:1`] [objet : spécification produit] [unité
> de changement : pull request] [défauts d'outil : `docs/awawa-usage-reports/`] [tables en JSON, un JSON Schema par
> table]. On reste dans le worktree principal, assumé.
> **Obligation permanente, réénoncée à chaque pas** : à la fin du pas, consigner les défauts du starter rencontrés
> pendant le pas dans `docs/awawa-usage-reports/specification-walk/2026-09-17-starter-defects.md`, avec leur
> évidence mesurée et la remédiation proposée. Vingt-et-un y sont déjà, plus une section distincte pour les défauts
> du binaire — celle-là alimentera le rapport sur la migration 3, pas le rapport starter.
> **Ce qui est clos** — ne rien y rouvrir sans le dire : S2, S3, S4, S5, S6 et S7 (l'ordre d'arrivée par paires, la
> migration `FACT`, les deux commandes, les cinq `DATATABLE` reportées sur `@TASK.CHORE52`), et les trois revues de
> schéma (R1 à R7). L'état complet est dans le fichier de travail, pas dans ce prompt.
> - **Quel document peut être supprimé, et lequel ne le peut pas.** `game-rules.md` et `save-format.md` sont
>   couverts entité par entité (tableau de couverture de S7) ; `energy-levels.md` ne l'est pas — §1, §2 et §3.1
>   attendent `@TASK.CHORE52`, §3.2 et §4 sont des `RULE DOMAIN game` dont le `VALUES_FROM` a besoin de ces tables.
>   Trancher en tableau : supprimer les deux, ou les trois, ou aucun avant CHORE52.
> - **R6, neuf ancres à traiter avant toute suppression** : huit `IMPL` et un `SEEN_IN` nomment les trois documents.
>   Le `lint` les signalera par `L016` dès la suppression, donc rien ne passe en silence ; mais
>   `@DECISION.MergeRulesHaveOnePublicHome` demande une réécriture en place, pas un repointage — son premier `SPEC`
>   dit que le document *est* la source publique unique des règles de fusion, ce qui cesse d'être vrai.
> - **Le README pointe sur `game-rules.md`** (`@DECISION.MergeRulesHaveOnePublicHome`, deuxième `SPEC`) : dire ce
>   que lit un utilisateur public une fois le document parti, sachant que le corpus n'est pas une documentation
>   publique.
> - **Le fichier de travail lui-même** : il est non suivi et c'est le dernier pas qui décide de son sort — commité
>   dans le rapport de la marche, ou supprimé, ou laissé non suivi. Trancher, avec la raison.
> - **Relire les seuils de S2 sur le corpus livré** : `awawa status TYPE` par type, et dire si une entité écrite en
>   S7 devrait être supprimée maintenant qu'elle a des voisines.
> - **Sondes P10** : copier le workspace entier par `git ls-files` — c'est ce qui a donné une base à zéro `L016` en
>   S7 — une entité conforme et une non conforme par déclaration que le pas touche, et noter pour chaque ligne :
>   imposé, refusé, ou accepté en silence.
> - `awawa fmt && awawa lint --strict` à la racine du dépôt après toute écriture, dans le même tour : zéro finding.
> - **Écrire le résultat dans le fichier de travail, section « S8 », avant de répondre.** C'est le dernier pas :
>   écrire aussi le bilan de la marche — ce que les huit pas ont produit, ce qu'ils ont coûté, et ce qui reste
>   ouvert — plutôt qu'un prompt de reprise.
>   Répondre par le sort de chaque document, les lignes ajoutées à `AGENTS.md`, le tableau des sondes P10 et le bilan.
>   Puis **passer le schéma en revue** une dernière fois, la revue étant un pas permanent, puis demander confirmation
>   que tout est tranché.

## S8 — Cleanup (2026-09-18)

### Divergence from the starter, declared before writing

The starter's S8 is « Decide the Cleanup Pass (P9) » — design a script that archives and deletes *entities*, or
record that it is skipped. The S8 prompt this walk issued is about the *documents the corpus replaced*, which no step
of Flow S and no readiness criterion ever asks about. Both were done: the document question below, and P9's own
ruling, recorded as `@PROCESS.TheArchiveIsPurgedByHandWhileFewEntitiesAreArchived`. Recorded as starter defect 24,
the fourth occurrence of the shape of defects 7, 11 and 16.

### Reading ledger (defect 23's first half)

| Source                                                                    | Revision read | Why                                                   |
|---------------------------------------------------------------------------|---------------|-------------------------------------------------------|
| `docs/awawa-project-specification/work_in_progress.md`                    | 926 lines     | the position                                          |
| `docs/game-rules.md`                                                      | 219 lines     | the document to dispose of: §1, §13 and the 12 « Implementation: » lines |
| `docs/awawa-project-specification/rules.awawa`                            | 19 `RULE`     | the `GR-*` → entity mapping, read from the `SOURCE` lines |
| `docs/_schema.awawa`                                                      | `SCHEMA *`, `DECISION`, `PROCESS`, `LIMITATION` | what `IMPL`, `RESTS_ON` and `SEEN_IN` admit |
| `README.md` 360–393                                                       | 1 callout, 12 rows | the public index                                  |
| `AGENTS.md` 1–60                                                          | —             | where the new paragraphs go                           |
| `docs/awawa-usage-reports/artifact-assets/awawa-specification-starter.md` | P9, S8, the readiness criteria | the step's own prescription             |
| `grep -rn 'game-rules\|save-format\|energy-levels'` over the repository   | —             | the citation count of defect 25                       |

Not re-read, and named so a later step knows: `save-format.md` and `energy-levels.md` in full (only their headings
and the two cross-links), the merge specs, the section index module, the JSON Schemas — S7 read them and S8 changed
nothing that depends on them.

### The fate of each document

The prompt offered three answers — delete the two, the three, or none before `@TASK.CHORE52`. **None of the three is
right**, and the reason is in `@TASK.CHORE52`'s own last `SPEC`: « the value tables of `docs/energy-levels.md` **and
the appendix of `docs/save-format.md`** are deleted, no row surviving in markdown ». `save-format.md` is therefore
not covered entity by entity either, and the answer is per document.

| Document                  | Fate                                | What decides it                                                                                                                                                                                                                   |
|---------------------------|-------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `docs/game-rules.md`      | **deleted in this step**, 219 lines | Every one of the thirty `GR-*` is a `SPEC` of one of the fourteen `RULE DOMAIN merge`; §1 is three `DECISION` (S7 coverage table); the twelve « Implementation: » lines get no field, ruled R7. Nothing of it has one home only |
| `docs/save-format.md`     | **kept until `@TASK.CHORE52`**      | Its appendix, 6 legacy properties at line 358, is a `DATATABLE` of CHORE52, which names the document in its `SPEC`. Deleting it now would lose the only description of the legacy format                                          |
| `docs/energy-levels.md`   | **kept until `@TASK.CHORE52`**      | §1, §2 and §3.1 are three `DATATABLE` of CHORE52; §3.2 and §4 are `RULE DOMAIN game` whose `VALUES_FROM` needs those tables to exist. Unchanged from the S7 coverage table                                                       |

What this costs: the walk ends with two of the three documents still standing, and their removal is one task away,
not one step. The alternative — deleting all three now — would put the 105 energy rows and the 6 legacy properties
nowhere, which is the duplication-free state bought at the price of losing the data.

### R6, the anchors, measured rather than predicted

R6 predicted nine anchors into the three documents and that the gate would catch them. Both halves need correcting.

- **Six, not nine, break.** Three of the nine name `energy-levels.md`, which stands: they are untouched.
- **A seventh broke that R6 did not list**: `@DECISION.MergeRulesHaveOnePublicHome`'s second `SPEC` anchors
  `README.md::is the single source of truth for every merge decision`, a literal the README rewriting removed.
- **The gate did catch all seven, in one run**, immediately after `git rm`: 6 × `L016` on `decisions.awawa` (5 `IMPL`,
  1 on the README literal) and 1 × `L016` on `limitations.awawa` (`SEEN_IN`). Nothing passed in silence *inside the
  corpus*.

| Anchor                                                                          | Treatment                                                                                                                                                         |
|---------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `@DECISION.MergeRulesHaveOnePublicHome` `SPEC` 1, `IMPL "docs/game-rules.md"`   | **Rewritten, not repointed**, as R6 required: « The corpus is the single public source of the merge rules, one `RULE DOMAIN merge` per conflict the merge settles », `IMPL docs/awawa-project-specification/rules.awawa` |
| the same, `SPEC` 2, `IMPL "README.md::is the single source of truth…"`         | Rewritten with the README: « carries an index naming the rule entity that settles each topic », anchored on `README.md::This README deliberately does not restate the` |
| the same, `REJECTED`                                                            | One line added: keeping the document as the public home would have been a hand-maintained second copy of the corpus                                                |
| `@DECISION.AnInt64IdentifierIsCarriedByItsDecimalText`, `SPEC` « stated in the public documentation », `IMPL ::GR-ID-7` | **The `SPEC` is deleted**, its only `IMPL` being that document. The obligation existed to keep a copy in step with the code; the rule is now an entity, named through `RESTS_ON @RULE.APlayerIdentifierIsCarriedAsExactDecimalText`. The previous form is a `REJECTED` line |
| `@DECISION.APlayerIdentityIsCarriedByItsEntry`, `IMPL ::GR-PLAYER-2` and `::GR-ID-6` | Both dropped; each `SPEC` keeps its code `IMPL`. `RESTS_ON @RULE.APlayerIdentifierIsCarriedAsExactDecimalText` added                                          |
| `@DECISION.AMergeIntroducesNoIdOverlapAbsentFromItsInputs`, `SPEC` and `REJECTED` naming `GR-ID-1`, `IMPL ::GR-ID-1` | `SPEC` and `REJECTED` rewritten to name « the rule of the shared numbering space »; `IMPL` anchored on the rule's own `SPEC` line in `rules.awawa`; `RESTS_ON @RULE.IdentifiersAreSharedByInventoriesAndWorldObjects` added |
| `@LIMITATION.SectionLabelsDivergeFromTheGameRulesDocument`, `SEEN_IN`           | The entity is **renamed** `@LIMITATION.SectionLabelsDivergeFromTheFormatDocument` (`awawa fmt --rename`, 0 reference site), its `SYMPTOM` rewritten and its `SEEN_IN` repointed at `docs/save-format.md::#0 — Player Progression (tokens & unlocked groups)`. The divergence is still real and still measured: `SECTION.LABEL` says `Global metadata`, `Inventories`, `Mailbox messages`, `Reserved`, where the format document heads `#0 — Player Progression`, `#4 — Inventories & equipment`, `#6 — Mailbox`, `#10 — (Unknown)` |

**Left as they are, deliberately**: the fifteen `SOURCE` lines of `rules.awawa` reading « Extracted from
`docs/game-rules.md` on 2026-09-18, step S7 » and the `SOURCE` of `AMergeIntroducesNoIdOverlapAbsentFromItsInputs`
reading « GR-ID-1 reworded by pull request 49 ». A `SOURCE` is a dated statement of provenance: it says where the
entity came from on that day, and that stays true after the document is deleted. Rewriting them would be REP-6's
error, carried into the corpus.

### What the gate does not see — 39 of 45 citation sites

The count was taken with one `grep -rn` before the deletion, and is what defect 25 records.

| Where                                                                  | Sites | Seen by `lint` | Treatment                                                                                                    |
|------------------------------------------------------------------------|-------|----------------|--------------------------------------------------------------------------------------------------------------|
| Corpus anchors (`IMPL`, `SEEN_IN`)                                     | 6     | **yes**, `L016` | table above                                                                                                  |
| Code comments `@see GR-* in docs/game-rules.md`, 21 files              | 24    | no             | repointed at the rule entity — `@see @RULE.TheSaveOnPrimeBecomesSaveA` — following the S7 precedent on `worldObjectLabels.ts` |
| `README.md`, the callout and the twelve index rows                     | 13    | no             | the section rewritten: the callout names `rules.awawa`, the table gains two rows (14 rules, not 12 topics) and names each `@RULE` |
| `docs/save-format.md:171`, `docs/energy-levels.md:6`                   | 2     | no             | repointed at the entity and at `rules.awawa`                                                                 |
| **Total**                                                              | **45** | **6**         | 39 found by `grep`, 0 by any command                                                                         |

The `GR-*` → entity mapping cost nothing to build: S7 wrote it into the `SOURCE` line of each rule
(« …(GR-META-1 to GR-META-4) »), so the twenty-four comments were repointed from `rules.awawa` alone.

### What a public reader reads once the document is gone

`docs/awawa-project-specification/rules.awawa` is the public home, and the README says so. Three facts make that
answer hold rather than a slogan:

- **The file is public and plain text.** It is committed in the public repository and renders as text on the forge;
  nothing has to be installed to read it.
- **Each entity is written for a reader**, not for a parser: `CONFLICT` states what the two saves disagree on,
  `RESOLUTION` how it is settled, each `SPEC` is one falsifiable sentence and each `ATTESTED_BY` names the test that
  proves it — which is strictly more than the deleted document carried, since `GR-*` had no attestation field.
- **The README keeps its index and restates nothing**, which is what `@DECISION.MergeRulesHaveOnePublicHome` asked
  for from the start. It gained two rows: `game-rules.md` filed the id rules under one heading, the corpus splits
  them into three entities.

What is lost, and named rather than hidden: the anchored deep links (`#13-id-conflict-resolution`) and the numbering
`GR-ID-3`, which a bug report could quote. The successor is the entity identity, which `awawa refs` and `grep` both
find exactly — and which a rename keeps, where a heading anchor does not.

### The work file itself

**Committed, in `docs/awawa-usage-reports/specification-walk/`**, renamed `2026-09-18-flow-s-walk.md`, at the end of
the step. Three reasons, in order:

1. It is the only record of what the eight steps ruled and why. The corpus holds the rulings; the work file holds the
   probes, the rejected alternatives that never became a `REJECTED` line, and the measured cost per step — none of
   which is corpus material (`@PROCESS.ADecisionIsRecordedOnlyIfAPullRequestCouldReverseIt`).
2. It is the evidence base of the starter defect report, which cites it step by step. A defect report whose evidence
   is an untracked file on one machine is not verifiable.
3. It becomes dated on the merge, and REP-6 then protects it: nobody rewrites it when an entity it names is renamed.

Rejected: **leaving it untracked** — the walk's whole first defect is that a step's result reaches no one;
**deleting it** — the corpus deliberately holds no history, so deleting the one place the history sits erases it
rather than relocating it.

### P9 — the cleanup pass, the starter's own S8 question

**Skipped, with the size at which to reconsider**, recorded as
`@PROCESS.TheArchiveIsPurgedByHandWhileFewEntitiesAreArchived`.

Measured on 2026-09-18 over the whole workspace: 270 entities, **12 archived**, all of them `TASK`, and **2 of the 12
with no incoming reference** (`CHORE3`, `DOCS48`) — the other ten still carry `BEFORE` or `GOVERNED_BY` edges, so a
first run of the script would delete two entities. The script P9 describes reads `status --json` then `show --json`
per entity, edits, `fmt`, `lint --strict`, and opens a change whose body is its report: more to write and to trust
than the two deletions it would perform. Reconsidered above twenty archived entities with no incoming reference, or
above four hundred entities in the workspace.

Also rejected: a retention **delay in days**. Nothing dates a reference; what guards the deletion is the incoming
count `awawa status TYPE` prints, which is what `@PROCESS.AnEntityThatStopsBindingIsArchivedByThePullRequestThatEndsIt`
already relies on.

### The S2 thresholds re-read on the delivered corpus

`awawa status` per type, 2026-09-18. **No entity written in S7 is deleted, and no `REQUIRED` is tightened.** The four
entities with no incoming edge were each examined rather than counted:

| Entity                                                               | Incoming | Verdict                                                                                                                                                                     |
|----------------------------------------------------------------------|----------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `@SECTION.TerrainLayers`                                             | 0        | Kept. `HOLDS_FOR legacy` carries no `INCOMING`, by ruling: a section the game no longer writes has no live rule, and the entity is the record of the era (ruling 5 of S2) |
| `@COMMAND.MergeSaves`, `@COMMAND.ValidateSave`                       | 0        | Kept. `COMMAND` is the only type whose edges all run outwards (S5 pricing table); nothing is expected to cite a command                                                    |
| `@HYPOTHESIS.ALinkedInventoryPlanetIsCarriedOnlyByAnExchangePlatform` | 0        | Kept. The threshold is « what would refute it can be named », held by `UNTIL`, not by having a dependant. It was found by S7's coverage reading and by nothing else       |
| `@HYPOTHESIS.AnAnimalHungerLevelLiesBetweenMinus100And100`           | 0        | Kept, same reason; `OBSERVED_IN` records where it was seen without being proven                                                                                            |

The one threshold S8 *does* move is not a deletion: `@DECISION.AnInt64IdentifierIsCarriedByItsDecimalText` lost a
`SPEC` — « the rule is stated in the public documentation » — because the obligation it created disappeared with the
document. That is the S2 boundary working in the direction nobody planned: a `DECISION` whose subject was keeping a
duplicate in step has less to say once there is no duplicate.

### P10 probes

Run in `<scratchpad>/probe`, built from `git ls-files` so the copy holds every file git tracks and the anchors
resolve for real. Baseline before the probe file: **0 error, 0 warning, 12 files, 270 entities, 0 `L016`** — the
second step of the walk whose probe workspace has no factitious finding. One conforming and one non-conforming entity
per declaration the step touches; 11 probe entities, **7 findings, all on the non-conforming half**.

| Declaration the step touches                                                | Expected                                   | Observed                                                                                                                                                                       |
|-----------------------------------------------------------------------------|--------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `DECISION.SPEC.IMPL` anchor on a deleted path                               | refusal                                    | **refused**: `L016 field IMPL: anchor path docs/game-rules.md does not exist under the workspace root`; the conforming twin is silent                                          |
| `DECISION.SPEC.IMPL` anchor whose `::literal` a rewriting removed           | refusal, and a different message from a missing path | **refused**: ``L016 field IMPL: `is the single source of truth for every merge decision` does not occur in ./README.md`` — the two failures are told apart in the message |
| `DECISION.RESTS_ON @RULE`, written on three decisions by this step          | a `@HYPOTHESIS` there is refused           | **refused**: `L009 field RESTS_ON expects @RULE, given @HYPOTHESIS.AWorldObjectMayCarryALinkedObjectList`; the `@RULE` twin is silent                                          |
| `DECISION.SPEC.IMPL` REQUIRED, after a `SPEC` lost its only `IMPL`          | refusal                                    | **refused**: `L006 required field IMPL is absent from DECISION.SPEC` — the gate that forces a `SPEC` to be deleted rather than left anchorless                                |
| An anchor literal that spells an entity identity                            | ?                                          | **imposed**, and unforeseen: `L025 @RULE.TheSaveOnPrimeBecomesSaveA is mentioned in prose and indexed by nothing; nest a field carrying it under IMPL` — and `IMPL` declares no nested `REF`, so an anchor literal can never quote an entity identity. Hit live on the first writing of `@DECISION.ADocumentIsDeletedOnlyWhenEveryCitationIsRepointed`, then reproduced |
| `LIMITATION.SEEN_IN` anchor on a deleted path                               | refusal                                    | **refused**: `L016 field SEEN_IN: anchor path docs/game-rules.md does not exist under the workspace root`; the twin naming `save-format.md` is silent                          |
| A reference left on the name `awawa fmt --rename` retired                   | refusal                                    | **refused**: `L004 unresolved reference @LIMITATION.SectionLabelsDivergeFromTheGameRulesDocument`; the same reference under the new name is silent                             |

**No line is « accepted in silence ».** The one line worth carrying forward is `L025` on an anchor literal: it is a
constraint on how a convention can be anchored, not on what the convention is, and it cost one gate round to find.

### Gate

`awawa fmt . && awawa lint --strict .` at the repository root, same turn as the writes: **exit 0, 0 error, 0
warning**, 12 files, **270 entities**. `awawa fmt --check .` exits 0.

### Files

| File                                                                          | State                                                                                                                                                                                                       |
|-------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `docs/game-rules.md`                                                          | **deleted** (`git rm`), 219 lines                                                                                                                                                                           |
| `README.md`                                                                   | the « Merge Logic » callout and index rewritten: 12 topic rows → 14 rule rows, no link into `docs/game-rules.md`                                                                                            |
| `docs/save-format.md`                                                         | line 171, the `GR-ID-7` cross-link → `@RULE.APlayerIdentifierIsCarriedAsExactDecimalText`                                                                                                                   |
| `docs/energy-levels.md`                                                       | line 6, the cross-link to `game-rules.md` → `rules.awawa`                                                                                                                                                  |
| 21 files under `packages/`                                                    | 24 `@see GR-* in docs/game-rules.md` → `@see @RULE.<Name>`; one of them is `section3-world-objects.schema.json`, a schema `description`                                                                     |
| `docs/awawa-project-methodology/decisions.awawa`                              | 4 decisions rewritten (7 anchors), 3 `RESTS_ON` added, 1 `SPEC` deleted, 3 `REJECTED` added; `@DECISION.ADocumentIsDeletedOnlyWhenEveryCitationIsRepointed` added                                           |
| `docs/awawa-project-methodology/processes.awawa`                              | `@PROCESS.TheArchiveIsPurgedByHandWhileFewEntitiesAreArchived` added                                                                                                                                        |
| `docs/awawa-project-methodology/limitations.awawa`                            | `@LIMITATION.SectionLabelsDivergeFromTheGameRulesDocument` renamed `…FromTheFormatDocument`, `SYMPTOM` and one `SEEN_IN` rewritten                                                                          |
| `AGENTS.md`                                                                   | three paragraphs added — « Un document de `docs/` n'est supprimé qu'une fois toutes ses citations repointées », « Les règles de fusion vivent dans le corpus » et « L'archive se purge à la main »          |
| `docs/awawa-usage-reports/specification-walk/2026-09-17-starter-defects.md`   | defects 24 and 25; header count, « Steps observed » and the scope paragraph updated                                                                                                                         |
| `docs/awawa-project-specification/work_in_progress.md`                        | this section and the bilan; committed at the end of the step as `…/specification-walk/2026-09-18-flow-s-walk.md`                                                                                            |

### Rulings of 2026-09-18, S8

18. A document is deleted per document, on its own coverage, never the three together: `game-rules.md` goes,
    `save-format.md` and `energy-levels.md` wait for `@TASK.CHORE52`.
19. The corpus is the public home of the merge rules; the README keeps an index and restates nothing.
20. A code comment cites the entity, never the document.
21. The cleanup pass of P9 is skipped, with two reconsideration thresholds.
22. The work file is committed with the walk's usage reports.
23. A `SOURCE` naming a deleted document is not rewritten: it is a dated statement of provenance.

## Review of the schema (S8, the last), 2026-09-18

The permanent review step, run one last time. Nothing of S2 to S7 is reopened.

### Verdict

The road holds. **No schema line is changed by S8** — the second review in a row run against real entities, and the
third step of the walk to add no declaration at all (S5, S7, S8). One point was ruled and written as a `DECISION`
rather than as a schema line; four are read and left as they are, each with the reason.

| #  | Point                                                                                                                                                                          | Ruling                                                                                                                                                                                                                                                                                                                                                                              |
|----|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| R8 | A code comment that cited a deleted document has a successor — the entity identity — and no declaration says so, the corpus governing no file under `packages/`               | **A `DECISION`, not a schema line**: `@DECISION.ADocumentIsDeletedOnlyWhenEveryCitationIsRepointed`, third `SPEC`. A schema line cannot reach a code comment, and `L016` proves it: it resolved 6 of the 45 citation sites and was silent on the 39 the corpus does not govern. What the schema *can* do is refuse a `SPEC` left anchorless, which it did — `L006` — forcing the deletion of the obligation rather than its quiet survival |

| Point                                                                                                                                                  | Why no change                                                                                                                                                                                                                                                                                                                                                                                       |
|--------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `DECISION.SPEC.IMPL` declares no nested `REF`, so an anchor literal can never quote an entity identity (`L025`, hit live in this step and reproduced) | An anchor is a quotation of a file, not prose; the field that indexes an entity is the reference field beside it — here `RESTS_ON`. Declaring `FIELD REF reference` under `IMPL` would let an anchor become a second place to name entities, which is the failure `L025` exists to catch. The cost is one gate round per occurrence, paid once                                                     |
| `@DECISION.MergeRulesHaveOnePublicHome` now anchors `docs/awawa-project-specification/rules.awawa`: a decision whose `IMPL` is the corpus itself      | The one legitimate case: the decision's subject is *where* the rules live, so the corpus file is the artefact the obligation holds in. A field telling a corpus anchor from a code anchor would be a discriminant no command reads, and `AnAnchorNamesAFileTrackedByGit` already covers the only property that matters                                                                             |
| Nothing declares that a document may not be deleted while an anchor names it                                                                          | Nothing needs to: `L016` reports it in the same run, 6 of 6 this step, and R6 predicted exactly that. The half no declaration can cover is the 39 citations in files the corpus does not govern; their guard is a `grep` and a ruling                                                                                                                                                              |
| The twelve `SECTION` cite `save-format.md` in `SOURCE` prose and in no anchor                                                                          | Checked, and it matters for `@TASK.CHORE52`: **no anchor of the specification area names a markdown document**. The two surviving documents carry 4 corpus anchors in all — 1 `SEEN_IN` on `save-format.md`, 3 `IMPL` on `energy-levels.md` — plus 3 code comments. CHORE52 will therefore delete them against a gate that raises 4 findings, not 40, and a `grep` that returns 3 sites            |

## Bilan de la marche — Flow S, eight steps, 2026-09-17 to 2026-09-18

### Verdict

The product specification area exists, it is the corpus's second area, and the first of the three markdown documents
it replaced is deleted. Flow S was walked end to end; **twenty-eight defects of the starter and one of the binary**
were found doing it, which is the walk's other product.

### What the eight steps produced

| Object                     | Before the walk                   | After                                                                                                              |
|----------------------------|-----------------------------------|--------------------------------------------------------------------------------------------------------------------|
| Areas                      | 1 (`awawa-project-methodology/`)  | 2, the schema raised to `docs/_schema.awawa` above both                                                            |
| Entity types               | 12                                | **17**: `SECTION`, `RULE`, `COMMAND`, `HYPOTHESIS`, `DATATABLE`, `GAME_RELEASE` added; `FACT` deleted              |
| `SHAPE`                    | 9                                 | 11 (`version_segment`, `json_key`)                                                                                 |
| Specification entities     | 0                                 | **40**: 12 `SECTION`, 21 `RULE`, 5 `HYPOTHESIS`, 2 `COMMAND`; 0 `DATATABLE`, deliberately (S7b added 2 `RULE`)     |
| Workspace                  | 219 entities, 8 files             | **274 entities, 12 files, 536 reference sites, 0 unresolved** (after S7b)                                          |
| Rulings recorded           | 93 `DECISION`, 12 `PROCESS`       | 105 `DECISION`, 13 `PROCESS` — 13 of them written by the walk, 2 by S7b                                            |
| `AGENTS.md`                | —                                 | 9 paragraphs added, S5 to S8, each anchored by the decision that rules it                                          |
| Markdown replaced          | 3 documents, 917 lines            | 1 deleted (`game-rules.md`, 219 lines); 2 waiting on `@TASK.CHORE52`                                               |
| Reports to the awawa team  | —                                 | 28 starter defects, 1 binary defect, this work file as their evidence base                                         |

The schema grew where it was designed to and nowhere else: **S5 and S7 added no schema line at all**, S4 added 108,
S6 moved four conditional fields into their `WHEN` blocks, and the three schema reviews (R1 to R7) added three fields
and changed one `DESC`.

### What the eight steps cost

Measured on the session transcripts, one session per step, counting API turns, deduplicated by message id.
« Weighted » is cache read plus cache creation. S1 to S3 were not measured: the analysis that produced this table was
owed at S7's close and covers S4 onwards.

| Step | Turns   | Weighted    | Output   | What the step produced                                              |
|------|---------|-------------|----------|---------------------------------------------------------------------|
| S4   | 43      | 4.45 M      | 52.3 k   | 108 schema lines, 6 files created, 14 probe lines                   |
| S5   | 51      | 5.80 M      | 64.1 k   | **0 schema line**; the pivot ruling and 22 probe entities            |
| S6   | 58      | 7.23 M      | 55.2 k   | 1 source type, the P7 retyping, 3 files changed                     |
| S7   | 54      | 8.02 M      | 85.1 k   | 38 entities, 8 retyped, a type deleted, 19 probe entities           |
| S8   | 55      | 9.40 M      | 67.3 k   | 1 document deleted, 45 citation sites repointed, 11 probe entities  |
| S7b  | 30      | **3.17 M**  | 40.7 k   | 37 statements audited, 5 reclassified, 4 entities, 3 defects        |
| —    | **291** | **38.07 M** | 364.6 k  | —                                                                   |

S8's figures are measured at the writing of this bilan; the answer that follows is not in them. S7b's row was added
when that step ran, after this bilan was first written, and it is the one that answers the paragraph below: **the
cheapest step of the nine, at a third of S8, and not because it produced least.** What it did differently was to
issue independent reads in one turn — the fourteen rules in three calls, the seven source documents in four — so
its context per turn averaged 106 k against S8's 171 k.

**The turn count is the shape of a step, not the price of its product** — 43, 51, 58, 54, 55 across five steps that
produced, respectively, a schema, nothing, one type, a whole corpus and a deletion. What grows is the weighted cost,
4.45 M → 9.40 M, and it is carried by the context per turn, not by the number of turns. That is defect 23, and it is
the one defect this walk would fix first.

### What remains open

| Open point                                                                   | Where it is carried                                                                                                  |
|------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------|
| **`SCHEMA RULE`'s `DESC` admits no `DOMAIN merge` statement** — read literally, the fourteen merge rules are `DECISION` | Raised by S7b, section « The finding that governs every row »; starter defect 28. The ruling is the owner's, S2 and S4 being closed |
| Two statements of `game-rules.md` with no home: the inputs are never modified, and a save flagging no host is invalid | S7b, section « The document itself, read as the control »; starter defect 27 |
| The five `DATATABLE`, and with them `save-format.md` and `energy-levels.md`  | `@TASK.CHORE52`, **draft** — not yet ratified                                                                        |
| The guard that an anchor names a file git tracks                             | `@TASK.CHORE51`, `todo`                                                                                              |
| Q3 of the reading loop, never measured                                       | It reads a `DATATABLE` that does not exist yet; P2 measured four of the five questions                               |
| `DATATABLE`, `GAME_RELEASE`, `URL` at 0 entities                             | Intended: the first two wait for CHORE52, a source entity is written by the first entity that cites it               |
| The pull request that carries the walk                                       | Branch `docs/awawa-project-specification`, uncommitted at the writing of this bilan                                  |

### The starter's readiness criteria, answered

| Criterion                                                                 | Verdict                                                                                                               |
|---------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------|
| `awawa lint --strict` passes with zero findings                           | **yes** — 0 error, 0 warning, 12 files, 274 entities after S7b; `fmt --check` exits 0                                 |
| `awawa status` shows every type with entities, or its emptiness intended  | **yes** — 3 empty types, each named above with what fills it                                                          |
| `context @PIVOT.X` returns the entity, what it rests on, and its footer   | **yes** — measured in P2: `@COMMAND.MergeSaves --depth 2` returns 31 entities in one call                            |
| `refs @SOURCE_TYPE.X` lists what cites a source entity                    | **not exercised**: no `URL` nor `GAME_RELEASE` entity exists yet. The mechanism was probed in S6, not used            |
| Each session question answered in one `context` or one `status` call      | **four of five** — Q3 waits on CHORE52                                                                                |
| No entity would be refused by its type's threshold                        | **yes** — re-read in S8 per type; 0 deletion, 0 `REQUIRED` tightened                                                  |
| Migration only: no history status, no supersession field, no version suffix | n/a — Flow S                                                                                                        |
| The project's agent instructions name the corpus path and the reading loop | **yes** — `AGENTS.md`, « Corpus de spécification (awawa) »                                                           |
| The cleanup pass is designed or consciously skipped                       | **skipped**, `@PROCESS.TheArchiveIsPurgedByHandWhileFewEntitiesAreArchived`, with two reconsideration thresholds      |
| Probe directories deleted, nothing of them entered the project            | **yes** — every probe ran under the session scratchpad, never under the repository                                    |

One criterion is unmet and one partial, both for the same reason: the walk deliberately deferred the value tables to
a task rather than writing entities against files that do not exist. That was ruling 13, and it is what
`@DECISION.AValueTableIsRecordedOnceItsFileExists` records.

## S7b — Audit of the merge typing (2026-09-18), run after S8

The step S7 drafted and never ran, issued after the walk closed. It reads entities, not the deleted document as a
specification: `docs/game-rules.md` is read by `git show HEAD:docs/game-rules.md` as the control it was meant to be.

### Reading ledger (defect 23's first half)

| Source | Revision | Why |
|--------|----------|-----|
| `docs/game-rules.md`, all 219 lines | `git show HEAD:` — the deletion is not committed | the control against which the entities are audited |
| The 14 `RULE DOMAIN merge`, one `awawa show` each | working tree | the audited object |
| `RULE`, `DECISION`, `COMMAND`, `FIELDSET.Era`, `FIELDSET.Ruling` declarations | working tree | to know which fields a reclassification may use |
| `@RULE.ThePlayerIdentifierIsTheOnlyInt64FieldBeyondDoubleRange`, `APlanetNumericIdIsStableAcrossSaves`, `FloatFieldsCarryADotZeroSuffixInFlatRecords` | working tree | the three `DOMAIN format` rules a reclassification could join |
| `@DECISION.AMergeProducesAnOrdinarySave`, `AMergeThatWritesAFileIsASuccess`, `ValidationIsTheSingleSourceOfWarnings`, `APlayerIdentityIsCarriedByItsEntry` | working tree | the homes §1 of the document is said to have |
| `section1-terraformation-levels.schema.json`, `section2-players.schema.json`, the four e2e fixtures | working tree | the attestations the two extracted format rules need |
| `README.md` merge index, the 23 `@see` comment blocks under `packages/` | working tree | the out-of-corpus surfaces of S8 |

Not re-read, an earlier step having read it: the whole of `docs/_schema.awawa` beyond the three declarations above,
`save-format.md`, `energy-levels.md`, and the S1 to S6 sections of this file. S7's coverage table and S8's citation
table were read, not re-derived.

### The finding that governs every row

`SCHEMA RULE` says: « a statement about the save or the game that a real save, or a game source, can contradict; a
ruling of ours that could have been made otherwise is a DECISION ». **No `DOMAIN merge` statement satisfies it.** No
save contradicts « the higher value wins »; every one of the fourteen could have been ruled otherwise. Read
literally, the `DESC` of the type demolishes one of its own three `DOMAIN` values.

The audit did **not** act on that. S2 and S4 are closed, `DOMAIN merge` with its `CONFLICT` and `RESOLUTION` is a
ruled declaration, and rewriting fourteen entities on a reading of a `DESC` is a decision for the owner, not for an
audit. The rows below therefore use the criterion the owner's prompt states — *two saves disagree, the merge
settles it* — and « not a `RULE` » is reserved for a statement about our pipeline, our command contract, our
validation, or the handling of a single save. **The type-level question is carried to « Still to do ».**

### Every `GR-*`, one row — and there are thirty-seven, not thirty

`git show HEAD:docs/game-rules.md | grep -c '^\*\*Rule GR-'` → **37**, and the distinct identifiers count 37 too.
S7's coverage table, the S7b prompt, S8's document table and the bilan all say « 30 rules ». The number was never
computed; it was carried from one step to the next. Seven statements were audited that no step knew it had written.

| `GR-*` | Verdict | After S7b |
|--------|---------|-----------|
| GR-ORDER-1 role A/B | merge | kept — the one rule whose conflict is about roles, not about save content |
| GR-META-1 `terraTokens` summed | merge, **aggregation not arbitration** | kept; `CONFLICT`/`RESOLUTION` rewritten |
| GR-META-2 `allTimeTerraTokens` summed | merge, aggregation | idem |
| GR-META-3 `unlockedGroups` unioned | merge, aggregation | idem |
| GR-META-4 instance fields from save A | merge, arbitration | kept |
| GR-TERRA-1 one entry per `planetId` | merge (the frame of the arbitration) | kept |
| GR-TERRA-2 `Math.max` per field | merge | kept |
| GR-TERRA-3 `-1` sentinel | **format + merge, fused** | the meaning of `-1` split off to `@RULE.APurificationLevelOfMinusOneMeansNotUnlocked`; the merge half stays |
| GR-PLAYER-1 dedup by `name` | merge | kept |
| GR-PLAYER-2 one host, by position | merge | kept; its validation clause was never recorded — see below |
| GR-PLAYER-3 unknown names appended | merge (frame) | kept |
| GR-PLAYER-4 missing fields default to `0` | **not a merge rule** | split: `@RULE.APlayerEntryMayOmitTheFieldsAddedByALaterUpdate` (format) and `@DECISION.MissingPlayerFieldsAreWrittenAsZero` |
| GR-WO-1 no `pos`, always kept | merge | kept |
| GR-WO-2 same `planet:pos`, A wins | merge | kept |
| GR-WO-3 orphan removal | merge | kept |
| GR-WO-4 « resolved by the id step » | **not a `RULE`** — a pipeline cross-reference | S7 wrote it as no `SPEC`, rightly; only its `SOURCE` claimed it. `SOURCE` corrected to GR-WO-1 to GR-WO-3 |
| GR-INV-1 save A inventories kept | merge | kept |
| GR-INV-2 ejected owners' inventories dropped | merge | kept |
| GR-INV-3 colliding ids are not one object | merge | kept |
| GR-STAT-1 every numeric field summed | merge, **aggregation not arbitration** | kept; `CONFLICT`/`RESOLUTION` rewritten |
| GR-MSG-1 dedup by `stringId`, A's fields | merge | kept |
| GR-MSG-2 `isRead` boolean or | merge — an arbitration, `true` winning | kept |
| GR-MSG-3 unknown ids appended | merge (frame) | kept |
| GR-STORY-1 union by `stringId` | merge, **degenerate**: the id being the only field, the entries cannot disagree | kept; `CONFLICT` rewritten to say so |
| GR-STORY-2 save A's order kept | merge (frame) | kept |
| GR-CFG-1 save A's configuration as is | merge | kept |
| GR-CFG-2 `saveDisplayName` from the caller | **not a `RULE`** — neither save is read | moved to `@DECISION.TheMergedSaveDisplayNameComesFromTheCaller` |
| GR-CFG-3 save B's discarded | merge — restates GR-CFG-1 | kept inside the same `SPEC` |
| GR-EVT-1 triplet, A wins | merge | kept |
| GR-EVT-2 unknown triplets appended | merge (frame) | kept |
| GR-ID-1 one numbering space | **format + merge**, correctly typed both in S7 | kept |
| GR-ID-2 sequence seeded above both sections | merge | kept |
| GR-ID-3 back-references rewritten | merge | kept |
| GR-ID-4 « last step before serialization » | **not a `RULE`** — pipeline ordering, and already `@DECISION.AMergeProducesAnOrdinarySave` | `SPEC` deleted, not archived (`@PROCESS.WhatShouldNeverHaveBeenRecordedIsDeletedAtOnce`) |
| GR-ID-5 rewriting is origin-aware | merge | kept; its « `fromSaveA`/`fromSaveB` » clause was already left to the decision |
| GR-ID-6 a player id is never regenerated | merge — a negative arbitration | kept |
| GR-ID-7 int64 carried as decimal text | **format + merge**, correctly typed both in S7 | kept; the format half also stands alone as `@RULE.ThePlayerIdentifierIsTheOnlyInt64FieldBeyondDoubleRange` |

**Reclassifications: 5 of 37** — GR-CFG-2 and GR-ID-4 leave the corpus's rules entirely, GR-PLAYER-4 splits in two,
GR-TERRA-3 sheds a format fact, GR-WO-4 was already unwritten and only its `SOURCE` lied. **Thirty-two of the
thirty-seven are merge statements and stay.** Zero entity deleted, zero entity that should never have existed.

### The reverse direction — does each `CONFLICT` describe a real disagreement

| `RULE` | Its `CONFLICT` | Verdict |
|--------|----------------|---------|
| `StatisticsAreSummed` | « each save carries its own play statistics » | **false as a conflict** — that is not a disagreement, it is two histories. Rewritten: the merged save holds one entry while each input carries its own counters |
| `GlobalMetadataIsSummedAndUnioned` | « the two saves carry different token counters… » | **false for three of its four `SPEC`** — same reason. Rewritten, and the `RESOLUTION` now says which single field is arbitrated |
| `StoryEventsAreUnioned` | « the same story event id appears in both saves » | **degenerate** — a duplicate, not a disagreement: the id is the entry's only field. Rewritten to state that |
| `TheSaveOnPrimeBecomesSaveA` | « which of the two saves takes the role A » | real, but about roles and not about save content; it is the premise the other thirteen consume. Kept as is |
| `IdentifiersAreSharedByInventoriesAndWorldObjects` | « one id held at once by an inventory and by a world object » | real, and the disagreement is with an expectation of uniqueness rather than between the two saves; its `DOMAIN format` half carries what a save can contradict. Kept |
| `InventoriesAreKeptUnlessTheirOwnerIsEjected` | ejection **and** id collision | two disagreements in one line, the first being a consequence of `PlayersAreDeduplicatedByName`. Kept: both are settled by this rule |
| `TerraformationLevelsTakeTheHigherValue` | same planet, different levels | real |
| `PlayersAreDeduplicatedByName` | same name, each save flags a host | real |
| `WorldObjectsAreDeduplicatedByPlanetAndPosition` | same `planet:pos` | real |
| `MailboxMessagesAreDeduplicatedByStringId` | read in one save, unread in the other | real |
| `SaveConfigurationComesFromSaveA` | two different configurations | real |
| `WorldEventsAreDeduplicatedByPlanetSeedAndPosition` | same triplet | real |
| `APlayerIdentifierIsCarriedAsExactDecimalText` | same Steam id in both saves | real, negative resolution |
| `DuplicateIdentifiersAreRemappedOnTheSaveBSide` | one id, two logical objects | real |

**Three of fourteen `CONFLICT` lines were untrue**, and all three are the ones the owner named first. None of the
three rules is deleted: the obligation each states is real and only statable in a merge; what was false was the
field that claims an arbitration. The correction is to the `CONFLICT` and `RESOLUTION`, not to the typing.

### The document itself, read as the control

| Statement of `game-rules.md` | Where it stands |
|------------------------------|-----------------|
| §1 « the two input files are never modified; the result is written to a separate output file » | **nowhere in the corpus.** It survives in `README.md` as prose, attested by nothing and cited by no entity — the one thing S8's « nothing has one home only » was meant to prevent |
| §1 « save A always wins unless a section rule says otherwise » | absorbed: each of the fourteen states its own side. Acceptable; it was a reading aid, not an obligation |
| §1 « all merge decisions are deterministic and stateless » | **nowhere in the corpus.** A property of our implementation, so a `DECISION`, and one nothing enforces today |
| §1 « section rules are applied independently » | **false as written**, and rightly unrecorded: GR-WO-3 and GR-INV-2 make the players' deduplication drive two other sections, and GR-ID-2 seeds one sequence across two |
| §1 legacy 12-section paragraph | recorded — `@SECTION.TerrainLayers` and `@DECISION.ValidationIsTheSingleSourceOfWarnings` |
| GR-PLAYER-2 « a save whose player section is not empty and flags no host is rejected as invalid before the merge » | **nowhere in the corpus**, neither in the specification area nor in `@DECISION.APlayerIdentityIsCarriedByItsEntry`. A validation obligation, dropped silently when the sentence became a merge `SPEC` |
| GR-PLAYER-2 « (a Steam account identifier, reused across saves and not unique) » | recorded — `@HYPOTHESIS.APlayerIdentifierIsASteamAccountReusedAcrossGames` |
| GR-ID-5 « the three sections keep their entries grouped as `fromSaveA`/`fromSaveB` » | recorded — `@DECISION.AMergeProducesAnOrdinarySave`, `EntriesByOrigin` |
| GR-ID-1's rationale prose | recorded — `@DECISION.AMergeIntroducesNoIdOverlapAbsentFromItsInputs` |
| The seven « Merge key: » lines | presentation, folded into the `SPEC` that uses the key. No loss |
| The twelve « Implementation: » lines | ruled R7 at S8: no field holds them |

**Three statements of the document were silently left aside**, and S7's coverage table reports none of them: it maps
§1 to three `DECISION` that state none of its four bullets. This is defect 21 measured a second time, on prose
instead of on entities.

### Schema consequences, stated before the first write

- **L003 (`CONFLICT`/`RESOLUTION` undeclared outside `WHEN DOMAIN merge`)**: not raised. No rule loses `merge` from
  its `DOMAIN`; the two reclassified statements were `SPEC` lines of rules that keep it, and the two extracted
  format statements are new entities that never had `CONFLICT`.
- **L026 (a `SECTION` left with no citant)**: not raised. No `APPLIES_TO_SECTION` is removed, and the two new rules
  add citations to `@SECTION.TerraformationLevels` and `@SECTION.Players`.
- **L025 (a name in prose indexed by nothing)**: raised six times, by the `SOURCE` lines that name the entity a
  statement moved to. Fixed in the same turn by nesting `REF` under each `SOURCE` — the mechanism working as
  designed, not a defect.

### P10 probes

**None, and deliberately.** The step touches no declaration of `docs/_schema.awawa`: it writes two `RULE` and two
`DECISION` with fields already declared, deletes two `SPEC` and rewrites three `CONFLICT`/`RESOLUTION` pairs. The
starter asks for probes on what a step declares; this step declares nothing.

### Out-of-corpus surfaces

| Surface | Sites | Touched |
|---------|-------|---------|
| `README.md` merge index | 14 lines | **no** — the index lists the merge rules by section of the save; the two new entities are `DOMAIN format` |
| `@see` comment blocks under `packages/` | 23 blocks, 24 citations | **3 extended**: `mergePlayers.ts`, `mergeSaveConfigurations.ts`, `mergeTerraformationLevels.ts` now also name the entity that took the reclassified statement. No citation was invalidated: no entity was renamed |
| `@COMMAND.MergeSaves` `APPLIES` | 17 → 19 | the two new format rules added, as the three existing format rules already were |
| The four `DECISION` given `RESTS_ON` at S8 | 4 | unchanged; a fifth, `MissingPlayerFieldsAreWrittenAsZero`, is created with one |

### Gate

`awawa fmt && awawa lint --strict` at the repository root: **0 error, 0 warning, 12 files, 274 entities**, 536
reference sites, 0 unresolved. `bun run check:guards`: seven guards, all clean. `bun test` in `core-mapping`: **517
pass, 0 fail**, 83 files.

### Files

| File | Change | Reread to confirm |
|------|--------|-------------------|
| `docs/awawa-project-specification/rules.awawa` | 2 `SPEC` deleted, 3 `CONFLICT`/`RESOLUTION` rewritten, 4 `SOURCE` corrected, 2 `RULE DOMAIN format` added | **yes** — the audit's whole product |
| `docs/awawa-project-methodology/decisions.awawa` | 2 `DECISION` added | **yes** |
| `docs/awawa-project-specification/commands.awawa` | 2 `APPLIES` added to `@COMMAND.MergeSaves` | no |
| `packages/core-mapping/src/domain/rules/merge/mergePlayers.ts` | `@see` extended, 2 names | no |
| `packages/core-mapping/src/domain/rules/merge/mergeSaveConfigurations.ts` | `@see` extended, 1 name | no |
| `packages/core-mapping/src/domain/rules/merge/mergeTerraformationLevels.ts` | `@see` extended, 1 name | no |
| `docs/awawa-usage-reports/specification-walk/2026-09-18-flow-s-walk.md` | this section, « Still to do » and the bilan | no |
| `docs/awawa-usage-reports/specification-walk/2026-09-17-starter-defects.md` | defects 26 to 28 | **yes** |

Created: none. Deleted: none.

### Rulings of 2026-09-18, S7b

24. **A merge statement that consults neither save is not a merge rule.** The test is not « could it have been ruled
    otherwise » — every merge rule could — but « is either save read to decide it ». GR-CFG-2 reads neither, so it
    is a `DECISION`; GR-PLAYER-4 reads one entry whatever the other save holds, so it is a `DECISION` resting on a
    format `RULE`.
25. **An aggregation is a merge rule whose `CONFLICT` is the single output slot**, not a false arbitration. A sum
    and a union settle the same impossibility as a choice does — two values, one field — and the `CONFLICT` line
    says that, rather than pretending the saves disagree.
26. **A fact about the save fused into a merge rule is extracted, not paraphrased.** The meaning of the `-1`
    purification sentinel and the optionality of the three late player fields are contradictable by a save; they
    now stand as `DOMAIN format` rules that the merge rules and decisions rest on.

### The cost of the step

| Step | Turns | Weighted | Output | Context at the last turn | What it produced |
|------|-------|----------|--------|--------------------------|------------------|
| S7b | 30 | **3.17 M** | 40.7 k | 148 k | 37 audited statements, 5 reclassified, 4 entities written, 2 `SPEC` deleted, 3 `CONFLICT` rewritten, 3 defects |

Measured on this session's transcript at the writing of this section, deduplicated by message id, as the other steps
were. **It is the cheapest step of the walk by a factor of two and a half** — 3.17 M against 4.45 M to 9.40 M — and
it is not because it did less: S5 spent 5.80 M to add no schema line. The difference is the reading rule of
`commands.md` applied from the first turn: independent reads were issued in one turn each time, the fourteen rules
in three calls rather than fourteen, the seven source documents in four. The context per turn averaged 106 k
against S8's 171 k. That is defect 23's other half, answered by measurement rather than by assertion.

## Review of the schema (S7b, after S8) — 2026-09-18

The permanent step, run on `docs/_schema.awawa` as the four reviews R1 to R8 were, against what S7b measured rather
than against the entry answers a second time.

### Verdict

**Three points, none acted on**, because acting on any of them declares something and S7b declared nothing — its
« no P10 probe » line would stop being true. The first is starter defect 28 and is the owner's to rule; the two
others are gaps the audit hit while doing its work.

| # | Point | What S7b measured | Recommendation, not pre-approved |
|---|-------|-------------------|----------------------------------|
| R9 | `SCHEMA RULE`'s `DESC` admits none of its own `DOMAIN merge` values | « a statement … that a real save, or a game source, can contradict; a ruling of ours that could have been made otherwise is a DECISION ». No save contradicts « the higher value wins »; all fourteen could have been ruled otherwise | Either the `DESC` names the merge domain as the exception it already is in practice — a merge statement is contradicted by the merged save, not by an input — or `DOMAIN merge` leaves `RULE` and the fourteen become `DECISION`, which costs 14 entities, 14 `README` lines, 24 code comments and `@COMMAND.MergeSaves`. **The first is far cheaper and the second is the honest reading of the `DESC` as written.** The owner rules |
| R10 | A `RULE` cannot say it rests on another `RULE` | S7b extracted two `DOMAIN format` rules out of two `DOMAIN merge` ones. `@RULE.TerraformationLevelsTakeTheHigherValue` can point at nothing to say its sentinel `SPEC` rests on `@RULE.APurificationLevelOfMinusOneMeansNotUnlocked`; the link survives only in a `SOURCE` prose and in a `REF`. `DECISION` has `RESTS_ON @RULE`; `RULE` has `ASSUMES @HYPOTHESIS` and nothing toward a rule | `FIELD RESTS_ON @RULE` on `RULE`, with a `CONVERSE` of its own, so a merge rule names the format fact it consumes. It needs the P10 probes S7b did not run |
| R11 | `COMMAND` carries no obligation, so a contract statement has no home but `DECISION` | GR-CFG-2 — the caller supplies `saveDisplayName` — is a statement about what `@COMMAND.MergeSaves` owes and is owed. `COMMAND` declares `INVOCATION`, `IMPL` and `APPLIES` only, so the statement landed in the methodology area as a `DECISION`, away from the command it describes | Either `FIELD SPEC` with its `ATTESTED_BY` on `COMMAND`, as `RULE` has, or the deliberate ruling that a command's contract is a `DECISION` and the corpus says so once. Today neither is written down |

### Read and left as is

`FIELDSET.Era`, `FIELDSET.Ruling`, the `GATE` blocks, `SHAPE`, the `WHEN DOMAIN merge` block itself: S7b wrote four
entities and rewrote six fields against them and hit nothing. The `WHEN DOMAIN merge` block did exactly its work —
`CONFLICT` and `RESOLUTION` are `REQUIRED` there and nowhere else, which is why every merge rule had a `CONFLICT`
line to audit at all. **Three of the fourteen were untrue, and the schema is what made them falsifiable.**

## The starter's own steps, written into the corpus (S7b, 2026-09-18)

Raised by the owner at S7b's confirmation: the walk is a temporary process, and nothing of it should survive in the
corpus. It survives in **56 entities of 274**, 55 times in a `SOURCE`, twice in a `REJECTED` and once in an `UNTIL`.

| File | Type | Entities citing a step | Of that type |
|------|------|------------------------|--------------|
| `docs/awawa-project-specification/rules.awawa` | `RULE` | 21 | **21 of 21** |
| `docs/awawa-project-specification/sections.awawa` | `SECTION` | 12 | **12 of 12** |
| `docs/awawa-project-specification/hypotheses.awawa` | `HYPOTHESIS` | 5 | **5 of 5** |
| `docs/awawa-project-specification/commands.awawa` | `COMMAND` | 2 | **2 of 2** |
| `docs/awawa-project-methodology/decisions.awawa` | `DECISION` | 12 | 12 of 105 |
| `docs/awawa-project-methodology/tasks.awawa` | `TASK` | 2 | 2 of 19 |
| `docs/awawa-project-methodology/limitations.awawa` | `LIMITATION` | 1 | 1 of 9 |
| `docs/awawa-project-methodology/processes.awawa` | `PROCESS` | 1 | 1 of 13 |

**The whole product specification area — 40 entities out of 40 — dates itself by a step of a document the project
will never read again.** The wordings are « step S7 of the specification walk », « retyped from `FACT` in step S7 of
the specification walk », « Step S8 of the specification walk », « Review of the target schema, S5 to S6 boundary of
the specification walk », and, added by this step, « in step S7b of the specification walk ».

What is legitimate in those same lines and must survive any correction: the **date**, the **source document**
(`docs/game-rules.md`, `docs/save-format.md`, the root manifest), the **`GR-*` identifier**, and the **pull request**
the statement comes from. Only the step rank is the starter's.

S7b added six of the fifty-six and is therefore part of what it reports: four `SOURCE` corrections and the two
`REJECTED` of the new decisions name S7 and S7b.
