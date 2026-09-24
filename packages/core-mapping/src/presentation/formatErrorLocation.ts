import {SaveSectionName} from "shared-save-processing/gameDefinitions";
import {resolveSectionIndexes} from "shared-save-processing/sectionIndexes.js";
import {saveSectionLabels} from "./messages/saveSectionLabels.js";

interface ErrorLocation {
  section?: number;
  entryIndex?: number;
  formatRelease?: string;
}

export function formatErrorLocation({section, entryIndex, formatRelease}: ErrorLocation): string | null {
  if (section === undefined) {
    return null;
  }

  const sectionName = findSectionName(section, formatRelease);
  const sectionLocation = sectionName ? `${saveSectionLabels[sectionName]} (section ${section})` : `section ${section}`;

  if (entryIndex === undefined) {
    return sectionLocation;
  }

  return `${sectionLocation}, entry ${entryIndex}`;
}

function findSectionName(section: number, formatRelease: string | undefined): SaveSectionName | undefined {
  if (formatRelease === undefined) {
    return undefined;
  }

  const sectionIndexes = resolveSectionIndexes(formatRelease);

  return (Object.keys(sectionIndexes) as SaveSectionName[]).find(sectionName => sectionIndexes[sectionName] === section);
}
