import {WorldObjectName} from "../worldObjectNames";
import {assertFiniteNumber, assertOptionalFiniteNumber} from "../errors/assertions";
import {WorldObjectEntity, WorldObjectEntityInput} from "./WorldObjectEntity";
import {energyProductionLevelsByWorldObjectName} from "../energyLevelsByWorldObjectName";
import {OPTIMIZER_CONFIG_BY_NAME} from "../energyOptimizerConfig";

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

    this._position = [
      assertFiniteNumber(x, 'PlacedWorldObjectEntity.position[0]'),
      assertFiniteNumber(y, 'PlacedWorldObjectEntity.position[1]'),
      assertFiniteNumber(z, 'PlacedWorldObjectEntity.position[2]')
    ];
    this._planetId = assertFiniteNumber(input.planetId, 'PlacedWorldObjectEntity.planetId');
    this._inventoryId = assertOptionalFiniteNumber(input.inventoryId, 'PlacedWorldObjectEntity.inventoryId');
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

  get energyProductionLevel(): number | undefined {
    return energyProductionLevelsByWorldObjectName[this.name];
  }

  isOptimizer(): boolean {
    return OPTIMIZER_CONFIG_BY_NAME[this.name] !== undefined;
  }

  boostedProducersAmong(candidates: readonly PlacedWorldObjectEntity[]): PlacedWorldObjectEntity[] {
    const config = OPTIMIZER_CONFIG_BY_NAME[this.name];
    if (config === undefined) {
      return [];
    }

    return candidates
      .filter((candidate) => candidate.energyProductionLevel !== undefined)
      .filter((candidate) => candidate.planetId === this._planetId)
      .filter((candidate) => this.isWithinRadius(candidate, config.radius))
      .map((candidate) => ({candidate, distance: this.distanceTo(candidate)}))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, config.maxMachines)
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
