import {MergeResultPresenterPort} from "../application/ports/MergeResultPresenterPort";
import {MergeSucceededResponse} from "../application/responses/MergeSucceededResponse";
import {SaveFilesInvalidResponse} from "../application/responses/SaveFilesInvalidResponse";
import {MergeResultViewModel} from "./viewModels/MergeResultViewModel";
import {formatValidationError} from "./formatValidationError";
import {formatSaveWarning} from "./formatSaveWarning";
import {formatMergeWarning} from "./formatMergeWarning";
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
