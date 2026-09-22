/** @import { SaveWarningCode } from './gameDefinitions' */

export const SAVE_WARNING_CODES = Object.freeze(/** @satisfies {Record<string, SaveWarningCode>} */ ({
  LEGACY_SAVE_FORMAT: /** @type {const} */ ('legacy-save-format'),
  DECLARED_RELEASE_CONTRADICTS_CONTENT: /** @type {const} */ ('declared-release-contradicts-content')
}));
