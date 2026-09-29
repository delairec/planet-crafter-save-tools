import {SaveParseError} from "shared-save-processing/gameDefinitions";
import {PlayerMenuEntryResponse} from "../responses/PlayerMenuEntryResponse";

export interface PlayersMenuPresenterPort {
  displayPlayersMenu(players: PlayerMenuEntryResponse[]): void;

  displaySaveWithUnreadableLines(unreadableLines: SaveParseError[]): void;
}
