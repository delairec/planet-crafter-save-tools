import {ValidationIssue} from "../ports/ValidationIssue";
import type {SaveWarning} from "shared-save-processing/gameDefinitions";

export interface SaveValidationResponse {
  isValid: boolean;
  errors: ValidationIssue[];
  warnings: SaveWarning[];
  declaredVersion?: string;
  carriedRelease?: string;
}
