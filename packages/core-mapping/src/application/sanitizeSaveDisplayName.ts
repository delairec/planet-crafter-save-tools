const SAVE_SECTION_SEPARATOR = '@';
const SAVE_SECTION_SEPARATOR_REPLACEMENT = '_';

export function sanitizeSaveDisplayName(saveDisplayName: string): string {
  return saveDisplayName.replaceAll(SAVE_SECTION_SEPARATOR, SAVE_SECTION_SEPARATOR_REPLACEMENT);
}
