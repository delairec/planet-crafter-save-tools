import type {UnreadableSaveLine} from "shared-save-processing/gameDefinitions";
import type {UnreadableLine} from "../application/ports/SaveSectionLocation";
import {locateSaveSection} from "./locateSaveSection";

export function locateUnreadableLine({sectionIndex, entryIndex, line}: UnreadableSaveLine, formatRelease: string): UnreadableLine {
  return {section: locateSaveSection(sectionIndex, formatRelease), entryIndex, line};
}
