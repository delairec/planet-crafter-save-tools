import {SaveSectionsReaderPort} from "./ports/SaveSectionsReaderPort";
import {LoadSaveSectionsRequest} from "./requests/LoadSaveSectionsRequest";
import {EnergyLevelsPresenterPort} from "./ports/EnergyLevelsPresenterPort";
import {PlanetEnergyGrid} from "../domain/PlanetEnergyGrid";
import {selectEnergyLevelsOfDeclaredVersion} from "../domain/energyLevelsByWorldObjectName";
import {UNMODIFIED_POWER_CONSUMPTION_MODIFIER} from "../domain/powerConsumptionModifier";

export class LoadEnergyLevelsSection {
  constructor(
    private readonly saveSectionsReader: SaveSectionsReaderPort,
    private readonly presenter: EnergyLevelsPresenterPort
  ) {
  }

  async execute({content}: LoadSaveSectionsRequest): Promise<void> {
    const {saveSections, unreadableLines} = this.saveSectionsReader.read(content);

    if (unreadableLines.length > 0) {
      this.presenter.displaySaveWithUnreadableLines(unreadableLines);
      return;
    }

    const allWorldObjects = saveSections.getWorldObjects();
    const inventories = saveSections.getInventories();
    const powerConsumptionModifier = saveSections.getSaveConfiguration()?.modifiers.powerConsumption ?? UNMODIFIED_POWER_CONSUMPTION_MODIFIER;
    const energyLevelsOfRelease = selectEnergyLevelsOfDeclaredVersion(saveSections.getDeclaredVersion());

    this.presenter.displayEnergyLevels({
      gameRelease: energyLevelsOfRelease.release,
      powerConsumptionModifier,
      planets: saveSections.getPlacedWorldObjectsByPlanet().map((planet) => new PlanetEnergyGrid(planet, allWorldObjects, inventories, energyLevelsOfRelease, powerConsumptionModifier).levels())
    });
  }
}
