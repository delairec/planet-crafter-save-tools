import {describe, expect, it} from 'bun:test';
import {mergeSaveSections} from './mergeSaveSections';
import {createGlobalMetadataEntry, createSaveConfigurationEntry} from '../../../testing/createSaveEntries';
import {createSaveSections} from '../../../testing/createSaveSections';

describe('Determine save order', () => {
  const mergeOptions = {saveDisplayName: 'SAVE_NAME', preferLegacyFormat: false};

  const primeConfig = createSaveConfigurationEntry({planetId: 'Prime'});
  const toxicityConfig = createSaveConfigurationEntry({planetId: 'Toxicity'});
  const aqualisConfig = createSaveConfigurationEntry({planetId: 'Aqualis'});

  describe('When only the second save has Prime as planetId', () => {
    it('should return the Prime save as save A', () => {
      // Arrange
      const saveA = createSaveSections({saveConfigurations: [toxicityConfig]});
      const saveB = createSaveSections({saveConfigurations: [primeConfig]});

      // Act
      const result = mergeSaveSections(saveA, saveB, mergeOptions);

      // Assert
      expect(result.sections.saveConfiguration?.planetId).toBe('Prime');
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
      expect(result.sections.saveConfiguration?.planetId).toBe('Prime');
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
      expect(result.sections.saveConfiguration?.planetId).toBe('Toxicity');
    });
  });

  describe('When both saves have Prime as planetId', () => {
    it('should return saves in the original order', () => {
      // Arrange
      const saveA = createSaveSections({saveConfigurations: [createSaveConfigurationEntry({planetId: 'Prime', worldSeed: 1})]});
      const saveB = createSaveSections({saveConfigurations: [createSaveConfigurationEntry({planetId: 'Prime', worldSeed: 2})]});

      // Act
      const result = mergeSaveSections(saveA, saveB, mergeOptions);

      // Assert
      expect(result.sections.saveConfiguration?.worldSeed).toBe(1);
    });
  });

  describe('When a save has no configuration', () => {
    it('should still promote the Prime save to save A', () => {
      // Arrange
      const saveA = createSaveSections({globalMetadata: [createGlobalMetadataEntry({openedInstanceSeed: 1})]});
      const saveB = createSaveSections({
        globalMetadata: [createGlobalMetadataEntry({openedInstanceSeed: 2})],
        saveConfigurations: [primeConfig]
      });

      // Act
      const result = mergeSaveSections(saveA, saveB, mergeOptions);

      // Assert
      expect(result.sections.globalMetadata.openedInstanceSeed).toBe(2);
    });
  });
});
