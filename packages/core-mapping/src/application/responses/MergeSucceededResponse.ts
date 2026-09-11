import {ValidationIssue} from "../ports/ValidationIssue";
import {SaveWarningCode} from "shared-save-processing/gameDefinitions";

/**
 * Output of `MergeSaveFiles` when the merge produced a file, handed to the presenter through
 * `MergeResultPresenterPort`. It is built by the use case and by nothing else; presentation reads
 * it to build a ViewModel and never constructs it.
 */
export interface MergeSucceededResponse {
  fileName: string;
  content: string;
  mergeErrors: ValidationIssue[];
  saveAWarnings: SaveWarningCode[];
  saveBWarnings: SaveWarningCode[];
}
