import {ValidationIssue} from "./ValidationIssue";
import {SaveParseError, SaveWarning} from "shared-save-processing/gameDefinitions";

export interface SaveFileValidationPresenterPort {
  presentValidSaveFile(warnings: SaveWarning[]): void;

  presentInvalidSaveFile(errors: ValidationIssue[], warnings: SaveWarning[]): void;

  presentSaveFileWithUnreadableLines(unreadableLines: SaveParseError[], warnings: SaveWarning[]): void;

  presentSaveFileWithoutUniqueHost(hostCount: number, warnings: SaveWarning[]): void;
}
