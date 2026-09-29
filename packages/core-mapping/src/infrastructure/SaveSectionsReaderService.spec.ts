import {describe, expect, it} from 'bun:test';
import {SaveParseError} from 'shared-save-processing/gameDefinitions';
import {createPlayer} from 'shared-save-processing/testing/createSaveRecords.js';
import {SaveSectionsReaderService} from './SaveSectionsReaderService';
import {SaveSectionsParserPort} from '../application/ports/SaveSectionsParserPort';
import {SaveSections} from '../domain/save/SaveSections';
import {createSaveSections} from '../testing/createSaveSections';

const SAVE_CONTENT = 'save content';

function createParser(sections: SaveSections, errors: SaveParseError[]): SaveSectionsParserPort {
  return {
    parse: (content: string) => content === SAVE_CONTENT ? {sections, errors} : {sections: createSaveSections(), errors: []}
  };
}

describe('SaveSectionsReaderService', () => {
  it('should give access to the sections parsed from the content', () => {
    // Arrange
    const noUnreadableLines: SaveParseError[] = [];
    const sections = createSaveSections({players: [createPlayer({name: 'Nikowa'})]});
    const reader = new SaveSectionsReaderService(createParser(sections, noUnreadableLines));

    // Act
    const {saveSections} = reader.read(SAVE_CONTENT);

    // Assert
    expect(saveSections.getPlayers()[0].name).toBe('Nikowa');
  });

  it('should carry every line the parser could not read', () => {
    // Arrange
    const unreadableLines: SaveParseError[] = [{detail: 'Entry is not valid JSON', section: 3, entryIndex: 2}];
    const reader = new SaveSectionsReaderService(createParser(createSaveSections(), unreadableLines));

    // Act
    const reading = reader.read(SAVE_CONTENT);

    // Assert
    expect<SaveParseError[]>(reading.unreadableLines).toEqual([{detail: 'Entry is not valid JSON', section: 3, entryIndex: 2}]);
  });
});
