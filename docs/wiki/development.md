# Development

Tests, type checks, audits and the guard scripts of the repository, then the commands of the Save Manager UI.

## Unit tests

```
bun test
```

```
bun test:watch
```

Execute all the unit tests of the project. Use `watch` to enable automatic run on save.

Mocks and spies are restored between tests by a global `afterEach`, so no test has to clean up after itself. It comes
from `testSetup.ts`, preloaded through the `bunfig.toml` sitting next to it: one at the repository root, one in each
package. Bun resolves `bunfig.toml` from the working directory only, without looking at parent directories, so the
preload silently does not apply when tests are run from any other directory — a deeper folder inside a package, or an
IDE run configuration whose working directory is the folder of the test file.

```
bun test testIsolation.spec.ts
```

Checks that the preload actually applies. Run it with the working directory you want to check (the repository root, a
package folder, an IDE run configuration): it fails when mocks are not restored between tests in that context.

In an IDE, a generated run configuration usually takes the folder of the test file as its working directory, which is
deeper than any `bunfig.toml`. In IntelliJ, set the environment variable below on the Bun *configuration template*
(Run > Edit Configurations > Edit configuration templates…), so that every run configuration created afterwards loads
the setup whatever its working directory:

```
BUN_OPTIONS=--preload=<absolute path>/testSetup.ts
```

`BUN_OPTIONS` prepends CLI arguments to every Bun invocation, and a CLI flag wins over `bunfig.toml`. It applies to run
configurations created after the change only, so delete the temporary ones already generated. It lives in
`.idea/workspace.xml`, which is git-ignored: it is a per-developer setting, not shared and not used by the CI, where
`bunfig.toml` remains the source of truth.

## Type checks

```
bun run lint:types
```

Checks typings in all the project files (using `tsc --noEmit` under the hood). Every package owns a `tsconfig.json`
extending the root one and its own `lint:types` script, which the root script chains over the workspace: each package
is therefore checked as a separate program, with the libraries it is entitled to. Only `ui-*` declares the DOM
libraries, so a browser global referenced from a `core-*` or a `cli-*` package fails the check instead of resolving
silently, and the `.tsx` files of the UI are covered. `ui-save-manager` runs two programs, its own and the one of
`e2e/`, the Playwright types belonging to the scenarios alone.

## Dependency audit and updates

```
bun run audit
```

Audits production and development dependencies against the GitHub Advisory Database, failing on an advisory of
moderate severity or above. The `Dependencies` workflow runs it on every pull request, on every push to `master` and
once a month on `master`, so an advisory published against an unchanged `bun.lock` fails a run within a month. The two
Picomatch advisories are explicitly allowlisted because `micromatch` still requires the affected 2.x dependency
transitively; they should be removed as soon as that upstream constraint is updated. An allowlisted advisory stays
tied to the corpus: `check:audit-ignores` fails when an `--ignore=` of the script is named by the `SEEN_IN` of no
active `LIMITATION`.

Version bumps are raised on a schedule next to it. `.github/dependabot.yml`, maintained on the default branch because
Dependabot reads its configuration there and nowhere else, opens one grouped pull request per week for the actions the
workflows use and one for the Bun dependencies of the workspace. Both scan the repository root, where the manifest
declares every workspace member and the single `bun.lock` resolves them all. The `bun` ecosystem brings version
updates alone and never opens a security update, so `bun run audit` remains the net against vulnerabilities; the
actions receive their security updates as well. A pull request opened by Dependabot skips the Claude review workflow,
which has no secrets available on such a run.

## Quality gate

```
bun run audit:quality
```

Runs `guards`, then the [Fallow](https://github.com/fallow-rs/fallow) audit and health reports (dead files,
unused exports, unresolved imports) against `master`. This is the whole gate in one command, for a working copy. The
CI covers the same ground in two jobs, each running the half it is equipped for: `guards` runs `bun run guards`, and
`fallow` runs the audit and the health report through the Fallow action, which scopes them to the base of the pull
request and renders them into the run summary.

```
bun run release:verify
```

