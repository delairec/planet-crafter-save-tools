import {SaveValidationMessageViewModel} from "../../../save/presentation/viewModels/SaveValidationMessageViewModel";
import {TableViewModel} from "./TableViewModel";

export interface PlayersViewModel {
  unreadableLines?: SaveValidationMessageViewModel[];
  players: PlayerViewModel[];
}

interface PlayerViewModel extends TableViewModel{
  name: string;
}
