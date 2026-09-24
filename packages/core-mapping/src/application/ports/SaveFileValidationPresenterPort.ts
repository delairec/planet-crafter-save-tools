import {ValidationIssue} from "./ValidationIssue";
import {SaveWarning} from "shared-save-processing/gameDefinitions";

export interface SaveFileValidationPresenterPort {
  presentValidSaveFile(warnings: SaveWarning[]): void;

  presentInvalidSaveFile(errors: ValidationIssue[], warnings: SaveWarning[]): void;
}
