import {describe, expect, it} from 'bun:test';
import {readFile} from 'node:fs/promises';
import {generateMergeCliFixtures, MERGE_CLI_FIXTURES, resolveMergeCliFixturePath} from './generate-merge-cli-fixtures.ts';

describe('generateMergeCliFixtures', () => {
  describe('When the fixtures are generated', () => {
    it('should write every fixture into the directory the merge CLI specs read, then print their count', async () => {
      // Arrange
      const printed: string[] = [];

      // Act
      await generateMergeCliFixtures(line => printed.push(line));

      // Assert
      const writtenContents = await Promise.all(MERGE_CLI_FIXTURES.map(({fileName}) => readFile(resolveMergeCliFixturePath(fileName), 'utf8')));
      expect(writtenContents).toEqual(MERGE_CLI_FIXTURES.map(({generateContent}) => generateContent()));
      expect(printed).toEqual(['generate:merge-cli-fixtures: 12 fixture(s) written to packages/cli-merge/testing/fixtures.']);
    });
  });
});
