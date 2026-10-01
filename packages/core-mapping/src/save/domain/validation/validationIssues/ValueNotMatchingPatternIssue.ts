import type {SaveEntryField} from "../../save/SaveSectionLocation";

export interface ValueNotMatchingPatternIssue extends SaveEntryField {
  readonly code: 'value-not-matching-pattern';
  readonly pattern: string;
}
