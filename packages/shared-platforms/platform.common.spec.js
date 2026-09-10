import {afterEach, describe, expect, it, spyOn} from 'bun:test';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';
import {exitProcess, getBasename, getCliArguments, joinPath, readDirectory} from './platform.common.js';

describe('readDirectory', () => {
  /** @type {string[]} */
  const temporaryDirectories = [];

  afterEach(async () => {
    await Promise.all(temporaryDirectories.splice(0).map(directory => fs.rm(directory, {recursive: true, force: true})));
  });

  async function createTemporaryDirectory() {
    const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'platform-common-'));
    temporaryDirectories.push(directory);

    return directory;
  }

  describe('When the folder holds a save file', () => {
    it('should return its name', async () => {
      // Arrange
      const directory = await createTemporaryDirectory();
      await fs.writeFile(path.join(directory, 'Standard-1.json'), 'save content', 'utf8');

      // Act
      const entries = await readDirectory(directory);

      // Assert
      expect(entries).toEqual(['Standard-1.json']);
    });
  });

  describe('When the folder is empty', () => {
    it('should return no name', async () => {
      // Arrange
      const directory = await createTemporaryDirectory();

      // Act
      const entries = await readDirectory(directory);

      // Assert
      expect(entries).toEqual([]);
    });
  });

  describe('When the folder does not exist', () => {
    it('should reject', async () => {
      // Arrange
      const missingDirectory = path.join(os.tmpdir(), 'platform-common-absent-folder');

      // Act
      const execute = readDirectory(missingDirectory);

      // Assert
      await expect(execute).rejects.toThrow();
    });
  });
});

describe('joinPath', () => {

  it('should assemble the segments into a single path', () => {
    // Act
    const result = joinPath('output', 'Test', 'Standard-1-Standard-2-merged.json');

    // Assert
    expect(result).toBe('output/Test/Standard-1-Standard-2-merged.json');
  });

  describe('When a segment already ends with a separator', () => {
    it('should not double it', () => {
      // Act
      const result = joinPath('output/', 'Test');

      // Assert
      expect(result).toBe('output/Test');
    });
  });
});

describe('getBasename', () => {

  it('should return the last segment of the path', () => {
    // Act
    const result = getBasename('input/Test/Standard-1.json');

    // Assert
    expect(result).toBe('Standard-1.json');
  });

  describe('When the extension is given', () => {
    it('should strip it from the returned name', () => {
      // Act
      const result = getBasename('input/Test/Standard-1.json', '.json');

      // Assert
      expect(result).toBe('Standard-1');
    });
  });

  describe('When the extension is given but the name does not carry it', () => {
    it('should return the name untouched', () => {
      // Act
      const result = getBasename('input/Test/Standard-1.txt', '.json');

      // Assert
      expect(result).toBe('Standard-1.txt');
    });
  });
});

describe('getCliArguments', () => {

  it('should hand back the argument vector of the running process', () => {
    // Act
    const result = getCliArguments();

    // Assert
    expect(result).toBe(process.argv);
  });
});

describe('exitProcess', () => {

  it('should end the process with the given status code, without returning', () => {
    // Arrange
    const failureStatusCode = 1;
    // `process.exit` never returns, so the double standing in for it must not return either.
    const processEnded = new Error('process ended');
    const exitSpy = spyOn(process, 'exit').mockImplementation(() => {
      throw processEnded;
    });

    // Act
    const execute = () => exitProcess(failureStatusCode);

    // Assert
    expect(execute).toThrow(processEnded);
    expect(exitSpy).toHaveBeenCalledWith(failureStatusCode);
  });
});
