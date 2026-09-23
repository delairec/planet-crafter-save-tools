import {PLAYERS_SECTION_INDEX} from 'shared-save-processing/sectionIndexes.js';
import {replaceSaveSection} from 'shared-save-processing/replaceSaveSection.js';
import {VALID_SAVE_CONTENT} from './fakeValidSaveContent.js';

const BROKEN_ENTRY = '{ broken entry';

export const SAVE_CONTENT_WITH_INVALID_ENTRY = replaceSaveSection(
  VALID_SAVE_CONTENT,
  PLAYERS_SECTION_INDEX,
  (currentSection) => `${currentSection}|\n${BROKEN_ENTRY}`
);
