import {PlacedWorldObjectEntity} from "../entities/PlacedWorldObjectEntity";
import {WorldObjectEntity} from "../entities/WorldObjectEntity";
import {InventoryEntity} from "../entities/InventoryEntity";

/**
 * Implements rules EN-OPT-1..3 and EN-FUSE-1..4: for each Optimizer holding at least one Energy
 * Fuse, reports the producers that Optimizer boosts.
 */
export function computeOptimizerBoosts(
  allWorldObjects: readonly WorldObjectEntity[],
  positionedWorldObjects: readonly PlacedWorldObjectEntity[],
  inventories: readonly InventoryEntity[]
): { optimizer: PlacedWorldObjectEntity; fuseCount: number; boostedProducers: PlacedWorldObjectEntity[] }[] {
  const optimizers = positionedWorldObjects.filter((worldObject) => worldObject.isOptimizer());

  const result: {
    optimizer: PlacedWorldObjectEntity;
    fuseCount: number;
    boostedProducers: PlacedWorldObjectEntity[]
  }[] = [];

  for (const optimizer of optimizers) {
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

    result.push({optimizer, fuseCount, boostedProducers: optimizer.boostedProducersAmong(positionedWorldObjects)});
  }

  return result;
}
