/** @import { SaveParseErrorCode } from './gameDefinitions' */

export const SAVE_PARSE_ERROR_CODES = Object.freeze(/** @satisfies {Record<string, SaveParseErrorCode>} */ ({
  UNEXPECTED_SECTION_COUNT: /** @type {const} */ ('unexpected-section-count'),
  UNREADABLE_LINE: /** @type {const} */ ('unreadable-line')
}));
