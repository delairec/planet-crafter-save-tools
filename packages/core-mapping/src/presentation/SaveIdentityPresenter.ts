import {SaveIdentityViewModel} from "./viewModels/SaveIdentityViewModel";
import {SaveIdentityPresenterPort} from "../application/ports/SaveIdentityPresenterPort";
import {SaveIdentityValueObject} from "../domain/valueObjects/SaveIdentityValueObject";
import {resolveSaveIdentityGameReleaseLabel} from "./messages/saveIdentityMessages.js";

export class SaveIdentityPresenter implements SaveIdentityPresenterPort {
  private _viewModel: SaveIdentityViewModel = {fileName: ''};

  get viewModel(): SaveIdentityViewModel {
    return this._viewModel;
  }

  displaySaveIdentity(saveIdentity: SaveIdentityValueObject): void {
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
}
