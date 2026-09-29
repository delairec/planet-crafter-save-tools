
export interface PlayerEntityInput {
  readonly name: string;
  readonly inventory: readonly string[];
  readonly equipment: readonly string[];
  readonly planetId?: string;
  readonly host: boolean;
}

export class PlayerEntity {
  private readonly _name: string;
  private readonly _inventory: readonly string[];
  private readonly _equipment: readonly string[];
  private readonly _planetId: string | undefined;
  private readonly _host: boolean;

  constructor(input: PlayerEntityInput) {
    this._name = input.name;
    this._inventory = [...input.inventory];
    this._equipment = [...input.equipment];
    this._planetId = input.planetId;
    this._host = input.host;
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

  get planetId(): string | undefined {
    return this._planetId;
  }

  get isHost(): boolean {
    return this._host;
  }

  findPlanetStoodOn(): string | undefined {
    return this._planetId;
  }
}
