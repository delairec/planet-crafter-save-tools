/** @import { SaveValidationMessageViewModel } from 'core-mapping/presentation/viewModels/SaveFileValidationViewModel' */

import {formatHelp} from 'shared-platforms/cliArguments.js';
import {MERGE_CLI_ARGUMENTS} from './parseMergeCliArguments.js';

const KEEP_LEGACY_FORMAT_REMINDER = 'Run the merge again with --prefer-legacy to write the legacy format instead.';

export function renderHelp() {
  console.log(formatHelp(MERGE_CLI_ARGUMENTS));
}

/** @param {{name: string, version: string}} release */
export function renderVersion({name, version}) {
  console.log(`${name} ${version}`);
}

/** @param {string[]} unknownArguments */
export function renderUnknownArguments(unknownArguments) {
  console.error(`✖ Unknown argument(s): ${unknownArguments.join(', ')}`);
  console.error(formatHelp(MERGE_CLI_ARGUMENTS));
}

/** @param {number} count */
export function renderFoldersFound(count) {
  console.error(`Found ${count} folder(s) to process.`);
}

/** @param {string} folder */
export function renderProcessingFolder(folder) {
  console.error('');
  console.error(`Processing "${folder}"...`);
}

export function renderReportSeparator() {
  console.error('');
}

/** @param {string} outputPath */
export function renderMergeSucceeded(outputPath) {
  console.log(`✓ ${outputPath}`);
}

/**
 * @param {string} folder
 * @param {SaveValidationMessageViewModel[]} saveAErrors
 * @param {SaveValidationMessageViewModel[]} saveBErrors
 */
export function renderMergeFailed(folder, saveAErrors, saveBErrors) {
  console.error(`✖ Folder "${folder}" contains an invalid save file:`);
  for (const error of saveAErrors) {
    console.error(`  [save A] ${formatMessageLine(error)}`);
  }
  for (const error of saveBErrors) {
    console.error(`  [save B] ${formatMessageLine(error)}`);
  }
}

/** @param {SaveValidationMessageViewModel} validationMessage */
function formatMessageLine({message, location}) {
  if (location === null) {
    return message;
  }
  return `[${location}] ${message}`;
}

/**
 * @param {string} folder
 * @param {SaveValidationMessageViewModel[]} saveAWarnings
 * @param {SaveValidationMessageViewModel[]} saveBWarnings
 */
export function renderMergeWarnings(folder, saveAWarnings, saveBWarnings) {
  if (saveAWarnings.length === 0 && saveBWarnings.length === 0) {
    return;
  }

  console.error(`⚠ Folder "${folder}" has warnings on its save files:`);
  for (const warning of saveAWarnings) {
    console.error(`  [save A] ${formatMessageLine(warning)}`);
  }
  for (const warning of saveBWarnings) {
    console.error(`  [save B] ${formatMessageLine(warning)}`);
  }
}

/**
 * @param {string} folder
 * @param {SaveValidationMessageViewModel[]} mergeErrors
 */
export function renderMergedSaveIssues(folder, mergeErrors) {
  if (mergeErrors.length === 0) {
    return;
  }

  console.error(`✖ Folder "${folder}" was merged, but the save file written does not pass validation:`);
  for (const error of mergeErrors) {
    console.error(`  ${formatMessageLine(error)}`);
  }
}

/**
 * @param {string} folder
 * @param {SaveValidationMessageViewModel[]} mergeWarnings
 * @param {boolean} legacyFormatCouldBeKept
 */
export function renderMergeReport(folder, mergeWarnings, legacyFormatCouldBeKept) {
  if (mergeWarnings.length === 0) {
    return;
  }

  console.error(`⚠ Folder "${folder}" was merged with warnings:`);
  for (const warning of mergeWarnings) {
    console.error(`  ${formatMessageLine(warning)}`);
  }
  if (legacyFormatCouldBeKept) {
    console.error(`  ${KEEP_LEGACY_FORMAT_REMINDER}`);
  }
}

/**
 * @param {string} folder
 * @param {number} jsonFileCount
 */
export function renderSkippedFolder(folder, jsonFileCount) {
  console.error(`⚠ Folder "${folder}" was skipped: it holds ${jsonFileCount} JSON save file(s), exactly two are required.`);
}

/** @param {string} inputDir */
export function renderNoValidFolders(inputDir) {
  console.error(`No folder in "${inputDir}" contains exactly two JSON save files to merge.`);
}

export function renderDone() {
  console.error('Done.');
}

/** @param {unknown} error */
export function renderUnexpectedError(error) {
  console.error(`Error: ${describeError(error)}`);
}

/**
 * @param {string} folder
 * @param {string} mergeFailureMessage
 */
export function renderMergeCouldNotProduceASave(folder, mergeFailureMessage) {
  console.error(`✖ Folder "${folder}" was not merged: ${mergeFailureMessage}`);
}

/**
 * @param {string} folder
 * @param {string} outputPath
 * @param {unknown} error
 */
export function renderOutputWriteFailed(folder, outputPath, error) {
  console.error(`✖ Folder "${folder}" was merged but could not be written to "${outputPath}": ${describeError(error)}`);
}

/** @param {unknown} error */
function describeError(error) {
  return error instanceof Error ? error.message : String(error);
}
