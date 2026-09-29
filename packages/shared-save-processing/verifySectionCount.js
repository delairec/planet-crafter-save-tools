/** @import { UnexpectedSectionCount } from './gameDefinitions' */

import {listSplitPartsCounts} from './gameReleases.js';
import {SAVE_PARSE_ERROR_CODES} from './saveParseErrorCodes.js';

/**
 * @param {string[]} rawParts - result of `save.split('@')`
 * @returns {UnexpectedSectionCount[]}
 */
export function verifySectionCount(rawParts) {
  const splitPartsCounts = listSplitPartsCounts();

  if (splitPartsCounts.includes(rawParts.length)) {
    return [];
  }

  return [{
    code: SAVE_PARSE_ERROR_CODES.UNEXPECTED_SECTION_COUNT,
    foundSectionCount: rawParts.length,
    expectedSectionCounts: splitPartsCounts
  }];
}
