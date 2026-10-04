import {SaveValidationMessageViewModel} from "../../../save/presentation/viewModels/SaveValidationMessageViewModel";
import {TonedValueViewModel} from "./ConfigurationPageViewModel";
import {NotificationViewModel} from "./NotificationViewModel";

export interface OverviewIdentityViewModel {
  title: string;
  hint: string;
}

export interface OverviewFigureTileViewModel {
  label: string;
  value: string;
  unit?: string;
  caption?: string;
}

export interface OverviewBadgeTileViewModel {
  label: string;
  badge: TonedValueViewModel;
}

export interface OverviewTilesViewModel {
  allTimeTerraTokens?: OverviewFigureTileViewModel;
  totalCraftedObjects?: OverviewFigureTileViewModel;
  systemTerraformationIndex?: OverviewFigureTileViewModel;
  droneLogistics?: OverviewBadgeTileViewModel;
}

export interface OverviewPlanetFigureViewModel {
  label: string;
  value: string;
}

export interface OverviewPlanetTerraformationViewModel {
  terraformationIndex: OverviewPlanetFigureViewModel;
  figures: OverviewPlanetFigureViewModel[];
}

export interface OverviewPowerBarViewModel {
  label: string;
  value: string;
  widthPercentage: number;
}

export interface OverviewPlanetPowerViewModel {
  production: OverviewPowerBarViewModel;
  consumption: OverviewPowerBarViewModel;
  available: OverviewPlanetFigureViewModel;
  shareOfProductionConsumed?: string;
}

export interface OverviewPlanetCardViewModel {
  name: string;
  terraformationStage?: OverviewPlanetFigureViewModel;
  terraformation?: OverviewPlanetTerraformationViewModel;
  power?: OverviewPlanetPowerViewModel;
  absentSide?: string;
}

export interface OverviewPlanetsViewModel {
  title: string;
  hint: string;
  cards: OverviewPlanetCardViewModel[];
}

export interface OverviewPageViewModel {
  unreadableLines?: SaveValidationMessageViewModel[];
  identity: OverviewIdentityViewModel;
  notifications: NotificationViewModel[];
  tiles: OverviewTilesViewModel;
  planets: OverviewPlanetsViewModel;
}
