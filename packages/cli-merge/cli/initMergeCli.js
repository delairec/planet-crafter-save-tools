/** @import { MergeResultViewModel } from 'core-mapping/presentation/viewModels/MergeResultViewModel' */

import {MergeSaveFilesController} from 'core-mapping/controllers/MergeSaveFilesController';
import {hasJsonExtension} from 'shared-save-processing/jsonExtension.js';
import {parseMergeCliArguments} from './parseMergeCliArguments.js';
import {
  renderDone,
  renderFoldersFound,
  renderHelp,
  renderMergeCouldNotProduceASave,
  renderMergedSaveIssues,
  renderMergeFailed,
  renderMergeReport,
  renderMergeSucceeded,
  renderMergeWarnings,
  renderNoValidFolders,
  renderOutputWriteFailed,
  renderProcessingFolder,
  renderReportSeparator,
  renderSkippedFolder,
  renderUnknownArguments,
  renderVersion
} from './renderMergeCliOutput.js';

const MERGEABLE_SAVE_FILES_COUNT = 2;
const NO_VALID_FOLDERS_EXIT_CODE = 2;
const USAGE_ERROR_EXIT_CODE = 1;
const SUCCESS_EXIT_CODE = 0;

export const UNEXPECTED_ERROR_EXIT_CODE = 1;

/** @param {string[]} saveFileNames */
function isMergeable(saveFileNames) {
  return saveFileNames.length === MERGEABLE_SAVE_FILES_COUNT;
}

/** @param {MergeResultViewModel} viewModel */
function hasReport({saveAWarnings, saveBWarnings, mergeErrors, mergeWarnings}) {
  return [saveAWarnings, saveBWarnings, mergeErrors, mergeWarnings].some(messages => messages.length > 0);
}

export function initMergeCli({readTextFile, exitProcess, readDirectory, writeTextFile, joinPath}, argv = [], release) {
  const {inputDir, outputDir, preferLegacyFormat, isVersionAsked, isHelpAsked, unknownArguments} = parseMergeCliArguments(argv);

  /**
   * @param {string[]} folders
   * @returns {Promise<{folder: string, saveFileNames: string[]}[]>}
   */
  async function readSaveFolders(folders) {
    const saveFolders = [];
    for (const folder of folders) {
      const saveFileNames = (await readDirectory(joinPath(inputDir, folder))).filter(hasJsonExtension).sort();
      saveFolders.push({folder, saveFileNames});
    }
    return saveFolders;
  }

  /** @returns {Promise<boolean>} */
  async function processFolder({folder, saveFileNames}) {
    renderProcessingFolder(folder);

    if (!isMergeable(saveFileNames)) {
      renderSkippedFolder(folder, saveFileNames.length);
      return true;
    }

    const [fileNameA, fileNameB] = saveFileNames;
    const folderPath = joinPath(inputDir, folder);

    const viewModel = await MergeSaveFilesController.mergeSaveFiles({
      fileNameA,
      contentA: await readTextFile(joinPath(folderPath, fileNameA)),
      fileNameB,
      contentB: await readTextFile(joinPath(folderPath, fileNameB)),
      saveDisplayName: folder,
      preferLegacyFormat
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

    const outputPath = joinPath(outputDir, folder, viewModel.fileName);
    const mergedSaveWasWritten = await writeOutput(folder, outputPath, viewModel.content);

    if (mergedSaveWasWritten) {
      renderMergedSaveIssues(folder, viewModel.mergeErrors);
      renderMergeReport(folder, viewModel.mergeWarnings, viewModel.legacyFormatCouldBeKept);
      if (hasReport(viewModel)) {
        renderReportSeparator();
      }
      renderMergeSucceeded(outputPath);
    }

    return mergedSaveWasWritten;
  }

  /** @returns {Promise<boolean>} */
  async function writeOutput(folder, outputPath, content) {
    try {
      await writeTextFile(outputPath, content);
    } catch (error) {
      renderOutputWriteFailed(folder, outputPath, error);
      return false;
    }

    return true;
  }

  async function main() {
    if (isHelpAsked) {
      renderHelp();
      exitProcess(SUCCESS_EXIT_CODE);
      return;
    }

    if (unknownArguments.length > 0) {
      renderUnknownArguments(unknownArguments);
      exitProcess(USAGE_ERROR_EXIT_CODE);
      return;
    }

    if (isVersionAsked) {
      renderVersion(release);
      exitProcess(SUCCESS_EXIT_CODE);
      return;
    }

    const inputFolders = (await readDirectory(inputDir)).sort();
    const saveFolders = await readSaveFolders(inputFolders);
    const mergeableFoldersCount = saveFolders.filter(({saveFileNames}) => isMergeable(saveFileNames)).length;

    if (mergeableFoldersCount > 0) {
      renderFoldersFound(mergeableFoldersCount);
    }
    for (const saveFolder of saveFolders) {
      const runCanGoOn = await processFolder(saveFolder);
      if (!runCanGoOn) {
        exitProcess(UNEXPECTED_ERROR_EXIT_CODE);
        return;
      }
    }

    if (mergeableFoldersCount === 0) {
      renderNoValidFolders(inputDir);
      exitProcess(NO_VALID_FOLDERS_EXIT_CODE);
      return;
    }

    renderDone();
    exitProcess(SUCCESS_EXIT_CODE);
  }

  return {main};
}
