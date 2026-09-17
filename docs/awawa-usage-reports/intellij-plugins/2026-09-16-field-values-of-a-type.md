# 2026-09-16 — awawa gives no single call for the field values of a type

<!--
Not a per-pull-request usage report: it follows no `_template.md` heading, and no `TASK` names it.
It records a missing command of the instrument, met while building the awawa-ui IntelliJ tool
window (`~/Web/awawa/editors/intellij/ui`, local repository, commit 2841f49, decisions D11 and D12
of its `AGENTS.md`). awawa 2.7.0, corpus of planet-crafter-save-tools. Addressed to the authors of
awawa.
-->

**Verdict**: a table of one type — one row per entity, one column per field — needs the field values of every entity of
that type. The tool holds them after a single walk of the workspace, and hands them out one entity per call, each call
walking the workspace again. Reading a type therefore costs its number of entities times the size of the corpus: it
grows quadratically as the corpus does.

| # | Missing command                                  | Commands that come closest                                                                                              | What they answer                                                                                                                                                                                  | Cost                                                                                                                                        |
|---|--------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------|
| 1 | The field values of every entity of a type, once | `awawa status DECISION --json .`; `awawa show docs/processus.awawa --json .`; `awawa show @DECISION.<Name> --json .` | `status TYPE` itemises identity, `STATUS`, file, line and incoming counts, no field; `show FILE` gives each line's field path and token columns, not the values; `show TARGET` gives the values of one entity | One `show` per entity: 232 calls take 4.4 s in sequence, 0.58 s on 8 threads, on 5,013 corpus lines — and each call re-walks the corpus |

## Details

### What was measured

- One `show @DECISION.AgentsMdNommeUneEntiteModeleParType --json` takes 19 ms; `awawa --version` takes under 1 ms.
  The time of a call is the walk of the workspace, not the start of the binary.
- 232 `show` calls, one per entity of the corpus: 4.4 s in sequence, 0.58 s with `xargs -P8`.
- `show` takes one target: a second one is read as a `PATH`
  (`awawa: @DECISION.LeCorpusEstDecoupeParDomaine: No such file or directory`).
- The resolved schema of a type — `INCLUDE`, `WHEN` and the fields inherited from `@SCHEMA.*` included — is reachable
  only as `context <an entity of that type> --depth 0 --with-schema --json`, under `resolved.<TYPE>`.
  `show TYPE --json` answers the schema as written, without the fields every type inherits. A type no entity uses has
  therefore no call answering its resolved schema.

### What the plugin does meanwhile

- It reads a type only when its tab is first shown, and keeps it until the next refresh: a refresh costs the calls of
  one type, not of the corpus.
- The quadratic growth remains within a type.

## Proposals

| Proposal                                                                                                                 | What it would change                                                                                                                  |
|--------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------|
| `status TYPE --json --fields`: every itemised entity carries its `fields`, in the shape `show TARGET --json` already uses | A tab is read in one walk: 232 calls become one, and the cost grows with the corpus instead of with its square                         |
| `show TYPE --json --resolved` (or the same `resolved` block in `status TYPE --json`)                                        | The columns of a type no entity uses are known, and the schema stops being borrowed from a context package of an unrelated entity    |

## What was not checked

- Whether a later version than 2.7.0 offers either: the version in use is the only one measured.
- The cost on a corpus larger than this one: the quadratic growth is inferred from the per-call cost being the walk,
  not measured on a second corpus size.
