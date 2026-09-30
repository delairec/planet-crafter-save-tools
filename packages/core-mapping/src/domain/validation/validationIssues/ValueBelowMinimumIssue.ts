import type {SaveEntryField} from "../../save/SaveSectionLocation";

export interface ValueBelowMinimumIssue extends SaveEntryField {
  readonly code: 'value-below-minimum';
  readonly minimum: number;
}
