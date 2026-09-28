import {SaveValidationMessageViewModel} from "./SaveFileValidationViewModel";
export interface PlayersMenuViewModel {
  unreadableLines?: SaveValidationMessageViewModel[];
  players: PlayerMenuEntryViewModel[];
}

interface PlayerMenuEntryViewModel {
  name: string;
  planet?: string;
  hostBadge?: string;
}
