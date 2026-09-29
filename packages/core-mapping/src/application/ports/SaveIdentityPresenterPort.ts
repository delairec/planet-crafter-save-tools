import {SaveIdentityResponse} from "../responses/SaveIdentityResponse";

export interface SaveIdentityPresenterPort {
  displaySaveIdentity(saveIdentity: SaveIdentityResponse): void;

  displayUnconfiguredSaveIdentity(fileName: string): void;
}
