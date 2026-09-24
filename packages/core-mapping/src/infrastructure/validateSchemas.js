/**
 * @import { ParsedSections } from 'shared-save-processing/gameDefinitions'
 * @import { ValidationIssue } from '../application/ports/ValidationIssue.ts'
 */

import saveFileSchema from 'shared-save-processing/schemas/save-file.schema.json' with {type: 'json'};
import legacySaveFileSchema from 'shared-save-processing/schemas/legacy-save-file.schema.json' with {type: 'json'};
import {findSplitPartsCount, UnknownFormatReleaseError} from 'shared-save-processing/gameReleases.js';
import {resolveSectionIndexes} from 'shared-save-processing/sectionIndexes.js';
import {VALIDATION_ISSUE_CODES} from '../application/ports/ValidationIssue.ts';
import {UnexpectedSaveSectionError} from './errors/UnexpectedSaveSectionError.ts';
import {SECTION_VALIDATORS_BY_SCHEMA_ID} from './sectionValidators.generated.js';

/**
 * @typedef {object} SaveFileSectionSchema
 * @property {number} [minItems]
 * @property {{$ref: string}} [items]
 */

/**
 * @typedef {object} SaveFileSchema
 * @property {number} maxItems
 * @property {SaveFileSectionSchema[]} items
 */

const SAVE_FILE_SCHEMAS = /** @type {SaveFileSchema[]} */ ([saveFileSchema, legacySaveFileSchema]);

/**
 * @typedef {object} SectionEntrySchemaError
 * @property {string} instancePath
 * @property {string} [message]
 */

/**
 * @typedef {((entry: unknown) => boolean) & {errors?: SectionEntrySchemaError[] | null}} SectionEntryValidator
 */

const SECTION_VALIDATORS = /** @type {Record<string, SectionEntryValidator | undefined>} */ (SECTION_VALIDATORS_BY_SCHEMA_ID);

/**
 * @param {string | undefined} formatRelease
 * @returns {SaveFileSchema}
 * @throws {UnknownFormatReleaseError}
 */
export function findSaveFileSchema(formatRelease) {
  const splitPartsCount = formatRelease === undefined ? undefined : findSplitPartsCount(formatRelease);
  const saveFileSchemaOfFormat = SAVE_FILE_SCHEMAS.find((schema) => schema.maxItems === splitPartsCount);

  if (saveFileSchemaOfFormat === undefined) {
    throw new UnknownFormatReleaseError(formatRelease);
  }

  return saveFileSchemaOfFormat;
}

/**
 * @param {string | undefined} formatRelease
 * @param {number} sectionIndex
 * @returns {SectionEntryValidator}
 */
function getSectionValidator(formatRelease, sectionIndex) {
  const sectionSchemaId = findSaveFileSchema(formatRelease).items[sectionIndex]?.items?.$ref;
  const validate = sectionSchemaId === undefined ? undefined : SECTION_VALIDATORS[sectionSchemaId];

  if (validate === undefined) {
    throw new Error(`No schema describes the entries of section ${sectionIndex} in the format of ${formatRelease}`);
  }

  return validate;
}

/**
 * @param {ParsedSections | unknown[][]} parsedSections
 * @param {string | undefined} formatRelease
 * @returns {ValidationIssue[]}
 * @throws {UnexpectedSaveSectionError} when a section that should hold a list of entries does not.
 * The reader of the format guarantees it does, so this is a broken invariant of ours and never a
 * malformed save.
 */
export function validateSchemas(parsedSections, formatRelease) {
  const worldObjectsSectionIndex = resolveSectionIndexes(formatRelease).worldObjects;
  const issues = [];

  findSaveFileSchema(formatRelease).items.forEach((sectionSchema, sectionIndex) => {
    if (sectionSchema.items === undefined || sectionIndex === worldObjectsSectionIndex) {
      return;
    }

    const entries = parsedSections[sectionIndex];

    if (!Array.isArray(entries)) {
      throw new UnexpectedSaveSectionError(sectionIndex, entries);
    }

    const validateEntry = createSectionEntryValidator(formatRelease, sectionIndex);

    entries.forEach((entry, entryIndex) => {
      issues.push(...validateEntry(entry, entryIndex));
    });
  });

  return issues;
}

/**
 * @param {string | undefined} formatRelease
 * @param {number} sectionIndex
 * @returns {(entry: unknown, entryIndex: number) => ValidationIssue[]}
 */
export function createSectionEntryValidator(formatRelease, sectionIndex) {
  const validate = getSectionValidator(formatRelease, sectionIndex);

  return (entry, entryIndex) => {
    if (validate(entry)) {
      return [];
    }

    return (validate.errors ?? []).map(schemaError => ({
      code: VALIDATION_ISSUE_CODES.SCHEMA_VIOLATION,
      detail: `${schemaError.instancePath} ${schemaError.message}`.trim(),
      section: sectionIndex,
      entryIndex,
      formatRelease
    }));
  };
}
