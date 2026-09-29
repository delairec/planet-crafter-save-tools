import {SaveFileValidationPresenterPort} from "../application/ports/SaveFileValidationPresenterPort";
import {ValidationIssue} from "../application/ports/ValidationIssue";
import {SaveWarning} from "shared-save-processing/gameDefinitions";
import {UnreadableLine} from "../application/ports/SaveSectionLocation";
import {SaveFileValidationViewModel} from "./viewModels/SaveFileValidationViewModel";
import {formatValidationError} from "./formatValidationError";
import {formatSaveWarning} from "./formatSaveWarning";
import {formatUnreadableLine} from "./formatUnreadableLine";
import {formatUniqueHostError} from "./formatUniqueHostError";
import {formatJsonExtensionError} from "./formatJsonExtensionError";

export class SaveFileValidationPresenter implements SaveFileValidationPresenterPort {
  private _viewModel: SaveFileValidationViewModel;

  constructor() {
    this._viewModel = {status: 'idle', errors: [], warnings: []};
  }

  get viewModel(): SaveFileValidationViewModel {
    return this._viewModel;
  }

  presentValidSaveFile(warnings: SaveWarning[]): void {
    this._viewModel = {status: 'valid', errors: [], warnings: warnings.map(formatSaveWarning)};
  }

  presentInvalidSaveFile(errors: ValidationIssue[], warnings: SaveWarning[]): void {
    this._viewModel = {
      status: 'invalid',
      errors: errors.map(formatValidationError),
      warnings: warnings.map(formatSaveWarning)
    };
  }

  presentFileWithoutJsonExtension(): void {
    this._viewModel = {status: 'invalid', errors: [formatJsonExtensionError()], warnings: []};
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
