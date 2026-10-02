import {formatUnreadableLine} from "../../save/presentation/formatUnreadableLine";
import {
  EnergyBreakdownEntryResponse,
  EnergyLevelsResponse,
  OptimizerResponse,
  PlanetEnergyLevelsResponse
} from "../application/responses/EnergyLevelsResponse";
import {EnergyLevelsViewModel} from "./viewModels/EnergyLevelsViewModel";
import {PlanetEnergyLevelsViewModel} from "./viewModels/PlanetEnergyLevelsViewModel";
import {EnergyBreakdownRowViewModel} from "./viewModels/EnergyBreakdownRowViewModel";
import {OptimizerViewModel} from "./viewModels/OptimizerViewModel";
import {formatNumber} from "./formatters/formatNumber/formatNumber";
import {FormatNumberStrategies} from "./formatters/formatNumber/FormatNumberStrategies";
import {NON_BREAKING_SPACE} from "./formatters/formatNumber/nonBreakingSpace";
import {EnergyLevelsPresenterPort} from "../application/ports/EnergyLevelsPresenterPort";
import {WorldObjectLabelsResponse} from "../application/responses/WorldObjectLabelsResponse";
import {
  energyLevelsSectionAvailableTitle,
  energyLevelsSectionConsumptionTitle,
  energyLevelsSectionKilowattUnit,
  energyLevelsSectionProductionTitle,
  resolveEnergyLevelsSectionUnnamedPlanetName
} from "./messages/energyLevelsSectionMessages.js";
import type {UnreadableLinesResponse} from "../application/responses/UnreadableLinesResponse";
import {createPowerNotifications, submergedMachinesNotification} from "./createPowerNotifications";

export class EnergyLevelsPresenter implements EnergyLevelsPresenterPort {
  private _viewModel: EnergyLevelsViewModel;

  constructor() {
    this._viewModel = {
      notifications: [submergedMachinesNotification],
      planets: []
    };
  }

  get viewModel(): EnergyLevelsViewModel {
    return this._viewModel;
  }

  displayEnergyLevels(energyLevels: EnergyLevelsResponse): void {
    this._viewModel = {
      notifications: createPowerNotifications(energyLevels),
      planets: energyLevels.planets.map((planet): PlanetEnergyLevelsViewModel => this.buildPlanet(planet, energyLevels.worldObjectLabels))
    };
  }

  displaySaveWithUnreadableLines({unreadableLines}: UnreadableLinesResponse): void {
    this._viewModel = {notifications: [], planets: [], unreadableLines: unreadableLines.map(formatUnreadableLine)};
  }

  private buildPlanet(planet: PlanetEnergyLevelsResponse, worldObjectLabels: WorldObjectLabelsResponse): PlanetEnergyLevelsViewModel {
    return {
      planetId: planet.planetName ?? resolveEnergyLevelsSectionUnnamedPlanetName(planet.planetId),
      energyLevels: {
        columns: [
          {
            header: energyLevelsSectionProductionTitle,
            values: [formatNumber(planet.production) + `${NON_BREAKING_SPACE}${energyLevelsSectionKilowattUnit}`]
          },
          {
            header: energyLevelsSectionConsumptionTitle,
            values: [formatNumber(planet.consumption) + `${NON_BREAKING_SPACE}${energyLevelsSectionKilowattUnit}`]
          },
          {
            header: energyLevelsSectionAvailableTitle,
            values: [formatNumber(planet.available) + `${NON_BREAKING_SPACE}${energyLevelsSectionKilowattUnit}`]
          }
        ]
      },
      productionBreakdown: this.buildBreakdownRows(planet.productionBreakdown, worldObjectLabels),
      consumptionBreakdown: this.buildBreakdownRows(planet.consumptionBreakdown, worldObjectLabels),
      optimizers: this.buildOptimizers(planet.optimizers, worldObjectLabels)
    };
  }

  private buildBreakdownRows(breakdown: readonly EnergyBreakdownEntryResponse[], worldObjectLabels: WorldObjectLabelsResponse): EnergyBreakdownRowViewModel[] {
    return breakdown.map((entry): EnergyBreakdownRowViewModel => ({
      label: worldObjectLabels[entry.name],
      quantity: formatNumber(entry.quantity),
      unitLevel: formatNumber(entry.unitLevel) + `${NON_BREAKING_SPACE}${energyLevelsSectionKilowattUnit}`,
      totalLevel: formatNumber(entry.totalLevel) + `${NON_BREAKING_SPACE}${energyLevelsSectionKilowattUnit}` + this.buildContributionSuffix(entry.productionRatio)
    }));
  }

  private buildOptimizers(optimizers: readonly OptimizerResponse[], worldObjectLabels: WorldObjectLabelsResponse): OptimizerViewModel[] {
    return optimizers.map((optimizer): OptimizerViewModel => ({
      label: worldObjectLabels[optimizer.name],
      fuseCount: formatNumber(optimizer.fuseCount),
      boostedMachines: optimizer.boostedMachines
        .map((machine) => `${formatNumber(machine.quantity)} ${worldObjectLabels[machine.name]}`)
        .join(', '),
      contribution: formatNumber(optimizer.contribution) + `${NON_BREAKING_SPACE}${energyLevelsSectionKilowattUnit}` + this.buildContributionSuffix(optimizer.productionRatio)
    }));
  }

  private buildContributionSuffix(productionRatio?: number): string {
    if (!productionRatio) {
      return '';
    }

    return ` (${formatNumber(productionRatio, FormatNumberStrategies.PERCENTAGE)})`;
  }
}
