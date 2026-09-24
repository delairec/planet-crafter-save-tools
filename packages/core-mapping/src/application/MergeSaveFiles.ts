import {SaveValidatorPort} from "./ports/SaveValidatorPort";
import {SaveSectionsParserPort} from "./ports/SaveSectionsParserPort";
import {SaveSectionsSerializerPort} from "./ports/SaveSectionsSerializerPort";
import {MergeResultPresenterPort} from "./ports/MergeResultPresenterPort";
import {MergeSaveFilesRequest} from "./requests/MergeSaveFilesRequest";
import {MergeWarning} from "./responses/MergeWarning";
import {nameMergedFile} from "./nameMergedFile";
import {mergeSaveSections} from "../domain/rules/merge/mergeSaveSections";
import {resolveIdConflicts} from "../domain/rules/merge/resolveIdConflicts";
import {SaveSections} from "../domain/save/SaveSections";

export class MergeSaveFiles {
  constructor(
    private readonly validator: SaveValidatorPort,
    private readonly parser: SaveSectionsParserPort,
    private readonly serializer: SaveSectionsSerializerPort,
    private readonly presenter: MergeResultPresenterPort
  ) {}

  async execute({fileNameA, contentA, fileNameB, contentB, saveDisplayName, preferLegacyFormat = false}: MergeSaveFilesRequest): Promise<void> {
    const validationA = this.validator.validate(fileNameA, contentA);
    const validationB = this.validator.validate(fileNameB, contentB);

    if (!validationA.isValid || !validationB.isValid) {
      this.presenter.presentSaveFilesInvalid({
        saveAErrors: validationA.errors,
        saveBErrors: validationB.errors,
        saveAWarnings: validationA.warnings,
        saveBWarnings: validationB.warnings
      });
      return;
    }

    const saveA = this.parser.parse(contentA);
    const saveB = this.parser.parse(contentB);

    if (saveA.errors.length > 0 || saveB.errors.length > 0) {
      this.presenter.presentMergedSaveUnusable();
      return;
    }

    const {fileName, stem} = nameMergedFile({fileNameA, fileNameB});
    const mergedSave = resolveIdConflicts(mergeSaveSections(saveA.sections, saveB.sections, {saveDisplayName: saveDisplayName ?? stem, preferLegacyFormat}));
    const content = this.serializer.serialize(mergedSave);

    const mergedSaveValidation = this.validator.validate(fileName, content);

    this.presenter.presentMergeSucceeded({
      fileName,
      content,
      mergeErrors: mergedSaveValidation.errors,
      mergeWarnings: reportMergedSaveFormat(saveA.sections, saveB.sections, mergedSave),
      legacyFormatCouldBeKept: saveA.sections.formatRelease !== saveB.sections.formatRelease && !preferLegacyFormat,
      saveAWarnings: validationA.warnings,
      saveBWarnings: validationB.warnings
    });
  }
}

function reportMergedSaveFormat(sectionsA: SaveSections, sectionsB: SaveSections, mergedSave: SaveSections): MergeWarning[] {
  if (sectionsA.formatRelease === sectionsB.formatRelease) {
    return [];
  }

  const formatWarning: MergeWarning = {code: 'merged-save-format', formatRelease: mergedSave.formatRelease};
  if (mergedSave.terrainLayers !== undefined) {
    return [formatWarning];
  }

  return [formatWarning, {code: 'merged-save-section-dropped', section: 'terrainLayers'}];
}
