import type {ValidationIssueResponse} from "../../../save/application/responses/ValidationIssueResponse";
import type {SaveWarningResponse} from "../../../save/application/responses/SaveWarningResponse";

export interface InvalidSaveFileResponse {
  readonly errors: readonly ValidationIssueResponse[];
  readonly warnings: readonly SaveWarningResponse[];
}
