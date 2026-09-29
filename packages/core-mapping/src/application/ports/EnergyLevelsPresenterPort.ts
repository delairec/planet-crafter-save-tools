import {SaveParseError} from "shared-save-processing/gameDefinitions";
import {EnergyLevelsResponse} from "../responses/EnergyLevelsResponse";

export interface EnergyLevelsPresenterPort {
  displayEnergyLevels(energyLevels: EnergyLevelsResponse): void;

  displaySaveWithUnreadableLines(unreadableLines: SaveParseError[]): void;
}
