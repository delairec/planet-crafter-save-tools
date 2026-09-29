import {ValidationIssue} from "./ValidationIssue";
import {SaveWarning} from "shared-save-processing/gameDefinitions";
import {UnreadableLine} from "./SaveSectionLocation";

export interface LoadAndValidateSaveFilePresenterPort {
  presentInvalidSaveFile(errors: ValidationIssue[], warnings: SaveWarning[]): void;

  presentLoadedSaveFile(warnings: SaveWarning[]): void;

  presentSaveFileWithUnreadableLines(unreadableLines: UnreadableLine[], warnings: SaveWarning[]): void;

  presentSaveFileWithoutUniqueHost(hostCount: number, warnings: SaveWarning[]): void;
}
