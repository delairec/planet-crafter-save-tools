/** @import { SaveParseError } from './gameDefinitions' */

import {LEGACY_SPLIT_PARTS_COUNT, SAVE_SPLIT_PARTS_COUNT} from './sectionIndexes.js';

/**
 * @param {string[]} rawParts - result of `save.split('@')`
 * @returns {SaveParseError[]} parse errors, empty when the section count is supported. The count
 * concerns the file as a whole, so the error carries no location.
 */
export function verifySectionCount(rawParts) {
  const errors = [];

  if (rawParts.length !== SAVE_SPLIT_PARTS_COUNT && rawParts.length !== LEGACY_SPLIT_PARTS_COUNT) {
    errors.push({detail: `Expected ${SAVE_SPLIT_PARTS_COUNT} sections but found ${rawParts.length}`});
  }

  return errors;
}
