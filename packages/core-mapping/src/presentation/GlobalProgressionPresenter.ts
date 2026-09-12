import {GlobalProgressionViewModel} from './viewModels/GlobalProgressionViewModel';
import {GlobalProgressionPresenterPort} from '../application/ports/GlobalProgressionPresenterPort';
import {GlobalProgressionValueObject} from "../domain/valueObjects/GlobalProgressionValueObject";
import {formatNumber} from "./formatters/formatNumber/formatNumber";
import {StatisticsValueObject} from "../domain/valueObjects/StatisticsValueObject";
import {
  globalProgressionSectionAllTimeTerraTokensLabel,
  globalProgressionSectionTotalCraftedObjectsLabel
} from "./messages/globalProgressionSectionMessages.js";

const NO_CRAFTED_OBJECT_COUNTED = 0;

export class GlobalProgressionPresenter implements GlobalProgressionPresenterPort {
  private _viewModel: GlobalProgressionViewModel = {
    statistics: {
      columns: [
        {
          header: globalProgressionSectionAllTimeTerraTokensLabel,
          values: []
        },
        {
          header: globalProgressionSectionTotalCraftedObjectsLabel,
          values: []
        },
      ]
    },
  };

  get viewModel(): GlobalProgressionViewModel {
    return this._viewModel;
  }

  displayGlobalProgression(globalProgression: GlobalProgressionValueObject, statistics: StatisticsValueObject): void {
    this._viewModel = createViewModel(globalProgression, statistics.totalCraftedObjects);
  }

  displayGlobalProgressionWithoutStatistics(globalProgression: GlobalProgressionValueObject): void {
    this._viewModel = createViewModel(globalProgression, NO_CRAFTED_OBJECT_COUNTED);
  }
}

function createViewModel(globalProgression: GlobalProgressionValueObject, totalCraftedObjects: number): GlobalProgressionViewModel {
  return {
    statistics: {
      columns: [
        {
          header: globalProgressionSectionAllTimeTerraTokensLabel,
          values: [`${formatNumber(globalProgression.allTimeTerraTokens)} =tt=`]
        },
        {
          header: globalProgressionSectionTotalCraftedObjectsLabel,
          values: [`${totalCraftedObjects}`]
        },
      ]
    }
  };
}
