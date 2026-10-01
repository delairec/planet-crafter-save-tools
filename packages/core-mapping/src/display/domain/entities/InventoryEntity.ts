
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
    this._worldObjectIds = [...input.worldObjectIds];
    this._id = input.id;
    this._size = input.size;
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
