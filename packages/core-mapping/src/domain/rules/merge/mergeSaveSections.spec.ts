import {describe, expect, it} from 'bun:test';
import {mergeSaveSections} from './mergeSaveSections';
import {createPlayerEntry, createSaveConfigurationEntry, createTerrainLayerEntry} from '../../../testing/createSaveEntries';
import {createSaveSections} from '../../../testing/createSaveSections';
import {InventoryEntry} from '../../save/InventoryEntry';
import {WorldObjectEntry} from '../../save/WorldObjectEntry';

describe('Merge saves', () => {
  const mergeOptions = {saveDisplayName: 'SAVE_NAME', preferLegacyFormat: false};
  const legacyMergeOptions = {saveDisplayName: 'SAVE_NAME', preferLegacyFormat: true};
  const legacySaveSections = createSaveSections({formatRelease: '1.618', terrainLayers: [createTerrainLayerEntry()]});
  const currentSaveSections = createSaveSections({formatRelease: '2.004'});

  describe('When both saves carry entries in the sections holding identifiers', () => {
    it('should keep the origin of players, inventories and world objects', () => {
      // Arrange
      const playerFromSaveA = createPlayerEntry({host: false, id: '1', name: 'PlayerA', inventoryId: 10, equipmentId: 11});
      const playerFromSaveB = createPlayerEntry({host: false, id: '2', name: 'PlayerB', inventoryId: 20, equipmentId: 21});
      const inventoryFromSaveA: InventoryEntry = {id: 10, worldObjectIds: [], size: 20};
      const inventoryFromSaveB: InventoryEntry = {id: 20, worldObjectIds: [], size: 20};
      const worldObjectFromSaveA: WorldObjectEntry = {id: 100, groupId: 'Container2', position: '1,0,1'};
      const worldObjectFromSaveB: WorldObjectEntry = {id: 200, groupId: 'VegetubeOutside1', position: '5,0,5'};

      const sectionsA = createSaveSections({
        players: [playerFromSaveA],
        inventories: [inventoryFromSaveA],
        worldObjects: [worldObjectFromSaveA]
      });
      const sectionsB = createSaveSections({
        players: [playerFromSaveB],
        inventories: [inventoryFromSaveB],
        worldObjects: [worldObjectFromSaveB]
      });

      // Act
      const result = mergeSaveSections(sectionsA, sectionsB, mergeOptions);

      // Assert
      expect(result.sections.players).toEqual({fromSaveA: [playerFromSaveA], fromSaveB: [playerFromSaveB]});
      expect(result.sections.inventories).toEqual({fromSaveA: [inventoryFromSaveA], fromSaveB: [inventoryFromSaveB]});
      expect(result.sections.worldObjects).toEqual({fromSaveA: [worldObjectFromSaveA], fromSaveB: [worldObjectFromSaveB]});
    });
  });

  describe('When the two saves carry different formats', () => {
    it('should carry the format written, its Terrain Layers section and the version of the save whose format it is', () => {
      // Arrange
      const layerOfSaveA = createTerrainLayerEntry({layerId: 'PC-Toxicity-Layer1'});
      const sectionsA = createSaveSections({
        formatRelease: '1.618', terrainLayers: [layerOfSaveA], saveConfigurations: [createSaveConfigurationEntry({version: '1.618'})]
      });
      const sectionsB = createSaveSections({formatRelease: '2.004', saveConfigurations: [createSaveConfigurationEntry({version: '2.103'})]});

      // Act
      const result = mergeSaveSections(sectionsA, sectionsB, mergeOptions);

      // Assert
      expect(result.sections.formatRelease).toBe('2.004');
      expect(result.sections.terrainLayers).toBeUndefined();
      expect(result.sections.saveConfiguration?.version).toBe('2.103');
    });

    it('should report the format written and the Terrain Layers section writing it dropped', () => {
      // Act
      const result = mergeSaveSections(legacySaveSections, currentSaveSections, mergeOptions);

      // Assert
      expect(result.warnings).toEqual([
        {code: 'merged-save-format', formatRelease: '2.004'},
        {code: 'merged-save-section-dropped', section: 'terrainLayers'}
      ]);
    });

    it('should state that the legacy format could have been kept', () => {
      // Act
      const result = mergeSaveSections(legacySaveSections, currentSaveSections, mergeOptions);

      // Assert
      expect(result.legacyFormatCouldBeKept).toBe(true);
    });

    describe('When the save carrying the later format is on Prime', () => {
      it('should report the format written and the Terrain Layers section writing it dropped', () => {
        // Arrange
        const currentSaveOnPrime = createSaveSections({formatRelease: '2.004', saveConfigurations: [createSaveConfigurationEntry({planetId: 'Prime'})]});
        const legacySaveOnToxicity = createSaveSections({
          formatRelease: '1.618', terrainLayers: [createTerrainLayerEntry()], saveConfigurations: [createSaveConfigurationEntry({planetId: 'Toxicity'})]
        });

        // Act
        const result = mergeSaveSections(legacySaveOnToxicity, currentSaveOnPrime, mergeOptions);

        // Assert
        expect(result.warnings).toEqual([
          {code: 'merged-save-format', formatRelease: '2.004'},
          {code: 'merged-save-section-dropped', section: 'terrainLayers'}
        ]);
      });
    });

    describe('When the merge asks for the legacy format', () => {
      it('should report the legacy format written, no section dropped, and the content the earlier release may not know', () => {
        // Act
        const result = mergeSaveSections(legacySaveSections, currentSaveSections, legacyMergeOptions);

        // Assert
        expect(result.warnings).toEqual([
          {code: 'merged-save-format', formatRelease: '1.618'},
          {code: 'merged-save-content-newer-than-format', formatRelease: '1.618', contentRelease: '2.004'}
        ]);
      });

      it('should not state that the legacy format could have been kept, the merge having kept it', () => {
        // Act
        const result = mergeSaveSections(legacySaveSections, currentSaveSections, legacyMergeOptions);

        // Assert
        expect(result.legacyFormatCouldBeKept).toBe(false);
      });
    });
  });

  describe('When the two saves carry the same format', () => {
    it.each([
      {legacyFormat: 'not asked for', options: mergeOptions},
      {legacyFormat: 'asked for', options: legacyMergeOptions}
    ])('should report nothing on the format, the legacy format $legacyFormat', ({options}) => {
      // Act
      const result = mergeSaveSections(legacySaveSections, legacySaveSections, options);

      // Assert
      expect(result.warnings).toEqual([]);
    });

    it('should not state that the legacy format could have been kept, no format being lost', () => {
      // Act
      const result = mergeSaveSections(legacySaveSections, legacySaveSections, mergeOptions);

      // Assert
      expect(result.legacyFormatCouldBeKept).toBe(false);
    });
  });
});
