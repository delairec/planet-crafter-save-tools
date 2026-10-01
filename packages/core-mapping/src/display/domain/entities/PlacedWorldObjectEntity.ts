import {WorldObjectName} from "../worldObjectNames";
import {WorldObjectEntity, WorldObjectEntityInput} from "./WorldObjectEntity";
import {EnergyLevelsByWorldObjectName} from "../energyLevelsByWorldObjectName";
import {OptimizerRangeValueObject} from "../valueObjects/OptimizerRangeValueObject";

export interface PlacedWorldObjectEntityInput extends WorldObjectEntityInput {
  readonly position: readonly [number, number, number];
  readonly planetId: number;
  readonly inventoryId?: number;
}

export class PlacedWorldObjectEntity extends WorldObjectEntity {
  private readonly _position: readonly [number, number, number];
  private readonly _planetId: number;
  private readonly _inventoryId: number | undefined;

  constructor(input: PlacedWorldObjectEntityInput) {
    super(input);

    const [x, y, z] = input.position;

    this._position = [x, y, z];
    this._planetId = input.planetId;
    this._inventoryId = input.inventoryId;
  }

  get position(): readonly [number, number, number] {
    return [...this._position];
  }

  get planetId(): number {
    return this._planetId;
  }

  get inventoryId(): number | undefined {
    return this._inventoryId;
  }

  boostedProducersAmong(
    candidates: readonly PlacedWorldObjectEntity[],
    range: OptimizerRangeValueObject,
    productionLevels: EnergyLevelsByWorldObjectName
  ): PlacedWorldObjectEntity[] {
    return candidates
      .filter((candidate) => productionLevels[candidate.name] !== undefined)
      .filter((candidate) => candidate.planetId === this._planetId)
      .filter((candidate) => this.isWithinRadius(candidate, range.radius))
      .map((candidate) => ({candidate, distance: this.distanceTo(candidate)}))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, range.maxMachines)
      .map(({candidate}) => candidate);
  }

  private isWithinRadius(other: PlacedWorldObjectEntity, radius: number): boolean {
    return this.distanceTo(other) <= radius;
  }

  private distanceTo(other: PlacedWorldObjectEntity): number {
    const [x, y, z] = this._position;
    const [otherX, otherY, otherZ] = other._position;

    return Math.sqrt((x - otherX) ** 2 + (y - otherY) ** 2 + (z - otherZ) ** 2);
  }
}
