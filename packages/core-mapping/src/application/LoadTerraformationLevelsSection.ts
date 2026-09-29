import {TerraformationLevelsPresenterPort} from './ports/TerraformationLevelsPresenterPort';
import {SaveSectionsReaderPort} from "./ports/SaveSectionsReaderPort";
import {TerraformationLevelSummaryResponse} from './responses/TerraformationLevelSummaryResponse';

export class LoadTerraformationLevelsSection {
  constructor(
    private saveSectionsReader: SaveSectionsReaderPort,
    private presenter: TerraformationLevelsPresenterPort
  ) {}

  async execute(): Promise<void> {
    const levels = this.saveSectionsReader.getTerraformationLevels().map((level): TerraformationLevelSummaryResponse => ({
      planetId: level.planetId,
      unitOxygenLevel: level.unitOxygenLevel,
      unitHeatLevel: level.unitHeatLevel,
      unitPressureLevel: level.unitPressureLevel,
      unitPlantsLevel: level.unitPlantsLevel,
      unitInsectsLevel: level.unitInsectsLevel,
      unitAnimalsLevel: level.unitAnimalsLevel,
      unitPurificationLevel: level.unitPurificationLevel,
      terraformationIndex: level.terraformationIndex,
      biomass: level.biomass
    }));

    this.presenter.displayTerraformationLevels(levels);
  }
}
