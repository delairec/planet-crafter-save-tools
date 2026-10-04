import {formatUnreadableLine} from "../../save/presentation/formatUnreadableLine";
import {OverviewPagePresenterPort} from "../application/ports/OverviewPagePresenterPort";
import {
  OverviewPageResponse,
  OverviewPlanetEnergyResponse,
  OverviewPlanetResponse,
  OverviewProgressionResponse,
  OverviewSaveConfigurationResponse,
  OverviewSystemTerraformationIndexResponse,
  SaveFileResponse
} from "../application/responses/OverviewPageResponse";
import {TerraformationLevelSummaryResponse} from "../application/responses/TerraformationLevelSummaryResponse";
import type {UnreadableLinesResponse} from "../application/responses/UnreadableLinesResponse";
import {formatNumber} from "./formatters/formatNumber/formatNumber";
import {FormatNumberStrategies} from "./formatters/formatNumber/FormatNumberStrategies";
import {createDroneLogisticsBadge} from "./createDroneLogisticsBadge";
import {createPowerNotifications} from "./createPowerNotifications";
import {formatPowerFigures} from "./formatPowerFigures";
import {formatTerraformationFigures} from "./formatTerraformationFigures";
import {
  OverviewIdentityViewModel,
  OverviewPageViewModel,
  OverviewPlanetCardViewModel,
  OverviewPlanetFigureViewModel,
  OverviewPlanetPowerViewModel,
  OverviewPlanetsViewModel,
  OverviewPlanetTerraformationViewModel,
  OverviewTilesViewModel
} from "./viewModels/OverviewPageViewModel";
import {
  overviewPageAllTimeTerraTokensLabel,
  overviewPageDroneLogisticsLabel,
  overviewPageIdentityHintSeparator,
  overviewPageNoMachinePlaced,
  overviewPageNoTerraformationLevelRecorded,
  overviewPagePlanetsTitle,
  overviewPageSystemTerraformationIndexLabel,
  overviewPageSystemTerraformationIndexUnit,
  overviewPageTerraformationStageLabel,
  overviewPageTerraTokenUnit,
  overviewPageTotalCraftedObjectsLabel,
  resolveOverviewPageGameReleaseLabel,
  resolveOverviewPagePlanetsHint,
  resolveOverviewPageShareOfProductionConsumed,
  resolveOverviewPageSystemTerraformationIndexCaption
} from "./messages/overviewPageMessages.js";
import {
  terraformationLevelsSectionBiomassLabel,
  terraformationLevelsSectionHeatLabel,
  terraformationLevelsSectionOxygenLabel,
  terraformationLevelsSectionPressureLabel,
  terraformationLevelsSectionPurificationLabel,
  terraformationLevelsSectionTerraformationIndexLabel
} from "./messages/terraformationLevelsSectionMessages.js";
import {
  energyLevelsSectionAvailableTitle,
  energyLevelsSectionConsumptionTitle,
  energyLevelsSectionProductionTitle,
  resolveEnergyLevelsSectionUnnamedPlanetName
} from "./messages/energyLevelsSectionMessages.js";

const NO_IDENTITY: OverviewIdentityViewModel = {title: '', hint: ''};
const NO_PLANETS: OverviewPlanetsViewModel = {title: overviewPagePlanetsTitle, hint: '', cards: []};
const NO_KILOWATTS = 0;
const EMPTY_BAR_PERCENTAGE = 0;
const FULL_BAR_PERCENTAGE = 100;

export class OverviewPagePresenter implements OverviewPagePresenterPort {
  private _viewModel: OverviewPageViewModel = {identity: NO_IDENTITY, notifications: [], tiles: {}, planets: NO_PLANETS};

  get viewModel(): OverviewPageViewModel {
    return this._viewModel;
  }

  displayOverviewPage({saveFile, saveConfiguration, progression, systemTerraformationIndex, planets, energySettings}: OverviewPageResponse): void {
    this._viewModel = {
      identity: createIdentity(saveFile, saveConfiguration),
      notifications: createPowerNotifications(energySettings),
      tiles: createTiles(progression, systemTerraformationIndex),
      planets: createPlanets(planets)
    };
  }

  displaySaveWithUnreadableLines({unreadableLines}: UnreadableLinesResponse): void {
    this._viewModel = {identity: NO_IDENTITY, notifications: [], tiles: {}, planets: NO_PLANETS, unreadableLines: unreadableLines.map(formatUnreadableLine)};
  }
}

function createIdentity(saveFile: SaveFileResponse, saveConfiguration: OverviewSaveConfigurationResponse | undefined): OverviewIdentityViewModel {
  const fileSize = formatNumber(saveFile.size, FormatNumberStrategies.FILE_SIZE);
  if (!saveConfiguration) {
    return {title: saveFile.name, hint: fileSize};
  }
  return {
    title: saveConfiguration.displayName,
    hint: [saveConfiguration.mode, resolveOverviewPageGameReleaseLabel(saveConfiguration.gameRelease), fileSize].join(overviewPageIdentityHintSeparator)
  };
}

