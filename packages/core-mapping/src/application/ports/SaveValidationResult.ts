import {ValidationIssue} from "./ValidationIssue";
import {SaveWarning} from "shared-save-processing/gameDefinitions";

export interface SaveValidationResult {
  isValid: boolean;
  errors: ValidationIssue[];
  warnings: SaveWarning[];
}
