import {describe, expect, it, mock} from 'bun:test';
import {runWhenEntryPoint} from './runWhenEntryPoint.js';

const UNEXPECTED_ERROR_EXIT_CODE = 1;
const COMMAND_FAILURE = new Error('input folder unreadable');
const ENTRY_POINT_META = {main: true};
const IMPORTED_MODULE_META = {main: false};

function createPlatform() {
  return {
    isEntryPoint: importMeta => importMeta.main === true,
    exitProcess: mock()
  };
}

function createEntryPointRun(importMeta, main) {
  return {
    importMeta,
    main,
    renderUnexpectedError: mock(),
    unexpectedErrorExitCode: UNEXPECTED_ERROR_EXIT_CODE
  };
}

async function succeed() {}

async function failUnexpectedly() {
  throw COMMAND_FAILURE;
}

describe('runWhenEntryPoint', () => {
  describe('When the module is imported by another one', () => {
    it('should not run the command', async () => {
      // Arrange
      const main = mock(succeed);
      const entryPointRun = createEntryPointRun(IMPORTED_MODULE_META, main);

      // Act
      await runWhenEntryPoint(createPlatform(), entryPointRun);

      // Assert
      expect(main).not.toHaveBeenCalled();
    });
  });

  describe('When the module is the entry point', () => {
    it('should run the command', async () => {
      // Arrange
      const main = mock(succeed);
      const entryPointRun = createEntryPointRun(ENTRY_POINT_META, main);

      // Act
      await runWhenEntryPoint(createPlatform(), entryPointRun);

      // Assert
      expect(main).toHaveBeenCalledTimes(1);
    });
  });

  describe('When the command succeeds', () => {
    it('should leave the exit code to the command', async () => {
      // Arrange
      const platform = createPlatform();
      const entryPointRun = createEntryPointRun(ENTRY_POINT_META, succeed);

      // Act
      await runWhenEntryPoint(platform, entryPointRun);

      // Assert
      expect(platform.exitProcess).not.toHaveBeenCalled();
    });
  });

  describe('When the command fails unexpectedly', () => {
    it('should render the failure', async () => {
      // Arrange
      const entryPointRun = createEntryPointRun(ENTRY_POINT_META, failUnexpectedly);

      // Act
      await runWhenEntryPoint(createPlatform(), entryPointRun);

      // Assert
      expect(entryPointRun.renderUnexpectedError).toHaveBeenCalledWith(COMMAND_FAILURE);
    });

    it('should exit with the unexpected error exit code', async () => {
      // Arrange
      const platform = createPlatform();
      const entryPointRun = createEntryPointRun(ENTRY_POINT_META, failUnexpectedly);

      // Act
      await runWhenEntryPoint(platform, entryPointRun);

      // Assert
      expect(platform.exitProcess).toHaveBeenCalledWith(UNEXPECTED_ERROR_EXIT_CODE);
    });
  });
});
