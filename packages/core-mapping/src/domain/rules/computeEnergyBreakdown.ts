import {WorldObjectName} from "../worldObjectNames";
import {PlacedWorldObjectEntity} from "../entities/PlacedWorldObjectEntity";
import {EnergyBreakdownEntryValueObject, createEnergyBreakdownEntryValueObject} from "../valueObjects/EnergyBreakdownEntryValueObject";

export function computeEnergyBreakdown(
  positionedWorldObjects: readonly PlacedWorldObjectEntity[],
  levelsByWorldObjectName: Partial<Record<WorldObjectName, number>>
): EnergyBreakdownEntryValueObject[] {
  const quantityByName = new Map<WorldObjectName, number>();

  for (const worldObject of positionedWorldObjects) {
    if (levelsByWorldObjectName[worldObject.name] === undefined) {
      continue;
    }
    quantityByName.set(worldObject.name, (quantityByName.get(worldObject.name) ?? 0) + 1);
  }

  return [...quantityByName.entries()]
    .map(([name, quantity]): EnergyBreakdownEntryValueObject => {
      const unitLevel = levelsByWorldObjectName[name]!;
      return createEnergyBreakdownEntryValueObject({
        name,
        quantity,
        unitLevel,
        totalLevel: unitLevel * quantity
      });
    })
    .sort((a, b) => b.totalLevel - a.totalLevel);
}
