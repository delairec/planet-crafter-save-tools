import {PlanetWorldObjectsValueObject} from "./valueObjects/EnergyLevelsRawDataValueObject";
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
import {
  energyConsumptionLevelsByWorldObjectName,
  energyProductionLevelsByWorldObjectName
} from "./energyLevelsByWorldObjectName";
import {ENERGY_FUSE_MULTIPLIER_PER_FUSE} from "./energyOptimizerConfig";
import {computeEnergyBreakdown} from "./rules/computeEnergyBreakdown";

interface OptimizerBoost {
  readonly optimizer: PlacedWorldObjectEntity;
  readonly fuseCount: number;
  readonly boostedProducers: readonly PlacedWorldObjectEntity[];
}

export class PlanetEnergyGrid {
  private readonly planet: PlanetWorldObjectsValueObject;
  private readonly boosts: readonly OptimizerBoost[];
  private readonly fuseCountByProducerId: Map<string, number>;

  constructor(
    planet: PlanetWorldObjectsValueObject,
    allWorldObjects: readonly WorldObjectEntity[],
    inventories: readonly InventoryEntity[]
  ) {
    this.planet = planet;
    this.boosts = PlanetEnergyGrid.collectBoosts(planet.placedWorldObjects, allWorldObjects, inventories);
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
      productionBreakdown: this.productionBreakdown(production),
      consumptionBreakdown: computeEnergyBreakdown(this.planet.placedWorldObjects, energyConsumptionLevelsByWorldObjectName),
      optimizers: this.optimizers(production)
    });
  }

  private static collectBoosts(
    placedWorldObjects: readonly PlacedWorldObjectEntity[],
    allWorldObjects: readonly WorldObjectEntity[],
    inventories: readonly InventoryEntity[]
  ): OptimizerBoost[] {
    const boosts: OptimizerBoost[] = [];

    for (const optimizer of placedWorldObjects.filter((worldObject) => worldObject.isOptimizer())) {
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

      boosts.push({optimizer, fuseCount, boostedProducers: optimizer.boostedProducersAmong(placedWorldObjects)});
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
      const baseLevel = worldObject.energyProductionLevel;
      if (baseLevel === undefined) {
        return total;
      }

      const fuseCount = this.fuseCountByProducerId.get(worldObject.id) ?? 0;

      return total + baseLevel * (fuseCount === 0 ? 1 : fuseCount * ENERGY_FUSE_MULTIPLIER_PER_FUSE);
    }, 0);
  }

  private consumption(): number {
    return this.planet.placedWorldObjects
      .reduce((total, worldObject) => total + (worldObject.energyConsumptionLevel ?? 0), 0);
  }

  private productionBreakdown(production: number) {
    return computeEnergyBreakdown(this.planet.placedWorldObjects, energyProductionLevelsByWorldObjectName)
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

        const baseLevel = producer.energyProductionLevel ?? 0;
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
