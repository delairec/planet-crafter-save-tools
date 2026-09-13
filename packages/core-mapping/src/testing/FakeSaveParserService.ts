import {SaveSectionsReaderPort} from "../application/ports/SaveSectionsReaderPort";
import {createGlobalProgressionValueObject, GlobalProgressionValueObject} from "../domain/valueObjects/GlobalProgressionValueObject";
import {PlayerEntity} from "../domain/entities/PlayerEntity";
import {TerraformationLevelEntity} from "../domain/entities/TerraformationLevelEntity";
import {createStatisticsValueObject, StatisticsValueObject} from "../domain/valueObjects/StatisticsValueObject";
import {createSaveConfigurationValueObject, SaveConfigurationValueObject} from "../domain/valueObjects/SaveConfigurationValueObject";
import {
  createEnergyLevelsRawDataValueObject,
  createPlanetWorldObjectsValueObject,
  EnergyLevelsRawDataValueObject
} from "../domain/valueObjects/EnergyLevelsRawDataValueObject";
import {PlacedWorldObjectEntity} from "../domain/entities/PlacedWorldObjectEntity";
import {WorldObjectEntity} from "../domain/entities/WorldObjectEntity";

export class FakeSaveParserService implements SaveSectionsReaderPort {
  getEnergyLevelsRawData(): EnergyLevelsRawDataValueObject {
    const producer = new PlacedWorldObjectEntity({id: '1', name: 'EnergyGenerator6' as const, position: [0, 0, 0], planetId: 1});
    const consumer = new PlacedWorldObjectEntity({id: '2', name: 'Drill4' as const, position: [10, 0, 0], planetId: 1});

    return createEnergyLevelsRawDataValueObject({
      allWorldObjects: [new WorldObjectEntity(producer), new WorldObjectEntity(consumer)],
      inventories: [],
      planets: [createPlanetWorldObjectsValueObject({
        planetId: 1,
        planetName: undefined,
        placedWorldObjects: [producer, consumer]
      })]
    });
  }

  getSaveConfiguration(): SaveConfigurationValueObject {
    return createSaveConfigurationValueObject({
      mode: 'Standard',
      title: 'Fake Save',
      modifiers: {
        terraformationPace: 0.1,
        gaugeDrain: 0.2,
        meteoOccurrence: 0.3,
        multiplayerFactor: 0.4,
        powerConsumption: 0.5
      }
    });
  }

  getStatistics(): StatisticsValueObject {
    return createStatisticsValueObject({
      totalCraftedObjects: 10
    });
  }

  getGlobalMetadata(): GlobalProgressionValueObject {
    return createGlobalProgressionValueObject({allTimeTerraTokens: 1_234_567});
  }

  getPlayers(): PlayerEntity[] {
    return [new PlayerEntity({
      name: 'Nikowa',
      inventory: [],
      equipment: []
    }), new PlayerEntity({
      name: 'Chileny',
      inventory: [],
      equipment: []
    })];
  }

  getTerraformationLevels(): TerraformationLevelEntity[] {
    return [new TerraformationLevelEntity({
      planetId: "Toxicity",
      unitOxygenLevel: 100,
      unitHeatLevel: 200,
      unitPressureLevel: 300,
      unitPlantsLevel: 400,
      unitInsectsLevel: 500,
      unitAnimalsLevel: 600,
      unitPurificationLevel: 700
    })];
  }
}
