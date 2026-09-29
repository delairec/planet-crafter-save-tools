import {UnreadableLine} from "./SaveSectionLocation";
import {SaveIdentityResponse} from "../responses/SaveIdentityResponse";

export interface SaveIdentityPresenterPort {
  displaySaveIdentity(saveIdentity: SaveIdentityResponse): void;

  displayUnconfiguredSaveIdentity(fileName: string): void;

  displaySaveWithUnreadableLines(fileName: string, unreadableLines: UnreadableLine[]): void;
}
