import {ValidationIssue} from "./ValidationIssue";
import {SaveParseError, SaveWarningCode} from "shared-save-processing/gameDefinitions";

export interface LoadAndValidateSaveFilePresenterPort {
  presentInvalidSaveFile(errors: ValidationIssue[], warnings: SaveWarningCode[]): void;

  presentLoadedSaveFile(errors: SaveParseError[], warnings: SaveWarningCode[]): void;
}
