import {SaveFileValidationPresenterPort} from "../application/ports/SaveFileValidationPresenterPort";
import {ValidationIssue} from "../domain/validation/ValidationIssue";
import type {SaveWarningResponse} from "../application/responses/SaveWarningResponse";
import {LoadSaveFileViewModel} from "./viewModels/LoadSaveFileViewModel";
import {formatValidationError} from "./formatValidationError";
import {formatUnreadableLine} from "./formatUnreadableLine";
import {formatSaveWarning} from "./formatSaveWarning";
import {formatUniqueHostError} from "./formatUniqueHostError";
import {formatJsonExtensionError} from "./formatJsonExtensionError";
import type {SaveFileWithUnreadableLinesResponse} from "../application/responses/SaveFileWithUnreadableLinesResponse";
import type {InvalidSaveFileResponse} from "../application/responses/InvalidSaveFileResponse";

export class LoadSaveFilePresenter implements SaveFileValidationPresenterPort {
  private _viewModel: LoadSaveFileViewModel;

  constructor() {
    this._viewModel = {status: 'idle', errors: [], warnings: []};
  }

  get viewModel(): LoadSaveFileViewModel {
    return this._viewModel;
  }

  presentInvalidSaveFile({errors, warnings}: InvalidSaveFileResponse): void {
    this._viewModel = {
      status: 'invalid',
      errors: errors.map(formatValidationError),
      warnings: warnings.map(formatSaveWarning)
    };
  }

  presentValidSaveFile(warnings: SaveWarningResponse[]): void {
    this._viewModel = {
      status: 'valid',
      errors: [],
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