Runs every check a release must pass on the commit it tags: `lint:types`, `audit:quality`, `bun test`, `test:ui` and
the dependency audit, stopping at the first failure. The `Release` workflow runs it on every version tag pushed — a tag
whose name holds `v` or `@` followed by a digit — and it can be run by hand before tagging. `test:ui` needs the
browsers of `test:ui:install`.

## Guard scripts

```
bun run guards
```

Runs the guard scripts of this repository — every `check:*` script of `package.json`, plus `validate:tables` — which
enforce conventions no off-the-shelf linter knows about. Bun runs them one after the other; a failing guard does not
stop the next ones, each failure prints `Exited with code N` under the guard's name, and the command exits non-zero.
Each guard stays runnable alone, as `bun run check:<name>`. They read no git history and take a fraction of a second, so
they are the half of `audit:quality` to run while writing code.

```
bun run check:assertions
```

Fails on any spec asserting a fabricated boolean (`expect(list.some(...)).toBeTruthy()`, `expect(a > b).toBe(true)`):
a matcher applies to the value itself so that a failure shows the actual data. Boolean matchers stay legitimate on
business booleans such as `expect(player.host).toBe(true)`. Every `*.spec.{js,ts,tsx}` file of the repository is
scanned, outside dependencies and build outputs, and only the outermost asserted expression is read: a comparison
written inside a callback (`expect(list.find(item => item.id === 1)).toBeTruthy()`) builds the asserted value, it is
not the assertion. The check reads one line at a time, so an assertion spread over several lines escapes it.

```
bun run check:fixtures
```

Fails on any spec making a fixture compile instead of typing it: `as unknown`, `as never`, an `any` annotation —
including the JSDoc forms `/** @type {any} */` and `@param {any}`, which a search for `: any` does not see — and
`@ts-ignore`. A test fixture is built by its builder (`packages/shared-save-processing/testing/createSaveRecords.js`
for the save records) so that a record gaining a field breaks the build rather than a test. An input that is illegal
on purpose is declared with `@ts-expect-error`, which fails the day the error disappears, and the check requires that
directive to carry the justification saying which invalidity is under test. String literals are masked before the
line is read, so a forbidden form quoted in a message is not reported; like `check:assertions`, the check reads one
line at a time, so a declaration spread over several lines escapes it.

```
bun run check:dependencies
```

Fails on any breach of the dependency matrix of [Architecture](architecture.md). It reads the
manifest of every workspace package and the package specifiers imported by its `.js`, `.ts` and `.tsx` sources, then
reports a dependency declared on a forbidden prefix, an import of a forbidden prefix, an import of a workspace package
the manifest does not declare, and a declared workspace dependency that is never imported. A dependency on a library
outside the workspace is left to the Fallow audit. Type-only imports count, JSDoc `@import` directives included, so
the check sees what `tsc` erases.

```
bun run check:presentation
```

Fails on four refusals, closing the output boundary of a `core-` package and the way from a controller to a presenter:

- a file of a `presentation/` directory, specs included, that imports any module under `domain/` or
  `infrastructure/`, whatever its subdirectory. A presenter reads application responses and primitives only: a domain
  type carries behaviour, so a presenter holding one decides when a domain computation runs, and an infrastructure
  type ties what is displayed to the save format;
- a file of `application/responses/` that imports a module under `domain/entities/` or `infrastructure/`;
- a presenter port, a file `application/ports/*Presenter*`, that imports any module under `domain/`, whatever its
  subdirectory. The port is the contract the use case hands its outcome through, so it takes application responses
  or primitives only;
- a file of `controllers/` that imports a concrete presenter. A controller knows the view model type only: the
  composition root creates the presenter and hands it over with the use case.

Infrastructure may still build entities — that is where a save is read and validated — and the reader port still
hands them to the application layer; only the output boundary is closed. Every `.js`, `.ts` and `.tsx` source of every
`core-` package is scanned, outside dependencies and build outputs, and type-only and dynamic imports count. The
guard runs with no exemption.

