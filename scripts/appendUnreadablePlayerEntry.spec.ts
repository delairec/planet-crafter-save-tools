import {describe, expect, it} from 'bun:test';
import {appendUnreadablePlayerEntry} from './appendUnreadablePlayerEntry.ts';

describe('appendUnreadablePlayerEntry', () => {
  describe('When the players section holds one entry', () => {
    it('should append an entry no JSON parser can read after it, the other sections unchanged', () => {
      // Arrange
      const saveContent = 'progression@levels@{"name":"Nikowa"}@worldObjects';

      // Act
      const result = appendUnreadablePlayerEntry(saveContent);

      // Assert
      expect(result).toBe('progression@levels@{"name":"Nikowa"}|\n{ broken entry@worldObjects');
    });
  });
});
