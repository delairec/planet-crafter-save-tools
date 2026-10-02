/**
 * @import { UnreadableSaveLine } from './wireFormat/gameDefinitions'
 * @import { SaveWarning } from '../domain/validation/SaveWarning'
 * @import { ValidationIssue } from '../domain/validation/ValidationIssue'
 */

import {parseSaveSections} from './wireFormat/parseSaveSections.js';
import {verifySectionCount} from './wireFormat/verifySectionCount.js';
import {resolveSectionIndexes, SAVE_CONFIGURATION_SECTION_INDEX} from './wireFormat/sectionIndexes.js';
import {createSectionEntryValidator, findSaveFileSchema, validateSchemas} from './validateSchemas.js';
import {validateFloatSerialization} from './validateFloatSerialization.ts';
import {mapSaveWarning} from './mapSaveWarning.ts';
import {VALIDATION_ISSUE_CODES} from '../domain/validation/validationIssueCodes.ts';
import {locateSaveSection} from './locateSaveSection.ts';
import {locateUnreadableLine} from './locateUnreadableLine.ts';

/**
 * @param {string} saveContent
 * @returns {{isValid: boolean, errors: ValidationIssue[], warnings: SaveWarning[], declaredVersion?: string, carriedRelease?: string}}
 */
export function validateSaveContent(saveContent) {
  const [sectionCountError] = verifySectionCount(saveContent);
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

  const parsedSave = parseSaveSections(saveContent);
  const formatRelease = /** @type {string} */ (parsedSave.formatRelease);
  const {sections, errors: parseErrors} = parsedSave;
  const warnings = parsedSave.warnings.map(mapSaveWarning);

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

  const declaredVersion = readDeclaredVersion(
    /** @type {unknown[]} */ (sections[SAVE_CONFIGURATION_SECTION_INDEX])
  );

  return {isValid: errors.length === 0, errors, warnings, declaredVersion, carriedRelease: formatRelease};
}

/**
 * @param {unknown[]} saveConfigurationSection
 * @returns {string | undefined}
 */
function readDeclaredVersion(saveConfigurationSection) {
  const [saveConfiguration] = saveConfigurationSection;

  if (typeof saveConfiguration !== 'object' || saveConfiguration === null) {
    return undefined;
  }

  const {version} = /** @type {{version?: unknown}} */ (saveConfiguration);

  return typeof version === 'string' ? version : undefined;
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
  return {...locateUnreadableLine(parseError, formatRelease), code: VALIDATION_ISSUE_CODES.INVALID_JSON};
}
