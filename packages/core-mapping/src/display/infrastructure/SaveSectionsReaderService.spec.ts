import {describe, expect, it} from 'bun:test';
import {UnreadableLine} from '../../save/domain/save/SaveSectionLocation';
import {createPlayer} from 'shared-save-processing/testing/createSaveRecords.js';
import {SaveSectionsReaderService} from './SaveSectionsReaderService';
import {SaveSectionsParserPort} from '../../save/application/ports/SaveSectionsParserPort';
import {SaveSections} from '../../save/domain/save/SaveSections';
import {createSaveSections} from '../../save/testing/createSaveSections';

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
    const unreadableLines: UnreadableLine[] = [{code: 'invalid-json', section: {name: 'worldObjects', index: 3}, entryIndex: 2, line: '{not valid json'}];
    const reader = new SaveSectionsReaderService(createParser(createSaveSections(), unreadableLines));

    // Act
    const reading = reader.read(SAVE_CONTENT);

    // Assert
    expect<UnreadableLine[]>(reading.unreadableLines).toEqual([{code: 'invalid-json', section: {name: 'worldObjects', index: 3}, entryIndex: 2, line: '{not valid json'}]);
  });
});
