# Changelog of cli-validate

## 0.1.0 — 2026-09-24

- chore: add a versioning mechanism and improve security (#132)
- feat: add support for Skeo moon update (#127)
- refactor(shared-save-processing): expose a function selecting one section of a save string (#123)
- feat(core-mapping): add Skeo to the planet numeric id table (#112)
- feat(core-mapping): validate and merge the logisticsPaused of a Skeo save (#111)
- fix(core-mapping): refuse a save whose section 0 carries no entry (#102)
- chore(tables): the product value tables become JSON files with a JSON Schema each (#103)
- docs(awawa): add the product specification area and the Migration 3 feedback (#98)
- docs(awawa): migrate project methodology corpus to the target schema (#95)
- refactor: review and fix clean archi violations in core mapping package (#15)
- fix: update type definitions for importMeta and fake save options
- refactor: clean up typings to have one source of truth
- refactor: update save file schema to remove Terrain Layers section and adjust indices
- feat: handle save files backward compatibility
- refactor: improve specs and refactor tests
- feat(ui-save-manager): extract and present save configuration
- feat(ui-save-manager): add statistics to global progression section
- feat: add minimal error handling on file input
- refactor: turn ParsedSave into a data structure
- refactor: use a factory to create multiple instances of generator
- fix(ui-save-manager): display terraformation levels as raw
- feat(ui-save-manager): introduce table structure component
- feat(util-mapping): create save parser service
- fix: update game definitions
- chore: add workspaces management
