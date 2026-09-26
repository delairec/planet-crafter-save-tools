import {EnergyLevelsValueObject} from "../domain/valueObjects/EnergyLevelsValueObject";
import {PlanetEnergyLevelsValueObject} from "../domain/valueObjects/PlanetEnergyLevelsValueObject";
import {EnergyBreakdownEntryValueObject} from "../domain/valueObjects/EnergyBreakdownEntryValueObject";
import {OptimizerValueObject} from "../domain/valueObjects/OptimizerValueObject";
import {EnergyLevelsViewModel} from "./viewModels/EnergyLevelsViewModel";
import {PlanetEnergyLevelsViewModel} from "./viewModels/PlanetEnergyLevelsViewModel";
import {EnergyBreakdownRowViewModel} from "./viewModels/EnergyBreakdownRowViewModel";
import {OptimizerViewModel} from "./viewModels/OptimizerViewModel";
import {formatNumber} from "./formatters/formatNumber/formatNumber";
import {FormatNumberStrategies} from "./formatters/formatNumber/FormatNumberStrategies";
import {NON_BREAKING_SPACE} from "./formatters/formatNumber/nonBreakingSpace";
import {EnergyLevelsPresenterPort} from "../application/ports/EnergyLevelsPresenterPort";
import {worldObjectLabels} from "./worldObjectLabels";
import {CURRENT_FORMAT_RELEASE} from "shared-save-processing/gameReleases.js";
import {
  energyLevelsSectionAvailableTitle,
  energyLevelsSectionConsumptionTitle,
  energyLevelsSectionKilowattUnit,
  energyLevelsSectionProductionTitle,
  energyLevelsSectionSubmergedMachinesDisclaimer,
  resolveEnergyLevelsSectionGameReleaseNote,
  resolveEnergyLevelsSectionUnnamedPlanetName
} from "./messages/energyLevelsSectionMessages.js";

export class EnergyLevelsPresenter implements EnergyLevelsPresenterPort {
  private _viewModel: EnergyLevelsViewModel;

  constructor() {
    this._viewModel = {
      submergedMachinesDisclaimer: energyLevelsSectionSubmergedMachinesDisclaimer,
      planets: []
    };
  }

  get viewModel(): EnergyLevelsViewModel {
    return this._viewModel;
  }

  displayEnergyLevels(energyLevels: EnergyLevelsValueObject): void {
    this._viewModel = {
      submergedMachinesDisclaimer: energyLevelsSectionSubmergedMachinesDisclaimer,
      gameReleaseNote: this.buildGameReleaseNote(energyLevels.gameRelease),
      planets: energyLevels.planets.map((planet): PlanetEnergyLevelsViewModel => this.buildPlanet(planet))
    };
  }

  private buildGameReleaseNote(gameRelease: string): string | undefined {
    if (gameRelease === CURRENT_FORMAT_RELEASE) {
      return undefined;
    }

    return resolveEnergyLevelsSectionGameReleaseNote(gameRelease);
  }

  private buildPlanet(planet: PlanetEnergyLevelsValueObject): PlanetEnergyLevelsViewModel {
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
      productionBreakdown: this.buildBreakdownRows(planet.productionBreakdown),
      consumptionBreakdown: this.buildBreakdownRows(planet.consumptionBreakdown),
      optimizers: this.buildOptimizers(planet.optimizers)
    };
  }

  private buildBreakdownRows(breakdown: readonly EnergyBreakdownEntryValueObject[]): EnergyBreakdownRowViewModel[] {
    return breakdown.map((entry): EnergyBreakdownRowViewModel => ({
      label: worldObjectLabels[entry.name],
      quantity: formatNumber(entry.quantity),
      unitLevel: formatNumber(entry.unitLevel) + `${NON_BREAKING_SPACE}${energyLevelsSectionKilowattUnit}`,
      totalLevel: formatNumber(entry.totalLevel) + `${NON_BREAKING_SPACE}${energyLevelsSectionKilowattUnit}` + this.buildContributionSuffix(entry.productionRatio)
    }));
  }

  private buildOptimizers(optimizers: readonly OptimizerValueObject[]): OptimizerViewModel[] {
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
