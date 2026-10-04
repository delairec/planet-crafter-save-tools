import {RESERVED_SAVE_PART, type SaveSectionLocationResponse} from "../../application/responses/SaveSectionLocationResponse";
import {saveSectionLabels} from "../messages/saveSectionLabels.js";

interface ErrorLocation {
  readonly section: SaveSectionLocationResponse;
  readonly entryIndex?: number;
}

export function formatErrorLocation({section, entryIndex}: ErrorLocation): string {
  const sectionLocation = formatSectionLocation(section);

  if (entryIndex === undefined) {
    return sectionLocation;
  }

  return `${sectionLocation}, entry ${entryIndex}`;
}

function formatSectionLocation({name, index}: SaveSectionLocationResponse): string {
  if (name === RESERVED_SAVE_PART) {
    return `section ${index}`;
  }

  return `${saveSectionLabels[name]} (section ${index})`;
}
