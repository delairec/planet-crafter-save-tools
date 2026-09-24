const DASH = '-';
const FLAG_PREFIX = '--';
const FLAG_VALUE_SEPARATOR = '=';

export const PLATFORM_FLAG_NAME = 'platform';
export const PLATFORM_FLAG = {name: PLATFORM_FLAG_NAME, valueName: 'bun|node', description: 'reserved to the node:* scripts, which pass it themselves'};
export const VERSION_SWITCH = {name: 'version', description: 'print the version and exit'};
export const HELP_SWITCH = {name: 'help', description: 'print this help and exit'};

/**
 * @typedef {object} KnownArguments
 * @property {readonly string[]} flagNames the `--<name>=<value>` flags the command acts on, without their dashes
 * @property {readonly string[]} switchNames the `--<name>` switches the command acts on, without their dashes
 */

/**
 * @param {string} flagName
 * @returns {string} the `--<flagName>=` an argument carrying that flag starts with
 */
function toFlag(flagName) {
  return `${FLAG_PREFIX}${flagName}${FLAG_VALUE_SEPARATOR}`;
}

/**
 * @param {string} switchName
 * @returns {string} the `--<switchName>` argument naming that switch
 */
function toSwitch(switchName) {
  return `${FLAG_PREFIX}${switchName}`;
}

/**
 * @param {string[]} argv
 * @param {string} flagName the name of a `--<flagName>=<value>` flag, without its dashes
 * @returns {string | undefined} the value the flag carries, or undefined when the flag is absent
 */
export function readFlagValue(argv, flagName) {
  const flag = toFlag(flagName);
  const argument = argv.find(candidate => candidate.startsWith(flag));

  return argument === undefined ? undefined : argument.slice(flag.length);
}

/**
 * @param {string[]} argv
 * @param {string} switchName the name of a `--<switchName>` switch, without its dashes
 * @returns {boolean}
 */
export function hasSwitch(argv, switchName) {
  return argv.includes(toSwitch(switchName));
}

/**
 * @typedef {object} FlagHelp
 * @property {string} name the name of the `--<name>=<value>` flag, without its dashes
 * @property {string} valueName the placeholder the help shows for its value
 * @property {string} description
 */

/**
 * @typedef {object} SwitchHelp
 * @property {string} name the name of the `--<name>` switch, without its dashes
 * @property {string} description
 */

/**
 * @typedef {object} CommandArguments
 * @property {string} invocation
 * @property {readonly FlagHelp[]} flags
 * @property {readonly SwitchHelp[]} switches
 */

/**
 * @param {FlagHelp | SwitchHelp} argument
 * @returns {argument is FlagHelp} whether the argument is a flag, carrying a value
 */
function isFlag(argument) {
  return 'valueName' in argument;
}

/**
 * @param {FlagHelp | SwitchHelp} argument
 * @returns {string} the `--<name>` or `--<name>=<valueName>` text the help lists for that argument
 */
function formatArgument(argument) {
  return isFlag(argument) ? `--${argument.name}=<${argument.valueName}>` : `--${argument.name}`;
}

/**
 * @param {CommandArguments} commandArguments
 * @returns {string}
 */
export function formatHelp({invocation, flags, switches}) {
  const entries = [...flags, ...switches].map(argument => ({text: formatArgument(argument), description: argument.description}));
  const longestArgumentLength = Math.max(...entries.map(entry => entry.text.length));
  const optionLines = entries.map(entry => `  ${entry.text.padEnd(longestArgumentLength)}  ${entry.description}`);

  return [`Usage: ${invocation}`, '', 'Options:', ...optionLines].join('\n');
}

/**
 * Only dash-prefixed arguments are candidates: the argument vector of a command also carries the
 * interpreter and the script it runs, which are paths.
 * @param {string[]} argv
 * @param {KnownArguments} knownArguments
 * @returns {string[]} the dash-prefixed arguments naming none of those flags or switches
 */
export function findUnknownArguments(argv, {flagNames, switchNames}) {
  const knownFlags = flagNames.map(toFlag);
  const knownSwitches = switchNames.map(toSwitch);

  return argv.filter(argument => argument.startsWith(DASH)
    && !knownSwitches.includes(argument)
    && !knownFlags.some(flag => argument.startsWith(flag)));
}
