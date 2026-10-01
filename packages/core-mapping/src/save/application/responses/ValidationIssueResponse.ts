import type {SaveSectionLocationResponse} from "./SaveSectionLocationResponse";
import type {UnreadableLineResponse} from "./UnreadableLineResponse";

interface SaveEntryFieldResponse {
  readonly section: SaveSectionLocationResponse;
  readonly entryIndex: number;
  readonly fieldPath: string;
}

export type ValidationIssueResponse =
  | {readonly code: 'unexpected-section-count'; readonly foundSectionCount: number; readonly expectedSectionCounts: number[]}
  | {readonly code: 'too-few-section-entries'; readonly section: SaveSectionLocationResponse; readonly foundEntryCount: number; readonly minimumEntryCount: number}
  | (UnreadableLineResponse & {readonly code: 'invalid-json'})
  | (SaveEntryFieldResponse & {readonly code: 'field-of-wrong-type'; readonly expectedType: string})
  | (SaveEntryFieldResponse & {readonly code: 'missing-field'; readonly missingFieldName: string})
  | (SaveEntryFieldResponse & {readonly code: 'unexpected-field'; readonly unexpectedFieldName: string})
  | (SaveEntryFieldResponse & {readonly code: 'value-below-minimum'; readonly minimum: number})
  | (SaveEntryFieldResponse & {readonly code: 'value-above-maximum'; readonly maximum: number})
  | (SaveEntryFieldResponse & {readonly code: 'value-not-matching-pattern'; readonly pattern: string})
  | (SaveEntryFieldResponse & {readonly code: 'missing-dependent-field'; readonly missingFieldName: string; readonly dependingFieldName: string})
  | {readonly code: 'float-serialization'; readonly fieldName: string; readonly serializedValue: string};
