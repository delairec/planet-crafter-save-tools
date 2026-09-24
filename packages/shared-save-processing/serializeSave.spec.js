/** @import { SerializeSaveParams } from './serializeSave.js' */
/** @import { CurrentFormatSections, LegacyFormatSections } from './gameDefinitions' */

import {describe, it, expect} from 'bun:test';
import {serializeSave, UnknownFormatReleaseError} from './serializeSave.js';
import {
  LEGACY_SPLIT_PARTS_COUNT,
  LEGACY_TERRAIN_LAYERS_SECTION_INDEX,
  PLAYERS_SECTION_INDEX,
  SAVE_CONFIGURATION_SECTION_INDEX,
  STATISTICS_SECTION_INDEX,
  TERRAFORMATION_LEVELS_SECTION_INDEX,
  WORLD_EVENTS_SECTION_INDEX,
  WORLD_OBJECTS_SECTION_INDEX
} from './sectionIndexes.js';
import {createPlayer, createSaveConfiguration, createStatistics, createTerraformationLevel} from './testing/createSaveRecords.js';
import {createFakeSaveString} from './testing/createFakeSaveString.js';
import {createFakeSaveContent, createLegacyFakeSaveContent} from './testing/createFakeSaveContent.js';
import {parseSaveSections} from './parseSaveSections.js';

/**
 * @param {string} save
 * @returns {SerializeSaveParams}
 */
function readBackSave(save) {
  const {sections, formatRelease} = parseSaveSections(save);
  const [metadata, terraformationLevels, players, worldObjects, inventories, statistics, mailboxes, storyEvents, saveConfigurations] = sections;
  const sectionsBeforeTerrainLayers = {
    formatRelease: String(formatRelease),
    metadata, terraformationLevels, players, worldObjects: [...worldObjects()], inventories, statistics, mailboxes,
    storyEvents, saveConfigurations
  };

  if (sections.length === LEGACY_SPLIT_PARTS_COUNT) {
    const [, , , , , , , , , terrainLayers, worldEvents] = /** @type {LegacyFormatSections} */ (sections);

    return {...sectionsBeforeTerrainLayers, terrainLayers, worldEvents};
  }

  const [, , , , , , , , , worldEvents] = /** @type {CurrentFormatSections} */ (sections);

  return {...sectionsBeforeTerrainLayers, worldEvents};
}

