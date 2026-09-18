import {createFakeSaveContent, createLegacyFakeSaveContent} from 'shared-save-processing/testing/createFakeSaveContent.js';
import {createGlobalMetadata} from 'shared-save-processing/testing/createSaveRecords.js';
import {GLOBAL_METADATA_SECTION_INDEX, PLAYERS_SECTION_INDEX} from 'shared-save-processing/sectionIndexes.js';

export const FAKE_SAVE_STRING_A = createFakeSaveContent({globalMetadata: createGlobalMetadata({terraTokens: 10, allTimeTerraTokens: 10})});
export const LEGACY_FAKE_SAVE_STRING_A = createLegacyFakeSaveContent({globalMetadata: createGlobalMetadata({terraTokens: 10, allTimeTerraTokens: 10})});
export const FAKE_SAVE_STRING_B = createFakeSaveContent({globalMetadata: createGlobalMetadata({terraTokens: 20, allTimeTerraTokens: 20})});

const BROKEN_ENTRY = '{ broken entry';

const sectionsWithBrokenPlayer = FAKE_SAVE_STRING_A.split('@');
sectionsWithBrokenPlayer[PLAYERS_SECTION_INDEX] = `${sectionsWithBrokenPlayer[PLAYERS_SECTION_INDEX]}|\n${BROKEN_ENTRY}`;

export const FAKE_SAVE_STRING_WITH_INVALID_ENTRY = sectionsWithBrokenPlayer.join('@');

/** @param {string} saveString */
function removeGlobalMetadata(saveString) {
  const sections = saveString.split('@');
  sections[GLOBAL_METADATA_SECTION_INDEX] = '';
  return sections.join('@');
}

export const FAKE_SAVE_STRING_A_WITHOUT_GLOBAL_METADATA = removeGlobalMetadata(FAKE_SAVE_STRING_A);
export const FAKE_SAVE_STRING_B_WITHOUT_GLOBAL_METADATA = removeGlobalMetadata(FAKE_SAVE_STRING_B);
