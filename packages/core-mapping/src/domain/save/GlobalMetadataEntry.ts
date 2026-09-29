export interface GlobalMetadataEntry {
  readonly terraTokens: number;
  readonly allTimeTerraTokens: number;
  readonly unlockedGroups: readonly string[];
  readonly openedInstanceSeed: number;
  readonly openedInstanceTimeLeft: number;
  readonly logisticsPaused?: boolean;
}
