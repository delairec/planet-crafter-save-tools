import {OxygenTankCapacitiesByWorldObjectName} from "../valueObjects/OxygenTankCapacityValueObject";
import {PLAYER_BASE_GAUGE_CAPACITY} from "../playerGaugeCapacity";

export interface OxygenCapacityQuery {
  readonly equipment: readonly string[];
  readonly oxygenTankCapacities: OxygenTankCapacitiesByWorldObjectName;
}

export function resolveOxygenCapacity({equipment, oxygenTankCapacities}: OxygenCapacityQuery): number {
  const wornTankCapacity = equipment
    .map((worldObjectName) => oxygenTankCapacities[worldObjectName])
    .find((capacity) => capacity !== undefined);
  return wornTankCapacity ?? PLAYER_BASE_GAUGE_CAPACITY;
}
