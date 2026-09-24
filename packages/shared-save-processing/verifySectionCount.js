/** @import { SaveParseError } from './gameDefinitions' */

import {listSplitPartsCounts} from './gameReleases.js';

/**
 * @param {string[]} rawParts - result of `save.split('@')`
 * @returns {SaveParseError[]}
 */
export function verifySectionCount(rawParts) {
  const splitPartsCounts = listSplitPartsCounts();

  if (splitPartsCounts.includes(rawParts.length)) {
    return [];
  }

  return [{detail: `Expected ${splitPartsCounts.join(' or ')} sections but found ${rawParts.length}`}];
}
