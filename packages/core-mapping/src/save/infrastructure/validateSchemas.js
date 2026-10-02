/**
 * @import { ParsedSections } from './wireFormat/gameDefinitions'
 * @import { ValidationIssue } from '../domain/validation/ValidationIssue.ts'
 * @import { SectionEntrySchemaError } from './mapSchemaErrorToValidationIssue.ts'
 */

import saveFileSchema from './wireFormat/schemas/save-file.schema.json' with {type: 'json'};
import legacySaveFileSchema from './wireFormat/schemas/legacy-save-file.schema.json' with {type: 'json'};
import {findSplitPartsCount} from './wireFormat/gameReleases.js';
import {resolveSectionIndexes} from './wireFormat/sectionIndexes.js';
import {locateSaveSection} from './locateSaveSection.ts';
import {mapSchemaErrorToValidationIssue} from './mapSchemaErrorToValidationIssue.ts';
import {UnexpectedSaveSectionError} from './errors/UnexpectedSaveSectionError.ts';
import {UnknownSaveFormatReleaseError} from './errors/UnknownSaveFormatReleaseError.ts';
import {MissingSectionEntrySchemaError} from './errors/MissingSectionEntrySchemaError.ts';
import {SECTION_VALIDATORS_BY_SCHEMA_ID} from './wireFormat/sectionValidators.generated.js';

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
 * @typedef {((entry: unknown) => boolean) & {errors?: SectionEntrySchemaError[] | null}} SectionEntryValidator
 */

const SECTION_VALIDATORS = /** @type {Record<string, SectionEntryValidator | undefined>} */ (SECTION_VALIDATORS_BY_SCHEMA_ID);

/**
 * @param {string | undefined} formatRelease
 * @returns {SaveFileSchema}
 */
export function findSaveFileSchema(formatRelease) {
  const splitPartsCount = formatRelease === undefined ? undefined : findSplitPartsCount(formatRelease);
  const saveFileSchemaOfFormat = SAVE_FILE_SCHEMAS.find((schema) => schema.maxItems === splitPartsCount);

  if (saveFileSchemaOfFormat === undefined) {
    throw new UnknownSaveFormatReleaseError(formatRelease);
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
    throw new MissingSectionEntrySchemaError(sectionIndex, formatRelease);
  }

  return validate;
}

/**
 * @param {ParsedSections | unknown[][]} parsedSections
 * @param {string} formatRelease
 * @returns {ValidationIssue[]}
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
 * @param {string} formatRelease
 * @param {number} sectionIndex
 * @returns {(entry: unknown, entryIndex: number) => ValidationIssue[]}
 */
export function createSectionEntryValidator(formatRelease, sectionIndex) {
  const validate = getSectionValidator(formatRelease, sectionIndex);
  const section = locateSaveSection(sectionIndex, formatRelease);

  return (entry, entryIndex) => {
    if (validate(entry)) {
      return [];
    }

    return (validate.errors ?? []).map(schemaError => mapSchemaErrorToValidationIssue(schemaError, section, entryIndex));
  };
}