describe('serializeSave', () => {
  const SECTION_SEPARATOR = '\n@\n';
  const SAVE_TERMINATOR = '\n@';
  const noOptions = {};

  /** @type {SerializeSaveParams} */
  const emptyParams = {
    formatRelease: '2.004',
    metadata: [], terraformationLevels: [], players: [], worldObjects: [], inventories: [],
    statistics: [], mailboxes: [], storyEvents: [], saveConfigurations: [], worldEvents: []
  };

  it('should join all sections with the section separator and terminate the save', () => {
    // Arrange
    const separatorsBetweenSections = WORLD_EVENTS_SECTION_INDEX;
    const emptySave = SECTION_SEPARATOR.repeat(separatorsBetweenSections) + SAVE_TERMINATOR;

    // Act
    const result = serializeSave(emptyParams);

    // Assert
    expect(result).toBe(emptySave);
  });

  it('should serialize world objects as entries separated by the entry separator', () => {
    // Arrange
    const params = {...emptyParams, worldObjects: [{id: 1, gId: 'Iron'}, {id: 2, gId: 'Cobalt'}]};

    // Act
    const sections = serializeSave(params).split(SECTION_SEPARATOR);

    // Assert
    expect(sections[WORLD_OBJECTS_SECTION_INDEX]).toBe('{"id":1,"gId":"Iron"}|\n{"id":2,"gId":"Cobalt"}');
  });

  it('should preserve decimal notation for known float fields in world objects', () => {
    // Arrange
    const params = {...emptyParams, worldObjects: [{id: 1, gId: 'Tree', hunger: 50}]};

    // Act
    const sections = serializeSave(params).split(SECTION_SEPARATOR);

    // Assert
    expect(sections[WORLD_OBJECTS_SECTION_INDEX]).toBe('{"id":1,"gId":"Tree","hunger":50.0}');
  });

  describe('When statistics is empty', () => {
    it('should serialize the statistics section as an empty string', () => {
      // Act
      const sections = serializeSave(emptyParams).split(SECTION_SEPARATOR);

      // Assert
      expect(sections[STATISTICS_SECTION_INDEX]).toBe('');
    });
  });

  describe('When statistics has an entry', () => {
    it('should serialize that single entry', () => {
      // Arrange
      const params = {...emptyParams, statistics: [createStatistics()]};

      // Act
      const sections = serializeSave(params).split(SECTION_SEPARATOR);

      // Assert
      expect(sections[STATISTICS_SECTION_INDEX]).toBe('{"craftedObjects":10,"totalSaveFileLoad":5,"totalSaveFileTime":3600}');
    });
  });

  describe('When saveConfigurations is empty', () => {
    it('should serialize the save configuration section as an empty string', () => {
      // Act
      const sections = serializeSave(emptyParams).split(SECTION_SEPARATOR);

      // Assert
      expect(sections[SAVE_CONFIGURATION_SECTION_INDEX]).toBe('');
    });
  });

  describe('When saveConfigurations has an entry', () => {
    it('should serialize that single entry', () => {
      // Arrange
      const params = {...emptyParams, saveConfigurations: [createSaveConfiguration()]};

      // Act
      const sections = serializeSave(params).split(SECTION_SEPARATOR);

      // Assert
      expect(sections[SAVE_CONFIGURATION_SECTION_INDEX]).toBe('{"saveDisplayName":"Merged Save","planetId":"Toxicity","unlockedSpaceTrading":false,"unlockedOreExtrators":false,"unlockedTeleporters":false,"unlockedDrones":false,"unlockedAutocrafter":false,"unlockedEverything":false,"freeCraft":false,"preInterplanetarySave":false,"randomizeMineables":false,"modifierTerraformationPace":0.1,"modifierPowerConsumption":0.2,"modifierGaugeDrain":0.3,"modifierMeteoOccurence":0.4,"modifierMultiplayerTerraformationFactor":0.5,"modded":false,"version":"2.004","mode":"Standard","dyingConsequencesLabel":"DropSomeItems","startLocationLabel":"Standard","worldSeed":42,"hasPlayedIntro":true,"gameStartLocation":"Standard"}');
    });
  });

  it('should preserve decimal notation for known float fields in terraformation levels and players', () => {
    // Arrange
    const params = {...emptyParams, terraformationLevels: [createTerraformationLevel()], players: [createPlayer()]};

    // Act
    const sections = serializeSave(params).split(SECTION_SEPARATOR);

    // Assert
    expect(sections[TERRAFORMATION_LEVELS_SECTION_INDEX]).toBe('{"planetId":"Toxicity","unitOxygenLevel":100.0,"unitHeatLevel":200.0,"unitPressureLevel":300.0,"unitPlantsLevel":400.0,"unitInsectsLevel":500.0,"unitAnimalsLevel":600.0,"unitPurificationLevel":700.0}');
    expect(sections[PLAYERS_SECTION_INDEX]).toBe('{"id":76561190000000001,"name":"Nikowa","inventoryId":44,"equipmentId":45,"playerPosition":"1751.865,472.58,-1106.104","playerRotation":"0,0.5740051,0,-0.8188518","playerGaugeOxygen":280.0,"playerGaugeThirst":96.3858642578125,"playerGaugeHealth":72.67363739013672,"playerGaugeToxic":0.0,"host":true,"planetId":"Toxicity","cameraView":0,"totalCraftedObjects":1820,"totalTerraTokenEarned":9000}');
  });

  describe('When a save holding an int64 player identifier is read back', () => {
    it('should write the players section exactly as the save held it', () => {
      // Arrange
      const savedPlayersSection = '{"id":76561190000000007,"name":"Chileny","inventoryId":44,"equipmentId":45,"playerPosition":"0,0,0","playerRotation":"0,0,0,0","playerGaugeOxygen":280.0,"playerGaugeThirst":96.0,"playerGaugeHealth":72.0,"playerGaugeToxic":0.0,"host":true,"planetId":"Toxicity","cameraView":0,"totalCraftedObjects":0,"totalTerraTokenEarned":0}';
      const save = createFakeSaveString(noOptions)
        .split(SECTION_SEPARATOR)
        .with(PLAYERS_SECTION_INDEX, savedPlayersSection)
        .join(SECTION_SEPARATOR);
      const {sections: parsedSections} = parseSaveSections(save);

      // Act
      const result = serializeSave({...emptyParams, players: parsedSections[PLAYERS_SECTION_INDEX]});

      // Assert
      const sections = result.split(SECTION_SEPARATOR);
      expect(sections[PLAYERS_SECTION_INDEX]).toBe('{"id":76561190000000007,"name":"Chileny","inventoryId":44,"equipmentId":45,"playerPosition":"0,0,0","playerRotation":"0,0,0,0","playerGaugeOxygen":280.0,"playerGaugeThirst":96.0,"playerGaugeHealth":72.0,"playerGaugeToxic":0.0,"host":true,"planetId":"Toxicity","cameraView":0,"totalCraftedObjects":0,"totalTerraTokenEarned":0}');
    });
  });

  describe('When given the format of 1.618', () => {
    const terrainLayer = {layerId: 'PC-Toxicity-Layer2', planet: 110910045, colorBase: '0.5-0.5-0.5-1', colorCustom: '1-1-1-1', colorBaseLerp: 100, colorCustomLerp: 0};

    it('should write the twelve parts of that format, Terrain Layers entries at their legacy index', () => {
      // Act
      const sections = serializeSave({...emptyParams, formatRelease: '1.618', terrainLayers: [terrainLayer, terrainLayer]}).split(SECTION_SEPARATOR);

      // Assert
      expect(sections).toHaveLength(11);
      expect(sections[LEGACY_TERRAIN_LAYERS_SECTION_INDEX]).toBe(`${JSON.stringify(terrainLayer)}|\n${JSON.stringify(terrainLayer)}`);
    });

    it('should return the exact bytes of a save of 1.618 parsed then serialized', () => {
      // Arrange
      const save = createLegacyFakeSaveContent({terrainLayers: [terrainLayer, {...terrainLayer, layerId: 'PC-Humble-Layer1', colorBaseLerp: 101}]});

      // Act
      const result = serializeSave(readBackSave(save));

      // Assert
      expect(result).toBe(save);
    });
  });

  describe('When given the format of 2.004', () => {
    it('should return the exact bytes of a save of 2.004 parsed then serialized', () => {
      // Arrange
      const save = createFakeSaveContent();

      // Act
      const result = serializeSave(readBackSave(save));

      // Assert
      expect(result).toBe(save);
    });
  });

  describe('When given the format of a release the table does not hold', () => {
    it('should fail with an UnknownFormatReleaseError', () => {
      // Act
      const serializeUnknownFormat = () => serializeSave({...emptyParams, formatRelease: '0.9'});

      // Assert
      expect(serializeUnknownFormat).toThrow(UnknownFormatReleaseError);
    });
  });
});
