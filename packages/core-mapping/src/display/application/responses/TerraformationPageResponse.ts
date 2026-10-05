import type {SystemTerraformationIndexResponse} from "./SystemTerraformationIndexResponse";
import type {TerraformationLevelSummaryResponse} from "./TerraformationLevelSummaryResponse";

export interface PlanetTerraformationResponse {
  readonly levels: TerraformationLevelSummaryResponse;
  readonly systemTerraformationIndex?: SystemTerraformationIndexResponse;
}

export interface TerraformationPageResponse {
  readonly planets: readonly PlanetTerraformationResponse[];
}
