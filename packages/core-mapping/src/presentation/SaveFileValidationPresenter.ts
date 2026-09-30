import {SaveFileValidationPresenterPort} from "../application/ports/SaveFileValidationPresenterPort";
import {ValidationIssue} from "../domain/validation/ValidationIssue";
import type {SaveWarningResponse} from "../application/responses/SaveWarningResponse";
import {SaveFileValidationViewModel} from "./viewModels/SaveFileValidationViewModel";
import {formatValidationError} from "./formatValidationError";
import {formatSaveWarning} from "./formatSaveWarning";
import {formatUnreadableLine} from "./formatUnreadableLine";
import {formatUniqueHostError} from "./formatUniqueHostError";
import {formatJsonExtensionError} from "./formatJsonExtensionError";
import type {SaveFileWithUnreadableLinesResponse} from "../application/responses/SaveFileWithUnreadableLinesResponse";
import type {InvalidSaveFileResponse} from "../application/responses/InvalidSaveFileResponse";

export class SaveFileValidationPresenter implements SaveFileValidationPresenterPort {
  private _viewModel: SaveFileValidationViewModel;

  constructor() {
    this._viewModel = {status: 'idle', errors: [], warnings: []};
  }

  get viewModel(): SaveFileValidationViewModel {
    return this._viewModel;
  }

  presentValidSaveFile(warnings: SaveWarningResponse[]): void {
    this._viewModel = {status: 'valid', errors: [], warnings: warnings.map(formatSaveWarning)};
  }

  presentInvalidSaveFile({errors, warnings}: InvalidSaveFileResponse): void {
    this._viewModel = {
      status: 'invalid',
      errors: errors.map(formatValidationError),
      warnings: warnings.map(formatSaveWarning)
    };
  }

  presentFileWithoutJsonExtension(): void {
    this._viewModel = {status: 'invalid', errors: [formatJsonExtensionError()], warnings: []};
  }

  presentSaveFileWithUnreadableLines({unreadableLines, warnings}: SaveFileWithUnreadableLinesResponse): void {
    this._viewModel = {
      status: 'invalid',
      errors: unreadableLines.map(formatUnreadableLine),
      warnings: warnings.map(formatSaveWarning)
    };
  }

  presentSaveFileWithoutUniqueHost(hostCount: number, warnings: SaveWarningResponse[]): void {
    this._viewModel = {
      status: 'invalid',
      errors: [formatUniqueHostError(hostCount)],
      warnings: warnings.map(formatSaveWarning)
    };
  }
}
