import {validateSaveFileController} from 'core-mapping/composition/compositionRoot';
import {parseValidateCliArguments} from './parseValidateCliArguments.js';
import {renderHelp, renderMissingFile, renderSaveErrors, renderSaveIsValid, renderSaveWarnings, renderUnknownArguments, renderVersion} from './renderValidateCliOutput.js';

const SUCCESS_EXIT_CODE = 0;
const FAILURE_EXIT_CODE = 1;

/**
 * @param {{readTextFile: (path: string) => Promise<string>, exitProcess: (code: number) => void}} platform
 * @param {string[]} argv
 * @param {{name: string, version: string}} release
 */
export function initValidateCli({readTextFile, exitProcess}, argv = [], release) {
  const {filePath, isVersionAsked, isHelpAsked, unknownArguments} = parseValidateCliArguments(argv);

  async function main() {
    if (isHelpAsked) {
      renderHelp();
      exitProcess(SUCCESS_EXIT_CODE);
      return;
    }

    if (unknownArguments.length > 0) {
      renderUnknownArguments(unknownArguments);
      exitProcess(FAILURE_EXIT_CODE);
      return;
    }

    if (isVersionAsked) {
      renderVersion(release);
      exitProcess(SUCCESS_EXIT_CODE);
      return;
    }

    if (!filePath) {
      renderMissingFile();
      exitProcess(FAILURE_EXIT_CODE);
      return;
    }

    const save = await readTextFile(filePath);
    const {status, errors, warnings} = await validateSaveFileController.validateSaveFile(filePath, save);

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
