import {SaveValidationMessageViewModel} from "../../../save/presentation/viewModels/SaveValidationMessageViewModel";
import {NotificationViewModel} from "./NotificationViewModel";
import {PlanetEnergyLevelsViewModel} from "./PlanetEnergyLevelsViewModel";

export interface EnergyLevelsViewModel {
  unreadableLines?: SaveValidationMessageViewModel[];
  notifications: NotificationViewModel[];
  planets: PlanetEnergyLevelsViewModel[];
}
