import {PlayerMenuEntryValueObject} from "../../domain/valueObjects/PlayerMenuEntryValueObject";

export interface PlayersMenuPresenterPort {
  displayPlayersMenu(players: PlayerMenuEntryValueObject[]): void;
}
