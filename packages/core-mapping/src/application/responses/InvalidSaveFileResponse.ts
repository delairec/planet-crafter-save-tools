import type {ValidationIssueResponse} from "./ValidationIssueResponse";
import type {SaveWarningResponse} from "./SaveWarningResponse";

export interface InvalidSaveFileResponse {
  readonly errors: readonly ValidationIssueResponse[];
  readonly warnings: readonly SaveWarningResponse[];
}
