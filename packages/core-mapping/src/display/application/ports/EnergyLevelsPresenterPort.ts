import type {UnreadableLinesResponse} from "../responses/UnreadableLinesResponse";
import {EnergyLevelsResponse} from "../responses/EnergyLevelsResponse";

export interface EnergyLevelsPresenterPort {
  displayEnergyLevels(energyLevels: EnergyLevelsResponse): void;

  displaySaveWithUnreadableLines(response: UnreadableLinesResponse): void;
}
