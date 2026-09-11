import {ValidationIssue} from "../ports/ValidationIssue";
import {SaveWarningCode} from "shared-save-processing/gameDefinitions";

export interface SaveFilesInvalidResponse {
  saveAErrors: ValidationIssue[];
  saveBErrors: ValidationIssue[];
  saveAWarnings: SaveWarningCode[];
  saveBWarnings: SaveWarningCode[];
}
