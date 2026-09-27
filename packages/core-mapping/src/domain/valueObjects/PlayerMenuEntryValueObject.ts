import {assertBoolean, assertNonEmptyString, assertOptionalString} from "../errors/assertions";

export interface PlayerMenuEntryValueObject {
  readonly name: string;
  readonly planet: string | undefined;
  readonly isHost: boolean;
}

export function createPlayerMenuEntryValueObject(input: PlayerMenuEntryValueObject): PlayerMenuEntryValueObject {
  return {
    name: assertNonEmptyString(input.name, 'PlayerMenuEntryValueObject.name'),
    planet: assertOptionalString(input.planet, 'PlayerMenuEntryValueObject.planet'),
    isHost: assertBoolean(input.isHost, 'PlayerMenuEntryValueObject.isHost')
  };
}
