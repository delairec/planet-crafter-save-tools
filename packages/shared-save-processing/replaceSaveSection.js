const SAVE_SECTION_SEPARATOR = '@';

/**
 * Replaces one section of a raw save string, addressed by its index, without exposing the `@`
 * separator to the caller.
 * @param {string} saveString
 * @param {number} sectionIndex
 * @param {(currentSection: string) => string} updateSection
 * @returns {string}
 */
export function replaceSaveSection(saveString, sectionIndex, updateSection) {
  const sections = saveString.split(SAVE_SECTION_SEPARATOR);
  sections[sectionIndex] = updateSection(sections[sectionIndex]);
  return sections.join(SAVE_SECTION_SEPARATOR);
}
