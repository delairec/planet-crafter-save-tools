import {PlayersMenuViewModel} from "./viewModels/PlayersMenuViewModel";
import {PlayersMenuPresenterPort} from "../application/ports/PlayersMenuPresenterPort";
import {PlayerMenuEntryValueObject} from "../domain/valueObjects/PlayerMenuEntryValueObject";
import {playersMenuHostBadgeLabel} from "./messages/playersMenuMessages.js";

export class PlayersMenuPresenter implements PlayersMenuPresenterPort {
  private _viewModel: PlayersMenuViewModel = {players: []};

  get viewModel(): PlayersMenuViewModel {
    return this._viewModel;
  }

  displayPlayersMenu(players: PlayerMenuEntryValueObject[]): void {
    this._viewModel = {
      players: players.map((player) => ({
        name: player.name,
        ...(player.planet === undefined ? {} : {planet: player.planet}),
        ...(player.isHost ? {hostBadge: playersMenuHostBadgeLabel} : {})
      }))
    };
  }
}
