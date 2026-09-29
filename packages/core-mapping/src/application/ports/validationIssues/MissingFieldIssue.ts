import type {SaveEntryField} from "../SaveSectionLocation";

export interface MissingFieldIssue extends SaveEntryField {
  readonly code: 'missing-field';
  readonly missingFieldName: string;
}
