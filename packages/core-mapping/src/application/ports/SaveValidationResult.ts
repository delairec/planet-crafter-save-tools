import {ValidationIssue} from "./ValidationIssue";
import type {SaveWarning} from "shared-save-processing/gameDefinitions";

export interface SaveValidationResult {
  isValid: boolean;
  errors: ValidationIssue[];
  warnings: SaveWarning[];
  declaredVersion?: string;
  carriedRelease?: string;
}
