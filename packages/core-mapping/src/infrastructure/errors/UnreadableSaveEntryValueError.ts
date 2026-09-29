import {SaveSectionName} from "shared-save-processing/gameDefinitions";

/**
 * A save entry reached decoding with a value its section schema refuses: validation let through what it should have
 * refused. Fix what let the data through; never soften the guard.
 */
export class UnreadableSaveEntryValueError extends Error {
  constructor(section: SaveSectionName, field: string, value: unknown) {
    super(`Unexpected save data: field ${field} of the ${section} section cannot be read from ${String(value)}.`);
    this.name = 'UnreadableSaveEntryValueError';
  }
}
