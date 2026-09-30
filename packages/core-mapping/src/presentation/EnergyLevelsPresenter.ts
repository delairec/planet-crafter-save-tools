import {formatUnreadableLine} from "./formatUnreadableLine";
import {EnergyLevelsResponse} from "../application/responses/EnergyLevelsResponse";
import {PlanetEnergyLevelsValueObject} from "../domain/valueObjects/PlanetEnergyLevelsValueObject";
import {EnergyBreakdownEntryValueObject} from "../domain/valueObjects/EnergyBreakdownEntryValueObject";
import {OptimizerValueObject} from "../domain/valueObjects/OptimizerValueObject";
import {EnergyLevelsViewModel} from "./viewModels/EnergyLevelsViewModel";
import {NotificationViewModel} from "./viewModels/NotificationViewModel";
import {PlanetEnergyLevelsViewModel} from "./viewModels/PlanetEnergyLevelsViewModel";
import {EnergyBreakdownRowViewModel} from "./viewModels/EnergyBreakdownRowViewModel";
import {OptimizerViewModel} from "./viewModels/OptimizerViewModel";
import {formatNumber} from "./formatters/formatNumber/formatNumber";
import {FormatNumberStrategies} from "./formatters/formatNumber/FormatNumberStrategies";
import {NON_BREAKING_SPACE} from "./formatters/formatNumber/nonBreakingSpace";
import {EnergyLevelsPresenterPort} from "../application/ports/EnergyLevelsPresenterPort";
import {WorldObjectLabelsResponse} from "../application/responses/WorldObjectLabelsResponse";
import {UNMODIFIED_POWER_CONSUMPTION_MODIFIER} from "../domain/powerConsumptionModifier";
import {
  energyLevelsSectionAvailableTitle,
  energyLevelsSectionConsumptionTitle,
  energyLevelsSectionKilowattUnit,
  energyLevelsSectionProductionTitle,
  energyLevelsSectionSubmergedMachinesNotification,
  resolveEnergyLevelsSectionGameReleaseNotification,
  resolveEnergyLevelsSectionPowerConsumptionModifierNotification,
  resolveEnergyLevelsSectionUnnamedPlanetName
} from "./messages/energyLevelsSectionMessages.js";
import type {UnreadableLinesResponse} from "../application/responses/UnreadableLinesResponse";

const submergedMachinesNotification: NotificationViewModel = {
  severity: 'limitation',
  message: energyLevelsSectionSubmergedMachinesNotification
};

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
      notifications: this.buildNotifications(energyLevels),
      planets: energyLevels.planets.map((planet): PlanetEnergyLevelsViewModel => this.buildPlanet(planet, energyLevels.worldObjectLabels))
    };
  }

  displaySaveWithUnreadableLines({unreadableLines}: UnreadableLinesResponse): void {
    this._viewModel = {notifications: [], planets: [], unreadableLines: unreadableLines.map(formatUnreadableLine)};
  }

  private buildNotifications(energyLevels: EnergyLevelsResponse): NotificationViewModel[] {
    const notifications: NotificationViewModel[] = [submergedMachinesNotification];

    if (energyLevels.gameReleaseIsEarlierThanCurrent) {
      notifications.push({
        severity: 'warning',
        message: resolveEnergyLevelsSectionGameReleaseNotification(energyLevels.gameRelease)
      });
    }

    if (energyLevels.powerConsumptionModifier !== UNMODIFIED_POWER_CONSUMPTION_MODIFIER) {
      notifications.push({
        severity: 'information',
        message: resolveEnergyLevelsSectionPowerConsumptionModifierNotification(
          formatNumber(energyLevels.powerConsumptionModifier, FormatNumberStrategies.PERCENTAGE)
        )
      });
    }

    return notifications;
  }

  private buildPlanet(planet: PlanetEnergyLevelsValueObject, worldObjectLabels: WorldObjectLabelsResponse): PlanetEnergyLevelsViewModel {
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

  private buildBreakdownRows(breakdown: readonly EnergyBreakdownEntryValueObject[], worldObjectLabels: WorldObjectLabelsResponse): EnergyBreakdownRowViewModel[] {
    return breakdown.map((entry): EnergyBreakdownRowViewModel => ({
      label: worldObjectLabels[entry.name],
      quantity: formatNumber(entry.quantity),
      unitLevel: formatNumber(entry.unitLevel) + `${NON_BREAKING_SPACE}${energyLevelsSectionKilowattUnit}`,
      totalLevel: formatNumber(entry.totalLevel) + `${NON_BREAKING_SPACE}${energyLevelsSectionKilowattUnit}` + this.buildContributionSuffix(entry.productionRatio)
    }));
  }

  private buildOptimizers(optimizers: readonly OptimizerValueObject[], worldObjectLabels: WorldObjectLabelsResponse): OptimizerViewModel[] {
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
