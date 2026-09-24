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

The prefix of a package name sets what it is allowed to depend on. A type-only import counts as a dependency.

| Prefix     | May depend on                  |
|------------|--------------------------------|
| `util-*`   | nothing                        |
| `shared-*` | `util-*`                       |
| `core-*`   | `shared-*`, `util-*`           |
| `cli-*`    | `shared-*`, `util-*`, `core-*` |
| `ui-*`     | `shared-*`, `util-*`, `core-*` |

`bun run check:dependencies` enforces this matrix.

What each package does in detail is in the specification corpus: `awawa show @PACKAGE.<name> .`.
