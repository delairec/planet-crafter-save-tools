import {formatUnreadableLine} from "../../save/presentation/formatUnreadableLine";
import {PlanetLevelsViewModel, TerraformationLevelsViewModel} from "./viewModels/TerraformationLevelsViewModel";
import {ColumnViewModel} from "./viewModels/TableViewModel";
import {TerraformationLevelSummaryResponse} from "../application/responses/TerraformationLevelSummaryResponse";
import {TerraformationLevelsPresenterPort} from "../application/ports/TerraformationLevelsPresenterPort";
import {formatTerraformationFigures, FormattedTerraformationFigures} from "./formatTerraformationFigures";
import {
  terraformationLevelsSectionAnimalsLabel,
  terraformationLevelsSectionDefaultPlanetName,
  terraformationLevelsSectionHeatLabel,
  terraformationLevelsSectionInsectsLabel,
  terraformationLevelsSectionOxygenLabel,
  terraformationLevelsSectionPlantsLabel,
  terraformationLevelsSectionPressureLabel,
  terraformationLevelsSectionPurificationLabel
} from "./messages/terraformationLevelsSectionMessages.js";
import type {UnreadableLinesResponse} from "../application/responses/UnreadableLinesResponse";

function presentPurificationColumns(purification: string | undefined): ColumnViewModel[] {
  if (purification === undefined) {
    return [];
  }

  return [
    {
      header: terraformationLevelsSectionPurificationLabel,
      values: [purification]
    }
  ];
}

export class TerraformationLevelsPresenter implements TerraformationLevelsPresenterPort {
  private _viewModel: TerraformationLevelsViewModel;

  constructor() {
    this._viewModel = {
      planets: [
        {
          name: terraformationLevelsSectionDefaultPlanetName,
          environmentalLevels: {
            columns: [
              {
                header: terraformationLevelsSectionOxygenLabel,
                values: []
              },
              {
                header: terraformationLevelsSectionHeatLabel,
                values: []
              },
              {
                header: terraformationLevelsSectionPressureLabel,
                values: []
              },
              {
                header: terraformationLevelsSectionPurificationLabel,
                values: []
              }
            ]
          },
          organicLevels: {
            columns: [
              {
                header: terraformationLevelsSectionPlantsLabel,
                values: []
              },
              {
                header: terraformationLevelsSectionInsectsLabel,
                values: []
              },
              {
                header: terraformationLevelsSectionAnimalsLabel,
                values: []
              },
            ]
          },
          terraformationIndex: '',
          biomass: ''
        }
      ]
    };
  }

  get viewModel(): TerraformationLevelsViewModel {
    return this._viewModel;
  }

  displayTerraformationLevels(levels: TerraformationLevelSummaryResponse[]): void {
    this._viewModel = {
      planets: levels.map(level => presentPlanet(level.planetId, formatTerraformationFigures(level)))
    };
  }

  displaySaveWithUnreadableLines({unreadableLines}: UnreadableLinesResponse): void {
    this._viewModel = {planets: [], unreadableLines: unreadableLines.map(formatUnreadableLine)};
  }
}

function presentPlanet(name: string, figures: FormattedTerraformationFigures): PlanetLevelsViewModel {
  return {
    name,
    environmentalLevels: {
      columns: [
        {
          header: terraformationLevelsSectionOxygenLabel,
          values: [figures.oxygen]
        },
        {
          header: terraformationLevelsSectionHeatLabel,
          values: [figures.heat]
        },
        {
          header: terraformationLevelsSectionPressureLabel,
          values: [figures.pressure]
        },
        ...presentPurificationColumns(figures.purification)
      ]
    },
    organicLevels: {
      columns: [
        {
          header: terraformationLevelsSectionPlantsLabel,
          values: [figures.plants]
        },
        {
          header: terraformationLevelsSectionInsectsLabel,
          values: [figures.insects]
        },
        {
          header: terraformationLevelsSectionAnimalsLabel,
          values: [figures.animals]
        },
      ]
    },
    terraformationIndex: figures.terraformationIndex,
    biomass: figures.biomass
  };
}
