import type {SaveSectionLocation} from "../../save/SaveSectionLocation";

export interface TooFewSectionEntriesIssue {
  readonly code: 'too-few-section-entries';
  readonly section: SaveSectionLocation;
  readonly foundEntryCount: number;
  readonly minimumEntryCount: number;
}
