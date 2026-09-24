/** @import { SaveWarning } from './gameDefinitions' */

import gameReleases from './gameReleases.json' with {type: 'json'};
import {SAVE_WARNING_CODES} from './saveWarningCodes.js';

/** A save is asked in the format of a release the table of game releases does not hold. */
export class UnknownFormatReleaseError extends Error {
  /** @param {string | undefined} formatRelease */
  constructor(formatRelease) {
    super(`No game release ${formatRelease} writes a known save format`);
    this.name = 'UnknownFormatReleaseError';
  }
}

const RELEASE_VERSION_PATTERN = /^\d+(\.\d+)*$/;

/**
 * @param {string} version
 * @returns {number[]}
 */
function splitVersionSegments(version) {
  return version.split('.').map(Number);
}

/**
 * @param {number[]} segmentsA
 * @param {number[]} segmentsB
 * @returns {number}
 */
function compareVersionSegments(segmentsA, segmentsB) {
  const segmentsCount = Math.max(segmentsA.length, segmentsB.length);

  for (let segmentIndex = 0; segmentIndex < segmentsCount; segmentIndex++) {
    const difference = (segmentsA[segmentIndex] ?? 0) - (segmentsB[segmentIndex] ?? 0);

    if (difference !== 0) {
      return difference;
    }
  }

  return 0;
}

/**
 * @param {string} declaredVersion
 * @returns {string | undefined}
 */
export function resolveGameRelease(declaredVersion) {
  if (!RELEASE_VERSION_PATTERN.test(declaredVersion)) {
    return undefined;
  }

  const declaredSegments = splitVersionSegments(declaredVersion);
  const reachedReleases = gameReleases.filter(
    ({release}) => compareVersionSegments(splitVersionSegments(release), declaredSegments) <= 0
  );

  return (reachedReleases.at(-1) ?? gameReleases[0])?.release;
}

/** The release whose format the save manager writes when no other is asked for. */
export const CURRENT_FORMAT_RELEASE = /** @type {string} */ (gameReleases.at(-1)?.release);

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

/**
 * @param {unknown} declaredVersion
 * @param {number} splitPartsCount
 * @returns {SaveWarning[]}
 */
export function verifyDeclaredGameRelease(declaredVersion, splitPartsCount) {
  if (typeof declaredVersion !== 'string') {
    return [];
  }

  const declaredRelease = resolveGameRelease(declaredVersion);
  const carriedRelease = findCarriedRelease(splitPartsCount);

  if (declaredRelease === undefined || carriedRelease === undefined) {
    return [];
  }

  if (findSplitPartsCount(declaredRelease) === splitPartsCount) {
    return [];
  }

  return [{
    code: SAVE_WARNING_CODES.DECLARED_RELEASE_CONTRADICTS_CONTENT,
    declaredVersion,
    declaredRelease,
    carriedRelease
  }];
}
