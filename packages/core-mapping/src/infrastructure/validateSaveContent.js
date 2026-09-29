/**
 * @import { SaveWarning, UnreadableSaveLine } from 'shared-save-processing/gameDefinitions'
 * @import { ValidationIssue } from '../application/ports/ValidationIssue'
 */

import {parseSaveSections} from 'shared-save-processing/parseSaveSections.js';
import {verifySectionCount} from 'shared-save-processing/verifySectionCount.js';
import {resolveSectionIndexes} from 'shared-save-processing/sectionIndexes.js';
import {UnknownFormatReleaseError} from 'shared-save-processing/gameReleases.js';
import {createSectionEntryValidator, findSaveFileSchema, validateSchemas} from './validateSchemas.js';
import {validateFloatSerialization} from './validateFloatSerialization.ts';
import {VALIDATION_ISSUE_CODES} from '../application/ports/ValidationIssue.ts';
import {locateSaveSection, locateUnreadableLine} from './locateSaveSection.ts';

/**
 * @param {string} saveContent
 * @returns {{isValid: boolean, errors: ValidationIssue[], warnings: SaveWarning[]}}
 */
export function validateSaveContent(saveContent) {
  const [sectionCountError] = verifySectionCount(saveContent.split('@'));
  if (sectionCountError !== undefined) {
    return {
      isValid: false,
      errors: [{
        code: VALIDATION_ISSUE_CODES.UNEXPECTED_SECTION_COUNT,
        foundSectionCount: sectionCountError.foundSectionCount,
        expectedSectionCounts: sectionCountError.expectedSectionCounts
      }],
      warnings: []
    };
  }

  const {formatRelease, sections, errors: parseErrors, warnings} = parseSaveSections(saveContent);
  if (formatRelease === undefined) {
    throw new UnknownFormatReleaseError(formatRelease);
  }

  const sectionIndexes = resolveSectionIndexes(formatRelease);
  const worldObjectIssues = validateWorldObjectsSection(
    /** @type {() => Generator<unknown>} */ (sections[sectionIndexes.worldObjects]),
    formatRelease,
    sectionIndexes.worldObjects
  );

  const errors = parseErrors.map(parseError => toInvalidJsonIssue(parseError, formatRelease));

  errors.push(...validateGlobalMetadataEntryCount(
    /** @type {unknown[]} */ (sections[sectionIndexes.globalMetadata]),
    formatRelease,
    sectionIndexes.globalMetadata
  ));
  errors.push(...validateSchemas(sections, formatRelease));
  errors.push(...worldObjectIssues);
  errors.push(...validateFloatSerialization(saveContent));

  return {isValid: errors.length === 0, errors, warnings};
}

/**
 * @param {unknown[]} globalMetadataSection
 * @param {string} formatRelease
 * @param {number} sectionIndex
 * @returns {ValidationIssue[]}
 */
function validateGlobalMetadataEntryCount(globalMetadataSection, formatRelease, sectionIndex) {
  const minItems = findSaveFileSchema(formatRelease).items[sectionIndex].minItems ?? 0;

  if (globalMetadataSection.length >= minItems) {
    return [];
  }

  return [{
    code: VALIDATION_ISSUE_CODES.TOO_FEW_SECTION_ENTRIES,
    section: locateSaveSection(sectionIndex, formatRelease),
    foundEntryCount: globalMetadataSection.length,
    minimumEntryCount: minItems
  }];
}

/**
 * @param {() => Generator<unknown>} createWorldObjects
 * @param {string} formatRelease
 * @param {number} sectionIndex
 * @returns {ValidationIssue[]}
 */
function validateWorldObjectsSection(createWorldObjects, formatRelease, sectionIndex) {
  const validateWorldObject = createSectionEntryValidator(formatRelease, sectionIndex);
  const issues = [];
  let entryIndex = 0;

  for (const worldObject of createWorldObjects()) {
    issues.push(...validateWorldObject(worldObject, entryIndex));
    entryIndex++;
  }

  return issues;
}

/**
 * @param {UnreadableSaveLine} parseError
 * @param {string} formatRelease
 * @returns {ValidationIssue}
 */
function toInvalidJsonIssue(parseError, formatRelease) {
  return {code: VALIDATION_ISSUE_CODES.INVALID_JSON, ...locateUnreadableLine(parseError, formatRelease)};
}
