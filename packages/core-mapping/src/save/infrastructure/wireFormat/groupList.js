const GROUP_LIST_SEPARATOR = ',';

/**
 * @param {string} groupList
 * @returns {string[]}
 */
export function parseGroupList(groupList) {
  return groupList
    .split(GROUP_LIST_SEPARATOR)
    .filter(Boolean);
}

/**
 * @param {readonly string[]} groups
 * @returns {string}
 */
export function serializeGroupList(groups) {
  return groups.join(GROUP_LIST_SEPARATOR);
}
