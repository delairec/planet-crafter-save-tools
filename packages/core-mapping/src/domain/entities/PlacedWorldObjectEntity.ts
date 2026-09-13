import {WorldObjectName} from "../worldObjectNames";
import {assertFiniteNumber, assertOptionalFiniteNumber} from "../errors/assertions";
import {WorldObjectEntity, WorldObjectEntityInput} from "./WorldObjectEntity";

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

  distanceTo(other: PlacedWorldObjectEntity): number {
    const [x, y, z] = this._position;
    const [otherX, otherY, otherZ] = other._position;

    return Math.sqrt((x - otherX) ** 2 + (y - otherY) ** 2 + (z - otherZ) ** 2);
  }

  isWithinRadius(other: PlacedWorldObjectEntity, radius: number): boolean {
    return this.distanceTo(other) <= radius;
  }
}
