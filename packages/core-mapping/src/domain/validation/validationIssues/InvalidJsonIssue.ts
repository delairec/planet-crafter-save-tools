import type {UnreadableLine} from "../../save/SaveSectionLocation";

export interface InvalidJsonIssue extends UnreadableLine {
  readonly code: 'invalid-json';
}
