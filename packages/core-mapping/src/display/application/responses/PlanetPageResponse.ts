import type {EnergySettingsResponse} from "./EnergySettingsResponse";
import type {PlanetEnergyLevelsResponse} from "./EnergyLevelsResponse";
import type {PlanetTerraformationResponse} from "./TerraformationPageResponse";
import type {WorldObjectLabelsResponse} from "./WorldObjectLabelsResponse";

export interface PlanetPageResponse extends EnergySettingsResponse {
  readonly planetName?: string;
  readonly energyLevels?: PlanetEnergyLevelsResponse;
  readonly terraformation?: PlanetTerraformationResponse;
  readonly worldObjectLabels: WorldObjectLabelsResponse;
}
