import {readFileSync} from 'node:fs';

/**
 * @param {string} fileName
 * @returns {string}
 */
function readSaveFixture(fileName) {
  return readFileSync(new URL(`./fixtures/${fileName}`, import.meta.url), 'utf8');
}

export const VALID_SAVE_CONTENT = readSaveFixture('baseline_valid.json');
export const SAVE_CONTENT_WITH_INVALID_ENTRY = readSaveFixture('unreadable-player-entry_invalid.json');
export const LEGACY_SAVE_CONTENT = readSaveFixture('legacy-format_valid.json');
