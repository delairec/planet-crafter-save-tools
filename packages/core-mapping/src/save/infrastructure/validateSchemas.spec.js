import {describe, expect, it} from 'bun:test';
import {createSectionEntryValidator, validateSchemas} from './validateSchemas.js';
import {MissingSectionEntrySchemaError} from './errors/MissingSectionEntrySchemaError.ts';
import {UnexpectedSaveSectionError} from './errors/UnexpectedSaveSectionError.ts';
import {UnknownSaveFormatReleaseError} from './errors/UnknownSaveFormatReleaseError.ts';
import {VALIDATION_ISSUE_CODES} from '../domain/validation/validationIssueCodes.ts';
import {LEGACY_TERRAIN_LAYERS_SECTION_INDEX, PLAYERS_SECTION_INDEX, RESERVED_TRAILING_SECTION_INDEX, STATISTICS_SECTION_INDEX, WORLD_OBJECTS_SECTION_INDEX} from './wireFormat/sectionIndexes.js';
import {createFakeParsedSave} from './wireFormat/testing/createFakeParsedSave.js';
import {createFakeSaveContent, createLegacyFakeSaveContent} from './wireFormat/testing/createFakeSaveContent.js';
import {createPlayer, createTerrainLayer, createWorldEvent, createWorldObject} from './wireFormat/testing/createSaveRecords.js';
import {parseSaveSections} from './wireFormat/parseSaveSections.js';

/** @returns {Generator<never>} */
const NO_WORLD_OBJECTS = function* () {};

describe('validateSchemas', () => {

  describe('When a section entry matches its schema', () => {
    it('should return no issue', () => {
      // Arrange
      const {sections} = createFakeParsedSave({worldObjects: NO_WORLD_OBJECTS, players: [createPlayer()]});

      // Act
      const issues = validateSchemas(sections, '2.004');

      // Assert
      expect(issues).toEqual([]);
    });
  });

  describe('When a section entry violates its schema', () => {
    it('should return the issue of the constraint it breaks, located at its section and entry index', () => {
      // Arrange
      const {name: _, ...playerWithoutName} = createPlayer();
      // @ts-expect-error intentionally missing the required name to test validation
      const {sections} = createFakeParsedSave({worldObjects: NO_WORLD_OBJECTS, players: [playerWithoutName]});

      // Act
      const issues = validateSchemas(sections, '2.004');

      // Assert
      expect(issues).toMatchObject([
        {code: VALIDATION_ISSUE_CODES.MISSING_FIELD, section: {name: 'players', index: PLAYERS_SECTION_INDEX}, entryIndex: 0, fieldPath: ''}
      ]);
    });
  });

  describe('When the save carries the format of 1.618', () => {
    it('should validate its twelve parts, the Terrain Layers section included, without an issue the format alone produces', () => {
      // Arrange
      const {sections} = parseSaveSections(createLegacyFakeSaveContent());

      // Act
      const issues = validateSchemas(sections, '1.618');

      // Assert
      expect(issues).toEqual([]);
    });
  });

  describe('When the save carries the format of 2.004', () => {
    it('should validate its eleven parts without an issue the format alone produces', () => {
      // Arrange
      const {sections} = parseSaveSections(createFakeSaveContent());

      // Act
      const issues = validateSchemas(sections, '2.004');

      // Assert
      expect(issues).toEqual([]);
    });
  });

  describe('When a section holding entries did not reach it as a list', () => {
    it('should fail instead of reading it as a section without a single entry', () => {
      // Arrange
      const {sections} = createFakeParsedSave({worldObjects: NO_WORLD_OBJECTS});
      // @ts-expect-error a section the reader always fills, emptied on purpose to reach the guard
      sections[STATISTICS_SECTION_INDEX] = undefined;

      // Act
      const validating = () => validateSchemas(sections, '2.004');

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
    it('should return the issue of the constraint it breaks, located at the world objects section of its format and the position of the entry', () => {
      // Arrange
      const validateWorldObject = createSectionEntryValidator('1.618', WORLD_OBJECTS_SECTION_INDEX);
      const {gId: _, ...worldObjectWithoutGameId} = createWorldObject();
      const positionInTheSection = 4;

      // Act
      const issues = validateWorldObject(worldObjectWithoutGameId, positionInTheSection);

      // Assert
      expect(issues).toMatchObject([
        {code: VALIDATION_ISSUE_CODES.MISSING_FIELD, section: {name: 'worldObjects', index: WORLD_OBJECTS_SECTION_INDEX}, entryIndex: positionInTheSection, fieldPath: ''}
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
        {code: VALIDATION_ISSUE_CODES.MISSING_FIELD, section: {name: 'terrainLayers', index: LEGACY_TERRAIN_LAYERS_SECTION_INDEX}, entryIndex: 0}
      ]);
    });
  });

  describe('When the format is none of those a save file schema describes', () => {
    it('should fail with the error naming the unknown format', () => {
      // Arrange
      const unknownFormatRelease = '0.9';

      // Act
      const creating = () => createSectionEntryValidator(unknownFormatRelease, PLAYERS_SECTION_INDEX);

      // Assert
      expect(creating).toThrow(UnknownSaveFormatReleaseError);
    });
  });

  describe('When the index is the trailing part the terminating @ leaves empty', () => {
    it('should fail with the error naming the part no schema describes', () => {
      // Act
      const creating = () => createSectionEntryValidator('2.004', RESERVED_TRAILING_SECTION_INDEX);

      // Assert
      expect(creating).toThrow(MissingSectionEntrySchemaError);
    });
  });
});
