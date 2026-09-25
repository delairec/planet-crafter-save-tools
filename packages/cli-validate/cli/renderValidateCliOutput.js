/** @import { SaveValidationMessageViewModel } from 'core-mapping/presentation/viewModels/SaveFileValidationViewModel' */

import {formatHelp} from 'shared-platforms/cliArguments.js';
import {VALIDATE_CLI_ARGUMENTS} from './parseValidateCliArguments.js';

export function renderHelp() {
  console.log(formatHelp(VALIDATE_CLI_ARGUMENTS));
}

export function renderMissingFile() {
  console.error(formatHelp(VALIDATE_CLI_ARGUMENTS));
}

/** @param {{name: string, version: string}} release */
export function renderVersion({name, version}) {
  console.log(`${name} ${version}`);
}

/** @param {string[]} unknownArguments */
export function renderUnknownArguments(unknownArguments) {
  console.error(`✖ Unknown argument(s): ${unknownArguments.join(', ')}`);
  console.error(formatHelp(VALIDATE_CLI_ARGUMENTS));
}

/** @param {SaveValidationMessageViewModel[]} warnings */
export function renderSaveWarnings(warnings) {
  for (const warning of warnings) {
    console.warn(`⚠ ${formatMessageLine(warning)}`);
  }
}

/** @param {string} filePath */
export function renderSaveIsValid(filePath) {
  console.log(`✓ ${filePath} is valid`);
}

/**
 * @param {string} filePath
 * @param {SaveValidationMessageViewModel[]} errors
 */
export function renderSaveErrors(filePath, errors) {
  console.error(`✖ ${filePath} has ${errors.length} error(s):`);
  for (const error of errors) {
    console.error(`  ${formatMessageLine(error)}`);
  }
}

/** @param {unknown} error */
export function renderUnexpectedError(error) {
  console.error(`Error: ${describeError(error)}`);
}

/** @param {unknown} error */
function describeError(error) {
  return error instanceof Error ? error.message : String(error);
}

/** @param {SaveValidationMessageViewModel} validationMessage */
function formatMessageLine({message, location}) {
  if (location === null) {
    return message;
  }
  return `[${location}] ${message}`;
}
