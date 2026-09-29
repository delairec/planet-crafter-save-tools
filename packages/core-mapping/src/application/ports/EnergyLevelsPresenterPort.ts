import {UnreadableLine} from "./SaveSectionLocation";
import {EnergyLevelsResponse} from "../responses/EnergyLevelsResponse";

export interface EnergyLevelsPresenterPort {
  displayEnergyLevels(energyLevels: EnergyLevelsResponse): void;

  displaySaveWithUnreadableLines(unreadableLines: UnreadableLine[]): void;
}
