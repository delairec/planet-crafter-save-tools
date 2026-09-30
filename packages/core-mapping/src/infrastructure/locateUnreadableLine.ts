import type {UnreadableSaveLine} from "shared-save-processing/gameDefinitions";
import type {UnreadableLine} from "../domain/save/SaveSectionLocation";
import {locateSaveSection} from "./locateSaveSection";

export function locateUnreadableLine({sectionIndex, entryIndex, line}: UnreadableSaveLine, formatRelease: string): UnreadableLine {
  return {code: 'invalid-json', section: locateSaveSection(sectionIndex, formatRelease), entryIndex, line};
}
