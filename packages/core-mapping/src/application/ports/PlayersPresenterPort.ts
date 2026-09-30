import type {UnreadableLinesResponse} from "../responses/UnreadableLinesResponse";
import {PlayersResponse} from "../responses/PlayersResponse";

export interface PlayersPresenterPort {
  displayPlayers(response: PlayersResponse): void;

  displaySaveWithUnreadableLines(response: UnreadableLinesResponse): void;
}
