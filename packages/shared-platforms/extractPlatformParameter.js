export const SUPPORTED_PLATFORMS = /** @type {readonly ['bun', 'node']} */ (['bun', 'node']);

/** @typedef {typeof SUPPORTED_PLATFORMS[number]} SupportedPlatform */

/**
 * @param {string} candidate
 * @returns {candidate is SupportedPlatform}
 */
function isSupportedPlatform(candidate) {
  return SUPPORTED_PLATFORMS.some(supportedPlatform => supportedPlatform === candidate);
}

/**
 * @param {string[]} argv
 * @returns {SupportedPlatform} the platform named by `--platform=`, or the default one when absent
 * @throws {Error} when `--platform=` names an unsupported platform
 */
export function extractPlatformParameter(argv) {
  const platformArg = argv.find(arg => arg.startsWith('--platform='));

  if (!platformArg) {
    return SUPPORTED_PLATFORMS[0];
  }

  const platform = platformArg.split('=')[1];

  if (isSupportedPlatform(platform)) {
    return platform;
  }

  throw new Error(`Invalid platform: ${platform}. Supported platforms: ${SUPPORTED_PLATFORMS.join(', ')}.`);
}
