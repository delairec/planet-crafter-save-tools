const DASH = '-';
const FLAG_PREFIX = '--';
const FLAG_VALUE_SEPARATOR = '=';

export const PLATFORM_FLAG_NAME = 'platform';

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
