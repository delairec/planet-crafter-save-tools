import {SaveSectionsMapperPort} from "../application/ports/SaveSectionsMapperPort";
import {createGlobalProgressionValueObject, GlobalProgressionValueObject} from "../domain/valueObjects/GlobalProgressionValueObject";
import {PlayerEntity} from "../domain/entities/PlayerEntity";
import {TerraformationLevelEntity} from "../domain/entities/TerraformationLevelEntity";
import {createStatisticsValueObject, StatisticsValueObject} from "../domain/valueObjects/StatisticsValueObject";
import {createSaveConfigurationValueObject, SaveConfigurationValueObject} from "../domain/valueObjects/SaveConfigurationValueObject";
import {
  createPlanetWorldObjectsValueObject,
  PlanetWorldObjectsValueObject
} from "../domain/valueObjects/PlanetWorldObjectsValueObject";
import {PlacedWorldObjectEntity} from "../domain/entities/PlacedWorldObjectEntity";
import {WorldObjectEntity} from "../domain/entities/WorldObjectEntity";
import {InventoryEntity} from "../domain/entities/InventoryEntity";

const PRODUCER = new PlacedWorldObjectEntity({id: '1', name: 'EnergyGenerator6' as const, position: [0, 0, 0], planetId: 1});
const CONSUMER = new PlacedWorldObjectEntity({id: '2', name: 'Drill4' as const, position: [10, 0, 0], planetId: 1});

export class FakeSaveSectionsMapperService implements SaveSectionsMapperPort {
  getPlacedWorldObjectsByPlanet(): PlanetWorldObjectsValueObject[] {
    return [createPlanetWorldObjectsValueObject({
      planetId: 1,
      planetName: undefined,
      placedWorldObjects: [PRODUCER, CONSUMER]
    })];
  }

  getWorldObjects(): WorldObjectEntity[] {
    return [new WorldObjectEntity(PRODUCER), new WorldObjectEntity(CONSUMER)];
  }

  getInventories(): InventoryEntity[] {
    return [];
  }

  getSaveConfiguration(): SaveConfigurationValueObject | undefined {
    return createSaveConfigurationValueObject({
      mode: 'Standard',
      title: 'Fake Save',
      modifiers: {
        terraformationPace: 0.1,
        gaugeDrain: 0.2,
        meteoOccurrence: 0.3,
        multiplayerFactor: 0.4,
        powerConsumption: 0.5
      },
      unlocks: {
        freeCraft: false,
        everythingUnlocked: false,
        spaceTrading: true,
        oreExtractors: true,
        teleporters: false,
        drones: true,
        autocrafter: false,
        randomizedMineables: false
      }
    });
  }

  getStatistics(): StatisticsValueObject | undefined {
    return createStatisticsValueObject({
      totalCraftedObjects: 10
    });
  }

  getGlobalProgression(): GlobalProgressionValueObject {
    return createGlobalProgressionValueObject({allTimeTerraTokens: 1_234_567});
  }

  getPlayers(): PlayerEntity[] {
    return [new PlayerEntity({
      id: '76561190000000001',
      name: 'Nikowa',
      inventory: ['Backpack4'],
      inventorySize: 12,
      equipment: ['OxygenTank3'],
      planetId: 'Toxicity',
      host: true,
      gauges: {oxygen: 140, health: 72.5, thirst: 96}
    }), new PlayerEntity({
      id: '76561190000000007',
      name: 'Chileny',
      inventory: [],
      inventorySize: 12,
      equipment: [],
      host: false,
      gauges: {oxygen: 100, health: 100, thirst: 0}
    })];
  }

  getDeclaredVersion(): string | undefined {
    return '2.008';
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
