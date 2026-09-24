import {createFakeSaveContent, createLegacyFakeSaveContent} from 'shared-save-processing/testing/createFakeSaveContent.js';
import {createGlobalMetadata} from 'shared-save-processing/testing/createSaveRecords.js';
import {GLOBAL_METADATA_SECTION_INDEX, PLAYERS_SECTION_INDEX} from 'shared-save-processing/sectionIndexes.js';
import {replaceSaveSection} from 'shared-save-processing/replaceSaveSection.js';

export const FAKE_SAVE_STRING_A = createFakeSaveContent({globalMetadata: createGlobalMetadata({terraTokens: 10, allTimeTerraTokens: 10})});
export const LEGACY_FAKE_SAVE_STRING_A = createLegacyFakeSaveContent({globalMetadata: createGlobalMetadata({terraTokens: 10, allTimeTerraTokens: 10})});
export const FAKE_SAVE_STRING_B = createFakeSaveContent({globalMetadata: createGlobalMetadata({terraTokens: 20, allTimeTerraTokens: 20})});

const BROKEN_ENTRY = '{ broken entry';

export const FAKE_SAVE_STRING_WITH_INVALID_ENTRY = replaceSaveSection(
  FAKE_SAVE_STRING_A,
  PLAYERS_SECTION_INDEX,
  (currentSection) => `${currentSection}|\n${BROKEN_ENTRY}`
);

/** @param {string} saveString */
function removeGlobalMetadata(saveString) {
  return replaceSaveSection(saveString, GLOBAL_METADATA_SECTION_INDEX, () => '');
}

export const FAKE_SAVE_STRING_A_WITHOUT_GLOBAL_METADATA = removeGlobalMetadata(FAKE_SAVE_STRING_A);
export const FAKE_SAVE_STRING_B_WITHOUT_GLOBAL_METADATA = removeGlobalMetadata(FAKE_SAVE_STRING_B);
