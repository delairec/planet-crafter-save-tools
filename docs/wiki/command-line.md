# Command-line tools

The merge and the validation run from a clone of this repository, under Bun by default or under Node.js. The
[README](../../README.md) covers the installation and the everyday use; this page holds the details.

## `bun merge`

```
bun merge
```

Generates the merged saves in output directory, by processing all subfolders from input folder.

A folder holding a save file the validation refuses is reported and skipped, the remaining folders are still
processed, and the command exits with code `0`. A merge that runs and produces no usable save file, or a merged save
the output directory refuses, is a different matter: the command names the folder, stops there and exits with a
non-zero code. Code `2` is reserved for an input directory holding no folder to merge.

The save the merge produces is validated in turn, by the same rules as the saves it accepts. What that save does not
pass is named on stderr, folder by folder — never as a defect of one of the input files, since it is the merge that
produced it. This changes nothing else: the file is written where stdout announces it, the command still exits with
code `0`, and the remaining folders are still processed. The merged save is yours to use or to discard, with the
diagnostic in hand.

```
bun merge -- --input=<directory> --output=<directory> --prefer-legacy
```

Overrides the default `input` and `output` directories. When the two saves of a folder are written in different
formats, the merged save takes the format of the more recent game release, and the command reports on stderr the
format it wrote and the sections writing it dropped. `--prefer-legacy` writes the legacy format of 1.618 instead, for
every folder of the run; the save manager offers the same choice as a checkbox beside its merge button.

## `bun validate`

```
bun validate -- --file=<filepath>
```

Validates a json save file against the json schemas stored in this project. This is useful mostly for debugging.

## Version, help and arguments

```
bun merge -- --version
bun validate -- --version
```

Prints the name and the version of the command, and exits with code `0`. Quote that line in a bug report.

```
bun merge -- --help
bun validate -- --help
```

Prints the help of the command — its invocation, then every argument it accepts with what it does — and exits with
code `0` without reading anything, whatever other argument accompanies it. `-h` is not an alias.

Both commands accept `--name=value` arguments and the `--version` and `--help` switches only — `bun merge` the
`--prefer-legacy` switch besides — and act on none they do not know: an argument such as `--inpt=x`, `--input x`, a
bare `--file`, `--prefer-legacy=true` or `-h` is named on stderr, followed by the help, and the command exits with
code `1` without reading anything. The value is taken whole, so a path or a directory name may hold an equals sign.

## With Node.js

If you prefer to run the scripts using Node.js instead of Bun, use the following commands:

```
npm run node:merge
```

Node.js counterpart of `bun merge`.

```
npm run node:validate -- --file=<filepath>
```

Node.js counterpart of `bun validate`.

`npm install` works without Bun: the workspace declares nothing npm cannot read. Run it once, then the two
commands only need Node. A `package-lock.json` is yours to keep: the repository ignores it and maintains `bun.lock`
only, and the CI runs under Bun.

Both commands run the same sources as the Bun commands, straight from `packages/`, with no build step: `--import
./scripts/node/register.js` installs two [module customization hooks](https://nodejs.org/api/module.html#customization-hooks)
that resolve the extensionless relative imports and hand every `.ts` module to esbuild, which removes the
TypeScript syntax Node cannot strip on its own (type-only imports, constructor parameter properties).

Both are covered by execution tests: `packages/cli-validate/cli/validate-cli.node.spec.js` and
`packages/cli-merge/cli/merge-cli.node.spec.js` spawn them as real Node processes on save files generated into a
temporary directory, and assert their output, their exit code and the content of the merged save. They run with
`bun test`, so a command that no longer starts under Node — or that loses the content of a save while still
reporting success — fails the suite instead of reaching a release. Running them needs the Node version
`engines.node` declares.
