const ID_LIST_SEPARATOR = ',';

/**
 * @param {string} idList
 * @returns {number[]}
 */
export function parseIdList(idList) {
  return idList
    .split(ID_LIST_SEPARATOR)
    .filter(Boolean)
    .map(Number);
}

/**
 * @param {readonly number[]} ids
 * @returns {string}
 */
export function serializeIdList(ids) {
  return ids.join(ID_LIST_SEPARATOR);
}
