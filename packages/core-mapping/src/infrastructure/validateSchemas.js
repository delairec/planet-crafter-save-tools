/**
 * @import { ParsedSections } from 'shared-save-processing/gameDefinitions'
 * @import { ValidationIssue } from '../application/ports/ValidationIssue.ts'
 * @import { ValidateFunction } from 'ajv'
 */

import Ajv from 'ajv';
import schema0 from 'shared-save-processing/schemas/section0-player-progression.schema.json' with {type: 'json'};
import schema1 from 'shared-save-processing/schemas/section1-terraformation-levels.schema.json' with {type: 'json'};
import schema2 from 'shared-save-processing/schemas/section2-players.schema.json' with {type: 'json'};
import schema3 from 'shared-save-processing/schemas/section3-world-objects.schema.json' with {type: 'json'};
import schema4 from 'shared-save-processing/schemas/section4-inventories.schema.json' with {type: 'json'};
import schema5 from 'shared-save-processing/schemas/section5-statistics.schema.json' with {type: 'json'};
import schema6 from 'shared-save-processing/schemas/section6-messages.schema.json' with {type: 'json'};
import schema7 from 'shared-save-processing/schemas/section7-story-events.schema.json' with {type: 'json'};
import schema8 from 'shared-save-processing/schemas/section8-save-config.schema.json' with {type: 'json'};
import schema9 from 'shared-save-processing/schemas/section9-world-events.schema.json' with {type: 'json'};
import legacyTerrainLayersSchema from 'shared-save-processing/schemas/legacy-section9-terrain-layers.schema.json' with {type: 'json'};
import saveFileSchema from 'shared-save-processing/schemas/save-file.schema.json' with {type: 'json'};
import legacySaveFileSchema from 'shared-save-processing/schemas/legacy-save-file.schema.json' with {type: 'json'};
import {findSplitPartsCount, UnknownFormatReleaseError} from 'shared-save-processing/gameReleases.js';
import {resolveSectionIndexes} from 'shared-save-processing/sectionIndexes.js';
import {VALIDATION_ISSUE_CODES} from '../application/ports/ValidationIssue.ts';
import {UnexpectedSaveSectionError} from './errors/UnexpectedSaveSectionError.ts';

const SECTION_SCHEMAS = [schema0, schema1, schema2, schema3, schema4, schema5, schema6, schema7, schema8, schema9, legacyTerrainLayersSchema];

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

/** @type {Ajv | undefined} */
let sectionSchemasAjv;

/** @returns {Ajv} */
function getSectionSchemasAjv() {
  if (!sectionSchemasAjv) {
    sectionSchemasAjv = new Ajv();

    for (const sectionSchema of SECTION_SCHEMAS) {
      sectionSchemasAjv.addSchema(sectionSchema, sectionSchema.$id);
    }
  }

  return sectionSchemasAjv;
}

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
 * @returns {ValidateFunction}
 */
function getSectionValidator(formatRelease, sectionIndex) {
  const sectionSchemaId = findSaveFileSchema(formatRelease).items[sectionIndex]?.items?.$ref;
  const validate = sectionSchemaId === undefined ? undefined : getSectionSchemasAjv().getSchema(sectionSchemaId);

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
