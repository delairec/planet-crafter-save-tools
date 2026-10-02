import type {DroneLogisticsResponse} from "./DroneLogisticsResponse";

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

export interface OverviewPageResponse {
  readonly saveFile: SaveFileResponse;
  readonly saveConfiguration?: OverviewSaveConfigurationResponse;
  readonly progression: OverviewProgressionResponse;
}
