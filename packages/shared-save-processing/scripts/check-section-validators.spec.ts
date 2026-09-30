import {describe, expect, it} from 'bun:test';
import {checkSectionValidators, findSectionValidatorsDivergence} from './check-section-validators.ts';
import {SECTION_VALIDATORS_PATH} from './sectionValidatorsFile.ts';
import {createFakeSectionValidatorsFileIo} from './testing/createFakeSectionValidatorsFileIo.ts';

const DIVERGED_VALIDATORS_REASON = 'regenerating them from the JSON Schemas of shared-save-processing does not reproduce the versioned module: run bun run generate:section-validators and commit what it writes';
const MISSING_VALIDATORS_REASON = 'the repository does not carry the generated module: run bun run generate:section-validators and commit what it writes';
const versionedSectionValidators = await Bun.file(SECTION_VALIDATORS_PATH).text();

describe('findSectionValidatorsDivergence', () => {

  describe('When the generator reproduces the versioned module', () => {
    it('should report nothing', () => {
      // Arrange
      const sameSource = 'export const validateSection2Players = validate10;\n';

      // Act
      const divergence = findSectionValidatorsDivergence({regeneratedSource: sameSource, versionedSource: sameSource});

      // Assert
      expect(divergence).toBeNull();
    });
  });

  describe('When the versioned module differs from what the generator writes', () => {
    it('should report the command that settles the difference', () => {
      // Act
      const divergence = findSectionValidatorsDivergence({
        regeneratedSource: 'export const validateSection2Players = validate10;\n',
        versionedSource: 'export const validateSection2Players = validate11;\n'
      });

      // Assert
      expect(divergence).toBe(DIVERGED_VALIDATORS_REASON);
    });
  });

  describe('When the versioned module differs by a single trailing character', () => {
    it('should report it, the comparison being made byte for byte', () => {
      // Act
      const divergence = findSectionValidatorsDivergence({
        regeneratedSource: 'export const validateSection2Players = validate10;\n',
        versionedSource: 'export const validateSection2Players = validate10;'
      });

      // Assert
      expect(divergence).toBe(DIVERGED_VALIDATORS_REASON);
    });
  });

  describe('When the repository does not carry the generated module', () => {
    it('should report the command that writes it', () => {
      // Arrange
      const noVersionedSource = null;

      // Act
      const divergence = findSectionValidatorsDivergence({
        regeneratedSource: 'export const validateSection2Players = validate10;\n',
        versionedSource: noVersionedSource
      });

      // Assert
      expect(divergence).toBe(MISSING_VALIDATORS_REASON);
    });
  });
});

describe('checkSectionValidators', () => {

  describe('When the versioned module is the one the JSON Schemas generate', () => {
    it('should print that the versioned section validators match and exit with zero', async () => {
      // Arrange
      const {io, printed, printedErrors, exitCodes} = createFakeSectionValidatorsFileIo(versionedSectionValidators);

      // Act
      await checkSectionValidators(io);

      // Assert
      expect({printed, printedErrors, exitCodes}).toEqual({
        printed: ['check:section-validators: the versioned section validators match the JSON Schemas.'],
        printedErrors: [],
        exitCodes: [0]
      });
    });
  });

  describe('When the versioned module no longer matches the JSON Schemas', () => {
    it('should print the module and the command that settles the difference on the error output, and exit with one', async () => {
      // Arrange
      const {io, printed, printedErrors, exitCodes} = createFakeSectionValidatorsFileIo('export const validateSection2Players = validate11;\n');

      // Act
      await checkSectionValidators(io);

      // Assert
      expect({printed, printedErrors, exitCodes}).toEqual({
        printed: [],
        printedErrors: [`check:section-validators: ${SECTION_VALIDATORS_PATH}\n  ${DIVERGED_VALIDATORS_REASON}`],
        exitCodes: [1]
      });
    });
  });
});
