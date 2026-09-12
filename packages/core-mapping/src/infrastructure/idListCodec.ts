const ID_LIST_SEPARATOR = ',';

export function decodeIdList(idList: string): number[] {
  return idList
    .split(ID_LIST_SEPARATOR)
    .filter(Boolean)
    .map(Number);
}

export function encodeIdList(ids: readonly number[]): string {
  return ids.join(ID_LIST_SEPARATOR);
}
