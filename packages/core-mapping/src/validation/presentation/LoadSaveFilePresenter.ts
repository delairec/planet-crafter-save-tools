import {SaveFileValidationPresenterPort} from "../application/ports/SaveFileValidationPresenterPort";
import type {SaveWarningResponse} from "../../save/application/responses/SaveWarningResponse";
import {LoadSaveFileViewModel} from "./viewModels/LoadSaveFileViewModel";
import {formatValidationError} from "../../save/presentation/mappers/formatValidationError";
import {formatUnreadableLine} from "../../save/presentation/mappers/formatUnreadableLine";
import {formatSaveWarning} from "../../save/presentation/mappers/formatSaveWarning";
import {formatUniqueHostError} from "../../save/presentation/mappers/formatUniqueHostError";
import {formatJsonExtensionError} from "../../save/presentation/mappers/formatJsonExtensionError";
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
