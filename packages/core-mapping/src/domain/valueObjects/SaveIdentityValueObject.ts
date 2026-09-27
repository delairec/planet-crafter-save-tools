import {assertNonEmptyString} from "../errors/assertions";

export interface SaveIdentityValueObject {
  readonly fileName: string;
  readonly displayName: string;
  readonly mode: string;
  readonly gameRelease: string;
}

export function createSaveIdentityValueObject(input: SaveIdentityValueObject): SaveIdentityValueObject {
  return {
    fileName: assertNonEmptyString(input.fileName, 'SaveIdentityValueObject.fileName'),
    displayName: assertNonEmptyString(input.displayName, 'SaveIdentityValueObject.displayName'),
    mode: assertNonEmptyString(input.mode, 'SaveIdentityValueObject.mode'),
    gameRelease: assertNonEmptyString(input.gameRelease, 'SaveIdentityValueObject.gameRelease')
  };
}
