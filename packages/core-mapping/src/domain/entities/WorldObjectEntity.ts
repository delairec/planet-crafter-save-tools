import {WorldObjectName} from "../worldObjectNames";
import {assertNonEmptyString} from "../errors/assertions";

export interface WorldObjectEntityInput {
  readonly id: string;
  readonly name: WorldObjectName;
}

export class WorldObjectEntity {
  private readonly _id: string;
  private readonly _name: WorldObjectName;

  constructor(input: WorldObjectEntityInput) {
    this._id = assertNonEmptyString(input.id, 'WorldObjectEntity.id');
    this._name = assertNonEmptyString(input.name, 'WorldObjectEntity.name') as WorldObjectName;
  }

  get id(): string {
    return this._id;
  }

  get name(): WorldObjectName {
    return this._name;
  }
}
