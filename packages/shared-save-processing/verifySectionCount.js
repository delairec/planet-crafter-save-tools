/** @import { UnexpectedSectionCount } from './gameDefinitions' */

import {listSplitPartsCounts} from './gameReleases.js';
import {SAVE_PARSE_ERROR_CODES} from './saveParseErrorCodes.js';

/**
 * @param {string} saveContent
 * @returns {UnexpectedSectionCount[]}
 */
export function verifySectionCount(saveContent) {
  const rawParts = saveContent.split('@');
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
