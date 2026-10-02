import {describe, expect, it} from 'bun:test';
import {createFakeScriptIo} from '../../common/testing/createFakeScriptIo.ts';
import {applyAllowList, readAllowList} from './shrinkingAllowList.ts';

describe('readAllowList', () => {

  describe('When the allow-list is a JSON array of file paths', () => {
    it('should return those paths with the path of the list', async () => {
      // Arrange
      const {io} = createFakeScriptIo({
        files: {'scripts/allow-lists/sample.json': '["packages/core-a/src/One.ts", "packages/core-a/src/Two.ts"]'}
      });

      // Act
      const allowList = await readAllowList(io, 'scripts/allow-lists/sample.json');

      // Assert
      expect(allowList).toEqual({
        path: 'scripts/allow-lists/sample.json',
        files: ['packages/core-a/src/One.ts', 'packages/core-a/src/Two.ts']
      });
    });
  });

  describe('When the allow-list is not an array of file paths', () => {
    it.each([
      ['an object', '{"files": []}'],
      ['an array holding a number', '["packages/core-a/src/One.ts", 3]']
    ])('should refuse %s', async (_shape, content) => {
      // Arrange
      const {io} = createFakeScriptIo({files: {'scripts/allow-lists/sample.json': content}});

      // Act
      const reading = readAllowList(io, 'scripts/allow-lists/sample.json');

      // Assert
      await expect(reading).rejects.toThrow('scripts/allow-lists/sample.json must be a JSON array of file paths');
    });
  });
});

describe('applyAllowList', () => {

  describe('When a reported file is not listed', () => {
    it('should keep its violations', () => {
      // Arrange
      const emptyAllowList = {path: 'scripts/allow-lists/sample.json', files: []};
      const violationsByFile = new Map([['packages/core-a/src/One.ts', ['One.ts:1: first', 'One.ts:2: second']]]);

      // Act
      const violations = applyAllowList(emptyAllowList, violationsByFile);

      // Assert
      expect(violations).toEqual(['One.ts:1: first', 'One.ts:2: second']);
    });
  });

  describe('When a reported file is listed', () => {
    it('should drop its violations', () => {
      // Arrange
      const allowList = {path: 'scripts/allow-lists/sample.json', files: ['packages/core-a/src/One.ts']};
      const violationsByFile = new Map([
        ['packages/core-a/src/One.ts', ['One.ts:1: first']],
        ['packages/core-a/src/Two.ts', ['Two.ts:4: fourth']]
      ]);

      // Act
      const violations = applyAllowList(allowList, violationsByFile);

      // Assert
      expect(violations).toEqual(['Two.ts:4: fourth']);
    });
  });

  describe('When a listed file is no longer reported', () => {
    it('should report its entry as one to remove', () => {
      // Arrange
      const allowList = {path: 'scripts/allow-lists/sample.json', files: ['packages/core-a/src/Fixed.ts']};
      const noViolation = new Map<string, string[]>();

      // Act
      const violations = applyAllowList(allowList, noViolation);

      // Assert
      expect(violations).toEqual([
        'scripts/allow-lists/sample.json: packages/core-a/src/Fixed.ts is no longer reported\n  remove its entry: the allow-list only shrinks'
      ]);
    });
  });
});
