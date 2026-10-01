import {describe, expect, it} from 'bun:test';
import {BrokenSaveInvariant, checkSaveInvariants} from './checkSaveInvariants';
import {UnreadableLine} from '../save/SaveSectionLocation';
import {createPlayerEntry} from '../../testing/createSaveEntries';
import {createSaveSections} from '../../testing/createSaveSections';
import {WORLD_OBJECTS_SECTION} from '../../testing/saveSectionLocations';

describe('checkSaveInvariants', () => {
  const noUnreadableLines: UnreadableLine[] = [];
  const sectionsWithOneHost = createSaveSections({players: [createPlayerEntry({name: 'Nikowa', host: true}), createPlayerEntry({name: 'Sakia', host: false})]});
  const sectionsWithTwoHosts = createSaveSections({players: [createPlayerEntry({name: 'Nikowa', host: true}), createPlayerEntry({name: 'Sakia', host: true})]});

  describe('When every line of the save was read and it designates one host', () => {
    it('should find no broken invariant', () => {
      // Act
      const brokenInvariant = checkSaveInvariants(sectionsWithOneHost, noUnreadableLines);

      // Assert
      expect<BrokenSaveInvariant | null>(brokenInvariant).toBeNull();
    });
  });

  describe('When some lines of the save could not be read', () => {
    it('should report the unreadable lines', () => {
      // Arrange
      const unreadableLine: UnreadableLine = {code: 'invalid-json', section: WORLD_OBJECTS_SECTION, entryIndex: 2, line: '{'};

      // Act
      const brokenInvariant = checkSaveInvariants(sectionsWithOneHost, [unreadableLine]);

      // Assert
      expect<BrokenSaveInvariant | null>(brokenInvariant).toEqual({
        code: 'unreadable-lines',
        unreadableLines: [{code: 'invalid-json', section: {name: 'worldObjects', index: 78}, entryIndex: 2, line: '{'}]
      });
    });

    describe('When the save designates more than one host too', () => {
      it('should report the unreadable lines, not the hosts', () => {
        // Arrange
        const unreadableLine: UnreadableLine = {code: 'invalid-json', section: WORLD_OBJECTS_SECTION, entryIndex: 2, line: '{'};

        // Act
        const brokenInvariant = checkSaveInvariants(sectionsWithTwoHosts, [unreadableLine]);

        // Assert
        expect(brokenInvariant?.code).toBe('unreadable-lines');
      });
    });
  });

  describe('When the save designates no host or more than one', () => {
    it('should report the host count found', () => {
      // Act
      const brokenInvariant = checkSaveInvariants(sectionsWithTwoHosts, noUnreadableLines);

      // Assert
      expect<BrokenSaveInvariant | null>(brokenInvariant).toEqual({code: 'no-unique-host', hostCount: 2});
    });
  });
});
