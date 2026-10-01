import type {ValidationIssueResponse} from "../../../save/application/responses/ValidationIssueResponse";
import type {SaveWarningResponse} from "../../../save/application/responses/SaveWarningResponse";

export type SaveFileFindingsResponse =
  | {readonly hasJsonExtension: false}
  | {readonly hasJsonExtension: true; readonly errors: readonly ValidationIssueResponse[]; readonly warnings: readonly SaveWarningResponse[]};
