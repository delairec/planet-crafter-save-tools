/**
 * @param {number} hostCount
 * @returns {string}
 */
export function formatUniqueHostMessage(hostCount) {
  return `Expected exactly one host player, found ${hostCount}`;
}
