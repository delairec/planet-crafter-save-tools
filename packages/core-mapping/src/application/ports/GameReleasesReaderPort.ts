import {GameReleaseValueObject} from "../../domain/valueObjects/GameReleaseValueObject";

export interface GameReleasesReaderPort {
  readGameReleases(): readonly GameReleaseValueObject[];
}
