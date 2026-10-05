import {formatUnreadableLine} from "../../save/presentation/mappers/formatUnreadableLine";
import {EnergyLevelsResponse} from "../application/responses/EnergyLevelsResponse";
import {PowerPagePresenterPort} from "../application/ports/PowerPagePresenterPort";
import type {UnreadableLinesResponse} from "../application/responses/UnreadableLinesResponse";
import {PowerPageViewModel} from "./viewModels/PowerPageViewModel";
import {createPowerNotifications, submergedMachinesNotification} from "./mappers/createPowerNotifications";
import {createPlanetPowerZone} from "./mappers/createPlanetPowerZone";

export class PowerPagePresenter implements PowerPagePresenterPort {
  private _viewModel: PowerPageViewModel = {notifications: [submergedMachinesNotification], planets: []};

  get viewModel(): PowerPageViewModel {
    return this._viewModel;
  }

  displayPowerPage(energyLevels: EnergyLevelsResponse): void {
    this._viewModel = {
      notifications: createPowerNotifications(energyLevels),
      planets: energyLevels.planets.map((planet) => createPlanetPowerZone(planet, energyLevels.worldObjectLabels))
    };
  }

  displaySaveWithUnreadableLines({unreadableLines}: UnreadableLinesResponse): void {
    this._viewModel = {notifications: [], planets: [], unreadableLines: unreadableLines.map(formatUnreadableLine)};
  }
}
