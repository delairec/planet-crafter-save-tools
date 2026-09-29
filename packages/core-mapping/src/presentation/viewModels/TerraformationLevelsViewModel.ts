import {SaveValidationMessageViewModel} from "./SaveFileValidationViewModel";
import {TableViewModel} from "./TableViewModel";

export interface TerraformationLevelsViewModel {
  unreadableLines?: SaveValidationMessageViewModel[];
  planets: PlanetLevelsViewModel[]
}

interface PlanetLevelsViewModel {
  name: string;
  environmentalLevels: TableViewModel;
  organicLevels: TableViewModel;
  terraformationIndex: string;
  biomass: string;
}
