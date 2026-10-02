import {selectGameReleaseRows} from 'data-save-format/selectGameReleaseRows';

const gameReleases = selectGameReleaseRows();

/** A save is asked in the format of a release the table of game releases does not hold. */
export class UnknownFormatReleaseError extends Error {
  /** @param {string | undefined} formatRelease */
  constructor(formatRelease) {
    super(`No game release ${formatRelease} writes a known save format`);
    this.name = 'UnknownFormatReleaseError';
  }
}

/**
 * The release whose format a save carries: the first release of the table writing its part count.
 * @param {number} splitPartsCount
 * @returns {string | undefined} undefined when no release writes that count
 */
export function findCarriedRelease(splitPartsCount) {
  return gameReleases.find((row) => row.splitPartsCount === splitPartsCount)?.release;
}

/**
 * @param {string} release
 * @returns {number | undefined} the number of parts the saves of that release split into
 */
export function findSplitPartsCount(release) {
  return gameReleases.find((row) => row.release === release)?.splitPartsCount;
}

/** @returns {number[]} */
export function listSplitPartsCounts() {
  return [...new Set(gameReleases.map((row) => row.splitPartsCount))].sort((countA, countB) => countA - countB);
}
