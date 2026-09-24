import {describe, expect, it} from 'bun:test';
import {selectWrittenFormatSave} from './selectWrittenFormatSave';
import {createSaveSections} from '../../../testing/createSaveSections';

describe('Select the save whose format the merge writes', () => {
  const legacyFormatAsked = true;
  const legacyFormatNotAsked = false;

  describe('When both saves carry the same format', () => {
    it.each([
      ['not asked', legacyFormatNotAsked],
      ['asked', legacyFormatAsked]
    ])('should select the main save, the legacy format being %s', (_legacyFormatRequest, preferLegacyFormat) => {
      // Arrange
      const mainSave = createSaveSections({formatRelease: '2.004'});
      const secondarySave = createSaveSections({formatRelease: '2.004'});

      // Act
      const writtenFormatSave = selectWrittenFormatSave(mainSave, secondarySave, preferLegacyFormat);

      // Assert
      expect(writtenFormatSave).toBe(mainSave);
    });
  });

  describe('When the two saves carry different formats and the legacy format is not asked for', () => {
    it.each([
      ['the main save', '1.618', '2.004'],
      ['the secondary save', '2.004', '1.618']
    ])('should select the save of the more recent release, %s being the legacy one', (_legacySave, mainFormatRelease, secondaryFormatRelease) => {
      // Arrange
      const mainSave = createSaveSections({formatRelease: mainFormatRelease});
      const secondarySave = createSaveSections({formatRelease: secondaryFormatRelease});

      // Act
      const writtenFormatSave = selectWrittenFormatSave(mainSave, secondarySave, legacyFormatNotAsked);

      // Assert
      expect(writtenFormatSave.formatRelease).toBe('2.004');
    });
  });

  describe('When the two saves carry different formats and the legacy format is asked for', () => {
    it.each([
      ['the main save', '1.618', '2.004'],
      ['the secondary save', '2.004', '1.618']
    ])('should select the save of the earlier release, %s being the legacy one', (_legacySave, mainFormatRelease, secondaryFormatRelease) => {
      // Arrange
      const mainSave = createSaveSections({formatRelease: mainFormatRelease});
      const secondarySave = createSaveSections({formatRelease: secondaryFormatRelease});

      // Act
      const writtenFormatSave = selectWrittenFormatSave(mainSave, secondarySave, legacyFormatAsked);

      // Assert
      expect(writtenFormatSave.formatRelease).toBe('1.618');
    });
  });
});
