import {PLAYERS_SECTION_INDEX} from '../packages/core-mapping/src/save/infrastructure/wireFormat/sectionIndexes.js';
import {replaceSaveSection} from '../packages/core-mapping/src/save/infrastructure/wireFormat/replaceSaveSection.js';

const UNREADABLE_ENTRY = '{ broken entry';

export function appendUnreadablePlayerEntry(saveContent: string): string {
  return replaceSaveSection(saveContent, PLAYERS_SECTION_INDEX, (currentSection: string) => `${currentSection}|\n${UNREADABLE_ENTRY}`);
}
