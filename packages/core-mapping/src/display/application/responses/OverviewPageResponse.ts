import type {DroneLogisticsResponse} from "./DroneLogisticsResponse";
import type {EnergySettingsResponse} from "./EnergySettingsResponse";
import type {TerraformationLevelSummaryResponse} from "./TerraformationLevelSummaryResponse";

export interface SaveFileResponse {
  readonly name: string;
  readonly size: number;
}

export interface OverviewSaveConfigurationResponse {
  readonly displayName: string;
  readonly mode: string;
  readonly gameRelease: string;
}

export interface OverviewProgressionResponse {
  readonly allTimeTerraTokens: number;
  readonly totalCraftedObjects?: number;
  readonly droneLogistics?: DroneLogisticsResponse;
}

export interface OverviewPlanetEnergyResponse {
  readonly numericPlanetId: number;
  readonly production: number;
  readonly consumption: number;
  readonly available: number;
}

export interface OverviewPlanetResponse {
  readonly planetName?: string;
  readonly terraformation?: TerraformationLevelSummaryResponse;
  readonly energy?: OverviewPlanetEnergyResponse;
}

export interface OverviewSystemTerraformationIndexResponse {
  readonly index: number;
  readonly planetCount: number;
}

export interface OverviewPageResponse {
  readonly saveFile: SaveFileResponse;
  readonly saveConfiguration?: OverviewSaveConfigurationResponse;
  readonly progression: OverviewProgressionResponse;
  readonly systemTerraformationIndex?: OverviewSystemTerraformationIndexResponse;
  readonly planets: readonly OverviewPlanetResponse[];
  readonly energySettings: EnergySettingsResponse;
}
