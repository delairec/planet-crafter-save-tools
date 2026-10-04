import type {DroneLogisticsResponse} from "./DroneLogisticsResponse";
import type {EnergySettingsResponse} from "./EnergySettingsResponse";
import type {SystemTerraformationIndexResponse} from "./SystemTerraformationIndexResponse";
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
  readonly planetIdentifier: string;
  readonly planetName?: string;
  readonly terraformation?: TerraformationLevelSummaryResponse;
  readonly terraformationStage?: string;
  readonly energy?: OverviewPlanetEnergyResponse;
}

export interface OverviewPageResponse {
  readonly saveFile: SaveFileResponse;
  readonly saveConfiguration?: OverviewSaveConfigurationResponse;
  readonly progression: OverviewProgressionResponse;
  readonly systemTerraformationIndex?: SystemTerraformationIndexResponse;
  readonly planets: readonly OverviewPlanetResponse[];
  readonly energySettings: EnergySettingsResponse;
}
