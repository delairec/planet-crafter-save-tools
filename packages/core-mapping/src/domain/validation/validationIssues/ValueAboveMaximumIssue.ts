import type {SaveEntryField} from "../../save/SaveSectionLocation";

export interface ValueAboveMaximumIssue extends SaveEntryField {
  readonly code: 'value-above-maximum';
  readonly maximum: number;
}
