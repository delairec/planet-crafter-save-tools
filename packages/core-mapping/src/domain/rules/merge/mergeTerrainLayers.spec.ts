import {describe, expect, it} from 'bun:test';
import {mergeTerrainLayers} from './mergeTerrainLayers';
import {TerrainLayer} from 'shared-save-processing/gameDefinitions';
import {createTerrainLayer} from 'shared-save-processing/testing/createSaveRecords.js';
import {createSaveSections} from '../../../testing/createSaveSections';

describe('Merge terrain layers', () => {
  const layerOfMainSave = createTerrainLayer({layerId: 'PC-Toxicity-Layer1'});
  const layerOfSecondarySave = createTerrainLayer({layerId: 'PC-Toxicity-Layer2'});

  describe('When the format written carries no Terrain Layers section', () => {
    it('should drop the section', () => {
      // Arrange
      const mainSave = createSaveSections({formatRelease: '1.618', terrainLayers: [layerOfMainSave]});
      const secondarySave = createSaveSections({formatRelease: '2.004'});

      // Act
      const terrainLayers = mergeTerrainLayers(mainSave, secondarySave, secondarySave);

      // Assert
      expect(terrainLayers).toBeUndefined();
    });
  });

  describe('When the format written carries the Terrain Layers section', () => {
    it('should take the entries of the main save when both saves carry it', () => {
      // Arrange
      const mainSave = createSaveSections({formatRelease: '1.618', terrainLayers: [layerOfMainSave]});
      const secondarySave = createSaveSections({formatRelease: '1.618', terrainLayers: [layerOfSecondarySave]});

      // Act
      const terrainLayers = mergeTerrainLayers(mainSave, secondarySave, mainSave);

      // Assert
      expect<TerrainLayer[] | undefined>(terrainLayers).toEqual([{
        layerId: 'PC-Toxicity-Layer1', planet: 110910045, colorBase: '0.5-0.5-0.5-1', colorCustom: '1-1-1-1',
        colorBaseLerp: 100, colorCustomLerp: 0
      }]);
    });

    it('should take the entries of the main save when it alone carries it', () => {
      // Arrange
      const mainSave = createSaveSections({formatRelease: '1.618', terrainLayers: [layerOfMainSave]});
      const secondarySave = createSaveSections({formatRelease: '2.004'});

      // Act
      const terrainLayers = mergeTerrainLayers(mainSave, secondarySave, mainSave);

      // Assert
      expect<TerrainLayer[] | undefined>(terrainLayers).toEqual([{
        layerId: 'PC-Toxicity-Layer1', planet: 110910045, colorBase: '0.5-0.5-0.5-1', colorCustom: '1-1-1-1',
        colorBaseLerp: 100, colorCustomLerp: 0
      }]);
    });

    it('should take the entries of the secondary save when it alone carries it', () => {
      // Arrange
      const mainSave = createSaveSections({formatRelease: '2.004'});
      const secondarySave = createSaveSections({formatRelease: '1.618', terrainLayers: [layerOfSecondarySave]});

      // Act
      const terrainLayers = mergeTerrainLayers(mainSave, secondarySave, secondarySave);

      // Assert
      expect<TerrainLayer[] | undefined>(terrainLayers).toEqual([{
        layerId: 'PC-Toxicity-Layer2', planet: 110910045, colorBase: '0.5-0.5-0.5-1', colorCustom: '1-1-1-1',
        colorBaseLerp: 100, colorCustomLerp: 0
      }]);
    });
  });
});
