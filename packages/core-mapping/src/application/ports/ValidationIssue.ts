import type {SaveSectionLocation, UnreadableLine} from "./SaveSectionLocation";

export const VALIDATION_ISSUE_CODES = {
  INVALID_EXTENSION: 'invalid-extension',
  UNEXPECTED_SECTION_COUNT: 'unexpected-section-count',
  TOO_FEW_SECTION_ENTRIES: 'too-few-section-entries',
  INVALID_JSON: 'invalid-json',
  SCHEMA_VIOLATION: 'schema-violation',
  FLOAT_SERIALIZATION: 'float-serialization'
} as const;

export type ValidationIssue =
  | {code: typeof VALIDATION_ISSUE_CODES.INVALID_EXTENSION}
  | {code: typeof VALIDATION_ISSUE_CODES.UNEXPECTED_SECTION_COUNT; foundSectionCount: number; expectedSectionCounts: number[]}
  | {code: typeof VALIDATION_ISSUE_CODES.TOO_FEW_SECTION_ENTRIES; section: SaveSectionLocation; foundEntryCount: number; minimumEntryCount: number}
  | {code: typeof VALIDATION_ISSUE_CODES.INVALID_JSON} & UnreadableLine
  | {code: typeof VALIDATION_ISSUE_CODES.SCHEMA_VIOLATION; section: SaveSectionLocation; entryIndex: number; fieldPath: string; schemaMessage: string | undefined}
  | {code: typeof VALIDATION_ISSUE_CODES.FLOAT_SERIALIZATION; fieldName: string; serializedValue: string};

export type ValidationIssueCode = ValidationIssue['code'];
