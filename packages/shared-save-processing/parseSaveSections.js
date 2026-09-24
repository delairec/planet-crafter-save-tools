/// <reference path="./jsonSourceTextAccess.d.ts" />
/** @import { ParsedSave, SaveParseError, SaveWarning } from './gameDefinitions' */

import {verifySectionCount} from './verifySectionCount.js';
import {
  LEGACY_SPLIT_PARTS_COUNT,
  PLAYERS_SECTION_INDEX,
  SAVE_CONFIGURATION_SECTION_INDEX,
  WORLD_OBJECTS_SECTION_INDEX
} from './sectionIndexes.js';
import {findCarriedRelease, verifyDeclaredGameRelease} from './gameReleases.js';
import {SAVE_WARNING_CODES} from './saveWarningCodes.js';
import {keepInt64IdentifierText} from './int64Identifiers.js';

/** Head of the offending line, enough to recognise it without printing a whole entry. */
const REPORTED_LINE_LENGTH = 60;

/**
 * Parses a Planet Crafter save string into every part the file carries: the eleven parts of the
 * format of 2.004 and later, or the twelve of the format of 1.618 and earlier, whose Terrain Layers
 * section sits at index 9 and shifts World Events to index 10. The last part is the reserved empty
 * one produced by the terminating `@`. Section 3 (WorldObjects) is a Generator factory; all others
 * are arrays, Terrain Layers included.
 * A save is read by the format it carries, and `formatRelease` names the release whose format that
 * is. A save of 1.618 raises the legacy-save-format warning; the game release its version declares
 * is checked against the format it carries, and a contradiction produces a warning, never an error.
 *
 * A line that cannot be read is reported in `errors` with its location, and never takes the
 * section holding it down with it. This module is the only place in the production code where a
 * save line reaches `JSON.parse`: a second reader tolerating the same format differently is what
 * kept a lost section invisible until now.
 * @param {string} save
 * @returns {ParsedSave}
 */
export function parseSaveSections(save) {
  const rawSections = save.split('@');

  const formatRelease = findCarriedRelease(rawSections.length);
  const errors = verifySectionCount(rawSections);
  const sections = rawSections.map((section, sectionIndex) => {
    const sectionReading = {section, sectionIndex, formatRelease, errors};

    if (isWorldObjectsSection(sectionIndex)) {
      return () => createSectionEntriesGenerator(sectionReading);
    }

    return [...createSectionEntriesGenerator(sectionReading)];
  });
  const declaredVersion = readDeclaredVersion(sections[SAVE_CONFIGURATION_SECTION_INDEX]);

  return /** @type {ParsedSave} */ ({
    formatRelease,
    errors,
    warnings: [...verifyLegacyFormat(rawSections.length), ...verifyDeclaredGameRelease(declaredVersion, rawSections.length)],
    sections
  });
}

/**
 * @param {number} splitPartsCount
 * @returns {SaveWarning[]}
 */
function verifyLegacyFormat(splitPartsCount) {
  return splitPartsCount === LEGACY_SPLIT_PARTS_COUNT ? [{code: SAVE_WARNING_CODES.LEGACY_SAVE_FORMAT}] : [];
}

/**
 * @param {unknown} saveConfigurationSection
 * @returns {unknown}
 */
function readDeclaredVersion(saveConfigurationSection) {
  if (!Array.isArray(saveConfigurationSection)) {
    return undefined;
  }

  const [saveConfiguration] = saveConfigurationSection;

  if (typeof saveConfiguration !== 'object' || saveConfiguration === null) {
    return undefined;
  }

  return /** @type {{version?: unknown}} */ (saveConfiguration).version;
}

function isWorldObjectsSection(sectionIndex) {
  return sectionIndex === WORLD_OBJECTS_SECTION_INDEX;
}

/**
 * The players section is the only one read through the source text access of `JSON.parse`: it is
 * the only one carrying an int64 identifier, and a reviver is called for every key/value pair of
 * the line — the world objects section alone holds more than a hundred thousand of them.
 * @param {string} line
 * @param {number} sectionIndex
 * @returns {unknown}
 */
function parseEntry(line, sectionIndex) {
  if (sectionIndex === PLAYERS_SECTION_INDEX) {
    return JSON.parse(line, keepInt64IdentifierText);
  }

  return JSON.parse(line);
}

/**
 * Lines of a section, in the order the file holds them. Trimming the section is what makes a real
 * save readable: the part the terminating `@` reserves holds nothing, and the game writes a line
 * break before the first entry of a section.
 * @param {string} section
 * @returns {string[]}
 */
function splitSectionLines(section) {
  const trimmedSection = section.trim();

  return trimmedSection ? trimmedSection.split('|\n') : [];
}

/**
 * @typedef {object} SectionReading
 * @property {string} section
 * @property {number} sectionIndex
 * @property {string | undefined} formatRelease
 * @property {SaveParseError[]} errors - shared with the `ParsedSave` returned by `parseSaveSections`;
 * an unreadable line of the world objects section is only discovered once this generator is
 * iterated, so errors are pushed here rather than returned.
 */

/**
 * @param {SectionReading} sectionReading
 * @returns {Generator<unknown>}
 */
function* createSectionEntriesGenerator({section, sectionIndex, formatRelease, errors}) {
  for (const [entryIndex, line] of splitSectionLines(section).entries()) {
    let entry;

    try {
      entry = parseEntry(line, sectionIndex);
    } catch {
      errors.push({
        detail: `Invalid JSON: ${line.slice(0, REPORTED_LINE_LENGTH)}`,
        section: sectionIndex,
        formatRelease,
        entryIndex
      });
      continue;
    }

    if (entry !== null && entry !== undefined) {
      yield entry;
    }
  }
}
