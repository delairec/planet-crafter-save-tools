import {ValidationIssue} from "../../domain/validation/ValidationIssue";
import type {SaveWarningResponse} from "./SaveWarningResponse";

export interface SaveValidationResponse {
  isValid: boolean;
  errors: ValidationIssue[];
  warnings: SaveWarningResponse[];
  declaredVersion?: string;
  carriedRelease?: string;
}
