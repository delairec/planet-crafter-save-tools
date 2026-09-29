import {PlayerMenuEntryResponse} from "../responses/PlayerMenuEntryResponse";

export interface PlayersMenuPresenterPort {
  displayPlayersMenu(players: PlayerMenuEntryResponse[]): void;
}
