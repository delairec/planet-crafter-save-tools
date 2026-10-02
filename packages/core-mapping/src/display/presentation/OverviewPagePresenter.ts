import {formatUnreadableLine} from "../../save/presentation/formatUnreadableLine";
import {OverviewPagePresenterPort} from "../application/ports/OverviewPagePresenterPort";
import {
  OverviewPageResponse,
  OverviewProgressionResponse,
  OverviewSaveConfigurationResponse,
  SaveFileResponse
} from "../application/responses/OverviewPageResponse";
import type {UnreadableLinesResponse} from "../application/responses/UnreadableLinesResponse";
import {formatNumber} from "./formatters/formatNumber/formatNumber";
import {FormatNumberStrategies} from "./formatters/formatNumber/FormatNumberStrategies";
import {createDroneLogisticsBadge} from "./createDroneLogisticsBadge";
import {OverviewIdentityViewModel, OverviewPageViewModel, OverviewTilesViewModel} from "./viewModels/OverviewPageViewModel";
import {
  overviewPageAllTimeTerraTokensLabel,
  overviewPageDroneLogisticsLabel,
  overviewPageIdentityHintSeparator,
  overviewPageTerraTokenUnit,
  overviewPageTotalCraftedObjectsLabel,
  resolveOverviewPageGameReleaseLabel
} from "./messages/overviewPageMessages.js";

const NO_IDENTITY: OverviewIdentityViewModel = {title: '', hint: ''};

export class OverviewPagePresenter implements OverviewPagePresenterPort {
  private _viewModel: OverviewPageViewModel = {identity: NO_IDENTITY, tiles: {}};

  get viewModel(): OverviewPageViewModel {
    return this._viewModel;
  }

  displayOverviewPage({saveFile, saveConfiguration, progression}: OverviewPageResponse): void {
    this._viewModel = {
      identity: createIdentity(saveFile, saveConfiguration),
      tiles: createTiles(progression)
    };
  }

  displaySaveWithUnreadableLines({unreadableLines}: UnreadableLinesResponse): void {
    this._viewModel = {identity: NO_IDENTITY, tiles: {}, unreadableLines: unreadableLines.map(formatUnreadableLine)};
  }
}

function createIdentity(saveFile: SaveFileResponse, saveConfiguration: OverviewSaveConfigurationResponse | undefined): OverviewIdentityViewModel {
  const fileSize = formatNumber(saveFile.size, FormatNumberStrategies.FILE_SIZE);
  if (!saveConfiguration) {
    return {title: saveFile.name, hint: fileSize};
  }
  return {
    title: saveConfiguration.displayName,
    hint: [saveConfiguration.mode, resolveOverviewPageGameReleaseLabel(saveConfiguration.gameRelease), fileSize].join(overviewPageIdentityHintSeparator)
  };
}

function createTiles({allTimeTerraTokens, totalCraftedObjects, droneLogistics}: OverviewProgressionResponse): OverviewTilesViewModel {
  const tiles: OverviewTilesViewModel = {
    allTimeTerraTokens: {label: overviewPageAllTimeTerraTokensLabel, value: formatNumber(allTimeTerraTokens), unit: overviewPageTerraTokenUnit}
  };
  if (totalCraftedObjects !== undefined) {
    tiles.totalCraftedObjects = {label: overviewPageTotalCraftedObjectsLabel, value: formatNumber(totalCraftedObjects)};
  }
  if (droneLogistics) {
    tiles.droneLogistics = {label: overviewPageDroneLogisticsLabel, badge: createDroneLogisticsBadge(droneLogistics)};
  }
  return tiles;
}
