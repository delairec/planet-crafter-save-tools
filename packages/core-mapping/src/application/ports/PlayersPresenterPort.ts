import {PlayerSummaryValueObject} from "../../domain/valueObjects/PlayerSummaryValueObject";

export interface PlayersPresenterPort {
  displayPlayers(players: PlayerSummaryValueObject[]): void;
}
