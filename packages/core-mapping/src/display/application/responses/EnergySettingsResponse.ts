export interface EnergySettingsResponse {
  readonly gameRelease: string;
  readonly gameReleaseIsEarlierThanCurrent: boolean;
  readonly powerConsumptionModifier: number;
  readonly powerConsumptionIsModified: boolean;
}
