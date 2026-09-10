import {beforeEach, describe, expect, it, mock, spyOn} from 'bun:test';
import {initMergeCli} from './initMergeCli.js';
import {
  FAKE_SAVE_STRING_A,
  FAKE_SAVE_STRING_B,
  FAKE_SAVE_STRING_WITH_INVALID_ENTRY,
  LEGACY_FAKE_SAVE_STRING_A
} from '../testing/fakeSaveStrings.js';
import {
  MERGED_SAVE_OUTPUT_PATH,
  SAVE_A_FILENAME,
  SAVE_A_INPUT_PATH,
  SAVE_B_FILENAME,
  SAVE_B_INPUT_PATH,
  INPUT_SUBFOLDER_ALPHA,
  OUTPUT_DIR
} from '../testing/fakePaths.js';

const NO_INPUT_FOLDERS = [];
const SINGLE_SAVE_FILENAME = 'only-one.json';
const USAGE_MESSAGE = 'Usage: bun merge -- [--input=<directory>] [--output=<directory>]';

describe('Merge CLI', () => {
  let consoleLogSpy;
  let consoleErrorSpy;
  let readDirectory;
  let readTextFile;
  let writeTextFile;
  let exitProcess;
  let main;

  function serveSaves(saveContentsByPath) {
    readTextFile.mockImplementation(path => {
      const saveContent = saveContentsByPath[path];

      if (saveContent === undefined) {
        return Promise.reject(new Error(`Unexpected path: ${path}`));
      }
      return Promise.resolve(saveContent);
    });
  }

  function initCli(argv) {
    const fakePlatform = {
      readDirectory,
      readTextFile,
      writeTextFile,
      joinPath: (...segments) => segments.join('/'),
      exitProcess,
    };

    return initMergeCli(fakePlatform, argv);
  }

  beforeEach(() => {
    consoleLogSpy = spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = spyOn(console, 'error').mockImplementation(() => {});
    readDirectory = mock();
    readTextFile = mock();
    writeTextFile = mock(() => Promise.resolve());
    exitProcess = mock();

    ({main} = initCli());
  });

  describe('When no input folder contains exactly two JSON files', () => {
    it('should report zero folders to process and write nothing', async () => {
      // Arrange
      readDirectory.mockResolvedValueOnce([INPUT_SUBFOLDER_ALPHA]);
      readDirectory.mockResolvedValueOnce([SINGLE_SAVE_FILENAME]);

      // Act
      await main();

      // Assert
      expect(writeTextFile).not.toHaveBeenCalled();
    });

    it('should exit with a distinct exit code', async () => {
      // Arrange
      readDirectory.mockResolvedValueOnce([INPUT_SUBFOLDER_ALPHA]);
      readDirectory.mockResolvedValueOnce([SINGLE_SAVE_FILENAME]);

      // Act
      await main();

      // Assert
      expect(exitProcess).toHaveBeenCalledWith(2);
    });

    it('should report the issue on stderr rather than stdout', async () => {
      // Arrange
      readDirectory.mockResolvedValueOnce([INPUT_SUBFOLDER_ALPHA]);
      readDirectory.mockResolvedValueOnce([SINGLE_SAVE_FILENAME]);

      // Act
      await main();

      // Assert
      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(consoleLogSpy).not.toHaveBeenCalled();
    });

    it('should warn that the folder was skipped and how many save files it holds', async () => {
      // Arrange
      readDirectory.mockResolvedValueOnce([INPUT_SUBFOLDER_ALPHA]);
      readDirectory.mockResolvedValueOnce([SINGLE_SAVE_FILENAME]);

      // Act
      await main();

      // Assert
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '⚠ Folder "Alpha" was skipped: it holds 1 JSON save file(s), exactly two are required.'
      );
    });
  });

  describe('When an input folder contains exactly two JSON files', () => {
    it('should produce one merged output file', async () => {
      // Arrange
      readDirectory.mockResolvedValueOnce([INPUT_SUBFOLDER_ALPHA]);
      readDirectory.mockResolvedValueOnce([SAVE_A_FILENAME, SAVE_B_FILENAME]);
      serveSaves({[SAVE_A_INPUT_PATH]: FAKE_SAVE_STRING_A, [SAVE_B_INPUT_PATH]: FAKE_SAVE_STRING_B});

      // Act
      await main();

      // Assert
      expect(writeTextFile).toHaveBeenCalledTimes(1);
      expect(writeTextFile.mock.calls[0][0]).toBe(MERGED_SAVE_OUTPUT_PATH);
    });

    it('should write the save string merged from both inputs', async () => {
      // Arrange
      readDirectory.mockResolvedValueOnce([INPUT_SUBFOLDER_ALPHA]);
      readDirectory.mockResolvedValueOnce([SAVE_A_FILENAME, SAVE_B_FILENAME]);
      serveSaves({[SAVE_A_INPUT_PATH]: FAKE_SAVE_STRING_A, [SAVE_B_INPUT_PATH]: FAKE_SAVE_STRING_B});

      // Act
      await main();

      // Assert
      const writtenContent = writeTextFile.mock.calls[0][1];
      const [globalMetadataSection] = writtenContent.split('\n@\n');
      expect(globalMetadataSection)
        .toBe('{"terraTokens":30,"allTimeTerraTokens":30,"unlockedGroups":"BootsSpeed1","openedInstanceSeed":0,"openedInstanceTimeLeft":0}');
    });
  });

  describe('When there are two valid input folders', () => {
    const FOLDER_BETA = 'Beta';
    const EXPECTED_OUTPUT_PATH_BETA = `${OUTPUT_DIR}/${FOLDER_BETA}/Standard-1-Standard-2-merged.json`;

    it('should produce one merged output file per folder', async () => {
      // Arrange
      readDirectory.mockResolvedValueOnce([INPUT_SUBFOLDER_ALPHA, FOLDER_BETA]);
      readDirectory.mockResolvedValueOnce([SAVE_A_FILENAME, SAVE_B_FILENAME]);
      readDirectory.mockResolvedValueOnce([SAVE_A_FILENAME, SAVE_B_FILENAME]);
      readTextFile.mockResolvedValue(FAKE_SAVE_STRING_A);

      // Act
      await main();

      // Assert
      expect(writeTextFile).toHaveBeenCalledTimes(2);
      const outputPaths = writeTextFile.mock.calls.map(call => call[0]);
      expect(outputPaths).toContain(MERGED_SAVE_OUTPUT_PATH);
      expect(outputPaths).toContain(EXPECTED_OUTPUT_PATH_BETA);
    });
  });

  describe('When a folder contains non-JSON files alongside JSON files', () => {
    it('should merge the two JSON saves and leave the other files alone', async () => {
      // Arrange
      const filesWithNonJson = [SAVE_A_FILENAME, 'readme.txt', SAVE_B_FILENAME, 'notes.md'];
      readDirectory.mockResolvedValueOnce([INPUT_SUBFOLDER_ALPHA]);
      readDirectory.mockResolvedValueOnce(filesWithNonJson);
      readTextFile.mockResolvedValue(FAKE_SAVE_STRING_A);

      // Act
      await main();

      // Assert
      expect(writeTextFile).toHaveBeenCalledTimes(1);
      const writtenPath = writeTextFile.mock.calls[0][0];
      expect(writtenPath).toBe(MERGED_SAVE_OUTPUT_PATH);
    });
  });

  describe('When the merge completes successfully', () => {
    it('should exit with code 0', async () => {
      // Arrange
      readDirectory.mockResolvedValueOnce([INPUT_SUBFOLDER_ALPHA]);
      readDirectory.mockResolvedValueOnce([SAVE_A_FILENAME, SAVE_B_FILENAME]);
      serveSaves({[SAVE_A_INPUT_PATH]: FAKE_SAVE_STRING_A, [SAVE_B_INPUT_PATH]: FAKE_SAVE_STRING_B});

      // Act
      await main();

      // Assert
      expect(exitProcess).toHaveBeenCalledWith(0);
    });

    it('should print the merged output path to stdout', async () => {
      // Arrange
      readDirectory.mockResolvedValueOnce([INPUT_SUBFOLDER_ALPHA]);
      readDirectory.mockResolvedValueOnce([SAVE_A_FILENAME, SAVE_B_FILENAME]);
      serveSaves({[SAVE_A_INPUT_PATH]: FAKE_SAVE_STRING_A, [SAVE_B_INPUT_PATH]: FAKE_SAVE_STRING_B});

      // Act
      await main();

      // Assert
      expect(consoleLogSpy).toHaveBeenCalledWith(MERGED_SAVE_OUTPUT_PATH);
    });

    it('should report nothing about a merged save that passes validation', async () => {
      // Arrange
      readDirectory.mockResolvedValueOnce([INPUT_SUBFOLDER_ALPHA]);
      readDirectory.mockResolvedValueOnce([SAVE_A_FILENAME, SAVE_B_FILENAME]);
      serveSaves({[SAVE_A_INPUT_PATH]: FAKE_SAVE_STRING_A, [SAVE_B_INPUT_PATH]: FAKE_SAVE_STRING_B});

      // Act
      await main();

      // Assert
      expect(consoleErrorSpy).not.toHaveBeenCalledWith(`✖ Folder "${INPUT_SUBFOLDER_ALPHA}" was merged, but the save file written does not pass validation:`);
    });
  });

  describe('When an input folder contains more than two JSON files', () => {
    const SAVE_C_FILENAME = 'Standard-3.json';

    it('should skip the folder and write nothing', async () => {
      // Arrange
      readDirectory.mockResolvedValueOnce([INPUT_SUBFOLDER_ALPHA]);
      readDirectory.mockResolvedValueOnce([SAVE_A_FILENAME, SAVE_B_FILENAME, SAVE_C_FILENAME]);
      readTextFile.mockResolvedValue(FAKE_SAVE_STRING_A);

      // Act
      await main();

      // Assert
      expect(writeTextFile).not.toHaveBeenCalled();
    });

    it('should warn that the folder was skipped and how many save files it holds', async () => {
      // Arrange
      readDirectory.mockResolvedValueOnce([INPUT_SUBFOLDER_ALPHA]);
      readDirectory.mockResolvedValueOnce([SAVE_A_FILENAME, SAVE_B_FILENAME, SAVE_C_FILENAME]);
      readTextFile.mockResolvedValue(FAKE_SAVE_STRING_A);

      // Act
      await main();

      // Assert
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '⚠ Folder "Alpha" was skipped: it holds 3 JSON save file(s), exactly two are required.'
      );
    });
  });

  describe('When a custom input directory is provided', () => {
    it('should read save folders from that directory', async () => {
      // Arrange
      ({main} = initCli(['--input=custom-input']));
      readDirectory.mockResolvedValueOnce(NO_INPUT_FOLDERS);

      // Act
      await main();

      // Assert
      expect(readDirectory).toHaveBeenCalledWith('custom-input');
    });
  });

  describe('When an argument names no flag the command accepts', () => {
    it('should name that argument and print a usage message', async () => {
      // Arrange
      ({main} = initCli(['--inpt=custom-input']));

      // Act
      await main();

      // Assert
      expect(consoleErrorSpy).toHaveBeenCalledWith('✖ Unknown argument(s): --inpt=custom-input');
      expect(consoleErrorSpy).toHaveBeenCalledWith(USAGE_MESSAGE);
    });

    it('should exit with code 1 without reading any directory', async () => {
      // Arrange
      ({main} = initCli(['--input', 'custom-input']));

      // Act
      await main();

      // Assert
      expect(readDirectory).not.toHaveBeenCalled();
      expect(exitProcess).toHaveBeenCalledWith(1);
    });
  });

  describe('When the Node command passes the platform flag', () => {
    it('should read the save folders all the same', async () => {
      // Arrange
      ({main} = initCli(['--platform=node', '--input=custom-input']));
      readDirectory.mockResolvedValueOnce(NO_INPUT_FOLDERS);

      // Act
      await main();

      // Assert
      expect(readDirectory).toHaveBeenCalledWith('custom-input');
    });
  });

  describe('When a custom output directory is provided', () => {
    it('should write the merged file under that directory', async () => {
      // Arrange
      ({main} = initCli(['--output=custom-output']));
      readDirectory.mockResolvedValueOnce([INPUT_SUBFOLDER_ALPHA]);
      readDirectory.mockResolvedValueOnce([SAVE_A_FILENAME, SAVE_B_FILENAME]);
      serveSaves({[SAVE_A_INPUT_PATH]: FAKE_SAVE_STRING_A, [SAVE_B_INPUT_PATH]: FAKE_SAVE_STRING_B});

      // Act
      await main();

      // Assert
      expect(writeTextFile.mock.calls[0][0]).toBe(`custom-output/${INPUT_SUBFOLDER_ALPHA}/Standard-1-Standard-2-merged.json`);
    });
  });

  describe('When an input save is in the legacy format', () => {
    beforeEach(() => {
      readDirectory.mockResolvedValueOnce([INPUT_SUBFOLDER_ALPHA]);
      readDirectory.mockResolvedValueOnce([SAVE_A_FILENAME, SAVE_B_FILENAME]);
      serveSaves({[SAVE_A_INPUT_PATH]: LEGACY_FAKE_SAVE_STRING_A, [SAVE_B_INPUT_PATH]: FAKE_SAVE_STRING_B});
    });

    it('should warn about the format adaptation of the affected save', async () => {
      // Act
      await main();

      // Assert
      expect(consoleErrorSpy).toHaveBeenCalledWith('  [save A] This save was created by an older version of the game and has been adapted to the current format. The obsolete Terrain Layers section was ignored.');
    });

    it('should name the folder the warning comes from', async () => {
      // Act
      await main();

      // Assert
      expect(consoleErrorSpy).toHaveBeenCalledWith(`⚠ Folder "${INPUT_SUBFOLDER_ALPHA}" has warnings on its save files:`);
    });

    it('should still write the merged file', async () => {
      // Act
      await main();

      // Assert
      expect(writeTextFile.mock.calls[0][0]).toBe(MERGED_SAVE_OUTPUT_PATH);
    });

    it('should still exit successfully', async () => {
      // Act
      await main();

      // Assert
      expect(exitProcess).toHaveBeenCalledWith(0);
    });
  });

  describe('When a folder contains a save with an invalid entry', () => {
    beforeEach(() => {
      readDirectory.mockResolvedValueOnce([INPUT_SUBFOLDER_ALPHA]);
      readDirectory.mockResolvedValueOnce([SAVE_A_FILENAME, SAVE_B_FILENAME]);
      serveSaves({[SAVE_A_INPUT_PATH]: FAKE_SAVE_STRING_WITH_INVALID_ENTRY, [SAVE_B_INPUT_PATH]: FAKE_SAVE_STRING_B});
    });

    it('should tell where in the save the error was found', async () => {
      // Act
      await main();

      // Assert
      expect(consoleErrorSpy).toHaveBeenCalledWith('  [save A] [Players (section 2), entry 1] Invalid JSON: { broken entry');
    });

    it('should name the folder the invalid save comes from', async () => {
      // Act
      await main();

      // Assert
      expect(consoleErrorSpy).toHaveBeenCalledWith(`✖ Folder "${INPUT_SUBFOLDER_ALPHA}" contains an invalid save file:`);
    });

    it('should write no merged file', async () => {
      // Act
      await main();

      // Assert
      expect(writeTextFile).not.toHaveBeenCalled();
    });

    it('should still exit successfully, the verdict on an input file belonging to validation', async () => {
      // Act
      await main();

      // Assert
      expect(exitProcess).toHaveBeenCalledWith(0);
    });
  });

  describe('When the merged save does not pass validation', () => {
    const FOLDER_NAME_HOLDING_A_SECTION_SEPARATOR = 'Alpha@Beta';
    const MERGED_SAVE_PATH = `${OUTPUT_DIR}/${FOLDER_NAME_HOLDING_A_SECTION_SEPARATOR}/Standard-1-Standard-2-merged.json`;
    const SAVE_A_PATH = `input/${FOLDER_NAME_HOLDING_A_SECTION_SEPARATOR}/${SAVE_A_FILENAME}`;
    const SAVE_B_PATH = `input/${FOLDER_NAME_HOLDING_A_SECTION_SEPARATOR}/${SAVE_B_FILENAME}`;

    beforeEach(() => {
      readDirectory.mockResolvedValueOnce([FOLDER_NAME_HOLDING_A_SECTION_SEPARATOR]);
      readDirectory.mockResolvedValueOnce([SAVE_A_FILENAME, SAVE_B_FILENAME]);
      serveSaves({[SAVE_A_PATH]: FAKE_SAVE_STRING_A, [SAVE_B_PATH]: FAKE_SAVE_STRING_B});
    });

    it('should name the folder and what the save it wrote does not pass', async () => {
      // Act
      await main();

      // Assert
      expect(consoleErrorSpy).toHaveBeenCalledWith(`✖ Folder "${FOLDER_NAME_HOLDING_A_SECTION_SEPARATOR}" was merged, but the save file written does not pass validation:`);
      expect(consoleErrorSpy).toHaveBeenCalledWith('  [Save configuration (section 8), entry 0] Invalid JSON: {"saveDisplayName":"Alpha');
    });

    it('should blame neither save A nor save B for a defect the merge created', async () => {
      // Act
      await main();

      // Assert
      expect(consoleErrorSpy).not.toHaveBeenCalledWith(`✖ Folder "${FOLDER_NAME_HOLDING_A_SECTION_SEPARATOR}" contains an invalid save file:`);
    });

    it('should still write the merged save and announce it on stdout', async () => {
      // Act
      await main();

      // Assert
      expect(writeTextFile.mock.calls[0][0]).toBe(MERGED_SAVE_PATH);
      expect(consoleLogSpy).toHaveBeenCalledWith(MERGED_SAVE_PATH);
    });

    it('should still exit successfully, the merged save being there to be used', async () => {
      // Act
      await main();

      // Assert
      expect(exitProcess).toHaveBeenCalledWith(0);
    });
  });

  describe('When the merged save cannot be written', () => {
    const WRITE_FAILURE_REASON = 'EACCES: permission denied';

    beforeEach(() => {
      readDirectory.mockResolvedValueOnce([INPUT_SUBFOLDER_ALPHA]);
      readDirectory.mockResolvedValueOnce([SAVE_A_FILENAME, SAVE_B_FILENAME]);
      readTextFile.mockResolvedValue(FAKE_SAVE_STRING_A);
      writeTextFile.mockImplementation(() => Promise.reject(new Error(WRITE_FAILURE_REASON)));
    });

    it('should name the folder, the output path and the reason', async () => {
      // Act
      await main();

      // Assert
      expect(consoleErrorSpy).toHaveBeenCalledWith(`✖ Folder "${INPUT_SUBFOLDER_ALPHA}" was merged but could not be written to "${MERGED_SAVE_OUTPUT_PATH}": ${WRITE_FAILURE_REASON}`);
    });

    it('should not announce a merged file it failed to write', async () => {
      // Act
      await main();

      // Assert
      expect(consoleLogSpy).not.toHaveBeenCalled();
    });

    it('should exit with the failure code', async () => {
      // Act
      await main();

      // Assert
      expect(exitProcess).toHaveBeenCalledWith(1);
    });
  });
});
