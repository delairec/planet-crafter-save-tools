# Architecture

This is a Bun workspace monorepo, organized around package prefixes:

| Package                  | Role                                                                                                                                 |
|--------------------------|--------------------------------------------------------------------------------------------------------------------------------------|
| `shared-save-processing` | Save file wire format: types, parsing, serialization and JSON schemas.                                                               |
| `shared-platforms`       | Runtime platform adapters (filesystem/process) for Bun and Node, and the reading of `--name=value` and `--name` arguments.           |
| `core-mapping`           | Validation, merge and display engines in Clean Architecture layers, one folder per business, reusable across front ends (CLIs, UIs). |
| `cli-merge`              | Thin CLI: parses `--input`/`--output`/`--prefer-legacy` arguments and delegates to `core-mapping`.                                   |
| `cli-validate`           | Thin CLI: parses `--file` argument and delegates to `core-mapping`.                                                                  |
| `ui-save-manager`        | SolidStart UI to visualize save files, consuming `core-mapping` controllers.                                                         |
| `data-energy`            | Energy levels and those of an earlier release: JSON tables, row types and selectors.                                                 |
| `data-planets`           | Planet names by numeric id: JSON table, row type and selector.                                                                       |
| `data-world-objects`     | World object labels and optimizer configuration: JSON tables, row types and selectors.                                               |
| `data-save-format`       | Game releases and legacy terrain layer properties: JSON tables, row types and selectors.                                             |

The prefix of a package name sets what it is allowed to depend on. A type-only import counts as a dependency.

| Prefix     | May depend on                  |
|------------|--------------------------------|
| `data-*`   | nothing                        |
| `util-*`   | nothing                        |
| `shared-*` | `util-*`, `data-*`             |
| `core-*`   | `shared-*`, `util-*`, `data-*` |
| `cli-*`    | `shared-*`, `util-*`, `core-*` |
| `ui-*`     | `shared-*`, `util-*`, `core-*` |

`bun run check:dependencies` enforces this matrix. A `data-*` package holds value tables, their row types and the selectors reading them, and no business rule; in a `core-*` package, only `infrastructure/` imports it, behind an application port.

The production sources of an interface are held to less than the matrix. Outside its spec files and its `testing/` folders, a `cli-*` or `ui-*` package imports no workspace package other than a `core-*` package and, for a `cli-*` package, `shared-platforms`; an `import type` and a JSDoc `@import` count. `bun run check:dependencies` enforces this too. An interface so reaches the save format through a core only, while its specs keep building their saves with the fixtures of `shared-save-processing/testing`, which is why a CLI declares `shared-save-processing` under `devDependencies`. The ruling and its reasons: `awawa show @DECISION.AnInterfaceReachesTheSaveFormatThroughACoreOnly .`.

What each package does in detail is in the specification corpus: `awawa show @PACKAGE.<name> .`.

## Layout of `core-mapping`

`packages/core-mapping/src` is laid out by business first, each business holding its own layers (`domain/`, `application/`, `infrastructure/`, `presentation/`, `controllers/`, `composition/`), those it needs and no other:

| Area          | Holds                                                                                                                                                        |
|---------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `validation/` | Validating a save file.                                                                                                                                      |
| `merge/`      | Merging two saves.                                                                                                                                           |
| `display/`    | Displaying a save.                                                                                                                                           |
| `save/`       | What at least two businesses use: the save model and the domain rules judging it, the parser, validator and game releases adapters, the validation messages. |

A business imports `save/` and no file of another business; `save/` imports no business. `bun run check:business-boundaries` holds both, spec files and test support included.

The dependency rule between the layers holds across the areas as inside one: `merge/application` may import `save/domain`, never `save/infrastructure`. `bun run check:layers` holds it on the production files.

Each business wires its controllers in a composition root of its own, `<business>/composition/compositionRoot.ts`. The manifest of `core-mapping` exports these three composition roots and the `presentation/viewModels/` folder of each area, nothing else. An interface imports the composition roots of the businesses it calls, and so loads no other: `cli-validate` the one of `validation/`, `cli-merge` the one of `merge/`, `ui-save-manager` all three.

The ruling and its reasons: `awawa show @DECISION.EachBusinessOfCoreMappingLivesInAFolderOfItsOwn .`.

The imports as measured, between packages, between the areas of `core-mapping` and between its layers, are drawn in [Dependency graphs](dependency-graphs.md).
