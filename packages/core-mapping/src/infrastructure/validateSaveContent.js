/**
 * @import { SaveParseError, SaveWarning } from 'shared-save-processing/gameDefinitions'
 * @import { ValidationIssue } from '../application/ports/ValidationIssue'
 * @import { UniqueHostViolation } from '../domain/rules/validateUniqueHost'
 */

import {parseSaveSections} from 'shared-save-processing/parseSaveSections.js';
import {verifySectionCount} from 'shared-save-processing/verifySectionCount.js';
import {resolveSectionIndexes} from 'shared-save-processing/sectionIndexes.js';
import {createSectionEntryValidator, findSaveFileSchema, validateSchemas} from './validateSchemas.js';
import {validateFloatSerialization} from './validateFloatSerialization.ts';
import {validateUniqueHost} from '../domain/rules/validateUniqueHost.ts';
import {VALIDATION_ISSUE_CODES} from '../application/ports/ValidationIssue.ts';

/**
 * @param {string} saveContent
 * @returns {{isValid: boolean, errors: ValidationIssue[], warnings: SaveWarning[]}}
 */
export function validateSaveContent(saveContent) {
  const sectionCountErrors = verifySectionCount(saveContent.split('@'));
  if (sectionCountErrors.length > 0) {
    return {
      isValid: false,
      errors: [{code: VALIDATION_ISSUE_CODES.INVALID_STRUCTURE, detail: sectionCountErrors[0].detail}],
      warnings: []
    };
  }

  const {formatRelease, sections, errors: parseErrors, warnings} = parseSaveSections(saveContent);
  const sectionIndexes = resolveSectionIndexes(formatRelease);
  const worldObjectIssues = validateWorldObjectsSection(
    /** @type {() => Generator<unknown>} */ (sections[sectionIndexes.worldObjects]),
    formatRelease,
    sectionIndexes.worldObjects
  );

  const errors = parseErrors.map(toInvalidJsonIssue);

  errors.push(...validateGlobalMetadataEntryCount(
    /** @type {unknown[]} */ (sections[sectionIndexes.globalMetadata]),
    formatRelease,
    sectionIndexes.globalMetadata
  ));
  errors.push(...validateSchemas(sections, formatRelease));
  errors.push(...worldObjectIssues);
  errors.push(...validateFloatSerialization(saveContent));

  const uniqueHostViolation = validateUniqueHost(/** @type {Parameters<typeof validateUniqueHost>[0]} */ (sections[sectionIndexes.players]));
  if (uniqueHostViolation !== null) {
    errors.push(toUniqueHostIssue(uniqueHostViolation));
  }

  return {isValid: errors.length === 0, errors, warnings};
}

/**
 * @param {UniqueHostViolation} violation
 * @returns {ValidationIssue}
 */
function toUniqueHostIssue({hostCount}) {
  return {
    code: VALIDATION_ISSUE_CODES.UNIQUE_HOST,
    detail: `Expected exactly one host player, found ${hostCount}`
  };
}

/**
 * @param {unknown[]} globalMetadataSection
 * @param {string | undefined} formatRelease
 * @param {number} sectionIndex
 * @returns {ValidationIssue[]}
 */
function validateGlobalMetadataEntryCount(globalMetadataSection, formatRelease, sectionIndex) {
  const minItems = findSaveFileSchema(formatRelease).items[sectionIndex].minItems ?? 0;

  if (globalMetadataSection.length >= minItems) {
    return [];
  }

  return [{
    code: VALIDATION_ISSUE_CODES.INVALID_STRUCTURE,
    detail: `Expected at least ${minItems} entry but found ${globalMetadataSection.length}`,
    section: sectionIndex,
    formatRelease
  }];
}

/**
 * @param {() => Generator<unknown>} createWorldObjects
 * @param {string | undefined} formatRelease
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
 * @param {SaveParseError} parseError
 * @returns {ValidationIssue}
 */
function toInvalidJsonIssue({detail, section, entryIndex, formatRelease}) {
  return {code: VALIDATION_ISSUE_CODES.INVALID_JSON, detail, section, entryIndex, formatRelease};
}
