import {describe, expect, it} from 'bun:test';
import {mergeSaveSections} from './mergeSaveSections';
import {createSaveConfiguration} from 'shared-save-processing/testing/createSaveRecords.js';
import {createDecodedSections} from '../../../testing/createDecodedSections';

describe('Merge saves — #determineSaveOrder', () => {
    const saveDisplayName = 'SAVE_NAME';

    const primeConfig = createSaveConfiguration({saveDisplayName: 'SavePrime', planetId: 'Prime'});
    const toxicityConfig = createSaveConfiguration({saveDisplayName: 'SaveToxicity', planetId: 'Toxicity'});
    const aqualisConfig = createSaveConfiguration({saveDisplayName: 'SaveAqualis', planetId: 'Aqualis'});

    describe('When only the second save has Prime as planetId', () => {
        it('should return the Prime save as save A', () => {
            // Arrange
            const saveA = createDecodedSections({saveConfigurations: [toxicityConfig]});
            const saveB = createDecodedSections({saveConfigurations: [primeConfig]});

            // Act
            const result = mergeSaveSections(saveA, saveB, saveDisplayName);

            // Assert
            expect(result.saveConfiguration).toEqual({...primeConfig, saveDisplayName: 'SAVE_NAME'});
        });
    });

    describe('When only the first save has Prime as planetId', () => {
        it('should keep the Prime save as save A', () => {
            // Arrange
            const saveA = createDecodedSections({saveConfigurations: [primeConfig]});
            const saveB = createDecodedSections({saveConfigurations: [toxicityConfig]});

            // Act
            const result = mergeSaveSections(saveA, saveB, saveDisplayName);

            // Assert
            expect(result.saveConfiguration).toEqual({...primeConfig, saveDisplayName: 'SAVE_NAME'});
        });
    });

    describe('When neither save has Prime as planetId', () => {
        it('should return saves in the original order', () => {
            // Arrange
            const saveA = createDecodedSections({saveConfigurations: [toxicityConfig]});
            const saveB = createDecodedSections({saveConfigurations: [aqualisConfig]});

            // Act
            const result = mergeSaveSections(saveA, saveB, saveDisplayName);

            // Assert
            expect(result.saveConfiguration).toEqual({...toxicityConfig, saveDisplayName: 'SAVE_NAME'});
        });
    });

    describe('When both saves have Prime as planetId', () => {
        it('should return saves in the original order', () => {
            // Arrange
            const saveA = createDecodedSections({saveConfigurations: [{...primeConfig, worldSeed: 1}]});
            const saveB = createDecodedSections({saveConfigurations: [{...primeConfig, worldSeed: 2}]});

            // Act
            const result = mergeSaveSections(saveA, saveB, saveDisplayName);

            // Assert
            expect(result.saveConfiguration).toEqual({...primeConfig, worldSeed: 1, saveDisplayName: 'SAVE_NAME'});
        });
    });

    describe('When a save has no configuration', () => {
        it('should still promote the Prime save to save A', () => {
            // Arrange
            const saveA = createDecodedSections();
            const saveB = createDecodedSections({saveConfigurations: [primeConfig]});

            // Act
            const result = mergeSaveSections(saveA, saveB, saveDisplayName);

            // Assert
            expect(result.saveConfiguration).toEqual({...primeConfig, saveDisplayName: 'SAVE_NAME'});
        });
    });
});
