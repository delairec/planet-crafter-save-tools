import {PlayerGaugesValueObject} from "../valueObjects/PlayerGaugesValueObject";

export interface PlayerEntityInput {
  readonly id: string;
  readonly name: string;
  readonly inventory: readonly string[];
  readonly equipment: readonly string[];
  readonly planetId?: string;
  readonly host: boolean;
  readonly gauges: PlayerGaugesValueObject;
}

export class PlayerEntity {
  private readonly _id: string;
  private readonly _name: string;
  private readonly _inventory: readonly string[];
  private readonly _equipment: readonly string[];
  private readonly _planetId: string | undefined;
  private readonly _host: boolean;
  private readonly _gauges: PlayerGaugesValueObject;

  constructor(input: PlayerEntityInput) {
    this._id = input.id;
    this._name = input.name;
    this._inventory = [...input.inventory];
    this._equipment = [...input.equipment];
    this._planetId = input.planetId;
    this._host = input.host;
    this._gauges = {...input.gauges};
  }

  get id(): string {
    return this._id;
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

  get gauges(): PlayerGaugesValueObject {
    return this._gauges;
  }
}
