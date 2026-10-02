import {describe, expect, it} from 'bun:test';
import {readFile} from 'node:fs/promises';
import {generateValidateCliFixtures, resolveValidateCliFixturePath, VALIDATE_CLI_FIXTURES} from './generate-validate-cli-fixtures.ts';

describe('generateValidateCliFixtures', () => {
  describe('When the fixtures are generated', () => {
    it('should write every fixture into the directory the validate CLI specs read, then print their count', async () => {
      // Arrange
      const printed: string[] = [];

      // Act
      await generateValidateCliFixtures(line => printed.push(line));

      // Assert
      const writtenContents = await Promise.all(VALIDATE_CLI_FIXTURES.map(({fileName}) => readFile(resolveValidateCliFixturePath(fileName), 'utf8')));
      expect(writtenContents).toEqual(VALIDATE_CLI_FIXTURES.map(({generateContent}) => generateContent()));
      expect(printed).toEqual(['generate:validate-cli-fixtures: 3 fixture(s) written to packages/cli-validate/testing/fixtures.']);
    });
  });
});
