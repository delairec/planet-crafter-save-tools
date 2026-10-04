import {formatUnreadableLine} from "../../save/presentation/mappers/formatUnreadableLine";
import {TerraformationPagePresenterPort} from "../application/ports/TerraformationPagePresenterPort";
import {TerraformationPageResponse} from "../application/responses/TerraformationPageResponse";
import type {UnreadableLinesResponse} from "../application/responses/UnreadableLinesResponse";
import {TerraformationPageViewModel} from "./viewModels/TerraformationPageViewModel";
import {createPlanetTerraformationZone} from "./mappers/createPlanetTerraformationZone";

export class TerraformationPagePresenter implements TerraformationPagePresenterPort {
  private _viewModel: TerraformationPageViewModel = {planets: []};

  get viewModel(): TerraformationPageViewModel {
    return this._viewModel;
  }

  displayTerraformationPage(terraformationPage: TerraformationPageResponse): void {
    this._viewModel = {planets: terraformationPage.planets.map(createPlanetTerraformationZone)};
  }

  displaySaveWithUnreadableLines({unreadableLines}: UnreadableLinesResponse): void {
    this._viewModel = {planets: [], unreadableLines: unreadableLines.map(formatUnreadableLine)};
  }
}