```
bun run check:wire-format
```

Fails on a file under the `domain/` directory of a `core-` package, spec files included, that uses a save format
abbreviation — `gId`, `liId`, `woIds`, `siIds` or `linkedWo` — as an identifier, a property name or a property key,
string literal keys included. The domain names the business concept; the abbreviation is tolerated only in the save
format records and is translated at the domain boundary. Comments and string literals that are not keys are not
reported. An import of the save format records themselves is refused by `check:workspace-imports`.

Every `.js`, `.ts` and `.tsx` source under a `domain/` directory of every `core-` package is scanned, outside
dependencies and build outputs. The guard runs with no exemption.

```
bun run check:workspace-imports
```

Fails on any file of a `core-` package outside its `infrastructure/` directory that imports another workspace
package, spec files and `testing/` included. A value import, a type-only import, a re-export, a dynamic import and a
JSDoc `@import` all count. The application declares the types its ports exchange and the domain its own business
types; the infrastructure adapter maps the records of the other package onto them, so only the infrastructure knows
that package. The guard carries no allow-list.

```
bun run check:business-boundaries
```

Judges every `core-` package laid out by business, which it tells from the tree alone: a package holding the shared
area `src/save/`. A `core-` package laid out by layers holds no `src/save/` and is not judged. In a package laid out by
business, the area of a file is the first folder under `src/`: `save/` is the shared area, every other folder is a
business, so a business added under `src/` is held apart without touching the guard. The guard fails on:

- a file sitting directly under `src/`: every file lives in an area, so no file can bridge two businesses;
- a file of a business that imports a file of another business, and a file of `save/` that imports a file of any
  business. An import of a business folder itself (`../../display`) counts as an import of that business, and so does
  an extensionless specifier stopping directly under `src/` (`../../version`);
- a file of an area that names its own package (`core-mapping/merge/...`) or an entry of its import map (`#...`): the
  files of the package are imported by a relative path inside `src/` only;
- a relative or absolute specifier that leaves `src/` — towards the package root, through `node_modules`, into another
  package — or that names a file directly under `src/` with its extension (`../../version.ts`).

A business may import `save/` and its own files. Any other non-relative specifier is left to `check:workspace-imports`
and `check:dependencies`. The guard knows no layer: a business importing any layer of `save/` passes it, and the layer
boundaries are held by `check:layers`, `check:presentation` and `check:workspace-imports`.

Every `.js`, `.jsx`, `.ts`, `.tsx`, `.mjs`, `.cjs`, `.mts` and `.cts` file under `src/` is scanned, spec files and
`testing/` included. Static imports and re-exports wherever they start on their line, side-effect imports, `import()`
and `require()` whose argument is a string or a template literal without substitution, and JSDoc `@import` and
`import()` all count. String literals, template literals and regular expressions are read as such, so a `/*` or `//`
inside one hides no import, and an import written inside one is not read. The guard runs with no exemption. Its limits,
each pinned by a case of `scripts/readImportStatements.spec.ts` or `scripts/check-business-boundaries.spec.ts`:

- a specifier only known at run time — a template literal with a substitution, a variable, a concatenation — is not
  read;
- a `/` is read as the start of a regular expression or as a division from the token before it; where that guess is
  wrong (a regular expression right after the condition of an `if`), the misreading stops at the end of its line;
- an extensionless specifier stopping directly under `src/` is read as the area folder it names, so `../../save`
  passes even where a file `src/save.ts` exists; that file is reported on its own.

