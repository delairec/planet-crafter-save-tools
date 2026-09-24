import {beforeEach, describe, expect, it, spyOn} from 'bun:test';
import {renderMergedSaveIssues} from './renderMergeCliOutput.js';

describe('renderMergedSaveIssues', () => {
  let consoleErrorSpy;

  beforeEach(() => {
    consoleErrorSpy = spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('When the merged save passes validation', () => {
    it('should print nothing', () => {
      // Arrange
      const noMergeErrors = [];

      // Act
      renderMergedSaveIssues('Alpha', noMergeErrors);

      // Assert
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });
  });

  describe('When the merged save does not pass validation', () => {
    it('should name the folder, then print each error on stderr with its location when it has one', () => {
      // Act
      renderMergedSaveIssues('Alpha', [
        {message: 'Invalid JSON: {"saveDisplayName":"Alpha', location: 'Save configuration (section 8), entry 0'},
        {message: 'Expected exactly one host player, found 2', location: null}
      ]);

      // Assert
      expect(consoleErrorSpy.mock.calls).toEqual([
        ['✖ Folder "Alpha" was merged, but the save file written does not pass validation:'],
        ['  [Save configuration (section 8), entry 0] Invalid JSON: {"saveDisplayName":"Alpha'],
        ['  Expected exactly one host player, found 2']
      ]);
    });
  });
});
