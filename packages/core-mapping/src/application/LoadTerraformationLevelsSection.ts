import {TerraformationLevelsPresenterPort} from './ports/TerraformationLevelsPresenterPort';
import {SaveSectionsReaderPort} from "./ports/SaveSectionsReaderPort";
import {LoadSaveSectionsRequest} from "./requests/LoadSaveSectionsRequest";
import {TerraformationLevelSummaryResponse} from './responses/TerraformationLevelSummaryResponse';

export class LoadTerraformationLevelsSection {
  constructor(
    private readonly saveSectionsReader: SaveSectionsReaderPort,
    private readonly presenter: TerraformationLevelsPresenterPort
  ) {}

  async execute({content}: LoadSaveSectionsRequest): Promise<void> {
    const {saveSections, unreadableLines} = this.saveSectionsReader.read(content);

    if (unreadableLines.length > 0) {
      this.presenter.displaySaveWithUnreadableLines(unreadableLines);
      return;
    }

    const levels = saveSections.getTerraformationLevels().map((level): TerraformationLevelSummaryResponse => ({
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
