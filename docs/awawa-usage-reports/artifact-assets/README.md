# Artifact assets

Files served to the readers of the public feedback page for the awawa team
(<https://claude.ai/artifact/F3xSEc1istJN17usqaKtFq>). The artifact platform
neither serves archives as published files nor lets a page start a download
for a viewer outside its organization, so the page links these readers to the
raw GitHub copy of each file instead, while members of the organization download
the exports and the embedded files from the page itself:

```
https://raw.githubusercontent.com/delairec/planet-crafter-save-tools/master/docs/awawa-usage-reports/artifact-assets/<file>
```

| File                                    | Content                                                                                                                                                                                                     |
|-----------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `awawa-usage-reports.zip`               | The eleven usage reports aggregated by the field report of the page, as they were sent.                                                                                                                     |
| `awawa-migration-feedback.md`           | The Markdown export of the Migration 1 report, as the page generates it.                                                                                                                                    |
| `awawa-migration-2-feedback.md`         | The Markdown export of the Migration 2 report, as the page generates it.                                                                                                                                    |
| `awawa-specification-starter.md`        | The starter offered by the Migration 2 report: a generic ten-step method to bootstrap an awawa corpus, one step per session, handed to the awawa team as it is. The page embeds it for its download button. |
| `awawa-specification-starter-v2.md`     | The second version of the starter, carrying what one full walk of version 1 found. Not served by the page yet: it is neither linked nor embedded until the page is republished with it.                     |
| `awawa-field-report.md`                 | The Markdown export of the field report, as the page generates it.                                                                                                                                          |
| `awawa-ide-plugins-report.md`           | The Markdown export of the IDE plugins report, as the page generates it.                                                                                                                                    |

The awawa team reads these files outside the repository: no file here carries a
relative link, which would resolve to nothing for them.

Every file here is linked from the page by its name. None is deleted, renamed
or moved unless the page is republished without that link in the same unit of
work, and an export the page regenerates is copied here at the same
republication. When a file the page embeds changes here, the page is
republished with the new copy in the same unit of work; otherwise its download
button serves the old version while the raw link serves the new one.
