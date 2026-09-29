import {MergeResultPresenterPort} from "../application/ports/MergeResultPresenterPort";
import {MergeSucceededResponse} from "../application/responses/MergeSucceededResponse";
import {SaveFilesInvalidResponse} from "../application/responses/SaveFilesInvalidResponse";
import {SaveFilesWithoutJsonExtensionResponse} from "../application/responses/SaveFilesWithoutJsonExtensionResponse";
import {SaveFilesWithoutUniqueHostResponse} from "../application/responses/SaveFilesWithoutUniqueHostResponse";
import {MergeResultViewModel} from "./viewModels/MergeResultViewModel";
import {SaveValidationMessageViewModel} from "./viewModels/SaveFileValidationViewModel";
import {formatValidationError} from "./formatValidationError";
import {formatSaveWarning} from "./formatSaveWarning";
import {formatMergeWarning} from "./formatMergeWarning";
import {formatUniqueHostError} from "./formatUniqueHostError";
import {formatJsonExtensionError} from "./formatJsonExtensionError";
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

  presentSaveFilesWithoutJsonExtension({saveAHasJsonExtension, saveBHasJsonExtension}: SaveFilesWithoutJsonExtensionResponse): void {
    this._viewModel = {
      status: 'validationError',
      fileName: '',
      content: '',
      mergeFailureMessage: '',
      mergeErrors: [],
      mergeWarnings: [],
      legacyFormatCouldBeKept: false,
      saveAErrors: formatMissingJsonExtension(saveAHasJsonExtension),
      saveBErrors: formatMissingJsonExtension(saveBHasJsonExtension),
      saveAWarnings: [],
      saveBWarnings: []
    };
  }

  presentSaveFilesInvalid({saveAErrors, saveBErrors, saveAWarnings, saveBWarnings}: SaveFilesInvalidResponse): void {
    this._viewModel = {
      status: 'validationError',
      fileName: '',
      content: '',
      mergeFailureMessage: '',
      mergeErrors: [],
      mergeWarnings: [],
      legacyFormatCouldBeKept: false,
      saveAErrors: saveAErrors.map(formatValidationError),
      saveBErrors: saveBErrors.map(formatValidationError),
      saveAWarnings: saveAWarnings.map(formatSaveWarning),
      saveBWarnings: saveBWarnings.map(formatSaveWarning)
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

function formatMissingJsonExtension(hasJsonExtension: boolean): SaveValidationMessageViewModel[] {
  return hasJsonExtension ? [] : [formatJsonExtensionError()];
}
