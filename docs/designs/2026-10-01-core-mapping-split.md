# Splitting core-mapping into one core per business, 2026-10-01

Working document of wave 15. It records the target the owner set in the session of 2026-10-01, the state it starts
from, and the order of the work. The tasks are the `TASK` entities of `@WAVE.15`; this document is their shared
context and is not updated once they are delivered.

## Target

`core-mapping` serves three businesses today: validating a save, merging two saves, displaying a save. A fourth,
editing a save, is planned. Each business becomes a `core-*` package that any interface can consume, and what several
cores need lives in `shared-*` packages.

| Package                  | Holds                                                                                              |
|--------------------------|----------------------------------------------------------------------------------------------------|
| `shared-save-processing` | the wire format, and the decoded save: its entries, its parser, the game releases                   |
| `shared-save-validation` | the validation of a save as one function returning codes and data, never a sentence                 |
| `shared-messages`        | the sentences several cores show, built from a key and its data                                     |
| `core-validate`          | the validation use case, its presenters and controllers                                             |
| `core-merge`             | the merge rules, the merge use case that validates its inputs and its output, its own messages      |
| `core-display`           | the entities and value objects, the six display use cases, number formatting, its own messages      |
| `core-edition`           | later, not in this wave                                                                             |
| `cli-*`, `ui-*`          | call the cores, `shared-platforms` for the CLIs, and hold the text that names the interface itself  |

Rules of the target:

- `cli-*` and `ui-*` production sources import `core-*` packages, and `shared-platforms` for the CLIs. They never
  import `shared-save-processing`.
- No `core-*` package imports another `core-*` package. The dependency matrix of `docs/wiki/architecture.md` is
  unchanged.
- An interface sequences the cores it needs: the save manager validates, then displays; later it displays, edits, then
  validates.
- A core that writes a save (merge, later edition) validates inside its own use case, through
  `shared-save-validation`, so that the invariant does not depend on the interface.
- A presenter keeps building the sentence of a business outcome. Text that names the interface (a button, a page
  title, a field label, a reminder naming a flag or a checkbox) belongs to the interface.
- Number formatting is how the game shows its data, a business rule, and stays in the core.
- Each core translates the codes it receives. A sentence several cores show is written once in `shared-messages`,
  which leaves room for a second language later; nothing is built for that now.

## Flows

| Flow                     | Calls made by the interface                                   |
|--------------------------|---------------------------------------------------------------|
| Validate from the CLI    | `core-validate`                                               |
| Merge, CLI and UI        | `core-merge`, which validates both inputs and the merged save |
| Load and display a save  | `core-validate`, then `core-display`                          |
| Edit a save, later       | `core-display`, `core-edition`, which validates its output    |

## State measured on `origin/master` at `054b4e0`

Wave 14 is merged. Import closure of the production files of `core-mapping`, from the use case, the adapters and the
presenters each business wires in `composition/useCaseFactories.ts`; 231 files reached.

| Reached by               | domain | application | infrastructure | presentation | controllers | total |
|--------------------------|--------|-------------|----------------|--------------|-------------|-------|
| display only             | 10     | 27          | 4              | 36           | 6           | 83    |
| merge only               | 26     | 12          | 2              | 5            | 1           | 46    |
| validate only            | 0      | 5           | 0              | 3            | 2           | 10    |
| validate and merge       | 15     | 4           | 7              | 7            | 0           | 33    |
| validate and display     | 0      | 0           | 0              | 1            | 0           | 1     |
| validate, merge, display | 32     | 10          | 11             | 4            | 1           | 58    |

Where the overlap comes from, and what the target does with it:

| Overlap                                                                                                   | Cause                                                                                                             | Target                                                                               |
|-----------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------|
| Entities, value objects, reader and mapper reached by validate and merge                                  | both read the save through `SaveSectionsReaderPort` only to call `validateUniqueHost` on `PlayerEntity`           | the rule reads the player entries, which carry `host`; entities serve display alone  |
| `domain/save/*`, the parser, its codecs, the section location                                             | the decoded save, needed by the three                                                                             | `shared-save-processing`                                                             |
| Game release value object, its five rules, its reader                                                     | needed by the three                                                                                               | `shared-save-processing`                                                             |
| Validator adapter, `domain/validation/*`, `validateUniqueHost`, `detectDeclaredReleaseContradiction`      | the validation sequence is written twice, in `ValidateSaveFile` and in `MergeSaveFiles`                            | `shared-save-validation`, one function                                               |
| `formatErrorLocation`, `saveSectionLabels`, the validation issue, unreadable line and save warning texts  | sentences the three presentations show                                                                            | `shared-messages`                                                                    |

Other facts the tasks rest on:

- `cli-merge` imports `shared-save-processing/jsonExtension.js` once, in `cli/initMergeCli.js`, to filter the files of
  a folder. It is the only production import of `shared-save-processing` from an interface.
- The specs of `cli-merge` and `cli-validate`, and five scripts of the root, import the fixtures of
  `shared-save-processing/testing/`. The rule on interfaces covers production sources only.
- Unreadable lines come from the parser; the reader only forwards them.
- `core-mapping` exports its wired controllers through `composition/compositionRoot` and its view models. Each core
  keeps that shape.

## Recorded decisions the wave rewrites

| Decision                                                  | Change                                                                                         |
|-----------------------------------------------------------|------------------------------------------------------------------------------------------------|
| `DissolvedPackagesAreNotRecreated`                        | `util-messages` was dissolved; `shared-messages` is a new package with a ruling of its own      |
| `UserTextLivesInCoreMappingPresentation`                  | one messages directory per core, the shared sentences in `shared-messages`                      |
| `CoreMappingExportsOnlyControllersAndViewModels`          | restated for each core                                                                          |
| `TheModulesTheClisImportKeepTheirContract`                | the contract holds; the modules it names move to `core-merge` and `core-validate`               |
| `WireAbbreviationsStayInSharedSaveProcessing`             | the boundary between wire records and decoded entries now sits inside the package               |
| `SharedSaveProcessingOwnsSectionParsingAndSerialization`  | extended to the decoded save and the game releases                                              |
| every decision with `APPLIES_TO_PACKAGE @PACKAGE.core_mapping` (58) | re-pointed to the core that inherits the code                                         |

## Points left to the refinement of each task

- The decoded save in `shared-save-processing`, or in a package of its own beside it, so that the wire abbreviations
  keep a package boundary.
- The game releases went from `shared-save-processing` to the domain in wave 14 (violation 6 of the audit of
  2026-09-28) as business knowledge. Moving them to a shared package is the owner's ruling for wave 15: what several
  cores need is shared. The task says where the comparison rules sit inside the package.
- `validateUniqueHost` and `detectDeclaredReleaseContradiction` are business rules. They move to
  `shared-save-validation` with the rest of the validation, by the same ruling.
- `shared-messages` exposes a function per message or a lookup by key. A function per message keeps typed parameters
  and the detection of an unused message; a key table is what a second language needs.
- The name of the display core: `core-display` here.
- The serializer stays in `core-merge` until `core-edition` needs it.

## Order

`REFACTOR172` is independent. The others move the same files and follow one another: `REFACTOR173`, `REFACTOR174`,
`REFACTOR175`, `REFACTOR176`, `REFACTOR177`, `REFACTOR178`, `REFACTOR179`, then `REFACTOR180` and `DOCS181`.
