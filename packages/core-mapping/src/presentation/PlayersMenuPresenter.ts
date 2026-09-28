import {formatUnreadableLine} from "./formatUnreadableLine";
import {PlayersMenuViewModel} from "./viewModels/PlayersMenuViewModel";
import {PlayersMenuPresenterPort} from "../application/ports/PlayersMenuPresenterPort";
import {PlayerMenuEntryResponse} from "../application/responses/PlayerMenuEntryResponse";
import {playersMenuHostBadgeLabel} from "./messages/playersMenuMessages.js";
import type {UnreadableLinesResponse} from "../application/responses/UnreadableLinesResponse";

export class PlayersMenuPresenter implements PlayersMenuPresenterPort {
  private _viewModel: PlayersMenuViewModel = {players: []};

  get viewModel(): PlayersMenuViewModel {
    return this._viewModel;
  }

  displayPlayersMenu(players: PlayerMenuEntryResponse[]): void {
    this._viewModel = {
      players: players.map((player) => ({
        name: player.name,
        ...(player.planet === undefined ? {} : {planet: player.planet}),
        ...(player.isHost ? {hostBadge: playersMenuHostBadgeLabel} : {})
      }))
    };
  }

  displaySaveWithUnreadableLines({unreadableLines}: UnreadableLinesResponse): void {
    this._viewModel = {players: [], unreadableLines: unreadableLines.map(formatUnreadableLine)};
  }
}
