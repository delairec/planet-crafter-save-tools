import {formatUnreadableLine} from "../../save/presentation/mappers/formatUnreadableLine";
import {PlayersPagePresenterPort} from "../application/ports/PlayersPagePresenterPort";
import {PlayerCardResponse, PlayerEquipmentResponse, PlayerGaugeResponse, PlayerInventoryResponse, PlayersPageResponse} from "../application/responses/PlayersPageResponse";
import type {UnreadableLinesResponse} from "../application/responses/UnreadableLinesResponse";
import {WorldObjectLabelsResponse} from "../application/responses/WorldObjectLabelsResponse";
import {NON_BREAKING_SPACE} from "./mappers/formatters/formatNumber/nonBreakingSpace";
import {
  PlayerCardViewModel,
  PlayerEquipmentViewModel,
  PlayerGaugeKindViewModel,
  PlayerGaugeViewModel,
  PlayerInventoryViewModel,
  PlayersPageViewModel
} from "./viewModels/PlayersPageViewModel";
import {
  playersPageEmptySlotLabel,
  playersPageEmptySlotsLabel,
  playersPageHealthGaugeLabel,
  playersPageHostBadgeLabel,
  playersPageOtherKindLabel,
  playersPageOxygenGaugeLabel,
  playersPageThirstGaugeLabel,
  resolvePlayersPageCountHint,
  resolvePlayersPageCountLabel,
  resolvePlayersPageEquipmentCaption,
  resolvePlayersPageInventoryCaption,
  resolvePlayersPagePlanetLabel,
  resolvePlayersPageUnknownItemLabel
} from "./messages/playersPageMessages.js";

const GENERIC_EQUIPMENT_ICON = 'generic-equipment';

export class PlayersPagePresenter implements PlayersPagePresenterPort {
  private _viewModel: PlayersPageViewModel = {players: []};

  get viewModel(): PlayersPageViewModel {
    return this._viewModel;
  }

  displayPlayersPage({players, worldObjectLabels}: PlayersPageResponse): void {
    this._viewModel = {
      playerCountHint: resolvePlayersPageCountHint(players.length),
      players: players.map((player) => createPlayerCard(player, worldObjectLabels))
    };
  }

  displaySaveWithUnreadableLines({unreadableLines}: UnreadableLinesResponse): void {
    this._viewModel = {players: [], unreadableLines: unreadableLines.map(formatUnreadableLine)};
  }
}

function createPlayerCard(player: PlayerCardResponse, worldObjectLabels: WorldObjectLabelsResponse): PlayerCardViewModel {
  return {
    name: player.name,
    ...(player.planet === undefined ? {} : {planetLabel: resolvePlayersPagePlanetLabel(player.planet)}),
    ...(player.isHost ? {hostBadge: playersPageHostBadgeLabel} : {}),
    gauges: [
      createGauge('oxygen', playersPageOxygenGaugeLabel, player.gauges.oxygen),
      createGauge('health', playersPageHealthGaugeLabel, player.gauges.health),
      createGauge('thirst', playersPageThirstGaugeLabel, player.gauges.thirst)
    ],
    equipment: createEquipment(player.equipment, worldObjectLabels),
    inventory: createInventory(player.inventory, worldObjectLabels)
  };
}

function createGauge(kind: PlayerGaugeKindViewModel, label: string, {value, maximum, percentage}: PlayerGaugeResponse): PlayerGaugeViewModel {
  return {
    kind,
    label,
    percentageLabel: `${Math.round(percentage)}${NON_BREAKING_SPACE}%`,
    fillPercentage: percentage,
    amount: `${Math.round(value)} / ${Math.round(maximum)}`
  };
}

function createEquipment({slots, wornCount, slotCount}: PlayerEquipmentResponse, worldObjectLabels: WorldObjectLabelsResponse): PlayerEquipmentViewModel {
  return {
    caption: resolvePlayersPageEquipmentCaption(wornCount, slotCount),
    slots: slots.map(({kind, icon, worldObjectName}) => ({
      icon: icon ?? GENERIC_EQUIPMENT_ICON,
      kindLabel: kind ?? playersPageOtherKindLabel,
      itemLabel: worldObjectName === undefined ? playersPageEmptySlotLabel : labelWorldObject(worldObjectName, worldObjectLabels),
      isEmpty: worldObjectName === undefined
    }))
  };
}

function createInventory(
  {items, itemCount, slotCount, kindCount, freeSlotCount}: PlayerInventoryResponse,
  worldObjectLabels: WorldObjectLabelsResponse
): PlayerInventoryViewModel {
  return {
    caption: resolvePlayersPageInventoryCaption(itemCount, slotCount, kindCount),
    items: items.map(({worldObjectName, count}) => ({
      label: labelWorldObject(worldObjectName, worldObjectLabels),
      countLabel: resolvePlayersPageCountLabel(count)
    })),
    emptySlots: {label: playersPageEmptySlotsLabel, countLabel: resolvePlayersPageCountLabel(freeSlotCount)}
  };
}

function labelWorldObject(worldObjectName: string, worldObjectLabels: WorldObjectLabelsResponse): string {
  return worldObjectLabels[worldObjectName] ?? resolvePlayersPageUnknownItemLabel(worldObjectName);
}
