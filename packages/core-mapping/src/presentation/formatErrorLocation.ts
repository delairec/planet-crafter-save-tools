import {RESERVED_SAVE_PART, SaveSectionLocation} from "../application/ports/SaveSectionLocation";
import {saveSectionLabels} from "./messages/saveSectionLabels.js";

interface ErrorLocation {
  readonly section: SaveSectionLocation;
  readonly entryIndex?: number;
}

export function formatErrorLocation({section, entryIndex}: ErrorLocation): string {
  const sectionLocation = formatSectionLocation(section);

  if (entryIndex === undefined) {
    return sectionLocation;
  }

  return `${sectionLocation}, entry ${entryIndex}`;
}

function formatSectionLocation({name, index}: SaveSectionLocation): string {
  if (name === RESERVED_SAVE_PART) {
    return `section ${index}`;
  }

  return `${saveSectionLabels[name]} (section ${index})`;
}
