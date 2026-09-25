import {PlanetEnergyLevelsViewModel} from "./PlanetEnergyLevelsViewModel";

export interface EnergyLevelsViewModel {
  submergedMachinesDisclaimer: string;
  planets: PlanetEnergyLevelsViewModel[];
}
