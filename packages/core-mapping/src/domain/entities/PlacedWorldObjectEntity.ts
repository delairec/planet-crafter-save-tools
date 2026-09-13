import {WorldObjectName} from "../worldObjectNames";
import {assertFiniteNumber, assertNonEmptyString, assertOptionalFiniteNumber} from "../errors/assertions";

export interface PlacedWorldObjectEntityInput {
  readonly id: string;
  readonly name: WorldObjectName;
  readonly position: readonly [number, number, number];
  readonly planetId: number;
  readonly inventoryId?: number;
}

export class PlacedWorldObjectEntity {
  private readonly _id: string;
  private readonly _name: WorldObjectName;
  private readonly _position: readonly [number, number, number];
  private readonly _planetId: number;
  private readonly _inventoryId: number | undefined;

  constructor(input: PlacedWorldObjectEntityInput) {
    const [x, y, z] = input.position;

    this._id = assertNonEmptyString(input.id, 'PlacedWorldObjectEntity.id');
    this._name = assertNonEmptyString(input.name, 'PlacedWorldObjectEntity.name') as WorldObjectName;
    this._position = [
      assertFiniteNumber(x, 'PlacedWorldObjectEntity.position[0]'),
      assertFiniteNumber(y, 'PlacedWorldObjectEntity.position[1]'),
      assertFiniteNumber(z, 'PlacedWorldObjectEntity.position[2]')
    ];
    this._planetId = assertFiniteNumber(input.planetId, 'PlacedWorldObjectEntity.planetId');
    this._inventoryId = assertOptionalFiniteNumber(input.inventoryId, 'PlacedWorldObjectEntity.inventoryId');
  }

  get id(): string {
    return this._id;
  }

  get name(): WorldObjectName {
    return this._name;
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
