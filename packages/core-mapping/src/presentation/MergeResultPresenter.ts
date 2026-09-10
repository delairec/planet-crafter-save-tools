import {
  MergeResultPresenterPort,
  MergeSucceededOutcome,
  SaveFilesInvalidOutcome
} from "../application/ports/MergeResultPresenterPort";
import {MergeResultViewModel} from "./viewModels/MergeResultViewModel";
import {formatValidationError} from "./formatValidationError";
import {formatSaveWarning} from "./formatSaveWarning";
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
      saveAErrors: [],
      saveBErrors: [],
      saveAWarnings: [],
      saveBWarnings: []
    };
  }

  get viewModel(): MergeResultViewModel {
    return this._viewModel;
  }

  presentMergeSucceeded({fileName, content, mergeErrors, saveAWarnings, saveBWarnings}: MergeSucceededOutcome): void {
    this._viewModel = {
      status: 'success',
      fileName,
      content,
      mergeFailureMessage: '',
      mergeErrors: mergeErrors.map(formatValidationError),
      saveAErrors: [],
      saveBErrors: [],
      saveAWarnings: saveAWarnings.map(formatSaveWarning),
      saveBWarnings: saveBWarnings.map(formatSaveWarning)
    };
  }

  presentSaveFilesInvalid({saveAErrors, saveBErrors, saveAWarnings, saveBWarnings}: SaveFilesInvalidOutcome): void {
    this._viewModel = {
      status: 'validationError',
      fileName: '',
      content: '',
      mergeFailureMessage: '',
      mergeErrors: [],
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
      saveAErrors: [],
      saveBErrors: [],
      saveAWarnings: [],
      saveBWarnings: []
    };
  }
}
