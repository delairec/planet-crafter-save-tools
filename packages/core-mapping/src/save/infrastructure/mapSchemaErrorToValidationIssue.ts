import type {SaveEntryField, SaveSectionLocation} from "../domain/save/SaveSectionLocation";
import type {ValidationIssue} from "../domain/validation/ValidationIssue";
import {VALIDATION_ISSUE_CODES} from "../domain/validation/validationIssueCodes";
import {UnknownSchemaConstraintError} from "./errors/UnknownSchemaConstraintError";

export interface SectionEntrySchemaError {
  readonly instancePath: string;
  readonly keyword: string;
  readonly params: Readonly<Record<string, unknown>>;
}

type SchemaErrorParams = SectionEntrySchemaError['params'];

type ValidationIssueBuilder = (field: SaveEntryField, params: SchemaErrorParams) => ValidationIssue;

const validationIssueBuildersBySchemaKeyword = new Map<string, ValidationIssueBuilder>([
  ['type', (field, params) => ({code: VALIDATION_ISSUE_CODES.FIELD_OF_WRONG_TYPE, ...field, expectedType: String(params.type)})],
  ['required', (field, params) => ({code: VALIDATION_ISSUE_CODES.MISSING_FIELD, ...field, missingFieldName: String(params.missingProperty)})],
  ['additionalProperties', (field, params) => ({code: VALIDATION_ISSUE_CODES.UNEXPECTED_FIELD, ...field, unexpectedFieldName: String(params.additionalProperty)})],
  ['minimum', (field, params) => ({code: VALIDATION_ISSUE_CODES.VALUE_BELOW_MINIMUM, ...field, minimum: Number(params.limit)})],
  ['maximum', (field, params) => ({code: VALIDATION_ISSUE_CODES.VALUE_ABOVE_MAXIMUM, ...field, maximum: Number(params.limit)})],
  ['pattern', (field, params) => ({code: VALIDATION_ISSUE_CODES.VALUE_NOT_MATCHING_PATTERN, ...field, pattern: String(params.pattern)})],
  ['dependencies', (field, params) => ({
    code: VALIDATION_ISSUE_CODES.MISSING_DEPENDENT_FIELD,
    ...field,
    missingFieldName: String(params.missingProperty),
    dependingFieldName: String(params.property)
  })]
]);

export function mapSchemaErrorToValidationIssue(schemaError: SectionEntrySchemaError, section: SaveSectionLocation, entryIndex: number): ValidationIssue {
  const buildValidationIssue = validationIssueBuildersBySchemaKeyword.get(schemaError.keyword);

  if (buildValidationIssue === undefined) {
    throw new UnknownSchemaConstraintError(schemaError.keyword);
  }

  return buildValidationIssue({section, entryIndex, fieldPath: schemaError.instancePath}, schemaError.params);
}
