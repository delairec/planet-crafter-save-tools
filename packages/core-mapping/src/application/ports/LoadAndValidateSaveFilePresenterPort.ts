import {ValidationIssue} from "./ValidationIssue";
import {SaveParseError, SaveWarningCode} from "shared-save-processing/gameDefinitions";
import {SaveSections} from "../../domain/save/SaveSections";

export interface LoadAndValidateSaveFilePresenterPort {
  presentInvalidSaveFile(errors: ValidationIssue[], warnings: SaveWarningCode[]): void;

  presentLoadedSaveFile(sections: SaveSections, errors: SaveParseError[], warnings: SaveWarningCode[]): void;
}
