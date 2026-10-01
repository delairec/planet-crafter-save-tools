import type {ValidationIssueResponse} from "../../../save/application/responses/ValidationIssueResponse";
import type {MergeWarningResponse} from "./MergeWarningResponse";
import type {SaveWarningResponse} from "../../../save/application/responses/SaveWarningResponse";

export interface MergeSucceededResponse {
  readonly fileName: string;
  readonly content: string;
  readonly mergeErrors: readonly ValidationIssueResponse[];
  readonly mergeWarnings: readonly MergeWarningResponse[];
  readonly legacyFormatCouldBeKept: boolean;
  readonly saveAWarnings: readonly SaveWarningResponse[];
  readonly saveBWarnings: readonly SaveWarningResponse[];
}
