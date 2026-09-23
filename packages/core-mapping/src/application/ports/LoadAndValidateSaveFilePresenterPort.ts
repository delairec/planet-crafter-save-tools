import {ValidationIssue} from "./ValidationIssue";
import {SaveParseError, SaveWarning} from "shared-save-processing/gameDefinitions";

export interface LoadAndValidateSaveFilePresenterPort {
  presentInvalidSaveFile(errors: ValidationIssue[], warnings: SaveWarning[]): void;

  presentLoadedSaveFile(errors: SaveParseError[], warnings: SaveWarning[]): void;
}
