import {describe, expect, it} from 'bun:test';
import {mergeSaveSections} from './mergeSaveSections';
import {createGlobalMetadata, createSaveConfiguration} from 'shared-save-processing/testing/createSaveRecords.js';
import {createSaveSections} from '../../../testing/createSaveSections';

describe('Determine save order', () => {
  const mergeOptions = {saveDisplayName: 'SAVE_NAME', preferLegacyFormat: false};

  const primeConfig = createSaveConfiguration({planetId: 'Prime'});
  const toxicityConfig = createSaveConfiguration({planetId: 'Toxicity'});
  const aqualisConfig = createSaveConfiguration({planetId: 'Aqualis'});

  describe('When only the second save has Prime as planetId', () => {
    it('should return the Prime save as save A', () => {
      // Arrange
      const saveA = createSaveSections({saveConfigurations: [toxicityConfig]});
      const saveB = createSaveSections({saveConfigurations: [primeConfig]});

      // Act
      const result = mergeSaveSections(saveA, saveB, mergeOptions);

      // Assert
      expect(result.saveConfiguration?.planetId).toBe('Prime');
    });
  });

  describe('When only the first save has Prime as planetId', () => {
    it('should keep the Prime save as save A', () => {
      // Arrange
      const saveA = createSaveSections({saveConfigurations: [primeConfig]});
      const saveB = createSaveSections({saveConfigurations: [toxicityConfig]});

      // Act
      const result = mergeSaveSections(saveA, saveB, mergeOptions);

      // Assert
      expect(result.saveConfiguration?.planetId).toBe('Prime');
    });
  });

  describe('When neither save has Prime as planetId', () => {
    it('should return saves in the original order', () => {
      // Arrange
      const saveA = createSaveSections({saveConfigurations: [toxicityConfig]});
      const saveB = createSaveSections({saveConfigurations: [aqualisConfig]});

      // Act
      const result = mergeSaveSections(saveA, saveB, mergeOptions);

      // Assert
      expect(result.saveConfiguration?.planetId).toBe('Toxicity');
    });
  });

  describe('When both saves have Prime as planetId', () => {
    it('should return saves in the original order', () => {
      // Arrange
      const saveA = createSaveSections({saveConfigurations: [createSaveConfiguration({planetId: 'Prime', worldSeed: 1})]});
      const saveB = createSaveSections({saveConfigurations: [createSaveConfiguration({planetId: 'Prime', worldSeed: 2})]});

      // Act
      const result = mergeSaveSections(saveA, saveB, mergeOptions);

      // Assert
      expect(result.saveConfiguration?.worldSeed).toBe(1);
    });
  });

  describe('When a save has no configuration', () => {
    it('should still promote the Prime save to save A', () => {
      // Arrange
      const saveA = createSaveSections({globalMetadata: [createGlobalMetadata({openedInstanceSeed: 1})]});
      const saveB = createSaveSections({
        globalMetadata: [createGlobalMetadata({openedInstanceSeed: 2})],
        saveConfigurations: [primeConfig]
      });

      // Act
      const result = mergeSaveSections(saveA, saveB, mergeOptions);

      // Assert
      expect(result.globalMetadata.openedInstanceSeed).toBe(2);
    });
  });
});
