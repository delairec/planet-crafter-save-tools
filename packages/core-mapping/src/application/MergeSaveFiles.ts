import {SaveValidatorPort} from "./ports/SaveValidatorPort";
import {SaveReaderPort} from "./ports/SaveReaderPort";
import {SaveSerializerPort} from "./ports/SaveSerializerPort";
import {MergeResultPresenterPort} from "./ports/MergeResultPresenterPort";
import {MergeSaveFilesRequest} from "./requests/MergeSaveFilesRequest";
import {nameMergedFile} from "./nameMergedFile";
import {mergeSaveSections} from "../domain/rules/merge/mergeSaveSections";
import {resolveIdConflicts} from "../domain/rules/merge/resolveIdConflicts";

export class MergeSaveFiles {
  constructor(
    private readonly validator: SaveValidatorPort,
    private readonly saveReader: SaveReaderPort,
    private readonly saveSerializer: SaveSerializerPort,
    private readonly presenter: MergeResultPresenterPort
  ) {}

  async execute({fileNameA, contentA, fileNameB, contentB, saveDisplayName}: MergeSaveFilesRequest): Promise<void> {
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

    const saveA = this.saveReader.read(contentA);
    const saveB = this.saveReader.read(contentB);

    if (saveA.errors.length > 0 || saveB.errors.length > 0) {
      this.presenter.presentMergedSaveUnusable();
      return;
    }

    const {fileName, stem} = nameMergedFile({fileNameA, fileNameB});
    const mergedSave = resolveIdConflicts(mergeSaveSections(saveA.sections, saveB.sections, saveDisplayName ?? stem));
    const content = this.saveSerializer.serialize(mergedSave);

    const mergedSaveValidation = this.validator.validate(fileName, content);

    this.presenter.presentMergeSucceeded({
      fileName,
      content,
      mergeErrors: mergedSaveValidation.errors,
      saveAWarnings: validationA.warnings,
      saveBWarnings: validationB.warnings
    });
  }
}
