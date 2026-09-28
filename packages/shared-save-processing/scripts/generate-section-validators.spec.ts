import {describe, expect, it} from 'bun:test';
import {generateSectionValidators} from './generate-section-validators.ts';
import {SECTION_VALIDATORS_PATH} from './sectionValidatorsFile.ts';
import {createFakeSectionValidatorsFileIo} from './testing/createFakeSectionValidatorsFileIo.ts';

const versionedSectionValidators = await Bun.file(SECTION_VALIDATORS_PATH).text();

describe('generateSectionValidators', () => {

  describe('When the JSON Schemas of shared-save-processing are those the versioned module was generated from', () => {
    it('should write that module again, byte for byte', async () => {
      // Arrange
      const noVersionedSource = null;
      const {io, writtenSources} = createFakeSectionValidatorsFileIo(noVersionedSource);

      // Act
      await generateSectionValidators(io);

      // Assert
      expect(writtenSources).toEqual([versionedSectionValidators]);
    });
  });
});
