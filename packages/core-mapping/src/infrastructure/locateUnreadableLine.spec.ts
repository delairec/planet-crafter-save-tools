import {describe, expect, it} from 'bun:test';
import {locateUnreadableLine} from './locateUnreadableLine';
import {UnreadableLine} from '../domain/save/SaveSectionLocation';

describe('locateUnreadableLine', () => {

  describe('When the parser reports a line it cannot read', () => {
    it('should locate the line in its named section and keep the line itself', () => {
      // Act
      const unreadableLine = locateUnreadableLine({code: 'unreadable-line', sectionIndex: 6, entryIndex: 1, line: '{not valid json'}, '2.004');

      // Assert
      expect<UnreadableLine>(unreadableLine).toEqual({section: {name: 'mailboxMessages', index: 6}, entryIndex: 1, line: '{not valid json'});
    });
  });
});
