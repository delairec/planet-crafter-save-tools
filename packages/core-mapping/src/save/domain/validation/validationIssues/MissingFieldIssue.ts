import type {SaveEntryField} from "../../save/SaveSectionLocation";

export interface MissingFieldIssue extends SaveEntryField {
  readonly code: 'missing-field';
  readonly missingFieldName: string;
}
