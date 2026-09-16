*Feedback for the awawa dev team · awawa 2.7.0 · 2026-09-16*

# IDE plugins report: a corpus as a table

What building an IntelliJ tool window on top of the `awawa` binary showed about the answers a user interface needs. The plugin is ours, not yours; the needs it met are likely the ones any editor or web view of a corpus will meet.

- **232** — entities in one view
- **19 ms** — per show call
- **4.4 s** — one table, in sequence
- **4** — missing answers

## The plugin, and the rule it keeps

**awawa-ui** is an IntelliJ tool window, installed beside `editors/intellij`, our editor plugin for `.awawa` files, and sharing no code with it. Neither plugin comes from the awawa team. Where the editor plugin serves the corpus as text, this one serves it as a list: one tab per entity type, one sortable row per entity, one column per field the schema resolves for that type, a filter, and a double click that opens the entity where it is written. It reads and only reads.

It keeps the rule the editor plugin states: **the plugin contains no logic**. No parsing of corpus text, no reference resolution, no knowledge of any entity type — it shells out to the binary and renders the `--json` reply. Under that rule, every workaround the plugin had to write is a command the binary lacks, and that is what this page lists.

| What the view shows | Call it is built from today |
|---|---|
| Tabs, rows, counts, file and line | `status --json .`, once per refresh |
| The columns of a type | `context @TYPE.First --depth 0 --with-schema --json .`, under `resolved.<TYPE>` |
| The cell values | `show @TYPE.Name --json .`, once per entity, in parallel |
| The status colour | the position of the value in `statuses` from `status --json` |

## Missing answers

Measured on the planet-crafter-save-tools corpus (232 entities, 5,013 lines) and, for the last one, on a throwaway corpus. The tag says what the missing answer costs the view.

### 01. No single call returns the field values of every entity of a type  
*cost grows quadratically*

A table of one type needs the fields of all its entities. The binary holds them after one walk of the workspace and hands them out one entity per call: `status TYPE` itemises identity, `STATUS`, file, line and incoming counts but no field; `show FILE --json` gives each line's field path and token columns but not the values; `show TARGET --json` gives the values of one entity, and takes one target only — a second one is read as a `PATH`.

The time of a call is the walk, not the start of the binary: one `show` takes 19 ms where `awawa --version` takes under 1 ms. A 232-entity tab therefore costs 232 walks: 4.4 s in sequence, 0.58 s on 8 threads, and the cost is the number of entities times the size of the corpus. The plugin contains it by reading a type only when its tab is first opened; the growth within a type remains.

**Proposal** — `status TYPE --json --fields`: every itemised entity carries its `fields`, in the shape `show TARGET --json` already uses. One walk per tab instead of one per row.

### 02. The resolved schema of a type is reachable only through one of its entities  
*empty tab*

The columns of a type are the fields its schema resolves: `INCLUDE`, `WHEN` and what every type inherits from `@SCHEMA.*` included. `show TYPE --json` answers the schema as written, without the inherited fields. The resolved form exists only as `context <an entity of that type> --with-schema --json`, under `resolved.<TYPE>`.

A type the schema declares and no entity uses has no entity to borrow, so its tab has no columns at all — precisely the tab a user opens to see what a new entity of that type would need.

**Proposal** — `show TYPE --json --resolved`, or the same `resolved` block in `status TYPE --json`.

### 03. `show TARGET --json` returns atoms as source text, untyped  
*token rules in the view*

Each field comes back as `{"name", "atoms", "fields"}`, where an atom is the text as written: a string arrives with its quotes and escapes, a reference as `@TYPE.Name`, a word bare, with nothing saying which is which. A cell that shows a string without its quotes and a reference as a link must tell them apart itself, which is exactly the token knowledge the no-logic rule keeps out of the view.

The binary already knows the kinds: `show FILE --json` tags every token `string`, `word`, `field`, `name` — but as column offsets on a line, not as values of an entity.

**Proposal** — typed atoms in `show TARGET --json`: `{"kind": "string", "text": "…", "value": "…"}`, the value unescaped; a `reference` kind carrying its resolved target.

### 04. `statuses` mixes the declared lifecycle with values merely written  
*misleading colour*

The view colours a `STATUS` cell by the position of its value in the `statuses` array of `status --json`, so that no status name is hard-coded. On a corpus whose schema declares `draft | specified | implemented | superseded` and one entity writes `STATUS nonsense`, the array answers `["draft", "specified", "implemented", "superseded", "nonsense"]`: the invalid value takes the next colour of the palette and reads as a fifth stage of the lifecycle. Lint flags the entity; the report the view reads does not.

The array is also one list for the whole workspace. How it reads on a corpus that declares a ladder per type, as the migration report recommends, was not measured.

**Proposal** — keep `statuses` to the declared values, per type where the schema declares them per type, and list the undeclared values apart, e.g. `"undeclared_statuses"`.

## What held

| Mechanism | What it gave the view |
|---|---|
| One `status --json` call for the inventory | Every tab, every row, its file and line and its incoming count, in one call per refresh: the rows show at once, before any column is read. |
| `statuses` in lifecycle order | A status colour with no status name in the plugin. Defect 04 is about what else lands in that list, not about the idea. |
| The `resolved` block of `context --with-schema` | Columns that include inherited and conditional fields, without the plugin reading a schema. Defect 02 is about reaching it. |
| Frozen `--json` shapes | A decoder that knows the reply shapes and nothing of the format, and every reply stamped with the `awawa` version that produced it. |
| Refusals written for a reader | A refusal from the binary is shown to the user as the binary wrote it: the view adds no message of its own. |
| One tab per type, zero included | `status --json` lists a declared type at zero entities, so the view gives it an empty tab — a type at zero is a signal worth showing. |

## Held in the plugin, not asked of the tool

Two choices the view made on its own. They are not requests; they are listed because any other interface over a corpus will face them.

- **A name read as a sentence.** `AucunCanalDAvertissementDeFusionSansProducteur` is shown as *Aucun canal d'avertissement de fusion sans producteur*: split at the capitals, lowercased after the first word, acronyms kept, French elisions restored. It is a language assumption in a view that otherwise knows nothing of the corpus, contained to display: the identifier stays in the tooltip and in what the filter matches. A corpus-declared display label would remove it; nothing here asks for one yet.
- **Finding the binary.** An IDE started from the desktop or from Toolbox inherits no login shell, so a binary in `~/.local/bin` is not on its `PATH`. The view looks in a configured path, `$AWAWA_BIN`, the `PATH`, then `~/.cargo/bin` and `~/.local/bin`. Any editor plugin will meet the same case: `install.sh` copies the binary to `~/.cargo/bin` or `~/.local/bin`, both outside the `PATH` of a desktop-launched IDE.

## If you add one thing

1. **`status TYPE --json --fields`** (defect 01). It turns a table from one walk per row into one walk per tab, and with the `resolved` block beside it (defect 02) a type is read in a single call, whether it has entities or not.

---

*Written on awawa 2.7.0 against the planet-crafter-save-tools corpus, from the awawa-ui plugin at commit 2841f49, a local repository not published. The timings of defect 01 come from the report recorded on 2026-09-16 in `docs/awawa-usage-reports/intellij-plugin-ui/`; the JSON shapes of defects 02 and 03 and the `statuses` behaviour of defect 04 were re-checked the same day, the last on a throwaway corpus.*
