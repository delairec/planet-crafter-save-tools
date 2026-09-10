import {ValidationIssue} from "./ValidationIssue";
import {ParsedSections, SaveParseError, SaveWarningCode} from "shared-save-processing/gameDefinitions";

export interface LoadAndValidateSaveFilePresenterPort {
  presentInvalidSaveFile(errors: ValidationIssue[], warnings: SaveWarningCode[]): void;

  presentLoadedSaveFile(sections: ParsedSections, errors: SaveParseError[], warnings: SaveWarningCode[]): void;
}