The layout it holds is described in [Architecture](architecture.md#layout-of-core-mapping).

```
bun run check:layers
```

Fails on a production file of a `core-` package that imports a layer its own layer may not depend on. The layer of a
file is the first layer folder on its path — `domain/`, `application/`, `infrastructure/`, `presentation/`,
`controllers/` or `composition/` — so a folder nested inside a layer and named after another one never takes a file
out of its layer. The matrix:

| A file of        | may import                                                                              |
|------------------|-----------------------------------------------------------------------------------------|
| `domain`         | `domain`                                                                                |
| `application`    | `application`, `domain`                                                                 |
| `infrastructure` | `infrastructure`, `application`, `domain`                                               |
| `presentation`   | `presentation`, the application contracts: `application/ports`, `requests`, `responses` |
| `controllers`    | `controllers`, `application`, `presentation`                                            |
| `composition`    | every layer                                                                             |

The matrix holds across the areas of a package exactly as inside one: `merge/application/` importing
`save/infrastructure/` is refused as `merge/infrastructure/` is. A relative import is judged by the path it resolves
to. A presentation file reads the application contracts it transforms outcomes with, not a use case: a use case is
told by its place, a file of `application/` outside `ports/`, `requests/` and `responses/`, the use-case contract
`UseCase` included. The guard also fails on a production file importing a file under `testing/`; outside
`infrastructure/`, on an import that is not a relative path to a source file — a runtime module (`node:`, `bun:`), an
npm package — and on an import of a JSON table, relative or not; and on a production file under no layer folder,
reported once on its own, its imports of `testing/` and of the outside world still reported.

One violation is reported by one guard: an import `check:presentation` refuses (a presentation file importing
`domain/` or `infrastructure/`, a response importing `infrastructure/`) or `check:workspace-imports` refuses (another
workspace package outside `infrastructure/`) is left to it. The production files are the `.js`, `.ts` and `.tsx`
files under the `src/` of every `core-` package, spec files and every file under a `testing/` folder left out; a file
of the package outside `src/`, such as `testSetup.ts`, is not read. Type-only, dynamic and JSDoc `@import` imports
count. The guard keeps these limits: an import resolving to a file or a folder under no layer folder is not judged by
the matrix, the file it reaches being reported on its own when it is a production file; a production file importing a
spec file outside `testing/` passes; and an area folder named after a layer is read as that layer. A path alias is
not a relative path, so outside `infrastructure/` it is refused as a package. The guard runs with no exemption.

```
bun run check:action-pins
```

Fails on any `uses:` of `.github/workflows/` that names a tag, a branch or an abbreviated SHA instead of a full
40-character commit SHA, or that pins a SHA without a comment giving the version it resolves to
(`actions/checkout@<sha> # v7.0.1`). Whoever controls an action's repository can move any of its tags, an exact one
included, and some of those actions receive secrets; a commit SHA cannot be moved. Dependabot keeps proposing their
updates, rewriting the SHA and the version comment together. A local action (`./…`) names no ref and is not checked.

```
bun run check:package-scripts
```

Fails on any script of the root manifest or of a workspace package that runs `bun` with `--cwd`, and on any script of
a `cli-` package that names the entry point its manifest declares under `main`. The root scripts are the only entry of
a command: `bun merge`, `bun validate` and their `node:` forms run the entry point from the repository root, so a
package script doing the same would duplicate them, and a path written relative to another directory than the one
the script runs from breaks as soon as it is run from its own.

## Save Manager UI

```
bun run dev:ui
```

Starts the Save Manager UI in development mode.

```
bun run build:ui
```

Builds the UI for production. `bun run preview:ui` builds then serves the result, and `bun run clean:ui` removes the
build output.

```
bun run test:ui:install
```

Downloads the three browser engines the scenario suite drives (Chromium, Firefox and WebKit). Run it once, and again
after a Playwright upgrade. On a machine missing the system libraries the engines need, install them too with
`bunx playwright install --with-deps chromium firefox webkit`, which asks for administrator rights.

```
bun run test:ui
```

Runs the UI scenarios of `packages/ui-save-manager/e2e/` against the production build, on the three engines. Nothing
has to be started beforehand: the suite builds the application, serves it, waits for the port and stops it afterwards.
The save files the scenarios load are generated fixtures versioned next to them, so the suite never depends on the
content of `input/`.

These scenarios are not part of `bun test`, which only collects unit tests: the `*.e2e.ts` suffix keeps the two
runners apart. In the CI they run in their own workflow, on the pull requests targeting `master` and on manual
dispatch — not on the pull requests targeting an integration branch.
