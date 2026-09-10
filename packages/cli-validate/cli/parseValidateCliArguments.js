import {findUnknownArguments, PLATFORM_FLAG_NAME, readFlagValue} from 'shared-platforms/cliArguments.js';

const FILE_FLAG_NAME = 'file';
const KNOWN_FLAG_NAMES = [FILE_FLAG_NAME, PLATFORM_FLAG_NAME];

/**
 * @param {string[]} argv
 * @returns {{filePath: string | undefined, unknownArguments: string[]}}
 */
export function parseValidateCliArguments(argv) {
  return {
    filePath: readFlagValue(argv, FILE_FLAG_NAME),
    unknownArguments: findUnknownArguments(argv, KNOWN_FLAG_NAMES)
  };
}
