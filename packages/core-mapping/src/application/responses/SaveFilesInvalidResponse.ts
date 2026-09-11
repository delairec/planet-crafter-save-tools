import {ValidationIssue} from "../ports/ValidationIssue";
import {SaveWarningCode} from "shared-save-processing/gameDefinitions";

/**
 * Output of `MergeSaveFiles` when validation refused one of the two input saves, handed to the
 * presenter through `MergeResultPresenterPort`. It is built by the use case and by nothing else;
 * presentation reads it to build a ViewModel and never constructs it.
 */
export interface SaveFilesInvalidResponse {
  saveAErrors: ValidationIssue[];
  saveBErrors: ValidationIssue[];
  saveAWarnings: SaveWarningCode[];
  saveBWarnings: SaveWarningCode[];
}
