import {SaveParseError} from "shared-save-processing/gameDefinitions";
import {SaveIdentityResponse} from "../responses/SaveIdentityResponse";

export interface SaveIdentityPresenterPort {
  displaySaveIdentity(saveIdentity: SaveIdentityResponse): void;

  displayUnconfiguredSaveIdentity(fileName: string): void;

  displaySaveWithUnreadableLines(fileName: string, unreadableLines: SaveParseError[]): void;
}
