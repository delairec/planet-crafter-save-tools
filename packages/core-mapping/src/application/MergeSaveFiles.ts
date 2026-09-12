import {SaveValidatorPort} from "./ports/SaveValidatorPort";
import {SaveFilesMergerPort} from "./ports/SaveFilesMergerPort";
import {MergeResultPresenterPort} from "./ports/MergeResultPresenterPort";
import {MergeSaveFilesRequest} from "./requests/MergeSaveFilesRequest";

export class MergeSaveFiles {
  constructor(
    private readonly validator: SaveValidatorPort,
    private readonly merger: SaveFilesMergerPort,
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

    const mergedSave = this.merger.merge(fileNameA, contentA, fileNameB, contentB, saveDisplayName);

    if (mergedSave.content.length === 0) {
      this.presenter.presentMergedSaveUnusable();
      return;
    }

    const mergedSaveValidation = this.validator.validate(mergedSave.fileName, mergedSave.content);

    this.presenter.presentMergeSucceeded({
      fileName: mergedSave.fileName,
      content: mergedSave.content,
      mergeErrors: mergedSaveValidation.errors,
      saveAWarnings: validationA.warnings,
      saveBWarnings: validationB.warnings
    });
  }
}
