import {describe, expect, it} from 'bun:test';
import {locateUnreadableLine} from './locateUnreadableLine';
import {UnreadableLine} from '../domain/save/SaveSectionLocation';
import {MAILBOX_MESSAGES_SECTION} from './testing/saveSectionLocations';

describe('locateUnreadableLine', () => {

  describe('When the parser reports a line it cannot read', () => {
    it('should locate the line in its named section and keep the line itself', () => {
      // Act
      const unreadableLine = locateUnreadableLine({code: 'unreadable-line', sectionIndex: MAILBOX_MESSAGES_SECTION.index, entryIndex: 1, line: '{not valid json'}, '2.004');

      // Assert
      expect<UnreadableLine>(unreadableLine).toEqual({section: MAILBOX_MESSAGES_SECTION, entryIndex: 1, line: '{not valid json'});
    });
  });
});
