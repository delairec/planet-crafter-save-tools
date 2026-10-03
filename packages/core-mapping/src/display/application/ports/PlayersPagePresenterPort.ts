import type {UnreadableLinesResponse} from "../responses/UnreadableLinesResponse";
import {PlayersPageResponse} from "../responses/PlayersPageResponse";

export interface PlayersPagePresenterPort {
  displayPlayersPage(response: PlayersPageResponse): void;

  displaySaveWithUnreadableLines(response: UnreadableLinesResponse): void;
}
