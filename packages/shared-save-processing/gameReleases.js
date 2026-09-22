/** @import { SaveWarning } from './gameDefinitions' */

import gameReleases from './gameReleases.json' with {type: 'json'};
import {SAVE_WARNING_CODES} from './saveWarningCodes.js';

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
  const carriedRow = gameReleases.find((row) => row.splitPartsCount === splitPartsCount);

  if (declaredRelease === undefined || carriedRow === undefined) {
    return [];
  }

  const declaredRow = gameReleases.find(({release}) => release === declaredRelease);

  if (declaredRow?.splitPartsCount === splitPartsCount) {
    return [];
  }

  return [{
    code: SAVE_WARNING_CODES.DECLARED_RELEASE_CONTRADICTS_CONTENT,
    declaredVersion,
    declaredRelease,
    carriedRelease: carriedRow.release
  }];
}
