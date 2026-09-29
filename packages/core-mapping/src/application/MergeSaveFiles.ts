import {compareGameReleases} from "shared-save-processing/gameReleases.js";
import {SaveValidatorPort} from "./ports/SaveValidatorPort";
import {SaveSectionsParserPort} from "./ports/SaveSectionsParserPort";
import {SaveSectionsReaderPort, SaveSectionsReading} from "./ports/SaveSectionsReaderPort";
import {SaveSectionsSerializerPort} from "./ports/SaveSectionsSerializerPort";
import {MergeResultPresenterPort} from "./ports/MergeResultPresenterPort";
import {MergeSaveFilesRequest} from "./requests/MergeSaveFilesRequest";
import {MergeWarning} from "./responses/MergeWarning";
import {SaveFileFindings} from "./responses/SaveFileFindings";
import {SaveValidationResult} from "./ports/SaveValidationResult";
import {nameMergedFile} from "./nameMergedFile";
import {mergeSaveSections} from "../domain/rules/merge/mergeSaveSections";
import {resolveIdConflicts} from "../domain/rules/merge/resolveIdConflicts";
import {SaveSections} from "../domain/save/SaveSections";
import {validateUniqueHost} from "../domain/rules/validateUniqueHost";

export class MergeSaveFiles {
  constructor(
    private readonly validator: SaveValidatorPort,
    private readonly saveSectionsReader: SaveSectionsReaderPort,
    private readonly parser: SaveSectionsParserPort,
    private readonly serializer: SaveSectionsSerializerPort,
    private readonly presenter: MergeResultPresenterPort
  ) {}

  async execute({fileNameA, contentA, fileNameB, contentB, saveDisplayName, preferLegacyFormat = false}: MergeSaveFilesRequest): Promise<void> {
    const validationA = this.validateSaveFile(fileNameA, contentA);
    const validationB = this.validateSaveFile(fileNameB, contentB);

    if (!isMergeable(validationA) || !isMergeable(validationB)) {
      this.presenter.presentSaveFilesInvalid({saveA: reportFindings(validationA), saveB: reportFindings(validationB)});
      return;
    }

    const readingA = this.saveSectionsReader.read(contentA);
    const readingB = this.saveSectionsReader.read(contentB);

    if (readingA.unreadableLines.length > 0 || readingB.unreadableLines.length > 0) {
      this.presenter.presentMergedSaveUnusable();
      return;
    }

    const wrongHostCounts = findWrongHostCounts(readingA, readingB);

    if (wrongHostCounts !== null) {
      this.presenter.presentSaveFilesWithoutUniqueHost({...wrongHostCounts, saveAWarnings: validationA.warnings, saveBWarnings: validationB.warnings});
      return;
    }

    const saveA = this.parser.parse(contentA);
    const saveB = this.parser.parse(contentB);

    const {fileName, stem} = nameMergedFile({fileNameA, fileNameB});
    const mergedSave = resolveIdConflicts(mergeSaveSections(saveA.sections, saveB.sections, {saveDisplayName: saveDisplayName ?? stem, preferLegacyFormat}));
    const content = this.serializer.serialize(mergedSave);

    const mergedSaveValidation = this.validator.validate(content);

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

  private validateSaveFile(fileName: string, content: string): SaveFileValidation {
    if (!this.validator.hasJsonExtension(fileName)) {
      return {hasJsonExtension: false};
    }

    return {hasJsonExtension: true, ...this.validator.validate(content)};
  }
}

type ValidatedSaveFile = {hasJsonExtension: true} & SaveValidationResult;

type SaveFileValidation = {hasJsonExtension: false} | ValidatedSaveFile;

function isMergeable(validation: SaveFileValidation): validation is ValidatedSaveFile {
  return validation.hasJsonExtension && validation.isValid;
}

function reportFindings(validation: SaveFileValidation): SaveFileFindings {
  if (!validation.hasJsonExtension) {
    return {hasJsonExtension: false};
  }

  return {hasJsonExtension: true, errors: validation.errors, warnings: validation.warnings};
}

interface WrongHostCounts {
  saveAWrongHostCount?: number;
  saveBWrongHostCount?: number;
}

function findWrongHostCounts(readingA: SaveSectionsReading, readingB: SaveSectionsReading): WrongHostCounts | null {
  const violationA = validateUniqueHost(readingA.saveSections.getPlayers());
  const violationB = validateUniqueHost(readingB.saveSections.getPlayers());

  if (violationA === null && violationB === null) {
    return null;
  }

  return {saveAWrongHostCount: violationA?.hostCount, saveBWrongHostCount: violationB?.hostCount};
}

function reportMergedSaveFormat(sectionsA: SaveSections, sectionsB: SaveSections, mergedSave: SaveSections): MergeWarning[] {
  if (sectionsA.formatRelease === sectionsB.formatRelease) {
    return [];
  }

  const writtenRelease = mergedSave.formatRelease;
  const otherRelease = sectionsA.formatRelease === writtenRelease ? sectionsB.formatRelease : sectionsA.formatRelease;
  const warnings: MergeWarning[] = [{code: 'merged-save-format', formatRelease: writtenRelease}];

  if (mergedSave.terrainLayers === undefined) {
    warnings.push({code: 'merged-save-section-dropped', section: 'terrainLayers'});
  }
  if (compareGameReleases(writtenRelease, otherRelease) < 0) {
    warnings.push({code: 'merged-save-content-newer-than-format', formatRelease: writtenRelease, contentRelease: otherRelease});
  }

  return warnings;
}
