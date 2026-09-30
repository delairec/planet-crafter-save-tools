import {SaveSectionName} from "shared-save-processing/gameDefinitions";

export class UnreadableSaveEntryValueError extends Error {
  constructor(section: SaveSectionName, field: string, value: unknown) {
    super(`Unexpected save data: field ${field} of the ${section} section cannot be read from ${String(value)}.`);
    this.name = 'UnreadableSaveEntryValueError';
  }
}
