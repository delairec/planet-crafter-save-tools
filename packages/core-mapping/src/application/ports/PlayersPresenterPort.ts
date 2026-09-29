import {PlayerSummaryResponse} from "../responses/PlayerSummaryResponse";

export interface PlayersPresenterPort {
  displayPlayers(players: PlayerSummaryResponse[]): void;
}
