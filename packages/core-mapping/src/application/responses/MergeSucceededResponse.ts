import {ValidationIssue} from "../ports/ValidationIssue";
import {SaveWarningCode} from "shared-save-processing/gameDefinitions";

export interface MergeSucceededResponse {
  fileName: string;
  content: string;
  mergeErrors: ValidationIssue[];
  saveAWarnings: SaveWarningCode[];
  saveBWarnings: SaveWarningCode[];
}
