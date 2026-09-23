import {findUnknownArguments, hasSwitch, PLATFORM_FLAG_NAME, readFlagValue} from 'shared-platforms/cliArguments.js';

const FILE_FLAG_NAME = 'file';
const KNOWN_FLAG_NAMES = [FILE_FLAG_NAME, PLATFORM_FLAG_NAME];
const VERSION_SWITCH_NAME = 'version';
const KNOWN_SWITCH_NAMES = [VERSION_SWITCH_NAME];

/**
 * @param {string[]} argv
 * @returns {{filePath: string | undefined, unknownArguments: string[], isVersionAsked: boolean}}
 */
export function parseValidateCliArguments(argv) {
  return {
    filePath: readFlagValue(argv, FILE_FLAG_NAME),
    isVersionAsked: hasSwitch(argv, VERSION_SWITCH_NAME),
    unknownArguments: findUnknownArguments(argv, {flagNames: KNOWN_FLAG_NAMES, switchNames: KNOWN_SWITCH_NAMES})
  };
}
