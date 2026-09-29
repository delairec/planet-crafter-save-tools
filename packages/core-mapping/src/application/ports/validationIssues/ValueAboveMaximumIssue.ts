import type {SaveEntryField} from "../SaveSectionLocation";

export interface ValueAboveMaximumIssue extends SaveEntryField {
  readonly code: 'value-above-maximum';
  readonly maximum: number;
}
