import {findUnknownArguments, HELP_SWITCH, hasSwitch, PLATFORM_FLAG, readFlagValue, VERSION_SWITCH} from 'shared-platforms/cliArguments.js';

const DEFAULT_INPUT_DIR = 'input';
const DEFAULT_OUTPUT_DIR = 'output';
const INPUT_FLAG_NAME = 'input';
const OUTPUT_FLAG_NAME = 'output';

/** @type {import('shared-platforms/cliArguments.js').CommandArguments} */
export const MERGE_CLI_ARGUMENTS = {
  invocation: 'bun merge -- [options]',
  flags: [
    {name: INPUT_FLAG_NAME, valueName: 'directory', description: 'read the folders of saves to merge from this directory, input by default'},
    {name: OUTPUT_FLAG_NAME, valueName: 'directory', description: 'write the merged saves under this directory, output by default'},
    PLATFORM_FLAG
  ],
  switches: [VERSION_SWITCH, HELP_SWITCH]
};

/**
 * @param {string[]} argv
 * @returns {{inputDir: string, outputDir: string, unknownArguments: string[], isVersionAsked: boolean, isHelpAsked: boolean}}
 */
export function parseMergeCliArguments(argv) {
  const inputDir = readFlagValue(argv, INPUT_FLAG_NAME);
  const outputDir = readFlagValue(argv, OUTPUT_FLAG_NAME);

  return {
    inputDir: inputDir === undefined ? DEFAULT_INPUT_DIR : inputDir,
    outputDir: outputDir === undefined ? DEFAULT_OUTPUT_DIR : outputDir,
    isVersionAsked: hasSwitch(argv, VERSION_SWITCH.name),
    isHelpAsked: hasSwitch(argv, HELP_SWITCH.name),
    unknownArguments: findUnknownArguments(argv, {
      flagNames: MERGE_CLI_ARGUMENTS.flags.map(flag => flag.name),
      switchNames: MERGE_CLI_ARGUMENTS.switches.map(cliSwitch => cliSwitch.name)
    })
  };
}
