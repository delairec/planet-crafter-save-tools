import {UnreadableLine} from "./SaveSectionLocation";
import {PlayersResponse} from "../responses/PlayersResponse";

export interface PlayersPresenterPort {
  displayPlayers(response: PlayersResponse): void;

  displaySaveWithUnreadableLines(unreadableLines: UnreadableLine[]): void;
}
