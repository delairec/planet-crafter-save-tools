import {SaveValidationMessageViewModel} from "../../../save/presentation/viewModels/SaveValidationMessageViewModel";
export interface PlayersMenuViewModel {
  unreadableLines?: SaveValidationMessageViewModel[];
  players: PlayerMenuEntryViewModel[];
}

interface PlayerMenuEntryViewModel {
  name: string;
  planet?: string;
  hostBadge?: string;
}
