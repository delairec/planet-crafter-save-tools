function compareByName(first: File, second: File): number {
  if (first.name === second.name) {
    return 0;
  }
  return first.name < second.name ? -1 : 1;
}

export function orderDroppedSaves(files: File[]): File[] {
  return [...files].sort(compareByName);
}
