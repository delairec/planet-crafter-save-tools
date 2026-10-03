import {formatUnreadableLine} from "../../save/presentation/formatUnreadableLine";
import {PlayersPagePresenterPort} from "../application/ports/PlayersPagePresenterPort";
import {PlayerCardResponse, PlayerGaugeResponse, PlayersPageResponse} from "../application/responses/PlayersPageResponse";
import type {UnreadableLinesResponse} from "../application/responses/UnreadableLinesResponse";
import {WorldObjectLabelsResponse} from "../application/responses/WorldObjectLabelsResponse";
import {NON_BREAKING_SPACE} from "./formatters/formatNumber/nonBreakingSpace";
import {PlayerCardViewModel, PlayerGaugeKindViewModel, PlayerGaugeViewModel, PlayersPageViewModel} from "./viewModels/PlayersPageViewModel";
import {
  playersPageEquipmentLabel,
  playersPageHealthGaugeLabel,
  playersPageHostBadgeLabel,
  playersPageInventoryLabel,
  playersPageNoEquipmentMessage,
  playersPageNoItemsMessage,
  playersPageOxygenGaugeLabel,
  playersPageThirstGaugeLabel,
  resolvePlayersPageCountHint,
  resolvePlayersPagePlanetLabel,
  resolvePlayersPageUnknownItemLabel
} from "./messages/playersPageMessages.js";

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
    columns: [
      {header: playersPageEquipmentLabel, values: labelWorldObjects(player.equipment, playersPageNoEquipmentMessage, worldObjectLabels)},
      {header: playersPageInventoryLabel, values: labelWorldObjects(player.inventory, playersPageNoItemsMessage, worldObjectLabels)}
    ]
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

function labelWorldObjects(worldObjectNames: readonly string[], emptyMessage: string, worldObjectLabels: WorldObjectLabelsResponse): string[] {
  if (worldObjectNames.length === 0) {
    return [emptyMessage];
  }
  return worldObjectNames.map((worldObjectName) => worldObjectLabels[worldObjectName] ?? resolvePlayersPageUnknownItemLabel(worldObjectName));
}
