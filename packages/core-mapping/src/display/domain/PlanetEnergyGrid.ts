import {PlanetWorldObjectsValueObject} from "./valueObjects/PlanetWorldObjectsValueObject";
import {PlacedWorldObjectEntity} from "./entities/PlacedWorldObjectEntity";
import {WorldObjectEntity} from "./entities/WorldObjectEntity";
import {InventoryEntity} from "./entities/InventoryEntity";
import {WorldObjectName} from "./worldObjectNames";
import {
  createPlanetEnergyLevelsValueObject,
  PlanetEnergyLevelsValueObject
} from "./valueObjects/PlanetEnergyLevelsValueObject";
import {createEnergyBreakdownEntryValueObject} from "./valueObjects/EnergyBreakdownEntryValueObject";
import {createOptimizerValueObject, OptimizerValueObject} from "./valueObjects/OptimizerValueObject";
import {createOptimizerBoostedMachineValueObject} from "./valueObjects/OptimizerBoostedMachineValueObject";
import {EnergyLevelsOfRelease} from "./energyLevelsByWorldObjectName";
import {OptimizerRangesByWorldObjectName} from "./valueObjects/OptimizerRangeValueObject";
import {ENERGY_FUSE_MULTIPLIER_PER_FUSE} from "./energyOptimizerConfig";
import {computeEnergyBreakdown} from "./rules/computeEnergyBreakdown";

export interface PlanetEnergyGridInput {
  readonly planet: PlanetWorldObjectsValueObject;
  readonly allWorldObjects: readonly WorldObjectEntity[];
  readonly inventories: readonly InventoryEntity[];
  readonly energyLevels: EnergyLevelsOfRelease;
  readonly optimizerRanges: OptimizerRangesByWorldObjectName;
  readonly powerConsumptionModifier: number;
}

interface OptimizerBoost {
  readonly optimizer: PlacedWorldObjectEntity;
  readonly fuseCount: number;
  readonly boostedProducers: readonly PlacedWorldObjectEntity[];
}

export class PlanetEnergyGrid {
  private readonly planet: PlanetWorldObjectsValueObject;
  private readonly boosts: readonly OptimizerBoost[];
  private readonly fuseCountByProducerId: Map<string, number>;
  private readonly energyLevels: EnergyLevelsOfRelease;
  private readonly consumptionLevels: EnergyLevelsOfRelease["consumption"];

  constructor({planet, allWorldObjects, inventories, energyLevels, optimizerRanges, powerConsumptionModifier}: PlanetEnergyGridInput) {
    this.planet = planet;
    this.energyLevels = energyLevels;
    this.consumptionLevels = Object.fromEntries(
      Object.entries(energyLevels.consumption).map(([name, level]) => [name, level * powerConsumptionModifier])
    );
    this.boosts = PlanetEnergyGrid.collectBoosts(planet.placedWorldObjects, allWorldObjects, inventories, optimizerRanges, energyLevels.production);
    this.fuseCountByProducerId = PlanetEnergyGrid.countFusesByProducerId(this.boosts);
  }

  levels(): PlanetEnergyLevelsValueObject {
    const production = this.production();
    const consumption = this.consumption();

    return createPlanetEnergyLevelsValueObject({
      planetId: this.planet.planetId,
      planetName: this.planet.planetName,
      production,
      consumption,
      available: production - consumption,
      productionBreakdown: this.breakdown(this.energyLevels.production, production),
      consumptionBreakdown: this.breakdown(this.consumptionLevels, production),
      optimizers: this.optimizers(production)
    });
  }

  private static collectBoosts(
    placedWorldObjects: readonly PlacedWorldObjectEntity[],
    allWorldObjects: readonly WorldObjectEntity[],
    inventories: readonly InventoryEntity[],
    optimizerRanges: OptimizerRangesByWorldObjectName,
    productionLevels: EnergyLevelsOfRelease["production"]
  ): OptimizerBoost[] {
    const boosts: OptimizerBoost[] = [];

    for (const optimizer of placedWorldObjects) {
      const range = optimizerRanges[optimizer.name];
      if (range === undefined) {
        continue;
      }

      const inventory = inventories.find((candidate) => candidate.id === optimizer.inventoryId);
      if (!inventory) {
        continue;
      }

      const fuseCount = allWorldObjects
        .filter((worldObject) => worldObject.isEnergyFuse() && inventory.contains(worldObject.id))
        .length;
      if (fuseCount === 0) {
        continue;
      }

      boosts.push({optimizer, fuseCount, boostedProducers: optimizer.boostedProducersAmong(placedWorldObjects, range, productionLevels)});
    }

    return boosts;
  }

  private static countFusesByProducerId(boosts: readonly OptimizerBoost[]): Map<string, number> {
    const fuseCountByProducerId = new Map<string, number>();

    for (const {fuseCount, boostedProducers} of boosts) {
      for (const producer of boostedProducers) {
        fuseCountByProducerId.set(producer.id, (fuseCountByProducerId.get(producer.id) ?? 0) + fuseCount);
      }
    }

    return fuseCountByProducerId;
  }

  private production(): number {
    return this.planet.placedWorldObjects.reduce((total, worldObject) => {
      const baseLevel = this.energyLevels.production[worldObject.name];
      if (baseLevel === undefined) {
        return total;
      }

      const fuseCount = this.fuseCountByProducerId.get(worldObject.id) ?? 0;

      return total + baseLevel * (fuseCount === 0 ? 1 : fuseCount * ENERGY_FUSE_MULTIPLIER_PER_FUSE);
    }, 0);
  }

  private consumption(): number {
    return this.planet.placedWorldObjects
      .reduce((total, worldObject) => total + (this.consumptionLevels[worldObject.name] ?? 0), 0);
  }

  private breakdown(levels: EnergyLevelsOfRelease["production"], production: number) {
    return computeEnergyBreakdown(this.planet.placedWorldObjects, levels)
      .map((entry) => createEnergyBreakdownEntryValueObject({
        name: entry.name,
        quantity: entry.quantity,
        unitLevel: entry.unitLevel,
        totalLevel: entry.totalLevel,
        productionRatio: production ? entry.totalLevel / production : undefined
      }));
  }

  private optimizers(production: number): OptimizerValueObject[] {
    return this.boosts.map(({optimizer, fuseCount, boostedProducers}) => {
      const quantityByName = new Map<WorldObjectName, number>();
      let contribution = 0;

      for (const producer of boostedProducers) {
        quantityByName.set(producer.name, (quantityByName.get(producer.name) ?? 0) + 1);

        const totalFuseCount = this.fuseCountByProducerId.get(producer.id) ?? fuseCount;
        if (totalFuseCount === 0) {
          continue;
        }

        const baseLevel = this.energyLevels.production[producer.name] ?? 0;
        const totalBoost = baseLevel * (totalFuseCount * ENERGY_FUSE_MULTIPLIER_PER_FUSE - 1);
        contribution += totalBoost * (fuseCount / totalFuseCount);
      }

      return createOptimizerValueObject({
        name: optimizer.name,
        fuseCount,
        boostedMachines: [...quantityByName.entries()].map(([name, quantity]) => createOptimizerBoostedMachineValueObject({
          name,
          quantity
        })),
        contribution,
        productionRatio: production ? contribution / production : undefined
      });
    });
  }
}
