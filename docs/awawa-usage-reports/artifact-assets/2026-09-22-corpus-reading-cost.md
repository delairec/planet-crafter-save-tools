# Context savings by reading the corpus in a session

Author: Claude Opus 5 (`claude-opus-5`), medium effort. Out-of-template report, 2026-09-22.

Every command output enters the agent's context and stays there until compaction: a command does not spare the
context, it only reads less than the files would. The weight comes from the default verbosity of the commands, not
from the corpus, and the instructions loaded in full weighed more than the corpus did.

## TL;DR

> Without the corpus, the same information would live in Markdown files read in full, which costs more:
> `context` with `--skip reasoning --skip provenance` remains the lightest reading available here.

## What one session loaded

Perimeter: the session that rewrote `@RULE.APlayerEntryCarriesCameraViewAndItsLifetimeTotals` and
`@RULE.TheGlobalMetadataEntryCarriesLogisticsPaused` (PR #117), 2026-09-22. Sizes are line counts read from the
outputs, not measured in tokens.

| Output                                                                                                                  | Output size           | File size             | What was actually used                                    |
|-------------------------------------------------------------------------------------------------------------------------|-----------------------|-----------------------|-----------------------------------------------------------|
| `awawa context @RULE.APlayerEntryMayOmitTheFieldsAddedByALaterUpdate --skip reasoning --skip provenance --with-schema .` | 145 lines             | 421 lines             | about 15; the rest mostly the schema, `SCHEMA *` included |
| `awawa context @RULE.TheGlobalMetadataEntryMayOmitLogisticsPaused --skip reasoning --skip provenance .`                 | 25 lines              | 421 lines             | all of it                                                 |
| `awawa show @TASK.DOCS86 .`                                                                                             | about 60 lines        | 1164 lines            | its `SPEC` lines; `RATIONALE` and `SOURCE` unused         |
| Instructions outside the corpus: `corpus.md` and `reports.md` of `~/.ai/instructions/`, the project's `agents/corpus-ecrire.md` and `agents/pull-request.md`, the `awawa-schema` skill | several hundred lines | several hundred lines | a small fraction |

## Additional levers

| Lever                                                                                                                         | Effect                                                                                                                                                         | Limit                                                             | Owner                                      |
|-------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------|--------------------------------------------|
| `awawa show` gains `--skip CATEGORY`, as `context` has                                                                        | a task read without its `RATIONALE` and `SOURCE`                                                                                                               | missing from awawa 2.7.0: `show TARGET\|FILE:LINE\|FILE [--json]` | the awawa authors, through a usage report  |
| Reading convention: `context --depth 1` without `--with-schema` to answer a question; `--with-schema` only to write an entity | the first call above drops the schema, most of its 145 lines; `--depth 1` bounds the walk, though on a small closure such as the second call it saves nothing | a deeper edge must be asked for explicitly                        | CORPUS-6 in `~/.ai/instructions/corpus.md` |
| Delegate an exploration to a sub-agent                                                                                        | its context is separate; only its conclusion comes back                                                                                                        | useless when the exact text is needed to edit it                  | the session                                |
| Extract one field: `awawa show @TYPE.X --json . \| jq -r '.fields[] \| select(.name=="SPEC") \| .atoms[0]'`                   | only the field asked for                                                                                                                                       | not done by reflex until the convention is written down           | CORPUS-4 in `~/.ai/instructions/corpus.md` |