function createTiles(
  {allTimeTerraTokens, totalCraftedObjects, droneLogistics}: OverviewProgressionResponse,
  systemTerraformationIndex: OverviewSystemTerraformationIndexResponse | undefined
): OverviewTilesViewModel {
  const tiles: OverviewTilesViewModel = {
    allTimeTerraTokens: {label: overviewPageAllTimeTerraTokensLabel, value: formatNumber(allTimeTerraTokens), unit: overviewPageTerraTokenUnit}
  };
  if (totalCraftedObjects !== undefined) {
    tiles.totalCraftedObjects = {label: overviewPageTotalCraftedObjectsLabel, value: formatNumber(totalCraftedObjects)};
  }
  if (systemTerraformationIndex) {
    const {index, planetCount} = systemTerraformationIndex;
    tiles.systemTerraformationIndex = {
      label: overviewPageSystemTerraformationIndexLabel,
      value: formatNumber(index, FormatNumberStrategies.SYSTEM_TERRAFORMATION_INDEX) + overviewPageSystemTerraformationIndexUnit,
      caption: resolveOverviewPageSystemTerraformationIndexCaption(planetCount)
    };
  }
  if (droneLogistics) {
    tiles.droneLogistics = {label: overviewPageDroneLogisticsLabel, badge: createDroneLogisticsBadge(droneLogistics)};
  }
  return tiles;
}

function createPlanets(planets: readonly OverviewPlanetResponse[]): OverviewPlanetsViewModel {
  const fullBarKilowatts = Math.max(NO_KILOWATTS, ...planets.flatMap(({energy}) => energy ? [energy.production, energy.consumption] : []));
  return {
    title: overviewPagePlanetsTitle,
    hint: resolveOverviewPagePlanetsHint(planets.length),
    cards: planets.map((planet) => createPlanetCard(planet, fullBarKilowatts))
  };
}

function createPlanetCard({planetName, terraformation, terraformationStage, energy}: OverviewPlanetResponse, fullBarKilowatts: number): OverviewPlanetCardViewModel {
  const card: OverviewPlanetCardViewModel = {name: planetName ?? resolveEnergyLevelsSectionUnnamedPlanetName(energy?.numericPlanetId)};
  if (terraformationStage) {
    card.terraformationStage = {label: overviewPageTerraformationStageLabel, value: terraformationStage};
  }
  if (terraformation) {
    card.terraformation = createTerraformation(terraformation);
  } else {
    card.absentSide = overviewPageNoTerraformationLevelRecorded;
  }
  if (energy) {
    card.power = createPower(energy, fullBarKilowatts);
  } else {
    card.absentSide = overviewPageNoMachinePlaced;
  }
  return card;
}

function createTerraformation(level: TerraformationLevelSummaryResponse): OverviewPlanetTerraformationViewModel {
  const figures = formatTerraformationFigures(level);
  return {
    terraformationIndex: {label: terraformationLevelsSectionTerraformationIndexLabel, value: figures.terraformationIndex},
    figures: [
      {label: terraformationLevelsSectionOxygenLabel, value: figures.oxygen},
      {label: terraformationLevelsSectionHeatLabel, value: figures.heat},
      {label: terraformationLevelsSectionPressureLabel, value: figures.pressure},
      ...createPurificationFigures(figures.purification),
      {label: terraformationLevelsSectionBiomassLabel, value: figures.biomass}
    ]
  };
}

function createPurificationFigures(purification: string | undefined): OverviewPlanetFigureViewModel[] {
  if (purification === undefined) {
    return [];
  }
  return [{label: terraformationLevelsSectionPurificationLabel, value: purification}];
}

function createPower(energy: OverviewPlanetEnergyResponse, fullBarKilowatts: number): OverviewPlanetPowerViewModel {
  const figures = formatPowerFigures(energy);
  const power: OverviewPlanetPowerViewModel = {
    production: {label: energyLevelsSectionProductionTitle, value: figures.production, widthPercentage: scaleBar(energy.production, fullBarKilowatts)},
    consumption: {label: energyLevelsSectionConsumptionTitle, value: figures.consumption, widthPercentage: scaleBar(energy.consumption, fullBarKilowatts)},
    available: {label: energyLevelsSectionAvailableTitle, value: figures.available}
  };
  if (figures.shareOfProductionConsumed !== undefined) {
    power.shareOfProductionConsumed = resolveOverviewPageShareOfProductionConsumed(figures.shareOfProductionConsumed);
  }
  return power;
}

function scaleBar(kilowatts: number, fullBarKilowatts: number): number {
  if (fullBarKilowatts === NO_KILOWATTS) {
    return EMPTY_BAR_PERCENTAGE;
  }
  return kilowatts / fullBarKilowatts * FULL_BAR_PERCENTAGE;
}
