import {formatUnreadableLine} from "../../save/presentation/formatUnreadableLine";
import {PlayersViewModel} from './viewModels/PlayersViewModel';
import {PlayersPresenterPort} from '../application/ports/PlayersPresenterPort';
import {PlayersResponse} from "../application/responses/PlayersResponse";
import {WorldObjectLabelsResponse} from "../application/responses/WorldObjectLabelsResponse";
import {
  playersSectionEquipmentLabel,
  playersSectionInventoryLabel,
  playersSectionNoEquipmentMessage,
  playersSectionNoItemsMessage,
  resolvePlayersSectionUnknownItemLabel
} from "./messages/playersSectionMessages.js";
import type {UnreadableLinesResponse} from "../application/responses/UnreadableLinesResponse";

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

  displayPlayers({players, worldObjectLabels}: PlayersResponse): void {
    this._viewModel = {
      players: players.map(player => ({
        name: player.name,
        columns: [
          {
            header: playersSectionEquipmentLabel,
            values: mapListWithEmptyMessage(player.equipment, playersSectionNoEquipmentMessage, worldObjectLabels),
          },
          {
            header: playersSectionInventoryLabel,
            values: mapListWithEmptyMessage(player.inventory, playersSectionNoItemsMessage, worldObjectLabels),
          }
        ]
      }))
    };
  }

  displaySaveWithUnreadableLines({unreadableLines}: UnreadableLinesResponse): void {
    this._viewModel = {players: [], unreadableLines: unreadableLines.map(formatUnreadableLine)};
  }
}

function mapItemNameToItemLabel(itemName: string, worldObjectLabels: WorldObjectLabelsResponse): string {
  const worldObjectLabel: string | undefined = worldObjectLabels[itemName];
  return worldObjectLabel ?? resolvePlayersSectionUnknownItemLabel(itemName);
}

function mapListWithEmptyMessage(list: readonly string[], message: string, worldObjectLabels: WorldObjectLabelsResponse): string[] {
  return list.length === 0 ? [message] : list.map((itemName) => mapItemNameToItemLabel(itemName, worldObjectLabels));
}
