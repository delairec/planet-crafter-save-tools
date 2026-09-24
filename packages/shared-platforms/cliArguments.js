const DASH = '-';
const FLAG_PREFIX = '--';
const FLAG_VALUE_SEPARATOR = '=';

export const PLATFORM_FLAG_NAME = 'platform';

/**
 * @param {string} flagName
 * @returns {string} the `--<flagName>=` an argument carrying that flag starts with
 */
function toFlag(flagName) {
  return `${toValuelessFlag(flagName)}${FLAG_VALUE_SEPARATOR}`;
}

/**
 * @param {string} flagName
 * @returns {string} the `--<flagName>` an argument giving that flag without a value equals
 */
function toValuelessFlag(flagName) {
  return `${FLAG_PREFIX}${flagName}`;
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
 * @param {string} flagName the name of a `--<flagName>` flag carrying no value, without its dashes
 * @returns {boolean}
 */
export function isFlagPresent(argv, flagName) {
  return argv.includes(toValuelessFlag(flagName));
}

/**
 * @typedef {object} KnownFlags
 * @property {readonly string[]} valueFlagNames the names of the `--<flagName>=<value>` flags the command acts on
 * @property {readonly string[]} valuelessFlagNames the names of the `--<flagName>` flags the command acts on
 */

/**
 * Only dash-prefixed arguments are candidates: the argument vector of a command also carries the
 * interpreter and the script it runs, which are paths.
 * @param {string[]} argv
 * @param {KnownFlags} knownFlags the flags the command acts on, named without their dashes
 * @returns {string[]} the dash-prefixed arguments naming none of those flags
 */
export function findUnknownArguments(argv, {valueFlagNames, valuelessFlagNames}) {
  const knownValueFlags = valueFlagNames.map(toFlag);
  const knownValuelessFlags = valuelessFlagNames.map(toValuelessFlag);

  return argv.filter(argument => argument.startsWith(DASH)
    && !knownValueFlags.some(flag => argument.startsWith(flag))
    && !knownValuelessFlags.includes(argument));
}
