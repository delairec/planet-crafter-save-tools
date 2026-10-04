import {SaveValidationMessageViewModel} from "../../../save/presentation/viewModels/SaveValidationMessageViewModel";
import {NotificationViewModel} from "./NotificationViewModel";
import {PlanetPowerZoneViewModel} from "./PlanetPowerZoneViewModel";
import {PlanetTerraformationZoneViewModel} from "./PlanetTerraformationZoneViewModel";

export interface PlanetPowerTabViewModel {
  notifications: NotificationViewModel[];
  zone?: PlanetPowerZoneViewModel;
  absentZone?: string;
}

export interface PlanetTerraformationTabViewModel {
  zone?: PlanetTerraformationZoneViewModel;
  absentZone?: string;
}

export interface PlanetPageViewModel {
  unreadableLines?: SaveValidationMessageViewModel[];
  unknownPlanet?: string;
  planetName: string;
  power: PlanetPowerTabViewModel;
  terraformation: PlanetTerraformationTabViewModel;
}
