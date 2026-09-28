import type {ValidationIssueResponse} from "./ValidationIssueResponse";
import type {MergeWarningResponse} from "./MergeWarningResponse";
import type {SaveWarningResponse} from "./SaveWarningResponse";

export interface MergeSucceededResponse {
  readonly fileName: string;
  readonly content: string;
  readonly mergeErrors: readonly ValidationIssueResponse[];
  readonly mergeWarnings: readonly MergeWarningResponse[];
  readonly legacyFormatCouldBeKept: boolean;
  readonly saveAWarnings: readonly SaveWarningResponse[];
  readonly saveBWarnings: readonly SaveWarningResponse[];
}
