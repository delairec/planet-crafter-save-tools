import {SaveValidatorPort} from "./ports/SaveValidatorPort";
import {MergeSourceReaderPort} from "./ports/MergeSourceReaderPort";
import {MergedSaveSerializerPort} from "./ports/MergedSaveSerializerPort";
import {MergeResultPresenterPort} from "./ports/MergeResultPresenterPort";
import {MergeSaveFilesRequest} from "./requests/MergeSaveFilesRequest";
import {mergeSaveSections} from "../domain/rules/merge/mergeSaveSections";
import {resolveIdConflicts} from "../domain/rules/merge/resolveIdConflicts";

export class MergeSaveFiles {
  constructor(
    private readonly validator: SaveValidatorPort,
    private readonly sourceReader: MergeSourceReaderPort,
    private readonly serializer: MergedSaveSerializerPort,
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

    const sourceA = this.sourceReader.read(contentA);
    const sourceB = this.sourceReader.read(contentB);

    if (sourceA.errors.length > 0 || sourceB.errors.length > 0) {
      this.presenter.presentMergedSaveUnusable();
      return;
    }

    const mergedFileName = this.serializer.buildFileName({fileNameA, fileNameB});
    const mergedSections = mergeSaveSections(sourceA.sections, sourceB.sections, saveDisplayName ?? mergedFileName.stem);
    const mergedSave = this.serializer.serialize({fileName: mergedFileName.fileName, sections: resolveIdConflicts(mergedSections)});

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
