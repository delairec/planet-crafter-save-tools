import {formatUnreadableLine} from "./formatUnreadableLine";
import {UnreadableLine} from "../application/ports/SaveSectionLocation";
import {PlayersViewModel} from './viewModels/PlayersViewModel';
import {PlayersPresenterPort} from '../application/ports/PlayersPresenterPort';
import {PlayerSummaryResponse} from "../application/responses/PlayerSummaryResponse";
import {WorldObjectLabel, worldObjectLabels} from "./worldObjectLabels";
import {
  playersSectionEquipmentLabel,
  playersSectionInventoryLabel,
  playersSectionNoEquipmentMessage,
  playersSectionNoItemsMessage,
  resolvePlayersSectionUnknownItemLabel
} from "./messages/playersSectionMessages.js";

export class PlayersPresenter implements PlayersPresenterPort {
  private _viewModel: PlayersViewModel;

  constructor() {
    this._viewModel = {
      players: []
    };
  }

  get viewModel(): PlayersViewModel {
    return this._viewModel;
  }

  displayPlayers(players: PlayerSummaryResponse[]): void {
    this._viewModel = {
      players: players.map(player => ({
        name: player.name,
        columns: [
          {
            header: playersSectionEquipmentLabel,
            values: mapListWithEmptyMessage(player.equipment, playersSectionNoEquipmentMessage),
          },
          {
            header: playersSectionInventoryLabel,
            values: mapListWithEmptyMessage(player.inventory, playersSectionNoItemsMessage),
          }
        ]
      }))
    };
  }

  displaySaveWithUnreadableLines(unreadableLines: UnreadableLine[]): void {
    this._viewModel = {players: [], unreadableLines: unreadableLines.map(formatUnreadableLine)};
  }
}

function mapItemNameToItemLabel(itemName: string): string {
  const worldObjectLabel: WorldObjectLabel = worldObjectLabels[itemName];
  return worldObjectLabel ?? resolvePlayersSectionUnknownItemLabel(itemName);
}

function mapListWithEmptyMessage(list: readonly string[], message: string): string[] {
  return list.length === 0 ? [message] : list.map(mapItemNameToItemLabel);
}
