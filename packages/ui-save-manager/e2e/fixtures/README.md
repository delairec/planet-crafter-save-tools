# End-to-end fixtures

Save files used by the scenarios. They are generated, never copied from a real game save: `input/` is not versioned,
so the suite has to run on a machine — and on a CI runner — that has no real save at hand. They are not committed
either: git ignores every `.json` of this directory, and this README is the only file of it the repository tracks.

## Generating them

`scripts/generate-scenario-fixtures.ts` declares every fixture of this directory and is the only place that says
how each one is built. It is the global setup of `playwright.config.ts`, so every run of the scenarios — `bun run
test:ui` from the root, `playwright test` from `packages/ui-save-manager` — writes them here, under Node, before the
first scenario starts. `bun run generate:scenario-fixtures` writes the same files without running the scenarios, to
open a fixture or check it with `bun validate`.

`bun run check:scenario-fixtures`, part of `bun run guards`, refuses any scenario reaching into `input/`.

Every fixture is the output of `createFakeSaveContent()`, from
`packages/shared-save-processing/testing/createFakeSaveContent.js` (a wrapper around `createFakeSaveString.js`, the
generator the unit tests already rely on). Pass an override object to build a variant; the record builders the
overrides use come from `packages/shared-save-processing/testing/createSaveRecords.js`. A fixture meant to be valid is
checked with `bun validate -- --file=<path>`.

## Naming

`<content>_<expected>.json`: what the save carries that no other fixture carries, then the verdict the validator
gives it — `valid` or `invalid`. Words inside a segment are separated by a hyphen, the two segments by an underscore.
The role a fixture plays in a scenario is not part of its name: the same file is the save under display in one
scenario and save A of a merge in another, so the role belongs to the variable that binds it and to this file.

## `baseline_valid.json`

`createFakeSaveContent()` called with no override.

## `other-player_valid.json`

Another player, another set of world objects and inventories, another save display name, so that the file a merge
produces can be told apart from both of its sources. Its player is a host, like the player of `baseline_valid.json` —
a save designating no host does not pass validation, and the merge is what demotes the second host.

## `negative-gauge_invalid.json`

`baseline_valid.json` with one gauge of its player below zero, which the players section schema forbids. The save is
otherwise intact, so the validation it fails yields a single error, located on the record that carries the gauge —
which is what makes it the fixture of the scenarios asserting that an error says where in the save it was found.

## `legacy-format_valid.json`

The content of `baseline_valid.json` in the legacy save format, the one still carrying the Terrain Layers section a
later game update removed. Loading it adapts the save and raises a warning, so the file is valid and warned about at
once.

## `skeo-update_valid.json`

A save written by the Skeo update: `logisticsPaused` in its global metadata, and one placed world object carrying
the numeric planet id of Skeo, `-440810600`.
