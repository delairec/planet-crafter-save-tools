import {SaveIdentityValueObject} from "../../domain/valueObjects/SaveIdentityValueObject";

export interface SaveIdentityPresenterPort {
  displaySaveIdentity(saveIdentity: SaveIdentityValueObject): void;

  displayUnconfiguredSaveIdentity(fileName: string): void;
}
