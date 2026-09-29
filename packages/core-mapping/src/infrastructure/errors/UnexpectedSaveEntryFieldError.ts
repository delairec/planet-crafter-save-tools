import {SaveSectionName} from "shared-save-processing/gameDefinitions";

/**
 * A save entry reached decoding with a field its section schema refuses, or the domain handed back a field the save format
 * cannot write: validation or the domain let through what it should have refused. Fix what let the data through; never
 * soften the guard.
 */
export class UnexpectedSaveEntryFieldError extends Error {
  constructor(section: SaveSectionName, field: string) {
    super(`Unexpected save data: the ${section} section carries no field ${field}.`);
    this.name = 'UnexpectedSaveEntryFieldError';
  }
}
