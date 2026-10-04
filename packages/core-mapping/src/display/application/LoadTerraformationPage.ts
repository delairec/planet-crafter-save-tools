import {UseCase} from "../../save/application/UseCase";
import {SaveSectionsReaderPort} from "./ports/SaveSectionsReaderPort";
import {TerraformationPagePresenterPort} from "./ports/TerraformationPagePresenterPort";
import {LoadSaveSectionsRequest} from "./requests/LoadSaveSectionsRequest";
import {PlanetTerraformationResponse} from "./responses/TerraformationPageResponse";
import {TerraformationLevelSummaryResponse} from "./responses/TerraformationLevelSummaryResponse";
import {computeSystemTerraformationIndex, SystemTerraformationIndex} from "../domain/rules/computeSystemTerraformationIndex";
import {isFactorOfTheSystemTerraformationIndex} from "../domain/rules/isFactorOfTheSystemTerraformationIndex";
import {TerraformationLevelEntity} from "../domain/entities/TerraformationLevelEntity";

export class LoadTerraformationPage implements UseCase<LoadSaveSectionsRequest> {
  constructor(
    private readonly saveSectionsReader: SaveSectionsReaderPort,
    private readonly presenter: TerraformationPagePresenterPort
  ) {}

  async execute({content}: LoadSaveSectionsRequest): Promise<void> {
    const {saveSections, unreadableLines} = this.saveSectionsReader.read(content);

    if (unreadableLines.length > 0) {
      this.presenter.displaySaveWithUnreadableLines({unreadableLines});
      return;
    }

    const terraformationLevels = saveSections.getTerraformationLevels();
    const systemTerraformationIndex = computeSystemTerraformationIndex(terraformationLevels);

    this.presenter.displayTerraformationPage({
      planets: terraformationLevels.map((level) => describePlanetTerraformation(level, systemTerraformationIndex))
    });
  }
}

function describePlanetTerraformation(level: TerraformationLevelEntity, systemTerraformationIndex: SystemTerraformationIndex | undefined): PlanetTerraformationResponse {
  const levels = describeTerraformationLevel(level);
  if (!systemTerraformationIndex || !isFactorOfTheSystemTerraformationIndex(level)) {
    return {levels};
  }
  return {levels, systemTerraformationIndex: {index: systemTerraformationIndex.index, planetCount: systemTerraformationIndex.planetCount}};
}

function describeTerraformationLevel(level: TerraformationLevelEntity): TerraformationLevelSummaryResponse {
  return {
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
  };
}
