import type {InvalidSaveFileResponse} from "../responses/InvalidSaveFileResponse";
import type {SaveWarningResponse} from "../../../save/application/responses/SaveWarningResponse";
import type {SaveFileWithUnreadableLinesResponse} from "../responses/SaveFileWithUnreadableLinesResponse";

export interface SaveFileValidationPresenterPort {
  presentValidSaveFile(warnings: SaveWarningResponse[]): void;

  presentInvalidSaveFile(response: InvalidSaveFileResponse): void;

  presentFileWithoutJsonExtension(): void;

  presentSaveFileWithUnreadableLines(response: SaveFileWithUnreadableLinesResponse): void;

  presentSaveFileWithoutUniqueHost(hostCount: number, warnings: SaveWarningResponse[]): void;
}
