import {findUnknownArguments, HELP_SWITCH, hasSwitch, PLATFORM_FLAG, readFlagValue, VERSION_SWITCH} from 'shared-platforms/cliArguments.js';

const FILE_FLAG_NAME = 'file';

/** @type {import('shared-platforms/cliArguments.js').CommandArguments} */
export const VALIDATE_CLI_ARGUMENTS = {
  invocation: 'bun validate -- --file=<path> [options]',
  flags: [
    {name: FILE_FLAG_NAME, valueName: 'path', description: 'the save file to validate'},
    PLATFORM_FLAG
  ],
  switches: [VERSION_SWITCH, HELP_SWITCH]
};

/**
 * @param {string[]} argv
 * @returns {{filePath: string | undefined, unknownArguments: string[], isVersionAsked: boolean, isHelpAsked: boolean}}
 */
export function parseValidateCliArguments(argv) {
  return {
    filePath: readFlagValue(argv, FILE_FLAG_NAME),
    isVersionAsked: hasSwitch(argv, VERSION_SWITCH.name),
    isHelpAsked: hasSwitch(argv, HELP_SWITCH.name),
    unknownArguments: findUnknownArguments(argv, {
      flagNames: VALIDATE_CLI_ARGUMENTS.flags.map(flag => flag.name),
      switchNames: VALIDATE_CLI_ARGUMENTS.switches.map(cliSwitch => cliSwitch.name)
    })
  };
}
