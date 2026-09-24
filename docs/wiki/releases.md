# Releases and production

## Versions

The three tools a user runs carry a version each: `cli-merge`, `cli-validate` and `ui-save-manager`, every package
whose name starts with `cli-` or `ui-`. The other packages are internal and carry none that anyone reads. The web UI
shows its version in the footer.

A tool takes a new version when a commit of `master` since its last version changes its package or a workspace
package it depends on, directly or not: a fix in `core-mapping` raises all three, a fix in `cli-merge` raises that one
only. The Conventional Commits type of the commit sizes the step. The tools are below their first major version:
there, a `!` before the colon raises the minor number and anything else the patch number. Leaving `0` is a decision
written by hand in the `package.json`, never the outcome of a release; from `1.0.0` on, a `!` raises the major
number, a `feat` the minor one, anything else the patch number. Every change reaches `master` through a pull
request, so every commit there carries a checked title.

## Cutting a release

```
bun run release
```

Run on a branch cut from an up-to-date `master`. For each tool that changed, it raises the `version` of its
`package.json`, adds an entry listing the commits it carries to its `CHANGELOG.md`, and refreshes `bun.lock`. Open
the pull request it names, `chore(release): …`, against `master`.

```
bun run release:tag
git push origin <the tags it names>
```

Run on `master` once the release pull request is merged. It sets an annotated tag `<tool>-v<version>` on that squash
commit for every version no tag names yet. The `Release` workflow then runs `bun run release:verify` on the tagged
commit. A tag creates no GitHub release: the `CHANGELOG.md` of each tool is its release note.

## Publishing the web UI

Production is the deploy of the commit a `ui-save-manager-v*` tag names — the squash commit of the release pull
request — published by hand from the Netlify dashboard. Netlify builds every push to `master` and every pull request
against it, and the deploy previews stay public, but it never publishes production by itself.

The production build is served at https://planet-crafter-save-manager.netlify.app/. The `Site check` workflow, run
from the Actions tab after each publication and every week, checks that it loads and carries the headers of
`packages/ui-save-manager/public/_headers`; `bun run --filter ui-save-manager check:site -- --url=<address>` runs the
same check locally. It also prints the version and the commit the site serves, read from the `version.json` every
build writes at the site root, and names the latest `ui-save-manager-v*` tag when the site does not serve it; neither
fails the check, since publishing a tag is its owner's call. The `production` badge of the README reads the same
`version.json`; the Netlify badge next to it reports the build of `master`, not what production serves.
