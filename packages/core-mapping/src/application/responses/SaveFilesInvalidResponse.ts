import {ValidationIssue} from "../ports/ValidationIssue";
import {SaveWarning} from "shared-save-processing/gameDefinitions";

export interface SaveFilesInvalidResponse {
  saveAErrors: ValidationIssue[];
  saveBErrors: ValidationIssue[];
  saveAWarnings: SaveWarning[];
  saveBWarnings: SaveWarning[];
}
