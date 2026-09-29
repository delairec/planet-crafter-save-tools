import {LoadAndValidateSaveFilePresenterPort} from "../application/ports/LoadAndValidateSaveFilePresenterPort";
import {ValidationIssue} from "../application/ports/ValidationIssue";
import {SaveParseError, SaveWarning} from "shared-save-processing/gameDefinitions";
import {LoadSaveFileViewModel} from "./viewModels/LoadSaveFileViewModel";
import {formatValidationError} from "./formatValidationError";
import {formatUnreadableLine} from "./formatUnreadableLine";
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

  presentLoadedSaveFile(warnings: SaveWarning[]): void {
    this._viewModel = {
      status: 'valid',
      errors: [],
      warnings: warnings.map(formatSaveWarning)
    };
  }

  presentSaveFileWithUnreadableLines(unreadableLines: SaveParseError[], warnings: SaveWarning[]): void {
    this._viewModel = {
      status: 'invalid',
      errors: unreadableLines.map(formatUnreadableLine),
      warnings: warnings.map(formatSaveWarning)
    };
  }
}
