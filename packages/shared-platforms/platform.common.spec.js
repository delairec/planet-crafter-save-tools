import {afterEach, beforeEach, describe, expect, it, spyOn} from 'bun:test';
import {mkdtemp, rm, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import process from 'node:process';
import {exitProcess, getBasename, getCliArguments, joinPath, readDirectory} from './platform.common.js';

const SAVE_FILE_NAME = 'Standard-1.json';
const SAVE_CONTENT = 'save content';
const MISSING_FOLDER_NAME = 'no-such-folder';

describe('readDirectory', () => {
  let saveFolderPath;

  beforeEach(async () => {
    saveFolderPath = await mkdtemp(join(tmpdir(), 'platform-common-'));
  });

  afterEach(async () => {
    await rm(saveFolderPath, {recursive: true, force: true});
  });

  describe('When the folder holds a save file', () => {
    it('should return its name', async () => {
      // Arrange
      await writeFile(join(saveFolderPath, SAVE_FILE_NAME), SAVE_CONTENT, 'utf8');

      // Act
      const entries = await readDirectory(saveFolderPath);

      // Assert
      expect(entries).toEqual([SAVE_FILE_NAME]);
    });
  });

  describe('When the folder is empty', () => {
    it('should return no name', async () => {
      // Act
      const entries = await readDirectory(saveFolderPath);

      // Assert
      expect(entries).toEqual([]);
    });
  });

  describe('When the folder does not exist', () => {
    it('should reject', async () => {
      // Arrange
      const missingFolderPath = join(saveFolderPath, MISSING_FOLDER_NAME);

      // Act
      const execute = readDirectory(missingFolderPath);

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
  const FAILURE_STATUS_CODE = 1;
  // `process.exit` never returns, so the double standing in for it must not return either.
  const processEnded = new Error('process ended');
  let exitSpy;

  beforeEach(() => {
    exitSpy = spyOn(process, 'exit').mockImplementation(() => {
      throw processEnded;
    });
  });

  afterEach(() => {
    exitSpy.mockRestore();
  });

  it('should end the process with the given status code, without returning', () => {
    // Act
    const execute = () => exitProcess(FAILURE_STATUS_CODE);

    // Assert
    expect(execute).toThrow(processEnded);
    expect(exitSpy).toHaveBeenCalledWith(FAILURE_STATUS_CODE);
  });
});
