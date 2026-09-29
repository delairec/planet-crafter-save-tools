import {SaveParseError} from "shared-save-processing/gameDefinitions";
import {PlayerSummaryResponse} from "../responses/PlayerSummaryResponse";

export interface PlayersPresenterPort {
  displayPlayers(players: PlayerSummaryResponse[]): void;

  displaySaveWithUnreadableLines(unreadableLines: SaveParseError[]): void;
}
