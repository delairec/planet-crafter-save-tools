import {PlanetEnergyLevelsViewModel} from "./PlanetEnergyLevelsViewModel";

export interface EnergyLevelsViewModel {
  submergedMachinesDisclaimer: string;
  gameReleaseNote?: string;
  powerConsumptionModifierNote?: string;
  planets: PlanetEnergyLevelsViewModel[];
}
