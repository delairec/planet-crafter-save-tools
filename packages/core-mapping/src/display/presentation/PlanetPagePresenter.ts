import {formatUnreadableLine} from "../../save/presentation/formatUnreadableLine";
import {PlanetPagePresenterPort} from "../application/ports/PlanetPagePresenterPort";
import {PlanetPageResponse} from "../application/responses/PlanetPageResponse";
import {PlanetEnergyLevelsResponse} from "../application/responses/EnergyLevelsResponse";
import {PlanetTerraformationResponse} from "../application/responses/TerraformationPageResponse";
import {WorldObjectLabelsResponse} from "../application/responses/WorldObjectLabelsResponse";
import type {UnreadableLinesResponse} from "../application/responses/UnreadableLinesResponse";
import {
  PlanetPageViewModel,
  PlanetPowerTabViewModel,
  PlanetTerraformationTabViewModel
} from "./viewModels/PlanetPageViewModel";
import {NotificationViewModel} from "./viewModels/NotificationViewModel";
import {createPowerNotifications, submergedMachinesNotification} from "./createPowerNotifications";
import {createPlanetPowerZone} from "./createPlanetPowerZone";
import {createPlanetTerraformationZone} from "./createPlanetTerraformationZone";
import {resolveEnergyLevelsSectionUnnamedPlanetName} from "./messages/energyLevelsSectionMessages.js";
import {
  planetPageNoMachinePlaced,
  planetPageNoTerraformationLevelRecorded,
  planetPageUnknownPlanet
} from "./messages/planetPageMessages.js";

export class PlanetPagePresenter implements PlanetPagePresenterPort {
  private _viewModel: PlanetPageViewModel = {planetName: '', power: {notifications: [submergedMachinesNotification]}, terraformation: {}};

  get viewModel(): PlanetPageViewModel {
    return this._viewModel;
  }

  displayPlanetPage(planetPage: PlanetPageResponse): void {
    this._viewModel = {
      planetName: planetPage.planetName ?? resolveEnergyLevelsSectionUnnamedPlanetName(planetPage.energyLevels?.planetId),
      power: createPowerTab(createPowerNotifications(planetPage), planetPage.energyLevels, planetPage.worldObjectLabels),
      terraformation: createTerraformationTab(planetPage.terraformation)
    };
  }

  displayUnknownPlanet(): void {
    this._viewModel = {planetName: '', unknownPlanet: planetPageUnknownPlanet, power: {notifications: []}, terraformation: {}};
  }

  displaySaveWithUnreadableLines({unreadableLines}: UnreadableLinesResponse): void {
    this._viewModel = {planetName: '', power: {notifications: []}, terraformation: {}, unreadableLines: unreadableLines.map(formatUnreadableLine)};
  }
}

function createPowerTab(
  notifications: NotificationViewModel[],
  energyLevels: PlanetEnergyLevelsResponse | undefined,
  worldObjectLabels: WorldObjectLabelsResponse
): PlanetPowerTabViewModel {
  if (!energyLevels) {
    return {notifications, absentZone: planetPageNoMachinePlaced};
  }
  return {notifications, zone: createPlanetPowerZone(energyLevels, worldObjectLabels)};
}

function createTerraformationTab(terraformation: PlanetTerraformationResponse | undefined): PlanetTerraformationTabViewModel {
  if (!terraformation) {
    return {absentZone: planetPageNoTerraformationLevelRecorded};
  }
  return {zone: createPlanetTerraformationZone(terraformation)};
}
