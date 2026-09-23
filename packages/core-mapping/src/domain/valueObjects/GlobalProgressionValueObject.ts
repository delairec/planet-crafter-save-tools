import {assertFiniteNumber, assertOptionalBoolean} from "../errors/assertions";

export interface GlobalProgressionValueObject {
  readonly allTimeTerraTokens: number;
  readonly logisticsPaused?: boolean;
}

export function createGlobalProgressionValueObject(input: GlobalProgressionValueObject): GlobalProgressionValueObject {
  return {
    allTimeTerraTokens: assertFiniteNumber(input.allTimeTerraTokens, 'GlobalProgressionValueObject.allTimeTerraTokens'),
    logisticsPaused: assertOptionalBoolean(input.logisticsPaused, 'GlobalProgressionValueObject.logisticsPaused')
  };
}
