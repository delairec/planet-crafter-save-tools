import {getCliArguments} from 'shared-platforms/platform.common.js';
import {extractPlatformParameter} from 'shared-platforms/extractPlatformParameter.js';
import {createPlatform} from 'shared-platforms/platform.js';
import {MergeSaveFilesController} from 'core-mapping/controllers/MergeSaveFilesController';
import {parseMergeCliArguments} from './parseMergeCliArguments.js';
import {
  renderDone,
  renderFoldersFound,
  renderMergeCouldNotProduceASave,
  renderMergedSaveIssues,
  renderMergeFailed,
  renderMergeSucceeded,
  renderMergeWarnings,
  renderNoValidFolders,
  renderOutputWriteFailed,
  renderProcessingFolder,
  renderSkippedFolder,
  renderUnexpectedError
} from './renderMergeCliOutput.js';

const MERGEABLE_SAVE_FILES_COUNT = 2;
const NO_VALID_FOLDERS_EXIT_CODE = 2;
const UNEXPECTED_ERROR_EXIT_CODE = 1;

const argv = getCliArguments();
const {isEntryPoint, readTextFile, exitProcess, readDirectory, writeTextFile, joinPath} = createPlatform(extractPlatformParameter(argv));

const CLI = initMergeCli({isEntryPoint, readTextFile, exitProcess, readDirectory, writeTextFile, joinPath}, argv);

if (CLI.isEntryPoint(import.meta)) {
  CLI.main().catch(error => {
    renderUnexpectedError(error);
    CLI.exitProcess(UNEXPECTED_ERROR_EXIT_CODE);
  });
}

export function initMergeCli({isEntryPoint, readTextFile, exitProcess, readDirectory, writeTextFile, joinPath}, argv = []) {
  const {inputDir, outputDir} = parseMergeCliArguments(argv);

  async function filterByValidSaveFolders(folders) {
    const results = [];
    for (const folder of folders) {
      const files = await readDirectory(joinPath(inputDir, folder));
      const jsonFileCount = files.filter(isJson).length;

      if (jsonFileCount === MERGEABLE_SAVE_FILES_COUNT) {
        results.push(folder);
      } else {
        renderSkippedFolder(folder, jsonFileCount);
      }
    }
    return results;
  }

  /** @returns {Promise<boolean>} whether the run may go on. */
  async function processFolder(folder) {
    renderProcessingFolder(folder);
    const folderPath = joinPath(inputDir, folder);
    const [fileNameA, fileNameB] = (await readDirectory(folderPath)).filter(isJson).sort();

    const viewModel = await MergeSaveFilesController.mergeSaveFiles({
      fileNameA,
      contentA: await readTextFile(joinPath(folderPath, fileNameA)),
      fileNameB,
      contentB: await readTextFile(joinPath(folderPath, fileNameB)),
      saveDisplayName: folder
    });

    renderMergeWarnings(folder, viewModel.saveAWarnings, viewModel.saveBWarnings);

    if (viewModel.status === 'validationError') {
      renderMergeFailed(folder, viewModel.saveAErrors, viewModel.saveBErrors);
      return true;
    }

    if (viewModel.status === 'mergeFailed') {
      renderMergeCouldNotProduceASave(folder, viewModel.mergeFailureMessage);
      return false;
    }

    const mergedSaveWasWritten = await writeOutput(folder, viewModel.fileName, viewModel.content);

    if (mergedSaveWasWritten) {
      renderMergedSaveIssues(folder, viewModel.mergeErrors);
    }

    return mergedSaveWasWritten;
  }

  /** @returns {Promise<boolean>} whether the merged save reached the output directory. */
  async function writeOutput(folder, outputFileName, content) {
    const outputPath = joinPath(outputDir, folder, outputFileName);

    try {
      await writeTextFile(outputPath, content);
    } catch (error) {
      renderOutputWriteFailed(folder, outputPath, error);
      return false;
    }

    renderMergeSucceeded(outputPath);
    return true;
  }

  function isJson(file) {
    return file.endsWith('.json');
  }

  async function main() {
    const inputFolders = await readDirectory(inputDir);
    const validSaveFolders = await filterByValidSaveFolders(inputFolders);

    if (validSaveFolders.length === 0) {
      renderNoValidFolders(inputDir);
      exitProcess(NO_VALID_FOLDERS_EXIT_CODE);
      return;
    }

    renderFoldersFound(validSaveFolders.length);
    for (const folder of validSaveFolders) {
      const runCanGoOn = await processFolder(folder);
      if (!runCanGoOn) {
        exitProcess(UNEXPECTED_ERROR_EXIT_CODE);
        return;
      }
    }
    renderDone();
    exitProcess(0);
  }

  return {isEntryPoint, main, exitProcess};
}
