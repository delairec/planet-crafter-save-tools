import {SaveValidationMessageViewModel} from "./SaveFileValidationViewModel";
import {NotificationViewModel} from "./NotificationViewModel";
import {PlanetEnergyLevelsViewModel} from "./PlanetEnergyLevelsViewModel";

export interface EnergyLevelsViewModel {
  unreadableLines?: SaveValidationMessageViewModel[];
  notifications: NotificationViewModel[];
  planets: PlanetEnergyLevelsViewModel[];
}
