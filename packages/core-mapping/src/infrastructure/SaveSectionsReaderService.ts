import {Player, TerraformationLevel} from 'shared-save-processing/gameDefinitions';
import {SaveSectionsReaderPort} from '../application/ports/SaveSectionsReaderPort';
import {InventoryEntry} from '../domain/save/InventoryEntry';
import {SaveSections} from '../domain/save/SaveSections';
import {WorldObjectEntry} from '../domain/save/WorldObjectEntry';
import {GlobalProgressionValueObject, createGlobalProgressionValueObject} from "../domain/valueObjects/GlobalProgressionValueObject";
import {PlayerEntity} from "../domain/entities/PlayerEntity";
import {TerraformationLevelEntity} from '../domain/entities/TerraformationLevelEntity';
import {InventoryEntity} from "../domain/entities/InventoryEntity";
import {WorldObjectEntity} from "../domain/entities/WorldObjectEntity";
import {PlacedWorldObjectEntity} from "../domain/entities/PlacedWorldObjectEntity";
import {StatisticsValueObject, createStatisticsValueObject} from "../domain/valueObjects/StatisticsValueObject";
import {SaveConfigurationValueObject, createSaveConfigurationValueObject} from "../domain/valueObjects/SaveConfigurationValueObject";
import {
  EnergyLevelsRawDataValueObject,
  PlanetWorldObjectsValueObject,
  createEnergyLevelsRawDataValueObject,
  createPlanetWorldObjectsValueObject
} from "../domain/valueObjects/EnergyLevelsRawDataValueObject";
import {WorldObjectName} from "../domain/worldObjectNames";
import {resolvePlanetName} from "../domain/rules/resolvePlanetName";

function parsePosition(position: string): [number, number, number] {
  const [x, y, z] = position.split(',').map(Number);
  return [x, y, z];
}

export class SaveSectionsReaderService implements SaveSectionsReaderPort {

  constructor(private readonly sections: SaveSections) {
  }

  getGlobalProgression(): GlobalProgressionValueObject {
    const metadata = this.sections.globalMetadata[0];

    if (!metadata) {
      return createGlobalProgressionValueObject({
        allTimeTerraTokens: 0
      });
    }

    return createGlobalProgressionValueObject({
      allTimeTerraTokens: metadata.allTimeTerraTokens,
      logisticsPaused: metadata.logisticsPaused
    });
  }

  getPlayers(): PlayerEntity[] {
    const inventories = this.mapInventories();

    return this.sections.players.map((player: Player): PlayerEntity => {
      const playerInventory = inventories.find(inventory => inventory.id === player.inventoryId);
      const playerEquipment = inventories.find(inventory => inventory.id === player.equipmentId);

      const playerInventoryIds = playerInventory?.worldObjectIds ?? [];
      const playerEquipmentIds = playerEquipment?.worldObjectIds ?? [];
      const worldObjects = this.findWorldObjectByIds([...playerInventoryIds, ...playerEquipmentIds]);

      return new PlayerEntity({
        name: player.name,
        inventory: playerInventoryIds.map((id) => worldObjects.find((worldObject) => worldObject.id === id)?.name ?? id),
        equipment: playerEquipmentIds.map((id) => worldObjects.find((worldObject) => worldObject.id === id)?.name ?? id)
      });
    });
  }

  getTerraformationLevels(): TerraformationLevelEntity[] {
    return this.sections.terraformationLevels.map((level: TerraformationLevel): TerraformationLevelEntity => new TerraformationLevelEntity({
      planetId: level.planetId,
      unitOxygenLevel: level.unitOxygenLevel,
      unitHeatLevel: level.unitHeatLevel,
      unitPressureLevel: level.unitPressureLevel,
      unitPlantsLevel: level.unitPlantsLevel,
      unitInsectsLevel: level.unitInsectsLevel,
      unitAnimalsLevel: level.unitAnimalsLevel,
      unitPurificationLevel: level.unitPurificationLevel
    }));
  }

  getStatistics(): StatisticsValueObject | undefined {
    return this.sections.statistics.map((statistics) => createStatisticsValueObject({
      totalCraftedObjects: statistics.craftedObjects
    }))[0];
  }

