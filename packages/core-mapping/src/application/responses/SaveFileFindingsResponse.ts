import type {ValidationIssueResponse} from "./ValidationIssueResponse";
import type {SaveWarningResponse} from "./SaveWarningResponse";

export type SaveFileFindingsResponse =
  | {readonly hasJsonExtension: false}
  | {readonly hasJsonExtension: true; readonly errors: readonly ValidationIssueResponse[]; readonly warnings: readonly SaveWarningResponse[]};
