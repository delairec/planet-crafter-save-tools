# 2026-09-15 — awawa defects found outside a pull request review

<!--
Not a per-pull-request usage report: it follows no `_template.md` heading, and no `TASK` names it.
It records defects of the instrument found while working on the corpus, so that the next report does
not spend a pass rediscovering them. awawa 2.7.0, corpus of planet-crafter-save-tools.
-->

**Verdict**: two defects, both in how the tool gives access to what it already holds, neither of them recorded in the
ten reports of this folder nor in `../../../limitations.awawa`. One of them feeds the pain point flagged most often
here —
the agent reading corpus files instead of asking the tool — because for that one entity there is nothing else to do.

| # | Defect                                          | Command run                                                            | What came back                                                                                                                                                                                           | Cost                                                                                                                                                                                                                                              |
|---|-------------------------------------------------|------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| 1 | `@SCHEMA.*` is listed but unreachable by `show` | `awawa status SCHEMA .` then `awawa show SCHEMA .`, `awawa show '*' .` | `status` prints `@SCHEMA.* … ./docs/_schema.awawa:18`; `show SCHEMA` answers `@SCHEMA.SCHEMA is not defined in the workspace`; `show '*'` answers `` `*` is not a target; expected @TYPE.Name or TYPE `` | The entity that declares `STATUS`, `DESC`, `RATIONALE` and `SPEC` for every type is readable only by opening `_schema.awawa` — the one move this corpus's discipline forbids, and the recurring point flagged 8 times as of `2026-09-15-pr-83.md` |
| 2 | `new` accepts a name already taken, in silence  | `awawa new DECISION LeCorpsDeLaPrDecritLaTeteDeBranche .`              | The skeleton, with no warning, although the entity exists at `docs/processus.awawa:316`                                                                                                                  | The collision is free to report at the moment `new` runs, since the workspace is already parsed; it surfaces later as a lint finding, after the entity has been written                                                                           |

## Details

### 1. No target reaches `@SCHEMA.*`

- `status SCHEMA .` lists six schema entities, `@SCHEMA.*` among them, with its file and line.
- `show` resolves a bare `SCHEMA` to `@SCHEMA.SCHEMA`, not to the wildcard entry.
- `show '*'` is refused by the target parser before any lookup.
- No escaping for the name `*` is documented in `awawa --help`, and none of `@SCHEMA.*`, `'@SCHEMA.*'` reaches it —
  the first is expanded by the shell, the second refused.
- The workaround in use is `context <target> --with-schema`, which renders the wildcard fields inside a package of
  another entity. It works, and it is not a reading of the entry: it costs a package, and it never shows the entry's
  own `WHEN STATUS` blocks side by side.

### 2. `new` does not say the name exists

- `new` prints, never writes, so nothing is lost by the call itself. What is lost is the check: the agent pastes the
  skeleton, fills it, and the duplicate is found by `lint` one or more steps later.
- Everything needed for the check is already in hand — `new` reads the schema of the workspace it was given.

## Checked and already recorded, so not repeated here

| Candidate                                               | Where it is already recorded                                                                     |
|---------------------------------------------------------|--------------------------------------------------------------------------------------------------|
| The `BLOCKED_BY` footer ignores the referrers' `STATUS` | `@DECISION.LePiedDePageBlockedBySeCroiseAvecStatus`, flagged 8 times up to `2026-09-15-pr-83.md` |
| Referrers named, not expanded, in a context package     | `@DECISION.LesReferentsDUnContexteSeLisentParShow`, flagged 8 times                              |
| `awawa diff` runs against a copy                        | `@DECISION.AwawaDiffSeLanceContreUneCopie`                                                       |
| Directory anchors on which `L016` cannot fire           | Flagged 3 times up to `2026-09-15-pr-83.md`                                                      |

## What was not checked

- Whether `lint` reports a duplicate entity name, and under which rule: no duplicate was written into the corpus to
  find out.
- Whether either defect is fixed after 2.7.0: the version in use is the only one measured.
