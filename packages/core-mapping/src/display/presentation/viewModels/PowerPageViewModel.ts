import {SaveValidationMessageViewModel} from "../../../save/presentation/viewModels/SaveValidationMessageViewModel";
import {NotificationViewModel} from "./NotificationViewModel";
import {PlanetPowerZoneViewModel} from "./PlanetPowerZoneViewModel";

export interface PowerPageViewModel {
  unreadableLines?: SaveValidationMessageViewModel[];
  notifications: NotificationViewModel[];
  planets: PlanetPowerZoneViewModel[];
}
