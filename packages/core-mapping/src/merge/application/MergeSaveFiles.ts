import {UseCase} from "../../save/application/UseCase";
import {SaveValidatorPort} from "../../save/application/ports/SaveValidatorPort";
import {SaveSectionsParserPort} from "../../save/application/ports/SaveSectionsParserPort";
import {SaveSectionsSerializerPort} from "./ports/SaveSectionsSerializerPort";
import {GameReleasesReaderPort} from "../../save/application/ports/GameReleasesReaderPort";
import {FileNameSanitizerPort} from "./ports/FileNameSanitizerPort";
import {MergeResultPresenterPort} from "./ports/MergeResultPresenterPort";
import {MergeSaveFilesRequest} from "./requests/MergeSaveFilesRequest";
import {SaveFileFindingsResponse} from "./responses/SaveFileFindingsResponse";
import {SaveValidationResponse} from "../../save/application/responses/SaveValidationResponse";
import {mergeSaveSections} from "../domain/rules/mergeSaveSections";
import {resolveIdConflicts} from "../domain/rules/resolveIdConflicts";
import {collectSaveWarnings} from "../../save/domain/rules/collectSaveWarnings";
import {BrokenSaveInvariant, checkSaveInvariants} from "../../save/domain/rules/checkSaveInvariants";

const MERGED_FILE_NAME_SUFFIX = '-merged';

export class MergeSaveFiles implements UseCase<MergeSaveFilesRequest> {
  constructor(
    private readonly validator: SaveValidatorPort,
    private readonly parser: SaveSectionsParserPort,
    private readonly serializer: SaveSectionsSerializerPort,
    private readonly gameReleasesReader: GameReleasesReaderPort,
    private readonly fileNameSanitizer: FileNameSanitizerPort,
    private readonly presenter: MergeResultPresenterPort
  ) {}

  async execute({fileNameA, contentA, fileNameB, contentB, saveDisplayName, preferLegacyFormat = false}: MergeSaveFilesRequest): Promise<void> {
    const validationA = this.validateSaveFile(fileNameA, contentA);
    const validationB = this.validateSaveFile(fileNameB, contentB);

    if (!isMergeable(validationA) || !isMergeable(validationB)) {
      this.presenter.presentSaveFilesInvalid({saveA: reportFindings(validationA), saveB: reportFindings(validationB)});
      return;
    }

    const saveA = this.parser.parse(contentA);
    const saveB = this.parser.parse(contentB);
    const brokenInvariantA = checkSaveInvariants(saveA.sections, saveA.errors);
    const brokenInvariantB = checkSaveInvariants(saveB.sections, saveB.errors);

    if (brokenInvariantA !== null || brokenInvariantB !== null) {
      this.presentBrokenInvariants({brokenInvariantA, brokenInvariantB, saveAWarnings: validationA.warnings, saveBWarnings: validationB.warnings});
      return;
    }

    const {fileName, stem} = this.fileNameSanitizer.sanitize({sourceFileNames: [fileNameA, fileNameB], suffix: MERGED_FILE_NAME_SUFFIX});
    const sectionsMerge = mergeSaveSections(saveA.sections, saveB.sections, {saveDisplayName: saveDisplayName ?? stem, preferLegacyFormat});
    const mergedSave = resolveIdConflicts(sectionsMerge.sections);
    const content = this.serializer.serialize(mergedSave);

    const mergedSaveValidation = this.validator.validate(content);

    this.presenter.presentMergeSucceeded({
      fileName,
      content,
      mergeErrors: mergedSaveValidation.errors,
      mergeWarnings: sectionsMerge.warnings,
      legacyFormatCouldBeKept: sectionsMerge.legacyFormatCouldBeKept,
      saveAWarnings: validationA.warnings,
      saveBWarnings: validationB.warnings
    });
  }

  private presentBrokenInvariants({brokenInvariantA, brokenInvariantB, saveAWarnings, saveBWarnings}: BrokenInvariantsOfTwoSaves): void {
    if (brokenInvariantA?.code === 'unreadable-lines' || brokenInvariantB?.code === 'unreadable-lines') {
      this.presenter.presentMergedSaveUnusable();
      return;
    }

    this.presenter.presentSaveFilesWithoutUniqueHost({
      saveAWrongHostCount: brokenInvariantA?.hostCount,
      saveBWrongHostCount: brokenInvariantB?.hostCount,
      saveAWarnings,
      saveBWarnings
    });
  }

  private validateSaveFile(fileName: string, content: string): SaveFileValidation {
    if (!this.validator.hasJsonExtension(fileName)) {
      return {hasJsonExtension: false};
    }

    const validation = this.validator.validate(content);

    return {hasJsonExtension: true, ...validation, warnings: collectSaveWarnings(validation, this.gameReleasesReader.readGameReleases())};
  }
}

type ValidatedSaveFile = {hasJsonExtension: true} & SaveValidationResponse;

type SaveFileValidation = {hasJsonExtension: false} | ValidatedSaveFile;

interface BrokenInvariantsOfTwoSaves {
  brokenInvariantA: BrokenSaveInvariant | null;
  brokenInvariantB: BrokenSaveInvariant | null;
  saveAWarnings: SaveValidationResponse['warnings'];
  saveBWarnings: SaveValidationResponse['warnings'];
}

function isMergeable(validation: SaveFileValidation): validation is ValidatedSaveFile {
  return validation.hasJsonExtension && validation.isValid;
}

function reportFindings(validation: SaveFileValidation): SaveFileFindingsResponse {
  if (!validation.hasJsonExtension) {
    return {hasJsonExtension: false};
  }

  return {hasJsonExtension: true, errors: validation.errors, warnings: validation.warnings};
}
