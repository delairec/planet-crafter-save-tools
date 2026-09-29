import type {SaveSectionLocation} from "./SaveSectionLocation";

export type ValidationIssue =
  | {code: 'invalid-extension'}
  | {code: 'unexpected-section-count'; foundSectionCount: number; expectedSectionCounts: number[]}
  | {code: 'too-few-section-entries'; section: SaveSectionLocation; foundEntryCount: number; minimumEntryCount: number}
  | {code: 'invalid-json'; section: SaveSectionLocation; entryIndex: number; line: string}
  | {code: 'schema-violation'; section: SaveSectionLocation; entryIndex: number; fieldPath: string; schemaMessage: string | undefined}
  | {code: 'float-serialization'; fieldName: string; serializedValue: string};

export type ValidationIssueCode = ValidationIssue['code'];
