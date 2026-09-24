import {findUnknownArguments, hasSwitch, PLATFORM_FLAG_NAME, readFlagValue} from 'shared-platforms/cliArguments.js';

const DEFAULT_INPUT_DIR = 'input';
const DEFAULT_OUTPUT_DIR = 'output';
const INPUT_FLAG_NAME = 'input';
const OUTPUT_FLAG_NAME = 'output';
const KNOWN_FLAG_NAMES = [INPUT_FLAG_NAME, OUTPUT_FLAG_NAME, PLATFORM_FLAG_NAME];
const VERSION_SWITCH_NAME = 'version';
const KNOWN_SWITCH_NAMES = [VERSION_SWITCH_NAME];

/**
 * @param {string[]} argv
 * @returns {{inputDir: string, outputDir: string, unknownArguments: string[], isVersionAsked: boolean}}
 */
export function parseMergeCliArguments(argv) {
  const inputDir = readFlagValue(argv, INPUT_FLAG_NAME);
  const outputDir = readFlagValue(argv, OUTPUT_FLAG_NAME);

  return {
    inputDir: inputDir === undefined ? DEFAULT_INPUT_DIR : inputDir,
    outputDir: outputDir === undefined ? DEFAULT_OUTPUT_DIR : outputDir,
    isVersionAsked: hasSwitch(argv, VERSION_SWITCH_NAME),
    unknownArguments: findUnknownArguments(argv, {flagNames: KNOWN_FLAG_NAMES, switchNames: KNOWN_SWITCH_NAMES})
  };
}
