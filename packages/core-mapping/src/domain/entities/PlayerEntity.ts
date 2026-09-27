import {assertArray, assertBoolean, assertNonEmptyString, assertString} from "../errors/assertions";

export interface PlayerEntityInput {
  readonly name: string;
  readonly inventory: readonly string[];
  readonly equipment: readonly string[];
  readonly planetId: string;
  readonly host: boolean;
}

export class PlayerEntity {
  private readonly _name: string;
  private readonly _inventory: readonly string[];
  private readonly _equipment: readonly string[];
  private readonly _planetId: string;
  private readonly _host: boolean;

  constructor(input: PlayerEntityInput) {
    this._name = assertNonEmptyString(input.name, 'PlayerEntity.name');
    this._inventory = assertArray<unknown>(input.inventory, 'PlayerEntity.inventory')
      .map((item, index) => assertNonEmptyString(item, `PlayerEntity.inventory[${index}]`));
    this._equipment = assertArray<unknown>(input.equipment, 'PlayerEntity.equipment')
      .map((item, index) => assertNonEmptyString(item, `PlayerEntity.equipment[${index}]`));
    this._planetId = assertString(input.planetId, 'PlayerEntity.planetId');
    this._host = assertBoolean(input.host, 'PlayerEntity.host');
  }

  get name(): string {
    return this._name;
  }

  get inventory(): readonly string[] {
    return [...this._inventory];
  }

  get equipment(): readonly string[] {
    return [...this._equipment];
  }

  get planetId(): string {
    return this._planetId;
  }

  get isHost(): boolean {
    return this._host;
  }

  findPlanetStoodOn(): string | undefined {
    return this._planetId === '' ? undefined : this._planetId;
  }
}
