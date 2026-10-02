import {afterEach, beforeEach, describe, expect, it} from 'bun:test';
import {mkdtemp, readFile, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {writeSaveFixtures} from './writeSaveFixtures.ts';

describe('writeSaveFixtures', () => {
  let temporaryDirectory: string;

  beforeEach(async () => {
    temporaryDirectory = await mkdtemp(join(tmpdir(), 'save-fixtures-'));
  });

  afterEach(async () => {
    await rm(temporaryDirectory, {recursive: true, force: true});
  });

  describe('When the directory does not exist yet', () => {
    it('should create it and write each fixture under its file name', async () => {
      // Arrange
      const directoryPath = join(temporaryDirectory, 'testing', 'fixtures');
      const fixtures = [
        {fileName: 'first_valid.json', generateContent: () => 'first save'},
        {fileName: 'second_invalid.json', generateContent: () => 'second save'}
      ];

      // Act
      await writeSaveFixtures({directoryPath, fixtures});

      // Assert
      expect(await readFile(join(directoryPath, 'first_valid.json'), 'utf8')).toBe('first save');
      expect(await readFile(join(directoryPath, 'second_invalid.json'), 'utf8')).toBe('second save');
    });
  });
});
