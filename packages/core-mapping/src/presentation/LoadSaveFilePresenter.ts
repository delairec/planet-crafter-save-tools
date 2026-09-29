import {LoadAndValidateSaveFilePresenterPort} from "../application/ports/LoadAndValidateSaveFilePresenterPort";
import {ValidationIssue} from "../application/ports/ValidationIssue";
import {SaveWarning} from "shared-save-processing/gameDefinitions";
import {UnreadableLine} from "../application/ports/SaveSectionLocation";
import {LoadSaveFileViewModel} from "./viewModels/LoadSaveFileViewModel";
import {formatValidationError} from "./formatValidationError";
import {formatUnreadableLine} from "./formatUnreadableLine";
import {formatSaveWarning} from "./formatSaveWarning";
import {formatUniqueHostError} from "./formatUniqueHostError";

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

  presentSaveFileWithUnreadableLines(unreadableLines: UnreadableLine[], warnings: SaveWarning[]): void {
    this._viewModel = {
      status: 'invalid',
      errors: unreadableLines.map(formatUnreadableLine),
      warnings: warnings.map(formatSaveWarning)
    };
  }

  presentSaveFileWithoutUniqueHost(hostCount: number, warnings: SaveWarning[]): void {
    this._viewModel = {
      status: 'invalid',
      errors: [formatUniqueHostError(hostCount)],
      warnings: warnings.map(formatSaveWarning)
    };
  }
}
