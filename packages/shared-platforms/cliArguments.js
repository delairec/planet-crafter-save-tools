const DASH = '-';
const FLAG_PREFIX = '--';
const FLAG_VALUE_SEPARATOR = '=';

export const PLATFORM_FLAG_NAME = 'platform';

/**
 * @param {string} flagName
 * @returns {string} the `--<flagName>=` an argument carrying that flag starts with
 */
function toFlag(flagName) {
  return `${FLAG_PREFIX}${flagName}${FLAG_VALUE_SEPARATOR}`;
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
 * Only dash-prefixed arguments are candidates: the argument vector of a command also carries the
 * interpreter and the script it runs, which are paths.
 * @param {string[]} argv
 * @param {readonly string[]} knownFlagNames the flag names the command acts on, without their dashes
 * @returns {string[]} the dash-prefixed arguments naming none of those flags
 */
export function findUnknownArguments(argv, knownFlagNames) {
  const knownFlags = knownFlagNames.map(toFlag);

  return argv.filter(argument => argument.startsWith(DASH) && !knownFlags.some(flag => argument.startsWith(flag)));
}
