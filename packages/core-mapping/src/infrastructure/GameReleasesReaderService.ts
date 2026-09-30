import {selectGameReleaseRows} from "data-save-format/selectGameReleaseRows";
import type {GameReleaseRow} from "data-save-format/GameReleaseRow";
import {GameReleasesReaderPort} from "../application/ports/GameReleasesReaderPort";
import {GameReleaseValueObject} from "../domain/valueObjects/GameReleaseValueObject";

export class GameReleasesReaderService implements GameReleasesReaderPort {
  readGameReleases(): readonly GameReleaseValueObject[] {
    return selectGameReleaseRows().map(mapGameReleaseRow);
  }
}

function mapGameReleaseRow({release, splitPartsCount}: GameReleaseRow): GameReleaseValueObject {
  return {release, splitPartsCount};
}
