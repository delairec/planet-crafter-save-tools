import {ValidationIssue} from "./ValidationIssue";
import type {SaveWarningResponse} from "../responses/SaveWarningResponse";
import {UnreadableLine} from "./SaveSectionLocation";

export interface SaveFileValidationPresenterPort {
  presentValidSaveFile(warnings: SaveWarningResponse[]): void;

  presentInvalidSaveFile(errors: ValidationIssue[], warnings: SaveWarningResponse[]): void;

  presentFileWithoutJsonExtension(): void;

  presentSaveFileWithUnreadableLines(unreadableLines: UnreadableLine[], warnings: SaveWarningResponse[]): void;

  presentSaveFileWithoutUniqueHost(hostCount: number, warnings: SaveWarningResponse[]): void;
}
