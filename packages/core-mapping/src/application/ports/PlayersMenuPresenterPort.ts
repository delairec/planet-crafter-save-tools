import {UnreadableLine} from "./SaveSectionLocation";
import {PlayerMenuEntryResponse} from "../responses/PlayerMenuEntryResponse";

export interface PlayersMenuPresenterPort {
  displayPlayersMenu(players: PlayerMenuEntryResponse[]): void;

  displaySaveWithUnreadableLines(unreadableLines: UnreadableLine[]): void;
}
