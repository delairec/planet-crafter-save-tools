import type {ValidationIssue} from "../../domain/validation/ValidationIssue";
import type {SaveWarningResponse} from "./SaveWarningResponse";

export interface InvalidSaveFileResponse {
  errors: ValidationIssue[];
  warnings: SaveWarningResponse[];
}
