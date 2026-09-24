import {parseSaveSections} from 'shared-save-processing/parseSaveSections.js';
import {verifySectionCount} from 'shared-save-processing/verifySectionCount.js';
import {GLOBAL_METADATA_SECTION_INDEX, PLAYERS_SECTION_INDEX, WORLD_OBJECTS_SECTION_INDEX} from 'shared-save-processing/sectionIndexes.js';
import saveFileSchema from 'shared-save-processing/schemas/save-file.schema.json' with {type: 'json'};
import {validateSchemas, validateSectionEntry} from './validateSchemas.js';
import {selectCurrentFormatSections} from './selectCurrentFormatSections.ts';
import {validateFloatSerialization} from './validateFloatSerialization.ts';
import {validateUniqueHost} from '../domain/rules/validateUniqueHost.ts';
import {VALIDATION_ISSUE_CODES} from '../application/ports/ValidationIssue.ts';

/**
 * Validates a Planet Crafter save string: JSON schema compliance for each section, plus
 * domain-specific rules. A save of 1.618 and earlier (still carrying the Terrain Layers section a
 * later game update removed) is validated on the sections the format of 2.004 shares with it, and
 * reported through `warnings` instead of an error.
 *
 * Reading the save is delegated to `parseSaveSections`, the single reader of the format: a
 * validator tolerating the format differently from the reader used by loading and merging is what
 * once let a lost section pass for a valid save.
 *
 * @param {string} saveContent
 * @returns {{isValid: boolean, errors: import('../application/ports/ValidationIssue').ValidationIssue[], warnings: import('shared-save-processing/gameDefinitions').SaveWarning[]}}
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

  const {sections: parsedSections, errors: parseErrors, warnings} = parseSaveSections(saveContent);
  const sections = selectCurrentFormatSections(parsedSections);
  const worldObjectIssues = validateWorldObjectsSection(sections[WORLD_OBJECTS_SECTION_INDEX]);

  const errors = parseErrors.map(toInvalidJsonIssue);

  errors.push(...validateGlobalMetadataEntryCount(sections[GLOBAL_METADATA_SECTION_INDEX]));
  errors.push(...validateSchemas(sections));
  errors.push(...worldObjectIssues);
  errors.push(...validateFloatSerialization(saveContent));

  const uniqueHostViolation = validateUniqueHost(sections[PLAYERS_SECTION_INDEX]);
  if (uniqueHostViolation !== null) {
    errors.push(toUniqueHostIssue(uniqueHostViolation));
  }

  return {isValid: errors.length === 0, errors, warnings};
}

/**
 * @param {import('../domain/rules/validateUniqueHost').UniqueHostViolation} violation
 * @returns {import('../application/ports/ValidationIssue').ValidationIssue}
 */
function toUniqueHostIssue({hostCount}) {
  return {
    code: VALIDATION_ISSUE_CODES.UNIQUE_HOST,
    detail: `Expected exactly one host player, found ${hostCount}`
  };
}

/**
 * @param {unknown[]} globalMetadataSection
 * @returns {import('../application/ports/ValidationIssue').ValidationIssue[]}
 */
function validateGlobalMetadataEntryCount(globalMetadataSection) {
  const minItems = saveFileSchema.items[GLOBAL_METADATA_SECTION_INDEX].minItems ?? 0;

  if (globalMetadataSection.length >= minItems) {
    return [];
  }

  return [{
    code: VALIDATION_ISSUE_CODES.INVALID_STRUCTURE,
    detail: `Expected at least ${minItems} entry but found ${globalMetadataSection.length}`,
    section: GLOBAL_METADATA_SECTION_INDEX
  }];
}

/**
 * The world objects section is a generator, so both the lines it cannot read and the entries
 * breaking its schema are only discovered once it has been walked. Each entry is checked as it
 * goes past and none is kept: a single entry at a time is held in memory, whatever the size of the
 * section — 28425 objects on the largest of the reference saves in `input/`.
 * @param {() => Generator<unknown>} createWorldObjects
 * @returns {import('../application/ports/ValidationIssue').ValidationIssue[]}
 */
function validateWorldObjectsSection(createWorldObjects) {
  const issues = [];
  let entryIndex = 0;

  for (const worldObject of createWorldObjects()) {
    issues.push(...validateSectionEntry(WORLD_OBJECTS_SECTION_INDEX, worldObject, entryIndex));
    entryIndex++;
  }

  return issues;
}

/**
 * The section count is verified before parsing, so every error the reader reports from here on
 * concerns a line it could not read.
 * @param {import('shared-save-processing/gameDefinitions').SaveParseError} parseError
 * @returns {import('../application/ports/ValidationIssue').ValidationIssue}
 */
function toInvalidJsonIssue({detail, section, entryIndex}) {
  return {code: VALIDATION_ISSUE_CODES.INVALID_JSON, detail, section, entryIndex};
}
