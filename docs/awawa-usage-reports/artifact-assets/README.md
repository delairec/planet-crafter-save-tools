# Artifact assets

Files served to the readers of the public feedback page for the awawa team
(<https://claude.ai/artifact/F3xSEc1istJN17usqaKtFq>). The artifact platform
neither serves archives as published files nor lets a page start a download
for a viewer outside its organization, so the page links to these files by
their raw GitHub URL instead:

```
https://raw.githubusercontent.com/delairec/planet-crafter-save-tools/master/docs/awawa-usage-reports/artifact-assets/<file>
```

| File | Content |
|------|---------|
| `awawa-usage-reports.zip` | The eleven usage reports aggregated by the field report of the page, as they were sent: the copies under `../2026_09_15-11_reports_migration_and_field/` were rewritten with relative paths when they were moved. |
| `awawa-migration-feedback.md` | The Markdown export of the migration report, as the page generates it. |
| `awawa-field-report.md` | The Markdown export of the field report, as the page generates it. |
| `awawa-ide-plugins-report.md` | The Markdown export of the IDE plugins report, as the page generates it. |

Every file here is linked from the page by its name. None is deleted, renamed
or moved unless the page is republished without that link in the same unit of
work, and an export the page regenerates is copied here at the same
republication (@DECISION.LesFichiersDArtifactAssetsSuiventLArtefact).
