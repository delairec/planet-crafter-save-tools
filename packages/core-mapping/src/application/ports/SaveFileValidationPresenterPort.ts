import {ValidationIssue} from "./ValidationIssue";
import {SaveWarningCode} from "shared-save-processing/gameDefinitions";

export interface SaveFileValidationPresenterPort {
  presentValidSaveFile(warnings: SaveWarningCode[]): void;

  presentInvalidSaveFile(errors: ValidationIssue[], warnings: SaveWarningCode[]): void;
}
