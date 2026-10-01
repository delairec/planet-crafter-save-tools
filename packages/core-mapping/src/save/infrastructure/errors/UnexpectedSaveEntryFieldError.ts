import {SaveSectionName} from "shared-save-processing/gameDefinitions";

export class UnexpectedSaveEntryFieldError extends Error {
  constructor(section: SaveSectionName, field: string) {
    super(`Unexpected save data: the ${section} section carries no field ${field}.`);
    this.name = 'UnexpectedSaveEntryFieldError';
  }
}
