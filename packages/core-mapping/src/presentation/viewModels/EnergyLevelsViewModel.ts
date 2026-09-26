import {PlanetEnergyLevelsViewModel} from "./PlanetEnergyLevelsViewModel";

export interface EnergyLevelsViewModel {
  submergedMachinesDisclaimer: string;
  gameReleaseNote?: string;
  planets: PlanetEnergyLevelsViewModel[];
}
