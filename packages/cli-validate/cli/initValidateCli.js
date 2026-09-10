import {ValidateSaveFileController} from 'core-mapping/controllers/ValidateSaveFileController';
import {parseValidateCliArguments} from './parseValidateCliArguments.js';
import {renderSaveErrors, renderSaveIsValid, renderSaveWarnings, renderUsage} from './renderValidateCliOutput.js';

const SUCCESS_EXIT_CODE = 0;
const FAILURE_EXIT_CODE = 1;

/**
 * @param {{readTextFile: (path: string) => Promise<string>, exitProcess: (code: number) => void}} platform
 * @param {string[]} argv
 */
export function initValidateCli({readTextFile, exitProcess}, argv = []) {
  const {filePath} = parseValidateCliArguments(argv);

  async function main() {
    if (!filePath) {
      renderUsage();
      exitProcess(FAILURE_EXIT_CODE);
      return;
    }

    const save = await readTextFile(filePath);
    const {status, errors, warnings} = await ValidateSaveFileController.validateSaveFile(filePath, save);

    renderSaveWarnings(warnings);

    if (status === 'valid') {
      renderSaveIsValid(filePath);
      exitProcess(SUCCESS_EXIT_CODE);
      return;
    }

    renderSaveErrors(filePath, errors);
    exitProcess(FAILURE_EXIT_CODE);
  }

  return {main};
}
