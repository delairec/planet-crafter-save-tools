import {describe, expect, it} from 'bun:test';
import {createSectionEntryValidator, validateSchemas} from './validateSchemas.js';
import {UnexpectedSaveSectionError} from './errors/UnexpectedSaveSectionError.ts';
import {VALIDATION_ISSUE_CODES} from '../application/ports/ValidationIssue.ts';
import {LEGACY_TERRAIN_LAYERS_SECTION_INDEX, PLAYERS_SECTION_INDEX, STATISTICS_SECTION_INDEX, WORLD_OBJECTS_SECTION_INDEX} from 'shared-save-processing/sectionIndexes.js';
import {createFakeParsedSave} from 'shared-save-processing/testing/createFakeParsedSave.js';
import {createFakeSaveContent, createLegacyFakeSaveContent} from 'shared-save-processing/testing/createFakeSaveContent.js';
import {createPlayer, createTerrainLayer, createWorldEvent, createWorldObject} from 'shared-save-processing/testing/createSaveRecords.js';
import {parseSaveSections} from 'shared-save-processing/parseSaveSections.js';

describe('validateSchemas', () => {

  describe('When a section entry matches its schema', () => {
    it('should return no issue', () => {
      // Arrange
      const {sections, formatRelease} = createFakeParsedSave({players: [createPlayer()]});

      // Act
      const issues = validateSchemas(sections, formatRelease);

      // Assert
      expect(issues).toEqual([]);
    });
  });

  describe('When a section entry violates its schema', () => {
    it('should return a schema-violation issue located at its section and entry index', () => {
      // Arrange
      const {name: _, ...playerWithoutName} = createPlayer();
      // @ts-expect-error intentionally missing the required name to test validation
      const {sections} = createFakeParsedSave({players: [playerWithoutName]});

      // Act
      const issues = validateSchemas(sections, '2.004');

      // Assert
      expect(issues).toMatchObject([
        {code: VALIDATION_ISSUE_CODES.SCHEMA_VIOLATION, section: PLAYERS_SECTION_INDEX, entryIndex: 0, formatRelease: '2.004'}
      ]);
    });
  });

  describe('When the save carries the format of 1.618', () => {
    it('should validate its twelve parts, the Terrain Layers section included, without an issue the format alone produces', () => {
      // Arrange
      const {sections, formatRelease} = parseSaveSections(createLegacyFakeSaveContent());

      // Act
      const issues = validateSchemas(sections, formatRelease);

      // Assert
      expect(issues).toEqual([]);
    });
  });

  describe('When the save carries the format of 2.004', () => {
    it('should validate its eleven parts without an issue the format alone produces', () => {
      // Arrange
      const {sections, formatRelease} = parseSaveSections(createFakeSaveContent());

      // Act
      const issues = validateSchemas(sections, formatRelease);

      // Assert
      expect(issues).toEqual([]);
    });
  });

  describe('When a section holding entries did not reach it as a list', () => {
    it('should fail instead of reading it as a section without a single entry', () => {
      // Arrange
      const {sections, formatRelease} = createFakeParsedSave();
      // @ts-expect-error a section the reader always fills, emptied on purpose to reach the guard
      sections[STATISTICS_SECTION_INDEX] = undefined;

      // Act
      const validating = () => validateSchemas(sections, formatRelease);

      // Assert
      expect(validating).toThrow(UnexpectedSaveSectionError);
      expect(validating).toThrow('Unexpected save data: section 5 should hold a list of entries, received undefined.');
    });
  });
});

describe('createSectionEntryValidator', () => {

  describe('When a world object matches the schema of its section', () => {
    it('should return no issue for a DNA sequence whose hunger is negative', () => {
      // Arrange
      const validateWorldObject = createSectionEntryValidator('2.004', WORLD_OBJECTS_SECTION_INDEX);
      const dnaSequence = createWorldObject({id: 2481, gId: 'DNASequence', hunger: -100, grwth: 3});

      // Act
      const issues = validateWorldObject(dnaSequence, 0);

      // Assert
      expect(issues).toEqual([]);
    });

    it('should return no issue for an exchange platform naming the planet of its linked inventory', () => {
      // Arrange
      const validateWorldObject = createSectionEntryValidator('2.004', WORLD_OBJECTS_SECTION_INDEX);
      const exchangePlatform = createWorldObject({
        id: 2423, gId: 'InterplanetaryExchangePlatform1', pos: '1,2,3', planet: -1140328421, liId: 2422, liPlanet: -1291310150
      });

      // Act
      const issues = validateWorldObject(exchangePlatform, 0);

      // Assert
      expect(issues).toEqual([]);
    });
  });

  describe('When a world object violates the schema of its section', () => {
    it('should return a schema-violation issue located at the world objects section of its format and the position of the entry', () => {
      // Arrange
      const validateWorldObject = createSectionEntryValidator('1.618', WORLD_OBJECTS_SECTION_INDEX);
      const {gId: _, ...worldObjectWithoutGameId} = createWorldObject();
      const positionInTheSection = 4;

      // Act
      const issues = validateWorldObject(worldObjectWithoutGameId, positionInTheSection);

      // Assert
      expect(issues).toMatchObject([
        {code: VALIDATION_ISSUE_CODES.SCHEMA_VIOLATION, section: WORLD_OBJECTS_SECTION_INDEX, entryIndex: positionInTheSection, formatRelease: '1.618'}
      ]);
    });
  });

  describe('When the index is the one the format of 1.618 gives the Terrain Layers section', () => {
    it('should accept a layer entry', () => {
      // Arrange
      const validateLegacyIndex9 = createSectionEntryValidator('1.618', LEGACY_TERRAIN_LAYERS_SECTION_INDEX);

      // Act
      const issues = validateLegacyIndex9(createTerrainLayer(), 0);

      // Assert
      expect(issues).toEqual([]);
    });

    it('should reject a world event', () => {
      // Arrange
      const validateLegacyIndex9 = createSectionEntryValidator('1.618', LEGACY_TERRAIN_LAYERS_SECTION_INDEX);

      // Act
      const issues = validateLegacyIndex9(createWorldEvent(), 0);

      // Assert
      expect(issues).toMatchObject([
        {code: VALIDATION_ISSUE_CODES.SCHEMA_VIOLATION, section: LEGACY_TERRAIN_LAYERS_SECTION_INDEX, entryIndex: 0, formatRelease: '1.618'}
      ]);
    });
  });
});
