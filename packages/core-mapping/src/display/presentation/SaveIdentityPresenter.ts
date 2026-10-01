import {formatUnreadableLine} from "../../save/presentation/formatUnreadableLine";
import {SaveIdentityViewModel} from "./viewModels/SaveIdentityViewModel";
import {SaveIdentityPresenterPort} from "../application/ports/SaveIdentityPresenterPort";
import {SaveIdentityResponse} from "../application/responses/SaveIdentityResponse";
import {resolveSaveIdentityGameReleaseLabel} from "./messages/saveIdentityMessages.js";
import type {UnreadableLinesResponse} from "../application/responses/UnreadableLinesResponse";

export class SaveIdentityPresenter implements SaveIdentityPresenterPort {
  private _viewModel: SaveIdentityViewModel = {fileName: ''};

  get viewModel(): SaveIdentityViewModel {
    return this._viewModel;
  }

  displaySaveIdentity(saveIdentity: SaveIdentityResponse): void {
    this._viewModel = {
      fileName: saveIdentity.fileName,
      displayName: saveIdentity.displayName,
      mode: saveIdentity.mode,
      gameRelease: resolveSaveIdentityGameReleaseLabel(saveIdentity.gameRelease)
    };
  }

  displayUnconfiguredSaveIdentity(fileName: string): void {
    this._viewModel = {fileName};
  }

  displaySaveWithUnreadableLines(fileName: string, {unreadableLines}: UnreadableLinesResponse): void {
    this._viewModel = {fileName, unreadableLines: unreadableLines.map(formatUnreadableLine)};
  }
}
