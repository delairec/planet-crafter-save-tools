import type {UnreadableLine} from "../SaveSectionLocation";

export interface InvalidJsonIssue extends UnreadableLine {
  readonly code: 'invalid-json';
}
