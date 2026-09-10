/** @import { SaveValidationMessageViewModel } from 'core-mapping/presentation/viewModels/SaveFileValidationViewModel' */

/**
 * Rendering for the validate CLI. The verdict of a valid save goes to stdout, every diagnostic to stderr.
 */

const USAGE_MESSAGE = 'Usage: bun validate-cli.js --file=<path-to-save-file>';

export function renderUsage() {
  console.error(USAGE_MESSAGE);
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
  console.error(`✖ ${filePath} has ${errors.length} error(s):\n`);
  for (const error of errors) {
    console.error(`  ${formatMessageLine(error)}`);
  }
}

/** @param {SaveValidationMessageViewModel} validationMessage */
function formatMessageLine({message, location}) {
  if (location === null) {
    return message;
  }
  return `[${location}] ${message}`;
}
