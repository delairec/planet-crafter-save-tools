import {UnreadableLine} from "./SaveSectionLocation";
import {PlayerSummaryResponse} from "../responses/PlayerSummaryResponse";

export interface PlayersPresenterPort {
  displayPlayers(players: PlayerSummaryResponse[]): void;

  displaySaveWithUnreadableLines(unreadableLines: UnreadableLine[]): void;
}
