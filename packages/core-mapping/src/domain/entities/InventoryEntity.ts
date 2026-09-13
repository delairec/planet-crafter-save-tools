import {assertArray, assertFiniteNumber, assertNonEmptyString} from "../errors/assertions";

export interface InventoryEntityInput {
  readonly id: number;
  readonly worldObjectIds: readonly string[];
  readonly size: number;
}

export class InventoryEntity {
  private readonly _id: number;
  private readonly _worldObjectIds: readonly string[];
  private readonly _size: number;

  constructor(input: InventoryEntityInput) {
    this._worldObjectIds = assertArray<unknown>(input.worldObjectIds, 'InventoryEntity.worldObjectIds')
      .map((worldObjectId, index) => assertNonEmptyString(worldObjectId, `InventoryEntity.worldObjectIds[${index}]`));
    this._id = assertFiniteNumber(input.id, 'InventoryEntity.id');
    this._size = assertFiniteNumber(input.size, 'InventoryEntity.size');
  }

  get id(): number {
    return this._id;
  }

  get worldObjectIds(): readonly string[] {
    return [...this._worldObjectIds];
  }

  get size(): number {
    return this._size;
  }

  contains(worldObjectId: string): boolean {
    return this._worldObjectIds.includes(worldObjectId);
  }
}
