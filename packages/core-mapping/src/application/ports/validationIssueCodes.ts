import type {ValidationIssueCode} from "./ValidationIssue";

export const VALIDATION_ISSUE_CODES = {
  UNEXPECTED_SECTION_COUNT: 'unexpected-section-count',
  TOO_FEW_SECTION_ENTRIES: 'too-few-section-entries',
  INVALID_JSON: 'invalid-json',
  SCHEMA_VIOLATION: 'schema-violation',
  FLOAT_SERIALIZATION: 'float-serialization'
} as const satisfies Record<string, ValidationIssueCode>;
