# Architecture

This is a Bun workspace monorepo, organized around package prefixes:

| Package                  | Role                                                                                                                                 |
|--------------------------|--------------------------------------------------------------------------------------------------------------------------------------|
| `shared-save-processing` | Save file wire format: types, parsing, serialization and JSON schemas.                                                               |
| `shared-platforms`       | Runtime platform adapters (filesystem/process) for Bun and Node, and the reading of `--name=value` and `--name` arguments.           |
| `util-types`             | `RuntimePlatform` contract type, consumed (type-only) by `shared-platforms`.                                                         |
| `core-mapping`           | Merge and validation engines organized in Clean Architecture layers to be reusable accross multiple different frontends (CLIs, UIs). |
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

What each package does in detail is in the specification corpus: `awawa show @PACKAGE.<name> .`.

The imports as measured, between packages and between the layers of `core-mapping`, are drawn in [Dependency graphs](dependency-graphs.md).
