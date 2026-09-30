import type {SaveSectionName} from "shared-save-processing/gameDefinitions";
import {findSplitPartsCount} from "shared-save-processing/gameReleases.js";
import {resolveSectionIndexes} from "shared-save-processing/sectionIndexes.js";
import {type LocatedSaveSectionName, RESERVED_SAVE_PART, type SaveSectionLocation} from "../domain/save/SaveSectionLocation";
import {SectionOutsideTheSaveFormatError} from "./errors/SectionOutsideTheSaveFormatError";

export function locateSaveSection(sectionIndex: number, formatRelease: string): SaveSectionLocation {
  return {name: nameSaveSection(sectionIndex, formatRelease), index: sectionIndex};
}

function nameSaveSection(sectionIndex: number, formatRelease: string): LocatedSaveSectionName {
  const sectionIndexes = resolveSectionIndexes(formatRelease);
  const sectionName = (Object.keys(sectionIndexes) as SaveSectionName[]).find(name => sectionIndexes[name] === sectionIndex);

  if (sectionName !== undefined) {
    return sectionName;
  }

  if (sectionIndex === findReservedSectionIndex(formatRelease)) {
    return RESERVED_SAVE_PART;
  }

  throw new SectionOutsideTheSaveFormatError(sectionIndex, formatRelease);
}

function findReservedSectionIndex(formatRelease: string): number | undefined {
  const splitPartsCount = findSplitPartsCount(formatRelease);

  return splitPartsCount === undefined ? undefined : splitPartsCount - 1;
}
