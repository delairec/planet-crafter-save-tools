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

Runs `check:guards`, then the [Fallow](https://github.com/fallow-rs/fallow) audit and health reports (dead files,
unused exports, unresolved imports) against `master`. This is the whole gate in one command, for a working copy. The
CI covers the same ground in two jobs, each running the half it is equipped for: `guards` runs `check:guards`, and
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
bun run check:guards
```

Runs the guard scripts of this repository — every `check:*` script of `package.json`, plus `validate:tables` — which
enforce conventions no off-the-shelf linter knows about. They read no git history and take a fraction of a second, so
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

Fails on any import of `domain/entities/` made from a `presentation/` directory. A presenter receives a value
object, never a domain entity: an entity carries behaviour, so a presenter holding one decides when a domain
computation runs, and its shape follows the save format rather than what is displayed. Infrastructure may still
build entities — that is where a save is read and validated — and the reader port still hands them to the
application layer; only the presentation boundary is closed. Every `.js`, `.ts` and `.tsx` source of every package
is scanned, outside dependencies and build outputs, and type-only and dynamic imports count.

```
bun run check:action-pins
```

Fails on any `uses:` of `.github/workflows/` that names a tag, a branch or an abbreviated SHA instead of a full
40-character commit SHA, or that pins a SHA without a comment giving the version it resolves to
(`actions/checkout@<sha> # v7.0.1`). Whoever controls an action's repository can move any of its tags, an exact one
included, and some of those actions receive secrets; a commit SHA cannot be moved. Dependabot keeps proposing their
updates, rewriting the SHA and the version comment together. A local action (`./…`) names no ref and is not checked.

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
