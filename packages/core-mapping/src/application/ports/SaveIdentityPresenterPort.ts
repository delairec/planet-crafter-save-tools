import type {UnreadableLinesResponse} from "../responses/UnreadableLinesResponse";
import {SaveIdentityResponse} from "../responses/SaveIdentityResponse";

export interface SaveIdentityPresenterPort {
  displaySaveIdentity(saveIdentity: SaveIdentityResponse): void;

  displayUnconfiguredSaveIdentity(fileName: string): void;

  displaySaveWithUnreadableLines(fileName: string, response: UnreadableLinesResponse): void;
}
