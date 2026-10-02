import {SaveValidationMessageViewModel} from "../../../save/presentation/viewModels/SaveValidationMessageViewModel";
import {TonedValueViewModel} from "./ConfigurationPageViewModel";

export interface OverviewIdentityViewModel {
  title: string;
  hint: string;
}

export interface OverviewFigureTileViewModel {
  label: string;
  value: string;
  unit?: string;
}

export interface OverviewBadgeTileViewModel {
  label: string;
  badge: TonedValueViewModel;
}

export interface OverviewTilesViewModel {
  allTimeTerraTokens?: OverviewFigureTileViewModel;
  totalCraftedObjects?: OverviewFigureTileViewModel;
  droneLogistics?: OverviewBadgeTileViewModel;
}

export interface OverviewPageViewModel {
  unreadableLines?: SaveValidationMessageViewModel[];
  identity: OverviewIdentityViewModel;
  tiles: OverviewTilesViewModel;
}
