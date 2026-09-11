import {SaveValidatorPort} from "./ports/SaveValidatorPort";
import {SaveFilesMergerPort} from "./ports/SaveFilesMergerPort";
import {MergeResultPresenterPort} from "./ports/MergeResultPresenterPort";
import {MergeSaveFilesRequest} from "./requests/MergeSaveFilesRequest";
import {MergedSaveValueObject} from "../domain/valueObjects/MergedSaveValueObject";
import {InvalidSaveDataError} from "../domain/errors/InvalidSaveDataError";

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

    let mergedSave: MergedSaveValueObject;
    try {
      mergedSave = this.merger.merge(fileNameA, contentA, fileNameB, contentB, saveDisplayName);
    } catch (error) {
      if (!(error instanceof InvalidSaveDataError)) {
        throw error;
      }
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
