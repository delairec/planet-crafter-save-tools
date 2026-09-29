import {EnergyLevelsResponse} from "../responses/EnergyLevelsResponse";

export interface EnergyLevelsPresenterPort {
  displayEnergyLevels(energyLevels: EnergyLevelsResponse): void;
}
