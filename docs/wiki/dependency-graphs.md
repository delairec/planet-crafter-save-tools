# Dependency graphs

Edges are the imports found in the production sources (specs, `testing/`, e2e and test setup files excluded), measured on `master` at `054b4e0`, after wave 14 and before wave 15. An arrow `A --> B` reads "A imports B". Each package and each folder is one block. The counts given as "before" were measured at `c81d99f`, before wave 14.

## Packages

```mermaid
flowchart TD
    subgraph apps [" "]
        direction LR
        cli-merge["cli-merge"]
        cli-validate["cli-validate"]
        ui-save-manager["ui-save-manager"]
    end
    core-mapping["core-mapping"]
    subgraph libs [" "]
        direction LR
        shared-platforms["shared-platforms"]
        shared-save-processing["shared-save-processing"]
    end
    subgraph leaves [" "]
        direction LR
        util-types["util-types"]
        data-save-format["data-save-format"]
        data-energy["data-energy"]
        data-planets["data-planets"]
        data-world-objects["data-world-objects"]
    end

    cli-merge --> core-mapping
    cli-merge --> shared-platforms
    cli-merge --> shared-save-processing
    cli-validate --> core-mapping
    cli-validate --> shared-platforms
    ui-save-manager --> core-mapping
    core-mapping --> shared-save-processing
    core-mapping --> data-save-format
    core-mapping --> data-energy
    core-mapping --> data-planets
    core-mapping --> data-world-objects
    shared-save-processing --> data-save-format
    shared-platforms --> util-types

    style apps fill:none,stroke:none
    style libs fill:none,stroke:none
    style leaves fill:none,stroke:none
```

## Layers of `core-mapping`

```mermaid
flowchart TD
    composition["composition"]
    controllers["controllers"]
    presentation["presentation"]
    infrastructure["infrastructure"]
    application["application"]
    domain["domain"]

    composition --> controllers
    composition --> presentation
    composition --> infrastructure
    composition --> application
    controllers --> presentation
    controllers --> application
    presentation --> application
    infrastructure --> application
    infrastructure --> domain
    application --> domain
```

## Reading against Clean Architecture

### Packages: no violation

- Arrows go from `cli-*` and `ui-*` to `core-*`, then `shared-*`, then `util-*` and `data-*`, as the matrix of `docs/wiki/architecture.md` sets.
- The four `data-*` packages are new: the value tables left `core-mapping` and `shared-save-processing`.
- No cycle and no upward arrow.

### Layers of `core-mapping`: no violation

Closed by wave 14:

- `controllers --> composition`: 9 imports before, 0 now. The use cases are injected into the controllers, and the composition root instantiates the controllers. Nothing inside `core-mapping` imports `composition`; the three applications do, through the one export `core-mapping/composition/compositionRoot`.
- `presentation --> domain`: 14 imports before, 0 now. The presenters receive application responses.

Conforming:

- `composition` is the outermost block: it imports every layer it wires and is imported by none.
- `controllers --> presentation`: 9 imports, each of a ViewModel type. No controller imports a concrete presenter.
- `controllers --> application`: 9 request types and the `UseCase` contract.
- `presentation --> application`: 32 imports of responses, 9 of presenter ports.
- `infrastructure --> application` and `infrastructure --> domain`: the adapters implement the ports.
- `application --> domain`: the application depends on the domain only.
- `domain` has no outgoing arrow.

### What the graphs do not show, measured

| Blind spot                                             | Measure                                                                                         |
|--------------------------------------------------------|-------------------------------------------------------------------------------------------------|
| Third-party imports in `core-mapping`                  | 0 in every layer; `ajv` is imported by no production file of the package                        |
| Workspace packages imported by `core-mapping`          | 34 imports, all under `infrastructure/`                                                         |
| JSON tables imported outside `infrastructure/`         | 0                                                                                               |
| Domain types in a presenter port                       | 0 import from `domain/` under `application/ports`                                               |
| Domain types in a Response                             | 4 imports in 3 responses (`ValidationIssue`, `UnreadableLine`, `SaveSections`); the `guards` job accepts them |
| `controllers --> composition`: static or injected      | no static import; injection through the constructor                                             |

The whole `@CHECKLIST.architecture_review` was not replayed: this reading covers the dependency rule, not the responsibilities of each layer.
