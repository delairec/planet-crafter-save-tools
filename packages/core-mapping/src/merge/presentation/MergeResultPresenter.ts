import {MergeResultPresenterPort} from "../application/ports/MergeResultPresenterPort";
import {MergeSucceededResponse} from "../application/responses/MergeSucceededResponse";
import {SaveFilesInvalidResponse} from "../application/responses/SaveFilesInvalidResponse";
import {SaveFileFindingsResponse} from "../application/responses/SaveFileFindingsResponse";
import {SaveFilesWithoutUniqueHostResponse} from "../application/responses/SaveFilesWithoutUniqueHostResponse";
import {MergeResultViewModel} from "./viewModels/MergeResultViewModel";
import {SaveValidationMessageViewModel} from "../../save/presentation/viewModels/SaveValidationMessageViewModel";
import {formatValidationError} from "../../save/presentation/mappers/formatValidationError";
import {formatSaveWarning} from "../../save/presentation/mappers/formatSaveWarning";
import {formatMergeWarning} from "./mappers/formatMergeWarning";
import {formatUniqueHostError} from "../../save/presentation/mappers/formatUniqueHostError";
import {formatJsonExtensionError} from "../../save/presentation/mappers/formatJsonExtensionError";
import {mergedSaveUnusableMessage} from "./messages/mergeFailureMessages.js";

export class MergeResultPresenter implements MergeResultPresenterPort {
  private _viewModel: MergeResultViewModel;

  constructor() {
    this._viewModel = {
      status: 'idle',
      fileName: '',
      content: '',
      mergeFailureMessage: '',
      mergeErrors: [],
      mergeWarnings: [],
      legacyFormatCouldBeKept: false,
      saveAErrors: [],
      saveBErrors: [],
      saveAWarnings: [],
      saveBWarnings: []
    };
  }

  get viewModel(): MergeResultViewModel {
    return this._viewModel;
  }

  presentMergeSucceeded({fileName, content, mergeErrors, mergeWarnings, legacyFormatCouldBeKept, saveAWarnings, saveBWarnings}: MergeSucceededResponse): void {
    this._viewModel = {
      status: 'success',
      fileName,
      content,
      mergeFailureMessage: '',
      mergeErrors: mergeErrors.map(formatValidationError),
      mergeWarnings: mergeWarnings.map(formatMergeWarning),
      legacyFormatCouldBeKept,
      saveAErrors: [],
      saveBErrors: [],
      saveAWarnings: saveAWarnings.map(formatSaveWarning),
      saveBWarnings: saveBWarnings.map(formatSaveWarning)
    };
  }

  presentSaveFilesInvalid({saveA, saveB}: SaveFilesInvalidResponse): void {
    this._viewModel = {
      status: 'validationError',
      fileName: '',
      content: '',
      mergeFailureMessage: '',
      mergeErrors: [],
      mergeWarnings: [],
      legacyFormatCouldBeKept: false,
      saveAErrors: formatFindingErrors(saveA),
      saveBErrors: formatFindingErrors(saveB),
      saveAWarnings: formatFindingWarnings(saveA),
      saveBWarnings: formatFindingWarnings(saveB)
    };
  }

  presentSaveFilesWithoutUniqueHost({saveAWrongHostCount, saveBWrongHostCount, saveAWarnings, saveBWarnings}: SaveFilesWithoutUniqueHostResponse): void {
    this._viewModel = {
      status: 'validationError',
      fileName: '',
      content: '',
      mergeFailureMessage: '',
      mergeErrors: [],
      mergeWarnings: [],
      legacyFormatCouldBeKept: false,
      saveAErrors: formatWrongHostCount(saveAWrongHostCount),
      saveBErrors: formatWrongHostCount(saveBWrongHostCount),
      saveAWarnings: saveAWarnings.map(formatSaveWarning),
      saveBWarnings: saveBWarnings.map(formatSaveWarning)
    };
  }

  presentMergedSaveUnusable(): void {
    this._viewModel = {
      status: 'mergeFailed',
      fileName: '',
      content: '',
      mergeFailureMessage: mergedSaveUnusableMessage,
      mergeErrors: [],
      mergeWarnings: [],
      legacyFormatCouldBeKept: false,
      saveAErrors: [],
      saveBErrors: [],
      saveAWarnings: [],
      saveBWarnings: []
    };
  }
}

function formatWrongHostCount(wrongHostCount: number | undefined): SaveValidationMessageViewModel[] {
  return wrongHostCount === undefined ? [] : [formatUniqueHostError(wrongHostCount)];
}

function formatFindingErrors(findings: SaveFileFindingsResponse): SaveValidationMessageViewModel[] {
  return findings.hasJsonExtension ? findings.errors.map(formatValidationError) : [formatJsonExtensionError()];
}

function formatFindingWarnings(findings: SaveFileFindingsResponse): SaveValidationMessageViewModel[] {
  return findings.hasJsonExtension ? findings.warnings.map(formatSaveWarning) : [];
}
