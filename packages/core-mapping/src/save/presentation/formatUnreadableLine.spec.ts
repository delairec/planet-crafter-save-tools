import {describe, expect, it} from 'bun:test';
import {formatUnreadableLine} from './formatUnreadableLine';
import type {UnreadableLineResponse} from '../application/responses/UnreadableLineResponse';
import {SaveValidationMessageViewModel} from './viewModels/SaveValidationMessageViewModel';

describe('formatUnreadableLine', () => {

  describe('When the line is not valid JSON', () => {
    it('should present the line as invalid JSON at its location', () => {
      // Arrange
      const invalidJsonLine: UnreadableLineResponse = {code: 'invalid-json', section: {name: 'worldObjects', index: 78}, entryIndex: 2, line: '{not valid json'};

      // Act
      const message = formatUnreadableLine(invalidJsonLine);

      // Assert
      expect<SaveValidationMessageViewModel>(message).toEqual({message: 'Invalid JSON: {not valid json', location: 'World objects (section 78), entry 2'});
    });
  });

  describe('When the entry is valid JSON the save format cannot decode', () => {
    it('should present the line as an entry the save format cannot decode at its location', () => {
      // Arrange
      const undecodableEntryLine: UnreadableLineResponse = {code: 'undecodable-entry', section: {name: 'inventories', index: 4}, entryIndex: 0, line: '{"id":44,"woIds":"","size":20,"foreignField":3}'};

      // Act
      const message = formatUnreadableLine(undecodableEntryLine);

      // Assert
      expect<SaveValidationMessageViewModel>(message).toEqual({
        message: 'Entry the save format cannot decode: {"id":44,"woIds":"","size":20,"foreignField":3}',
        location: 'Inventories (section 4), entry 0'
      });
    });
  });
});
