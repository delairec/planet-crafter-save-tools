import {readFileSync} from 'node:fs';

/**
 * @param {string} fileName
 * @returns {string}
 */
function readSaveFixture(fileName) {
  return readFileSync(new URL(`./fixtures/${fileName}`, import.meta.url), 'utf8');
}

export const FAKE_SAVE_STRING_A = readSaveFixture('terra-tokens-10_valid.json');
export const LEGACY_FAKE_SAVE_STRING_A = readSaveFixture('legacy-format-terra-tokens-10_valid.json');
export const FAKE_SAVE_STRING_B = readSaveFixture('terra-tokens-20_valid.json');
export const FAKE_SAVE_STRING_WITH_INVALID_ENTRY = readSaveFixture('unreadable-player-entry_invalid.json');
export const FAKE_SAVE_STRING_WITHOUT_GLOBAL_METADATA = readSaveFixture('no-global-metadata_invalid.json');
export const SAVE_CARRYING_DEPRECATED_GROUP_IDS = readSaveFixture('deprecated-group-ids_valid.json');
export const LEGACY_SAVE_WITHOUT_DEPRECATED_GROUP_ID = readSaveFixture('legacy-format-current-group-ids_valid.json');
export const SAVE_WITHOUT_DEPRECATED_GROUP_ID = readSaveFixture('current-group-ids_valid.json');
export const RELEASE_2_102_SAVE_WITHOUT_DEPRECATED_GROUP_ID = readSaveFixture('release-2-102-current-group-ids_valid.json');
export const SAVE_UNLOCKING_GROUP_A_ONLY = readSaveFixture('unlocks-group-a_valid.json');
export const SAVE_UNLOCKING_GROUP_B_ONLY = readSaveFixture('unlocks-group-b_valid.json');
export const LEGACY_SAVE_UNLOCKING_GROUP_A_ONLY = readSaveFixture('legacy-format-unlocks-group-a_valid.json');
