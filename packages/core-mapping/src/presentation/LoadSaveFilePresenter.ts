import {LoadAndValidateSaveFilePresenterPort} from "../application/ports/LoadAndValidateSaveFilePresenterPort";
import {ValidationIssue} from "../application/ports/ValidationIssue";
import {SaveParseError, SaveWarning} from "shared-save-processing/gameDefinitions";
import {LoadSaveFileViewModel} from "./viewModels/LoadSaveFileViewModel";
import {formatValidationError} from "./formatValidationError";
import {formatErrorLocation} from "./formatErrorLocation";
import {formatSaveWarning} from "./formatSaveWarning";

export class LoadSaveFilePresenter implements LoadAndValidateSaveFilePresenterPort {
  private _viewModel: LoadSaveFileViewModel;

  constructor() {
    this._viewModel = {status: 'idle', errors: [], warnings: []};
  }

  get viewModel(): LoadSaveFileViewModel {
    return this._viewModel;
  }

  presentInvalidSaveFile(errors: ValidationIssue[], warnings: SaveWarning[]): void {
    this._viewModel = {
      status: 'invalid',
      errors: errors.map(formatValidationError),
      warnings: warnings.map(formatSaveWarning)
    };
  }

  /**
   * The errors of a save that parsed name the line the parser could not read, so they reach the
   * screen located like the validation ones.
   */
  presentLoadedSaveFile(errors: SaveParseError[], warnings: SaveWarning[]): void {
    this._viewModel = {
      status: 'valid',
      errors: errors.map(error => ({message: error.detail, location: formatErrorLocation(error)})),
      warnings: warnings.map(formatSaveWarning)
    };
  }
}