  getSaveConfiguration(): SaveConfigurationValueObject | undefined {
    return this.sections.saveConfigurations.map((saveConfiguration) => createSaveConfigurationValueObject({
      title: saveConfiguration.saveDisplayName,
      mode: saveConfiguration.mode,
      modifiers: {
        terraformationPace: saveConfiguration.modifierTerraformationPace,
        powerConsumption: saveConfiguration.modifierPowerConsumption,
        gaugeDrain: saveConfiguration.modifierGaugeDrain,
        meteoOccurrence: saveConfiguration.modifierMeteoOccurence,
        multiplayerFactor: saveConfiguration.modifierMultiplayerTerraformationFactor
      }
    }))[0];
  }

  getEnergyLevelsRawData(): EnergyLevelsRawDataValueObject {
    const allWorldObjects = this.sections.worldObjects;
    const positionedWorldObjects = allWorldObjects.filter(
      (worldObject) => worldObject.pos !== undefined && worldObject.planet !== undefined
    );

    const placedWorldObjectsByPlanet = new Map<number, { raw: WorldObjectEntry; entity: PlacedWorldObjectEntity }[]>();
    for (const worldObject of positionedWorldObjects) {
      const entity = this.toPlacedWorldObjectEntity(worldObject);
      const planetId = entity.planetId;
      const worldObjectsOnPlanet = placedWorldObjectsByPlanet.get(planetId) ?? [];
      worldObjectsOnPlanet.push({raw: worldObject, entity});
      placedWorldObjectsByPlanet.set(planetId, worldObjectsOnPlanet);
    }

    // Energy Fuses live inside an Optimizer's inventory and are never themselves positioned, so
    // the fuse lookup needs every world object in the save, not just positioned/placed ones.
    const allWorldObjectEntities: WorldObjectEntity[] = allWorldObjects.map((worldObject) => new WorldObjectEntity({
      id: String(worldObject.id),
      name: worldObject.gId as WorldObjectName
    }));
    const inventories = this.mapInventories();
    const knownPlanetNames = [...new Set(this.sections.terraformationLevels.map((level) => level.planetId))];

    const planets: PlanetWorldObjectsValueObject[] = [...placedWorldObjectsByPlanet.entries()]
      .map(([planetId, placedWorldObjectsOnPlanet]) => {
        const rawWorldObjectsOnPlanet = placedWorldObjectsOnPlanet.map(({raw}) => raw);
        const entitiesOnPlanet = placedWorldObjectsOnPlanet.map(({entity}) => entity);

        return createPlanetWorldObjectsValueObject({
          planetId,
          planetName: resolvePlanetName(
            planetId,
            rawWorldObjectsOnPlanet.map((worldObject) => worldObject.gId),
            knownPlanetNames
          ),
          placedWorldObjects: entitiesOnPlanet
        });
      });

    return createEnergyLevelsRawDataValueObject({
      allWorldObjects: allWorldObjectEntities,
      inventories,
      planets,
      declaredVersion: this.sections.saveConfigurations[0]?.version,
      powerConsumptionModifier: this.sections.saveConfigurations[0]?.modifierPowerConsumption
    });
  }

  private toPlacedWorldObjectEntity(worldObject: WorldObjectEntry): PlacedWorldObjectEntity {
    return new PlacedWorldObjectEntity({
      id: String(worldObject.id),
      name: worldObject.gId as WorldObjectName,
      position: parsePosition(worldObject.pos!),
      planetId: worldObject.planet!,
      inventoryId: worldObject.liId
    });
  }

  private mapInventories(): InventoryEntity[] {
    return this.sections.inventories.map((inventory: InventoryEntry): InventoryEntity => new InventoryEntity({
      id: inventory.id,
      worldObjectIds: inventory.woIds.map(String),
      size: inventory.size
    }));
  }

  private findWorldObjectByIds(ids: string[]): WorldObjectEntity[] {
    const result: WorldObjectEntity[] = [];
    for (const worldObject of this.sections.worldObjects) {
      if (ids.includes(String(worldObject.id))) {
        result.push(new WorldObjectEntity({id: String(worldObject.id), name: worldObject.gId as WorldObjectName}));
      }
    }
    return result;
  }
}
