import {NotificationViewModel} from "./NotificationViewModel";
import {PlanetEnergyLevelsViewModel} from "./PlanetEnergyLevelsViewModel";

export interface EnergyLevelsViewModel {
  notifications: NotificationViewModel[];
  planets: PlanetEnergyLevelsViewModel[];
}
