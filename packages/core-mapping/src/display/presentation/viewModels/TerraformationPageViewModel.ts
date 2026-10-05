import {SaveValidationMessageViewModel} from "../../../save/presentation/viewModels/SaveValidationMessageViewModel";
import {PlanetTerraformationZoneViewModel} from "./PlanetTerraformationZoneViewModel";

export interface TerraformationPageViewModel {
  unreadableLines?: SaveValidationMessageViewModel[];
  planets: PlanetTerraformationZoneViewModel[];
}
