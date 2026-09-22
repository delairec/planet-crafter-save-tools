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
| `awawa-feedback-overview.md`            | The overview the page opens on, as written: every proposed remediation of the five reports, facing the defects it closes.                                                                                   |
| `awawa-usage-reports.zip`               | The eleven usage reports aggregated by the field report of the page, as they were sent.                                                                                                                     |
| `awawa-migration-feedback.md`           | The Markdown export of the Migration 1 report, as the page generates it.                                                                                                                                    |
| `awawa-migration-2-feedback.md`         | The Markdown export of the Migration 2 report, as the page generates it.                                                                                                                                    |
| `awawa-migration-3-feedback.md`         | The Migration 3 report, as written: the page's Migration 3 tab is built from it.                                                                                                                            |
| `awawa-specification-starter.md`        | The starter offered by the Migration 2 report: a generic ten-step method to bootstrap an awawa corpus, one step per session, handed to the awawa team as it is. The page embeds it for its download button. |
| `awawa-specification-starter-v2.md`     | The second version of the starter, carrying what one full walk of version 1 found. The page embeds it for the download button of its Migration 3 view.                                                      |
| `awawa-field-report.md`                 | The Markdown export of the field report, as the page generates it.                                                                                                                                          |
| `awawa-ide-plugins-report.md`           | The Markdown export of the IDE plugins report, as the page generates it.                                                                                                                                    |
| `awawa-ide-plugins-report-2.md`         | The second IDE plugins report, as written: the page's « IDE plugins 2 » tab is built from it.                                                                                                                |
| `2026-09-22-corpus-reading-cost.md`     | The context savings example, as written: the page's « Context savings example » tab and the CTX row of its overview are built from it.                                                                      |

The awawa team reads these files outside the repository: no file here carries a
relative link, which would resolve to nothing for them.

Every file here is linked from the page by its name. None is deleted, renamed
or moved unless the page is republished without that link in the same unit of
work, and an export the page regenerates is copied here at the same
republication. When a file the page embeds changes here, the page is
republished with the new copy in the same unit of work; otherwise its download
button serves the old version while the raw link serves the new one.
