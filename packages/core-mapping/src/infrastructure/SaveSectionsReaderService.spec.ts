import {describe, expect, it} from 'bun:test';
import {UnreadableLine} from '../domain/save/SaveSectionLocation';
import {createPlayer} from 'shared-save-processing/testing/createSaveRecords.js';
import {SaveSectionsReaderService} from './SaveSectionsReaderService';
import {SaveSectionsParserPort} from '../application/ports/SaveSectionsParserPort';
import {SaveSections} from '../domain/save/SaveSections';
import {createSaveSections} from '../testing/createSaveSections';
import {WORLD_OBJECTS_SECTION} from './testing/saveSectionLocations';

const SAVE_CONTENT = 'save content';

function createParser(sections: SaveSections, errors: UnreadableLine[]): SaveSectionsParserPort {
  return {
    parse: (content: string) => content === SAVE_CONTENT ? {sections, errors} : {sections: createSaveSections(), errors: []}
  };
}

describe('SaveSectionsReaderService', () => {
  it('should give access to the sections parsed from the content', () => {
    // Arrange
    const noUnreadableLines: UnreadableLine[] = [];
    const sections = createSaveSections({players: [createPlayer({name: 'Nikowa'})]});
    const reader = new SaveSectionsReaderService(createParser(sections, noUnreadableLines));

    // Act
    const {saveSections} = reader.read(SAVE_CONTENT);

    // Assert
    expect(saveSections.getPlayers()[0].name).toBe('Nikowa');
  });

  it('should carry every line the parser could not read', () => {
    // Arrange
    const unreadableLines: UnreadableLine[] = [{section: WORLD_OBJECTS_SECTION, entryIndex: 2, line: '{not valid json'}];
    const reader = new SaveSectionsReaderService(createParser(createSaveSections(), unreadableLines));

    // Act
    const reading = reader.read(SAVE_CONTENT);

    // Assert
    expect<UnreadableLine[]>(reading.unreadableLines).toEqual([{section: WORLD_OBJECTS_SECTION, entryIndex: 2, line: '{not valid json'}]);
  });
});
