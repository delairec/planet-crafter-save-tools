import type {UnreadableLinesResponse} from "../responses/UnreadableLinesResponse";
import {PlayerMenuEntryResponse} from "../responses/PlayerMenuEntryResponse";

export interface PlayersMenuPresenterPort {
  displayPlayersMenu(players: PlayerMenuEntryResponse[]): void;

  displaySaveWithUnreadableLines(response: UnreadableLinesResponse): void;
}
