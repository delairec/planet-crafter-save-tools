
export interface GlobalProgressionValueObject {
  readonly allTimeTerraTokens: number;
  readonly logisticsPaused?: boolean;
}

export function createGlobalProgressionValueObject(input: GlobalProgressionValueObject): GlobalProgressionValueObject {
  return {
    allTimeTerraTokens: input.allTimeTerraTokens,
    logisticsPaused: input.logisticsPaused
  };
}
