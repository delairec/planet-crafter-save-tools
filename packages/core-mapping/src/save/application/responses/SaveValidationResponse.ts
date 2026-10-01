import {ValidationIssue} from "../../domain/validation/ValidationIssue";
import type {SaveWarning} from "../../domain/validation/SaveWarning";

export interface SaveValidationResponse {
  isValid: boolean;
  errors: ValidationIssue[];
  warnings: SaveWarning[];
  declaredVersion?: string;
  carriedRelease?: string;
}
