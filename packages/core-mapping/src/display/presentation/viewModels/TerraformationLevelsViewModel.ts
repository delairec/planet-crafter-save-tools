import {SaveValidationMessageViewModel} from "../../../save/presentation/viewModels/SaveValidationMessageViewModel";
import {TableViewModel} from "./TableViewModel";

export interface TerraformationLevelsViewModel {
  unreadableLines?: SaveValidationMessageViewModel[];
  planets: PlanetLevelsViewModel[]
}

export interface PlanetLevelsViewModel {
  name: string;
  environmentalLevels: TableViewModel;
  organicLevels: TableViewModel;
  terraformationIndex: string;
  biomass: string;
}
