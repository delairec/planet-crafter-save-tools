import type {UnreadableLinesResponse} from "../responses/UnreadableLinesResponse";
import {EnergyLevelsResponse} from "../responses/EnergyLevelsResponse";

export interface PowerPagePresenterPort {
  displayPowerPage(energyLevels: EnergyLevelsResponse): void;

  displaySaveWithUnreadableLines(response: UnreadableLinesResponse): void;
}
