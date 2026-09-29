import type {ValidationIssueCode} from "./ValidationIssue";

export const VALIDATION_ISSUE_CODES = {
  UNEXPECTED_SECTION_COUNT: 'unexpected-section-count',
  TOO_FEW_SECTION_ENTRIES: 'too-few-section-entries',
  INVALID_JSON: 'invalid-json',
  FIELD_OF_WRONG_TYPE: 'field-of-wrong-type',
  MISSING_FIELD: 'missing-field',
  UNEXPECTED_FIELD: 'unexpected-field',
  VALUE_BELOW_MINIMUM: 'value-below-minimum',
  VALUE_ABOVE_MAXIMUM: 'value-above-maximum',
  VALUE_NOT_MATCHING_PATTERN: 'value-not-matching-pattern',
  MISSING_DEPENDENT_FIELD: 'missing-dependent-field',
  FLOAT_SERIALIZATION: 'float-serialization'
} as const satisfies Record<string, ValidationIssueCode>;
