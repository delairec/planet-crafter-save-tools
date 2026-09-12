import {SaveParseError} from "shared-save-processing/gameDefinitions";
import {SaveSections} from "../../domain/save/SaveSections";

/**
 * Parsing reports the errors it hits while reading the sections. Format adaptations are not
 * reported here: validation runs before parsing in every flow and is the single source of warnings
 * (see `SaveValidationResult`).
 */
export interface ParsedSaveSections {
  readonly sections: SaveSections;
  readonly errors: SaveParseError[];
}

export interface SaveSectionsParserPort {
  parse(content: string): ParsedSaveSections;
}
