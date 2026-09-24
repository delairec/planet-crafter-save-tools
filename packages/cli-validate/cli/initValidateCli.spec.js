import {beforeEach, describe, expect, it, mock, spyOn} from 'bun:test';
import {initValidateCli} from './initValidateCli.js';
import {NON_JSON_SAVE_FILE_PATH, SAVE_FILE_PATH} from '../testing/fakePaths.js';
import {VALID_SAVE_CONTENT} from '../testing/fakeValidSaveContent.js';
import {INVALID_SAVE_CONTENT} from '../testing/fakeInvalidSaveContent.js';
import {SAVE_CONTENT_WITH_INVALID_ENTRY} from '../testing/fakeSaveContentWithInvalidEntry.js';
import {VALIDATE_CLI_HELP} from '../testing/validateCliHelp.js';
import {createLegacyFakeSaveContent} from 'shared-save-processing/testing/createFakeSaveContent.js';

const NO_ARGUMENTS = [];
const CLI_RELEASE = {name: 'cli-validate', version: '1.4.2'};

describe('Validate CLI', () => {
  let consoleLogSpy;
  let consoleErrorSpy;
  let consoleWarnSpy;
  let readTextFile;
  let exitProcess;

  function initCli(argv) {
    return initValidateCli({readTextFile, exitProcess}, argv, CLI_RELEASE);
  }

  beforeEach(() => {
    consoleLogSpy = spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = spyOn(console, 'error').mockImplementation(() => {});
    consoleWarnSpy = spyOn(console, 'warn').mockImplementation(() => {});

    readTextFile = mock();
    exitProcess = mock();
  });

  describe('When the version is asked', () => {
    it('should print the name and the version of the command on stdout', async () => {
      // Arrange
      const {main} = initCli(['--version']);

      // Act
      await main();

      // Assert
      expect(consoleLogSpy).toHaveBeenCalledWith('cli-validate 1.4.2');
    });

    it('should exit with code 0 without reading any file', async () => {
      // Arrange
      const {main} = initCli(['--version']);

      // Act
      await main();

      // Assert
      expect(readTextFile).not.toHaveBeenCalled();
      expect(exitProcess).toHaveBeenCalledWith(0);
    });
  });

  describe('When the version is asked beside an argument the command does not accept', () => {
    it('should refuse the run with code 1 without printing the version', async () => {
      // Arrange
      const {main} = initCli(['--version', '--fil=save.json']);

      // Act
      await main();

      // Assert
      expect(consoleLogSpy).not.toHaveBeenCalled();
      expect(exitProcess).toHaveBeenCalledWith(1);
    });
  });

  describe('When no file path is provided', () => {
    it('should exit with code 1', async () => {
      // Arrange
      const {main} = initCli(NO_ARGUMENTS);

      // Act
      await main();

      // Assert
      expect(exitProcess).toHaveBeenCalledWith(1);
    });

    it('should print the help on stderr', async () => {
      // Arrange
      const {main} = initCli(NO_ARGUMENTS);

      // Act
      await main();

      // Assert
      expect(consoleErrorSpy.mock.calls).toEqual([[VALIDATE_CLI_HELP]]);
    });

    it('should not read any file', async () => {
      // Arrange
      const {main} = initCli(NO_ARGUMENTS);

      // Act
      await main();

      // Assert
      expect(readTextFile).not.toHaveBeenCalled();
    });
  });

  describe('When the --file flag carries no path', () => {
    it('should print the help rather than read an empty path', async () => {
      // Arrange
      const {main} = initCli(['--file=']);

      // Act
      await main();

      // Assert
      expect(consoleErrorSpy.mock.calls).toEqual([[VALIDATE_CLI_HELP]]);
      expect(readTextFile).not.toHaveBeenCalled();
    });
  });

  describe('When the help is asked', () => {
    it('should print the help of the command on stdout', async () => {
      // Arrange
      const {main} = initCli(['--help']);

      // Act
      await main();

      // Assert
      expect(consoleLogSpy.mock.calls).toEqual([[VALIDATE_CLI_HELP]]);
    });

    it('should exit with code 0 without reading any file', async () => {
      // Arrange
      const {main} = initCli([`--file=${SAVE_FILE_PATH}`, '--help']);

      // Act
      await main();

      // Assert
      expect(readTextFile).not.toHaveBeenCalled();
      expect(exitProcess).toHaveBeenCalledWith(0);
    });
  });

  describe('When the help is asked beside the version and an argument the command does not accept', () => {
    it('should print the help alone and exit with code 0', async () => {
      // Arrange
      const {main} = initCli(['--fil=Standard-1.json', '--version', '--help']);

      // Act
      await main();

      // Assert
      expect(consoleLogSpy.mock.calls).toEqual([[VALIDATE_CLI_HELP]]);
      expect(consoleErrorSpy).not.toHaveBeenCalled();
      expect(exitProcess).toHaveBeenCalledWith(0);
    });
  });

  describe('When the help is asked by its short form', () => {
    it('should name -h as an unknown argument and exit with code 1', async () => {
      // Arrange
      const {main} = initCli(['-h']);

      // Act
      await main();

      // Assert
      expect(consoleErrorSpy).toHaveBeenCalledWith('✖ Unknown argument(s): -h');
      expect(exitProcess).toHaveBeenCalledWith(1);
    });
  });

  describe('When an argument names no flag the command accepts', () => {
    it('should name that argument on stderr, followed by the help', async () => {
      // Arrange
      const {main} = initCli(['--fil=Standard-1.json']);

      // Act
      await main();

      // Assert
      expect(consoleErrorSpy.mock.calls).toEqual([['✖ Unknown argument(s): --fil=Standard-1.json'], [VALIDATE_CLI_HELP]]);
      expect(consoleLogSpy).not.toHaveBeenCalled();
    });

    it('should exit with code 1 without reading any file', async () => {
      // Arrange
      const {main} = initCli([`--file=${SAVE_FILE_PATH}`, '--verbose']);

      // Act
      await main();

      // Assert
      expect(readTextFile).not.toHaveBeenCalled();
      expect(exitProcess).toHaveBeenCalledWith(1);
    });

  });

  describe('When the Node command passes the platform flag', () => {
    it('should validate the save all the same', async () => {
      // Arrange
      readTextFile.mockResolvedValue(VALID_SAVE_CONTENT);
      const {main} = initCli(['--platform=node', `--file=${SAVE_FILE_PATH}`]);

      // Act
      await main();

      // Assert
      expect(consoleLogSpy).toHaveBeenCalledWith(`✓ ${SAVE_FILE_PATH} is valid`);
    });
  });

  describe('When the path of the save file holds an equals sign', () => {
    it('should read the path whole', async () => {
      // Arrange
      const pathHoldingAnEqualsSign = 'saves/a=b/Standard-1.json';
      readTextFile.mockResolvedValue(VALID_SAVE_CONTENT);
      const {main} = initCli([`--file=${pathHoldingAnEqualsSign}`]);

      // Act
      await main();

      // Assert
      expect(readTextFile).toHaveBeenCalledWith(pathHoldingAnEqualsSign);
    });
  });

  describe('When the save file is valid', () => {
    beforeEach(() => {
      readTextFile.mockResolvedValue(VALID_SAVE_CONTENT);
    });

    it('should announce the verdict on stdout', async () => {
      // Arrange
      const {main} = initCli([`--file=${SAVE_FILE_PATH}`]);

      // Act
      await main();

      // Assert
      expect(consoleLogSpy).toHaveBeenCalledWith(`✓ ${SAVE_FILE_PATH} is valid`);
    });

    it('should exit with code 0', async () => {
      // Arrange
      const {main} = initCli([`--file=${SAVE_FILE_PATH}`]);

      // Act
      await main();

      // Assert
      expect(exitProcess).toHaveBeenCalledWith(0);
    });

    it('should read the file the --file flag names', async () => {
      // Arrange
      const {main} = initCli([`--file=${SAVE_FILE_PATH}`]);

      // Act
      await main();

      // Assert
      expect(readTextFile).toHaveBeenCalledWith(SAVE_FILE_PATH);
    });
  });

  describe('When the save file is invalid', () => {
    it('should exit with code 1', async () => {
      // Arrange
      readTextFile.mockResolvedValue(INVALID_SAVE_CONTENT);
      const {main} = initCli([`--file=${SAVE_FILE_PATH}`]);

      // Act
      await main();

      // Assert
      expect(exitProcess).toHaveBeenCalledWith(1);
    });

    it('should head the report with the file and how many errors it holds', async () => {
      // Arrange
      readTextFile.mockResolvedValue(INVALID_SAVE_CONTENT);
      const {main} = initCli([`--file=${SAVE_FILE_PATH}`]);

      // Act
      await main();

      // Assert
      expect(consoleErrorSpy).toHaveBeenCalledWith(`✖ ${SAVE_FILE_PATH} has 1 error(s):\n`);
    });

    it('should tell where in the save file each error was found', async () => {
      // Arrange
      readTextFile.mockResolvedValue(SAVE_CONTENT_WITH_INVALID_ENTRY);
      const {main} = initCli([`--file=${SAVE_FILE_PATH}`]);

      // Act
      await main();

      // Assert
      expect(consoleErrorSpy).toHaveBeenCalledWith('  [Players (section 2), entry 1] Invalid JSON: { broken entry');
    });

    it('should report an error concerning the whole file without any location', async () => {
      // Arrange
      readTextFile.mockResolvedValue(INVALID_SAVE_CONTENT);
      const {main} = initCli([`--file=${SAVE_FILE_PATH}`]);

      // Act
      await main();

      // Assert
      expect(consoleErrorSpy).toHaveBeenCalledWith('  Expected 11 or 12 sections but found 1');
    });
  });

  describe('When the file is not a JSON file', () => {
    beforeEach(() => {
      readTextFile.mockResolvedValue(VALID_SAVE_CONTENT);
    });

    it('should reject it whatever its content', async () => {
      // Arrange
      const {main} = initCli([`--file=${NON_JSON_SAVE_FILE_PATH}`]);

      // Act
      await main();

      // Assert
      expect(consoleErrorSpy).toHaveBeenCalledWith('  Invalid file extension: expected a .json file.');
    });

    it('should exit with code 1', async () => {
      // Arrange
      const {main} = initCli([`--file=${NON_JSON_SAVE_FILE_PATH}`]);

      // Act
      await main();

      // Assert
      expect(exitProcess).toHaveBeenCalledWith(1);
    });
  });

  describe('When the save file is in the legacy format', () => {
    beforeEach(() => {
      readTextFile.mockResolvedValue(createLegacyFakeSaveContent());
    });

    it('should warn with a user message instead of the warning code', async () => {
      // Arrange
      const {main} = initCli([`--file=${SAVE_FILE_PATH}`]);

      // Act
      await main();

      // Assert
      expect(consoleWarnSpy).toHaveBeenCalledWith('⚠ This save was written by version 1.618 of the game or earlier, in the format that still carries the Terrain Layers section.');
    });

    it('should still report the save as valid', async () => {
      // Arrange
      const {main} = initCli([`--file=${SAVE_FILE_PATH}`]);

      // Act
      await main();

      // Assert
      expect(exitProcess).toHaveBeenCalledWith(0);
    });
  });
});
