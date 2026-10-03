import {SaveValidationMessageViewModel} from "../../../save/presentation/viewModels/SaveValidationMessageViewModel";
import {TableViewModel} from "./TableViewModel";

export type PlayerGaugeKindViewModel = 'oxygen' | 'health' | 'thirst';

export interface PlayerGaugeViewModel {
  kind: PlayerGaugeKindViewModel;
  label: string;
  percentageLabel: string;
  fillPercentage: number;
  amount: string;
}

export interface PlayerCardViewModel extends TableViewModel {
  name: string;
  planetLabel?: string;
  hostBadge?: string;
  gauges: PlayerGaugeViewModel[];
}

export interface PlayersPageViewModel {
  unreadableLines?: SaveValidationMessageViewModel[];
  playerCountHint?: string;
  players: PlayerCardViewModel[];
}
